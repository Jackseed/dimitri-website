// Angular
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// Components
import { Image } from 'src/app/models';

// Angular Material
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private location: Location,
    private snackBar: MatSnackBar
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

  private updatePosition(vignettes: Image[]) {
    const batch = writeBatch(this.db);
    console.log('updating position of vignettes: ', this.vignettes);

    for (let i = 0; i < this.vignettes.length; i++) {
      const vignetteRef = doc(
        this.db,
        `projects/${vignettes[i].projectId}/images/${vignettes[i].id}`
      );
      batch.update(vignetteRef, {
        vignettePosition: i,
      });
    }

    batch.commit();
  }

  /*   public navigateProject(projectId: string) {
    if (projectId) {
      this.router.navigate([`/admin/${projectId}/view`]);
    } else {
      this.openSnackBar('Aucun projet associé (recharge la page ?)');
    }
  } */

  /*   private openSnackBar(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 2000,
    });
  }
 */
  drop(event: CdkDragDrop<any>) {
    let vignettes = this.vignettes;
    vignettes[event.previousContainer.data.index] = event.container.data.item;
    vignettes[event.container.data.index] = event.previousContainer.data.item;
    event.currentIndex = 0;
    this.updatePosition(vignettes);
  }

  back() {
    this.location.back();
  }
}
