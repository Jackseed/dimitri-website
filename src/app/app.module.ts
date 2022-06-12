// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Angularfire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular Material
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Environments
import { environment } from 'src/environments/environment';

// Directives
import { DropzoneDirective } from './admin/dropzone.directive';

// Components
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectFormComponent } from './admin/project-form/project-form.component';
import { ProjectListComponent } from './admin/project-list/project-list.component';
import { UploaderComponent } from './admin/uploader/uploader.component';
import { UploadTaskComponent } from './admin/upload-task/upload-task.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ConfirmationDialogComponent } from './admin/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ProjectViewComponent,
    ProjectFormComponent,
    ProjectListComponent,
    UploaderComponent,
    UploadTaskComponent,
    DropzoneDirective,
    ConfirmationDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    NoopAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
