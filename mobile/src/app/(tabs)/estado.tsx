import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { dueLabel, formatPEN } from '@/lib/format';
import { documentStatuses } from '@/mock/data';
import { useMockQuery } from '@/mock/use-mock-query';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { BorderWidth, Colors, Radius, Spacing, StatusMeta } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { CarHealthCard } from '@/ui/CarHealthCard';
import { IconCircleButton } from '@/ui/IconCircleButton';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { StatusChip } from '@/ui/StatusChip';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function Estado() {
  const { vehicle } = useVehicle();
  const { estimates } = useMaintenance();
  const { data: statuses, loading } = useMockQuery(() => documentStatuses);
  const worstDoc = statuses?.find((item) => item.status === 'expired');
  const pendingMaintenance = estimates.filter((item) => ['vencido', 'toca', 'pronto'].includes(item.status)).length;

  const allGood = !worstDoc && pendingMaintenance === 0;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="truck" size={20} color={Colors.onAccent} />
        </View>
        <View style={styles.headerActions}>
          <IconCircleButton icon="bell" onPress={() => router.push('/avisos')} accessibilityLabel="Abrir avisos" badge />
          <IconCircleButton icon="settings" onPress={() => router.push('/ajustes')} accessibilityLabel="Abrir ajustes" />
        </View>
      </View>

      <Pressable style={styles.identity} onPress={() => router.push('/vehiculo')} accessibilityRole="button" accessibilityLabel="Abrir ficha del vehículo">
        <View style={styles.identityRow}>
          <Txt variant="sectionTitle" numberOfLines={1} style={styles.flex}>{vehicle ? vehicle.brand + ' ' + vehicle.model : 'Tu vehículo'}</Txt>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: allGood ? Colors.statusOk : Colors.statusExpired }]} />
            <Txt variant="label" color={allGood ? Colors.statusOk : Colors.statusExpired}>{allGood ? 'Al día' : 'Pendiente'}</Txt>
          </View>
        </View>
        {loading ? <Skeleton width="55%" height={18} /> : (
          <Txt variant="body" color={Colors.textSecondary}>
            {vehicle ? String(vehicle.year) + ' · ' + vehicle.plate : 'Completa tu ficha'}
          </Txt>
        )}
      </Pressable>

      {worstDoc ? (
        <Surface size="md" style={styles.urgent}>
          <View style={[styles.stateBar, { backgroundColor: Colors.statusExpired }]} />
          <View style={styles.urgentBody}>
            <View style={styles.rowTop}>
              <Txt variant="cardTitle" style={styles.flex}>{worstDoc.title}</Txt>
              <StatusChip status={worstDoc.status} />
            </View>
            <Txt variant="mono" color={Colors.textSecondary}>{dueLabel(worstDoc.dueDate) + ' · Multa de ' + formatPEN(worstDoc.fineAmount ?? 0)}</Txt>
            <Txt variant="bodySmall" color={Colors.textMuted}>Resuélvelo antes de volver a trabajar con el auto.</Txt>
          </View>
        </Surface>
      ) : null}

      <View style={styles.sectionHead}>
        <Txt variant="sectionTitle">Documentos</Txt>
        <Button label="Ver todos" variant="tertiary" onPress={() => router.push('/documentos')} />
      </View>

      {loading ? <Surface size="md" style={styles.loadingCard}><Skeleton width="85%" height={22} /><Skeleton width="60%" height={18} /><Skeleton width="76%" height={22} /></Surface> : (
        <Surface size="md" style={styles.documentCard}>
          {(statuses ?? []).map((doc, index) => {
            const meta = StatusMeta[doc.status];
            return (
              <Pressable key={doc.id} onPress={() => router.push('/documentos')} style={[styles.documentRow, index < (statuses?.length ?? 0) - 1 && styles.divider]} accessibilityRole="button" accessibilityLabel={doc.title + ', ' + meta.label + ', ' + dueLabel(doc.dueDate)}>
                <View style={[styles.stateBar, { backgroundColor: meta.color }]} />
                <View style={styles.documentBody}>
                  <View style={styles.rowTop}><Txt variant="cardTitle">{doc.title}</Txt><StatusChip status={doc.status} /></View>
                  <Txt variant="mono" color={Colors.textSecondary}>{dueLabel(doc.dueDate)}</Txt>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
              </Pressable>
            );
          })}
        </Surface>
      )}

      <View style={styles.sectionHead}>
        <Txt variant="sectionTitle">Siguiente paso</Txt>
        <Txt variant="label" color={Colors.textTertiary}>FIXLY</Txt>
      </View>
      <View style={styles.tools}>
        <Tool title="Plan de mantenimiento" body="Lo que sigue según tu manual." icon="tool" onPress={() => router.push('/plan')} />
        <Tool title="Revisar proforma" body="Compara lo que te están cobrando." icon="camera" onPress={() => router.push('/proforma')} />
        <Tool title="Hablar con Fixly" body="Una respuesta clara sobre tu auto." icon="message-circle" onPress={() => router.push('/chatbot')} />
        <Tool title="Ver reportes" body="Gasto, servicios y documentos." icon="bar-chart-2" onPress={() => router.push('/reportes')} />
      </View>

      <CarHealthCard />
    </Screen>
  );
}

function Tool({ title, body, icon, onPress }: { title: string; body: string; icon: keyof typeof Feather.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tool, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={title + '. ' + body}>
      <View style={styles.toolIcon}><Feather name={icon} size={18} color={Colors.accent} /></View>
      <Txt variant="bodyBold">{title}</Txt>
      <Txt variant="bodySmall" color={Colors.textTertiary}>{body}</Txt>
      <Feather name="arrow-up-right" size={16} color={Colors.textTertiary} style={styles.toolArrow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: 10 },
  identity: { gap: 4, paddingTop: Spacing.lg },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.surfaceAlt },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  urgent: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  stateBar: { width: 4 },
  urgentBody: { flex: 1, padding: Spacing.lg, gap: 7 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  flex: { flex: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  documentCard: { paddingHorizontal: Spacing.lg },
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 78, paddingVertical: 10 },
  documentBody: { flex: 1, gap: 5 },
  divider: { borderBottomWidth: BorderWidth, borderBottomColor: Colors.borderSoft },
  loadingCard: { padding: Spacing.lg, gap: 14 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tool: { width: '47%', minHeight: 150, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: BorderWidth, borderColor: Colors.borderSoft, padding: Spacing.lg, gap: 9 },
  toolIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  toolArrow: { position: 'absolute', right: 16, top: 17 },
  pressed: { opacity: 0.84 },
});
