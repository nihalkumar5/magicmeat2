import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { router } from 'expo-router';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import {
  AppIcon,
  PlusSignIcon,
  MinusSignIcon,
} from './HugeIcon';

interface Props {
  product: Product;
  cardWidth?: number | string;
  isTop10?: boolean;
  rank?: number;
  variant?: 'compact' | 'feed';
}

const DominosCardComponent: React.FC<Props> = ({
  product,
  cardWidth = 172,
}) => {
  const cartItem = useStore((state) => state.cart.find((item) => item.product.id === product.id));
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = useStore((state) => {
    const inv = state.inventory[product.id];
    return inv ? !inv.inStock || inv.stockKg <= 0 : false;
  });
  const addToCart = useStore((state) => state.addToCart);
  const updateQuantity = useStore((state) => state.updateQuantity);

  const handleCardPress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  const handleAdd = () => {
    const defaultCut = product.availableCuts?.[0] || {
      id: 'default',
      name: 'Standard Cut',
      priceModifier: 0,
      description: 'Fresh cut',
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

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth as any },
      ]}
      activeOpacity={0.92}
      onPress={handleCardPress}
    >
      {/* 1. Image Container with Non-Veg Badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizeImageUrl(product.image, 360) }}
          style={[styles.image, isOutOfStock && styles.imageOutOfStock]}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* Out of Stock Overlay Pill */}
        {isOutOfStock && (
          <View style={styles.outOfStockPill}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* FSSAI Non-Veg Icon at bottom left of image */}
        <View style={styles.nonVegBadge}>
          <View style={styles.nonVegBox}>
            <View style={styles.nonVegDot} />
          </View>
        </View>
      </View>

      {/* 2. Content Info */}
      <View style={styles.infoContainer}>
        {/* Product Title */}
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Weight & Price Row */}
        <View style={styles.metaRow}>
          <Text style={styles.weightText}>{product.netWeight}</Text>
          <View style={styles.priceGroup}>
            {originalPrice > basePrice && (
              <Text style={styles.mrpText}>₹{originalPrice}</Text>
            )}
            <Text style={styles.priceText}>₹{basePrice}</Text>
          </View>
        </View>

        {/* Action Button: Clean Outline Button, Stepper, or Notify Me */}
        {isOutOfStock ? (
          <View style={styles.notifyBtn}>
            <Text style={styles.notifyBtnText}>Notify Me</Text>
          </View>
        ) : qtyInCart > 0 ? (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={handleDecrement}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppIcon icon={MinusSignIcon} size={14} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{qtyInCart}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={handleIncrement}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppIcon icon={PlusSignIcon} size={14} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const DominosCard = React.memo(DominosCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    marginRight: 12,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F7F7F7',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  outOfStockPill: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 23, 23, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 5,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  notifyBtn: {
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#737373',
  },
  nonVegBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    padding: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nonVegBox: {
    width: 13,
    height: 13,
    borderWidth: 1.2,
    borderColor: '#DC2626',
    borderRadius: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVegDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    backgroundColor: '#DC2626',
  },
  infoContainer: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#171717',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weightText: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '500',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  mrpText: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
  },
  addBtn: {
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171717',
    letterSpacing: 0.2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E52329',
    paddingHorizontal: 10,
  },
  stepBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
});
