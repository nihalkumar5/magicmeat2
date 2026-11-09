export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DarkStoreHub {
  id: string;
  name: string;
  city: string;
  coords: Coordinates;
  maxExpressRadiusKm: number;
  maxStandardRadiusKm: number;
  address?: string;
  landmark?: string;
  timings?: string;
  phone?: string;
  distanceKm?: number;
}

export interface LocationData {
  shortAddress: string;
  fullAddress: string;
  city: string;
  state: string;
  postalCode?: string;
  coords: Coordinates;
  isServiceable: boolean;
  nearestHubName: string;
  distanceKm: number;
  deliveryEta: string;
  tag?: 'Home' | 'Work' | 'Other' | 'Current';
}

export const MAGICMEAT_HUBS: DarkStoreHub[] = [
  {
    id: 'bilaspur-hub',
    name: 'Bilaspur Butchery Hub (Sarkanda)',
    city: 'Bilaspur',
    coords: { latitude: 22.0797, longitude: 82.1409 },
    maxExpressRadiusKm: 15,
    maxStandardRadiusKm: 45,
    address: 'Khandel Road, Ashok Nagar, Sarkanda, Bilaspur, Chhattisgarh 495006',
    landmark: 'Near Seepat Chowk',
    timings: '7:00 AM - 10:00 PM Daily',
    phone: '+91 7752 492 100',
    distanceKm: 0.8,
  },
  {
    id: 'atal-nagar-hub',
    name: 'Naya Raipur Express Hub (Atal Nagar)',
    city: 'Atal Nagar',
    coords: { latitude: 21.1500, longitude: 81.7700 },
    maxExpressRadiusKm: 15,
    maxStandardRadiusKm: 40,
    address: 'Sector 24, Near Mantralaya, Atal Nagar, Nava Raipur, Chhattisgarh 492018',
    landmark: 'Near Central Park',
    timings: '7:00 AM - 10:00 PM Daily',
    phone: '+91 771 492 8850',
    distanceKm: 1.5,
  },
  {
    id: 'raipur-central',
    name: 'Raipur Central Butchery Hub',
    city: 'Raipur',
    coords: { latitude: 21.2514, longitude: 81.6296 },
    maxExpressRadiusKm: 8,
    maxStandardRadiusKm: 25,
    address: 'LK Corporate Tower, Civil Lines, Near Raj Bhavan, Raipur, Chhattisgarh 492001',
    landmark: 'Opp. Governor House',
    timings: '7:00 AM - 10:00 PM Daily',
    phone: '+91 771 492 8820',
    distanceKm: 0.4,
  },
  {
    id: 'blr-east',
    name: 'Bengaluru East Express Hub',
    city: 'Bengaluru',
    coords: { latitude: 12.9352, longitude: 77.6245 },
    maxExpressRadiusKm: 8,
    maxStandardRadiusKm: 25,
    address: 'Ground Floor, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    landmark: 'Near Indiranagar Metro',
    timings: '7:00 AM - 10:30 PM Daily',
    phone: '+91 80 4120 7711',
    distanceKm: 1.8,
  },
  {
    id: 'mum-west',
    name: 'Mumbai Coastal Butchery Hub',
    city: 'Mumbai',
    coords: { latitude: 19.0596, longitude: 72.8295 },
    maxExpressRadiusKm: 8,
    maxStandardRadiusKm: 25,
    address: 'Shop 4, Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    landmark: 'Opposite Mehboob Studios',
    timings: '7:30 AM - 10:00 PM Daily',
    phone: '+91 22 2640 1928',
    distanceKm: 2.3,
  },
  {
    id: 'del-south',
    name: 'Delhi NCR Prime Hub',
    city: 'Delhi',
    coords: { latitude: 28.5708, longitude: 77.2201 },
    maxExpressRadiusKm: 8,
    maxStandardRadiusKm: 25,
    address: 'Block G-14, South Extension Part 1, Ring Road, New Delhi 110049',
    landmark: 'Near Metro Gate 2',
    timings: '7:00 AM - 10:00 PM Daily',
    phone: '+91 11 4987 6543',
    distanceKm: 3.1,
  },
  {
    id: 'pune-kp',
    name: 'Pune Green Pastures Hub',
    city: 'Pune',
    coords: { latitude: 18.5362, longitude: 73.8940 },
    maxExpressRadiusKm: 8,
    maxStandardRadiusKm: 25,
    address: 'Bungalow 7, North Main Road, Koregaon Park, Pune, Maharashtra 411001',
    landmark: 'Near German Bakery',
    timings: '7:00 AM - 10:00 PM Daily',
    phone: '+91 20 2615 4422',
    distanceKm: 1.2,
  },
];
