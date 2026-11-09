import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../../constants/theme';
import { RECIPE_KITS } from '../../data/mockData';
import { RecipeCard } from '../../components/RecipeCard';
import { FloatingCartBar } from '../../components/FloatingCartBar';
import { AppIcon, ChefHatIcon, SparklesIcon } from '../../components/HugeIcon';

export default function RecipesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerContentRow}>
          <View style={styles.headerTextCol}>
            <View style={styles.headerTitleRow}>
              <AppIcon icon={ChefHatIcon} size={20} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.title}>Cook-It-Yourself Kits</Text>
            </View>
            <Text style={styles.subtitle}>
              Zero prep. Fresh artisanal cuts paired with chef-crafted gravies &amp; macro breakdown.
            </Text>

            <View style={styles.highlightPill}>
              <AppIcon icon={SparklesIcon} size={13} color="#D97706" strokeWidth={2} />
              <Text style={styles.highlightPillText}>
                Clean ingredients • 100% Macro Trackable
              </Text>
            </View>
          </View>
          <Image
            source={require('../../../assets/illustrations/enjoy_food.png')}
            style={styles.headerIllustration}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RECIPE_KITS.map((kit) => (
          <RecipeCard key={kit.id} kit={kit} />
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>

      <FloatingCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  headerIllustration: {
    width: 86,
    height: 86,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: THEME.radius.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: THEME.spacing.sm,
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  highlightPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
});
