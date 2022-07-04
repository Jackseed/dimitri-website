// Angular
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

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
} from '@angular/fire/firestore';

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

  constructor(
    private db: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.getVignettes();
  }

  ngOnInit(): void {}

  async getVignettes() {
    const vignettesSnapshot = await getDocs(this.vignetteQuery);
    vignettesSnapshot.forEach((vignetteDoc) => {
      this.vignettes.push(vignetteDoc.data());
    });
    //this.vignettes.sort((a, b) => a.position - b.position);
  }

  /*   private updatePosition(vignettes: Image[]) {
    console.log('updating position');
    const batch = this.db.firestore.batch();
    console.log(vignettes);

    for (let i = 0; i < vignettes.length; i++) {
      batch.update(
        this.db.firestore.collection('vignettes').doc(vignettes[i].id),
        {
          position: i,
        }
      );
    }

    batch.commit();
  } */

  public navigateProject(projectId: string) {
    if (projectId) {
      this.router.navigate([`/admin/${projectId}/view`]);
    } else {
      this.openSnackBar('Aucun projet associé (recharge la page ?)');
    }
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 2000,
    });
  }

  drop(event: CdkDragDrop<any>) {
    this.vignettes[event.previousContainer.data.index] =
      event.container.data.item;
    this.vignettes[event.container.data.index] =
      event.previousContainer.data.item;
    event.currentIndex = 0;
  }
}
