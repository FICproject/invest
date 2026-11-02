import { ViewStyle, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

export const SHADOWS: { [key: string]: ViewStyle } = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
    }),
  },
  md: {
    ...Platform.select({
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
    }),
  },
  lg: {
    ...Platform.select({
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
    }),
  },
  gold: {
    ...Platform.select({
      android: {
        elevation: 6,
      },
      default: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
};
