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
  query,
  getDocs,
  where,
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
  private projectRef: DocumentReference | undefined;
  public project$: Observable<Project> | undefined;
  private imgsRef: CollectionReference | undefined;
  public images$: Observable<Image[]> | undefined;
  private id: string | null = '';
  //  private title: string;

  constructor(private db: Firestore, private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    // Sets project id depending on route param (admin or user view)
    this.route.snapshot.paramMap.has('id')
      ? (this.id = this.route.snapshot.paramMap.get('id'))
      : (this.id = await this.getIdThroughTitle());
    // Sets project observable.
    this.projectRef = doc(this.db, `projects/${this.id}`);
    this.project$ = docData(this.projectRef);
    // Sets images observable.
    this.imgsRef = collection(this.db, `projects/${this.id}/images`);
    this.images$ = collectionData(this.imgsRef).pipe(
      map((images) => images.filter((image) => image.type === 'image'))
    );
  }

  async getIdThroughTitle(): Promise<string> {
    const title = this.route.snapshot.paramMap.get('title');
    const denormalizedTitle = title!.replaceAll('-', ' ').replaceAll('&', '/');

    let projectIds: string[] = [];
    const projectQuery = query(
      collection(this.db, 'projects'),
      where('title', '==', denormalizedTitle)
    );
    const querySnapshot = await getDocs(projectQuery);
    querySnapshot.forEach((doc) => {
      projectIds.push(doc.data().id);
    });
    return projectIds[0];
  }
}
