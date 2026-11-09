import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { router } from 'expo-router';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { StatusBar } from 'expo-status-bar';
import { PRODUCTS } from '../../data/mockData';
import { DominosCard } from '../../components/DominosCard';
import {
  AppIcon,
  FlashIcon,
  Calendar01Icon,
  Clock01Icon,
  Delete02Icon,
  PlusSignIcon,
  MinusSignIcon,
  ShieldCheckIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  SnowflakeIcon,
  ScaleIcon,
} from '../../components/HugeIcon';

export default function CartScreen() {
  const {
    cart,
    updateQuantity,
    deliveryMode,
    orderFulfillment,
    setDeliveryMode,
    getCartSubtotal,
    getCartTotal,
    getCartNetWeightGrams,
    getCartGrossWeightGrams,
    coldPackagingEnabled,
    setColdPackagingEnabled,
  } = useStore();

  const subtotal = getCartSubtotal();
  const netGrams = getCartNetWeightGrams();
  const grossGrams = getCartGrossWeightGrams();
  const grandTotal = getCartTotal();
  const deliveryFee = orderFulfillment === 'delivery' && subtotal < 299 ? 35 : 0;
  const packagingFee = coldPackagingEnabled ? 15 : 0;

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppIcon icon={ArrowLeft01Icon} size={20} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Butcher Basket</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Illustration Card */}
          <View style={styles.emptyCard}>
            <Image
              source={require('../../../assets/illustrations/empty_cart.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <View style={styles.emptyBadgePill}>
              <Text style={styles.emptyBadgeText}>BASKET WAITING</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Basket is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Fresh artisanal cuts, succulent mutton, and coastal seafood chilled at 0-4°C ready for your feast.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.88}
            >
              <Text style={styles.browseButtonText}>Explore Fresh Cuts</Text>
              <AppIcon icon={ArrowRight01Icon} size={15} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Senior UI/UX: Quick-Add Recommendations Shelf */}
          <View style={styles.emptyRecommendationsSection}>
            <View style={styles.emptyRecHeaderRow}>
              <View>
                <Text style={styles.emptyRecHeading}>Chef&apos;s Popular Picks</Text>
                <Text style={styles.emptyRecSub}>Quick add our most loved cuts to feast</Text>
              </View>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emptyRecScroll}
              data={PRODUCTS.slice(0, 6)}
              keyExtractor={(p) => `empty-rec-${p.id}`}
              renderItem={({ item }) => (
                <DominosCard product={item} cardWidth={168} />
              )}
              getItemLayout={(_, index) => ({
                length: 180,
                offset: 180 * index,
                index,
              })}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={3}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppIcon icon={ArrowLeft01Icon} size={20} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Butcher Basket</Text>
            <Text style={styles.headerSubtitle}>
              {cart.length} item{cart.length > 1 ? 's' : ''} • {netGrams}g Net Cooking Yield
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Delivery Speed / Slot Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Delivery Speed & Slot</Text>

          <View style={styles.slotOptionRow}>
            {/* Express Instant */}
            <TouchableOpacity
              style={[
                styles.slotOption,
                deliveryMode === 'instant' && styles.slotOptionActive,
              ]}
              onPress={() => setDeliveryMode('instant')}
              activeOpacity={0.8}
            >
              <View style={styles.slotIconRow}>
                <AppIcon icon={FlashIcon} size={14} color="#000000" />
                <Text
                  style={[
                    styles.slotTitle,
                    deliveryMode === 'instant' && styles.slotTitleActive,
                  ]}
                >
                  Express
                </Text>
              </View>
              <Text style={styles.slotSubtitle}>22 Mins</Text>
              <Text style={styles.slotNote}>Dark Store</Text>
            </TouchableOpacity>

            {/* Sunday Morning Slot */}
            <TouchableOpacity
              style={[
                styles.slotOption,
                deliveryMode === 'sunday_morning' && styles.slotOptionActive,
              ]}
              onPress={() => setDeliveryMode('sunday_morning')}
              activeOpacity={0.8}
            >
              <View style={styles.slotIconRow}>
                <AppIcon icon={Calendar01Icon} size={14} color="#000000" />
                <Text
                  style={[
                    styles.slotTitle,
                    deliveryMode === 'sunday_morning' && styles.slotTitleActive,
                  ]}
                >
                  Sunday
                </Text>
              </View>
              <Text style={styles.slotSubtitle}>7 - 9 AM</Text>
              <Text style={styles.slotNote}>Weekend Cut</Text>
            </TouchableOpacity>

            {/* Scheduled Slot */}
            <TouchableOpacity
              style={[
                styles.slotOption,
                deliveryMode === 'slot' && styles.slotOptionActive,
              ]}
              onPress={() => setDeliveryMode('slot')}
              activeOpacity={0.8}
            >
              <View style={styles.slotIconRow}>
                <AppIcon icon={Clock01Icon} size={14} color="#000000" />
                <Text
                  style={[
                    styles.slotTitle,
                    deliveryMode === 'slot' && styles.slotTitleActive,
                  ]}
                >
                  Evening
                </Text>
              </View>
              <Text style={styles.slotSubtitle}>5 - 7 PM</Text>
              <Text style={styles.slotNote}>Dinner Cut</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Items Bento Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Selected Cuts & Yield</Text>

          {cart.map((item) => (
            <View key={item.cartItemId} style={styles.cartItemRow}>
              <Image
                source={{ uri: optimizeImageUrl(item.product.image, 160) }}
                style={styles.cartItemThumb}
                fadeDuration={0}
              />

              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.product.name}</Text>
                <View style={styles.cutBadgeRow}>
                  <Text style={styles.cutBadge}>{item.selectedCut.name}</Text>
                  <Text style={styles.skinBadge}>
                    {item.isSkinless ? 'Skinless' : 'With Skin'}
                  </Text>
                </View>
                <Text style={styles.cartItemYield}>
                  Net: {item.selectedCut.netWeight} • ⚡ {item.product.macros.proteinGrams}g Protein/100g
                </Text>
                <Text style={styles.cartItemPrice}>₹{item.unitPrice * item.quantity}</Text>
              </View>

              {/* Quantity Stepper */}
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.cartItemId, -1)}
                >
                  {item.quantity === 1 ? (
                    <AppIcon icon={Delete02Icon} size={13} color="#FF3B30" />
                  ) : (
                    <AppIcon icon={MinusSignIcon} size={13} color="#000000" />
                  )}
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.cartItemId, 1)}
                >
                  <AppIcon icon={PlusSignIcon} size={13} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Weight Pan Yield Breakdown */}
        <View style={styles.weightSummaryCard}>
          <View style={styles.weightSummaryHeader}>
            <AppIcon icon={ScaleIcon} size={15} color="#000000" />
            <Text style={styles.weightSummaryTitle}>Pan Yield Transparency</Text>
          </View>
          <View style={styles.weightCompareRow}>
            <View style={styles.weightCol}>
              <Text style={styles.weightColLabel}>Pre-Cut Gross</Text>
              <Text style={styles.weightColGross}>{grossGrams}g</Text>
              <Text style={styles.weightColSub}>With bone & trim</Text>
            </View>
            <Text style={styles.weightSeparator}>→</Text>
            <View style={[styles.weightCol, styles.weightColActive]}>
              <Text style={styles.weightColLabelActive}>100% Net Meat</Text>
              <Text style={styles.weightColNet}>{netGrams}g</Text>
              <Text style={styles.weightColSubActive}>Zero Waste in Cooking</Text>
            </View>
          </View>
        </View>

        {/* Cold-Chain Packaging Option */}
        <TouchableOpacity
          style={styles.packagingCard}
          onPress={() => setColdPackagingEnabled(!coldPackagingEnabled)}
          activeOpacity={0.8}
        >
          <View style={styles.packagingLeft}>
            <AppIcon icon={SnowflakeIcon} size={20} color="#0284C7" />
            <View style={{ flex: 1 }}>
              <Text style={styles.packagingTitle}>
                Thermal Pouch + Sub-Zero Gel Packs
              </Text>
              <Text style={styles.packagingSub}>
                Guarantees 0-4°C chill up to 3 hours after delivery.
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.checkCircle,
              coldPackagingEnabled && styles.checkCircleActive,
            ]}
          >
            {coldPackagingEnabled && <View style={styles.checkInner} />}
          </View>
        </TouchableOpacity>

        {/* Bill Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Bill Breakdown</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Cold-Chain Thermal Pouch</Text>
            <Text style={styles.billValue}>₹{packagingFee}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{orderFulfillment === 'takeaway' ? 'Pickup Fee' : 'Delivery Fee'}</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeBadge}>FREE</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            )}
          </View>

          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* Guarantee */}
        <View style={styles.safetyRow}>
          <AppIcon icon={ShieldCheckIcon} size={14} color="#16A34A" />
          <Text style={styles.safetyText}>
            100% Fresh or Full Refund Promise • Lab Verified Quality
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotalLabel}>Total</Text>
          <Text style={styles.checkoutTotalPrice}>₹{grandTotal}</Text>
          <Text style={styles.checkoutWeightNote}>{netGrams}g Net Meat</Text>
        </View>

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>Select Address & Pay</Text>
          <AppIcon icon={ArrowRight01Icon} size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  emptyScrollContent: {
    paddingBottom: 40,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emptyIllustration: {
    width: 170,
    height: 170,
    marginBottom: 16,
  },
  emptyBadgePill: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 290,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: THEME.radius.full,
    marginTop: 18,
    gap: 8,
    ...THEME.shadow.button,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  emptyRecommendationsSection: {
    marginTop: 24,
  },
  emptyRecHeaderRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyRecHeading: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  emptyRecSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  emptyRecScroll: {
    paddingHorizontal: 16,
  },
  macroBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  macroBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.macroProteinBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroBannerTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  macroBannerSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  macroProteinBadge: {
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  macroProteinNum: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  macroProteinLabel: {
    color: '#D1D5DB',
    fontSize: 9,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  sectionHeaderTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: THEME.spacing.sm,
  },
  slotOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotOption: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    borderRadius: THEME.radius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#EAEAEE',
    alignItems: 'center',
  },
  slotOptionActive: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  slotIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  slotTitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  slotTitleActive: {
    color: '#000000',
  },
  slotSubtitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  slotNote: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  cartItemThumb: {
    width: 60,
    height: 60,
    borderRadius: THEME.radius.md,
    backgroundColor: '#F2F2F7',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  cutBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 3,
  },
  cutBadge: {
    color: '#000000',
    fontSize: 10,
    backgroundColor: '#F2F2F7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontWeight: '700',
  },
  skinBadge: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    backgroundColor: '#F8F8FA',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  cartItemYield: {
    color: THEME.colors.macroProtein,
    fontSize: 10,
    fontWeight: '700',
  },
  cartItemPrice: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: THEME.radius.full,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  weightSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  weightSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weightSummaryTitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  weightCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FA',
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.sm,
  },
  weightCol: {
    flex: 1,
    alignItems: 'center',
  },
  weightColActive: {
    backgroundColor: '#E8F5E9',
    borderRadius: THEME.radius.sm,
    paddingVertical: 4,
  },
  weightColLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  weightColLabelActive: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  weightColGross: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 2,
  },
  weightColNet: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 2,
  },
  weightColSub: {
    color: THEME.colors.textMuted,
    fontSize: 9,
  },
  weightColSubActive: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  weightSeparator: {
    color: THEME.colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  packagingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  packagingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  packagingTitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  packagingSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    borderColor: '#000000',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  billValue: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  freeBadge: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginBottom: 0,
  },
  totalLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  safetyText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  checkoutTotalLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  checkoutTotalPrice: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  checkoutWeightNote: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.radius.full,
    gap: 8,
    ...THEME.shadow.button,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
