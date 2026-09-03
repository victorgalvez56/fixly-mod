import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function Manual() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <Screen>
      <DetailHeader title="Manual del auto" />
      <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>DATOS DE MANTENIMIENTO</Txt><Txt variant="screenTitle">El manual sabe qué toca.</Txt><Txt variant="body" color={Colors.textSecondary}>Sube el PDF o fotografía las páginas de mantenimiento. Fixly solo usará los intervalos; tú decides en el taller.</Txt></View>
      {uploaded ? (
        <Surface size="lg" style={styles.done}>
          <View style={styles.doneIcon}><Feather name="check" size={24} color={Colors.onAccent} /></View>
          <Txt variant="sectionTitle">Manual recibido.</Txt>
          <Txt variant="body" color={Colors.textSecondary}>Lo usaremos para ordenar el plan de tu Toyota Yaris 2015. No mostramos intervalos que no estén en el manual.</Txt>
          <Button label="Ver plan de mantenimiento" variant="primary" onPress={() => router.push('/plan')} />
        </Surface>
      ) : (
        <>
          <EmptyState icon="book-open" title="Sube el manual de tu auto" description="Aceptamos PDF. Si no lo tienes, fotografía las páginas donde aparecen aceite, filtros, frenos y refrigerante." />
          <Button label="Elegir PDF" variant="primary" icon={<Feather name="upload" size={18} color={Colors.onAccent} />} onPress={() => setUploaded(true)} />
          <Button label="Fotografiar páginas" variant="secondary" icon={<Feather name="camera" size={18} color={Colors.textPrimary} />} onPress={() => setUploaded(true)} />
        </>
      )}
      <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.note}>Tu archivo queda asociado a esta ficha en este dispositivo.</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 14, paddingTop: Spacing.lg },
  done: { alignItems: 'flex-start', gap: 14, padding: Spacing.xxl, backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  doneIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  note: { textAlign: 'center' },
});
