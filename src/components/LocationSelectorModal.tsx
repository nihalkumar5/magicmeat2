import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store/useStore';
import {
  detectDeviceLocation,
  POPULAR_LOCATIONS,
} from '../services/locationService';
import { LocationData } from '../types/location';
import {
  AppIcon,
  Location01Icon,
  Search01Icon,
  Cancel01Icon,
  Gps01Icon,
  Home01Icon,
  Briefcase01Icon,
  CheckmarkCircle01Icon,
  ShieldCheckIcon,
  ArrowRight01Icon,
  SparklesIcon,
} from './HugeIcon';

export const LocationSelectorModal: React.FC = () => {
  const {
    isLocationModalOpen,
    setLocationModalOpen,
    currentLocation,
    setCurrentLocation,
    savedAddresses,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLocationModalOpen) return null;

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    setErrorMessage(null);
    try {
      const detected = await detectDeviceLocation();
      setCurrentLocation(detected);
      setIsDetecting(false);
      setLocationModalOpen(false);
    } catch (err: any) {
      setIsDetecting(false);
      setErrorMessage(
        err.message || 'Unable to detect location. Please select manually.'
      );
    }
  };

  const handleSelectLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    setLocationModalOpen(false);
  };

  const filteredPlaces = POPULAR_LOCATIONS.filter(
    (p) =>
      searchQuery.trim() === '' ||
      p.shortAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={isLocationModalOpen}
      animationType="fade"
      transparent
      onRequestClose={() => setLocationModalOpen(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Select Delivery Location</Text>
              <Text style={styles.headerSubtitle}>
                Chilled at 2°C &amp; delivered from your nearest hub
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setLocationModalOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon icon={Cancel01Icon} size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <AppIcon icon={Search01Icon} size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search area, landmark, street, city..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <AppIcon icon={Cancel01Icon} size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* GPS 1-Tap Auto-Detect Button */}
            <TouchableOpacity
              style={styles.gpsDetectBtn}
              onPress={handleUseCurrentLocation}
              disabled={isDetecting}
              activeOpacity={0.85}
            >
              <View style={styles.gpsIconCircle}>
                {isDetecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppIcon icon={Gps01Icon} size={18} color="#FFFFFF" strokeWidth={2.5} />
                )}
              </View>

              <View style={styles.gpsTextCol}>
                <View style={styles.gpsRow}>
                  <Text style={styles.gpsMainText}>
                    {isDetecting ? 'Detecting GPS Satellite...' : 'Use Current Location'}
                  </Text>
                  <View style={styles.gpsPill}>
                    <AppIcon icon={SparklesIcon} size={10} color="#166534" />
                    <Text style={styles.gpsPillText}>Auto GPS</Text>
                  </View>
                </View>
                <Text style={styles.gpsSubText}>
                  Uses device hardware GPS &amp; verifies nearest cold hub
                </Text>
              </View>

              <AppIcon icon={ArrowRight01Icon} size={16} color="#64748B" />
            </TouchableOpacity>

            {/* Saved Addresses Section */}
            <View style={styles.sectionDividerRow}>
              <Text style={styles.sectionHeaderLabel}>SAVED ADDRESSES</Text>
            </View>

            {savedAddresses.map((addr, idx) => {
              const isActive =
                currentLocation.fullAddress === addr.fullAddress;
              const isWork = addr.tag === 'Work';

              return (
                <TouchableOpacity
                  key={`saved-${idx}`}
                  style={[styles.addressItem, isActive && styles.addressItemActive]}
                  onPress={() => handleSelectLocation(addr)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.addressIconBox,
                      isActive && styles.addressIconBoxActive,
                    ]}
                  >
                    {isWork ? (
                      <AppIcon
                        icon={Briefcase01Icon}
                        size={16}
                        color={isActive ? '#FFFFFF' : '#0F172A'}
                      />
                    ) : (
                      <AppIcon
                        icon={Home01Icon}
                        size={16}
                        color={isActive ? '#FFFFFF' : '#0F172A'}
                      />
                    )}
                  </View>

                  <View style={styles.addressInfoCol}>
                    <View style={styles.tagRow}>
                      <Text style={styles.addressTag}>
                        {addr.tag || 'Saved'}
                      </Text>
                      {isActive && (
                        <View style={styles.activeCheckPill}>
                          <AppIcon icon={CheckmarkCircle01Icon} size={11} color="#166534" strokeWidth={3} />
                          <Text style={styles.activeCheckText}>Selected</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.shortAddressText}>
                      {addr.shortAddress}
                    </Text>
                    <Text style={styles.fullAddressText} numberOfLines={1}>
                      {addr.fullAddress}
                    </Text>
                    <View style={styles.deliveryStatusRow}>
                      <AppIcon icon={ShieldCheckIcon} size={12} color="#16A34A" />
                      <Text style={styles.deliveryStatusText}>
                        {addr.deliveryEta} · {addr.distanceKm} km away
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Suggested / Popular Cities & Areas */}
            <View style={styles.sectionDividerRow}>
              <Text style={styles.sectionHeaderLabel}>
                {searchQuery.trim().length > 0 ? 'SEARCH RESULTS' : 'RECENT & POPULAR HUBS'}
              </Text>
            </View>

            {filteredPlaces.map((place, idx) => (
              <TouchableOpacity
                key={`place-${idx}`}
                style={styles.searchResultItem}
                onPress={() => handleSelectLocation(place)}
                activeOpacity={0.7}
              >
                <AppIcon icon={Location01Icon} size={16} color="#E52320" style={{ marginTop: 2 }} />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultShort}>{place.shortAddress}</Text>
                  <Text style={styles.searchResultFull} numberOfLines={1}>
                    {place.fullAddress}
                  </Text>
                  <Text style={styles.searchResultEta}>
                    ⚡ {place.deliveryEta}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 540,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  bodyScroll: {
    paddingHorizontal: 20,
  },
  gpsDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 8,
    gap: 12,
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsMainText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '800',
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 3,
  },
  gpsPillText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  gpsSubText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionDividerRow: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  addressItemActive: {
    borderColor: '#E52320',
    backgroundColor: '#FFF5F5',
  },
  addressIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressIconBoxActive: {
    backgroundColor: '#E52320',
  },
  addressInfoCol: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  addressTag: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  activeCheckPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 3,
  },
  activeCheckText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  shortAddressText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '700',
  },
  fullAddressText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  deliveryStatusText: {
    color: '#15803D',
    fontSize: 10.5,
    fontWeight: '700',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultShort: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  searchResultFull: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  searchResultEta: {
    color: '#E52320',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3,
  },
});
