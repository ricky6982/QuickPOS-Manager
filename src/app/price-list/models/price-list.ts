import { PriceListScope } from './price-list-scope';
import { PriceListStatus } from './price-list-status';
import { PriceListItem } from './price-list-item';

export interface PriceList {
  id: number;
  name: string;
  description?: string;
  scope: PriceListScope;
  status: PriceListStatus;
  organizerId: string;
  validFrom?: Date;
  validUntil?: Date;
  priority: number;
  items?: PriceListItem[];
}
