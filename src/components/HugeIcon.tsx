import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';

export * from '@hugeicons/core-free-icons';

export interface IconProps {
  icon: any;
  size?: number | string;
  color?: any;
  strokeWidth?: number;
  style?: any;
}

export const AppIcon: React.FC<IconProps> = ({
  icon,
  size = 20,
  color = '#000000',
  strokeWidth = 1.8,
  style,
}) => {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
};
