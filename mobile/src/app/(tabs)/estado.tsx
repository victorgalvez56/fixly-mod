import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { dueLabel, formatPEN } from '@/lib/format';
import { documentStatuses } from '@/mock/data';
import { useMockQuery } from '@/mock/use-mock-query';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, StatusMeta } from '@/theme/tokens';
import { AlertBanner } from '@/ui/AlertBanner';
import { CarHealthCard } from '@/ui/CarHealthCard';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { StatusChip } from '@/ui/StatusChip';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const DOC_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  soat: 'file-text',
  'revision-tecnica': 'check-circle',
  licencia: 'credit-card',
};

export default function Estado() {
  const { vehicle } = useVehicle();
  const { data: statuses, loading } = useMockQuery(() => documentStatuses);

  const worstDoc = statuses?.find((s) => s.status === 'expired');
  const rest = statuses?.filter((s) => s.id !== worstDoc?.id) ?? [];

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.identity} onPress={() => router.push('/vehiculo')}>
          <View style={styles.plateChip}>
            <View style={styles.plateStripe} />
            <Txt style={styles.plateText}>{vehicle?.plate}</Txt>
          </View>
          <View style={styles.identityText}>
            <Txt variant="cardTitle" numberOfLines={1}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : ''}
            </Txt>
            <Txt variant="mono" color={Colors.textTertiary}>
              {vehicle ? `${vehicle.year} · ${vehicle.color}` : ''}
            </Txt>
          </View>
        </Pressable>

        <Pressable onPress={() => router.push('/avisos')} hitSlop={10} style={styles.bellButton} accessibilityLabel="Avisos">
          <Feather name="bell" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <CarHealthCard />

      {loading ? (
        <Surface size="md" style={styles.summary}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="45%" height={16} />
        </Surface>
      ) : (
        <>
          {worstDoc ? (
            <AlertBanner
              title={`${worstDoc.title} vencido`}
              description={`${dueLabel(worstDoc.dueDate)}${worstDoc.fineAmount ? ` · Multa de ${formatPEN(worstDoc.fineAmount)}` : ''}`}
              actionLabel="Renovar"
              onAction={() => {}}
            />
          ) : (
            <Surface size="md" style={styles.summary}>
              <Txt variant="sectionTitle" color={Colors.statusOk}>
                Puedes salir hoy.
              </Txt>
              <Txt variant="body" color={Colors.textSecondary}>
                Todos tus documentos están en regla.
              </Txt>
            </Surface>
          )}

          <Surface size="md" style={styles.listCard}>
            {rest.map((doc, index) => (
              <IconRow
                key={doc.id}
                icon={DOC_ICON[doc.id] ?? 'file'}
                title={doc.title}
                subtitle={`${StatusMeta[doc.status].label} · ${dueLabel(doc.dueDate)}`}
                trailing={<StatusChip status={doc.status} />}
                chevron={false}
                last={index === rest.length - 1}
              />
            ))}
          </Surface>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  plateChip: {
    height: 40,
    width: 76,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  plateStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: Colors.accent },
  plateText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  identityText: { flex: 1, gap: 2 },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  summary: { padding: 20, gap: 6 },
  listCard: { paddingHorizontal: 16 },
});
