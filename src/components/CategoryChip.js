import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { categoryColors } from '../theme';

export default function CategoryChip({ category, size = 'sm' }) {
  const { bg, fg } = categoryColors[category] || { bg: '#EEE', fg: '#555' };

  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }, size === 'md' && styles.textMd]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: 12,
  },
});
