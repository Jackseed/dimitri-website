// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Components
import { Grid, Image } from '../models';

// Flex layout
import { MediaChange, MediaObserver } from '@angular/flex-layout';

// Angular fire
import {
  Firestore,
  getDocs,
  query,
  where,
  collectionGroup,
  getDoc,
  doc,
} from '@angular/fire/firestore';

// Rxjs
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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

  constructor(
    private mediaObserver: MediaObserver,
    private db: Firestore,
    private router: Router
  ) {
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

  public async navigateToProject(projectId: string) {
    // Gets project title.
    const projectRef = doc(this.db, `projects/${projectId}`);
    const project = (await getDoc(projectRef)).data();
    // Removes characters breaking urls
    const normalizedTitle = project?.title
      .replaceAll(' ', '-')
      .replaceAll('/', '&');
    this.router.navigate([`/${normalizedTitle}`]);
  }

  ngOnDestroy(): void {
    this.watcher.unsubscribe();
  }
}
