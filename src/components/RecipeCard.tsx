import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { RecipeKit } from '../types';
import { useStore } from '../store/useStore';
import { PRODUCTS } from '../data/mockData';
import { MacroRings } from './MacroRings';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import {
  AppIcon,
  Clock01Icon,
  UserGroupIcon,
  FireIcon,
  CheckmarkCircle01Icon,
  ShoppingBag01Icon,
} from './HugeIcon';

interface Props {
  kit: RecipeKit;
}

export const RecipeCard: React.FC<Props> = ({ kit }) => {
  const { addToCart } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddKit = () => {
    const mainProduct = PRODUCTS.find((p) => p.id === kit.mainMeatId) || PRODUCTS[0];
    const cut = mainProduct.availableCuts[0];
    addToCart(mainProduct, cut, true, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <View style={styles.card}>
      {/* Top Banner Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizeImageUrl(kit.image, 450) }}
          style={styles.image}
          fadeDuration={0}
        />
        <View style={styles.overlayBadge}>
          <Text style={styles.overlayBadgeText}>Gourmet Cook Kit</Text>
        </View>

        <View style={styles.metaOverlay}>
          <View style={styles.metaItem}>
            <AppIcon icon={Clock01Icon} size={11} color="#000000" strokeWidth={2} />
            <Text style={styles.metaText}>{kit.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <AppIcon icon={UserGroupIcon} size={11} color="#000000" strokeWidth={2} />
            <Text style={styles.metaText}>{kit.servings}</Text>
          </View>
          <View style={styles.metaItem}>
            <AppIcon icon={FireIcon} size={11} color={THEME.colors.macroProtein} strokeWidth={2} />
            <Text style={[styles.metaText, { color: THEME.colors.macroProtein }]}>{kit.spiceLevel}</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.content}>
        <Text style={styles.title}>{kit.title}</Text>
        <Text style={styles.hindiSubtitle}>{kit.hindiSubtitle}</Text>

        {/* Cal AI Macro Breakdown Bar for Meal Kit */}
        <View style={styles.macroRowCard}>
          <MacroRings macros={kit.totalMacros} size="sm" showMacroPills={true} />
        </View>

        {/* Kit Items List */}
        <View style={styles.kitItemsContainer}>
          <Text style={styles.kitItemsHeader}>Included in Box:</Text>
          {kit.kitItems.map((item, idx) => (
            <View key={idx} style={styles.kitItemRow}>
              <AppIcon icon={CheckmarkCircle01Icon} size={12} color="#15803D" strokeWidth={2} />
              <Text style={styles.kitItemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Price & CTA */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.allInclusiveLabel}>All-inclusive kit</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{kit.bundlePrice}</Text>
              <Text style={styles.originalPrice}>₹{kit.originalPrice}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addKitButton, isAdded && styles.addKitButtonSuccess]}
            onPress={handleAddKit}
            activeOpacity={0.8}
          >
            {isAdded ? (
              <>
                <AppIcon icon={CheckmarkCircle01Icon} size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.buttonText}>Added ✓</Text>
              </>
            ) : (
              <>
                <AppIcon icon={ShoppingBag01Icon} size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.buttonText}>1-Tap Add Kit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.card,
  },
  imageContainer: {
    width: '100%',
    height: 175,
    backgroundColor: '#F2F2F7',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.full,
  },
  overlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.full,
    gap: 4,
  },
  metaText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: THEME.spacing.md,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hindiSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  macroRowCard: {
    backgroundColor: '#F7F7F9',
    borderRadius: THEME.radius.md,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  kitItemsContainer: {
    backgroundColor: '#FAFAFC',
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  kitItemsHeader: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kitItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kitItemText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  allInclusiveLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  originalPrice: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addKitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: THEME.radius.full,
    gap: 6,
    ...THEME.shadow.button,
  },
  addKitButtonSuccess: {
    backgroundColor: '#15803D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
