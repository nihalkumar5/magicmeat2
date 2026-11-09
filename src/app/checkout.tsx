import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { useStore } from '../store/useStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  AppIcon,
  ArrowLeft01Icon,
  Location01Icon,
  Cash01Icon,
  ShieldCheckIcon,
  FlashIcon,
  Calendar01Icon,
  Clock01Icon,
  SnowflakeIcon,
} from '../components/HugeIcon';

const PAYMENT_METHODS: { id: 'Cash on Delivery'; label: string; sub: string; icon: any }[] = [
  {
    id: 'Cash on Delivery',
    label: 'Cash / Pay on Delivery',
    sub: 'Pay cash or scan QR at door',
    icon: Cash01Icon,
  },
];

export default function CheckoutScreen() {
  const {
    cart,
    deliveryMode,
    orderFulfillment,
    selectedAddress,
    getCartTotal,
    getCartNetWeightGrams,
    placeOrder,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery'>('Cash on Delivery');
  const [deliveryNote, setDeliveryNote] = useState('Ring bell, hand over cold pack directly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grandTotal = getCartTotal();
  const netGrams = getCartNetWeightGrams();

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      router.replace('/(tabs)/cart');
      return;
    }

    setIsSubmitting(true);
    const order = placeOrder(paymentMethod, deliveryNote);
    setIsSubmitting(false);
    router.replace({
      pathname: '/order-tracking/[id]',
      params: { id: order.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon icon={ArrowLeft01Icon} size={18} color="#000000" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Confirm Order</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon icon={Location01Icon} size={16} color="#000000" strokeWidth={2} />
            <Text style={styles.cardTitle}>
              {orderFulfillment === 'takeaway' ? 'Pickup Store' : 'Delivery Address'}
            </Text>
          </View>
          <Text style={styles.addressText}>{selectedAddress}</Text>

          <View style={styles.deliveryNoteContainer}>
            <Text style={styles.noteLabel}>
              {orderFulfillment === 'takeaway' ? 'Pickup Instruction:' : 'Delivery Instruction:'}
            </Text>
            <TextInput
              style={styles.noteInput}
              value={deliveryNote}
              onChangeText={setDeliveryNote}
              placeholder="e.g. Leave with guard / Don't ring bell"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        {/* Selected Slot Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {deliveryMode === 'instant' ? (
              <AppIcon icon={FlashIcon} size={16} color="#000000" strokeWidth={2.2} />
            ) : deliveryMode === 'sunday_morning' ? (
              <AppIcon icon={Calendar01Icon} size={16} color="#000000" strokeWidth={2} />
            ) : (
              <AppIcon icon={Clock01Icon} size={16} color="#000000" strokeWidth={2} />
            )}
            <Text style={styles.cardTitle}>Scheduled Delivery Slot</Text>
          </View>

          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>
              {deliveryMode === 'instant'
                ? '⚡ 22-Min Express Dark-Store Delivery'
                : deliveryMode === 'sunday_morning'
                ? '🌅 Sunday Morning 7:00 AM - 9:00 AM Guaranteed'
                : '📦 Today Evening 5:00 PM - 7:00 PM'}
            </Text>
          </View>

          <View style={styles.tempAssurance}>
            <AppIcon icon={SnowflakeIcon} size={14} color="#0284C7" strokeWidth={2} />
            <Text style={styles.tempAssuranceText}>
              Delivered in sealed insulated thermal bag chilled at 0-4°C.
            </Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          {PAYMENT_METHODS.map((pm) => {
            const isSelected = paymentMethod === pm.id;
            const Icon = pm.icon;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                onPress={() => setPaymentMethod(pm.id)}
                activeOpacity={0.8}
              >
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIconBox, isSelected && styles.paymentIconBoxSelected]}>
                    <AppIcon icon={Icon} size={18} color={isSelected ? '#000000' : '#8E8E93'} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelSelected]}>
                      {pm.label}
                    </Text>
                    <Text style={styles.paymentSub}>{pm.sub}</Text>
                  </View>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Basket Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <Text style={styles.orderYieldSub}>
            Total Net Cooking Yield: <Text style={{ color: '#15803D', fontWeight: '800' }}>{netGrams}g</Text>
          </Text>

          {cart.map((item) => (
            <View key={item.cartItemId} style={styles.miniItemRow}>
              <Text style={styles.miniItemTitle} numberOfLines={1}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={styles.miniItemPrice}>₹{item.unitPrice * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{grandTotal}</Text>
          </View>
        </View>

        <View style={styles.guaranteeRow}>
          <AppIcon icon={ShieldCheckIcon} size={14} color="#15803D" strokeWidth={2} />
          <Text style={styles.guaranteeText}>
            Cash on delivery • Safe cold-chain handover
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Place Order CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalPrice}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.placeOrderText}>
            {isSubmitting ? 'Dispatching...' : 'Place Butcher Order →'}
          </Text>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  addressText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  deliveryNoteContainer: {
    backgroundColor: '#F8F8FA',
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  noteLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  noteInput: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  slotBadge: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  slotBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  tempAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tempAssuranceText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FA',
    borderRadius: THEME.radius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#EAEAEE',
  },
  paymentCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  paymentIconBoxSelected: {
    backgroundColor: '#000000',
  },
  paymentLabel: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentLabelSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  paymentSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  orderYieldSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  miniItemTitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    flex: 1,
    marginRight: 10,
    fontWeight: '500',
  },
  miniItemPrice: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  totalAmount: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  guaranteeText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  bottomBar: {
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
  bottomTotalLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  bottomTotalPrice: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  placeOrderBtn: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: THEME.radius.full,
    ...THEME.shadow.button,
  },
  placeOrderBtnDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
