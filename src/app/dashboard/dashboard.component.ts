import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<h2>Dashboard</h2>
<p>Bienvenido al dashboard de la app.</p>`,
})
export class DashboardComponent {}

