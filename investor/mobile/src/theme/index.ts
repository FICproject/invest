import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';
import { SPACING, RADIUS } from './spacing';
import { SHADOWS } from './shadows';

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};

export type Theme = typeof THEME;
export default THEME;
