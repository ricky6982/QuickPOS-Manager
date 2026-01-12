import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PriceListService } from '../../services/price-list.service';
import { PriceListRequest, PriceListScope, PriceListStatus, PriceListItemForm } from '../../models';
import { OrganizerStateService } from '../../../organizer/services/organizer-state.service';
import { ProductSelectionDialogComponent, ProductSelectionData } from '../product-selection-dialog/product-selection-dialog';
import { BulkPriceAdjustmentDialogComponent, BulkPriceAdjustmentData, BulkPriceAdjustmentResult } from '../bulk-price-adjustment-dialog/bulk-price-adjustment-dialog';

@Component({
  selector: 'app-price-list-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './price-list-form.html',
  styleUrl: './price-list-form.css'
})
export class PriceListFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private priceListService = inject(PriceListService);
  private organizerStateService = inject(OrganizerStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected loading = signal(false);
  protected mode = signal<'create' | 'edit'>('create');
  protected priceListId = signal<number | null>(null);
  protected productItems = signal<PriceListItemForm[]>([]);

  displayedColumnsCreate = ['select', 'name', 'newPrice', 'actions'];
  displayedColumnsEdit = ['select', 'name', 'currentPrice', 'newPrice', 'variation', 'actions'];

  scopeOptions = [
    { value: PriceListScope.Global, label: 'Global' },
    { value: PriceListScope.Location, label: 'Location' },
    { value: PriceListScope.Event, label: 'Event' }
  ];

  statusOptions = [
    { value: PriceListStatus.Draft, label: 'Borrador' },
    { value: PriceListStatus.Active, label: 'Activo' },
    { value: PriceListStatus.Archived, label: 'Archivado' }
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: [''],
    scope: [PriceListScope.Global, [Validators.required]],
    status: [PriceListStatus.Draft, [Validators.required]],
    priority: [0, [Validators.required, Validators.min(0)]],
    validFrom: [null as Date | null],
    validUntil: [null as Date | null]
  }, { validators: this.dateRangeValidator });

  ngOnInit() {
    const organizerId = this.organizerStateService.selectedOrganizerId();
    if (!organizerId) {
      this.snackBar.open('Debe seleccionar un organizador primero', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/organizers']);
      return;
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.priceListId.set(+id);
        this.mode.set('edit');
        this.loadPriceList(+id);
      } else {
        this.mode.set('create');
      }
    });
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const validFrom = control.get('validFrom')?.value;
    const validUntil = control.get('validUntil')?.value;

    if (validFrom && validUntil && new Date(validFrom) > new Date(validUntil)) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  loadPriceList(id: number) {
    this.loading.set(true);
    this.priceListService.getById(id).subscribe({
      next: (priceList) => {
        this.form.patchValue({
          name: priceList.name,
          description: priceList.description,
          scope: priceList.scope,
          status: priceList.status,
          priority: priceList.priority,
          validFrom: priceList.validFrom ? new Date(priceList.validFrom) : null,
          validUntil: priceList.validUntil ? new Date(priceList.validUntil) : null
        });

        // Load existing items
        if (priceList.items && priceList.items.length > 0) {
          const items: PriceListItemForm[] = priceList.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            currentPrice: item.price,
            price: item.price,
            isAvailable: item.isAvailable,
            isSelected: false
          }));
          this.productItems.set(items);
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar la lista de precios', 'Cerrar', {
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

    const organizerId = this.organizerStateService.selectedOrganizerId();
    if (!organizerId) {
      this.snackBar.open('Debe seleccionar un organizador primero', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Validate that at least one product is added
    if (this.productItems().length === 0) {
      this.snackBar.open('Debe agregar al menos un producto a la lista de precios', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Validate that all products have valid prices
    const invalidPrices = this.productItems().filter(item => !item.price || item.price <= 0);
    if (invalidPrices.length > 0) {
      this.snackBar.open('Todos los productos deben tener un precio mayor a 0', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;

    const request: PriceListRequest = {
      id: this.priceListId(),
      name: formValue.name!,
      description: formValue.description || null,
      scope: formValue.scope!,
      status: formValue.status!,
      organizerId: organizerId,
      priority: formValue.priority!,
      validFrom: formValue.validFrom ? new Date(formValue.validFrom).toISOString() : null,
      validUntil: formValue.validUntil ? new Date(formValue.validUntil).toISOString() : null,
      items: this.productItems().map(item => ({
        productId: item.productId,
        price: item.price,
        isAvailable: item.isAvailable
      }))
    };

    const operation = this.mode() === 'create'
      ? this.priceListService.create(request)
      : this.priceListService.update(this.priceListId()!, request);

    operation.subscribe({
      next: () => {
        const message = this.mode() === 'create'
          ? 'Lista de precios creada exitosamente'
          : 'Lista de precios actualizada exitosamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/price-lists']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al guardar la lista de precios', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/price-lists']);
  }

  get titleText(): string {
    return this.mode() === 'create' ? 'Crear Lista de Precios' : 'Editar Lista de Precios';
  }

  get submitButtonText(): string {
    return this.mode() === 'create' ? 'Crear' : 'Actualizar';
  }

  // Product management methods
  openProductDialog() {
    const dialogRef = this.dialog.open(ProductSelectionDialogComponent, {
      width: '900px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: ProductSelectionData[]) => {
      if (result && result.length > 0) {
        const currentItems = [...this.productItems()];

        // Filter out duplicates
        const newItems = result.filter(r =>
          !currentItems.some(item => item.productId === r.productId)
        );

        // Add new items
        const itemsToAdd: PriceListItemForm[] = newItems.map(data => ({
          productId: data.productId,
          productName: data.productName,
          currentPrice: this.mode() === 'edit' ? 0 : undefined,
          price: data.price,
          isAvailable: true,
          isSelected: false
        }));

        this.productItems.set([...currentItems, ...itemsToAdd]);

        this.snackBar.open(`${newItems.length} producto(s) agregado(s)`, 'Cerrar', {
          duration: 2000
        });
      }
    });
  }

  removeProduct(productId: string) {
    const items = this.productItems().filter(item => item.productId !== productId);
    this.productItems.set(items);

    this.snackBar.open('Producto eliminado', 'Cerrar', {
      duration: 2000
    });
  }

  toggleProductSelection(productId: string) {
    const items = this.productItems().map(item => {
      if (item.productId === productId) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });
    this.productItems.set(items);
  }

  onPriceChange(productId: string, newPrice: number) {
    const items = [...this.productItems()];
    const itemIndex = items.findIndex(item => item.productId === productId);

    if (itemIndex !== -1) {
      items[itemIndex] = { ...items[itemIndex], price: newPrice };
      this.productItems.set(items);
    }
  }

  calculateVariation(currentPrice: number | undefined, newPrice: number): string {
    if (!currentPrice || currentPrice === 0) {
      return 'N/A';
    }

    const variation = ((newPrice - currentPrice) / currentPrice) * 100;
    const sign = variation >= 0 ? '+' : '';
    return `${sign}${variation.toFixed(2)}%`;
  }

  getVariationClass(currentPrice: number | undefined, newPrice: number): string {
    if (!currentPrice || currentPrice === 0) {
      return '';
    }

    if (newPrice > currentPrice) {
      return 'variation-positive';
    } else if (newPrice < currentPrice) {
      return 'variation-negative';
    }
    return 'variation-neutral';
  }

  get productCount(): number {
    return this.productItems().length;
  }

  get displayedColumns(): string[] {
    return this.mode() === 'create' ? this.displayedColumnsCreate : this.displayedColumnsEdit;
  }

  get selectedProductCount(): number {
    return this.productItems().filter(item => item.isSelected).length;
  }

  openBulkPriceAdjustmentDialog() {
    const selectedCount = this.selectedProductCount;

    const dialogRef = this.dialog.open(BulkPriceAdjustmentDialogComponent, {
      width: '600px',
      disableClose: false,
      data: {
        totalProducts: this.productItems().length,
        selectedProducts: selectedCount
      } as BulkPriceAdjustmentData
    });

    dialogRef.afterClosed().subscribe((result: BulkPriceAdjustmentResult) => {
      if (result) {
        this.applyBulkPriceAdjustment(result);
      }
    });
  }

  applyBulkPriceAdjustment(adjustment: BulkPriceAdjustmentResult) {
    const items = [...this.productItems()];
    let updatedCount = 0;

    const itemsToUpdate = adjustment.scope === 'all'
      ? items
      : items.filter(item => item.isSelected);

    itemsToUpdate.forEach(item => {
      let newPrice = item.price;

      if (adjustment.valueType === 'percentage') {
        // Ajuste por porcentaje
        if (adjustment.operationType === 'increment') {
          newPrice = item.price * (1 + adjustment.value / 100);
        } else {
          newPrice = item.price * (1 - adjustment.value / 100);
        }
      } else {
        // Ajuste por monto fijo
        if (adjustment.operationType === 'increment') {
          newPrice = item.price + adjustment.value;
        } else {
          newPrice = item.price - adjustment.value;
        }
      }

      // Asegurar que el precio no sea negativo
      newPrice = Math.max(0, newPrice);

      // Redondear a 2 decimales
      newPrice = Math.round(newPrice * 100) / 100;

      item.price = newPrice;
      updatedCount++;
    });

    this.productItems.set(items);

    this.snackBar.open(
      `Precios actualizados para ${updatedCount} producto(s)`,
      'Cerrar',
      { duration: 3000 }
    );
  }
}

