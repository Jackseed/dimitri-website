// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectFormComponent } from './admin/project-form/project-form.component';
import { ProjectListComponent } from './admin/project-list/project-list.component';

// Angularfire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { HomepageComponent } from './homepage/homepage.component';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular Material
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ProjectViewComponent,
    ProjectFormComponent,
    ProjectListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    NoopAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
