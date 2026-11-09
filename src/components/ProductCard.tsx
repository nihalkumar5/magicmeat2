import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { router } from 'expo-router';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import {
  AppIcon,
  FavouriteIcon,
  PlusSignIcon,
  MinusSignIcon,
  StarIcon,
} from './HugeIcon';

interface Props {
  product: Product;
}

const ProductCardComponent: React.FC<Props> = ({ product }) => {
  const isLiked = useStore((state) => state.wishlist.includes(product.id));
  const cartItem = useStore((state) => state.cart.find((item) => item.product.id === product.id));
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = useStore((state) => {
    const invItem = state.inventory[product.id];
    return invItem ? !invItem.inStock || invItem.stockKg <= 0 : false;
  });

  const addToCart = useStore((state) => state.addToCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const setCustomizerProduct = useStore((state) => state.setCustomizerProduct);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  const [notified, setNotified] = React.useState(false);

  const handleNotifyMe = (e: any) => {
    e?.stopPropagation?.();
    setNotified(true);
  };

  const handleCardPress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  const handleCustomise = () => {
    if (product.availableCuts && product.availableCuts.length > 1) {
      setCustomizerProduct(product);
    } else {
      handleCardPress();
    }
  };

  const handleAdd = () => {
    const defaultCut = product.availableCuts?.[0] || {
      id: 'standard',
      name: 'Standard Cut',
      priceModifier: 0,
      description: 'Standard fresh cut',
      cookingRecommendation: 'All dishes',
    };
    addToCart(product, defaultCut, true, 1);
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, 1);
    } else {
      handleAdd();
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, -1);
    }
  };

  const basePrice = product.basePrice;
  const originalPrice = product.originalPrice || Math.round(basePrice * 1.25);
  const discountPercent = Math.round(((originalPrice - basePrice) / originalPrice) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={handleCardPress}
    >
      {/* 1. Full-Width Product Image (5:3 Ratio, 200px Height) */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizeImageUrl(product.image, 540) }}
          style={[styles.image, isOutOfStock && { opacity: 0.45 }]}
          fadeDuration={0}
        />

        {/* Out of Stock Centered Overlay Pill */}
        {isOutOfStock && (
          <View style={styles.outOfStockCenterOverlay}>
            <Text style={styles.outOfStockCenterText}>Out of Stock</Text>
          </View>
        )}

        {/* Top-Left Overlays: Non-Veg Indicator + Bestseller Badge */}
        <View style={styles.topLeftGroup}>
          <View style={styles.nonVegBox}>
            <View style={styles.nonVegDot} />
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{product.badge || 'Bestseller'}</Text>
          </View>
        </View>

        {/* Top-Right: Wishlist Heart Button */}
        <TouchableOpacity
          style={[styles.heartButton, isLiked && styles.heartButtonActive]}
          onPress={() => toggleWishlist(product.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Wishlist"
          testID={`heart-${product.id}`}
        >
          <AppIcon
            icon={FavouriteIcon}
            size={18}
            color={isLiked ? '#DC2626' : '#94A3B8'}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        {/* Bottom-Right Image Customise Pill */}
        {product.availableCuts && product.availableCuts.length > 1 && (
          <TouchableOpacity
            style={styles.customisePill}
            onPress={handleCustomise}
            activeOpacity={0.8}
          >
            <Text style={styles.customisePillText}>Customise &gt;</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Product Information Lower Section */}
      <View style={styles.infoContainer}>
        {/* Rating and Net Weight Row */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <AppIcon icon={StarIcon} size={14} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.ratingText}>{product.rating || '4.8'}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.netWeightMetaText}>{product.netWeight} net weight</Text>
        </View>

        {/* Product Title (18px Semibold) */}
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Short Description (13px) */}
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        {/* Price and Discount Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{basePrice}</Text>
          {originalPrice > basePrice && (
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
          )}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* 48px Height Add Button / Stepper / Notify Me */}
        {isOutOfStock ? (
          <TouchableOpacity
            style={[styles.notifyBtn, notified && styles.notifyBtnDone]}
            onPress={handleNotifyMe}
            activeOpacity={0.8}
            testID={`notify-btn-${product.id}`}
          >
            <Text style={[styles.notifyBtnText, notified && styles.notifyBtnTextDone]}>
              {notified ? '✓ Notification Set' : 'Notify Me'}
            </Text>
          </TouchableOpacity>
        ) : qtyInCart > 0 ? (
          <View style={styles.stepperContainer} testID={`stepper-${product.id}`}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={handleDecrement}
              activeOpacity={0.7}
              testID={`decrement-${product.id}`}
            >
              <AppIcon icon={MinusSignIcon} size={16} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.stepQtyText}>{qtyInCart}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={handleIncrement}
              activeOpacity={0.7}
              testID={`increment-${product.id}`}
            >
              <AppIcon icon={PlusSignIcon} size={16} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            activeOpacity={0.85}
            testID={`add-btn-${product.id}`}
          >
            <Text style={styles.addBtnText}>ADD +</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topLeftGroup: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 5,
  },
  nonVegBox: {
    width: 14,
    height: 14,
    borderWidth: 1.2,
    borderColor: '#DC2626',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  nonVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  badgePill: {
    backgroundColor: '#DC2626',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 5,
  },
  heartButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  customisePill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 5,
  },
  customisePillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  metaDot: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  netWeightMetaText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  description: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 14,
  },
  price: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: '#E52329',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E52329',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E52329',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  stepBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQtyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  outOfStockCenterOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outOfStockCenterText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  notifyBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyBtnDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  notifyBtnText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '700',
  },
  notifyBtnTextDone: {
    color: '#16A34A',
  },
});

export const ProductCard = React.memo(ProductCardComponent);
