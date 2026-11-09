import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { MacroBreakdown } from '../types';
import { AppIcon, FlashIcon, WheatIcon, DropletIcon } from './HugeIcon';

interface Props {
  macros: MacroBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showMacroPills?: boolean;
}

export const MacroRings: React.FC<Props> = ({
  macros,
  size = 'md',
  showMacroPills = true,
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const ringSize = isSmall ? 52 : isLarge ? 84 : 68;
  const strokeWidth = isSmall ? 5 : isLarge ? 8 : 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cal AI calorie ring percentage (assuming standard 250 kcal ref)
  const percent = Math.min(1, Math.max(0.2, macros.calories / 300));
  const strokeDashoffset = circumference - circumference * percent;

  return (
    <View style={styles.container}>
      {/* Cal AI Circular Calorie Gauge */}
      <View style={[styles.ringWrapper, { width: ringSize, height: ringSize }]}>
        <Svg width={ringSize} height={ringSize} style={styles.svg}>
          {/* Background circle track */}
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="#EAEAEE"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated active progress stroke */}
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={THEME.colors.macroCalories}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={[styles.calorieValue, isSmall && styles.calorieValueSm, isLarge && styles.calorieValueLg]}>
            {macros.calories}
          </Text>
          <Text style={[styles.calorieLabel, isSmall && styles.calorieLabelSm]}>
            kcal/100g
          </Text>
        </View>
      </View>

      {/* Cal AI Macro Breakdown Column */}
      {showMacroPills && (
        <View style={styles.macroPillsCol}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={[styles.miniCircle, { backgroundColor: THEME.colors.macroProteinBg }]}>
              <AppIcon icon={FlashIcon} size={10} color={THEME.colors.macroProtein} strokeWidth={2} />
            </View>
            <Text style={styles.macroValue}>
              {macros.proteinGrams}g <Text style={styles.macroSub}>Protein</Text>
            </Text>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={[styles.miniCircle, { backgroundColor: THEME.colors.macroCarbsBg }]}>
              <AppIcon icon={WheatIcon} size={10} color={THEME.colors.macroCarbs} strokeWidth={2} />
            </View>
            <Text style={styles.macroValue}>
              {macros.carbsGrams}g <Text style={styles.macroSub}>Carbs</Text>
            </Text>
          </View>

          {/* Fat */}
          <View style={styles.macroRow}>
            <View style={[styles.miniCircle, { backgroundColor: THEME.colors.macroFatBg }]}>
              <AppIcon icon={DropletIcon} size={10} color={THEME.colors.macroFat} strokeWidth={2} />
            </View>
            <Text style={styles.macroValue}>
              {macros.fatGrams}g <Text style={styles.macroSub}>Fats</Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieValue: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  calorieValueSm: {
    fontSize: 11,
  },
  calorieValueLg: {
    fontSize: 18,
  },
  calorieLabel: {
    color: THEME.colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    marginTop: -2,
  },
  calorieLabelSm: {
    fontSize: 7,
  },
  macroPillsCol: {
    gap: 4,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  macroSub: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
});
