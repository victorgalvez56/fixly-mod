import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { dueLabel, formatPEN } from '@/lib/format';
import { Colors, Spacing, StatusMeta } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { StatusChip } from '@/ui/StatusChip';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

type DocumentItem = { id: string; title: string; subtitle: string; status: 'ok' | 'warn' | 'expired'; dueDate: string; fineAmount?: number; icon: keyof typeof Feather.glyphMap };
const DOCUMENTS: DocumentItem[] = [
  { id: 'soat', title: 'SOAT', subtitle: 'Seguro obligatorio', status: 'expired', dueDate: '2026-08-20', fineAmount: 660, icon: 'shield' },
  { id: 'revision', title: 'Revisión técnica', subtitle: 'Certificado vigente', status: 'warn', dueDate: '2026-09-14', fineAmount: 2475, icon: 'check-circle' },
  { id: 'licencia', title: 'Licencia de conducir', subtitle: 'Licencia personal', status: 'ok', dueDate: '2029-03-02', icon: 'credit-card' },
  { id: 'lunas', title: 'Lunas polarizadas', subtitle: 'Certificado de autorización', status: 'ok', dueDate: '2028-11-12', icon: 'eye' },
  { id: 'propiedad', title: 'Tarjeta de propiedad', subtitle: 'Documento del vehículo', status: 'ok', dueDate: '2030-01-01', icon: 'file-text' },
];

export default function Documentos() {
  const [uploaded, setUploaded] = useState(false);
  const documents = uploaded ? DOCUMENTS.map((doc) => doc.id === 'soat' ? { ...doc, status: 'ok' as const, dueDate: '2027-08-20' } : doc) : DOCUMENTS;
  const expired = documents.filter((doc) => doc.status === 'expired').length;
  const next = documents.find((doc) => doc.status === 'warn');

  return (
    <Screen>
      <DetailHeader title="Registro de documentos" />

      <View style={styles.hero}>
        <Txt variant="label" color={Colors.accentLight}>DOCUMENTOS DEL AUTO</Txt>
        <Txt variant="screenTitle">{expired === 0 ? 'Todo en regla.' : 'Uno necesita atención.'}</Txt>
        <Txt variant="body" color={Colors.textSecondary}>{expired === 0 ? 'Tu carpeta está lista para salir.' : 'Revisa el vencido antes de volver a trabajar.'}</Txt>
        <View style={styles.summaryRow}>
          <Stat label="VIGENTES" value={String(documents.filter((doc) => doc.status === 'ok').length).padStart(2, '0')} color={Colors.statusOk} />
          <View style={styles.summaryDivider} />
          <Stat label="PRÓXIMO" value={next ? dueLabel(next.dueDate).replace('Vence en ', '') : '—'} color={Colors.statusWarn} />
        </View>
      </View>

      <View style={styles.sectionHead}><Txt variant="sectionTitle">Carpeta</Txt><Txt variant="label" color={Colors.textTertiary}>{documents.length} TIPOS</Txt></View>
      <Surface size="md" style={styles.list}>
        {documents.map((doc, index) => {
          const meta = StatusMeta[doc.status];
          return (
            <Pressable key={doc.id} onPress={() => setUploaded(true)} style={[styles.row, index < documents.length - 1 && styles.divider]} accessibilityRole="button" accessibilityLabel={doc.title + ', ' + meta.label + ', ' + dueLabel(doc.dueDate)}>
              <View style={[styles.stateBar, { backgroundColor: meta.color }]} />
              <View style={styles.iconBox}><Feather name={doc.icon} size={18} color={meta.color} /></View>
              <View style={styles.rowBody}>
                <View style={styles.titleLine}><Txt variant="cardTitle" style={styles.flex}>{doc.title}</Txt><StatusChip status={doc.status} /></View>
                <Txt variant="bodySmall" color={Colors.textTertiary}>{doc.subtitle}</Txt>
                <Txt variant="mono" color={Colors.textSecondary}>{dueLabel(doc.dueDate) + (doc.fineAmount ? ' · Multa de ' + formatPEN(doc.fineAmount) : '')}</Txt>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
            </Pressable>
          );
        })}
      </Surface>

      <Surface size="md" style={styles.uploadCard}>
        <View style={styles.uploadIcon}><Feather name="upload-cloud" size={22} color={Colors.accent} /></View>
        <View style={styles.uploadCopy}><Txt variant="cardTitle">Guarda tus PDFs</Txt><Txt variant="bodySmall" color={Colors.textSecondary}>Ten tus documentos a mano cuando los necesites.</Txt></View>
        <Button label={uploaded ? 'PDF agregado' : 'Subir PDF'} variant={uploaded ? 'secondary' : 'primary'} onPress={() => setUploaded(true)} />
      </Surface>

      <Button label="Subir manual del auto" variant="tertiary" onPress={() => router.push('/manual')} />
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return <View><Txt variant="bigNumber" color={color}>{value}</Txt><Txt variant="label" color={Colors.textTertiary}>{label}</Txt></View>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, paddingTop: Spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingTop: Spacing.sm },
  summaryDivider: { width: 1, height: 52, backgroundColor: Colors.border },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 94, paddingVertical: 12 },
  stateBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  iconBox: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 4 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  uploadCard: { padding: Spacing.lg, gap: 14 },
  uploadIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  uploadCopy: { gap: 4 },
});
