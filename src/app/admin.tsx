import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';
import { PRODUCTS } from '../data/mockData';
import { Order, OrderStatus } from '../types';
import {
  AppIcon,
  ArrowLeft01Icon,
  Search01Icon,
  ThermometerColdIcon,
  DeliveryTruck01Icon,
  ShieldCheckIcon,
  PlusSignIcon,
  MinusSignIcon,
  UserIcon,
  Store01Icon,
} from '../components/HugeIcon';

const ADMIN_ENABLED = process.env.EXPO_PUBLIC_ENABLE_ADMIN === 'true';

export default function AdminScreen() {
  const {
    orders,
    inventory,
    updateOrderStatus,
    cancelOrder,
    toggleStock,
    updateStockKg,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'hub'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCat, setInventoryCat] = useState<'all' | 'chicken' | 'mutton' | 'fish' | 'eggs'>('all');

  // Key KPI Metrics
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || (o as any).totalAmount || 0), 0);

  const outOfStockCount = Object.values(inventory).filter((i) => !i.inStock).length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Filtered Inventory Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = inventoryCat === 'all' || p.category === inventoryCat;
      const matchSearch =
        !inventorySearch ||
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [inventoryCat, inventorySearch]);

  if (!ADMIN_ENABLED) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Admin portal unavailable</Text>
          <Text style={styles.emptyStateText}>
            Enable the authenticated admin build to access store operations.
          </Text>
          <TouchableOpacity style={styles.storeSwitchBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.storeSwitchText}>Back to customer app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return { bg: '#FEF3C7', text: '#B45309', label: 'New Placed' };
      case 'butcher_prepping':
        return { bg: '#EFF6FF', text: '#1D4ED8', label: 'Butchering & Trimming' };
      case 'cold_packed':
        return { bg: '#F0FDFA', text: '#0F766E', label: 'Cold Pack Sealed' };
      case 'out_for_delivery':
        return { bg: '#FAF5FF', text: '#7E22CE', label: 'Out for Delivery' };
      case 'delivered':
        return { bg: '#F0FDF4', text: '#15803D', label: 'Delivered ✓' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#B91C1C', label: 'Cancelled' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const handleNextStatus = (order: Order) => {
    if (order.status === 'placed') {
      updateOrderStatus(order.id, 'butcher_prepping', 2.1);
      Alert.alert('Butchery Started', `Order #${order.id} sent to master butcher cutting line.`);
    } else if (order.status === 'butcher_prepping') {
      updateOrderStatus(order.id, 'cold_packed', 1.8);
      Alert.alert('Cold Packed', `Order #${order.id} sealed with 0-4°C cooling pack.`);
    } else if (order.status === 'cold_packed') {
      updateOrderStatus(order.id, 'out_for_delivery', 2.3);
      Alert.alert('Dispatched', `Order #${order.id} handed to ${order.riderName || 'Rider'}.`);
    } else if (order.status === 'out_for_delivery') {
      updateOrderStatus(order.id, 'delivered', 2.4);
      Alert.alert('Delivered', `Order #${order.id} marked as delivered to customer.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      {/* 1. ADMIN HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon icon={ArrowLeft01Icon} size={18} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>MagicMeat Store Admin</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Hub #01 Online</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              Atal Nagar Dark Store &amp; Cold Room Dispatch
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.storeSwitchBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <AppIcon icon={Store01Icon} size={16} color="#FFFFFF" />
          <Text style={styles.storeSwitchText}>Customer App</Text>
        </TouchableOpacity>
      </View>

      {/* 2. KPI METRICS CARDS ROW */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Live Orders</Text>
          <Text style={styles.metricValue}>{activeOrdersCount}</Text>
          <Text style={styles.metricSub}>{orders.length} today</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Revenue</Text>
          <Text style={styles.metricValue}>₹{todayRevenue}</Text>
          <Text style={styles.metricSub}>Gross sales</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Out of Stock</Text>
          <Text style={[styles.metricValue, outOfStockCount > 0 && { color: '#DC2626' }]}>
            {outOfStockCount}
          </Text>
          <Text style={styles.metricSub}>Needs restock</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Cold Room</Text>
          <Text style={[styles.metricValue, { color: '#0284C7' }]}>1.8°C</Text>
          <Text style={styles.metricSub}>0–4°C Safe</Text>
        </View>
      </View>

      {/* 3. SEGMENTED TAB SWITCHER */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.8}
          testID="tab-orders"
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'orders' && styles.tabButtonTextActive]}
          >
            Orders Dispatch ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'inventory' && styles.tabButtonActive]}
          onPress={() => setActiveTab('inventory')}
          activeOpacity={0.8}
          testID="tab-inventory"
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'inventory' && styles.tabButtonTextActive]}
          >
            Inventory &amp; Stock ({PRODUCTS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hub' && styles.tabButtonActive]}
          onPress={() => setActiveTab('hub')}
          activeOpacity={0.8}
          testID="tab-hub"
        >
          <Text style={[styles.tabButtonText, activeTab === 'hub' && styles.tabButtonTextActive]}>
            Cold Hub &amp; Riders
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. MAIN CONTENT AREA */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================= */}
        {/* TAB 1: ORDERS DISPATCH MANAGEMENT                             */}
        {/* ============================================================= */}
        {activeTab === 'orders' && (
          <View>
            {/* Status Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}
            >
              {[
                { key: 'all', label: `All (${orders.length})` },
                {
                  key: 'placed',
                  label: `New (${orders.filter((o) => o.status === 'placed').length})`,
                },
                {
                  key: 'butcher_prepping',
                  label: `Butchering (${
                    orders.filter((o) => o.status === 'butcher_prepping').length
                  })`,
                },
                {
                  key: 'cold_packed',
                  label: `Cold Packed (${
                    orders.filter((o) => o.status === 'cold_packed').length
                  })`,
                },
                {
                  key: 'out_for_delivery',
                  label: `In Transit (${
                    orders.filter((o) => o.status === 'out_for_delivery').length
                  })`,
                },
                {
                  key: 'delivered',
                  label: `Delivered (${
                    orders.filter((o) => o.status === 'delivered').length
                  })`,
                },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.key}
                  style={[
                    styles.chip,
                    orderStatusFilter === chip.key && styles.chipActive,
                  ]}
                  onPress={() => setOrderStatusFilter(chip.key as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      orderStatusFilter === chip.key && styles.chipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No orders in this status</Text>
                <Text style={styles.emptySubtitle}>All caught up! Orders will appear here live.</Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const badge = getStatusColor(order.status);
                return (
                  <View key={order.id} style={styles.orderCard}>
                    {/* Top Order Row */}
                    <View style={styles.orderCardHeader}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.orderIdText}>{order.id}</Text>
                          <View
                            style={[
                              styles.orderStatusBadge,
                              { backgroundColor: badge.bg },
                            ]}
                          >
                            <Text style={[styles.orderStatusBadgeText, { color: badge.text }]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.orderTimeText}>
                          Placed: {order.placedAt} · {order.slotLabel}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.orderTotalText}>₹{order.total || (order as any).totalAmount || 0}</Text>
                        <Text style={styles.orderPaymentText}>{order.paymentMethod}</Text>
                      </View>
                    </View>

                    {/* Customer & Address Details */}
                    <View style={styles.customerInfoBox}>
                      <View style={styles.customerRow}>
                        <AppIcon icon={UserIcon} size={14} color="#525252" />
                        <Text style={styles.customerName}>
                          {order.customerName || 'Rahul Sharma'}
                        </Text>
                        <Text style={styles.customerPhone}>
                          {order.customerPhone || '+91 98234 11200'}
                        </Text>
                      </View>
                      <Text style={styles.customerAddress} numberOfLines={2}>
                        📍 {order.address || (order as any).deliveryAddress || 'Sector 24, Atal Nagar'}
                      </Text>
                    </View>

                    {/* Order Items */}
                    <View style={styles.itemsContainer}>
                      {order.items.map((item, idx) => (
                        <View key={item.cartItemId || idx} style={styles.itemRow}>
                          <Text style={styles.itemQty}>{item.quantity}x</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.product.name}</Text>
                            <Text style={styles.itemCut}>
                              {item.selectedCut?.name || 'Standard Cut'} {item.selectedCut?.netWeight ? `· ${item.selectedCut.netWeight}` : ''}
                            </Text>
                          </View>
                          <Text style={styles.itemPrice}>
                            ₹{(item as any).itemTotal || (item.unitPrice ? item.unitPrice * item.quantity : (item.product?.basePrice ? item.product.basePrice * item.quantity : 0))}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Sensor / Cold Chain Telemetry */}
                    <View style={styles.telemetryRow}>
                      <View style={styles.telemetryItem}>
                        <AppIcon icon={ThermometerColdIcon} size={14} color="#0284C7" />
                        <Text style={styles.telemetryText}>
                          Sensor: {typeof order.currentTempCelsius === 'number' ? order.currentTempCelsius.toFixed(1) + '°C' : ((order as any).sensorTemp || '2.1°C')} (Verified Cold)
                        </Text>
                      </View>
                      <View style={styles.telemetryItem}>
                        <AppIcon icon={DeliveryTruck01Icon} size={14} color="#525252" />
                        <Text style={styles.telemetryText}>
                          Rider: {order.riderName || 'Unassigned'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons Workflow */}
                    <View style={styles.orderActionsRow}>
                      {order.status === 'placed' && (
                        <TouchableOpacity
                          style={styles.actionBtnPrimary}
                          onPress={() => handleNextStatus(order)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnPrimaryText}>
                            Accept &amp; Start Butchering &gt;
                          </Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'butcher_prepping' && (
                        <TouchableOpacity
                          style={[styles.actionBtnPrimary, { backgroundColor: '#0284C7' }]}
                          onPress={() => handleNextStatus(order)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnPrimaryText}>
                            Seal Vacuum Pack at 2°C &gt;
                          </Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'cold_packed' && (
                        <TouchableOpacity
                          style={[styles.actionBtnPrimary, { backgroundColor: '#7C3AED' }]}
                          onPress={() => handleNextStatus(order)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnPrimaryText}>
                            Dispatch with Rider &gt;
                          </Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <TouchableOpacity
                          style={[styles.actionBtnPrimary, { backgroundColor: '#15803D' }]}
                          onPress={() => handleNextStatus(order)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnPrimaryText}>
                            Confirm Customer Delivery ✓
                          </Text>
                        </TouchableOpacity>
                      )}

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => {
                            Alert.alert(
                              'Cancel Order',
                              `Are you sure you want to cancel order #${order.id}?`,
                              [
                                { text: 'No', style: 'cancel' },
                                {
                                  text: 'Yes, Cancel',
                                  style: 'destructive',
                                  onPress: () => cancelOrder(order.id),
                                },
                              ]
                            );
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ============================================================= */}
        {/* TAB 2: INVENTORY & BUTCHERY CONTROL                          */}
        {/* ============================================================= */}
        {activeTab === 'inventory' && (
          <View>
            {/* Search and Category Filter */}
            <View style={styles.searchBarBox}>
              <AppIcon icon={Search01Icon} size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory (e.g. Chicken, Mutton)..."
                value={inventorySearch}
                onChangeText={setInventorySearch}
                placeholderTextColor="#9CA3AF"
              />
              {inventorySearch ? (
                <TouchableOpacity onPress={() => setInventorySearch('')}>
                  <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}
            >
              {[
                { key: 'all', label: 'All Items' },
                { key: 'chicken', label: 'Chicken' },
                { key: 'mutton', label: 'Mutton' },
                { key: 'fish', label: 'Seafood & Fish' },
                { key: 'eggs', label: 'Eggs' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.chip, inventoryCat === c.key && styles.chipActive]}
                  onPress={() => setInventoryCat(c.key as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      inventoryCat === c.key && styles.chipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Inventory Products List */}
            {filteredProducts.map((p) => {
              const inv = inventory[p.id] || {
                productId: p.id,
                inStock: true,
                stockKg: 20,
                availableCutIds: [],
              };
              const inStock = inv.inStock;

              return (
                <View key={p.id} style={styles.inventoryCard}>
                  <View style={styles.inventoryCardTop}>
                    <Image source={{ uri: p.image }} style={styles.inventoryThumb} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.inventoryTitle} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <View
                          style={[
                            styles.stockStatusBadge,
                            inStock ? styles.stockInBadge : styles.stockOutBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stockStatusText,
                              inStock ? styles.stockInText : styles.stockOutText,
                            ]}
                          >
                            {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.inventoryCatText}>
                        {p.category.toUpperCase()} · Net {p.netWeight} · Base ₹{p.basePrice}
                      </Text>
                    </View>
                  </View>

                  {/* Stock KG Stepper and Availability Toggle */}
                  <View style={styles.inventoryControlsRow}>
                    {/* Kg Stepper */}
                    <View style={styles.stockKgBox}>
                      <Text style={styles.controlLabel}>Live Stock (KG):</Text>
                      <View style={styles.stockKgStepper}>
                        <TouchableOpacity
                          style={styles.stockStepBtn}
                          onPress={() => updateStockKg(p.id, inv.stockKg - 5)}
                          activeOpacity={0.7}
                        >
                          <AppIcon icon={MinusSignIcon} size={14} color="#171717" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.stockKgNumber}>{inv.stockKg} kg</Text>
                        <TouchableOpacity
                          style={styles.stockStepBtn}
                          onPress={() => updateStockKg(p.id, inv.stockKg + 5)}
                          activeOpacity={0.7}
                        >
                          <AppIcon icon={PlusSignIcon} size={14} color="#171717" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Toggle Stock Switch Button */}
                    <TouchableOpacity
                      style={[
                        styles.toggleStockBtn,
                        inStock ? styles.toggleStockBtnActive : styles.toggleStockBtnDisabled,
                      ]}
                      onPress={() => toggleStock(p.id)}
                      activeOpacity={0.8}
                      testID={`toggle-stock-${p.id}`}
                    >
                      <Text
                        style={[
                          styles.toggleStockBtnText,
                          inStock ? styles.toggleStockBtnTextActive : styles.toggleStockBtnTextDisabled,
                        ]}
                      >
                        {inStock ? 'Mark Out of Stock' : 'Restock Item ✓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ============================================================= */}
        {/* TAB 3: DARK STORE TELEMETRY & RIDERS                          */}
        {/* ============================================================= */}
        {activeTab === 'hub' && (
          <View>
            {/* Chiller Cold Room Monitor */}
            <View style={styles.hubMonitorCard}>
              <View style={styles.hubHeaderRow}>
                <AppIcon icon={ShieldCheckIcon} size={20} color="#15803D" strokeWidth={2} />
                <Text style={styles.hubTitle}>Chiller &amp; Cold Room Telemetry</Text>
              </View>

              <View style={styles.chillerGrid}>
                <View style={styles.chillerBox}>
                  <Text style={styles.chillerName}>Chicken Cold Room</Text>
                  <Text style={styles.chillerTemp}>1.6°C</Text>
                  <Text style={styles.chillerStatus}>🟢 Optimal (0–4°C)</Text>
                </View>
                <View style={styles.chillerBox}>
                  <Text style={styles.chillerName}>Mutton Cold Room</Text>
                  <Text style={styles.chillerTemp}>2.1°C</Text>
                  <Text style={styles.chillerStatus}>🟢 Optimal (0–4°C)</Text>
                </View>
                <View style={styles.chillerBox}>
                  <Text style={styles.chillerName}>Seafood Freezer</Text>
                  <Text style={styles.chillerTemp}>-18.4°C</Text>
                  <Text style={styles.chillerStatus}>🟢 Deep Frozen</Text>
                </View>
                <View style={styles.chillerBox}>
                  <Text style={styles.chillerName}>Sensor Battery</Text>
                  <Text style={styles.chillerTemp}>98%</Text>
                  <Text style={styles.chillerStatus}>🟢 IoT Connected</Text>
                </View>
              </View>
            </View>

            {/* Delivery Fleet Section */}
            <View style={styles.hubMonitorCard}>
              <View style={styles.hubHeaderRow}>
                <AppIcon icon={DeliveryTruck01Icon} size={20} color="#171717" strokeWidth={2} />
                <Text style={styles.hubTitle}>Delivery Fleet Status (Atal Nagar Hub)</Text>
              </View>

              {[
                { name: 'Vikram Singh', phone: '+91 98765 43210', status: 'Delivering #MM-849201', active: true },
                { name: 'Amit Sahu', phone: '+91 91234 56789', status: 'Prepping at Hub', active: true },
                { name: 'Rajesh Kumar', phone: '+91 98765 12345', status: 'Delivering #MM-849182', active: true },
                { name: 'Dinesh Yadav', phone: '+91 94567 89012', status: 'Idle (Ready for pickup)', active: false },
              ].map((rider, i) => (
                <View key={i} style={styles.riderRow}>
                  <View style={styles.riderAvatar}>
                    <Text style={styles.riderInitial}>{rider.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.riderName}>{rider.name}</Text>
                    <Text style={styles.riderPhone}>{rider.phone}</Text>
                  </View>
                  <View style={styles.riderStatusBadge}>
                    <Text style={styles.riderStatusText}>{rider.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#171717',
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#A3A3A3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#171717',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 10,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.4)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#A3A3A3',
    fontSize: 12,
    marginTop: 2,
  },
  storeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E52329',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  storeSwitchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* METRICS ROW */
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E1E1E',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  metricLabel: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  metricSub: {
    color: '#737373',
    fontSize: 10,
    marginTop: 2,
  },

  /* TAB BAR */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 14,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#E52329',
  },
  tabButtonText: {
    color: '#737373',
    fontSize: 13.5,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#171717',
    fontWeight: '800',
  },

  /* CONTENT SCROLL */
  contentScroll: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentScrollInner: {
    padding: 16,
  },

  /* FILTER CHIPS */
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525252',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ORDER CARD */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  orderStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderTimeText: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
  orderTotalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171717',
  },
  orderPaymentText: {
    fontSize: 11,
    color: '#737373',
    marginTop: 1,
  },
  customerInfoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171717',
  },
  customerPhone: {
    fontSize: 12,
    color: '#737373',
  },
  customerAddress: {
    fontSize: 12,
    color: '#525252',
    lineHeight: 16,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginBottom: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E52329',
    width: 24,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171717',
  },
  itemCut: {
    fontSize: 11,
    color: '#737373',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171717',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 10,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetryText: {
    fontSize: 11.5,
    color: '#525252',
    fontWeight: '500',
  },
  orderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 40,
    backgroundColor: '#E52329',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '600',
  },

  /* INVENTORY CARD */
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#171717',
  },
  inventoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    marginBottom: 12,
  },
  inventoryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inventoryThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171717',
    flex: 1,
  },
  stockStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockInBadge: {
    backgroundColor: '#F0FDF4',
  },
  stockOutBadge: {
    backgroundColor: '#FEF2F2',
  },
  stockStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stockInText: {
    color: '#16A34A',
  },
  stockOutText: {
    color: '#DC2626',
  },
  inventoryCatText: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
  inventoryControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  controlLabel: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '600',
  },
  stockKgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockKgStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 2,
  },
  stockStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockKgNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#171717',
    minWidth: 46,
    textAlign: 'center',
  },
  toggleStockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleStockBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  toggleStockBtnDisabled: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  toggleStockBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleStockBtnTextActive: {
    color: '#DC2626',
  },
  toggleStockBtnTextDisabled: {
    color: '#16A34A',
  },

  /* HUB & CHILLER MONITOR */
  hubMonitorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 16,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  hubTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#171717',
  },
  chillerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chillerBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  chillerName: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  chillerTemp: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171717',
    marginVertical: 4,
  },
  chillerStatus: {
    fontSize: 10.5,
    color: '#16A34A',
    fontWeight: '700',
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  riderName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#171717',
  },
  riderPhone: {
    fontSize: 11.5,
    color: '#737373',
  },
  riderStatusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riderStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
});
