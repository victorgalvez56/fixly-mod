import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { dueLabel, formatPEN } from '@/lib/format';
import { documentStatuses } from '@/mock/data';
import { useMockQuery } from '@/mock/use-mock-query';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Radius, Spacing, StatusMeta } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { CarHealthCard } from '@/ui/CarHealthCard';
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

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.identity} onPress={() => router.push('/vehiculo')} accessibilityRole="button" accessibilityLabel="Abrir ficha del vehículo">
          <View style={styles.plateChip}><View style={styles.plateStripe} /><Txt variant="mono" color={Colors.dark} style={styles.plateText}>{vehicle?.plate ?? '---'}</Txt></View>
          <View style={styles.identityText}>
            <Txt variant="cardTitle" numberOfLines={1}>{vehicle ? vehicle.brand + ' ' + vehicle.model : 'Tu vehículo'}</Txt>
            <Txt variant="monoSmall" color={Colors.textTertiary}>{vehicle ? String(vehicle.year) + ' · ' + vehicle.color : 'Completa tu ficha'}</Txt>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/avisos')} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Abrir avisos">
          <Feather name="bell" size={20} color={Colors.textPrimary} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Txt variant="label" color={Colors.accentLight}>ESTADO DE HOY</Txt>
        <Txt variant="screenTitle">¿Puedes salir hoy?</Txt>
        {loading ? <Skeleton width="70%" height={20} /> : (
          <Txt variant="body" color={Colors.textSecondary}>
            {worstDoc ? 'Hay ' + (pendingMaintenance + 1) + ' cosas que conviene resolver.' : 'Tus documentos están en regla.'}
          </Txt>
        )}
        <View style={styles.heroRule} />
        <View style={styles.countRow}>
          <View>
            <Txt variant="bigNumber" color={worstDoc ? Colors.statusExpired : Colors.statusOk}>{worstDoc ? '01' : '00'}</Txt>
            <Txt variant="label" color={Colors.textTertiary}>DOCUMENTOS VENCIDOS</Txt>
          </View>
          <View style={styles.countDivider} />
          <View>
            <Txt variant="bigNumber" color={pendingMaintenance > 0 ? Colors.statusWarn : Colors.statusOk}>{String(pendingMaintenance).padStart(2, '0')}</Txt>
            <Txt variant="label" color={Colors.textTertiary}>SERVICIOS PRÓXIMOS</Txt>
          </View>
        </View>
      </View>

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
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  plateChip: { height: 44, width: 82, borderRadius: 10, backgroundColor: Colors.paper, overflow: 'hidden', justifyContent: 'center' },
  plateStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, backgroundColor: Colors.accent },
  plateText: { textAlign: 'center', letterSpacing: 1.4 },
  identityText: { flex: 1, gap: 3 },
  iconButton: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft },
  notificationDot: { position: 'absolute', top: 14, right: 14, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.statusExpired },
  hero: { gap: 12, paddingTop: Spacing.lg },
  heroRule: { height: 1, backgroundColor: Colors.border, marginTop: Spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  countDivider: { width: 1, height: 54, backgroundColor: Colors.border },
  urgent: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  stateBar: { width: 4 },
  urgentBody: { flex: 1, padding: Spacing.lg, gap: 7 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  flex: { flex: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  documentCard: { paddingHorizontal: Spacing.lg },
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 78, paddingVertical: 10 },
  documentBody: { flex: 1, gap: 5 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  loadingCard: { padding: Spacing.lg, gap: 14 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tool: { width: '47%', minHeight: 150, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft, padding: Spacing.lg, gap: 9 },
  toolIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  toolArrow: { position: 'absolute', right: 16, top: 17 },
  pressed: { opacity: 0.84 },
});
