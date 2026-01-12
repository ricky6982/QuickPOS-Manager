import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/components/category-list/category-list.component';
import { CategoryFormComponent } from './category/components/category-form/category-form.component';
import { OrganizerListComponent } from './organizer/components/organizer-list/organizer-list';
import { OrganizerFormComponent } from './organizer/components/organizer-form/organizer-form';
import { ProductListComponent } from './product/components/product-list/product-list';
import { ProductFormComponent } from './product/components/product-form/product-form';
import { PriceListListComponent } from './price-list/components/price-list-list/price-list-list';
import { PriceListFormComponent } from './price-list/components/price-list-form/price-list-form';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard] },
  { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'categories/edit/:id', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'organizers', component: OrganizerListComponent, canActivate: [authGuard] },
  { path: 'organizers/new', component: OrganizerFormComponent, canActivate: [authGuard] },
  { path: 'organizers/edit/:id', component: OrganizerFormComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'products/new', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'price-lists', component: PriceListListComponent, canActivate: [authGuard] },
  { path: 'price-lists/new', component: PriceListFormComponent, canActivate: [authGuard] },
  { path: 'price-lists/edit/:id', component: PriceListFormComponent, canActivate: [authGuard] },
  // add more protected child routes here
  { path: '**', redirectTo: '' }
];


