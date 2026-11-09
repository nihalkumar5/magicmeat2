import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';
import { fetchUserProfile, syncUserProfile } from '../services/firebase';
import {
  AppIcon,
  ArrowLeft02Icon,
  BeefIcon,
  Cancel01Icon,
  CustomerService01Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Mail01Icon,
  Route01Icon,
  ShieldCheckIcon,
} from '../components/HugeIcon';

export default function ProfileMenuScreen() {
  const { activeOrder, orders } = useStore();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState<'idle' | 'synced'>('idle');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    if (!userPhone.trim()) return;

    let mounted = true;
    fetchUserProfile(userPhone).then((remote) => {
      if (!mounted || !remote) return;
      if (remote.name) setUserName(remote.name);
      if (remote.phone) setUserPhone(remote.phone);
      if (remote.email) setUserEmail(remote.email);
      setFirebaseStatus('synced');
    });

    return () => {
      mounted = false;
    };
  }, [userPhone]);

  const openEditProfile = () => {
    setEditName(userName);
    setEditPhone(userPhone);
    setEditEmail(userEmail);
    setIsEditOpen(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Required fields', 'Please enter your name and mobile number.');
      return;
    }

    const profile = {
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
    };
    setUserName(profile.name);
    setUserPhone(profile.phone);
    setUserEmail(profile.email || '');
    await syncUserProfile(profile);
    setFirebaseStatus('synced');
    setIsEditOpen(false);
  };

  const trackOrder = () => {
    if (!activeOrder) {
      Alert.alert('No active order', 'Place an order to see live tracking here.');
      return;
    }
    router.push({ pathname: '/order-tracking/[id]', params: { id: activeOrder.id } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
          <AppIcon icon={ArrowLeft02Icon} size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={openEditProfile} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.trim() ? userName.trim()[0].toUpperCase() : '?'}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{userName.trim() || 'Complete your profile'}</Text>
            <Text style={styles.profileMeta}>{userPhone ? `+91 ${userPhone}` : 'Mobile number not added'}</Text>
            {!!userEmail && <Text style={styles.profileMeta}>{userEmail}</Text>}
            {firebaseStatus === 'synced' && <Text style={styles.syncedText}>Profile synced</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={trackOrder}>
            <AppIcon icon={Route01Icon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Track live order</Text>
              <Text style={styles.menuSubtitle}>{activeOrder ? `Order ${activeOrder.id}` : 'No active order'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/orders')}>
            <AppIcon icon={BeefIcon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Order history</Text>
              <Text style={styles.menuSubtitle}>{orders.length} order{orders.length === 1 ? '' : 's'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Help &amp; information</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('tel:18006244263')}>
            <AppIcon icon={CustomerService01Icon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Contact support</Text>
              <Text style={styles.menuSubtitle}>Call MagicMeat care</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('mailto:care@magicmeat.in')}>
            <AppIcon icon={Mail01Icon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Email support</Text>
              <Text style={styles.menuSubtitle}>care@magicmeat.in</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Freshness promise', 'If your order arrives above 4°C, contact support for a replacement review.')}
          >
            <AppIcon icon={ShieldCheckIcon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Freshness &amp; safety</Text>
              <Text style={styles.menuSubtitle}>Cold-chain handling standards</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Terms & refunds', 'Refund and replacement requests are reviewed by MagicMeat support.')}
          >
            <AppIcon icon={Invoice01Icon} size={19} color="#111827" />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>Terms &amp; refunds</Text>
              <Text style={styles.menuSubtitle}>Review order policies</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteCard}>
          <AppIcon icon={InformationCircleIcon} size={18} color="#0369A1" />
          <Text style={styles.noteText}>Payments, rewards and admin tools are not enabled in the customer app.</Text>
        </View>
      </ScrollView>

      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit profile</Text>
              <TouchableOpacity onPress={() => setIsEditOpen(false)}>
                <AppIcon icon={Cancel01Icon} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput value={editName} onChangeText={setEditName} placeholder="Your name" style={styles.input} />
            <Text style={styles.inputLabel}>Mobile number</Text>
            <TextInput value={editPhone} onChangeText={setEditPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" style={styles.input} />
            <Text style={styles.inputLabel}>Email (optional)</Text>
            <TextInput value={editEmail} onChangeText={setEditEmail} placeholder="email@example.com" style={styles.input} />
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>Save profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  editButton: { paddingHorizontal: 8, paddingVertical: 6 },
  editButtonText: { color: '#DC2626', fontWeight: '800' },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: '#111827', marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#B91C1C', fontSize: 24, fontWeight: '900' },
  profileCopy: { marginLeft: 14, flex: 1 },
  profileName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileMeta: { color: '#CBD5E1', fontSize: 13, marginTop: 4 },
  syncedText: { color: '#86EFAC', fontSize: 12, fontWeight: '700', marginTop: 6 },
  sectionTitle: { color: '#475569', fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 22, borderWidth: 1, borderColor: '#E2E8F0' },
  menuRow: { minHeight: 68, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  menuCopy: { flex: 1, marginLeft: 14 },
  menuTitle: { color: '#111827', fontSize: 15, fontWeight: '700' },
  menuSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  chevron: { color: '#94A3B8', fontSize: 28, lineHeight: 28 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 48 },
  noteCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#E0F2FE' },
  noteText: { flex: 1, color: '#075985', fontSize: 12, lineHeight: 18 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#111827', fontSize: 20, fontWeight: '800' },
  inputLabel: { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 46, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, color: '#111827' },
  saveButton: { backgroundColor: '#DC2626', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginTop: 22 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
