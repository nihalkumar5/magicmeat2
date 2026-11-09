import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';
import { PRODUCTS } from '../data/mockData';
import { Product } from '../types';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import { StatusBar } from 'expo-status-bar';
import {
  AppIcon,
  ArrowLeft02Icon,
  Search01Icon,
  Cancel01Icon,
  Clock01Icon,
  FireIcon,
  PlusSignIcon,
  MinusSignIcon,
  CheckmarkBadge01Icon,
} from '../components/HugeIcon';

const TRENDING_KEYWORDS = [
  'Chicken Curry Cut',
  'Boneless Breast',
  'Goat Mutton',
  'Biryani Cut',
  'White Prawns',
  'Peri-Peri Wings',
  'Country Brown Eggs',
  'Mutton Keema',
];

const SEARCH_CATEGORIES = [
  { id: 'chicken', name: 'Fresh Chicken', icon: '🍗', color: '#FEF2F2', borderColor: '#FECACA' },
  { id: 'mutton', name: 'Prime Mutton', icon: '🥩', color: '#FFF7ED', borderColor: '#FED7AA' },
  { id: 'fish', name: 'Fish & Prawns', icon: '🦐', color: '#EFF6FF', borderColor: '#BFDBFE' },
  { id: 'eggs', name: 'Farm Fresh Eggs', icon: '🥚', color: '#FEFCE8', borderColor: '#FEF08A' },
  { id: 'ready-to-cook', name: 'Ready to Cook', icon: '🔥', color: '#FAF5FF', borderColor: '#E9D5FF' },
  { id: 'fresh-produce', name: 'Veggies & Fruits', icon: '🥕', color: '#F0FDF4', borderColor: '#BBF7D0' },
];

const SYNONYM_MAP: Record<string, string[]> = {
  chicken: ['murga', 'murgi', 'poultry', 'desi', 'tangdi', 'leg piece', 'wings', 'breast', 'chiken', 'chikn'],
  mutton: ['gosht', 'bakra', 'goat', 'lamb', 'boti', 'chaap', 'nalli', 'keema', 'matan', 'muton'],
  fish: ['machli', 'macchi', 'prawns', 'jhinga', 'seafood', 'shrimp', 'rohu', 'katla', 'surmai'],
  eggs: ['anda', 'ande', 'desi anda', 'brown eggs', 'egg', 'poultry eggs', 'tray'],
  'ready-to-cook': ['rtc', 'marinated', 'wings', 'peri peri', 'peri-peri', 'tikka', 'kebab', 'fry'],
  'fresh-produce': ['aloo', 'pyaz', 'tamatar', 'onion', 'potato', 'tomato', 'adrak', 'lehsun', 'garlic', 'ginger', 'dhaniya', 'kela', 'banana', 'seb', 'apple', 'orange', 'santra', 'amrood', 'guava', 'angur', 'grapes', 'veggies', 'fruits', 'sabzi'],
  biryani: ['dum', 'biriyani', 'biryani cut', 'pulao', 'dum biryani'],
  keema: ['mince', 'kheema', 'qeema', 'ground meat', 'fine keema'],
  curry: ['gravy', 'salan', 'curry cut', 'bone-in', 'korma', 'curry cut medium'],
  boneless: ['cubes', 'breast', 'fillet', 'tikka', 'lean', 'no bone', 'boneless breast'],
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Chicken Curry Cut',
    'Boneless Breast',
    'Goat Mutton',
  ]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'under300' | 'highprotein'>('all');

  const { cart, addToCart, updateQuantity, setCustomizerProduct } = useStore();
  const inputRef = useRef<any>(null);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  // Auto focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectKeyword = (kw: string) => {
    setSearchQuery(kw);
    // Add to recent searches
    setRecentSearches((prev) => [kw, ...prev.filter((item) => item !== kw)].slice(0, 6));
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  // Search matching algorithm
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    // Split words
    const queryWords = q.split(/\s+/).filter(Boolean);

    return PRODUCTS.filter((product) => {
      const pName = product.name.toLowerCase();
      const pHindi = (product.hindiTitle || '').toLowerCase();
      const pDesc = product.description.toLowerCase();
      const pCat = product.category.toLowerCase();

      // Check cuts
      const cutNames = product.availableCuts.map((c) => c.name.toLowerCase()).join(' ');
      const cutDescs = product.availableCuts.map((c) => c.description.toLowerCase()).join(' ');
      const cutBestFor = product.availableCuts.map((c) => c.bestFor.toLowerCase()).join(' ');

      const combinedProductText = `${pName} ${pHindi} ${pDesc} ${pCat} ${cutNames} ${cutDescs} ${cutBestFor}`;

      // Check each query word or its synonyms
      const matchesAllWords = queryWords.every((word) => {
        // Direct substring match
        if (combinedProductText.includes(word)) return true;

        // Check if word maps to any category/keyword synonyms
        for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
          const matchKey = word === key || synonyms.includes(word);
          if (matchKey) {
            if (pCat === key || combinedProductText.includes(key)) return true;
            if (synonyms.some((s) => combinedProductText.includes(s))) return true;
          }
        }

        return false;
      });

      if (!matchesAllWords) return false;

      // Apply secondary filters
      if (activeFilter === 'under300' && product.basePrice > 300) return false;
      if (activeFilter === 'highprotein' && (product.macros?.proteinGrams || 0) < 20) return false;

      return true;
    });
  }, [searchQuery, activeFilter]);

  const handleAddProduct = (product: Product) => {
    if (product.availableCuts.length > 1) {
      setCustomizerProduct(product);
    } else {
      addToCart(product, product.availableCuts[0], true, 1);
    }
  };

  const getProductCartItem = (productId: string) => {
    return cart.find((item) => item.product.id === productId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
        {/* Top Search Bar Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <AppIcon icon={ArrowLeft02Icon} size={22} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <AppIcon icon={Search01Icon} size={18} color="#DC2626" strokeWidth={2.2} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search chicken, mutton, prawns, eggs..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  handleSelectKeyword(searchQuery.trim());
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <AppIcon icon={Cancel01Icon} size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            cart.length > 0 && { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
          overScrollMode="never"
        >
          {/* STATE 1: Empty Query - Show Discover & History */}
          {searchQuery.trim().length === 0 ? (
            <View style={styles.discoveryWrapper}>
              {/* Recent Searches (if available) */}
              {recentSearches.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleWithIcon}>
                      <AppIcon icon={Clock01Icon} size={16} color="#64748B" />
                      <Text style={styles.sectionTitle}>Recent Searches</Text>
                    </View>
                    <TouchableOpacity onPress={handleClearRecent} activeOpacity={0.7}>
                      <Text style={styles.clearActionText}>Clear</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.chipsWrap}>
                    {recentSearches.map((item, idx) => (
                      <TouchableOpacity
                        key={`recent-${idx}`}
                        style={styles.recentChip}
                        onPress={() => handleSelectKeyword(item)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                      >
                        <Text style={styles.recentChipText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Trending Searches */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionTitleWithIcon}>
                  <AppIcon icon={FireIcon} size={17} color="#DC2626" />
                  <Text style={styles.sectionTitle}>Trending Meats Today</Text>
                </View>

                <View style={styles.chipsWrap}>
                  {TRENDING_KEYWORDS.map((item, idx) => (
                    <TouchableOpacity
                      key={`trend-${idx}`}
                      style={styles.trendingChip}
                      onPress={() => handleSelectKeyword(item)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                    >
                      <Text style={styles.trendingChipFlame}>🔥</Text>
                      <Text style={styles.trendingChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Browse by Meat Category */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Explore by Category</Text>
                <View style={styles.categoryGrid}>
                  {SEARCH_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryCard,
                        { backgroundColor: cat.color, borderColor: cat.borderColor },
                      ]}
                      onPress={() => handleSelectKeyword(cat.name)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                    >
                      <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                      <Text style={styles.categoryCardName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cold Chain Guarantee Banner */}
              <View style={styles.guaranteeBanner}>
                <View style={styles.guaranteeIconCircle}>
                  <AppIcon icon={CheckmarkBadge01Icon} size={20} color="#059669" />
                </View>
                <View style={styles.guaranteeTextCol}>
                  <Text style={styles.guaranteeTitle}>30-Min Cold-Chain Delivery</Text>
                  <Text style={styles.guaranteeSub}>
                    Temperature controlled at 0°C to 4°C. 100% antibiotic & chemical free.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            /* STATE 2: Active Query - Show Live Results */
            <View style={styles.resultsWrapper}>
              {/* Meta bar with result count & filters */}
              <View style={styles.resultsMetaBar}>
                <Text style={styles.resultsCountText}>
                  {searchResults.length > 0
                    ? `Found ${searchResults.length} fresh meats for "${searchQuery}"`
                    : `No results for "${searchQuery}"`}
                </Text>

                {searchResults.length > 0 && (
                  <View style={styles.filterRow}>
                    <TouchableOpacity
                      style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
                      onPress={() => setActiveFilter('all')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          activeFilter === 'all' && styles.filterPillTextActive,
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterPill,
                        activeFilter === 'under300' && styles.filterPillActive,
                      ]}
                      onPress={() =>
                        setActiveFilter(activeFilter === 'under300' ? 'all' : 'under300')
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          activeFilter === 'under300' && styles.filterPillTextActive,
                        ]}
                      >
                        Under ₹300
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterPill,
                        activeFilter === 'highprotein' && styles.filterPillActive,
                      ]}
                      onPress={() =>
                        setActiveFilter(activeFilter === 'highprotein' ? 'all' : 'highprotein')
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          activeFilter === 'highprotein' && styles.filterPillTextActive,
                        ]}
                      >
                        High Protein
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Product Cards List */}
              {searchResults.length > 0 ? (
                <View style={styles.productsList}>
                  {searchResults.map((product) => {
                    const cartItem = getProductCartItem(product.id);
                    const qtyInCart = cartItem ? cartItem.quantity : 0;
                    const discountPercent = product.originalPrice
                      ? Math.round(
                          ((product.originalPrice - product.basePrice) / product.originalPrice) * 100
                        )
                      : 0;

                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.searchProductCard}
                        onPress={() =>
                          router.push({
                            pathname: '/product/[id]',
                            params: { id: product.id },
                          })
                        }
                        activeOpacity={0.92}
                      >
                        {/* Left: Product Thumbnail */}
                        <View style={styles.cardImageWrapper}>
                          <Image
                            source={{ uri: optimizeImageUrl(product.image, 240) }}
                            style={styles.cardImage}
                            resizeMode="cover"
                            fadeDuration={0}
                          />
                          {discountPercent > 0 && (
                            <View style={styles.cardDiscountBadge}>
                              <Text style={styles.cardDiscountText}>{discountPercent}% OFF</Text>
                            </View>
                          )}
                          <View style={styles.cardSpeedBadge}>
                            <Text style={styles.cardSpeedText}>30 MINS</Text>
                          </View>
                        </View>

                        {/* Middle: Details */}
                        <View style={styles.cardDetailsCol}>
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {product.name}
                          </Text>

                          {product.hindiTitle && (
                            <Text style={styles.cardHindiTitle} numberOfLines={1}>
                              {product.hindiTitle}
                            </Text>
                          )}

                          <View style={styles.cardSpecsRow}>
                            <Text style={styles.cardSpecText}>
                              {product.netWeight} Net • {product.pieces}
                            </Text>
                          </View>

                          <View style={styles.cardPriceRow}>
                            <Text style={styles.cardPrice}>₹{product.basePrice}</Text>
                            {product.originalPrice && (
                              <Text style={styles.cardOrigPrice}>₹{product.originalPrice}</Text>
                            )}
                          </View>

                          {product.availableCuts.length > 1 && (
                            <Text style={styles.cardCustomizableHint}>Customizable cuts</Text>
                          )}
                        </View>

                        {/* Right: Add to Cart Button */}
                        <View style={styles.cardActionCol}>
                          {qtyInCart === 0 ? (
                            <TouchableOpacity
                              style={styles.addBtn}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleAddProduct(product);
                              }}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.addBtnText}>ADD</Text>
                              <AppIcon icon={PlusSignIcon} size={14} color="#DC2626" strokeWidth={2.5} />
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.quantityStepper}>
                              <TouchableOpacity
                                style={styles.stepperMinus}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  if (cartItem) updateQuantity(cartItem.cartItemId, -1);
                                }}
                                activeOpacity={0.8}
                              >
                                <AppIcon icon={MinusSignIcon} size={14} color="#FFFFFF" strokeWidth={2.5} />
                              </TouchableOpacity>

                              <Text style={styles.stepperQtyText}>{qtyInCart}</Text>

                              <TouchableOpacity
                                style={styles.stepperPlus}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  if (cartItem) updateQuantity(cartItem.cartItemId, 1);
                                }}
                                activeOpacity={0.8}
                              >
                                <AppIcon icon={PlusSignIcon} size={14} color="#FFFFFF" strokeWidth={2.5} />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                /* Senior UI/UX Empty Result State */
                <View style={styles.emptyResultsBox}>
                  <Image
                    source={require('../../assets/illustrations/search_not_found.png')}
                    style={styles.emptySearchIllustration}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyTitle}>No exact cuts found</Text>
                  <Text style={styles.emptySubtitle}>
                    We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try exploring our bestsellers:
                  </Text>

                  <View style={styles.emptySuggestionsRow}>
                    {['Chicken Curry Cut', 'Prime Mutton', 'Boneless Breast', 'Farm Eggs', 'White Prawns'].map(
                      (item, idx) => (
                        <TouchableOpacity
                          key={`sugg-${idx}`}
                          style={styles.emptySuggestionPill}
                          onPress={() => handleSelectKeyword(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.emptySuggestionText}>{item}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Global Floating Cart Bar */}
        <FloatingCartBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
    position: 'relative',
  },
  desktopContainer: {
    maxWidth: 760,
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  searchInputContainer: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  discoveryWrapper: {
    padding: 16,
    gap: 24,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  clearActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  trendingChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingChipFlame: {
    fontSize: 12,
  },
  trendingChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  guaranteeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  guaranteeSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  resultsWrapper: {
    padding: 14,
    gap: 12,
  },
  resultsMetaBar: {
    gap: 10,
    marginBottom: 4,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  productsList: {
    gap: 12,
  },
  searchProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardDiscountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardDiscountText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  cardSpeedBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardSpeedText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  cardHindiTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardSpecsRow: {
    marginTop: 4,
  },
  cardSpecText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
  },
  cardOrigPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  cardCustomizableHint: {
    fontSize: 9.5,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  cardActionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  addBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperMinus: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
  },
  stepperPlus: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginVertical: 16,
  },
  emptySearchIllustration: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptySuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
  },
  emptySuggestionPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  emptySuggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
