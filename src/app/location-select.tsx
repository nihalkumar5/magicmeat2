import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';
import { LocationData, MAGICMEAT_HUBS, DarkStoreHub } from '../types/location';
import {
  detectDeviceLocation,
  POPULAR_LOCATIONS,
} from '../services/locationService';
import {
  AppIcon,
  ArrowLeft02Icon,
  Scooter01Icon,
  Store01Icon,
  Location01Icon,
  Clock01Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  Search01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Add01Icon,
  Delete02Icon,
  CheckmarkBadge01Icon,
} from '../components/HugeIcon';

export default function LocationSelectScreen() {
  const {
    currentLocation,
    setCurrentLocation,
    savedAddresses,
    addSavedAddress,
    removeSavedAddress,
    orderFulfillment,
    setOrderFulfillment,
  } = useStore();

  const [activeMode, setActiveMode] = useState<'delivery' | 'takeaway'>(
    orderFulfillment || 'delivery'
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Address Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Raipur');
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Store Pickup Search
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const [recentList, setRecentList] = useState<
    { id: string; name: string; distance: string; full: string }[]
  >([
    {
      id: 'r1',
      name: 'Bilaspur',
      distance: '114 km',
      full: 'Ashok Nagar, Sarkanda, Bilaspur, Chhattisgarh',
    },
    {
      id: 'r2',
      name: 'Raipur Civil Lines',
      distance: '0.4 km',
      full: 'LK Corporate Tower, Civil Lines, Raipur',
    },
  ]);

  const handleSelectDeliveryLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    setOrderFulfillment('delivery');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSelectPickupStore = (hub: DarkStoreHub) => {
    const hubLocation: LocationData = {
      shortAddress: hub.name,
      fullAddress: hub.address || `${hub.name}, ${hub.city}`,
      city: hub.city,
      state: '',
      coords: hub.coords,
      isServiceable: true,
      nearestHubName: hub.name,
      distanceKm: hub.distanceKm || 0.5,
      deliveryEta: 'Pickup in 10 Mins',
      tag: 'Work',
    };
    setCurrentLocation(hubLocation);
    setOrderFulfillment('takeaway');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectDeviceLocation();
      setCurrentLocation(detected);
      setOrderFulfillment('delivery');
      setIsDetecting(false);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setIsDetecting(false);
      Alert.alert(
        'Location Detection',
        err.message || 'Unable to detect GPS position. Please pick from saved addresses.'
      );
    }
  };

  const handleSaveNewAddress = () => {
    if (!newTitle.trim() || !newAddress.trim()) {
      Alert.alert('Required Fields', 'Please enter both location name and full address.');
      return;
    }

    const created: LocationData = {
      shortAddress: newTitle.trim(),
      fullAddress: `${newAddress.trim()}, ${newCity.trim()}`,
      city: newCity.trim(),
      state: 'Chhattisgarh',
      coords: { latitude: 21.2514, longitude: 81.6296 },
      isServiceable: true,
      nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
      distanceKm: 2.5,
      deliveryEta: '15-20 Mins (Express Cold-Chain)',
      tag: newTag,
    };

    addSavedAddress(created);
    setCurrentLocation(created);
    setOrderFulfillment('delivery');
    setIsAddingNew(false);
    setNewTitle('');
    setNewAddress('');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const filteredPlaces = POPULAR_LOCATIONS.filter(
    (p) =>
      searchQuery.trim() === '' ||
      p.shortAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHubs = MAGICMEAT_HUBS.filter(
    (h) =>
      storeSearchQuery.trim() === '' ||
      h.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(storeSearchQuery.toLowerCase()))
  );

  const displayedSaved = showAllSaved ? savedAddresses : savedAddresses.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* 1. TOP NAV HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <AppIcon icon={ArrowLeft02Icon} size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>
          {activeMode === 'delivery' ? 'Delivery Location' : 'Store Pickup Location'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hyperlocal Cold-Chain Network Banner */}
        <View style={styles.hubBanner}>
          <View style={styles.hubBannerTextCol}>
            <View style={styles.hubBadge}>
              <View style={styles.hubBadgeDot} />
              <Text style={styles.hubBadgeText}>HYPERLOCAL DARK-STORES</Text>
            </View>
            <Text style={styles.hubBannerTitle}>15-20 Min Cold-Chain</Text>
            <Text style={styles.hubBannerSub}>
              Dispatched direct from our certified 0-4°C butchery dark stores in Bilaspur &amp; Raipur.
            </Text>
          </View>
          <Image
            source={require('../../assets/illustrations/location_explorer.png')}
            style={styles.hubIllustration}
            resizeMode="contain"
          />
        </View>

        {/* 2. EXACT 2 SERVICE MODE CARDS (DELIVERY & PICKUP FROM STORE) */}
        <View style={styles.modeTabsRow}>
          {/* Card 1: Delivery */}
          <TouchableOpacity
            style={[
              styles.modeTabCard,
              activeMode === 'delivery' && styles.modeTabCardActive,
            ]}
            onPress={() => setActiveMode('delivery')}
            activeOpacity={0.85}
          >
            <AppIcon
              icon={Scooter01Icon}
              size={24}
              color={activeMode === 'delivery' ? '#FFFFFF' : '#334155'}
              strokeWidth={1.9}
            />
            <Text
              style={[
                styles.modeTabLabel,
                activeMode === 'delivery' && styles.modeTabLabelActive,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>

          {/* Card 2: Pickup from Store */}
          <TouchableOpacity
            style={[
              styles.modeTabCard,
              activeMode === 'takeaway' && styles.modeTabCardActive,
            ]}
            onPress={() => setActiveMode('takeaway')}
            activeOpacity={0.85}
          >
            <AppIcon
              icon={Store01Icon}
              size={24}
              color={activeMode === 'takeaway' ? '#FFFFFF' : '#334155'}
              strokeWidth={1.9}
            />
            <Text
              style={[
                styles.modeTabLabel,
                activeMode === 'takeaway' && styles.modeTabLabelActive,
              ]}
            >
              Pickup from Store
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* MODE 1: DELIVERY VIEW                                                     */}
        {/* ========================================================================= */}
        {activeMode === 'delivery' && (
          <View>
            {/* YOUR LOCATION CAPSULE */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionSmallLabel}>YOUR LOCATION</Text>
              <View style={styles.currentLocationBox}>
                <Text style={styles.currentLocationText} numberOfLines={1}>
                  {currentLocation.shortAddress || 'Ashok Nagar, Sarkanda'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSearching((prev) => !prev)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.changeBtnText}>
                    {isSearching ? 'Close' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* EXPANDED SEARCH BOX (WHEN USER CLICKS CHANGE) */}
            {isSearching && (
              <View style={styles.searchDropdownContainer}>
                <View style={styles.searchCapsuleBox}>
                  <AppIcon icon={Search01Icon} size={18} color="#64748B" strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search area, landmark or apartment..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <AppIcon icon={Cancel01Icon} size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filtered suggestions list */}
                <View style={styles.suggestionsList}>
                  {filteredPlaces.map((place, idx) => (
                    <TouchableOpacity
                      key={`search-${idx}`}
                      style={styles.suggestionRow}
                      onPress={() => handleSelectDeliveryLocation(place)}
                      activeOpacity={0.7}
                    >
                      <AppIcon icon={Location01Icon} size={18} color="#0055A5" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionTitle}>{place.shortAddress}</Text>
                        <Text style={styles.suggestionSub} numberOfLines={1}>
                          {place.fullAddress}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* BLUE SEAMLESS DELIVERY BANNER */}
            <View style={styles.blueBanner}>
              <View style={styles.blueBannerLeft}>
                <View style={styles.bluePinCircle}>
                  <AppIcon icon={Location01Icon} size={18} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <Text style={styles.blueBannerText}>
                  Give us your exact location for seamless delivery
                </Text>
              </View>

              <TouchableOpacity
                style={styles.useCurrentBtn}
                onPress={handleUseCurrentLocation}
                disabled={isDetecting}
                activeOpacity={0.8}
              >
                {isDetecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.useCurrentBtnText}>Use Current Location</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* SAVED ADDRESSES SECTION */}
            <View style={styles.savedSection}>
              <View style={styles.savedHeaderRow}>
                <Text style={styles.savedSectionHeading}>Saved Addresses</Text>
                <TouchableOpacity
                  style={styles.addNewBtn}
                  onPress={() => setIsAddingNew((prev) => !prev)}
                  activeOpacity={0.8}
                >
                  <AppIcon icon={Add01Icon} size={14} color="#DC2626" strokeWidth={2.5} />
                  <Text style={styles.addNewBtnText}>
                    {isAddingNew ? 'Cancel' : 'Add New'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* INLINE ADD NEW ADDRESS FORM */}
              {isAddingNew && (
                <View style={styles.newAddressForm}>
                  <Text style={styles.formTitle}>Add New Delivery Address</Text>

                  {/* Tag Selector */}
                  <View style={styles.tagSelectorRow}>
                    {(['Home', 'Work', 'Other'] as const).map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagPill,
                          newTag === tag && styles.tagPillActive,
                        ]}
                        onPress={() => setNewTag(tag)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.tagPillText,
                            newTag === tag && styles.tagPillTextActive,
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.formInput}
                    placeholder="Address Title (e.g. Home, Flat 402, Mom's Place)"
                    placeholderTextColor="#94A3B8"
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <TextInput
                    style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Flat / House No., Building, Street, Area"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={newAddress}
                    onChangeText={setNewAddress}
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="City (e.g. Raipur, Bilaspur, Bengaluru)"
                    placeholderTextColor="#94A3B8"
                    value={newCity}
                    onChangeText={setNewCity}
                  />

                  <TouchableOpacity
                    style={styles.saveAddressBtn}
                    onPress={handleSaveNewAddress}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.saveAddressBtnText}>Save &amp; Deliver Here</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* SAVED ADDRESS ITEMS */}
              {displayedSaved.map((item, idx) => {
                const isSelected =
                  orderFulfillment === 'delivery' &&
                  (currentLocation.shortAddress === item.shortAddress ||
                    currentLocation.fullAddress === item.fullAddress);

                return (
                  <View
                    key={`saved-${item.shortAddress}-${idx}`}
                    style={[
                      styles.savedAddressRow,
                      isSelected && styles.savedAddressRowSelected,
                    ]}
                  >
                    {/* Clickable Area to Select Address */}
                    <TouchableOpacity
                      style={styles.savedAddressContent}
                      onPress={() => handleSelectDeliveryLocation(item)}
                      activeOpacity={0.75}
                    >
                      {/* Left Pin + Distance Column */}
                      <View style={styles.savedLeftCol}>
                        <AppIcon
                          icon={Location01Icon}
                          size={20}
                          color={isSelected ? '#DC2626' : '#475569'}
                          strokeWidth={1.8}
                        />
                        <Text style={styles.savedDistanceText}>
                          {item.distanceKm ? `${item.distanceKm} km` : '15 km'}
                        </Text>
                      </View>

                      {/* Right Address Details */}
                      <View style={styles.savedRightCol}>
                        <View style={styles.savedTitleBadgeRow}>
                          <Text style={styles.savedTitle}>{item.shortAddress}</Text>
                          {item.tag && (
                            <View style={styles.itemTagBadge}>
                              <Text style={styles.itemTagText}>{item.tag}</Text>
                            </View>
                          )}
                          {isSelected && (
                            <View style={styles.activeCheckBadge}>
                              <AppIcon
                                icon={CheckmarkCircle01Icon}
                                size={16}
                                color="#16A34A"
                                strokeWidth={2.2}
                              />
                              <Text style={styles.activeCheckText}>Selected</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.savedFullAddress} numberOfLines={2}>
                          {item.fullAddress}
                        </Text>
                        <Text style={styles.savedAreaSub} numberOfLines={1}>
                          {item.city ? `${item.shortAddress}, ${item.city}` : item.shortAddress}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Delete Option if more than 1 address */}
                    {savedAddresses.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteAddressBtn}
                        onPress={() => {
                          Alert.alert(
                            'Delete Address',
                            `Are you sure you want to remove "${item.shortAddress}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => removeSavedAddress(item.shortAddress),
                              },
                            ]
                          );
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                      >
                        <AppIcon icon={Delete02Icon} size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {/* View More / View Less */}
              {savedAddresses.length > 3 && (
                <TouchableOpacity
                  style={styles.viewMoreRow}
                  onPress={() => setShowAllSaved((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewMoreText}>
                    {showAllSaved
                      ? 'View Less'
                      : `View More (${savedAddresses.length - 3} more)`}
                  </Text>
                  <AppIcon
                    icon={showAllSaved ? ChevronUpIcon : ChevronDownIcon}
                    size={15}
                    color="#0055A5"
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* DIVIDER STRIP */}
            <View style={styles.greyDividerStrip} />

            {/* RECENTLY SEARCHED SECTION */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeaderRow}>
                <Text style={styles.recentSectionHeading}>Recently Searched</Text>
                {recentList.length > 0 && (
                  <TouchableOpacity onPress={() => setRecentList([])} activeOpacity={0.7}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentList.map((recent) => (
                <TouchableOpacity
                  key={recent.id}
                  style={styles.recentItemRow}
                  onPress={() => {
                    const found =
                      POPULAR_LOCATIONS.find((p) => p.shortAddress.includes(recent.name)) ||
                      savedAddresses[0];
                    handleSelectDeliveryLocation(found);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.recentLeftCol}>
                    <AppIcon icon={Clock01Icon} size={18} color="#475569" strokeWidth={1.8} />
                    <Text style={styles.recentDistanceText}>{recent.distance}</Text>
                  </View>

                  <View style={styles.recentRightCol}>
                    <Text style={styles.recentTitle}>{recent.name}</Text>
                    <Text style={styles.recentSubText}>
                      {recent.distance} · {recent.name.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: PICKUP FROM STORE VIEW                                            */}
        {/* ========================================================================= */}
        {activeMode === 'takeaway' && (
          <View style={styles.pickupSectionContainer}>
            {/* Store Pickup Banner */}
            <View style={styles.storePickupBanner}>
              <View style={styles.storeBannerBadge}>
                <AppIcon icon={CheckmarkBadge01Icon} size={16} color="#DC2626" />
                <Text style={styles.storeBannerBadgeText}>READY IN 10 MINS</Text>
              </View>
              <Text style={styles.storeBannerTitle}>
                MagicMeat Artisan Butchery Stores
              </Text>
              <Text style={styles.storeBannerDesc}>
                Walk in and collect your freshly cut order chilled at 0-4°C. Zero queue, zero waiting.
              </Text>
            </View>

            {/* Hub Search Box */}
            <View style={styles.hubSearchContainer}>
              <View style={styles.hubSearchCapsule}>
                <AppIcon icon={Search01Icon} size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.hubSearchInput}
                  placeholder="Search butchery store or city..."
                  placeholderTextColor="#94A3B8"
                  value={storeSearchQuery}
                  onChangeText={setStoreSearchQuery}
                />
                {storeSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setStoreSearchQuery('')}>
                    <AppIcon icon={Cancel01Icon} size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List of Butchery Stores */}
            <View style={styles.storesList}>
              <Text style={styles.storesListHeading}>
                Available Dark Stores &amp; Outlets ({filteredHubs.length})
              </Text>

              {filteredHubs.map((hub) => {
                const isSelected =
                  orderFulfillment === 'takeaway' &&
                  (currentLocation.shortAddress.includes(hub.name) ||
                    currentLocation.nearestHubName?.includes(hub.name));

                return (
                  <View
                    key={hub.id}
                    style={[
                      styles.hubCard,
                      isSelected && styles.hubCardSelected,
                    ]}
                  >
                    {/* Header: Store Name & City */}
                    <View style={styles.hubHeaderRow}>
                      <View style={styles.hubTitleCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <AppIcon icon={Store01Icon} size={18} color="#DC2626" strokeWidth={2} />
                          <Text style={styles.hubName}>{hub.name}</Text>
                        </View>
                        <Text style={styles.hubCityText}>{hub.city.toUpperCase()}</Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.selectedHubBadge}>
                          <AppIcon
                            icon={CheckmarkCircle01Icon}
                            size={16}
                            color="#16A34A"
                            strokeWidth={2.2}
                          />
                          <Text style={styles.selectedHubBadgeText}>Current Store</Text>
                        </View>
                      ) : (
                        <View style={styles.hubDistanceBadge}>
                          <Text style={styles.hubDistanceText}>
                            {hub.distanceKm ? `${hub.distanceKm} km away` : 'Near you'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Address & Landmark */}
                    <Text style={styles.hubAddressText}>{hub.address}</Text>
                    {hub.landmark && (
                      <Text style={styles.hubLandmarkText}>
                        📍 Landmark: {hub.landmark}
                      </Text>
                    )}

                    {/* Timings & Express Ready Badge */}
                    <View style={styles.hubMetaRow}>
                      <View style={styles.hubTimingGroup}>
                        <AppIcon icon={Clock01Icon} size={14} color="#64748B" />
                        <Text style={styles.hubTimingText}>
                          {hub.timings || '7:00 AM - 10:00 PM Daily'}
                        </Text>
                      </View>

                      <View style={styles.tenMinBadge}>
                        <Text style={styles.tenMinBadgeText}>⚡ 10 MIN PICKUP</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      style={[
                        styles.selectStoreBtn,
                        isSelected && styles.selectStoreBtnActive,
                      ]}
                      onPress={() => handleSelectPickupStore(hub)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.selectStoreBtnText,
                          isSelected && styles.selectStoreBtnTextActive,
                        ]}
                      >
                        {isSelected ? '✓ Selected for Pickup' : 'Select This Store'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  backButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },

  /* 2 SERVICE MODE CARDS (Delivery & Pickup from Store) */
  hubBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubBannerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  hubBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  hubBadgeText: {
    color: '#DC2626',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hubBannerTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  hubBannerSub: {
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 16,
  },
  hubIllustration: {
    width: 82,
    height: 82,
  },
  modeTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  modeTabCard: {
    flex: 1,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  modeTabCardActive: {
    backgroundColor: '#212121',
    borderColor: '#212121',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  modeTabLabelActive: {
    color: '#FFFFFF',
  },

  /* YOUR LOCATION SECTION */
  sectionBlock: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionSmallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0055A5',
    textDecorationLine: 'underline',
  },

  /* EXPANDED SEARCH */
  searchDropdownContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchCapsuleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0055A5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 4,
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 6,
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* BLUE BANNER */
  blueBanner: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#0055A5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  blueBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bluePinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
    flex: 1,
  },
  useCurrentBtn: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  useCurrentBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* SAVED ADDRESSES */
  savedSection: {
    paddingHorizontal: 16,
  },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savedSectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  addNewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* NEW ADDRESS FORM */
  newAddressForm: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tagPillActive: {
    backgroundColor: '#212121',
    borderColor: '#212121',
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tagPillTextActive: {
    color: '#FFFFFF',
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  saveAddressBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* SAVED ADDRESS ROW */
  savedAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  savedAddressRowSelected: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  savedAddressContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  savedLeftCol: {
    alignItems: 'center',
    width: 48,
    paddingTop: 2,
    gap: 4,
  },
  savedDistanceText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  savedRightCol: {
    flex: 1,
  },
  savedTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  savedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemTagBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  activeCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeCheckText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  savedFullAddress: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 3,
  },
  savedAreaSub: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
  },
  deleteAddressBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0055A5',
  },

  /* GREY DIVIDER STRIP */
  greyDividerStrip: {
    height: 8,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginVertical: 4,
  },

  /* RECENT SECTION */
  recentSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0055A5',
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  recentLeftCol: {
    alignItems: 'center',
    width: 48,
    gap: 4,
  },
  recentDistanceText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
  },
  recentRightCol: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* PICKUP / STORE VIEW STYLES */
  pickupSectionContainer: {
    paddingHorizontal: 16,
  },
  storePickupBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  storeBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  storeBannerBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  storeBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  storeBannerDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },

  /* HUB SEARCH */
  hubSearchContainer: {
    marginBottom: 14,
  },
  hubSearchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  hubSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 4,
  },

  /* STORES LIST */
  storesList: {
    gap: 12,
  },
  storesListHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hubCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  hubCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  hubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  hubTitleCol: {
    flex: 1,
    gap: 2,
  },
  hubName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  hubCityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginLeft: 24,
  },
  hubDistanceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hubDistanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  selectedHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedHubBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  hubAddressText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  hubLandmarkText: {
    fontSize: 11.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  hubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hubTimingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hubTimingText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  tenMinBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tenMinBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  selectStoreBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  selectStoreBtnActive: {
    backgroundColor: '#16A34A',
  },
  selectStoreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  selectStoreBtnTextActive: {
    color: '#FFFFFF',
  },
});
