import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/components/category-list/category-list.component';
import { CategoryFormComponent } from './category/components/category-form/category-form.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard] },
  { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'categories/edit/:id', component: CategoryFormComponent, canActivate: [authGuard] },
  // add more protected child routes here
  { path: '**', redirectTo: '' }
];
