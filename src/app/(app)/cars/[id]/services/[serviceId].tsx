import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { Button, Muted, Screen, ScrollScreen, Section, colors } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { deleteService, usePhotos, useServices } from '@/lib/cars';
import { itemName } from '@/lib/maintenance';
import { formatEgp } from '@/lib/money';

export default function ServiceDetails() {
  const { t, i18n } = useTranslation();
  const { id, serviceId } = useLocalSearchParams<{ id: string; serviceId: string }>();
  const { user, isAdmin } = useAuth();
  const services = useServices(id);
  const service = services.data.find((s) => s.id === serviceId);
  const photoIds = service
    ? [...service.items.flatMap((i) => i.photoIds ?? []), ...(service.odometerPhotoId ? [service.odometerPhotoId] : [])]
    : [];
  const photos = usePhotos(id, photoIds);

  if (services.loading) return <Screen><Muted>{t('common.loading')}</Muted></Screen>;
  if (!service) return <Screen><Muted>{t('common.error')}</Muted></Screen>;

  const canDelete = isAdmin || service.createdBy === user?.uid;

  return (
    <ScrollScreen>
      <Text style={styles.heading}>{new Date(service.date).toLocaleDateString(i18n.language)}</Text>
      <Muted>{t('car.km', { value: service.km.toLocaleString() })}</Muted>
      {!!service.workshop && <Muted>{service.workshop}</Muted>}
      {service.odometerPhotoId && photos[service.odometerPhotoId] && (
        <Image source={{ uri: photos[service.odometerPhotoId].dataUri }} style={styles.odometer} />
      )}

      <Section>{t('service.whatDone')}</Section>
      {service.items.map((done) => (
        <View key={done.itemId} style={styles.item}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={styles.itemName}>{itemName(done, t)}</Text>
            <Text style={styles.itemName}>{formatEgp(done.cost, i18n.language)}</Text>
          </View>
          {!!done.notes && <Muted>{done.notes}</Muted>}
          <View style={styles.thumbs}>
            {(done.photoIds ?? []).map((pid) =>
              photos[pid] ? <Image key={pid} source={{ uri: photos[pid].dataUri }} style={styles.photo} /> : null,
            )}
          </View>
        </View>
      ))}

      <Text style={styles.heading}>
        {t('service.total', { amount: formatEgp(service.totalCost, i18n.language) })}
      </Text>
      {!!service.notes && <Muted>{service.notes}</Muted>}

      {canDelete && (
        <Button
          title={t('service.delete')}
          variant="link"
          onPress={() =>
            Alert.alert(t('service.delete'), t('service.deleteConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('service.delete'),
                style: 'destructive',
                onPress: async () => {
                  await deleteService(id, service);
                  router.back();
                },
              },
            ])
          }
        />
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'left' },
  odometer: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10 },
  item: {
    padding: 12,
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'left' },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 140, height: 105, borderRadius: 8 },
});
