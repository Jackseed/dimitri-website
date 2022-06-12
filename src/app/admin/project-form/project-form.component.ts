import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Image } from '../../models';
import { ref, Storage } from '@angular/fire/storage';
import {
  Firestore,
  DocumentReference,
  doc,
  getDocs,
  deleteDoc,
  writeBatch,
  increment,
} from '@angular/fire/firestore';
import { collection, WriteBatch } from 'firebase/firestore';
import { deleteObject } from 'firebase/storage';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  private projectRef: DocumentReference | undefined;
  private id: string | undefined;
  public newProject = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private db: Firestore
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.projectRef = doc(this.db, `projects/${this.id}`);
  }

  public async deleteImg(img: Image) {
    const imgStorageRef = ref(this.storage, img.url);
    const imgFirestoreRef = doc(this.db, `${this.projectRef}/images/${img.id}`);

    // Deletes on Firestore.
    const firestoreDelete = deleteDoc(imgFirestoreRef);

    // Deletes on Storage.
    const storageDelete = deleteObject(imgStorageRef);

    // Loads project images.
    const imagesRef = collection(this.db, `${this.projectRef}/images`);
    const imagesSnapshot = await getDocs(imagesRef);
    let images: Image[] = [];

    imagesSnapshot.forEach((doc) => {
      images.push(doc.data());
    });

    console.log('Project images: ', images);

    Promise.all([firestoreDelete, storageDelete])
      .then(() => {
        console.log('Fichier supprimée de storage !');
        // Repositions remaining images.
        images = this.sortByPosition(images);
        images.splice(img.position!, 1);

        const batch = this.updateImgPositions(images);
        // Updates project image count.
        batch.update(this.projectRef!, {
          imageCount: increment(-1),
        });

        batch.commit();
      })
      .catch((error) => {
        console.error('Erreur dans la suppression fichier storage: ', error);
      });
  }

  sortByPosition(images: Image[]): Image[] {
    return images.sort((a, b) => a.position! - b.position!);
  }

  // Prepares Firestore operations.
  private updateImgPositions(images: Image[]): WriteBatch {
    const batch = writeBatch(this.db);

    for (let i = 0; i < images.length; i++) {
      const imgRef = doc(this.db, `${this.projectRef}/images/${images[i].id}`);
      batch.update(imgRef, {
        position: i,
      });
    }
    return batch;
  }

  public async moveImage(img: Image, operation: 1 | -1) {
    if (!img.position) return console.log("Position de l'image non définie");
    // Loads project images.
    const imagesRef = collection(this.db, `${this.projectRef}/images`);
    const imagesSnapshot = await getDocs(imagesRef);
    let images: Image[] = [];
    imagesSnapshot.forEach((doc) => {
      images.push(doc.data());
    });

    images = this.sortByPosition(images);
    // Removes the moving image.
    images.splice(img.position, 1);
    // Insert it 1 position before.
    images.splice(img.position - operation, 0, img);
    const batch = this.updateImgPositions(images);
    batch.commit();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Attention, si le projet est associé à une vignette, le lien sera cassé. Es-tu sûre de vouloir supprimer ?',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteProject();
      }
    });
  }

  public async deleteProject() {
    // delete images first
    const images = [];
    await this.projectRef
      .collection('images')
      .get()
      .toPromise()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          images.push(doc.data());
        });
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });
    const batch = this.db.firestore.batch();
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < images.length; i++) {
      // delete img on db
      batch.delete(
        this.db.firestore
          .collection('projects')
          .doc(this.id)
          .collection('images')
          .doc(images[i].id)
      );
      // delete img on storage
      this.storage.storage.refFromURL(images[i].downloadUrl).delete();
    }
    // delete the project
    batch.delete(this.db.firestore.collection('projects').doc(this.id));

    // remove the projectId from category
    const project = await this.projectRef.get().toPromise();
    const categoryId = project.data().categoryId;
    const categoryDoc = await this.db
      .collection('categories')
      .doc(categoryId)
      .get()
      .toPromise();
    const projectIds = categoryDoc.data().projectIds;
    const projectId = projectIds.find((proj) => proj.id === this.id);

    // sort old category and remove the project
    projectIds.sort((a, b) => a.position - b.position);
    projectIds.splice(projectId.position, 1);
    batch.update(this.db.firestore.collection('categories').doc(categoryId), {
      projectIds: firestore.FieldValue.delete(),
    });

    // re-write all projectIds from old category without the changing project
    // if there is no more project, write an empty array
    // tslint:disable-next-line: prefer-for-of
    if (projectIds.length === 0) {
      batch.update(this.db.firestore.collection('categories').doc(categoryId), {
        projectIds: [],
      });
    } else {
      for (let i = 0; i < projectIds.length; i++) {
        projectIds[i].position = i;

        batch.update(
          this.db.firestore.collection('categories').doc(categoryId),
          {
            projectIds: firestore.FieldValue.arrayUnion(projectIds[i]),
          }
        );
      }
    }

    // delete the projectId on vignettes
    const vignettes = [];
    await this.db
      .collection('vignettes')
      .get()
      .toPromise()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          vignettes.push(doc.data());
        });
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });

    const vignette = vignettes.find((vign) => vign.projectId === this.id);

    if (vignette) {
      batch.update(this.db.firestore.collection('vignettes').doc(vignette.id), {
        projectId: firestore.FieldValue.delete(),
      });
    }

    batch.commit();

    this.openSnackBar('Projet supprimé !');
    this.router.navigate(['/admin']);
  }

  public publish() {
    this.projectRef.update({
      status: 'published',
    });
    this.openSnackBar('Projet publié !');
  }

  public unpublish() {
    this.projectRef.update({
      status: 'draft',
    });
    this.openSnackBar('Projet retiré du site !');
  }

  back() {
    this.location.back();
  }
}
