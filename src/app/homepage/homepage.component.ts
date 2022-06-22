import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Grid, Image } from '../models';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public grid: Grid = {
    cols: 3,
    gutterSize: '20',
  };
  public images: Image[] = [
    {
      position: 1,
      url: '../../assets/1.png',
      projectId: 'fesses',
    },
    {
      position: 2,
      url: '../../assets/2.png',
      projectId: 'fesses',
    },
    {
      position: 3,
      url: '../../assets/3.png',
      projectId: 'fesses',
    },
    {
      position: 4,
      url: '../../assets/4.png',
      projectId: 'fesses',
    },
    {
      position: 5,
      url: '../../assets/5.png',
      projectId: 'fesses',
    },
    {
      position: 6,
      url: '../../assets/6.png',
      projectId: 'fesses',
    },
    {
      position: 7,
      url: '../../assets/7.png',
      projectId: 'fesses',
    },
    {
      position: 8,
      url: '../../assets/8.png',
      projectId: 'fesses',
    },
    {
      position: 9,
      url: '../../assets/9.png',
      projectId: 'fesses',
    },
  ];
  watcher: Subscription;
  activeMediaQuery = '';

  constructor(private mediaObserver: MediaObserver) {
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
  }
  ngOnInit(): void {}
}
