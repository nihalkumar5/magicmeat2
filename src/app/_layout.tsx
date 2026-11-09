import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { CutSelectorModal } from '../components/CutSelectorModal';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { initRealtimeSync, registerSyncListener } from '../services/realtimeSync';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const isDarkScreen =
    !pathname ||
    pathname === '/' ||
    pathname === '/(tabs)' ||
    pathname === '/(tabs)/' ||
    pathname === '/(tabs)/index';

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'magicmeat-web-root-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body, #root {
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_ENABLE_REALTIME_SYNC !== 'true') return;

    initRealtimeSync();

    const unsubscribe = registerSyncListener((data) => {
      switch (data.type) {
        case 'INIT_STATE':
          if (data.orders && Array.isArray(data.orders)) {
            useStore.setState({ orders: data.orders });
          }
          if (data.inventory && typeof data.inventory === 'object') {
            useStore.setState((state) => ({
              inventory: { ...state.inventory, ...data.inventory },
            }));
          }
          break;

        case 'ORDER_PLACED':
          if (data.order) {
            useStore.setState((state) => {
              const exists = state.orders.some((o) => o.id === data.order.id);
              if (exists) return state;
              return { orders: [data.order, ...state.orders] };
            });
          }
          break;

        case 'ORDER_STATUS_CHANGED':
          if (data.orderId && data.status) {
            useStore.setState((state) => ({
              orders: state.orders.map((o) =>
                o.id === data.orderId ? { ...o, status: data.status, ...(data.order || {}) } : o
              ),
              activeOrder:
                state.activeOrder && state.activeOrder.id === data.orderId
                  ? { ...state.activeOrder, status: data.status, ...(data.order || {}) }
                  : state.activeOrder,
            }));
          }
          break;

        case 'INVENTORY_CHANGED':
          if (data.productId && data.item) {
            useStore.setState((state) => ({
              inventory: {
                ...state.inventory,
                [data.productId]: {
                  ...(state.inventory[data.productId] || {}),
                  ...data.item,
                },
              },
            }));
          }
          break;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.outerContainer, isDesktop && styles.outerContainerDesktop]}>
        <StatusBar style={isDarkScreen ? 'light' : 'dark'} />
        <View style={[styles.contentContainer, isDesktop && styles.contentContainerDesktop]}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: THEME.colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="order-tracking/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="location-select"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile-menu"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="search"
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
          </Stack>

          {/* Global Cut Customizer Modal */}
          <CutSelectorModal />

          {/* Global Location Selector Modal */}
          <LocationSelectorModal />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
  outerContainerDesktop: {
    backgroundColor: '#FFFFFF',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
  contentContainerDesktop: {
    width: '100%',
    minHeight: '100vh' as any,
    backgroundColor: '#FFFFFF',
  },
});
