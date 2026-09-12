import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TaskRow from '../components/TaskRow';
import { colors, typography, shadow } from '../theme';
import { fetchTasks, toggleTaskDone } from '../api/sheets';
import { cancelTaskNotification } from '../utils/notifications';

function timeOfDayGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchTasks();
    setTasks(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggle = async (id) => {
    const target = tasks.find(t => t.id === id);
    if (target && !target.done) {
      cancelTaskNotification(target);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    await toggleTaskDone(id);
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const todayTasks    = tasks.filter(t => t.when === 'today');
  const upcomingTasks = tasks.filter(t => t.when === 'upcoming');
  const doneCnt       = tasks.filter(t => t.done).length;
  const overdueCnt    = tasks.filter(t => t.overdue && !t.done).length;

  const listData = [
    { type: 'header' },
    { type: 'section', label: 'Today' },
    ...todayTasks.map(t => ({ type: 'task', task: t })),
    ...(todayTasks.length === 0
      ? [{ type: 'empty', key: 'empty_today', msg: 'No tasks for today' }]
      : []),
    { type: 'section', label: 'Upcoming' },
    ...upcomingTasks.map(t => ({ type: 'task', task: t })),
    ...(upcomingTasks.length === 0
      ? [{ type: 'empty', key: 'empty_upcoming', msg: 'Nothing upcoming' }]
      : []),
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.dateText}>{dayName}, {dateStr}</Text>
                <Text style={styles.greeting}>{timeOfDayGreeting(today)}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={18} color="#555" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <StatCard value={tasks.length} label="Total"   color={colors.primary} />
              <StatCard value={doneCnt}       label="Done"    color={colors.green} />
              <StatCard value={overdueCnt}    label="Overdue" color={colors.orange} />
            </View>
          </View>
        );
      case 'section':
        return <Text style={styles.sectionLabel}>{item.label}</Text>;
      case 'empty':
        return (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>{item.msg}</Text>
          </View>
        );
      case 'task':
        return (
          <TaskRow
            task={item.task}
            onPress={() => navigation.push('Detail', { task: item.task })}
            onToggle={() => handleToggle(item.task.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={listData}
        keyExtractor={(item, i) => item.task?.id ?? (item.key || item.type + i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, shadow.fab]}
        onPress={() => navigation.navigate('Capture')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dateText: { fontSize: 12, color: colors.textTertiary, marginBottom: 2 },
  greeting: { ...typography.h1, color: colors.text },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statNum:   { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: {
    fontSize: 9,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textTertiary,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 5,
  },
  emptyRow: { paddingHorizontal: 18, paddingVertical: 12 },
  emptyText: { fontSize: 13, color: '#CCC', fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
