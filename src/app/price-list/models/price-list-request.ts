import { PriceListItemRequest } from './price-list-item-request';

export interface PriceListRequest {
  id: number | null;
  name: string;
  description: string | null;
  scope: number;
  status: number;
  organizerId: string;
  validFrom: string | null;
  validUntil: string | null;
  priority: number;
  items?: PriceListItemRequest[];
}

