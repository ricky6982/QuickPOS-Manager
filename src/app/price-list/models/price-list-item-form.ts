export interface PriceListItemForm {
  productId: string;
  productName: string;
  currentPrice?: number;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

