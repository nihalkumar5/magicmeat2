import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DominosCard } from '../../components/DominosCard';
import { ProductCard } from '../../components/ProductCard';
import { FloatingCartBar } from '../../components/FloatingCartBar';
import { PRODUCTS } from '../../data/mockData';
import { useStore } from '../../store/useStore';
import { MeatCategory, Product } from '../../types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import {
  AppIcon,
  Location01Icon,
  ChevronDownIcon,
  UserIcon,
  ShoppingCart01Icon,
  Search01Icon,
  SnowflakeIcon,
  CrownIcon,
  CheckmarkBadge01Icon,
  FireIcon,
  ChefHatIcon,
  ShieldCheckIcon,
  BeefIcon,
  DeliveryTruck01Icon,
  ShoppingBag01Icon,
  Restaurant01Icon,
  WeightScaleIcon,
  FlashIcon,
  PlayIcon,
} from '../../components/HugeIcon';

const VIDEO_RECIPES = [
  {
    id: 'vr1',
    title: "Kerala's Popular Biryani",
    subtitle: 'Thalassery dum chicken recipe',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vr2',
    title: 'Tandoori Chicken',
    subtitle: 'Oven roasted tangdi kebab',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vr3',
    title: 'Chicken 65',
    subtitle: 'Crispy spicy street style fry',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  },
];

// Final 6 Essential Craving Categories (3-Column Circular Grid)
const CRAVING_CATEGORIES = [
  {
    id: 'chicken' as MeatCategory,
    name: 'Chicken',
    badge: 'NEW',
    image:
      'https://images.openai.com/static-rsc-4/DiAfMt2-_cudu3XhayYwgkM80HyCWfEKoYkN_vPekcx_Ym2NuGHrP53p44pkiJch-12eKOy8Yk7vq2apt0hZOB2LLW23VXMGdPtTOn0ySvqZ2C1VIM2We9xAcYJHMMupGbTaqSK1r2iWm67D7Zui3JI6OlnzfpGy2kn7SyE8ZMc?purpose=inline',
  },
  {
    id: 'mutton' as MeatCategory,
    name: 'Mutton',
    image:
      'https://images.openai.com/static-rsc-4/TACdPw9Q6Gm8AjGk-ANfnGAHbaMqyua2lMcZxHBK2Ss2YMiqvVo288wHckubG6AP3YUAOWmLy_KbI-wXlzQB4GoVQr8g7McF3sAstqeZH7oPUiLfm9yNVzVjCg1w8_oXPTJs00woICYIguupUgGmiL-HHqXmrbzWCqPjT8gQW70?purpose=inline',
  },
  {
    id: 'fish' as MeatCategory,
    name: 'Seafood',
    image:
      'https://images.openai.com/static-rsc-4/gkcbQBXEuEr3hyM8m7rGARiglW2LXz9KI1BZ4reSXTwJdbJhdb1Bzu-q21hOmUMbhJbNJ5PXa-GDbWmavaUTGRJzNjpaJfA8i87Y_FTGFX6w1RPZoNv_jFm-rYuxoynT2rmGNxyFojyxqgblE36UNHX8KNiTnaF_2AoNDmyJ2UM?purpose=inline',
  },
  {
    id: 'eggs' as MeatCategory,
    name: 'Eggs',
    image:
      'https://images.openai.com/static-rsc-4/rYgTuoQGG91BWdtto4NxfrBcTwlN9KKy6OhR0L4HnRaQzRyMxmI1b917lEjLtwgWhnIsMEwG0hinRYTVChvdbiOI_IF35SUqKvNmaPtwipT6gxCJw6NxqE-jj880MSoVXrFWe85zbXfRSMcBesuVE5BWcOlyziziOVRfKz8OeUM?purpose=inline',
  },
  {
    id: 'ready-to-cook' as MeatCategory,
    name: 'Chicken Wings',
    badge: 'NEW',
    image:
      'https://images.openai.com/static-rsc-4/j8EyQ2DuPjETzuzTPshiUCKX2DXozL6DzEJQ8PYuI81albvjoRqUdd8Q3TnYNEBRLqen6AntVn6zg7dYjnKrt9SiTSjNVkYGvCMgBzdBnD1gRQcA0aVySqLqboep_bA06fjbp1R4vvs_gUywRJpHu5FoPEPfw8WriqQSNFxU46U?purpose=inline',
  },
  {
    id: 'all' as MeatCategory,
    name: 'Combos',
    badge: 'NEW',
    image:
      'https://images.openai.com/static-rsc-4/W7JbAS73BeSV16U__OGAobH4wAJ_t--Ml_fNlvAcEhk4g4Z5aylob5QUC7yK885FDJZGX6QHUfz1YftE1TxOOvkFHcga9OPXavSFZX9vy1_qHNgnDi4pXZSMo2YyleO8DimMtBUx7KCQrm3Uiih9vUvVg4J_o5SNqmmSFkIaBfw?purpose=inline',
  },
];

const SEARCH_KEYWORDS = [
  'Chicken Curry Cut',
  'Rich Goat Mutton',
  'Boneless Breast',
  'White Sea Prawns',
  'Dum Biryani Cut',
  'Farm Fresh Eggs',
  'Peri-Peri Wings',
];

const HERO_SLIDES = [
  {
    id: 'slide-chicken-table',
    image: require('../../../assets/hero/hero_chicken_table.png'),
    targetCategory: 'chicken' as MeatCategory,
    productId: 'c1',
  },
  {
    id: 'slide-chicken-breast',
    image: require('../../../assets/hero/hero_chicken_breast.png'),
    targetCategory: 'chicken' as MeatCategory,
    productId: 'c2',
  },
  {
    id: 'slide-fresh-eggs',
    image: require('../../../assets/hero/hero_fresh_eggs.png'),
    targetCategory: 'eggs' as MeatCategory,
    productId: 'e1',
  },
  {
    id: 'slide-meals-packaging',
    image: require('../../../assets/hero/hero_meals_packaging.png'),
    targetCategory: 'all' as MeatCategory,
    productId: 'c1',
  },
];

type OrderType = 'delivery' | 'takeaway' | 'dinein';

const AnimatedSearchCapsule = React.memo(function AnimatedSearchCapsule() {
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [searchFadeAnim] = useState(() => new Animated.Value(1));
  const [searchSlideAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(searchFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(searchSlideAnim, {
          toValue: -6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setKeywordIndex((prev) => (prev + 1) % SEARCH_KEYWORDS.length);
        searchSlideAnim.setValue(6);
        Animated.parallel([
          Animated.timing(searchFadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(searchSlideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [searchFadeAnim, searchSlideAnim]);

  return (
    <TouchableOpacity
      style={styles.searchCapsule}
      activeOpacity={0.9}
      onPress={() => router.push('/search')}
      accessibilityRole="button"
    >
      <AppIcon icon={Search01Icon} size={22} color="#DC2626" strokeWidth={2.2} />
      <View style={styles.searchPlaceholderRow}>
        <Text style={styles.searchStaticPrefix}>Search for </Text>
        <Animated.View
          style={{
            opacity: searchFadeAnim,
            transform: [{ translateY: searchSlideAnim }],
            flexShrink: 1,
          }}
        >
          <Text style={styles.searchDynamicWord} numberOfLines={1}>
            {SEARCH_KEYWORDS[keywordIndex]}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
});
AnimatedSearchCapsule.displayName = 'AnimatedSearchCapsule';

interface HeroProps {
  width: number;
  heroBannerHeight: number;
  onSelectSlide: (targetCategory: MeatCategory, productId: string) => void;
}

const HeroBannerCarousel = React.memo<HeroProps>(function HeroBannerCarousel({
  width,
  heroBannerHeight,
  onSelectSlide,
}) {
  const heroScrollRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroScrollRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [width]);

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide && slideIndex >= 0 && slideIndex < HERO_SLIDES.length) {
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <>
      <View style={[styles.heroCarouselContainer, { height: heroBannerHeight }]}>
        <ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleHeroScroll}
          scrollEventThrottle={32}
          style={styles.heroScrollView}
        >
          {HERO_SLIDES.map((slide) => (
            <TouchableOpacity
              key={slide.id}
              style={[styles.heroSlideItem, { width, height: heroBannerHeight }]}
              activeOpacity={0.95}
              onPress={() => onSelectSlide(slide.targetCategory, slide.productId)}
            >
              <Image
                source={slide.image}
                style={styles.heroSlideImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.heroTickerStrip}>
        <Text style={styles.heroTickerText}>
          LOWEST PRICES ONLY ON MAGICMEAT APP | FREE EXPRESS COLD-CHAIN DELIVERY
        </Text>
      </View>

      <View style={styles.heroPaginationRow}>
        {HERO_SLIDES.map((_, idx) => {
          const isActive = currentSlide === idx;
          if (isActive) {
            return (
              <View key={`hero-dot-${idx}`} style={styles.paginationActivePill}>
                <Text style={styles.paginationActivePillText}>
                  {idx + 1}/{HERO_SLIDES.length}
                </Text>
              </View>
            );
          }
          return (
            <TouchableOpacity
              key={`hero-dot-${idx}`}
              onPress={() => {
                setCurrentSlide(idx);
                heroScrollRef.current?.scrollTo({
                  x: idx * width,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
              style={styles.paginationInactiveDot}
            />
          );
        })}
      </View>
    </>
  );
});
HeroBannerCarousel.displayName = 'HeroBannerCarousel';

export default function HomeScreen() {
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const currentLocation = useStore((state) => state.currentLocation);
  const setLocationModalOpen = useStore((state) => state.setLocationModalOpen);
  const orderFulfillment = useStore((state) => state.orderFulfillment);
  const cartCount = useStore((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const cartTotal = useStore((state) => state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

  const [activeOrderType, setActiveOrderType] = useState<OrderType>('takeaway');
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const heroBannerHeight = isDesktop ? 480 : Math.round(width * 1.25);

  const popularDelights = useMemo(() => PRODUCTS.slice(0, 5), []);
  const top10Products = useMemo(() => PRODUCTS.slice(0, 10), []);
  const seafoodProducts = useMemo(() => PRODUCTS.filter((p) => p.category === 'fish'), []);
  const muttonProducts = useMemo(() => PRODUCTS.filter((p) => p.category === 'mutton'), []);
  const nearYouProducts = useMemo(
    () =>
      [
        PRODUCTS.find((p) => p.id === 'c7'),
        PRODUCTS.find((p) => p.id === 'c2'),
        PRODUCTS.find((p) => p.id === 'f1'),
        PRODUCTS.find((p) => p.id === 'rtc1'),
        PRODUCTS.find((p) => p.id === 'm2'),
        PRODUCTS.find((p) => p.id === 'c3'),
        PRODUCTS.find((p) => p.id === 'e1'),
        PRODUCTS.find((p) => p.id === 'f2'),
        PRODUCTS.find((p) => p.id === 'c1'),
        PRODUCTS.find((p) => p.id === 'm1'),
      ].filter((p): p is Product => Boolean(p)),
    []
  );

  const handleOpenLocationModal = () => {
    if (isDesktop) {
      setLocationModalOpen(true);
    } else {
      router.push('/location-select');
    }
  };

  const handleSlideSelect = (targetCategory: MeatCategory, productId: string) => {
    setSelectedCategory(targetCategory);
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  };

  /* ================================================================= */
  /* DESKTOP VIEW (100% FULL WIDTH - EXACT DOMINO'S DESKTOP WEBSITE)   */
  /* ================================================================= */
  if (isDesktop) {
    return (
      <SafeAreaView style={styles.desktopSafeArea}>
        {/* 1. TOP LUXURY HEADER (FLAGSHIP ARTISAN BUTCHERY) */}
        <View style={styles.desktopTopHeader}>
          {/* Left: Brandmark + Location */}
          <View style={styles.desktopTopLeftGroup}>
            <TouchableOpacity
              style={styles.desktopBrandCol}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <View style={styles.brandLogoRow}>
                <View style={styles.brandEmblemBox}>
                  <AppIcon icon={BeefIcon} size={22} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.brandNameBold}>MAGIC</Text>
                    <Text style={styles.brandNameRed}>MEAT</Text>
                  </View>
                  <Text style={styles.brandTagline}>THE ARTISAN BUTCHERY</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.desktopHeaderDivider} />

            {/* Location Selector */}
            <TouchableOpacity
              style={styles.desktopLocationBlock}
              onPress={handleOpenLocationModal}
              activeOpacity={0.8}
            >
              <View style={styles.desktopLocationRow}>
                <AppIcon icon={Location01Icon} size={14} color="#E52320" strokeWidth={2.5} />
                <Text style={styles.desktopTakeawayText}>
                  {activeOrderType === 'delivery'
                    ? 'Delivery to'
                    : activeOrderType === 'takeaway'
                    ? 'Takeaway from'
                    : 'Feast Store at'}
                </Text>
                <AppIcon icon={ChevronDownIcon} size={13} color="#E52320" strokeWidth={2.5} />
              </View>
              <Text style={styles.desktopAddressText} numberOfLines={1}>
                {currentLocation.shortAddress.toUpperCase()} · {currentLocation.city.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center: Omni-Search Bar */}
          <TouchableOpacity
            style={styles.desktopSearchBar}
            onPress={() => router.push('/search')}
            activeOpacity={0.9}
            accessibilityRole="button"
          >
            <AppIcon icon={Search01Icon} size={16} color="#DC2626" strokeWidth={2} />
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
              <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500' }}>Search for </Text>
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>
                Fresh Chicken, Mutton, Fish...
              </Text>
            </View>
            <View style={styles.desktopSearchKbd}>
              <Text style={styles.desktopSearchKbdText}>⌘K</Text>
            </View>
          </TouchableOpacity>

          {/* Right: Trust Badges, Profile & Basket */}
          <View style={styles.desktopTopRightGroup}>
            <View style={styles.desktopTrustPill}>
              <View style={styles.desktopTrustDot} />
              <Text style={styles.desktopTrustText}>Chilled 0-4°C</Text>
            </View>

            <TouchableOpacity
              style={styles.desktopProfileBtn}
              onPress={() => router.push('/profile-menu')}
              activeOpacity={0.8}
            >
              <AppIcon icon={UserIcon} size={16} color="#0F172A" />
              <Text style={styles.desktopProfileText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.desktopHeaderCartBtn}
              onPress={() => router.push('/(tabs)/cart')}
              activeOpacity={0.85}
            >
              <AppIcon icon={ShoppingCart01Icon} size={16} color="#FFFFFF" />
              <Text style={styles.desktopHeaderCartText}>
                {cartCount > 0 ? `${cartCount} Items • ₹${cartTotal}` : 'Basket'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. FULL-WIDTH OBSIDIAN COLD-CHAIN RIBBON */}
        <View style={styles.desktopBlueStrip}>
          <View style={styles.desktopBlueLeft}>
            <View style={styles.desktopPinCircle}>
              <AppIcon icon={SnowflakeIcon} size={15} color="#38BDF8" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.desktopBlueTitle}>
                  {currentLocation.shortAddress} Hub
                </Text>
                <View style={styles.desktopHubBadge}>
                  <Text style={styles.desktopHubBadgeText}>COLD-CHAIN ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.desktopBlueSub}>
                Delivering in {currentLocation.deliveryEta} · {currentLocation.distanceKm} km from dark store · 0-4°C certified
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.desktopDetectBtn}
            onPress={handleOpenLocationModal}
            activeOpacity={0.8}
          >
            <AppIcon icon={Location01Icon} size={13} color="#FFFFFF" />
            <Text style={styles.desktopDetectBtnText}>Change location</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.desktopScrollView}
          contentContainerStyle={styles.desktopScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 3. SEGMENTED 3-WAY ORDER CONTROL (MODERN LUXURY PILL SLIDER) */}
          <View style={styles.desktopSegmentedWrapper}>
            <View style={styles.desktopSegmentedPillContainer}>
              {/* Delivery */}
              <TouchableOpacity
                style={[
                  styles.desktopSegmentPill,
                  activeOrderType === 'delivery' && styles.desktopSegmentPillActive,
                ]}
                onPress={() => setActiveOrderType('delivery')}
                activeOpacity={0.85}
              >
                <AppIcon
                  icon={DeliveryTruck01Icon}
                  size={18}
                  color={activeOrderType === 'delivery' ? '#DC2626' : '#64748B'}
                  strokeWidth={2}
                />
                <View>
                  <Text
                    style={[
                      styles.desktopSegmentPillTitle,
                      activeOrderType === 'delivery' && styles.desktopSegmentPillTitleActive,
                    ]}
                  >
                    Delivery
                  </Text>
                  <Text style={styles.desktopSegmentPillSub}>15-20 Min Express</Text>
                </View>
              </TouchableOpacity>

              {/* Takeaway */}
              <TouchableOpacity
                style={[
                  styles.desktopSegmentPill,
                  activeOrderType === 'takeaway' && styles.desktopSegmentPillActive,
                ]}
                onPress={() => setActiveOrderType('takeaway')}
                activeOpacity={0.85}
              >
                <AppIcon
                  icon={ShoppingBag01Icon}
                  size={18}
                  color={activeOrderType === 'takeaway' ? '#DC2626' : '#64748B'}
                  strokeWidth={2}
                />
                <View>
                  <Text
                    style={[
                      styles.desktopSegmentPillTitle,
                      activeOrderType === 'takeaway' && styles.desktopSegmentPillTitleActive,
                    ]}
                  >
                    Takeaway
                  </Text>
                  <Text style={styles.desktopSegmentPillSub}>Pickup in 10 Mins</Text>
                </View>
              </TouchableOpacity>

              {/* Dine-in */}
              <TouchableOpacity
                style={[
                  styles.desktopSegmentPill,
                  activeOrderType === 'dinein' && styles.desktopSegmentPillActive,
                ]}
                onPress={() => setActiveOrderType('dinein')}
                activeOpacity={0.85}
              >
                <AppIcon
                  icon={Restaurant01Icon}
                  size={18}
                  color={activeOrderType === 'dinein' ? '#DC2626' : '#64748B'}
                  strokeWidth={2}
                />
                <View>
                  <Text
                    style={[
                      styles.desktopSegmentPillTitle,
                      activeOrderType === 'dinein' && styles.desktopSegmentPillTitleActive,
                    ]}
                  >
                    Dine-in
                  </Text>
                  <Text style={styles.desktopSegmentPillSub}>Artisan Feast Store</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. "WHAT ARE YOU CRAVING FOR?" (FULL WIDTH) */}
          <View style={styles.desktopSection}>
            <Text style={styles.desktopSectionHeading}>
              What are you craving for?
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopCravingRow}
            >
              {CRAVING_CATEGORIES.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.name}-${idx}`}
                  style={styles.desktopCravingItem}
                  onPress={() => setSelectedCategory(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.desktopCravingCircleBox}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.desktopCravingCircleImg}
                    />
                    {item.badge && (
                      <View style={styles.desktopYellowBadge}>
                        <Text style={styles.desktopYellowBadgeText}>
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.desktopCravingLabel} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 5. TOP 10 BESTSELLERS (ROYAL GOLDEN SECTION - EXACT DOMINO'S MATCH) */}
          <View style={styles.top10RoyalContainer}>
            <View style={styles.top10HeaderBlock}>
              <View style={styles.top10CrownRow}>
                <View style={styles.top10AccentLine} />
                <AppIcon icon={CrownIcon} size={26} color="#D97706" />
                <View style={styles.top10AccentLine} />
              </View>
              <Text style={styles.top10Heading}>Top 10 Bestsellers</Text>
              <View style={styles.top10LocationSub}>
                <AppIcon icon={Location01Icon} size={13} color="#B45309" strokeWidth={2.5} />
                <Text style={styles.top10CityText}>
                  In {currentLocation.city || 'Raipur'}
                </Text>
              </View>
            </View>

            {/* Full-width Horizontal Scroll of 10 Cards with Golden Bookmark Ribbon */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopShelfCards}
            >
              {PRODUCTS.slice(0, 10).map((product, idx) => (
                <DominosCard
                  key={`top10-${product.id}`}
                  product={product}
                  cardWidth={330}
                  isTop10={true}
                  rank={idx + 1}
                />
              ))}
            </ScrollView>
          </View>

          {/* 6. POPULAR BUTCHERY DELIGHTS (SHELF 1 - EXACT DOMINO'S CARDS) */}
          <View style={styles.desktopSection}>
            <View style={styles.shelfHeaderRow}>
              <View style={styles.shelfTitleGroup}>
                <AppIcon icon={CheckmarkBadge01Icon} size={24} color="#F59E0B" />
                <View>
                  <Text style={styles.shelfTitle}>Popular Butchery Delights</Text>
                  <Text style={styles.shelfSub}>
                    FREE Delivery For Orders Above ₹149
                  </Text>
                </View>
              </View>
            </View>

            {/* Full-width Horizontal Cards Shelf (Width 330px per card) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopShelfCards}
            >
              {popularDelights.map((product) => (
                <DominosCard key={product.id} product={product} cardWidth={330} />
              ))}
            </ScrollView>
          </View>

          {/* 6. GARLIC WINGS & GOURMET DIPS (SHELF 2) */}
          <View style={styles.desktopSection}>
            <View style={styles.shelfHeaderRow}>
              <View style={styles.shelfTitleGroup}>
                <AppIcon icon={FireIcon} size={24} color="#EF4444" />
                <View>
                  <Text style={styles.shelfTitle}>
                    Garlic Wings &amp; Gourmet Dips
                  </Text>
                  <Text style={styles.shelfSub}>
                    Best Companions To Your Feast · Ready in 10 Mins
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopShelfCards}
            >
              {PRODUCTS.filter(
                (p) => p.category === 'ready-to-cook' || p.badge?.includes('Cook')
              ).concat(PRODUCTS.slice(0, 3)).map((product) => (
                <DominosCard key={product.id} product={product} cardWidth={330} />
              ))}
            </ScrollView>
          </View>

          {/* 7. PRIME MUTTON & BIRYANI FEAST (SHELF 3) */}
          <View style={styles.desktopSection}>
            <View style={styles.shelfHeaderRow}>
              <View style={styles.shelfTitleGroup}>
                <AppIcon icon={ChefHatIcon} size={24} color="#10B981" />
                <View>
                  <Text style={styles.shelfTitle}>
                    Prime Mutton &amp; Biryani Feast
                  </Text>
                  <Text style={styles.shelfSub}>
                    Grass-Fed Tender Goat &amp; Slow-Dum Hand Cut Pieces
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopShelfCards}
            >
              {PRODUCTS.filter(
                (p) => p.category === 'mutton' || p.category === 'fish'
              ).concat(PRODUCTS.slice(0, 2)).map((product) => (
                <DominosCard key={product.id} product={product} cardWidth={330} />
              ))}
            </ScrollView>
          </View>

          {/* 8. BUTCHER'S QUALITY PROMISE GRID (4 LUXURY PILLARS) */}
          <View style={styles.desktopPromiseSection}>
            <View style={styles.desktopPromiseHeader}>
              <View style={styles.promiseAccentLine} />
              <Text style={styles.desktopPromiseTitle}>The MagicMeat Cold-Chain Promise</Text>
              <View style={styles.promiseAccentLine} />
            </View>
            <Text style={styles.desktopPromiseSub}>
              Farm-to-fork hygiene, scientific temperature control, and precision butchery in every cut.
            </Text>

            <View style={styles.desktopPromiseGrid}>
              <View style={styles.desktopPromiseCard}>
                <View style={[styles.promiseIconCircle, { backgroundColor: '#FEF2F2' }]}>
                  <AppIcon icon={WeightScaleIcon} size={22} color="#DC2626" />
                </View>
                <Text style={styles.promiseCardTitle}>100% Net Weight Yield</Text>
                <Text style={styles.promiseCardText}>
                  Weighed strictly after precision cleaning &amp; cutting. Zero excess fat, zero water glaze, 100% cooking yield.
                </Text>
              </View>

              <View style={styles.desktopPromiseCard}>
                <View style={[styles.promiseIconCircle, { backgroundColor: '#F0F9FF' }]}>
                  <AppIcon icon={SnowflakeIcon} size={22} color="#0284C7" />
                </View>
                <Text style={styles.promiseCardTitle}>Chilled at 0-4°C, Never Frozen</Text>
                <Text style={styles.promiseCardText}>
                  Constant thermal monitoring preserves natural cellular moisture and tenderness without ice crystals.
                </Text>
              </View>

              <View style={styles.desktopPromiseCard}>
                <View style={[styles.promiseIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <AppIcon icon={ShieldCheckIcon} size={22} color="#16A34A" />
                </View>
                <Text style={styles.promiseCardTitle}>Antibiotic &amp; Hormone-Free</Text>
                <Text style={styles.promiseCardText}>
                  Certified veterinary checks with complete flock traceability and zero artificial growth promoters.
                </Text>
              </View>

              <View style={styles.desktopPromiseCard}>
                <View style={[styles.promiseIconCircle, { backgroundColor: '#FFFBEB' }]}>
                  <AppIcon icon={FlashIcon} size={22} color="#D97706" />
                </View>
                <Text style={styles.promiseCardTitle}>15-20 Min Express Dark Store</Text>
                <Text style={styles.promiseCardText}>
                  Dispatched directly in sealed insulated thermal foil pouches with food-grade sub-zero gel chillers.
                </Text>
              </View>
            </View>
          </View>

          {/* 9. LUXURY DESKTOP FOOTER */}
          <View style={styles.desktopFooter}>
            <View style={styles.desktopFooterContent}>
              <View style={styles.desktopFooterColBrand}>
                <View style={styles.brandLogoRow}>
                  <View style={styles.brandEmblemBox}>
                    <AppIcon icon={BeefIcon} size={22} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.brandNameBold}>MAGIC</Text>
                      <Text style={styles.brandNameRed}>MEAT</Text>
                    </View>
                    <Text style={styles.brandTagline}>THE ARTISAN BUTCHERY</Text>
                  </View>
                </View>
                <Text style={styles.desktopFooterAbout}>
                  India&apos;s premier cold-chain artisanal butchery. Delivering gourmet farm-fresh poultry, grass-fed mutton, and pristine coastal seafood chilled at 0-4°C within 15-20 minutes.
                </Text>
                <View style={styles.fssaiRow}>
                  <AppIcon icon={ShieldCheckIcon} size={16} color="#10B981" />
                  <Text style={styles.fssaiText}>FSSAI Central License No. 10020042000123 • ISO 22000:2018 Certified</Text>
                </View>
              </View>

              <View style={styles.desktopFooterColLinks}>
                <Text style={styles.footerColTitle}>Fresh Butchery</Text>
                <Text style={styles.footerLink}>Farm Chicken Curry Cut</Text>
                <Text style={styles.footerLink}>Prime Boneless Breast</Text>
                <Text style={styles.footerLink}>Grass-Fed Mutton Chops</Text>
                <Text style={styles.footerLink}>Coastal White Prawns</Text>
              </View>

              <View style={styles.desktopFooterColLinks}>
                <Text style={styles.footerColTitle}>Cold-Chain Tech</Text>
                <Text style={styles.footerLink}>Sub-Zero Gel Chillers</Text>
                <Text style={styles.footerLink}>Thermal Pouch Packaging</Text>
                <Text style={styles.footerLink}>Dark Store Express Network</Text>
                <Text style={styles.footerLink}>Daily Lab Inspections</Text>
              </View>

              <View style={styles.desktopFooterColLinks}>
                <Text style={styles.footerColTitle}>Customer Care</Text>
                <Text style={styles.footerLink}>1800-MAGIC-MEAT</Text>
                <Text style={styles.footerLink}>support@magicmeat.in</Text>
                <Text style={styles.footerLink}>Live Delivery Tracking</Text>
                <Text style={styles.footerLink}>Terms &amp; Refund Promise</Text>
              </View>
            </View>

            <View style={styles.desktopFooterBottomBar}>
              <Text style={styles.desktopFooterCopy}>
                © 2026 MagicMeat Technologies Pvt Ltd. All rights reserved. Chilled at 2°C with pride in India.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ================================================================= */
  /* MOBILE VIEW (MATCHES APPROVED DOMINO'S MOBILE THEME)              */
  /* ================================================================= */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        removeClippedSubviews={Platform.OS === 'android'}
        overScrollMode="never"
        scrollEventThrottle={32}
      >
        {/* Top Dark Header */}
        <View style={styles.darkHeader}>
          {/* Row 1: Compact ETA Badge (54x54) + Delivery Location + Profile Button */}
          <View style={styles.topNavRow}>
            {/* Left: Compact Delivery Badge (54x54px) */}
            <View style={styles.etaContainer}>
              <Text style={styles.etaNumber}>
                {orderFulfillment === 'takeaway'
                  ? '10'
                  : Math.max(30, parseInt(currentLocation.deliveryEta?.match(/\d+/)?.[0] || '30', 10))}
              </Text>
              <Text style={styles.etaLabel}>MINS</Text>
            </View>

            {/* Center: Location Info (DELIVERING TO -> Primary Atal Nagar, Raipur ⌄ -> Subtitle) */}
            <TouchableOpacity
              style={styles.locationBlock}
              onPress={handleOpenLocationModal}
              activeOpacity={0.8}
            >
              <Text style={styles.deliveringToEyebrow}>
                {orderFulfillment === 'takeaway' ? 'PICKUP FROM' : 'DELIVERING TO'}
              </Text>
              <View style={styles.locationTitleRow}>
                <Text style={styles.locationNameBold} numberOfLines={1} ellipsizeMode="tail">
                  {currentLocation.shortAddress || 'Atal Nagar, Raipur'}
                </Text>
                <AppIcon icon={ChevronDownIcon} size={15} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.addressSubText} numberOfLines={1} ellipsizeMode="tail">
                {currentLocation.fullAddress || 'IIIT Naya Raipur, Chhattisgarh'}
              </Text>
            </TouchableOpacity>

            {/* Right: User Profile Button (42x42px) */}
            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => router.push('/profile-menu')}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <AppIcon icon={UserIcon} size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Row 2: Dynamic Search Bar (Primary) */}
          <View style={styles.searchRow}>
            <AnimatedSearchCapsule />
          </View>
        </View>

        {/* Hero Banner Carousel (4 Custom Images from Downloads) */}
        <HeroBannerCarousel
          width={width}
          heroBannerHeight={heroBannerHeight}
          onSelectSlide={handleSlideSelect}
        />

        {/* "What are you craving?" 3-Column Circular Grid */}
        <View style={styles.cravingSection}>
          <Text style={styles.cravingTitle}>What are you craving?</Text>

          <View style={styles.cravingGrid}>
            {CRAVING_CATEGORIES.map((cat, idx) => (
              <TouchableOpacity
                key={`cat-${cat.name}-${idx}`}
                style={styles.cravingGridItem}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cravingCircleWrapper}>
                  <Image
                    source={{ uri: cat.image }}
                    style={styles.cravingCircleImg}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                  {cat.badge && (
                    <View style={styles.cravingRedBadge}>
                      <Text style={styles.cravingRedBadgeText}>{cat.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cravingGridLabel} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Best Sellers Section (Lazizia Style Minimal Carousel) */}
        <View style={styles.mobileTop10Container}>
          <View style={styles.mobileTop10HeaderRow}>
            <View>
              <Text style={styles.mobileTop10Heading}>Best Sellers</Text>
              <Text style={styles.mobileTop10Subtitle}>Our customers&apos; all-time favourites</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileTop10Scroll}
            data={top10Products}
            keyExtractor={(item) => `m-top10-${item.id}`}
            renderItem={({ item, index }) => (
              <DominosCard
                product={item}
                cardWidth={170}
                isTop10={true}
                rank={index + 1}
              />
            )}
            getItemLayout={(_, index) => ({
              length: 182,
              offset: 182 * index,
              index,
            })}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            overScrollMode="never"
          />
        </View>

        {/* Picks & Deals Banner (Lazizia Style Red Banner) */}
        <View style={styles.dealsBannerContainer}>
          <View style={styles.dealsBanner}>
            <View style={styles.dealsHeaderRow}>
              <View>
                <Text style={styles.dealsTitle}>Picks &amp; Deals</Text>
                <Text style={styles.dealsSubtitle}>Small prices. Big savings.</Text>
              </View>
              <View style={styles.dealsBasketBadge}>
                <AppIcon icon={ShoppingBag01Icon} size={26} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.dealsStoresRow}>
              <TouchableOpacity style={[styles.storeChip, { backgroundColor: '#FBBF24' }]} activeOpacity={0.85}>
                <Text style={styles.storeChipPrice}>₹9</Text>
                <Text style={styles.storeChipLabel}>Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.storeChip, { backgroundColor: '#DC2626' }]} activeOpacity={0.85}>
                <Text style={[styles.storeChipPrice, { color: '#FFFFFF' }]}>₹19</Text>
                <Text style={[styles.storeChipLabel, { color: '#FFFFFF' }]}>Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.storeChip, { backgroundColor: '#991B1B' }]} activeOpacity={0.85}>
                <Text style={[styles.storeChipPrice, { color: '#FFFFFF' }]}>₹29</Text>
                <Text style={[styles.storeChipLabel, { color: '#FFFFFF' }]}>Store</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dealsEmptyText}>No deals available right now — check back soon.</Text>
          </View>
        </View>

        {/* Recipes Section (Watch & Cook) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Recipes</Text>
              <Text style={styles.sectionSubtitle}>Watch and cook — add ingredients to cart</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfCardsScroll}
            data={VIDEO_RECIPES}
            keyExtractor={(recipe) => recipe.id}
            renderItem={({ item: recipe }) => (
              <TouchableOpacity
                style={styles.recipeVideoCard}
                onPress={() => router.push('/(tabs)/recipes')}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: optimizeImageUrl(recipe.image, 360) }}
                  style={styles.recipeVideoImage}
                  resizeMode="cover"
                  fadeDuration={0}
                />
                <View style={styles.recipePlayOverlay}>
                  <View style={styles.recipePlayCircle}>
                    <AppIcon icon={PlayIcon} size={15} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </View>
                <View style={styles.recipeVideoGradient}>
                  <Text style={styles.recipeVideoTitle} numberOfLines={1}>{recipe.title}</Text>
                  <Text style={styles.recipeVideoSub} numberOfLines={1}>{recipe.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
            getItemLayout={(_, index) => ({
              length: 168,
              offset: 168 * index,
              index,
            })}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            overScrollMode="never"
          />
        </View>

        {/* Traditional Zabiha & Master Butcher Banner with Senior UI/UX Art */}
        <View style={styles.zabihaBannerContainer}>
          <View style={styles.zabihaBanner}>
            <View style={styles.zabihaInnerFrame}>
              <View style={styles.zabihaLeftCol}>
                <View style={styles.zabihaHalalTag}>
                  <Text style={styles.zabihaHalalText}>100% ZABIHA HALAL</Text>
                </View>
                <Text style={styles.zabihaTitle}>Zabiha, the traditional way</Text>
                <Text style={styles.zabihaSubtitle}>
                  Hand-slaughtered with Bismillah. Zero stunning, 100% net meat yield.
                </Text>
              </View>
              <Image
                source={require('../../../assets/illustrations/master_chef.png')}
                style={styles.zabihaChefIllustration}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Premium Fish & Seafood Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Premium Fish &amp; Seafood</Text>
              <Text style={styles.sectionSubtitle}>Same-day catch: fresh and flavourful</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfCardsScroll}
            data={seafoodProducts}
            keyExtractor={(product) => `seafood-${product.id}`}
            renderItem={({ item: product }) => (
              <DominosCard product={product} cardWidth={170} />
            )}
            getItemLayout={(_, index) => ({
              length: 182,
              offset: 182 * index,
              index,
            })}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            overScrollMode="never"
          />
        </View>

        {/* Best of Mutton Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Best of Mutton</Text>
              <Text style={styles.sectionSubtitle}>Our most tender mutton cuts</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfCardsScroll}
            data={muttonProducts}
            keyExtractor={(product) => `mutton-${product.id}`}
            renderItem={({ item: product }) => (
              <DominosCard product={product} cardWidth={170} />
            )}
            getItemLayout={(_, index) => ({
              length: 182,
              offset: 182 * index,
              index,
            })}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            overScrollMode="never"
          />
        </View>

        {/* Popular near you Section (Vertical Feed of Large Cards) */}
        <View style={styles.popularNearYouSection}>
          <View style={styles.popularNearYouHeader}>
            <Text style={styles.popularNearYouTitle}>Popular near you</Text>
            <Text style={styles.popularNearYouSub}>
              Fresh picks available in your area
            </Text>
            <View style={styles.popularNearYouLocationRow}>
              <AppIcon icon={Location01Icon} size={13} color="#DC2626" strokeWidth={2.5} />
              <Text style={styles.popularNearYouLocationText}>
                {currentLocation.shortAddress?.split(',')?.[0]?.trim() || currentLocation.city || 'Abhanpur'}, {currentLocation.state || 'Chhattisgarh'}
              </Text>
            </View>
          </View>

          <View style={styles.productList}>
            {nearYouProducts.map((product) => (
              <ProductCard key={`near-you-${product.id}`} product={product} />
            ))}
          </View>
        </View>

        {/* Lazizia Style Poetic Brand Footer */}
        <View style={styles.brandPoeticFooter}>
          <Text style={styles.poeticQuoteLine}>Har bite mein,</Text>
          <Text style={styles.poeticQuoteLine}>mohabbat ❤️,</Text>
          <Text style={styles.poeticQuoteLine}>zaban pe lazzat.</Text>

          <View style={styles.footerBrandRow}>
            <Text style={styles.footerBrandName}>MAGICMEAT</Text>
            <View style={styles.halalBadgeContainer}>
              <Text style={styles.halalArabicText}>حلال</Text>
              <Text style={styles.halalEnglishText}>HALAL</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <FloatingCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ============================================================= */
  /* DESKTOP STYLES (FULL WIDTH - NO MAX WIDTH RESTRICTION)        */
  /* ============================================================= */
  desktopSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopTopHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 50,
  },
  desktopTopLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  desktopBrandCol: {
    cursor: 'pointer' as any,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandEmblemBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  brandEmblemIcon: {
    fontSize: 20,
  },
  brandNameBold: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandNameRed: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginLeft: 1,
  },
  brandTagline: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: -1,
  },
  desktopHeaderDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  desktopLocationBlock: {
    justifyContent: 'center',
  },
  desktopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  desktopTakeawayText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  desktopAddressText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  desktopSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 420,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 21,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  desktopSearchPlaceholder: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '500',
  },
  desktopSearchKbd: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  desktopSearchKbdText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  desktopTopRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  desktopTrustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  desktopTrustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  desktopTrustText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  desktopProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  desktopProfileText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  desktopHeaderCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  desktopHeaderCartText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  desktopBlueStrip: {
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  desktopBlueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopHubBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  desktopHubBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  desktopBlueTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  desktopBlueSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  desktopDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  desktopDetectBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  desktopScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopScrollContent: {
    paddingBottom: 0,
    width: '100%',
  },
  desktopSegmentedWrapper: {
    alignItems: 'center',
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    width: '100%',
    backgroundColor: '#FAFAFA',
  },
  desktopSegmentedPillContainer: {
    flexDirection: 'row',
    width: 720,
    backgroundColor: '#E2E8F0',
    borderRadius: 30,
    padding: 4,
    gap: 4,
  },
  desktopSegmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 26,
    gap: 8,
  },
  desktopSegmentPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentPillEmoji: {
    fontSize: 16,
  },
  desktopSegmentPillTitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopSegmentPillTitleActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  desktopSegmentPillSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
  },
  desktopSection: {
    width: '100%',
    marginTop: 28,
  },
  desktopSectionHeading: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 16,
    paddingHorizontal: 40,
    letterSpacing: -0.3,
  },
  desktopCravingRow: {
    gap: 22,
    paddingHorizontal: 40,
  },
  desktopCravingItem: {
    alignItems: 'center',
    width: 96,
  },
  desktopCravingCircleBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopCravingCircleImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  desktopYellowBadge: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    backgroundColor: '#FBBF24',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  desktopYellowBadgeText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '900',
  },
  desktopCravingLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  shelfHeaderRow: {
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  shelfTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shelfTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  shelfSub: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  desktopShelfCards: {
    gap: 20,
    paddingHorizontal: 40,
  },

  /* Promise Section */
  desktopPromiseSection: {
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 48,
    paddingHorizontal: 40,
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  desktopPromiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  promiseAccentLine: {
    width: 48,
    height: 1.5,
    backgroundColor: '#DC2626',
  },
  desktopPromiseTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  desktopPromiseSub: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  desktopPromiseGrid: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  desktopPromiseCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  promiseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  promiseEmoji: {
    fontSize: 20,
  },
  promiseCardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  promiseCardText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Luxury Footer */
  desktopFooter: {
    backgroundColor: '#0F172A',
    width: '100%',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 40,
  },
  desktopFooterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  desktopFooterColBrand: {
    flex: 2,
    paddingRight: 40,
  },
  desktopFooterAbout: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 18,
  },
  fssaiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  fssaiText: {
    color: '#6EE7B7',
    fontSize: 10.5,
    fontWeight: '700',
  },
  desktopFooterColLinks: {
    flex: 1,
  },
  footerColTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  footerLink: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 10,
  },
  desktopFooterBottomBar: {
    paddingTop: 24,
    alignItems: 'center',
  },
  desktopFooterCopy: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '500',
  },

  /* Royal Top 10 Bestsellers Section Styles */
  top10RoyalContainer: {
    backgroundColor: '#FFFDF0',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingTop: 32,
    paddingBottom: 36,
    marginBottom: 36,
    width: '100%',
  },
  top10HeaderBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  top10CrownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  top10AccentLine: {
    width: 60,
    height: 1.5,
    backgroundColor: '#D97706',
    borderRadius: 1,
  },
  top10Heading: {
    color: '#854D0E',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  top10LocationSub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 5,
  },
  top10CityText: {
    color: '#A16207',
    fontSize: 12.5,
    fontWeight: '700',
  },
  mobileTop10Container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
  },
  mobileTop10HeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  mobileTop10Heading: {
    color: '#171717',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  mobileTop10Subtitle: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  seeAllText: {
    color: '#E52329',
    fontSize: 13,
    fontWeight: '700',
  },
  mobileTop10Scroll: {
    paddingHorizontal: 16,
  },

  /* ============================================================= */
  /* MOBILE STYLES                                                 */
  /* ============================================================= */
  safeArea: {
    flex: 1,
    backgroundColor: '#101010',
    width: '100%',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    overflow: 'hidden',
  },
  scrollContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    width: '100%',
    overflow: 'hidden',
  },
  darkHeader: {
    backgroundColor: '#101010',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10,
    width: '100%',
    overflow: 'hidden',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  etaContainer: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  etaNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  etaLabel: {
    color: '#FEE2E2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  locationBlock: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deliveringToEyebrow: {
    color: '#9CA3AF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  locationNameBold: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
  },
  addressSubText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 1,
    flexShrink: 1,
    width: '100%',
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexShrink: 0,
    marginLeft: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  searchCapsule: {
    flex: 1,
    minWidth: 0,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  searchPlaceholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  searchStaticPrefix: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '400',
    flexShrink: 0,
  },
  searchDynamicWord: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  offlineStoreCard: {
    width: 54,
    height: 54,
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#050914',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTitleActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  segmentSubtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  segmentSubtitleActive: {
    color: '#64748B',
  },
  activeIndicatorBar: {
    width: 22,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    marginTop: 3,
  },
  heroCarouselContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  heroScrollView: {
    width: '100%',
    height: '100%',
  },
  heroSlideItem: {
    position: 'relative',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSlideImage: {
    width: '100%',
    height: '100%',
  },
  heroTickerStrip: {
    backgroundColor: '#0055A5',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heroTickerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  heroPaginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 7,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  paginationActivePill: {
    backgroundColor: '#212121',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  paginationActivePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paginationInactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  cravingSection: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  cravingTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  cravingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  cravingGridItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 16,
  },
  cravingCircleWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cravingCircleImg: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },
  cravingRedBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 5,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  cravingRedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cravingGridLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.1,
  },
  popularNearYouSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  popularNearYouHeader: {
    marginBottom: 16,
  },
  popularNearYouTitle: {
    color: '#171717',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  popularNearYouSub: {
    color: '#6B7280',
    fontSize: 13.5,
    fontWeight: '400',
    marginTop: 3,
  },
  popularNearYouLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  popularNearYouLocationText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  productList: {
    width: '100%',
  },
  /* Service Availability Banner (Lazizia Style Sky Blue Strip) */
  serviceBanner: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  serviceBannerTitle: {
    color: '#1D4ED8',
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  serviceBannerAreas: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  /* Generic Shelf Section Container */
  sectionContainer: {
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 2,
  },
  shelfCardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  /* Picks & Deals Banner */
  dealsBannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  dealsBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  dealsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dealsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  dealsSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  dealsBasketBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealsStoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  storeChipPrice: {
    color: '#171717',
    fontSize: 13.5,
    fontWeight: '900',
  },
  storeChipLabel: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '600',
  },
  dealsEmptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  /* Recipe Video Cards */
  recipeVideoCard: {
    width: 156,
    height: 210,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeVideoImage: {
    width: '100%',
    height: '100%',
  },
  recipePlayOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  recipePlayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeVideoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  recipeVideoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  recipeVideoSub: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  /* Traditional Zabiha Banner */
  zabihaBannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  zabihaBanner: {
    backgroundColor: '#C52227',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#9E1317',
  },
  zabihaInnerFrame: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zabihaLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  zabihaHalalTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  zabihaHalalText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  zabihaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  zabihaSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
  },
  zabihaChefIllustration: {
    width: 78,
    height: 78,
  },
  /* Poetic Brand Footer */
  brandPoeticFooter: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  poeticQuoteLine: {
    fontSize: 26,
    fontWeight: '700',
    color: '#D1D5DB',
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 48,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerBrandName: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  halalBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  halalArabicText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  halalEnglishText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
