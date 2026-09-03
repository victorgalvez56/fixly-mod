import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { formatPEN } from '@/lib/format';
import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const ITEMS = [
  { name: 'Aceite y filtro', price: 110, verdict: 'normal', note: '' },
  { name: 'Pastillas delanteras', price: 420, verdict: 'caro', note: 'Para tu Yaris, el rango habitual es S/120–220.' },
  { name: 'Aditivo premium', price: 95, verdict: 'innecesario', note: 'No aparece como cambio programado en el manual.' },
] as const;

export default function Proforma() {
  const [result, setResult] = useState(false);
  if (!result) {
    return (
      <Screen>
        <DetailHeader title="Revisar proforma" />
        <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>ANTES DE PAGAR</Txt><Txt variant="screenTitle">¿Te están cobrando lo justo?</Txt><Txt variant="body" color={Colors.textSecondary}>Toma una foto de la proforma y revisa cada ítem con una explicación simple.</Txt></View>
        <EmptyState icon="camera" title="Fotografía tu proforma" description="La lista debe verse completa y con los precios legibles. En esta versión puedes probar con el ejemplo." />
        <Button label="Tomar foto de la proforma" variant="primary" icon={<Feather name="camera" size={19} color={Colors.onAccent} />} onPress={() => setResult(true)} />
        <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.note}>La revisión orienta. No reemplaza la opinión de un mecánico.</Txt>
      </Screen>
    );
  }

  const total = ITEMS.reduce((sum, item) => sum + item.price, 0);
  return (
    <Screen>
      <DetailHeader title="Revisar proforma" />
      <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>RESULTADO DE EJEMPLO</Txt><Txt variant="screenTitle">Revisa antes de aprobar.</Txt><Txt variant="body" color={Colors.textSecondary}>Compara cada línea con un rango habitual y pregunta por lo que no entiendas.</Txt></View>
      <Surface size="md" style={styles.list}>
        {ITEMS.map((item, index) => <QuoteRow key={item.name} {...item} last={index === ITEMS.length - 1} />)}
      </Surface>
      <Surface size="md" style={styles.totalCard}>
        <Txt variant="label" color={Colors.textTertiary}>TOTAL DE LA PROFORMA</Txt>
        <Txt variant="bigNumber">{formatPEN(total)}</Txt>
        <Txt variant="bodySmall" color={Colors.statusWarn}>Está S/295 por encima del rango orientativo para este trabajo.</Txt>
      </Surface>
      <Button label="Revisar otra proforma" variant="secondary" onPress={() => setResult(false)} />
    </Screen>
  );
}

function QuoteRow({ name, price, verdict, note, last }: { name: string; price: number; verdict: 'normal' | 'caro' | 'innecesario'; note: string; last: boolean }) {
  const meta = verdict === 'normal' ? { color: Colors.statusOk, label: 'Normal' } : verdict === 'caro' ? { color: Colors.statusWarn, label: 'Caro' } : { color: Colors.statusExpired, label: 'Innecesario' };
  return <View style={[styles.quoteRow, !last && styles.divider]}><View style={[styles.verdictBar, { backgroundColor: meta.color }]} /><View style={styles.quoteBody}><View style={styles.quoteTop}><Txt variant="bodyBold" style={styles.flex}>{name}</Txt><Txt variant="mono">{formatPEN(price)}</Txt></View><Txt variant="label" color={meta.color}>{meta.label}</Txt>{note ? <Txt variant="bodySmall" color={Colors.textTertiary}>{note}</Txt> : null}</View></View>;
}

const styles = StyleSheet.create({
  intro: { gap: 14, paddingTop: Spacing.lg },
  note: { textAlign: 'center' },
  list: { paddingHorizontal: Spacing.lg },
  quoteRow: { flexDirection: 'row', gap: 12, paddingVertical: Spacing.lg },
  verdictBar: { width: 4, borderRadius: 2 },
  quoteBody: { flex: 1, gap: 6 },
  quoteTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  totalCard: { padding: Spacing.lg, gap: 8, borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
});
