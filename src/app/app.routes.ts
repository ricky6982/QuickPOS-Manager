import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/components/category-list/category-list.component';
import { CategoryFormComponent } from './category/components/category-form/category-form.component';
import { OrganizerListComponent } from './organizer/components/organizer-list/organizer-list';
import { OrganizerFormComponent } from './organizer/components/organizer-form/organizer-form';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard] },
  { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'categories/edit/:id', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'organizers', component: OrganizerListComponent, canActivate: [authGuard] },
  { path: 'organizers/new', component: OrganizerFormComponent, canActivate: [authGuard] },
  { path: 'organizers/edit/:id', component: OrganizerFormComponent, canActivate: [authGuard] },
  // add more protected child routes here
  { path: '**', redirectTo: '' }
];
