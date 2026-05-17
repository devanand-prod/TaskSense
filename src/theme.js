import { StyleSheet } from 'react-native';

export const colors = {
  primary:       '#185FA5',
  primaryLight:  '#EBF3FD',
  green:         '#1D9E75',
  orange:        '#E06B1A',
  red:           '#C4481C',
  bg:            '#FAFAF8',
  bgSecondary:   '#F0EDE8',
  card:          '#FFFFFF',
  text:          '#1A1A1A',
  textSecondary: '#555555',
  textTertiary:  '#999999',
  border:        'rgba(0,0,0,0.09)',
};

export const categoryColors = {
  Work:     { bg: '#EBF3FD', fg: '#185FA5' },
  Grocery:  { bg: '#E8F5EC', fg: '#2E7D47' },
  Shopping: { bg: '#FCE8F0', fg: '#9C2F6A' },
  Course:   { bg: '#EFECFD', fg: '#5240B8' },
  Health:   { bg: '#FDF0EB', fg: '#C4481C' },
  Personal: { bg: '#FEF5E7', fg: '#A0610E' },
  Finance:  { bg: '#E6F4F1', fg: '#1A7A69' },
};

export const typography = {
  h1:    { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h2:    { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  h3:    { fontSize: 15, fontWeight: '600' },
  body:  { fontSize: 14, lineHeight: 20 },
  sm:    { fontSize: 12 },
  xs:    { fontSize: 11, fontWeight: '500' },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const shadow = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  fab: {
    elevation: 8,
    shadowColor: '#185FA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
};
