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
import { OrganizerService } from '../../services/organizer.service';
import { OrganizerRequest } from '../../models';

@Component({
  selector: 'app-organizer-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './organizer-form.html',
  styleUrl: './organizer-form.css'
})
export class OrganizerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private organizerService = inject(OrganizerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  protected mode = signal<'create' | 'edit'>('create');
  protected organizerId = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    taxId: ['', [Validators.maxLength(20)]],
    isActive: [true]
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.organizerId.set(id);
        this.mode.set('edit');
        this.loadOrganizer(id);
      } else {
        this.mode.set('create');
      }
    });
  }

  loadOrganizer(id: string) {
    this.loading.set(true);
    this.organizerService.getById(id).subscribe({
      next: (organizer) => {
        this.form.patchValue({
          name: organizer.name,
          taxId: organizer.taxId,
          isActive: organizer.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar el organizador', 'Cerrar', {
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
    const formValue = this.form.value as OrganizerRequest;

    const request: OrganizerRequest = {
      id: this.organizerId(),
      name: formValue.name,
      taxId: formValue.taxId || null,
      isActive: formValue.isActive
    };

    const operation = this.mode() === 'create'
      ? this.organizerService.create(request)
      : this.organizerService.update(this.organizerId()!, request);

    operation.subscribe({
      next: () => {
        const message = this.mode() === 'create'
          ? 'Organizador creado exitosamente'
          : 'Organizador actualizado exitosamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/organizers']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al guardar el organizador', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/organizers']);
  }

  get titleText(): string {
    return this.mode() === 'create' ? 'Crear Organizador' : 'Editar Organizador';
  }

  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }
}
