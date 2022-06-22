import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Dimitri Grangeon';
  public emailVisible: boolean = false;

  public toggleEmail() {
    this.emailVisible = !this.emailVisible;
  }
}
