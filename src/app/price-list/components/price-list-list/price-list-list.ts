import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PriceListService } from '../../services/price-list.service';
import { PriceList } from '../../models';
import { PaginationComponent } from '../../../shared/components';
import { ConfirmDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-price-list-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    PaginationComponent
  ],
  templateUrl: './price-list-list.html',
  styleUrl: './price-list-list.css'
})
export class PriceListListComponent implements OnInit {
  private priceListService = inject(PriceListService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected priceLists = signal<PriceList[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);

  displayedColumns: string[] = ['name', 'scope', 'status', 'priority', 'validFrom', 'validUntil', 'actions'];

  ngOnInit() {
    this.loadPriceLists();
  }

  loadPriceLists() {
    this.loading.set(true);
    this.priceListService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.priceLists.set(response.items);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar las listas de precios', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPriceLists();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadPriceLists();
  }

  create() {
    this.router.navigate(['/price-lists/new']);
  }

  edit(id: number) {
    this.router.navigate(['/price-lists/edit', id]);
  }

  delete(priceList: PriceList) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Lista de Precios',
        message: `¿Está seguro que desea eliminar la lista de precios "${priceList.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.priceListService.delete(priceList.id).subscribe({
          next: () => {
            this.snackBar.open('Lista de precios eliminada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadPriceLists();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error al eliminar la lista de precios', 'Cerrar', {
              duration: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }

  getScopeName(scope: number): string {
    switch(scope) {
      case 1: return 'Global';
      case 2: return 'Location';
      case 3: return 'Event';
      default: return 'Unknown';
    }
  }

  getStatusLabel(status: number): string {
    switch(status) {
      case 1: return 'Borrador';
      case 2: return 'Activo';
      case 3: return 'Archivado';
      default: return 'Desconocido';
    }
  }

  getStatusClass(status: number): string {
    switch(status) {
      case 1: return 'draft-chip';
      case 2: return 'active-chip';
      case 3: return 'archived-chip';
      default: return '';
    }
  }
}

