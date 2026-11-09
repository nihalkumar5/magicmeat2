import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ColdChainBadge } from '../../components/ColdChainBadge';
import {
  AppIcon,
  ArrowRight01Icon,
  ShieldCheckIcon,
  RotateLeft01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
} from '../../components/HugeIcon';

export default function OrdersScreen() {
  const { orders, activeOrder } = useStore();

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
            <Text style={styles.headerTitle}>Your Orders</Text>
            <Text style={styles.headerSubtitle}>Live tracking & cold-chain delivery history</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Order Card */}
        {activeOrder && (
          <TouchableOpacity
            style={styles.activeOrderCard}
            onPress={() =>
              router.push({
                pathname: '/order-tracking/[id]',
                params: { id: activeOrder.id },
              })
            }
            activeOpacity={0.9}
          >
            <View style={styles.activeHeaderRow}>
              <View style={styles.activeBadge}>
                <View style={styles.livePulse} />
                <Text style={styles.activeBadgeText}>ACTIVE • IN TRANSIT</Text>
              </View>
              <ColdChainBadge
                temp={
                  typeof activeOrder.currentTempCelsius === 'number'
                    ? `${activeOrder.currentTempCelsius}°C Monitored`
                    : 'Temperature updates after dispatch'
                }
                size="sm"
              />
            </View>

            <View style={styles.activeBody}>
              <Text style={styles.orderIdText}>Order #{activeOrder.id}</Text>
              <Text style={styles.activeEta}>
                Arriving in <Text style={{ color: '#000000' }}>{activeOrder.eta}</Text>
              </Text>
              <Text style={styles.activeSlot}>{activeOrder.slotLabel}</Text>
              <Text style={styles.activeItemsCount}>
                {activeOrder.items.length} item{activeOrder.items.length > 1 ? 's' : ''} • Total ₹{activeOrder.total}
              </Text>
            </View>

            <View style={styles.activeFooter}>
              <Text style={styles.trackText}>View Live Cold Sensor & Map</Text>
              <AppIcon icon={ArrowRight01Icon} size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}

        {/* Past Orders */}
        <Text style={styles.sectionTitle}>Order History</Text>

        {orders.length === 0 && !activeOrder && (
          <View style={styles.emptyCard}>
            <Image
              source={require('../../../assets/illustrations/checkout_counter.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your artisanal fresh cuts, live cold-chain tracking, and digital temperature receipts will appear here.
            </Text>
            <TouchableOpacity
              style={styles.orderNowBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.88}
            >
              <Text style={styles.orderNowBtnText}>Browse Fresh Butchery</Text>
              <AppIcon icon={ArrowRight01Icon} size={15} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeaderRow}>
              <View>
                <Text style={styles.cardOrderId}>#{order.id}</Text>
                <Text style={styles.cardDate}>
                  {order.placedAt} • {order.paymentMethod}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <AppIcon icon={Clock01Icon} size={11} color="#15803D" strokeWidth={2} />
                <Text style={styles.statusText}>Processed</Text>
              </View>
            </View>

            <View style={styles.orderItemsList}>
              {order.items.map((it, idx) => (
                <Text key={idx} style={styles.orderItemName} numberOfLines={1}>
                  • {it.quantity}x {it.product.name} ({it.selectedCut.name})
                </Text>
              ))}
            </View>

            <View style={styles.orderFooterRow}>
              <Text style={styles.orderTotal}>₹{order.total}</Text>
              <TouchableOpacity
                style={styles.reorderBtn}
                onPress={() =>
                  router.push({
                    pathname: '/order-tracking/[id]',
                    params: { id: order.id },
                  })
                }
              >
                <AppIcon icon={RotateLeft01Icon} size={12} color="#000000" strokeWidth={2} />
                <Text style={styles.reorderText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Butcher Quality Assurance Pass */}
        <View style={styles.complianceCard}>
          <View style={styles.complianceHeader}>
            <AppIcon icon={ShieldCheckIcon} size={18} color="#15803D" strokeWidth={2} />
            <Text style={styles.complianceTitle}>MagicMeat Quality Certification</Text>
          </View>
          <Text style={styles.complianceDesc}>
            FSSAI License #10021043000129 • ISO 22000 Certified Cold-Chain Processing Unit • 100% Halal Certified.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
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
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#000000',
    ...THEME.shadow.card,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.macroProtein,
  },
  activeBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  activeBody: {
    marginVertical: 4,
  },
  orderIdText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeEta: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  activeSlot: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activeItemsCount: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  activeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    marginTop: THEME.spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.full,
    ...THEME.shadow.button,
  },
  trackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: THEME.spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginVertical: 12,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  orderNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: THEME.radius.full,
    marginTop: 18,
    ...THEME.shadow.button,
  },
  orderNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardOrderId: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  cardDate: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    gap: 4,
  },
  statusText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  orderItemsList: {
    marginVertical: 6,
  },
  orderItemName: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  orderTotal: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
  },
  reorderText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  complianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  complianceTitle: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  complianceDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
