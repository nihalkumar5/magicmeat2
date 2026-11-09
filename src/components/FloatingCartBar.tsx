import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { useStore } from '../store/useStore';
import { router } from 'expo-router';
import { AppIcon, ShoppingBag01Icon, ArrowRight01Icon } from './HugeIcon';

const FloatingCartBarComponent: React.FC = () => {
  const cartLength = useStore((state) => state.cart.length);
  const totalItems = useStore((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const totalPrice = useStore((state) => state.getCartTotal());
  const netGrams = useStore((state) => state.getCartNetWeightGrams());

  if (cartLength === 0) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.92}
        onPress={() => router.push('/(tabs)/cart')}
      >
        <View style={styles.left}>
          <View style={styles.iconCircle}>
            <AppIcon icon={ShoppingBag01Icon} size={16} color="#FFFFFF" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.weightText}>{netGrams}g Net Cooking Meat</Text>
            <Text style={styles.priceText}>₹{totalPrice}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.actionText}>View Basket</Text>
          <AppIcon icon={ArrowRight01Icon} size={14} color="#111111" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 99,
  },
  container: {
    backgroundColor: '#111111',
    borderRadius: THEME.radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...THEME.shadow.button,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#111111',
    fontSize: 9,
    fontWeight: '800',
  },
  weightText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
  },
  actionText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
  },
});

export const FloatingCartBar = React.memo(FloatingCartBarComponent);
