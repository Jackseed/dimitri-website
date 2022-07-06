// Angular
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Angular Material
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Dimitri Grangeon';
  public emailVisible: boolean = false;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon(
      'instagram',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/instagram.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'mail',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/mail.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'pinterest',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/pinterest.svg'
      )
    );
  }

  public toggleEmail() {
    this.emailVisible = !this.emailVisible;
  }

  public redirectToNewTab(url: string) {
    window.open(url, '_blank');
  }
}
