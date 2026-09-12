import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TaskRow from '../components/TaskRow';
import { colors, shadow } from '../theme';
import { fetchTasks, toggleTaskDone } from '../api/sheets';
import { cancelTaskNotification } from '../utils/notifications';
import { CATEGORIES } from '../constants';

const FILTERS = ['All', ...CATEGORIES];

export default function AllTasksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState('All');
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

  const filtered = useMemo(
    () => filter === 'All' ? tasks : tasks.filter(t => t.category === filter),
    [tasks, filter]
  );

  const countFor = cat =>
    cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Text style={styles.headerTitle}>All tasks</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={18} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipOn]}
            onPress={() => setFilter(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextOn]}>
              {cat} ({countFor(cat)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onPress={() => navigation.push('Detail', { task: item })}
            onToggle={() => handleToggle(item.id)}
          />
        )}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#DDD" />
            <Text style={styles.emptyText}>No tasks in this category</Text>
          </View>
        }
      />

      {/* FAB */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 7 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  filterChipOn:  { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:    { fontSize: 11, fontWeight: '600', color: '#777', letterSpacing: 0.1 },
  filterTextOn:  { color: '#fff' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#CCC', marginTop: 10 },

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
