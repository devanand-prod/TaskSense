import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CategoryChip from '../components/CategoryChip';
import { colors, typography, shadow } from '../theme';
import { inferCat, inferDate, generateId } from '../utils/taskUtils';
import { addTask } from '../api/sheets';
import { CATEGORIES } from '../constants';

export default function ChatScreen({ route, navigation }) {
  const insets  = useSafeAreaInsets();
  const { input } = route.params;
  const flatRef = useRef(null);

  const dateInfo = inferDate(input);
  const [pending, setPending] = useState({
    title:     input,
    category:  inferCat(input),
    when:      dateInfo.when,
    dateLabel: dateInfo.label,
    defRem:    dateInfo.defRem,
    reminder:  null,
    source:    'text',
    note:      '',
    isNew:     true,
    overdue:   false,
  });
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const [messages, setMessages]   = useState([]);
  const [showSave, setShowSave]   = useState(false);
  const [step, setStep]           = useState(0);
  const [editMode, setEditMode]   = useState(null);
  const initialized               = useRef(false);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const addMsg = useCallback((msg) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2)}` },
    ]);
    scrollToEnd();
  }, [scrollToEnd]);

  const showTyping = useCallback(() => {
    setMessages(prev => [...prev, { id: 'typing', type: 'typing' }]);
    scrollToEnd();
  }, [scrollToEnd]);

  const removeTyping = useCallback(() => {
    setMessages(prev => prev.filter(m => m.id !== 'typing'));
  }, []);

  // Boot the conversation once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    addMsg({ type: 'user', text: input });

    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg({ type: 'ai', text: "Got it! Here's what I've set up — does this look right?" });
        addMsg({ type: 'card', id: `card_${Date.now()}` });
        setTimeout(() => {
          addMsg({
            type: 'chips',
            chips: ['Looks good ✓', 'Edit category', 'Edit date'],
          });
        }, 300);
      }, 900);
    }, 400);
  }, []);

  const handleChip = useCallback((chip) => {
    // Remove current chips
    setMessages(prev => prev.filter(m => m.type !== 'chips'));

    // ── Edit sub-flows ──
    if (editMode === 'cat') {
      const updated = { ...pendingRef.current, category: chip };
      pendingRef.current = updated;
      setPending(updated);
      setEditMode(null);
      addMsg({ type: 'user', text: chip });
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'card'),
        { type: 'card', id: `card_${Date.now()}` },
      ]);
      setTimeout(() => {
        addMsg({ type: 'chips', chips: ['Looks good ✓', 'Edit category', 'Edit date'] });
      }, 200);
      return;
    }

    if (editMode === 'date') {
      const dateMap = {
        Today:      { label: 'Today',     when: 'today',    defRem: 'Today 6:00 PM' },
        Tomorrow:   { label: 'Tomorrow',  when: 'upcoming', defRem: 'Tomorrow 9:00 AM' },
        'This week':{ label: 'This week', when: 'upcoming', defRem: 'Friday 6:00 PM' },
        'Next week':{ label: 'Next week', when: 'upcoming', defRem: 'Monday 9:00 AM' },
        Weekend:    { label: 'Weekend',   when: 'upcoming', defRem: 'Saturday 10:00 AM' },
      };
      const d = dateMap[chip] || { label: chip, when: 'upcoming', defRem: chip };
      const updated = { ...pendingRef.current, ...d };
      pendingRef.current = updated;
      setPending(updated);
      setEditMode(null);
      addMsg({ type: 'user', text: chip });
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'card'),
        { type: 'card', id: `card_${Date.now()}` },
      ]);
      setTimeout(() => {
        addMsg({ type: 'chips', chips: ['Looks good ✓', 'Edit category', 'Edit date'] });
      }, 200);
      return;
    }

    // ── Inline edit shortcuts ──
    if (chip === 'Edit category') {
      addMsg({ type: 'user', text: chip });
      addMsg({ type: 'ai', text: 'Which category fits better?' });
      setEditMode('cat');
      setTimeout(() => addMsg({ type: 'chips', chips: CATEGORIES }), 300);
      return;
    }
    if (chip === 'Edit date') {
      addMsg({ type: 'user', text: chip });
      addMsg({ type: 'ai', text: 'When should I schedule this?' });
      setEditMode('date');
      setTimeout(() => {
        addMsg({ type: 'chips', chips: ['Today', 'Tomorrow', 'This week', 'Next week', 'Weekend'] });
      }, 300);
      return;
    }

    // ── Main flow ──
    addMsg({ type: 'user', text: chip });

    if (step === 0) {
      setStep(1);
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          removeTyping();
          addMsg({ type: 'ai', text: 'Do you want a reminder for this?' });
          setTimeout(() => {
            addMsg({ type: 'chips', chips: ['Yes, remind me', 'No thanks'] });
          }, 300);
        }, 700);
      }, 400);
      return;
    }

    if (step === 1) {
      const withReminder = chip === 'Yes, remind me';
      const rem = withReminder ? pendingRef.current.defRem : null;
      const updated = { ...pendingRef.current, reminder: rem };
      pendingRef.current = updated;
      setPending(updated);

      showTyping();
      setTimeout(() => {
        removeTyping();
        const aiText = withReminder
          ? `Reminder set for ${rem}. All done!`
          : 'No reminder — got it. Task is ready!';
        addMsg({ type: 'ai', text: aiText });
        setTimeout(() => setShowSave(true), 400);
      }, 700);
    }
  }, [editMode, step, addMsg, showTyping, removeTyping]);

  const handleSave = async () => {
    const task = {
      id:        generateId(),
      ...pendingRef.current,
      done:      false,
      priority:  'Medium',
      createdAt: new Date().toISOString(),
      userId:    'user_001',
    };
    await addTask(task);
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MainTabs' },
        { name: 'Detail', params: { task } },
      ],
    });
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'typing':
        return <TypingBubble />;
      case 'user':
        return (
          <View style={styles.mwUser}>
            <View style={styles.ububble}>
              <Text style={styles.ubText}>{item.text}</Text>
            </View>
          </View>
        );
      case 'ai':
        return (
          <View style={styles.mwAI}>
            <AiAvatar />
            <View style={styles.abubble}>
              <Text style={styles.abText}>{item.text}</Text>
            </View>
          </View>
        );
      case 'card':
        return (
          <SummaryCard
            pending={pending}
            onEditCat={() => handleChip('Edit category')}
            onEditDate={() => handleChip('Edit date')}
          />
        );
      case 'chips':
        return (
          <View style={styles.chipRow}>
            {item.chips.map(c => (
              <TouchableOpacity
                key={c}
                style={styles.chip}
                onPress={() => handleChip(c)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

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
        <View style={styles.headerCenter}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.headerTitle}>TaskSense AI</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        extraData={pending}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Save button */}
      {showSave && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save task  ✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Sub-components ──

function AiAvatar() {
  return (
    <View style={styles.avatar}>
      <Ionicons name="sparkles" size={13} color={colors.primary} />
    </View>
  );
}

function TypingBubble() {
  const a0 = useRef(new Animated.Value(0.3)).current;
  const a1 = useRef(new Animated.Value(0.3)).current;
  const a2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const make = (a, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(a, { toValue: 1,   duration: 280, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0.3, duration: 280, useNativeDriver: true }),
          Animated.delay(Math.max(0, 560 - delay)),
        ])
      );
    const l0 = make(a0, 0);
    const l1 = make(a1, 190);
    const l2 = make(a2, 380);
    l0.start(); l1.start(); l2.start();
    return () => { l0.stop(); l1.stop(); l2.stop(); };
  }, []);

  return (
    <View style={styles.mwAI}>
      <AiAvatar />
      <View style={[styles.abubble, styles.typingBubble]}>
        {[a0, a1, a2].map((a, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: a }]} />
        ))}
      </View>
    </View>
  );
}

function SummaryCard({ pending, onEditCat, onEditDate }) {
  return (
    <View style={[styles.mwAI, { alignItems: 'flex-start' }]}>
      <View style={{ width: 28 }} />
      <View style={[styles.card, shadow.sm]}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{pending.title}</Text>
          <View style={styles.cardMeta}>
            <CategoryChip category={pending.category} size="md" />
            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.dateText}> {pending.dateLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardBtns}>
          <TouchableOpacity style={styles.cardBtn} onPress={onEditCat} activeOpacity={0.7}>
            <Ionicons name="pricetag-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.cardBtnText}> Category</Text>
          </TouchableOpacity>
          <View style={styles.cardDivider} />
          <TouchableOpacity style={styles.cardBtn} onPress={onEditDate} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.cardBtnText}> Date</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  backBtn:     { flexDirection: 'row', alignItems: 'center', width: 60 },
  backText:    { fontSize: 14, color: colors.primary, fontWeight: '500' },
  headerCenter:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  headerTitle: { ...typography.h3, color: colors.text },

  msgList: { padding: 16, paddingBottom: 20, gap: 8 },

  mwUser: { flexDirection: 'row', justifyContent: 'flex-end' },
  mwAI:   { flexDirection: 'row', alignItems: 'flex-end', gap: 7 },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  ububble: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 3,
    padding: 10,
    maxWidth: 230,
  },
  ubText: { fontSize: 13, color: '#fff', lineHeight: 20 },

  abubble: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    borderBottomLeftRadius: 3,
    padding: 10,
    maxWidth: 230,
  },
  abText: { fontSize: 13, color: colors.text, lineHeight: 20 },

  typingBubble: { flexDirection: 'row', gap: 5, paddingVertical: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#BBB' },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 35,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: { fontSize: 12, color: colors.primary, fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    maxWidth: 230,
    width: '100%',
  },
  cardBody:  { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: 19, marginBottom: 8 },
  cardMeta:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  datePill:  { flexDirection: 'row', alignItems: 'center' },
  dateText:  { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  cardBtns: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  cardDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  cardBtnText: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: '#fff', letterSpacing: 0.1 },
});
