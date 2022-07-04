import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Firestore,
  getDocs,
  query,
  where,
  collectionGroup,
} from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Grid, Image } from '../models';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  public grid: Grid = {
    cols: 3,
    gutterSize: '20',
  };
  public vignettes: Image[] = [];
  private vignetteQuery = query(
    collectionGroup(this.db, 'images'),
    where('type', '==', 'vignette')
  );
  watcher: Subscription;
  activeMediaQuery = '';

  constructor(private mediaObserver: MediaObserver, private db: Firestore) {
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

    this.getVignettes();
  }
  ngOnInit(): void {}

  async getVignettes() {
    this.vignettes = [];
    const vignettesSnapshot = await getDocs(this.vignetteQuery);
    vignettesSnapshot.forEach((vignetteDoc) => {
      this.vignettes.push(vignetteDoc.data());
    });
    this.vignettes.sort((a, b) => a.vignettePosition! - b.vignettePosition!);
  }

  ngOnDestroy(): void {
    this.watcher.unsubscribe();
  }
}
