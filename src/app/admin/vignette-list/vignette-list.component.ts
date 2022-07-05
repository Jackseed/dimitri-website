// Angular
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// Components
import { Image } from 'src/app/models';

// Angularfire
import {
  Firestore,
  query,
  collectionGroup,
  where,
  getDocs,
  writeBatch,
  doc,
  collectionData,
} from '@angular/fire/firestore';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-vignette-list',
  templateUrl: './vignette-list.component.html',
  styleUrls: ['./vignette-list.component.scss'],
})
export class VignetteListComponent implements OnInit {
  private vignetteQuery = query(
    collectionGroup(this.db, 'images'),
    where('type', '==', 'vignette')
  );
  public vignettes: Image[] = [];
  public vignettes$: Observable<Image[]>;

  constructor(
    private db: Firestore,
    private router: Router,
    private location: Location
  ) {
    this.getVignettes();
    this.vignettes$ = collectionData(this.vignetteQuery).pipe(
      map((vignettes) =>
        vignettes.sort((a, b) => a.vignettePosition! - b.vignettePosition!)
      )
    );
  }

  ngOnInit(): void {}

  async getVignettes() {
    this.vignettes = [];
    const vignettesSnapshot = await getDocs(this.vignetteQuery);
    vignettesSnapshot.forEach((vignetteDoc) => {
      this.vignettes.push(vignetteDoc.data());
    });
  }

  private async updatePosition(vignettes: Image[]) {
    const batch = writeBatch(this.db);

    for (let i = 0; i < this.vignettes.length; i++) {
      const vignetteRef = doc(
        this.db,
        `projects/${vignettes[i].projectId}/images/${vignettes[i].id}`
      );
      batch.update(vignetteRef, {
        vignettePosition: i,
      });
    }

    await batch.commit();
  }

  public navigateToProject(projectId: string) {
    this.router.navigate([`/admin/${projectId}/view`]);
  }

  async drop(event: CdkDragDrop<any>) {
    let vignettes = this.vignettes;
    // Removes moving item from its old position.
    vignettes.splice(event.previousContainer.data.index, 1);
    // Then adds it to its new position.
    vignettes.splice(
      event.container.data.index,
      0,
      event.previousContainer.data.item
    );

    await this.updatePosition(vignettes);
  }

  back() {
    this.location.back();
  }
}
