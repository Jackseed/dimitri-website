// Angular
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

// Models
import { Image, Project } from '../../models';

// Components
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

// Angularfire
import { ref, Storage } from '@angular/fire/storage';
import {
  Firestore,
  DocumentReference,
  doc,
  getDocs,
  deleteDoc,
  writeBatch,
  increment,
  collection,
  WriteBatch,
  updateDoc,
  docData,
  CollectionReference,
  collectionData,
  setDoc,
} from '@angular/fire/firestore';

// Firebase
import { deleteObject } from 'firebase/storage';

// Angular Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { Observable } from 'rxjs';
import { tap, first, map } from 'rxjs/operators';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  private projectRef: DocumentReference;
  private imgsRef: CollectionReference;
  public project$: Observable<Project>;
  public images$: Observable<Image[]>;
  public newProject = new FormGroup({
    title: new FormControl(''),
    descriptions: new FormArray<FormControl>([]),
  });
  private id: string;
  public isVignetteUploaded$: Observable<boolean>;
  public vignette$: Observable<Image>;
  public projectImages$: Observable<Image[]>;
  public descriptions = this.newProject.get('descriptions') as FormArray;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private storage: Storage,
    private db: Firestore,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.id = this.route.snapshot.paramMap.get('id')!;
    // Sets project observable.
    this.projectRef = doc(this.db, `projects/${this.id}`);
    this.project$ = docData(this.projectRef);
    // Sets images observable.
    this.imgsRef = collection(this.db, `projects/${this.id}/images`);
    this.projectImages$ = collectionData(this.imgsRef);
    this.images$ = this.projectImages$.pipe(
      map((images) => images.filter((image) => image.type === 'image'))
    );
    // Sets form value.
    this.project$
      .pipe(
        tap((project) => {
          if (project) this.newProject.patchValue(project);
        }),
        first()
      )
      .subscribe();

    // Loads descriptions
    this.project$
      .pipe(
        tap((project) => {
          // If there is no description yet, iniatializes it with an empty string.
          if (!project.descriptions)
            return this.descriptions.push(new FormControl(''));
          for (const description of project.descriptions!) {
            this.descriptions.push(new FormControl(description));
          }
        }),
        first()
      )
      .subscribe();
    // Sets vignette.
    this.isVignetteUploaded$ = this.projectImages$.pipe(
      map((images) => !!images.filter((img) => img.type === 'vignette')[0])
    );
    this.vignette$ = this.projectImages$.pipe(
      map((images) => images.filter((img) => img.type === 'vignette')[0])
    );
  }

  ngOnInit(): void {}

  public addDescription() {
    this.descriptions.push(new FormControl(''));
  }

  public removeDescription(index: number) {
    this.descriptions.removeAt(index);
  }

  onSubmit() {}
  save() {
    setDoc(
      this.projectRef,
      {
        id: this.id,
        title: this.newProject.value.title,
        descriptions: this.newProject.value.descriptions,
      },
      { merge: true }
    );
    this.openSnackBar('Projet sauvegardé !');
  }

  public async deleteVignette() {
    let images = await this.projectImages();
    const vignette = images.filter((image) => (image.type = 'vignette'))[0];
    console.log('vignette being deleted: ', vignette);
    await this.deleteImg(vignette);

    this.openSnackBar('Vignette supprimée !');
  }

  public async deleteImgAndRepositionImages(img: Image) {
    await this.deleteImg(img);
    await this.repositionImagesAfterDeletion(img);

    this.openSnackBar('Image supprimée !');
  }

  private async deleteImg(img: Image): Promise<void> {
    // Deletes on Storage.
    const imgStorageRef = ref(this.storage, img.url);
    const storageDelete = deleteObject(imgStorageRef);

    // Deletes on Firestore.
    const imgFirestoreRef = doc(
      this.db,
      `projects/${this.id}/images/${img.id}`
    );
    const firestoreDelete = deleteDoc(imgFirestoreRef);

    // If it's a vignette, doesn't update image count.
    if (img.type === 'vignette') {
      Promise.all([firestoreDelete, storageDelete]);
      return;
    }

    // Updates image count.
    const projectUpdate = updateDoc(this.projectRef, {
      imageCount: increment(-1),
    });

    Promise.all([firestoreDelete, storageDelete, projectUpdate]);
  }

  // Repositions remaining images.
  private async repositionImagesAfterDeletion(img: Image) {
    let images = await this.projectImages();

    if (images.length === 0) return;

    images = this.sortByPosition(images);
    const batch = this.updateImgPositions(images);

    batch.commit();
  }

  // Loads project images.
  private async projectImages(): Promise<Image[]> {
    const imagesSnapshot = await getDocs(this.imgsRef);
    let images: Image[] = [];

    imagesSnapshot.forEach((doc) => {
      images.push(doc.data());
    });

    return images;
  }

  sortByPosition(images: Image[]): Image[] {
    return images.sort((a, b) => a.position! - b.position!);
  }

  // Prepares Firestore operations.
  private updateImgPositions(images: Image[]): WriteBatch {
    const batch = writeBatch(this.db);

    for (let i = 0; i < images.length; i++) {
      const imgRef = doc(this.db, `projects/${this.id}/images/${images[i].id}`);
      batch.update(imgRef, {
        position: i,
      });
    }
    return batch;
  }

  // Updates an image position upward or downard.
  public async moveImage(img: Image, operation: 1 | -1) {
    let images = await this.projectImages();

    images = this.sortByPosition(images);
    // Removes the moving image.
    images.splice(img.position!, 1);
    // Insert it 1 position before.
    images.splice(img.position! - operation, 0, img);
    const batch = this.updateImgPositions(images);
    batch.commit();
  }

  public async deleteProject() {
    // First, deletes nested images.
    let images = await this.projectImages();
    const imgDeletePromises = [];

    for (const img of images) {
      imgDeletePromises.push(this.deleteImg(img));
    }

    Promise.all(imgDeletePromises).then(() => {
      // Then, deletes the project itself.
      deleteDoc(this.projectRef);
    });

    this.openSnackBar('Projet supprimé !');
    this.router.navigate(['/admin']);
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 2000,
    });
  }

  public publish() {
    updateDoc(this.projectRef, { status: 'published' });
    this.openSnackBar('Projet publié !');
  }

  public unpublish() {
    updateDoc(this.projectRef, { status: 'draft' });
    this.openSnackBar('Projet retiré du site !');
  }

  back() {
    this.location.back();
  }

  // Delete a project confirmation dialog.
  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Es-tu sûr de vouloir supprimer ?',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteProject();
      }
    });
  }
}
