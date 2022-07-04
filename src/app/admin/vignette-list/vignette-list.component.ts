// Angular
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  CdkDrag,
  CdkDragEnter,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

// Components
import { Grid, Image } from 'src/app/models';

// Rxjs
import { Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// Flex layout
import { MediaObserver, MediaChange } from '@angular/flex-layout';

// Angular Material
import { MatSnackBar } from '@angular/material/snack-bar';

// Angularfire
import {
  Firestore,
  query,
  collectionGroup,
  where,
  getDocs,
  collectionData,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-vignette-list',
  templateUrl: './vignette-list.component.html',
  styleUrls: ['./vignette-list.component.scss'],
})
export class VignetteListComponent implements OnInit, OnDestroy {
  @ViewChild(CdkDropListGroup) listGroup!: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList)
  placeholder!: CdkDropList;

  public grid: Grid | undefined;
  private watcher: Subscription;
  private activeMediaQuery = '';
  private vignetteQuery = query(
    collectionGroup(this.db, 'images'),
    where('type', '==', 'vignette')
  );
  public vignettes$: Observable<Image[]>;
  public vignettes: Image[] = [];
  public target: CdkDropList | null;
  public targetIndex: number | undefined;
  public source: CdkDropList | null;
  public sourceIndex: number | undefined;
  indexDrag: number = -1;
  indexEnter: number = -1;

  constructor(
    private mediaObserver: MediaObserver,
    private db: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.target = null;
    this.source = null;

    this.watcher = mediaObserver
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        this.activeMediaQuery = change
          ? `'${change.mqAlias}' = (${change.mediaQuery})`
          : '';
        if (change.mqAlias === 'xs') {
          this.grid = { cols: 2, gutterSize: '20' };
        } else {
          this.grid = { cols: 3, gutterSize: '20' };
        }
      });

    this.vignettes$ = collectionData(this.vignetteQuery);
    this.getVignettes();
  }

  ngOnInit(): void {}

  async getVignettes() {
    const vignettesSnapshot = await getDocs(this.vignetteQuery);
    vignettesSnapshot.forEach((vignetteDoc) => {
      console.log('vignette data: ', vignetteDoc.data());
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

  drop(event: CdkDragDrop<Image[]>) {
    this.indexDrag = -1;
    this.indexEnter = -1;
    console.log('drop event container: ', event.container);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const currentIndex =
        event.currentIndex == event.container.data.length
          ? event.container.data.length - 1
          : event.currentIndex;

      //get the data we are dragging
      const dataFrom = event.previousContainer.data[event.previousIndex];
      //get the last element of the row where dropped
      const dataTo = event.container.data[event.container.data.length - 1];

      //remove the element dragged
      event.previousContainer.data.splice(event.previousIndex, 1);
      //Add at last the dataTo
      event.previousContainer.data.unshift(dataTo);

      //Add the data dragged
      event.container.data.splice(currentIndex, 0, dataFrom);
      //remove the last element
      event.container.data.pop();
    }
  }
  startDrag(index: number) {
    this.indexDrag = index;
  }

  enter(event: CdkDragEnter<any>, index: number) {
    this.indexEnter = index;
    const data = event.container.data;
    console.log('enter event container: ', event.container);
    console.log('enter data: ', data);
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
