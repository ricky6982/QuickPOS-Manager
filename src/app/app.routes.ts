import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CategoryListComponent } from './category/components/category-list/category-list.component';
import { CategoryFormComponent } from './category/components/category-form/category-form.component';
import { OrganizerListComponent } from './organizer/components/organizer-list/organizer-list';
import { OrganizerFormComponent } from './organizer/components/organizer-form/organizer-form';
import { ProductListComponent } from './product/components/product-list/product-list';
import { ProductFormComponent } from './product/components/product-form/product-form';
import { PriceListListComponent } from './price-list/components/price-list-list/price-list-list';
import { PriceListFormComponent } from './price-list/components/price-list-form/price-list-form';
import { UserListComponent } from './user/components/user-list/user-list';
import { UserFormComponent } from './user/components/user-form/user-form';
import { StaffListComponent } from './staff/components/staff-list/staff-list.component';
import { OrganizationSelectorComponent } from './login/organization-selector/organization-selector.component';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { authGuard } from './auth.guard';
import { organizerSelectedGuard } from './organizer-selected.guard';

export const routes: Routes = [
  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'select-organization', component: OrganizationSelectorComponent },

  // Rutas protegidas con layout
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'organizers', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'categories', component: CategoryListComponent, canActivate: [organizerSelectedGuard] },
      { path: 'categories/new', component: CategoryFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'categories/edit/:id', component: CategoryFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'organizers', component: OrganizerListComponent },
      { path: 'organizers/new', component: OrganizerFormComponent },
      { path: 'organizers/edit/:id', component: OrganizerFormComponent },
      { path: 'products', component: ProductListComponent, canActivate: [organizerSelectedGuard] },
      { path: 'products/new', component: ProductFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'price-lists', component: PriceListListComponent, canActivate: [organizerSelectedGuard] },
      { path: 'price-lists/new', component: PriceListFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'price-lists/edit/:id', component: PriceListFormComponent, canActivate: [organizerSelectedGuard] },
      { path: 'staff', component: StaffListComponent, canActivate: [organizerSelectedGuard] },
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'login' }
];


