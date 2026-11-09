import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import {
  AppIcon,
  ArrowLeft01Icon,
  Call02Icon,
  Message01Icon,
  ShieldCheckIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Home01Icon,
  SnowflakeIcon,
} from '../../components/HugeIcon';

const STAGES = [
  {
    key: 'placed',
    title: 'Order Confirmed',
    sub: 'Dark-store dispatch assigned',
    time: '2 mins ago',
  },
  {
    key: 'butcher_prepping',
    title: 'Master Butcher Prepping',
    sub: 'Cleaned, precision hand-cut to your cut specs',
    time: 'In Progress',
  },
  {
    key: 'cold_packed',
    title: 'Vacuum Sealed & Cold-Packed',
    sub: 'Packed in insulated thermal bag with dry-ice packs @ 2.1°C',
    time: 'Next',
  },
  {
    key: 'out_for_delivery',
    title: 'Rider Out with Thermal Box',
    sub: 'Direct express route to your doorstep',
    time: 'Estimated 15 mins',
  },
  {
    key: 'delivered',
    title: 'Delivered Fresh & Chilled',
    sub: 'Check cold freshness before opening',
    time: 'Final',
  },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeOrder, orders } = useStore();

  const order = activeOrder && activeOrder.id === id ? activeOrder : orders.find((o) => o.id === id) || activeOrder;

  const currentStageIndex =
    order?.status === 'rider_assigned'
      ? 3
      : Math.max(0, STAGES.findIndex((stage) => stage.key === order?.status));

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Order not found</Text>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace('/(tabs)')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon icon={ArrowLeft01Icon} size={18} color="#000000" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.navTitle}>Live Order Tracker</Text>
          <Text style={styles.orderIdSub}>Order #{order.id}</Text>
        </View>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <AppIcon icon={Home01Icon} size={18} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top ETA & Live Pulse Card with Senior UI/UX Illustration */}
        <View style={styles.etaCard}>
          <View style={styles.etaCardLeft}>
            <View style={styles.etaHeader}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>EXPRESS COLD-CHAIN</Text>
              </View>
              <Text style={styles.slotLabelText}>{order.slotLabel}</Text>
            </View>

            <Text style={styles.etaTime}>
              Arriving in <Text style={{ color: '#DC2626', fontWeight: '900' }}>{order.eta}</Text>
            </Text>
            <Text style={styles.etaSub}>
              Packed in sealed thermal foil pouches with sub-zero gel chillers.
            </Text>
            <View style={styles.coldChainPill}>
              <AppIcon icon={SnowflakeIcon} size={13} color="#0284C7" strokeWidth={2.5} />
              <Text style={styles.coldChainPillText}>0-4°C Thermal Controlled</Text>
            </View>
          </View>
          <Image
            source={require('../../../assets/illustrations/delivery_courier.png')}
            style={styles.etaIllustration}
            resizeMode="contain"
          />
        </View>

        {/* Butcher & Delivery Lifecycle Stages */}
        <View style={styles.stagesCard}>
          <Text style={styles.stagesTitle}>Butchery & Delivery Progress</Text>

          {STAGES.map((stg, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <View key={stg.key} style={styles.stageRow}>
                <View style={styles.stageTimelineCol}>
                  <View
                    style={[
                      styles.stageCircle,
                      isCompleted && styles.stageCircleCompleted,
                      isCurrent && styles.stageCircleCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <AppIcon icon={CheckmarkCircle01Icon} size={16} color="#FFFFFF" strokeWidth={2.5} />
                    ) : (
                      <AppIcon
                        icon={Clock01Icon}
                        size={12}
                        color={isCurrent ? '#FFFFFF' : '#8E8E93'}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  {idx < STAGES.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stageDetailsCol}>
                  <View style={styles.stageTitleRow}>
                    <Text
                      style={[
                        styles.stageHeading,
                        (isCompleted || isCurrent) && styles.stageHeadingActive,
                      ]}
                    >
                      {stg.title}
                    </Text>
                    <Text style={styles.stageTime}>{stg.time}</Text>
                  </View>
                  <Text style={styles.stageSub}>{stg.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Partner Contact Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <Image
              source={require('../../../assets/illustrations/scooter_rider.png')}
              style={styles.riderAvatarImg}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.riderName}>{order.riderName || 'Rider not assigned yet'}</Text>
            <Text style={styles.riderRole}>Contact details will appear after dispatch.</Text>
          </View>

          {order.riderPhone ? (
            <View style={styles.riderActions}>
              <TouchableOpacity style={styles.actionCircle} onPress={() => Linking.openURL(`tel:${order.riderPhone}`)}>
                <AppIcon icon={Call02Icon} size={15} color="#000000" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCircle} onPress={() => Linking.openURL(`sms:${order.riderPhone}`)}>
                <AppIcon icon={Message01Icon} size={15} color="#000000" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Order Details & Cut Specs */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Your Butchered Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemSummaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.product.name}
                </Text>
                <Text style={styles.itemCutSpecs}>
                  Cut: {item.selectedCut.name} • {item.isSkinless ? 'Skinless' : 'With Skin'} • Net: {item.selectedCut.netWeight}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.unitPrice * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.summaryBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Payment Mode</Text>
              <Text style={styles.breakdownVal}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivering To</Text>
              <Text style={styles.breakdownVal} numberOfLines={1}>{order.address}</Text>
            </View>
            <View style={[styles.breakdownRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F2F2F7' }]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>₹{order.total}</Text>
            </View>
          </View>
        </View>

        {/* Safety Guarantee */}
        <View style={styles.safetyGuarantee}>
          <AppIcon icon={ShieldCheckIcon} size={16} color="#15803D" strokeWidth={2} />
          <Text style={styles.safetyGuaranteeText}>
            If the seal is damaged or the order arrives warm, contact support for a review.
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
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  orderIdSub: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  homeBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: THEME.radius.full,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  etaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: 16,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...THEME.shadow.card,
  },
  etaCardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  etaIllustration: {
    width: 96,
    height: 96,
  },
  coldChainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  coldChainPillText: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '700',
  },
  riderAvatarImg: {
    width: 44,
    height: 44,
  },
  etaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.macroProtein,
  },
  liveTagText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  slotLabelText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  etaTime: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  etaSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  coldSensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sensorIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorTitle: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  optimalPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  optimalText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  sensorSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  tempDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  tempLargeBox: {
    flex: 1,
  },
  tempNumber: {
    color: '#0284C7',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tempRangeNote: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
  },
  sensorMetaCol: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
  },
  metaValue: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  stagesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  stagesTitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: THEME.spacing.md,
  },
  stageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stageTimelineCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stageCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCircleCompleted: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  stageCircleCurrent: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#15803D',
  },
  stageDetailsCol: {
    flex: 1,
  },
  stageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageHeading: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  stageHeadingActive: {
    color: '#000000',
    fontWeight: '800',
  },
  stageTime: {
    color: THEME.colors.textMuted,
    fontSize: 10,
  },
  stageSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    gap: 12,
    ...THEME.shadow.card,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  riderName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  riderRole: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  riderVaccinated: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  detailsTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemName: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  itemCutSpecs: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  itemPrice: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  summaryBreakdown: {
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  breakdownLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  breakdownVal: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    maxWidth: '65%',
  },
  totalLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  totalVal: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '900',
  },
  safetyGuarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: THEME.spacing.md,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    ...THEME.shadow.card,
  },
  safetyGuaranteeText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
});
