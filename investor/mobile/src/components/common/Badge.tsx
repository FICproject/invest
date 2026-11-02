import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'default';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.successBg, text: COLORS.success, border: 'rgba(16, 185, 129, 0.2)' };
      case 'warning':
        return { bg: COLORS.warningBg, text: COLORS.warning, border: 'rgba(245, 158, 11, 0.2)' };
      case 'danger':
        return { bg: COLORS.dangerBg, text: COLORS.danger, border: 'rgba(239, 68, 68, 0.2)' };
      case 'info':
        return { bg: COLORS.infoBg, text: COLORS.info, border: 'rgba(59, 130, 246, 0.2)' };
      case 'gold':
        return { bg: COLORS.goldSubtle, text: COLORS.goldDark, border: 'rgba(200, 150, 62, 0.3)' };
      case 'default':
      default:
        return { bg: COLORS.primarySubtle, text: COLORS.primary, border: 'rgba(59, 10, 17, 0.15)' };
    }
  };

  const { bg, text, border } = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 8 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSm ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Badge;
