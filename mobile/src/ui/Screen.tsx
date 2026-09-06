import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/theme/tokens';

type Props = { children: ReactNode; scroll?: boolean; padded?: boolean; contentStyle?: ViewStyle; footer?: ReactNode; edges?: Edge[] };

export function Screen({ children, scroll = true, padded = true, contentStyle, footer, edges = ['top', 'bottom'] }: Props) {
  const content = padded ? [styles.padded, contentStyle] : [contentStyle];
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {/* Every form in the app lives inside a Screen, and the keyboard used to
          cover the lower fields and the pinned footer button — there was no way
          to reach "Guardar" without dismissing it first. */}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {scroll ? (
          <ScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, content]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  padded: { padding: Spacing.xl, gap: Spacing.xl },
  footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.borderSoft, backgroundColor: Colors.background },
});
