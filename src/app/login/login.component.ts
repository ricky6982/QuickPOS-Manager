import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../auth.service';
import { LoginRequest } from '../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  busy = signal(false);
  error = signal<string | null>(null);

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    const credentials: LoginRequest = this.form.value as LoginRequest;

    this.auth.login(credentials).subscribe({
      next: (response) => {
        if (response.data) {
          if (response.data.user.isGlobalAdmin) {
            this.router.navigate(['/organizers']);
          } else if (response.data.organizations) {
            this.router.navigate(['/select-organization'], {
              state: { organizations: response.data.organizations }
            });
          } else {
            console.warn('No es admin y no tiene organizaciones');
            this.error.set('No tiene organizaciones asignadas');
          }
        } else if (response.error) {
          this.error.set(response.error?.message || 'Error en el login');
        }
        this.busy.set(false);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.busy.set(false);
        this.error.set(error?.error?.message || error?.message || 'Error de conexión');
      }
    });
  }
}

