import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../category/services/category.service';
import { OrganizerStateService } from '../../../organizer/services/organizer-state.service';
import type { ProductRequest } from '../../models/product-request';
import type { Category } from '../../../category/models';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private organizerStateService = inject(OrganizerStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  protected mode = signal<'create' | 'edit'>('create');
  protected productId = signal<string | null>(null);
  protected categories = signal<Category[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    sku: ['', [Validators.maxLength(50)]],
    barcode: ['', [Validators.maxLength(50)]],
    categoryId: [null as string | null],
    organizerId: [null as string | null],
    isActive: [true]
  });

  ngOnInit() {
    this.loadCategories();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.productId.set(id);
        this.mode.set('edit');
        this.loadProduct(id);
      } else {
        this.mode.set('create');
      }
    });
  }

  loadCategories() {
    // Load all active categories (we'll get first 100 items for the dropdown)
    this.categoryService.getAll(1, 100).subscribe({
      next: (response) => {
        this.categories.set(response.items);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          categoryId: product.categoryId,
          organizerId: product.organizerId,
          isActive: product.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar el producto', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
        this.cancel();
      }
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;

    const request: ProductRequest = {
      id: this.productId(),
      name: formValue.name!,
      description: formValue.description || null,
      sku: formValue.sku || null,
      barcode: formValue.barcode || null,
      categoryId: formValue.categoryId || null,
      organizerId: this.organizerStateService.getSelectedOrganizer(),
      isActive: formValue.isActive!
    };

    const operation = this.mode() === 'create'
      ? this.productService.create(request)
      : this.productService.update(this.productId()!, request);

    operation.subscribe({
      next: () => {
        const message = this.mode() === 'create'
          ? 'Producto creado exitosamente'
          : 'Producto actualizado exitosamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al guardar el producto', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/products']);
  }

  get titleText(): string {
    return this.mode() === 'create' ? 'Crear Producto' : 'Editar Producto';
  }

  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }
}

