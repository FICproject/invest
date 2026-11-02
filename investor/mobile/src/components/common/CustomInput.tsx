import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import Icon from './Icon';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 10,
  },
  leftIconWrapper: {
    marginRight: 10,
  },
  rightIconWrapper: {
    marginLeft: 10,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default CustomInput;
