import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

type Message = { id: string; from: 'assistant' | 'user'; text: string };
const STARTER: Message = { id: 'welcome', from: 'assistant', text: 'Hola. Puedo explicarte el plan de tu auto y ayudarte a entender una proforma. ¿Qué quieres revisar?' };
const SUGGESTIONS = ['¿Qué me toca ahora?', '¿Cuánto cuesta un cambio de aceite?', '¿Puedo seguir manejando?'];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [draft, setDraft] = useState('');

  function ask(text = draft) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: String(Date.now()), from: 'user', text: clean }, { id: String(Date.now()) + '-answer', from: 'assistant', text: answerFor(clean) }]);
    setDraft('');
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentStyle={styles.screen}>
        <DetailHeader title="Chatbot Fixly" />
        <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>ASISTENTE DEL AUTO</Txt><Txt variant="screenTitle">Pregunta sin jerga.</Txt><Txt variant="body" color={Colors.textSecondary}>Respuestas sobre tus datos y tu manual. Si algo no está registrado, te lo diremos.</Txt></View>
        <View style={styles.messages} accessibilityLiveRegion="polite">
          {messages.map((message) => <View key={message.id} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.assistantBubble]}><Txt variant="body" color={message.from === 'user' ? Colors.onAccent : Colors.textPrimary}>{message.text}</Txt></View>)}
        </View>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((suggestion) => <Pressable key={suggestion} onPress={() => ask(suggestion)} style={styles.suggestion} accessibilityRole="button" accessibilityLabel={suggestion}><Txt variant="bodySmall" color={Colors.accentLight}>{suggestion}</Txt></Pressable>)}
        </View>
        <Surface size="md" style={styles.composer}>
          <TextInput value={draft} onChangeText={setDraft} placeholder="Escribe tu pregunta" placeholderTextColor={Colors.textTertiary} multiline accessibilityLabel="Pregunta para Fixly" style={styles.input} onSubmitEditing={() => ask()} />
          <Pressable onPress={() => ask()} style={styles.send} accessibilityRole="button" accessibilityLabel="Enviar pregunta"><Feather name="arrow-up" size={20} color={Colors.onAccent} /></Pressable>
        </Surface>
        <Button label="Volver al estado" variant="tertiary" onPress={() => router.replace('/estado')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function answerFor(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes('aceite')) return 'El cambio de aceite y filtro aparece cada 10.000 km en el plan de tu Yaris. En talleres de Lima, el rango de referencia es S/90 a S/140.';
  if (lower.includes('manejar') || lower.includes('salir')) return 'Tu auto puede circular, pero el SOAT aparece vencido. Renúevalo antes de trabajar con el auto.';
  return 'Puedo ayudarte a leer el plan, pero no diagnostico fallas. Para una decisión de seguridad, pide una revisión en un taller.';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  screen: { paddingBottom: Spacing.xl },
  intro: { gap: 14, paddingTop: Spacing.lg },
  messages: { gap: 10 },
  bubble: { maxWidth: '88%', borderRadius: Radius.md, padding: Spacing.lg },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.accent },
  suggestions: { gap: 8 },
  suggestion: { minHeight: 56, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.pill, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 10 },
  input: { flex: 1, minHeight: 56, maxHeight: 120, color: Colors.textPrimary, fontSize: 16, lineHeight: 22, paddingHorizontal: 10, paddingVertical: 12 },
  send: { width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
});

