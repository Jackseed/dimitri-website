import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  constructor(private db: Firestore, private router: Router) {}

  ngOnInit(): void {}

  public async addProject() {
    const docRef = await addDoc(collection(this.db, 'projects'), {
      title: '',
      status: 'draft',
    });

    this.router.navigate([`admin/${docRef.id}/edit`]);
  }
}
