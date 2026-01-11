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
import { OrganizerStateService } from '../../../organizer/services/organizer-state.service';
import { CategoryService } from '../../services/category.service';
import { CategoryRequest, Category } from '../../models';

@Component({
  selector: 'app-category-form',
  standalone: true,
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
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private organizerStateService = inject(OrganizerStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  protected loading = signal(false);
  protected mode = signal<'create' | 'edit'>('create');
  protected categoryId = signal<string | null>(null);
  protected activeCategories = signal<Category[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', []],
    parentId: [null as string | null],
    isActive: [true]
  });
  ngOnInit() {
    this.loadActiveCategories();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.categoryId.set(id);
        this.mode.set('edit');
        this.loadCategory(id);
      } else {
        this.mode.set('create');
      }
    });
  }

  loadActiveCategories() {
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        this.activeCategories.set(categories);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar las categorías', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  get filteredCategories(): Category[] {
    // Filter out the current category being edited
    return this.activeCategories().filter(cat =>
      !this.categoryId() || cat.id.toString() !== this.categoryId()
    );
  }

  loadCategory(id: string) {
    this.loading.set(true);
    this.categoryService.getById(id).subscribe({
      next: (category) => {
        this.form.patchValue({
          name: category.name,
          description: category.description,
          parentId: (category as any).parentId || null,
          isActive: category.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar la categoría', 'Cerrar', {
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
    const formValue = this.form.value as CategoryRequest;
    const request: CategoryRequest = {
      id: this.categoryId(),
      organizerId: this.organizerStateService.getSelectedOrganizer(),
      name: formValue.name,
      description: formValue.description,
      parentId: formValue.parentId,
      isActive: formValue.isActive
    };
    const operation = this.mode() === 'create'
      ? this.categoryService.create(request)
      : this.categoryService.update(this.categoryId()!, request);
    operation.subscribe({
      next: () => {
        const message = this.mode() === 'create'
          ? 'Categoría creada exitosamente'
          : 'Categoría actualizada exitosamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/categories']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al guardar la categoría', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }
  cancel() {
    this.router.navigate(['/categories']);
  }
  get titleText(): string {
    return this.mode() === 'create' ? 'Crear Categoría' : 'Editar Categoría';
  }
  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }
}
