import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

export default function CaptureScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, duration: 320, useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 0.45, duration: 300, useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400, duration: 260, useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 0, duration: 240, useNativeDriver: true,
      }),
    ]).start(() => navigation.goBack());
  };

  const handleContinue = () => {
    const trimmed = text.trim();
    if (trimmed.length < 2) return;
    navigation.replace('Chat', { input: trimmed });
  };

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View style={[styles.overlay, { opacity: bgAnim }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior="height" style={styles.kav}>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>What's on your mind?</Text>
            <TouchableOpacity onPress={dismiss} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="e.g. Call Priya tomorrow about Q3, or Buy milk and eggs..."
            placeholderTextColor="#BBB"
            multiline
            textAlignVertical="top"
            maxLength={300}
            value={text}
            onChangeText={setText}
            blurOnSubmit={false}
          />

          <Text style={styles.hint}>
            TaskSense will auto-classify and schedule from your input
          </Text>

          <TouchableOpacity
            style={[
              styles.continueBtn,
              text.trim().length < 2 && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={text.trim().length < 2}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: { ...typography.h2, color: colors.text },
  closeBtn: { padding: 4 },
  input: {
    width: '100%',
    minHeight: 90,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 14,
  },
  continueBtn: {
    width: '100%',
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.35 },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.1,
  },
});
