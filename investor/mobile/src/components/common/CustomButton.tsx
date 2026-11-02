import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.container };

    // Size
    if (size === 'sm') {
      base = { ...base, paddingVertical: 8, paddingHorizontal: 14, minHeight: 38 };
    } else if (size === 'lg') {
      base = { ...base, paddingVertical: 14, paddingHorizontal: 24, minHeight: 52 };
    } else {
      base = { ...base, paddingVertical: 12, paddingHorizontal: 18, minHeight: 46 };
    }

    // Variant
    switch (variant) {
      case 'gold':
        base = { ...base, backgroundColor: COLORS.gold, ...SHADOWS.gold };
        break;
      case 'secondary':
        base = { ...base, backgroundColor: COLORS.surfaceSubtle, borderWidth: 1, borderColor: COLORS.border };
        break;
      case 'outline':
        base = { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary };
        break;
      case 'danger':
        base = { ...base, backgroundColor: COLORS.danger };
        break;
      case 'ghost':
        base = { ...base, backgroundColor: 'transparent', elevation: 0 };
        break;
      case 'primary':
      default:
        base = { ...base, backgroundColor: COLORS.primary, ...SHADOWS.sm };
        break;
    }

    if (disabled || loading) {
      base = { ...base, opacity: 0.6, elevation: 0 };
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { ...styles.text };

    if (size === 'sm') {
      base = { ...base, fontSize: 13 };
    } else if (size === 'lg') {
      base = { ...base, fontSize: 16, fontWeight: '700' };
    }

    switch (variant) {
      case 'gold':
        base = { ...base, color: COLORS.primaryDark, fontWeight: '700' };
        break;
      case 'secondary':
        base = { ...base, color: COLORS.textPrimary };
        break;
      case 'outline':
        base = { ...base, color: COLORS.primary, fontWeight: '600' };
        break;
      case 'ghost':
        base = { ...base, color: COLORS.primary };
        break;
      case 'danger':
      case 'primary':
      default:
        base = { ...base, color: COLORS.white };
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'gold' ? COLORS.primaryDark : variant === 'outline' || variant === 'secondary' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomButton;
