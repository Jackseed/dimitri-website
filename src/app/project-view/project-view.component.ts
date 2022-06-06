import { Component, OnInit } from '@angular/core';
import { Image } from '../models';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit {
  public images: Image[] = [
    { url: '../../assets/fesses1.png' },
    { url: '../../assets/fesses2.png' },
  ];
  constructor() {}

  ngOnInit(): void {}
}
