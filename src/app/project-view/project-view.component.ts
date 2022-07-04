// Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Components
import { Image, Project } from '../models';

// Angularfire
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  DocumentReference,
  Firestore,
} from '@angular/fire/firestore';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit {
  public images: Image[] = [];
  private projectRef: DocumentReference;
  public project$: Observable<Project>;
  private imgsRef: CollectionReference;
  public images$: Observable<Image[]>;
  private id: string;

  constructor(private db: Firestore, private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id')!;
    // Sets project observable.
    this.projectRef = doc(this.db, `projects/${this.id}`);
    this.project$ = docData(this.projectRef);
    // Sets images observable.
    this.imgsRef = collection(this.db, `projects/${this.id}/images`);
    this.images$ = collectionData(this.imgsRef).pipe(
      map((images) => images.filter((image) => image.type === 'images'))
    );
  }

  ngOnInit(): void {}
}
