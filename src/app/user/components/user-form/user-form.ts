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
import { UserService } from '../../services/user.service';
import { UserRequest } from '../../models/user-request';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  protected userId = signal<string | null>(null);

  form = this.fb.group({
    username: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.maxLength(200)]],
    isActive: [true]
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.userId.set(id);
        this.loadUser(id);
      } else {
        // Si no hay ID, redirigir al listado (no se puede crear usuarios desde aquí)
        this.router.navigate(['/users']);
      }
    });
  }

  loadUser(id: string) {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          isActive: user.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar el usuario', 'Cerrar', {
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
    const formValue = this.form.getRawValue();

    const request: UserRequest = {
      username: formValue.username!,
      email: formValue.email!,
      fullName: formValue.fullName || null,
      isActive: formValue.isActive!
    };

    this.userService.update(this.userId()!, request).subscribe({
      next: () => {
        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al actualizar el usuario', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/users']);
  }
}

