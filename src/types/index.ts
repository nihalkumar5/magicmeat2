export type MeatCategory = 'all' | 'chicken' | 'mutton' | 'fish' | 'ready-to-cook' | 'eggs' | 'curry-cuts' | 'fresh-produce';

export interface MacroBreakdown {
  calories: number; // per 100g
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface CutOption {
  id: string;
  name: string;
  description: string;
  grossWeight: string;
  netWeight: string;
  pieces: string;
  bestFor: string;
  priceDelta: number;
  allowsSkinOption: boolean;
  macros?: MacroBreakdown;
}

export interface Product {
  id: string;
  name: string;
  hindiTitle?: string;
  category: 'chicken' | 'mutton' | 'fish' | 'ready-to-cook' | 'eggs' | 'fresh-produce';
  description: string;
  image: string;
  badge?: string;
  basePrice: number;
  originalPrice?: number;
  grossWeight: string;
  netWeight: string;
  pieces: string;
  serves: string;
  temperature: string;
  farmOrigin: string;
  halalCertified: boolean;
  antibioticFree: boolean;
  availableCuts: CutOption[];
  rating: number;
  reviewsCount: number;
  macros: MacroBreakdown; // Cal AI macro counter integration
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedCut: CutOption;
  isSkinless: boolean;
  quantity: number;
  unitPrice: number;
}

export interface RecipeKit {
  id: string;
  title: string;
  hindiSubtitle: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Gourmet';
  servings: string;
  image: string;
  description: string;
  bundlePrice: number;
  originalPrice: number;
  mainMeatId: string;
  meatCutName: string;
  kitItems: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  totalMacros: MacroBreakdown;
}

export type DeliveryMode = 'instant' | 'sunday_morning' | 'slot';

export interface InventoryItem {
  productId: string;
  inStock: boolean;
  stockKg: number;
  availableCutIds: string[];
  basePrice?: number;
  originalPrice?: number;
}

export type OrderStatus =
  | 'placed'
  | 'butcher_prepping'
  | 'cold_packed'
  | 'rider_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  deliveryMode: DeliveryMode;
  slotLabel: string;
  subtotal: number;
  deliveryFee: number;
  coldPackagingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  currentTempCelsius?: number;
  sensorBatteryPercent?: number;
  riderName?: string;
  riderPhone?: string;
  placedAt: string;
  eta: string;
  address: string;
  deliveryNote?: string;
  paymentMethod: 'UPI' | 'Cash on Delivery' | 'Card';
  customerName?: string;
  customerPhone?: string;
}
