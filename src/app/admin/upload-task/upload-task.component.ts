// Angular
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Models
import { Image } from 'src/app/models';

// Angularfire
import {
  Storage,
  UploadTask,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

// Rxjs
import { Observable } from 'rxjs';

// Angular Material
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss'],
})
export class UploadTaskComponent implements OnInit {
  @Input() file: File | undefined;
  @Input() type: 'vignette' | 'image' | undefined;
  @Input() i: number | undefined;

  uploadTask: UploadTask | undefined;

  percentage: number | undefined;
  snapshot: Observable<any> | undefined;
  id: string = '';

  constructor(
    private storage: Storage,
    private db: Firestore,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.startUpload();
  }

  async startUpload() {
    if (!this.id || !this.file) return;
    // Sets storage unique path.
    const path = `projects/${Date.now()}_${this.file.name}`;

    // Reference to storage bucket.
    const bucketRef = ref(this.storage, path);
    // Creates upload task.
    this.uploadTask = uploadBytesResumable(bucketRef, this.file);

    // Listens for state changes, errors, and completion of the upload.
    this.uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Gets task progress.
        this.percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            console.log("User doesn't have permission to access the object");
            break;
          case 'storage/canceled':
            console.log('User canceled the upload');
            break;
          case 'storage/unknown':
            console.log('Unknown error occurred, inspect error.serverResponse');
            break;
        }
      },
      () => {
        // Upload completed successfully, saves ref on db.
        getDownloadURL(this.uploadTask!.snapshot.ref).then(async (url) => {
          const id = this.randomId(18);
          const imageRef = doc(this.db, `projects/${this.id}/images/${id}`);
          const image: Image = {
            id: imageRef.id,
            url,
            path,
            type: this.type,
          };
          setDoc(imageRef, image);
          this.openSnackBar('Image sauvegardée 👇');
        });
      }
    );
  }

  private randomId(idLength: number) {
    return [...Array(idLength).keys()]
      .map(() => Math.random().toString(36).substr(2, 1))
      .join('');
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
    });
  }
}
