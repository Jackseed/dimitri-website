// Angular
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  CdkDrag,
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
  @ViewChild(CdkDropListGroup) listGroup:
    | CdkDropListGroup<CdkDropList>
    | undefined;
  @ViewChild(CdkDropList) placeholder: CdkDropList | undefined;

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
  public items: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
      this.vignettes.push(vignetteDoc.data());
    });

    //this.vignettes.sort((a, b) => a.position - b.position);
  }

  ngAfterViewInit() {
    const phElement = this.placeholder!.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentNode!.removeChild(phElement);
  }

  drop() {
    if (!this.target || !this.placeholder) return;

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentNode;

    if (!parent || !this.source || !this.sourceIndex || !this.targetIndex)
      return;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(
      this.source.element.nativeElement,
      parent.children[this.sourceIndex]
    );

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      moveItemInArray(this.vignettes, this.sourceIndex, this.targetIndex);
      // this.updatePosition(this.vignettes);
    }
  }

  enter = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop === this.placeholder) return true;

    if (!this.placeholder) return;

    const phElement = this.placeholder.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    if (!dropElement.parentNode) return;

    const dragIndex = this.__indexOf(
      dropElement.parentNode.children,
      drag.dropContainer.element.nativeElement
    );
    const dropIndex = this.__indexOf(
      dropElement.parentNode.children,
      dropElement
    );

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      const sourceElement = this.source.element.nativeElement;
      if (!sourceElement.parentNode) return;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentNode.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentNode.insertBefore(
      phElement,
      dragIndex < dropIndex ? dropElement.nextSibling : dropElement
    );

    this.source._dropListRef.start();
    this.placeholder._dropListRef.enter(
      drag._dragRef,
      drag.element.nativeElement.offsetLeft,
      drag.element.nativeElement.offsetTop
    );

    return false;
  };

  __indexOf(collection: any, node: any) {
    return Array.prototype.indexOf.call(collection, node);
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

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
