import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryChip from './CategoryChip';
import { colors } from '../theme';

function TaskRow({ task, onPress, onToggle }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={[styles.check, task.done && styles.checkDone]}
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        {task.done && <Ionicons name="checkmark" size={11} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.body}>
        <Text
          style={[styles.title, task.done && styles.titleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          <CategoryChip category={task.category} size="sm" />
          {task.overdue && !task.done && (
            <View style={styles.metaRow}>
              <Ionicons name="alert-circle-outline" size={10} color={colors.orange} />
              <Text style={styles.overdueText}> Overdue</Text>
            </View>
          )}
          {task.reminder && !task.overdue && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={10} color={colors.textTertiary} />
              <Text style={styles.remText}> {task.reminder}</Text>
            </View>
          )}
          {task.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color="#CCC" style={styles.chevron} />
    </TouchableOpacity>
  );
}

export default memo(TaskRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: colors.bg,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  body: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, color: colors.text, lineHeight: 20 },
  titleDone: { textDecorationLine: 'line-through', color: '#BBB' },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  overdueText: { fontSize: 10, color: colors.orange, fontWeight: '500' },
  remText: { fontSize: 10, color: colors.textTertiary },
  newBadge: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: { fontSize: 9, color: '#fff', fontWeight: '600', letterSpacing: 0.3 },
  chevron: { marginTop: 2, marginLeft: 8 },
});
