import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useStore } from '../store/useStore';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import {
  AppIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  WeightScaleIcon,
  ShieldCheckIcon,
} from './HugeIcon';

export const CutSelectorModal: React.FC = () => {
  const { customizerProduct, setCustomizerProduct, addToCart } = useStore();
  const [selectedCutId, setSelectedCutId] = useState<string | null>(null);
  const [skinlessByProduct, setSkinlessByProduct] = useState<Record<string, boolean>>({});
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const selectedCut = customizerProduct?.availableCuts.find((cut) => cut.id === selectedCutId)
    ?? customizerProduct?.availableCuts[0]
    ?? null;
  const productKey = customizerProduct?.id ?? '';
  const isSkinless = productKey ? skinlessByProduct[productKey] ?? true : true;
  const isAdded = addedProductId === productKey;

  if (!customizerProduct || !selectedCut) {
    return null;
  }

  const currentPrice = customizerProduct.basePrice + selectedCut.priceDelta;

  const handleAddToCart = () => {
    if (!selectedCut) return;
    addToCart(customizerProduct, selectedCut, isSkinless, 1);
    setAddedProductId(productKey);
    setTimeout(() => {
      setAddedProductId(null);
      setCustomizerProduct(null);
    }, 400);
  };

  return (
    <Modal
      visible={!!customizerProduct}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCustomizerProduct(null)}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header Row */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Text style={styles.sheetTitle}>Customise Your Cut</Text>
              <Text style={styles.sheetSubtitle}>Precision cut by master butchers</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCustomizerProduct(null)}
            >
              <AppIcon icon={Cancel01Icon} size={18} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Product Summary */}
            <View style={styles.productBanner}>
              <Image
                source={{ uri: optimizeImageUrl(customizerProduct.image, 160) }}
                style={styles.productThumb}
                fadeDuration={0}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{customizerProduct.name}</Text>
                {customizerProduct.hindiTitle && (
                  <Text style={styles.productHindi}>{customizerProduct.hindiTitle}</Text>
                )}
                <View style={styles.halalBadge}>
                  <AppIcon icon={ShieldCheckIcon} size={13} color="#00A082" />
                  <Text style={styles.halalText}>100% Halal Certified</Text>
                </View>
              </View>
            </View>

            {/* Glovo Net Weight Pan Yield Transparency Meter */}
            <View style={styles.transparencyCard}>
              <View style={styles.transparencyHeader}>
                <View style={styles.scaleIconCircle}>
                  <AppIcon icon={WeightScaleIcon} size={16} color="#111111" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transparencyTitle}>Net Weight Transparency</Text>
                  <Text style={styles.transparencyDesc}>
                    Local markets weigh before cleaning. We deliver 100% clean cooking yield.
                  </Text>
                </View>
              </View>

              <View style={styles.weightMeterRow}>
                <View style={styles.weightBox}>
                  <Text style={styles.weightLabel}>Gross Weight</Text>
                  <Text style={styles.weightValueMuted}>{selectedCut.grossWeight}</Text>
                  <Text style={styles.weightNote}>Pre-cut with waste</Text>
                </View>
                <View style={styles.arrowBox}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={[styles.weightBox, styles.weightBoxHighlight]}>
                  <Text style={styles.weightLabelHighlight}>Net Pan Yield</Text>
                  <Text style={styles.weightValueHighlight}>{selectedCut.netWeight}</Text>
                  <Text style={styles.weightNoteHighlight}>{selectedCut.pieces}</Text>
                </View>
              </View>
            </View>

            {/* Cut Options Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Select Cut Style</Text>

              {customizerProduct.availableCuts.map((cut) => {
                const isSelected = selectedCut.id === cut.id;
                return (
                  <TouchableOpacity
                    key={cut.id}
                    style={[styles.cutCard, isSelected && styles.cutCardSelected]}
                    onPress={() => setSelectedCutId(cut.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cutRadioRow}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.cutTitleRow}>
                          <Text style={[styles.cutName, isSelected && styles.cutNameSelected]}>
                            {cut.name}
                          </Text>
                          {cut.priceDelta > 0 && (
                            <Text style={styles.cutDelta}>+₹{cut.priceDelta}</Text>
                          )}
                        </View>
                        <Text style={styles.cutDescription}>{cut.description}</Text>
                        <View style={styles.cutMetaRow}>
                          <Text style={styles.cutMetaBadge}>🍳 {cut.bestFor}</Text>
                          <Text style={styles.cutPiecesBadge}>{cut.pieces}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Skin Preference */}
            {selectedCut.allowsSkinOption && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Skin Preference</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleButton, isSkinless && styles.toggleButtonActive]}
                    onPress={() => setSkinlessByProduct((previous) => ({ ...previous, [productKey]: true }))}
                  >
                    <AppIcon
                      icon={CheckmarkCircle01Icon}
                      size={14}
                      color={isSkinless ? '#111111' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                    <Text style={[styles.toggleText, isSkinless && styles.toggleTextActive]}>
                      Skinless (Clean & Lean)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleButton, !isSkinless && styles.toggleButtonActive]}
                    onPress={() => setSkinlessByProduct((previous) => ({ ...previous, [productKey]: false }))}
                  >
                    <AppIcon
                      icon={CheckmarkCircle01Icon}
                      size={14}
                      color={!isSkinless ? '#111111' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                    <Text style={[styles.toggleText, !isSkinless && styles.toggleTextActive]}>
                      With Skin (Crisp)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Sticky Bottom Action Bar with Glovo Yellow Button */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomPriceContainer}>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.bottomPrice}>₹{currentPrice}</Text>
                {customizerProduct.originalPrice && (
                  <Text style={styles.bottomOriginalPrice}>
                    ₹{customizerProduct.originalPrice + selectedCut.priceDelta}
                  </Text>
                )}
              </View>
              <Text style={styles.bottomWeightSubtext}>
                Net: {selectedCut.netWeight} • {selectedCut.pieces}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addButton, isAdded && styles.addButtonSuccess]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>
                {isAdded ? 'Added ✓' : 'Add to Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  sheetHeaderLeft: {
    flex: 1,
  },
  sheetTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: THEME.spacing.lg,
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productThumb: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F0F1F5',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  productHindi: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  halalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  halalText: {
    color: '#00A082',
    fontSize: 11,
    fontWeight: '700',
  },
  transparencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...THEME.shadow.card,
  },
  transparencyHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  scaleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparencyTitle: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },
  transparencyDesc: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  weightMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: THEME.spacing.sm,
  },
  weightBox: {
    flex: 1,
    alignItems: 'center',
  },
  weightBoxHighlight: {
    backgroundColor: '#E6F6F2',
    borderRadius: 10,
    paddingVertical: 4,
  },
  weightLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  weightLabelHighlight: {
    color: '#00A082',
    fontSize: 10,
    fontWeight: '800',
  },
  weightValueMuted: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 2,
  },
  weightValueHighlight: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '900',
    marginVertical: 2,
  },
  weightNote: {
    color: '#9CA3AF',
    fontSize: 9,
  },
  weightNoteHighlight: {
    color: '#00A082',
    fontSize: 10,
    fontWeight: '700',
  },
  arrowBox: {
    paddingHorizontal: 8,
  },
  arrowText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContainer: {
    marginTop: THEME.spacing.lg,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: THEME.spacing.sm,
  },
  cutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cutCardSelected: {
    borderColor: '#111111',
    backgroundColor: '#FAFAFA',
  },
  cutRadioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: '#111111',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
  },
  cutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cutName: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },
  cutNameSelected: {
    color: '#111111',
  },
  cutDelta: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '800',
  },
  cutDescription: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  cutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  cutMetaBadge: {
    color: '#4B5563',
    fontSize: 10,
    backgroundColor: '#F0F1F5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontWeight: '600',
  },
  cutPiecesBadge: {
    color: '#00A082',
    fontSize: 10,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  toggleButtonActive: {
    borderColor: '#111111',
    backgroundColor: '#FAFAFA',
  },
  toggleText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#111111',
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bottomPrice: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '900',
  },
  bottomOriginalPrice: {
    color: '#9CA3AF',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  bottomWeightSubtext: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#111111',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: THEME.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSuccess: {
    backgroundColor: '#166534',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
