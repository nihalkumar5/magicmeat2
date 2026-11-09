import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../data/mockData';
import { DominosCard } from '../../components/DominosCard';
import { FloatingCartBar } from '../../components/FloatingCartBar';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../../store/useStore';
import { MeatCategory } from '../../types';
import {
  AppIcon,
  ArrowLeft01Icon,
  Search01Icon,
  Sorting01Icon,
  FilterIcon,
} from '../../components/HugeIcon';
import { router } from 'expo-router';

const MENU_CATEGORIES = [
  { id: 'all', label: 'All Feast' },
  { id: 'chicken', label: 'Fresh Chicken' },
  { id: 'curry-cuts', label: 'Curry Cuts' },
  { id: 'mutton', label: 'Prime Mutton' },
  { id: 'fish', label: 'Coastal Fish' },
  { id: 'ready-to-cook', label: 'Ready-to-Cook' },
  { id: 'eggs', label: 'Farm Eggs' },
  { id: 'fresh-produce', label: 'Veggies & Fruits' },
];

type QuickFilter = 'all' | 'chicken' | 'mutton';
type SortOption = 'default' | 'asc' | 'desc';

export default function ExploreScreen() {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const activeMenuCat = selectedCategory;
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const contentWidth = isDesktop ? Math.min(width - 80, 840) : width - 32;

  // Filter products matching category, search, and quick filters
  let filtered = PRODUCTS.filter((p) => {
    // Quick Meat Type filter
    if (quickFilter === 'chicken' && p.category !== 'chicken') return false;
    if (quickFilter === 'mutton' && p.category !== 'mutton') return false;

    // Category filter
    if (activeMenuCat === 'curry-cuts') {
      return p.availableCuts.some((c) => c.name.toLowerCase().includes('curry'));
    }
    if (activeMenuCat !== 'all' && p.category !== activeMenuCat) {
      return false;
    }

    return true;
  });

  // Sorting
  if (sortOption === 'asc') {
    filtered = [...filtered].sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortOption === 'desc') {
    filtered = [...filtered].sort((a, b) => b.basePrice - a.basePrice);
  }

  const handleCycleSort = () => {
    if (sortOption === 'default') setSortOption('asc');
    else if (sortOption === 'asc') setSortOption('desc');
    else setSortOption('default');
  };

  const currentCategoryLabel =
    MENU_CATEGORIES.find((c) => c.id === activeMenuCat)?.label || 'All Feast';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      {/* 1. TOP HEADER (Exact Domino's Top Bar) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppIcon icon={ArrowLeft01Icon} size={21} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MagicMeat Menu</Text>
        </View>

        <TouchableOpacity
          style={styles.searchCircleBtn}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <AppIcon icon={Search01Icon} size={18} color="#0F172A" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. FILTER ROW (Veg/Non-Veg Style Meat Filters & Sort By) */}
      <View style={styles.filterRow}>
        {/* Chicken Only Filter */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            quickFilter === 'chicken' && styles.filterPillActive,
          ]}
          onPress={() => setQuickFilter(quickFilter === 'chicken' ? 'all' : 'chicken')}
          activeOpacity={0.8}
        >
          <View style={styles.filterDotChicken} />
          <Text
            style={[
              styles.filterPillText,
              quickFilter === 'chicken' && styles.filterPillTextActive,
            ]}
          >
            Chicken Only
          </Text>
        </TouchableOpacity>

        {/* Mutton Only Filter */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            quickFilter === 'mutton' && styles.filterPillActive,
          ]}
          onPress={() => setQuickFilter(quickFilter === 'mutton' ? 'all' : 'mutton')}
          activeOpacity={0.8}
        >
          <View style={styles.filterDotMutton} />
          <Text
            style={[
              styles.filterPillText,
              quickFilter === 'mutton' && styles.filterPillTextActive,
            ]}
          >
            Mutton Only
          </Text>
        </TouchableOpacity>

        {/* Sort By Toggle */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            sortOption !== 'default' && styles.filterPillActive,
          ]}
          onPress={handleCycleSort}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterPillText,
              sortOption !== 'default' && styles.filterPillTextActive,
            ]}
          >
            Sort by {sortOption === 'asc' ? '₹ Low' : sortOption === 'desc' ? '₹ High' : ''}
          </Text>
          <AppIcon
            icon={Sorting01Icon}
            size={12}
            color={sortOption !== 'default' ? '#DC2626' : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      {/* 3. HORIZONTAL CATEGORY TABS WITH RED UNDERLINE */}
      <View style={styles.categoryTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeMenuCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryTabItem}
                onPress={() => {
                  setSelectedCategory(cat.id as MeatCategory);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isActive && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
                {isActive && <View style={styles.redUnderlineBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Fixed Category List Button */}
        <TouchableOpacity
          style={styles.categoryListBtn}
          onPress={() => {
            setSelectedCategory('all');
          }}
          activeOpacity={0.7}
        >
          <AppIcon icon={FilterIcon} size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* 4. MAIN FEED FLATLIST (VIRTUALIZED FOR 120 FPS SCROLL) */}
      <FlatList
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.feedContainer,
          isDesktop && styles.desktopFeedContainer,
        ]}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: contentWidth, alignItems: 'center' }}>
            <DominosCard
              product={item}
              cardWidth="100%"
              variant="feed"
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={[styles.sectionHeadingRow, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.sectionHeadingLine} />
            <Text style={styles.sectionHeadingText}>{currentCategoryLabel}</Text>
            <View style={styles.sectionHeadingLine} />
          </View>
        }
        ListFooterComponent={
          filtered.length === 0 ? (
            <View style={[styles.emptyContainer, { width: contentWidth, alignSelf: 'center' }]}>
              <Text style={styles.emptyTitle}>No matching cuts in this category</Text>
              <Text style={styles.emptySubtext}>
                Try clearing filters or switching category tabs above.
              </Text>
            </View>
          ) : (
            <View style={{ height: 110 }} />
          )
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        overScrollMode="never"
      />

      <FloatingCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  searchCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  filterPillActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  filterDotChicken: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  filterDotMutton: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  filterPillText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  categoryTabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 22,
  },
  categoryTabItem: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    position: 'relative',
  },
  categoryTabText: {
    color: '#6B7280',
    fontSize: 13.5,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  redUnderlineBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#DC2626',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  categoryListBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  desktopFeedContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 16,
  },
  sectionHeadingLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionHeadingText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 4,
  },
});
