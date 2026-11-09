import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { PRODUCTS } from '../../data/mockData';
import { useStore } from '../../store/useStore';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { StatusBar } from 'expo-status-bar';
import {
  AppIcon,
  ArrowLeft01Icon,
  ShoppingCart01Icon,
  StarIcon,
  PlusSignIcon,
  MinusSignIcon,
  DeliveryTruck01Icon,
  FavouriteIcon,
} from '../../components/HugeIcon';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    addToCart,
    getCartItemsCount,
    wishlist,
    toggleWishlist,
    cart,
    updateQuantity,
    inventory,
  } = useStore();
  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  }, [id]);

  const invItem = inventory[product.id];
  const isOutOfStock = invItem ? !invItem.inStock || invItem.stockKg <= 0 : false;
  const [notified, setNotified] = useState(false);

  // Pack size / cut variants
  const packVariants = useMemo(() => {
    const baseP = product.basePrice;
    const origP = product.originalPrice || Math.round(baseP * 1.25);
    return [
      {
        id: 'pack-500g',
        label: '500 g',
        netWeight: '500g',
        pieces: '12-14 pieces',
        pieceSize: 'Approx. 40 g',
        serves: '2–3 people',
        includes: 'Wings, Neck pieces, Drumstick chopped',
        price: baseP,
        originalPrice: origP,
        inStock: !isOutOfStock,
      },
      {
        id: 'pack-1kg',
        label: '1 kg',
        netWeight: '1000g',
        pieces: '24-28 pieces',
        pieceSize: 'Approx. 40 g',
        serves: '4–6 people',
        includes: 'Wings, Breasts, Thighs, Drumsticks',
        price: Math.round(baseP * 1.9),
        originalPrice: Math.round(origP * 1.95),
        inStock: !isOutOfStock,
      },
      {
        id: 'pack-1500g',
        label: '1.5 kg',
        netWeight: '1500g',
        pieces: '36-40 pieces',
        pieceSize: 'Approx. 40 g',
        serves: '6–8 people',
        includes: 'Full family cuts with prime portions',
        price: Math.round(baseP * 2.8),
        originalPrice: Math.round(origP * 2.85),
        inStock: !isOutOfStock,
      },
    ];
  }, [product, isOutOfStock]);

  const [selectedPackId, setSelectedPackId] = useState<string>(packVariants[0].id);
  const selectedPack = packVariants.find((p) => p.id === selectedPackId) || packVariants[0];

  const cartItem = cart.find((item) => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const cartCount = getCartItemsCount();
  const isLiked = wishlist.includes(product.id);

  const unitPrice = selectedPack.price;
  const originalPrice = selectedPack.originalPrice;
  const savings = originalPrice - unitPrice;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleAddToCart = () => {
    const cutOption = product.availableCuts?.[0] || {
      id: selectedPack.id,
      name: selectedPack.label,
      priceModifier: 0,
      description: selectedPack.includes,
      cookingRecommendation: 'All dishes',
    };
    addToCart(product, cutOption, true, 1);
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, 1);
    } else {
      handleAddToCart();
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, -1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.screenContainer}>
        {/* Floating Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circularBtn}
            onPress={handleGoBack}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <AppIcon icon={ArrowLeft01Icon} size={20} color="#171717" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[styles.circularBtn, isLiked && styles.circularBtnLiked]}
              onPress={() => toggleWishlist(product.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Wishlist"
            >
              <AppIcon
                icon={FavouriteIcon}
                size={18}
                color={isLiked ? '#E52329' : '#171717'}
                strokeWidth={2.2}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circularBtn}
              onPress={() => router.push('/(tabs)/cart')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cart"
            >
              <AppIcon icon={ShoppingCart01Icon} size={18} color="#171717" strokeWidth={2} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* 1. Hero Image Container with Non-Veg Badge */}
          <View style={styles.heroWrapper}>
            <Image
              source={{ uri: optimizeImageUrl(product.image, 720) }}
              style={styles.heroImage}
              resizeMode="cover"
              fadeDuration={0}
            />
            {/* Non-Veg Badge on bottom-left */}
            <View style={styles.nonVegBadge}>
              <View style={styles.nonVegBox}>
                <View style={styles.nonVegDot} />
              </View>
            </View>
          </View>

          {/* 2. Content Body */}
          <View style={styles.contentBody}>
            {/* Delivery Time & Best Seller Badge Row */}
            <View style={styles.badgeRow}>
              <View style={styles.deliveryBadge}>
                <AppIcon icon={DeliveryTruck01Icon} size={15} color="#15803D" strokeWidth={2.2} />
                <Text style={styles.deliveryBadgeText}>Express · 45 minutes</Text>
              </View>

              <View style={styles.bestsellerPill}>
                <AppIcon icon={StarIcon} size={12} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.bestsellerPillText}>Best Seller</Text>
              </View>
            </View>

            {/* Product Title */}
            <Text style={styles.productTitle}>{product.name}</Text>
            {product.hindiTitle && (
              <Text style={styles.hindiTitle}>{product.hindiTitle}</Text>
            )}

            {/* Pack Size / Weight Selector Cards (Lazizia 3-Card Layout) */}
            <View style={styles.packSelectorRow}>
              {packVariants.map((pack) => {
                const isSelected = pack.id === selectedPack.id;
                return (
                  <TouchableOpacity
                    key={pack.id}
                    style={[
                      styles.packCard,
                      isSelected && styles.packCardSelected,
                    ]}
                    onPress={() => setSelectedPackId(pack.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.packCardLabel,
                        isSelected && styles.packCardLabelSelected,
                      ]}
                    >
                      {pack.label}
                    </Text>
                    <View style={styles.packPriceRow}>
                      <Text style={styles.packPrice}>₹{pack.price}</Text>
                      {pack.originalPrice > pack.price && (
                        <Text style={styles.packMrp}>₹{pack.originalPrice}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.packStockText,
                        !pack.inStock && styles.packStockTextOutOfStock,
                        isSelected && pack.inStock && styles.packStockTextSelected,
                      ]}
                    >
                      {pack.inStock ? 'In stock' : 'Out of stock'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Lazizia Style 6-Column Specification Table */}
            <View style={styles.specTableContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.specTable}>
                  {/* Table Header Row */}
                  <View style={styles.tableHeaderRow}>
                    <View style={[styles.tableCol, { width: 85 }]}>
                      <Text style={styles.colHeaderTitle}>Net Weight</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 90 }]}>
                      <Text style={styles.colHeaderTitle}>Cut style</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 85 }]}>
                      <Text style={styles.colHeaderTitle}>Piece size</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 80 }]}>
                      <Text style={styles.colHeaderTitle}>Serves</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 140 }]}>
                      <Text style={styles.colHeaderTitle}>Includes</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 150 }]}>
                      <Text style={styles.colHeaderTitle}>Storage</Text>
                    </View>
                  </View>

                  {/* Table Value Row */}
                  <View style={styles.tableValueRow}>
                    <View style={[styles.tableCol, { width: 85 }]}>
                      <Text style={styles.colValueText}>{selectedPack.netWeight}</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 90 }]}>
                      <Text style={styles.colValueText}>Curry Cut</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 85 }]}>
                      <Text style={styles.colValueText}>{selectedPack.pieceSize}</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 80 }]}>
                      <Text style={styles.colValueText}>{selectedPack.serves}</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 140 }]}>
                      <Text style={styles.colValueText}>{selectedPack.includes}</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 150 }]}>
                      <Text style={styles.colValueText}>
                        Cook fresh or refrigerate at 0–4°C.
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <Text style={styles.descriptionText}>{product.description}</Text>

            {/* Extra spacing for sticky bar */}
            <View style={{ height: 110 }} />
          </View>
        </ScrollView>

        {/* 4. Sticky Bottom Action Bar (Lazizia Style) */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceCol}>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPriceText}>₹{unitPrice}</Text>
              {originalPrice > unitPrice && (
                <Text style={styles.bottomMrpText}>₹{originalPrice}</Text>
              )}
            </View>
            {savings > 0 && (
              <Text style={styles.bottomSaveText}>
                You save ₹{savings} · Inclusive of all taxes
              </Text>
            )}
          </View>

          {/* Add to Cart or Stepper or Notify Me Button (Lazizia Style) */}
          {isOutOfStock || !selectedPack.inStock ? (
            <TouchableOpacity
              style={[styles.bottomNotifyBtn, notified && styles.bottomNotifyBtnDone]}
              onPress={() => setNotified(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.bottomNotifyText, notified && styles.bottomNotifyTextDone]}>
                {notified ? '✓ Notification Set' : 'Notify Me'}
              </Text>
            </TouchableOpacity>
          ) : qtyInCart > 0 ? (
            <View style={styles.bottomStepper}>
              <TouchableOpacity
                style={styles.bottomStepBtn}
                onPress={handleDecrement}
                activeOpacity={0.7}
              >
                <AppIcon icon={MinusSignIcon} size={16} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.bottomStepQty}>{qtyInCart}</Text>
              <TouchableOpacity
                style={styles.bottomStepBtn}
                onPress={handleIncrement}
                activeOpacity={0.7}
              >
                <AppIcon icon={PlusSignIcon} size={16} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.bottomAddBtn}
              onPress={handleAddToCart}
              activeOpacity={0.88}
            >
              <Text style={styles.bottomAddText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 10,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circularBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  circularBtnLiked: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E52329',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroWrapper: {
    width: '100%',
    height: 320,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  nonVegBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 3.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  nonVegBox: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deliveryBadgeText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  bestsellerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E52329',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestsellerPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  productTitle: {
    color: '#171717',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  hindiTitle: {
    color: '#737373',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  packSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  packCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E5E5E5',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  packCardSelected: {
    borderColor: '#E52329',
    backgroundColor: '#FEF2F2',
  },
  packCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#525252',
    marginBottom: 4,
  },
  packCardLabelSelected: {
    color: '#E52329',
    fontWeight: '800',
  },
  packPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
  },
  packPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
  },
  packMrp: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  packStockText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  packStockTextSelected: {
    color: '#E52329',
    fontWeight: '700',
  },
  packStockTextOutOfStock: {
    color: '#EF4444',
    fontWeight: '600',
  },
  /* 6-Column Specification Table */
  specTableContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  specTable: {
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableValueRow: {
    flexDirection: 'row',
  },
  tableCol: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
  },
  colHeaderTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'left',
  },
  colValueText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#171717',
    lineHeight: 16,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#525252',
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 14 : 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bottomPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.4,
  },
  bottomMrpText: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomSaveText: {
    fontSize: 11.5,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  bottomAddBtn: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#E52329',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E52329',
    paddingHorizontal: 12,
    minWidth: 120,
  },
  bottomStepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomStepQty: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    minWidth: 26,
    textAlign: 'center',
  },
  bottomNotifyBtn: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNotifyBtnDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  bottomNotifyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  bottomNotifyTextDone: {
    color: '#16A34A',
  },
});
