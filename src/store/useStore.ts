import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Product, CutOption, CartItem, Order, DeliveryMode, MeatCategory, InventoryItem, OrderStatus } from '../types';
import { LocationData } from '../types/location';
import { PRODUCTS } from '../data/mockData';
import {
  syncPlaceOrder,
  syncUpdateOrderStatus,
  syncToggleStock,
  syncUpdateStockKg,
} from '../services/realtimeSync';

interface StoreState {
  cart: CartItem[];
  deliveryMode: DeliveryMode;
  selectedAddress: string;
  currentLocation: LocationData;
  savedAddresses: LocationData[];
  isLocationModalOpen: boolean;
  searchQuery: string;
  selectedCategory: MeatCategory;
  customizerProduct: Product | null;
  orders: Order[];
  activeOrder: Order | null;
  coldPackagingEnabled: boolean;
  orderFulfillment: 'delivery' | 'takeaway';
  wishlist: string[];
  inventory: Record<string, InventoryItem>;

  // Actions
  addToCart: (product: Product, cut: CutOption, isSkinless: boolean, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  setOrderFulfillment: (fulfillment: 'delivery' | 'takeaway') => void;
  setSelectedAddress: (address: string) => void;
  setCurrentLocation: (location: LocationData) => void;
  setLocationModalOpen: (open: boolean) => void;
  addSavedAddress: (address: LocationData) => void;
  removeSavedAddress: (shortOrFullAddress: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: MeatCategory) => void;
  setCustomizerProduct: (product: Product | null) => void;
  setColdPackagingEnabled: (enabled: boolean) => void;
  placeOrder: (paymentMethod: 'UPI' | 'Cash on Delivery' | 'Card', deliveryNote?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, temp?: number) => void;
  cancelOrder: (orderId: string) => void;
  assignRider: (orderId: string, riderName: string, riderPhone: string) => void;
  toggleStock: (productId: string) => void;
  updateStockKg: (productId: string, stockKg: number) => void;
  updateProductPrice: (productId: string, basePrice: number, originalPrice?: number) => void;
  toggleCutStock: (productId: string, cutId: string) => void;

  // Computed values
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  getCartNetWeightGrams: () => number;
  getCartGrossWeightGrams: () => number;
  getCartItemsCount: () => number;
}

const INITIAL_SAVED_ADDRESSES: LocationData[] = [
  {
    shortAddress: 'Khandel Road',
    fullAddress:
      'Roop Vihar, 4523+VFV, Khandel Rd, Ashok Nagar, Sarkanda, Bilaspur, Chhattisgarh 495006, India',
    city: 'Bilaspur',
    state: 'Chhattisgarh',
    postalCode: '495006',
    coords: { latitude: 22.0797, longitude: 82.1409 },
    isServiceable: true,
    nearestHubName: 'Bilaspur Butchery Hub (Sarkanda)',
    distanceKm: 0.8,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Home',
  },
  {
    shortAddress: 'Jivan Vihar',
    fullAddress:
      'Abc, Magneto Mall, 229/14 & 230/10, Great Eastern Rd, Jivan Vihar, Raipur, Chhattisgarh 492001, India',
    city: 'Raipur',
    state: 'Chhattisgarh',
    postalCode: '492001',
    coords: { latitude: 21.2435, longitude: 81.6748 },
    isServiceable: true,
    nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
    distanceKm: 15,
    deliveryEta: '15-20 Mins',
    tag: 'Work',
  },
  {
    shortAddress: 'Other (Varanasi)',
    fullAddress:
      'House 1, Mohanpuri Colony, Karaundi, Varanasi, Uttar Pradesh 221005, India',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    postalCode: '221005',
    coords: { latitude: 25.2677, longitude: 82.9913 },
    isServiceable: false,
    nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
    distanceKm: 476,
    deliveryEta: 'Expanding Soon',
    tag: 'Other',
  },
  {
    shortAddress: 'Civil Lines, Raipur',
    fullAddress: 'LK Corporate Tower, Civil Lines, Raipur, Chhattisgarh 492001',
    city: 'Raipur',
    state: 'Chhattisgarh',
    postalCode: '492001',
    coords: { latitude: 21.2514, longitude: 81.6296 },
    isServiceable: true,
    nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
    distanceKm: 0.4,
    deliveryEta: '15-20 Mins',
    tag: 'Work',
  },
  {
    shortAddress: 'Bellandur, Bengaluru',
    fullAddress: 'Flat 402, Green Glen Orchid, Bellandur, Bengaluru 560103',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560103',
    coords: { latitude: 12.9304, longitude: 77.6784 },
    isServiceable: true,
    nearestHubName: 'Bengaluru East Express Hub',
    distanceKm: 1.8,
    deliveryEta: '15-20 Mins',
    tag: 'Home',
  },
];

// Universal Storage Adapter for Web & Mobile Native
const universalStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
      await AsyncStorage.setItem(name, value);
    } catch {}
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
        return;
      }
      await AsyncStorage.removeItem(name);
    } catch {}
  },
};

// Immediate synchronous retrieval for Web to avoid flash of default address
const getInitialStoredState = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('magicmeat-store-persist');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
          return parsed.state;
        }
      }
    } catch {}
  }
  return null;
};

export const INITIAL_INVENTORY: Record<string, InventoryItem> = {
  c1: { productId: 'c1', inStock: true, stockKg: 45, availableCutIds: ['curry-medium', 'biryani-large', 'boneless-cubes', 'fine-keema'] },
  c2: { productId: 'c2', inStock: true, stockKg: 25, availableCutIds: ['boneless-cubes'] },
  c3: { productId: 'c3', inStock: true, stockKg: 20, availableCutIds: ['curry-medium'] },
  c4: { productId: 'c4', inStock: true, stockKg: 30, availableCutIds: ['curry-medium', 'biryani-large'] },
  c5: { productId: 'c5', inStock: true, stockKg: 25, availableCutIds: ['biryani-large'] },
  c6: { productId: 'c6', inStock: true, stockKg: 35, availableCutIds: ['biryani-large'] },
  c7: { productId: 'c7', inStock: true, stockKg: 28, availableCutIds: ['boneless-cubes'] },
  m1: { productId: 'm1', inStock: true, stockKg: 35, availableCutIds: ['mutton-curry', 'mutton-biryani'] },
  m2: { productId: 'm2', inStock: true, stockKg: 20, availableCutIds: ['mutton-biryani'] },
  m3: { productId: 'm3', inStock: true, stockKg: 25, availableCutIds: ['mutton-curry'] },
  m4: { productId: 'm4', inStock: true, stockKg: 18, availableCutIds: ['mutton-biryani'] },
  m5: { productId: 'm5', inStock: true, stockKg: 15, availableCutIds: ['mutton-curry'] },
  f1: { productId: 'f1', inStock: true, stockKg: 30, availableCutIds: ['fish-curry-steaks'] },
  f2: { productId: 'f2', inStock: true, stockKg: 25, availableCutIds: ['fish-curry-steaks'] },
  e1: { productId: 'e1', inStock: true, stockKg: 60, availableCutIds: ['standard-egg-pack'] },
  e2: { productId: 'e2', inStock: true, stockKg: 80, availableCutIds: ['standard-egg-pack'] },
  e3: { productId: 'e3', inStock: true, stockKg: 50, availableCutIds: ['standard-egg-pack'] },
  v1: { productId: 'v1', inStock: true, stockKg: 100, availableCutIds: ['standard-produce-pack'] },
  v2: { productId: 'v2', inStock: true, stockKg: 100, availableCutIds: ['standard-produce-pack'] },
  v3: { productId: 'v3', inStock: true, stockKg: 100, availableCutIds: ['standard-produce-pack'] },
  v4: { productId: 'v4', inStock: true, stockKg: 50, availableCutIds: ['standard-produce-pack'] },
  v5: { productId: 'v5', inStock: true, stockKg: 50, availableCutIds: ['standard-produce-pack'] },
  v6: { productId: 'v6', inStock: true, stockKg: 50, availableCutIds: ['standard-produce-pack'] },
  fr1: { productId: 'fr1', inStock: true, stockKg: 40, availableCutIds: ['standard-produce-pack'] },
  fr2: { productId: 'fr2', inStock: true, stockKg: 40, availableCutIds: ['standard-produce-pack'] },
  fr3: { productId: 'fr3', inStock: true, stockKg: 40, availableCutIds: ['standard-produce-pack'] },
  fr4: { productId: 'fr4', inStock: true, stockKg: 30, availableCutIds: ['standard-produce-pack'] },
  fr5: { productId: 'fr5', inStock: true, stockKg: 30, availableCutIds: ['standard-produce-pack'] },
  rtc1: { productId: 'rtc1', inStock: true, stockKg: 20, availableCutIds: ['curry-medium'] },
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'MM-849201',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98234 11200',
    address: 'Flat 402, Royal Palms, Sector 24, Atal Nagar, Raipur',
    items: [
      {
        cartItemId: 'item-1',
        product: PRODUCTS[0],
        selectedCut: PRODUCTS[0].availableCuts[0],
        isSkinless: true,
        quantity: 2,
        unitPrice: 179,
      },
      {
        cartItemId: 'item-2',
        product: PRODUCTS[1],
        selectedCut: PRODUCTS[1].availableCuts[0],
        isSkinless: true,
        quantity: 1,
        unitPrice: 475,
      },
    ],
    deliveryMode: 'instant',
    slotLabel: '⚡ Instant Express (22 mins)',
    subtotal: 833,
    deliveryFee: 0,
    coldPackagingFee: 15,
    discount: 0,
    total: 848,
    status: 'placed',
    currentTempCelsius: 2.1,
    sensorBatteryPercent: 98,
    riderName: 'Vikram Singh',
    riderPhone: '+91 98765 43210',
    placedAt: '12 mins ago',
    eta: '18 mins',
    paymentMethod: 'UPI',
  },
  {
    id: 'MM-849195',
    customerName: 'Pooja Verma',
    customerPhone: '+91 94060 22345',
    address: 'B-14, Green Valley, Naya Raipur, Chhattisgarh',
    items: [
      {
        cartItemId: 'item-3',
        product: PRODUCTS[5] || PRODUCTS[0],
        selectedCut: PRODUCTS[0].availableCuts[0],
        isSkinless: true,
        quantity: 1,
        unitPrice: 229,
      },
    ],
    deliveryMode: 'instant',
    slotLabel: '⚡ Instant Express (25 mins)',
    subtotal: 229,
    deliveryFee: 35,
    coldPackagingFee: 15,
    discount: 0,
    total: 279,
    status: 'butcher_prepping',
    currentTempCelsius: 2.3,
    sensorBatteryPercent: 94,
    riderName: 'Amit Sahu',
    riderPhone: '+91 91234 56789',
    placedAt: '25 mins ago',
    eta: '15 mins',
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'MM-849182',
    customerName: 'Amit Patel',
    customerPhone: '+91 99887 76655',
    address: 'C-702, Smart City Heights, Atal Nagar, Raipur',
    items: [
      {
        cartItemId: 'item-4',
        product: PRODUCTS[2] || PRODUCTS[0],
        selectedCut: PRODUCTS[0].availableCuts[0],
        isSkinless: true,
        quantity: 2,
        unitPrice: 239,
      },
    ],
    deliveryMode: 'instant',
    slotLabel: '⚡ Instant Express',
    subtotal: 478,
    deliveryFee: 0,
    coldPackagingFee: 15,
    discount: 0,
    total: 493,
    status: 'out_for_delivery',
    currentTempCelsius: 2.6,
    sensorBatteryPercent: 90,
    riderName: 'Rajesh Kumar',
    riderPhone: '+91 98765 12345',
    placedAt: '40 mins ago',
    eta: '8 mins',
    paymentMethod: 'UPI',
  },
  {
    id: 'MM-849150',
    customerName: 'Sunil Dewangan',
    customerPhone: '+91 97555 44332',
    address: 'House 55, Near IIIT Campus, Atal Nagar',
    items: [
      {
        cartItemId: 'item-5',
        product: PRODUCTS[0],
        selectedCut: PRODUCTS[0].availableCuts[0],
        isSkinless: true,
        quantity: 1,
        unitPrice: 179,
      },
    ],
    deliveryMode: 'instant',
    slotLabel: 'Delivered',
    subtotal: 179,
    deliveryFee: 35,
    coldPackagingFee: 15,
    discount: 0,
    total: 229,
    status: 'delivered',
    currentTempCelsius: 2.5,
    sensorBatteryPercent: 88,
    riderName: 'Vikram Singh',
    riderPhone: '+91 98765 43210',
    placedAt: '2 hours ago',
    eta: 'Delivered at 03:45 PM',
    paymentMethod: 'UPI',
  },
];

const preloadedState = getInitialStoredState();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: preloadedState?.cart || [],
      deliveryMode: preloadedState?.deliveryMode || 'instant',
      selectedAddress:
        preloadedState?.selectedAddress ||
        preloadedState?.currentLocation?.fullAddress ||
        INITIAL_SAVED_ADDRESSES[0].fullAddress,
      currentLocation: preloadedState?.currentLocation || INITIAL_SAVED_ADDRESSES[0],
      savedAddresses: preloadedState?.savedAddresses || INITIAL_SAVED_ADDRESSES,
      isLocationModalOpen: false,
      searchQuery: '',
      selectedCategory: 'all',
      customizerProduct: null,
      orders: preloadedState?.orders && preloadedState.orders.length > 0 ? preloadedState.orders : INITIAL_ORDERS,
      activeOrder: null,
      coldPackagingEnabled: true,
      orderFulfillment: preloadedState?.orderFulfillment || 'delivery',
      wishlist: preloadedState?.wishlist || [],
      inventory: preloadedState?.inventory || INITIAL_INVENTORY,
      toggleStock: (productId: string) => {
        syncToggleStock(productId);
        set((state) => {
          const current = state.inventory[productId] || {
            productId,
            inStock: true,
            stockKg: 20,
            availableCutIds: [],
          };
          return {
            inventory: {
              ...state.inventory,
              [productId]: {
                ...current,
                inStock: !current.inStock,
              },
            },
          };
        });
      },

      updateStockKg: (productId: string, stockKg: number) => {
        syncUpdateStockKg(productId, stockKg);
        set((state) => {
          const current = state.inventory[productId] || {
            productId,
            inStock: true,
            stockKg: 20,
            availableCutIds: [],
          };
          return {
            inventory: {
              ...state.inventory,
              [productId]: {
                ...current,
                stockKg: Math.max(0, stockKg),
                inStock: stockKg > 0,
              },
            },
          };
        });
      },

      updateProductPrice: (productId: string, basePrice: number, originalPrice?: number) => {
        set((state) => {
          const current = state.inventory[productId] || {
            productId,
            inStock: true,
            stockKg: 20,
            availableCutIds: [],
          };
          return {
            inventory: {
              ...state.inventory,
              [productId]: {
                ...current,
                basePrice,
                originalPrice,
              },
            },
          };
        });
      },

      toggleCutStock: (productId: string, cutId: string) => {
        set((state) => {
          const current = state.inventory[productId] || {
            productId,
            inStock: true,
            stockKg: 20,
            availableCutIds: [],
          };
          const exists = current.availableCutIds.includes(cutId);
          const nextCutIds = exists
            ? current.availableCutIds.filter((c) => c !== cutId)
            : [...current.availableCutIds, cutId];
          return {
            inventory: {
              ...state.inventory,
              [productId]: {
                ...current,
                availableCutIds: nextCutIds,
              },
            },
          };
        });
      },

      cancelOrder: (orderId: string) => {
        syncUpdateOrderStatus(orderId, 'cancelled');
        set((state) => {
          const update = (order: Order) =>
            order.id === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order;
          return {
            orders: state.orders.map(update),
            activeOrder: state.activeOrder && state.activeOrder.id === orderId ? update(state.activeOrder) : state.activeOrder,
          };
        });
      },

      assignRider: (orderId: string, riderName: string, riderPhone: string) => {
        set((state) => {
          const update = (order: Order) =>
            order.id === orderId ? { ...order, riderName, riderPhone, status: 'out_for_delivery' as OrderStatus } : order;
          return {
            orders: state.orders.map(update),
            activeOrder: state.activeOrder && state.activeOrder.id === orderId ? update(state.activeOrder) : state.activeOrder,
          };
        });
      },

      toggleWishlist: (productId: string) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      setOrderFulfillment: (orderFulfillment) => set({ orderFulfillment }),

      setCurrentLocation: (location: LocationData) => {
        // Immediate sync to localStorage on web
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          try {
            const raw = window.localStorage.getItem('magicmeat-store-persist');
            const parsed = raw ? JSON.parse(raw) : { state: {} };
            parsed.state = {
              ...parsed.state,
              currentLocation: location,
              selectedAddress: location.fullAddress,
            };
            window.localStorage.setItem('magicmeat-store-persist', JSON.stringify(parsed));
          } catch {}
        }

        set({
          currentLocation: location,
          selectedAddress: location.fullAddress,
        });
      },

  setLocationModalOpen: (open: boolean) => set({ isLocationModalOpen: open }),

  addSavedAddress: (address: LocationData) =>
    set((state) => ({
      savedAddresses: [
        address,
        ...state.savedAddresses.filter(
          (a) => a.shortAddress !== address.shortAddress && a.fullAddress !== address.fullAddress
        ),
      ],
    })),

  removeSavedAddress: (shortOrFullAddress: string) =>
    set((state) => ({
      savedAddresses: state.savedAddresses.filter(
        (a) =>
          a.shortAddress !== shortOrFullAddress &&
          a.fullAddress !== shortOrFullAddress
      ),
    })),

  addToCart: (product, cut, isSkinless, quantity = 1) => {
    const cartItemId = `${product.id}-${cut.id}-${isSkinless ? 'skinless' : 'withskin'}`;
    const unitPrice = product.basePrice + cut.priceDelta;

    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...state.cart];
        updated[existingIndex].quantity += quantity;
        return { cart: updated };
      }
      return {
        cart: [
          ...state.cart,
          {
            cartItemId,
            product,
            selectedCut: cut,
            isSkinless,
            quantity,
            unitPrice,
          },
        ],
      };
    });
  },

  removeFromCart: (cartItemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, delta) => {
    set((state) => {
      const updated = state.cart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { cart: updated };
    });
  },

  clearCart: () => set({ cart: [] }),
  setDeliveryMode: (mode) => set({ deliveryMode: mode }),
  setSelectedAddress: (selectedAddress) => set({ selectedAddress }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setCustomizerProduct: (customizerProduct) => set({ customizerProduct }),
  setColdPackagingEnabled: (coldPackagingEnabled) => set({ coldPackagingEnabled }),

  getCartSubtotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getCartTotal: () => {
    const state = get();
    const subtotal = state.getCartSubtotal();
    if (subtotal === 0) return 0;
    const deliveryFee = state.orderFulfillment === 'delivery' && subtotal < 299 ? 35 : 0;
    const packagingFee = state.coldPackagingEnabled ? 15 : 0;
    return subtotal + deliveryFee + packagingFee;
  },

  getCartItemsCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  getCartNetWeightGrams: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => {
      const match = item.selectedCut.netWeight.match(/(\d+)g/);
      const grams = match ? parseInt(match[1], 10) : 500;
      return sum + grams * item.quantity;
    }, 0);
  },

  getCartGrossWeightGrams: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => {
      const match = item.selectedCut.grossWeight.match(/(\d+)g/);
      const grams = match ? parseInt(match[1], 10) : 600;
      return sum + grams * item.quantity;
    }, 0);
  },

  placeOrder: (paymentMethod, deliveryNote) => {
    const state = get();
    const subtotal = state.getCartSubtotal();
    const deliveryFee = state.orderFulfillment === 'delivery' && subtotal < 299 ? 35 : 0;
    const packagingFee = state.coldPackagingEnabled ? 15 : 0;
    const total = subtotal + deliveryFee + packagingFee;

    const newOrder: Order = {
      id: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...state.cart],
      deliveryMode: state.deliveryMode,
      slotLabel:
        state.deliveryMode === 'instant'
          ? '⚡ Instant Express (22 mins)'
          : state.deliveryMode === 'sunday_morning'
          ? '🌅 Sunday Morning (7:00 AM - 9:00 AM)'
          : '📦 Today (5:00 PM - 7:00 PM)',
      subtotal,
      deliveryFee,
      coldPackagingFee: packagingFee,
      discount: 0,
      total,
      status: 'placed',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta: state.deliveryMode === 'instant' ? '22 mins' : 'Sunday 8:00 AM',
      address: state.selectedAddress,
      deliveryNote: deliveryNote?.trim() || undefined,
      paymentMethod,
    };

    set((s) => ({
      cart: [],
      activeOrder: newOrder,
      orders: [newOrder, ...s.orders],
    }));

    syncPlaceOrder(newOrder);

    return newOrder;
  },

  updateOrderStatus: (orderId, status, temp) => {
    syncUpdateOrderStatus(orderId, status);
    set((state) => {
      const updateOrder = (order: Order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status,
          currentTempCelsius: temp !== undefined ? temp : order.currentTempCelsius,
        };
      };

      return {
        activeOrder: state.activeOrder ? updateOrder(state.activeOrder) : null,
        orders: state.orders.map(updateOrder),
      };
    });
  },
}),
    {
      name: 'magicmeat-store-persist',
      storage: createJSONStorage(() => universalStorage),
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        selectedAddress: state.selectedAddress,
        savedAddresses: state.savedAddresses,
        orderFulfillment: state.orderFulfillment,
        deliveryMode: state.deliveryMode,
        cart: state.cart,
        orders: state.orders,
        wishlist: state.wishlist,
        inventory: state.inventory,
      }),
    }
  )
);
