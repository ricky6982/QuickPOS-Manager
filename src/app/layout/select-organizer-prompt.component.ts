import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-select-organizer-prompt',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; padding: 40px;">
      <mat-card style="max-width: 600px; text-align: center; padding: 40px;">
        <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: #667eea; margin-bottom: 24px;">
          business
        </mat-icon>
        <h2 style="margin: 0 0 16px 0; color: #333;">Selecciona un Organizador</h2>
        <p style="color: #666; margin: 0 0 24px 0; font-size: 16px;">
          Para acceder a categorías, productos y listas de precios, primero debes seleccionar un organizador del menú superior.
        </p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #555; font-size: 14px;">
            <strong>💡 Consejo:</strong> Usa el selector de organizadores en la barra superior para filtrar los datos por organizador.
          </p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class SelectOrganizerPromptComponent {}
