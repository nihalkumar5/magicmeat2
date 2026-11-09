import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Coordinates, LocationData, MAGICMEAT_HUBS } from '../types/location';

// Haversine Formula for exact distance calculation in KM
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Find nearest butcher dark store hub and verify cold-chain serviceability
export function evaluateHubServiceability(coords: Coordinates) {
  let nearest = MAGICMEAT_HUBS[0];
  let minDistance = calculateDistanceKm(coords, nearest.coords);

  for (const hub of MAGICMEAT_HUBS) {
    const dist = calculateDistanceKm(coords, hub.coords);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hub;
    }
  }

  const isExpress = minDistance <= nearest.maxExpressRadiusKm;
  const isStandard = minDistance <= nearest.maxStandardRadiusKm;

  return {
    nearestHubName: nearest.name,
    distanceKm: minDistance,
    isServiceable: true,
    deliveryEta: isExpress
      ? '15-20 Mins (Express Cold-Chain)'
      : isStandard
      ? '30-45 Mins (Standard Slot)'
      : '45-60 Mins (Special Cold Delivery)',
  };
}

// Clean administrative suffixes like "Tahsil", "Tehsil", "District"
function cleanLocationName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s+(Tahsil|Tehsil|district|District|Division)\b/gi, '')
    .trim();
}

// Resilient Coordinate Detection (Hardware GPS -> High-Precision IP Fallback)
async function getDeviceCoordinates(): Promise<{ coords: Coordinates; source: 'gps' | 'ip' | 'fallback' }> {
  // 1. Web Environment
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const gpsCoords = await new Promise<Coordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            (err) => reject(err),
            { timeout: 6000, enableHighAccuracy: true, maximumAge: 30000 }
          );
        });
        return { coords: gpsCoords, source: 'gps' };
      } catch (err) {
        console.warn('Browser GPS unavailable/denied, falling back to IP geolocation', err);
      }
    }

    // IP Geolocation Fallback (Fast, Free, Client-side CORS friendly)
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          coords: { latitude: data.latitude, longitude: data.longitude },
          source: 'ip',
        };
      }
    } catch (ipErr) {
      console.warn('IP geolocation failed', ipErr);
    }

    // Default to user home coordinates in Bilaspur
    return {
      coords: { latitude: 22.0797, longitude: 82.1409 },
      source: 'fallback',
    };
  }

  // 2. Native Mobile Environment (iOS / Android)
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        coords: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
        source: 'gps',
      };
    }
  } catch (nativeErr) {
    console.warn('Native GPS error, trying IP fallback', nativeErr);
  }

  // Native IP Fallback
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
    const data = await res.json();
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return {
        coords: { latitude: data.latitude, longitude: data.longitude },
        source: 'ip',
      };
    }
  } catch {}

  return {
    coords: { latitude: 22.0797, longitude: 82.1409 },
    source: 'fallback',
  };
}

// Detect User's Real Location & Reverse Geocode to Clean Address
export async function detectDeviceLocation(): Promise<LocationData> {
  const { coords } = await getDeviceCoordinates();
  const serviceability = evaluateHubServiceability(coords);

  let locality = '';
  let city = '';
  let state = 'Chhattisgarh';
  let postalCode = '';
  let fullAddress = '';

  // 1. Try BigDataCloud Reverse Geocoding (fast, accurate for Indian cities/tehsils)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
    );
    const bdcData = await bdcRes.json();
    if (bdcData) {
      city = cleanLocationName(bdcData.city || bdcData.locality || '');
      locality = cleanLocationName(bdcData.locality || city || '');
      state = bdcData.principalSubdivision || 'Chhattisgarh';
      postalCode = bdcData.postcode || '';

      // Check detailed administrative components for more specific locality
      const admins = bdcData.localityInfo?.administrative || [];
      const subLocalities = admins
        .filter((a: any) => a.adminLevel >= 6 && a.name)
        .map((a: any) => cleanLocationName(a.name));

      if (subLocalities.length > 0) {
        const candidate = subLocalities[subLocalities.length - 1];
        if (candidate.toLowerCase() !== city.toLowerCase()) {
          locality = candidate;
        }
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode error', err);
  }

  // 2. Also try Nominatim / Native Reverse Geocode for street level details
  try {
    if (Platform.OS === 'web') {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`
      );
      const osmData = await osmRes.json();
      if (osmData && osmData.address) {
        const addr = osmData.address;
        const streetLocality =
          cleanLocationName(
            addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.road ||
              addr.quarter ||
              addr.village ||
              addr.town ||
              ''
          );

        if (streetLocality && streetLocality.toLowerCase() !== city.toLowerCase()) {
          locality = streetLocality;
        }
        if (!city) {
          city = cleanLocationName(addr.city || addr.town || addr.county || '');
        }
        if (!postalCode) {
          postalCode = addr.postcode || '';
        }
        if (osmData.display_name) {
          fullAddress = osmData.display_name;
        }
      }
    } else {
      const geocoded = await Location.reverseGeocodeAsync(coords);
      if (geocoded && geocoded.length > 0) {
        const first = geocoded[0];
        const street = cleanLocationName(first.name || first.street || '');
        const sub = cleanLocationName(first.subregion || '');
        if (street) locality = street;
        else if (sub && sub.toLowerCase() !== city.toLowerCase()) locality = sub;
        if (!city) city = cleanLocationName(first.city || first.region || '');
        if (!postalCode) postalCode = first.postalCode || '';
        fullAddress = `${first.name || ''} ${first.street || ''}, ${locality}, ${city}, ${state} ${postalCode}`.trim();
      }
    }
  } catch (err) {
    console.warn('Secondary reverse geocode error', err);
  }

  // Clean and synthesize final names
  if (!city) city = locality || 'Bilaspur';
  if (!locality) locality = city;

  let shortAddress = locality;
  if (locality.toLowerCase() !== city.toLowerCase() && !locality.toLowerCase().includes(city.toLowerCase())) {
    shortAddress = `${locality}, ${city}`;
  }

  if (!fullAddress) {
    fullAddress = `${locality}, ${city}, ${state}${postalCode ? ` ${postalCode}` : ''}, India`;
  }

  return {
    shortAddress,
    fullAddress,
    city,
    state,
    postalCode,
    coords,
    isServiceable: serviceability.isServiceable,
    nearestHubName: serviceability.nearestHubName,
    distanceKm: serviceability.distanceKm,
    deliveryEta: serviceability.deliveryEta,
    tag: 'Current',
  };
}

// Popular Searchable Places for Instant Autocomplete
export const POPULAR_LOCATIONS: LocationData[] = [
  {
    shortAddress: 'Khandel Road, Bilaspur',
    fullAddress: 'Roop Vihar, 4523+VFV, Khandel Rd, Ashok Nagar, Sarkanda, Bilaspur, Chhattisgarh 495006',
    city: 'Bilaspur',
    state: 'Chhattisgarh',
    postalCode: '495006',
    coords: { latitude: 22.0797, longitude: 82.1409 },
    isServiceable: true,
    nearestHubName: 'Bilaspur Butchery Hub (Sarkanda)',
    distanceKm: 0.6,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Home',
  },
  {
    shortAddress: 'Atal Nagar, Raipur',
    fullAddress: 'Sector 24, Near IIIT Naya Raipur, Atal Nagar, Chhattisgarh 492018',
    city: 'Raipur',
    state: 'Chhattisgarh',
    postalCode: '492018',
    coords: { latitude: 21.1500, longitude: 81.7700 },
    isServiceable: true,
    nearestHubName: 'Naya Raipur Express Hub (Atal Nagar)',
    distanceKm: 1.2,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Work',
  },
  {
    shortAddress: 'Civil Lines, Raipur',
    fullAddress: 'LK Corporate Tower, Civil Lines, Raipur, Chhattisgarh 492001',
    city: 'Raipur',
    state: 'Chhattisgarh',
    postalCode: '492001',
    coords: { latitude: 21.2514, longitude: 81.6296 },
    isServiceable: true,
    nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
    distanceKm: 0.4,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Work',
  },
  {
    shortAddress: 'Bellandur, Bengaluru',
    fullAddress: 'Flat 402, Green Glen Orchid, Bellandur, Bengaluru 560103',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560103',
    coords: { latitude: 12.9304, longitude: 77.6784 },
    isServiceable: true,
    nearestHubName: 'Bengaluru East Express Hub (Indiranagar / Bellandur)',
    distanceKm: 1.8,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Home',
  },
  {
    shortAddress: 'Devendra Nagar, Raipur',
    fullAddress: 'B-12, Sector 4, Devendra Nagar, Raipur, Chhattisgarh 492004',
    city: 'Raipur',
    state: 'Chhattisgarh',
    postalCode: '492004',
    coords: { latitude: 21.2612, longitude: 81.6421 },
    isServiceable: true,
    nearestHubName: 'Raipur Central Butchery Hub (Civil Lines)',
    distanceKm: 2.1,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Other',
  },
  {
    shortAddress: 'Indiranagar 100ft Rd, Bengaluru',
    fullAddress: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    coords: { latitude: 12.9719, longitude: 77.6412 },
    isServiceable: true,
    nearestHubName: 'Bengaluru East Express Hub (Indiranagar / Bellandur)',
    distanceKm: 1.2,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Work',
  },
  {
    shortAddress: 'Bandra West, Mumbai',
    fullAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    coords: { latitude: 19.0553, longitude: 72.8331 },
    isServiceable: true,
    nearestHubName: 'Mumbai Coastal Butchery Hub (Bandra BKC)',
    distanceKm: 1.4,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Home',
  },
  {
    shortAddress: 'Koregaon Park, Pune',
    fullAddress: 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    coords: { latitude: 18.5362, longitude: 73.8940 },
    isServiceable: true,
    nearestHubName: 'Pune Green Pastures Hub (Koregaon Park)',
    distanceKm: 0.9,
    deliveryEta: '15-20 Mins (Express Cold-Chain)',
    tag: 'Home',
  },
];
