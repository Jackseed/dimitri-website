// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Angularfire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { HomepageComponent } from './homepage/homepage.component';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular Material
import { MatGridListModule } from '@angular/material/grid-list';
import { ProjectViewComponent } from './project-view/project-view.component';

@NgModule({
  declarations: [AppComponent, HomepageComponent, ProjectViewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatGridListModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    NoopAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
