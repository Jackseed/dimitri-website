// Angular
import { Component, OnDestroy } from '@angular/core';
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
  collection,
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
export class HomepageComponent implements OnDestroy {
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

  async getVignettes() {
    this.vignettes = [];
    const publishedProjectIds = await this.getPublishedProjectIds();
    const vignettesSnapshot = await getDocs(this.vignetteQuery);
    vignettesSnapshot.forEach((vignetteDoc) => {
      // Sorts by published projects.
      if (publishedProjectIds.includes(vignetteDoc.data().projectId!))
        this.vignettes.push(vignetteDoc.data());
    });
    this.vignettes.sort((a, b) => a.vignettePosition! - b.vignettePosition!);
  }

  async getPublishedProjectIds(): Promise<string[]> {
    let ids: string[] = [];
    const projectsSnapshot = await getDocs(collection(this.db, 'projects'));
    projectsSnapshot.forEach((projectDoc) => {
      if (projectDoc.data().status === 'published')
        ids.push(projectDoc.data().id);
    });

    return ids;
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
