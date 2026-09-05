import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { componentDef } from '@/data/catalog';
import { formatKm } from '@/lib/format';
import { COPY } from '@/lib/wear/copy';
import { confidenceLabel, explanation, formatDateEs, intervalSentence, isInspect, kmPerDayLabel, statusWord } from '@/lib/wear/selectors';
import { useMaintenance } from '@/state/use-maintenance';
import { Colors, ComponentStatusMeta, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { IntervalRing } from '@/ui/IntervalRing';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function ServicioDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId, specFor } = useMaintenance();
  const [help, setHelp] = useState(false);
  const estimate = id ? byId(id) : null;
  const spec = id ? specFor(id) : null;
  const def = componentDef(id ?? '');

  if (!estimate || !spec) {
    return (
      <Screen>
        <DetailHeader title="Servicio" />
        <Txt variant="body" color={Colors.textSecondary}>
          No encontramos este componente en el manual de tu auto.
        </Txt>
      </Screen>
    );
  }

  const meta = ComponentStatusMeta[estimate.status];
  const confidence = confidenceLabel(estimate);
  const interval = estimate.severeApplied && spec.severe ? spec.severe : spec.normal;
  const intervalShort = [interval.km !== null ? `${(interval.km / 1000).toLocaleString('es-PE')} mil km` : null, interval.months !== null ? `${interval.months} meses` : null]
    .filter(Boolean)
    .join(' o ');

  const footer = (
    <View style={styles.footer}>
      <Button
        label={estimate.status === 'sin_datos' ? COPY.recordLastChange : COPY.doneAction}
        variant="primary"
        onPress={() => router.push({ pathname: '/registrar', params: { component: estimate.componentId } })}
      />
      <Button label={COPY.scheduleAction} variant="tertiary" onPress={() => {}} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <DetailHeader title={isInspect(estimate) ? 'Revisión según tu manual' : 'Cambio según tu manual'} />

      <Txt variant="screenTitle">{def.label}</Txt>

      <Surface size="md" style={styles.ringCard}>
        <IntervalRing estimate={estimate} size={148} caption={intervalSentence(spec, estimate)} confidence={confidence} onPressHelp={() => setHelp(true)} />
      </Surface>

      <Surface size="md" style={styles.factsCard}>
        <Fact label="Cada" value={intervalShort || 'Sin intervalo'} />
        <View style={styles.divider} />
        <Fact
          label={isInspect(estimate) ? 'Última revisión' : 'Última vez'}
          value={estimate.anchor.date ? `${formatDateEs(estimate.anchor.date)}${estimate.anchor.km !== null ? ` · ${formatKm(Math.round(estimate.anchor.km))}` : ''}` : 'Sin registro'}
          wide
        />
        <View style={styles.divider} />
        <Fact label="Precio ref." value={`S/${def.priceRangePen[0]} a ${def.priceRangePen[1]}`} mono />
      </Surface>

      <View style={[styles.statusBlock, { backgroundColor: meta.soft }]}>
        <Txt variant="label" color={meta.text}>
          {statusWord(estimate)}
        </Txt>
        <Txt variant="body" color={Colors.textPrimary}>
          {explanation(estimate, spec, def.label)}
        </Txt>
      </View>

      {def.description ? <Txt variant="body">{def.description}</Txt> : null}

      {def.whatIfSkipped ? (
        <View style={[styles.warnBlock, { backgroundColor: Colors.statusWarnSoft }]}>
          <Txt variant="label" color={Colors.warningText}>
            {COPY.ifSkipped}
          </Txt>
          <Txt variant="body" color={Colors.textSecondary}>
            {def.whatIfSkipped}
          </Txt>
        </View>
      ) : null}

      {def.checklist.length > 0 ? (
        <View>
          <Txt variant="label" color={Colors.textTertiary} style={styles.checklistLabel}>
            Debería incluir
          </Txt>
          <Surface size="md" style={styles.checklistCard}>
            {def.checklist.map((line, index) => (
              <View key={line} style={[styles.checklistRow, index < def.checklist.length - 1 && styles.checklistDivider]}>
                <Txt variant="body">{line}</Txt>
              </View>
            ))}
          </Surface>
          <Txt variant="bodySmall" color={Colors.textTertiary} style={styles.priceNote}>
            El precio es referencial de talleres de Lima, no viene del manual.
          </Txt>
        </View>
      ) : null}

      <Modal visible={help} transparent animationType="fade" onRequestClose={() => setHelp(false)}>
        <Pressable style={styles.backdrop} onPress={() => setHelp(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Txt variant="sectionTitle">{COPY.howItWorksTitle}</Txt>
            <Txt variant="body" color={Colors.textSecondary}>
              {COPY.howItWorks}
            </Txt>
            {estimate.kmTrack ? (
              <Txt variant="bodySmall" color={Colors.textTertiary}>
                Para este cálculo: {kmPerDayLabel(estimate)}.
              </Txt>
            ) : null}
            <Button label="Entendido" variant="secondary" onPress={() => setHelp(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function Fact({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <View style={[styles.fact, wide && styles.factWide]}>
      <Txt variant="label" color={Colors.textTertiary}>
        {label}
      </Txt>
      <Txt variant={mono ? 'mono' : 'body'} style={styles.factValue}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  ringCard: { padding: 20, alignItems: 'center' },
  factsCard: { flexDirection: 'row', alignItems: 'stretch', padding: 16 },
  fact: { flex: 1, gap: 4 },
  factWide: { flex: 1.5 },
  factValue: { fontSize: 14 },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 10 },
  statusBlock: { gap: 6, padding: 16, borderRadius: Radius.md },
  warnBlock: { gap: 4, padding: 16, borderRadius: Radius.md },
  checklistLabel: { marginBottom: 8 },
  checklistCard: { paddingHorizontal: 16 },
  checklistRow: { paddingVertical: 12 },
  checklistDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  priceNote: { marginTop: 8 },
  footer: { gap: Spacing.xs },
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: 24, gap: 14, paddingBottom: 36 },
});
