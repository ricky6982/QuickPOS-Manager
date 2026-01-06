import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../auth.service';

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

    const { username, password } = this.form.value as { username: string; password: string };
    try {
      const ok = await this.auth.login(username!, password!);
      if (ok) {
        await this.router.navigateByUrl('/');
      } else {
        this.error.set('Credenciales inválidas');
      }
    } catch (e: any) {
      // Extraer el mensaje de error del objeto Error
      const errorMessage = e?.message || 'Error de conexión';
      this.error.set(errorMessage);
    } finally {
      this.busy.set(false);
    }
  }
}

