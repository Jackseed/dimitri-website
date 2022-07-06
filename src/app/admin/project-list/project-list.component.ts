import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from 'src/app/models';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  public projects$: Observable<Project[]>;

  constructor(private db: Firestore, private router: Router) {
    const projectsRef = collection(this.db, 'projects');
    this.projects$ = collectionData(projectsRef);
  }

  ngOnInit(): void {}

  public async addProject() {
    const docRef = await addDoc(collection(this.db, 'projects'), {
      title: '',
      status: 'draft',
    });

    this.router.navigate([`admin/${docRef.id}/edit`]);
  }

  public goToVignettes() {
    this.router.navigate([`admin/vignettes`]);
  }
}
