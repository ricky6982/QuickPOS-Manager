import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() set totalItems(value: number) {
    this._totalItems.set(value);
  }
  @Input() set pageSize(value: number) {
    this._pageSize.set(value);
  }
  @Input() set currentPage(value: number) {
    this._currentPage.set(value);
  }
  @Output() pageChange = new EventEmitter<number>();
  private _totalItems = signal(0);
  private _pageSize = signal(10);
  private _currentPage = signal(1);
  protected totalPages = computed(() => {
    const total = this._totalItems();
    const size = this._pageSize();
    return Math.ceil(total / size);
  });
  protected hasPrevious = computed(() => this._currentPage() > 1);
  protected hasNext = computed(() => this._currentPage() < this.totalPages());
  protected get currentPageValue() {
    return this._currentPage();
  }
  protected get totalPagesValue() {
    return this.totalPages();
  }
  protected get totalItemsValue() {
    return this._totalItems();
  }
  protected get pageSizeValue() {
    return this._pageSize();
  }
  previousPage() {
    if (this.hasPrevious()) {
      this.pageChange.emit(this._currentPage() - 1);
    }
  }
  nextPage() {
    if (this.hasNext()) {
      this.pageChange.emit(this._currentPage() + 1);
    }
  }
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
