import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { AppIcon, ThermometerColdIcon } from './HugeIcon';

interface Props {
  temp?: string;
  size?: 'sm' | 'md';
}

export const ColdChainBadge: React.FC<Props> = ({ temp = '2.2°C Chilled', size = 'sm' }) => {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.container, isSmall ? styles.containerSm : styles.containerMd]}>
      <View style={styles.pulseDot} />
      <AppIcon
        icon={ThermometerColdIcon}
        size={isSmall ? 11 : 14}
        color={THEME.colors.textPrimary}
        strokeWidth={2}
      />
      <Text style={[styles.text, isSmall ? styles.textSm : styles.textMd]}>{temp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  containerSm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  containerMd: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentEmerald,
  },
  text: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});
