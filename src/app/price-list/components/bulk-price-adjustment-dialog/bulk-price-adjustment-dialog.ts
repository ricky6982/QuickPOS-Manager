import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export interface BulkPriceAdjustmentData {
  totalProducts: number;
  selectedProducts: number;
}

export interface BulkPriceAdjustmentResult {
  scope: 'all' | 'selected';
  operationType: 'increment' | 'decrement';
  value: number;
  valueType: 'percentage' | 'amount';
}

@Component({
  selector: 'app-bulk-price-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './bulk-price-adjustment-dialog.html',
  styleUrl: './bulk-price-adjustment-dialog.css'
})
export class BulkPriceAdjustmentDialogComponent {
  protected scope: 'all' | 'selected' = 'all';
  protected operationType: 'increment' | 'decrement' = 'increment';
  protected value: number = 0;
  protected valueType: 'percentage' | 'amount' = 'percentage';

  constructor(
    public dialogRef: MatDialogRef<BulkPriceAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkPriceAdjustmentData
  ) {
    // Si hay productos seleccionados, usar ese scope por defecto
    if (data.selectedProducts > 0) {
      this.scope = 'selected';
    }
  }

  get scopeLabel(): string {
    return this.scope === 'all'
      ? `Todos (${this.data.totalProducts})`
      : `Seleccionados (${this.data.selectedProducts})`;
  }

  get impactMessage(): string {
    const count = this.scope === 'all' ? this.data.totalProducts : this.data.selectedProducts;
    return `Se actualizará el precio de ${count} producto${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}.`;
  }

  get operationOptions() {
    return [
      { value: 'increment', label: 'Incremento (+)' },
      { value: 'decrement', label: 'Decremento (-)' }
    ];
  }

  setScope(scope: 'all' | 'selected') {
    this.scope = scope;
  }

  setValueType(type: 'percentage' | 'amount') {
    this.valueType = type;
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    if (!this.value || this.value <= 0) {
      return;
    }

    const result: BulkPriceAdjustmentResult = {
      scope: this.scope,
      operationType: this.operationType,
      value: this.value,
      valueType: this.valueType
    };

    this.dialogRef.close(result);
  }
}

