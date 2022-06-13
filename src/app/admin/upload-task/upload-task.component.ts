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
import {
  Firestore,
  doc,
  getDoc,
  runTransaction,
} from '@angular/fire/firestore';

// Rxjs
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss'],
})
export class UploadTaskComponent implements OnInit {
  @Input() file: File | undefined;
  @Input() i: number | undefined;

  uploadTask: UploadTask | undefined;

  percentage: number | undefined;
  snapshot: Observable<any> | undefined;
  id: string = '';
  private sub: Subscription | undefined;

  constructor(
    private storage: Storage,
    private db: Firestore,
    private route: ActivatedRoute
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
        console.log('Upload is ' + this.percentage + '% done');
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
          await runTransaction(this.db, async (transaction) => {
            // Reads image count to set position.
            let position: number;
            const projectRef = doc(this.db, `projects/${this.id}`);
            const project = (await getDoc(projectRef)).data();

            project!.imageCount
              ? (position = project!.imageCount)
              : (position = 0);

            // Updates image count.
            transaction.update(projectRef, { imageCount: position + 1 });

            // Saves image to Firestore.
            const id = this.randomId(18);
            const imageRef = doc(this.db, `projects/${this.id}/images/${id}`);
            const image: Image = { id, url, path, position };
            transaction.set(imageRef, image);
          });
        });
      }
    );
  }

  private randomId(idLength: number) {
    return [...Array(idLength).keys()]
      .map(() => Math.random().toString(36).substr(2, 1))
      .join('');
  }
}
