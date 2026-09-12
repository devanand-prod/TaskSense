import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CategoryChip from '../components/CategoryChip';
import { colors, typography } from '../theme';
import { updateTask, deleteTask } from '../api/sheets';
import { formatReminderLabel } from '../utils/nlp';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notifications';

export default function DetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [task, setTask] = useState(route.params.task);

  const save = async (updated) => {
    setTask(updated);
    await updateTask(updated);
  };

  const handleToggle = () => {
    if (!task.done) cancelTaskNotification(task);
    save({ ...task, done: !task.done });
  };

  const handleDelete = () => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          cancelTaskNotification(task);
          await deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const removeReminder = () => {
    cancelTaskNotification(task);
    save({ ...task, reminder: null, reminderDate: null, notificationId: null });
  };

  const addReminder = async () => {
    const reminderDate = task.dateISO || new Date().toISOString();
    const label = formatReminderLabel(new Date(reminderDate));
    const withDate = { ...task, reminderDate };
    const notificationId = await scheduleTaskNotification(withDate);
    save({ ...withDate, reminder: label, notificationId });
  };

  const priorityColor =
    task.priority === 'High'
      ? colors.orange
      : task.priority === 'Medium'
      ? colors.primary
      : '#AAA';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task detail</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#555" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={[styles.check, task.done && styles.checkDone]}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            {task.done && <Ionicons name="checkmark" size={13} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>

        {task.isNew && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={11} color={colors.primary} />
            <Text style={styles.aiBadgeText}>Added by TaskSense AI</Text>
          </View>
        )}

        {/* Field rows */}
        <FieldRow icon="pricetag-outline" label="Category">
          <CategoryChip category={task.category} size="md" />
          <Ionicons
            name="pencil-outline"
            size={14}
            color={colors.primary}
            style={{ marginLeft: 8 }}
          />
        </FieldRow>

        <FieldRow icon="flag-outline" label="Priority">
          <Text style={[styles.fieldValue, { color: priorityColor }]}>
            {task.priority}
          </Text>
        </FieldRow>

        <FieldRow icon="calendar-outline" label="Scheduled">
          <Text style={styles.fieldValue}>{task.dateLabel}</Text>
        </FieldRow>

        {task.url && (
          <FieldRow icon="link-outline" label="Source">
            <Text style={[styles.fieldValue, { color: colors.primary, fontSize: 13 }]}>
              {task.url}
            </Text>
          </FieldRow>
        )}

        <FieldRow icon="repeat-outline" label="Recurrence">
          <Text style={[styles.fieldValue, { color: '#BBB' }]}>None</Text>
        </FieldRow>

        {/* Reminder */}
        {task.reminder ? (
          <View style={styles.reminderBanner}>
            <Ionicons name="notifications-outline" size={18} color="#2E7D47" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Reminder set</Text>
              <Text style={styles.reminderTime}>{task.reminder}</Text>
              <View style={styles.reminderBtns}>
                <TouchableOpacity style={[styles.rBtn, styles.rBtnFill]} activeOpacity={0.7}>
                  <Text style={styles.rBtnFillText}>Keep it</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rBtn} activeOpacity={0.7}>
                  <Text style={styles.rBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rBtn} onPress={removeReminder} activeOpacity={0.7}>
                  <Text style={styles.rBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginHorizontal: 18, marginVertical: 12 }}>
            <TouchableOpacity style={styles.addReminderBtn} onPress={addReminder} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={16} color={colors.primary} />
              <Text style={styles.addReminderText}>Add a reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>
              {task.note || 'No notes yet. Tap to add...'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.red} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doneBtn, task.done && styles.undoneBtn]}
            onPress={handleToggle}
            activeOpacity={0.85}
          >
            <Text style={[styles.doneBtnText, task.done && styles.undoneBtnText]}>
              {task.done ? 'Mark as to-do' : 'Mark as done'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function FieldRow({ icon, label, children }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={16} color="#BBB" />
      </View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 60 },
  backText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  headerTitle: { flex: 1, ...typography.h3, color: colors.text, textAlign: 'center' },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  taskTitle: { ...typography.h2, flex: 1, color: colors.text, lineHeight: 24 },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginTop: 10,
  },
  aiBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  fieldIcon:    { width: 20, alignItems: 'center' },
  fieldLabel:   { fontSize: 12, color: '#999', width: 72, fontWeight: '500' },
  fieldContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  fieldValue:   { fontSize: 14, color: colors.text },

  reminderBanner: {
    margin: 14,
    backgroundColor: '#E8F5EC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  reminderTitle: { fontSize: 13, fontWeight: '600', color: '#1A5C2A' },
  reminderTime:  { fontSize: 12, color: '#2E7D47', marginTop: 2 },
  reminderBtns:  { flexDirection: 'row', gap: 7, marginTop: 9 },
  rBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#2E7D47',
  },
  rBtnText:     { fontSize: 11, color: '#2E7D47', fontWeight: '600' },
  rBtnFill:     { backgroundColor: '#2E7D47', borderColor: '#2E7D47' },
  rBtnFillText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  addReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 11,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addReminderText: { fontSize: 13, color: colors.primary, fontWeight: '500' },

  notesSection: { margin: 18 },
  notesLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textTertiary,
    marginBottom: 7,
  },
  notesBox: {
    backgroundColor: '#F5F4F0',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  notesText: { fontSize: 13, color: '#BBB', lineHeight: 19 },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 20,
  },
  deleteBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FDF0EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: colors.red },
  doneBtn: {
    flex: 2,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText:   { fontSize: 13, fontWeight: '600', color: '#fff' },
  undoneBtn:     { backgroundColor: '#F5F4F0' },
  undoneBtnText: { color: '#999' },
});
