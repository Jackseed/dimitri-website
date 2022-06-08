import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectFormComponent } from './admin/project-form/project-form.component';
import { ProjectListComponent } from './admin/project-list/project-list.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ProjectViewComponent } from './project-view/project-view.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  {
    path: 'fesses',
    component: ProjectViewComponent,
  },
  {
    path: 'admin',
    component: ProjectListComponent,
  },
  {
    path: 'admin/:id/edit',
    component: ProjectFormComponent,
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
