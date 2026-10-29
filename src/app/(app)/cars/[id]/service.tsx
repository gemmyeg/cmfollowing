import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/maintenance';
import { Button, CheckRow, ErrorText, Field, Muted, Screen, ScrollScreen, Section, colors, fonts } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { logService, useCar, useItems } from '@/lib/cars';
import { dueInfo, itemName, sortByUrgency } from '@/lib/maintenance';
import { formatEgp, parseEgp } from '@/lib/money';
import { canReadOdometer, readOdometer } from '@/lib/odometer';
import { pickPhoto } from '@/lib/photos';
import type { MaintenanceItem } from '@/lib/types';

type Entry = { checked: boolean; cost: string; notes: string; photos: string[] };

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Log a service: photograph the odometer (the km is read from the photo when possible),
 * tick what was done with the cost in EGP, notes and photos. With mode=km it only
 * updates the mileage.
 */
export default function LogService() {
  const { t, i18n } = useTranslation();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const kmOnly = mode === 'km';
  const { user } = useAuth();
  const car = useCar(id);
  const items = useItems(id);

  const [km, setKm] = useState('');
  const [odometerPhoto, setOdometerPhoto] = useState<string | null>(null);
  const [readMessage, setReadMessage] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [workshop, setWorkshop] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const c = car.data;
  const parsedKm = Number(km);
  const rows = c
    ? sortByUrgency(
        items.data.map((item) => ({
          item,
          // Judge "due" against the new reading once it is entered.
          due: dueInfo(item, km && parsedKm > 0 ? { ...c, currentKm: parsedKm } : c),
        })),
      )
    : [];

  // Tick due items once they have loaded; the user can untick them.
  const dueKey = rows.filter((r) => r.due.status !== 'ok').map((r) => r.item.id).join(',');
  useEffect(() => {
    setEntries((prev) => {
      const next = { ...prev };
      for (const { item, due } of rows) {
        if (!next[item.id]) {
          next[item.id] = { checked: due.status === 'overdue' || due.status === 'soon', cost: '', notes: '', photos: [] };
        }
      }
      return next;
    });
  }, [items.data.length, dueKey]);

  if (car.loading) return <Screen><Muted>{t('common.loading')}</Muted></Screen>;
  if (!c) return <Screen><Muted>{t('car.notFound')}</Muted></Screen>;

  const update = (itemId: string, change: Partial<Entry>) =>
    setEntries((e) => ({ ...e, [itemId]: { ...e[itemId], ...change } }));

  const selected = rows.filter((r) => entries[r.item.id]?.checked);
  const total = selected.reduce((sum, r) => sum + (parseEgp(entries[r.item.id].cost) ?? 0), 0);

  async function photographOdometer() {
    const photo = await pickPhoto('camera', 1024);
    if (!photo || !c) return;
    setOdometerPhoto(photo.dataUri);
    if (!canReadOdometer) return setReadMessage(t('service.readUnavailable'));
    setReading(true);
    const value = await readOdometer(photo.uri, c);
    setReading(false);
    if (value != null) {
      setKm(String(value));
      setReadMessage(t('service.readOk', { km: value.toLocaleString() }));
    } else {
      setReadMessage(t('service.readFailed'));
    }
  }

  async function save(confirmedLowKm = false) {
    if (!c || !user) return;
    if (!Number.isFinite(parsedKm) || parsedKm <= 0 || km.trim() === '') return setError(t('service.invalidKm'));
    const when = Date.parse(date);
    if (Number.isNaN(when) || when > Date.now() + 24 * 60 * 60 * 1000) return setError(t('service.invalidDate'));

    const chosen = kmOnly ? [] : selected;
    const withCosts: { item: MaintenanceItem; cost: number; notes: string; photos: string[] }[] = [];
    for (const { item } of chosen) {
      const entry = entries[item.id];
      const cost = parseEgp(entry.cost);
      if (cost === undefined) return setError(t('service.invalidCost', { item: itemName(item, t) }));
      withCosts.push({ item, cost, notes: entry.notes, photos: entry.photos });
    }

    if (parsedKm < c.currentKm && !confirmedLowKm) {
      return Alert.alert(t('service.odometer'), t('service.lowerKm', { km: c.currentKm.toLocaleString() }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('service.save'), onPress: () => save(true) },
      ]);
    }

    setBusy(true);
    setError(null);
    try {
      await logService(
        c,
        { km: Math.round(parsedKm), date: when, items: withCosts, workshop, notes, odometerPhoto },
        user.uid,
      );
      router.back();
    } catch {
      setError(t('common.error'));
      setBusy(false);
    }
  }

  return (
    <ScrollScreen>
      <Stack.Screen options={{ title: t(kmOnly ? 'service.updateKm' : 'service.log') }} />

      <Section>{t('service.odometer')}</Section>
      {odometerPhoto && <Image source={{ uri: odometerPhoto }} style={styles.odometer} />}
      <Button title={t('service.photoOdometer')} variant="secondary" onPress={photographOdometer} />
      {reading && <ActivityIndicator />}
      {readMessage && <Muted>{readMessage}</Muted>}
      <Field
        label={t('service.km')}
        value={km}
        onChangeText={setKm}
        keyboardType="number-pad"
        placeholder={c.currentKm.toLocaleString()}
      />
      <Field label={t('service.date')} value={date} onChangeText={setDate} />

      {!kmOnly && (
        <>
          <Section>{t('service.whatDone')}</Section>
          <Muted>{t('service.whatDoneHint')}</Muted>
          {rows.map(({ item, due }) => {
            const entry = entries[item.id];
            if (!entry) return null;
            return (
              <View key={item.id} style={[styles.item, entry.checked && styles.itemOn]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <CheckRow
                      label={itemName(item, t)}
                      checked={entry.checked}
                      onToggle={() => update(item.id, { checked: !entry.checked })}
                    />
                  </View>
                  <StatusBadge status={due.status} />
                </View>
                {entry.checked && (
                  <View style={{ gap: 8 }}>
                    <Field
                      label={t('service.cost')}
                      value={entry.cost}
                      onChangeText={(cost) => update(item.id, { cost })}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <Field
                      label={t('service.notes')}
                      value={entry.notes}
                      onChangeText={(notes) => update(item.id, { notes })}
                      multiline
                    />
                    <View style={styles.thumbs}>
                      {entry.photos.map((uri, i) => (
                        <Pressable
                          key={i}
                          onLongPress={() =>
                            update(item.id, { photos: entry.photos.filter((_, j) => j !== i) })
                          }
                        >
                          <Image source={{ uri }} style={styles.thumb} />
                        </Pressable>
                      ))}
                    </View>
                    <Button
                      title={t('service.addPhoto')}
                      variant="link"
                      onPress={() => {
                        const add = async (source: 'camera' | 'library') => {
                          const photo = await pickPhoto(source);
                          if (photo) update(item.id, { photos: [...entry.photos, photo.dataUri] });
                        };
                        Alert.alert(t('service.addPhoto'), undefined, [
                          { text: t('car.takePhoto'), onPress: () => add('camera') },
                          { text: t('car.choosePhoto'), onPress: () => add('library') },
                          { text: t('common.cancel'), style: 'cancel' },
                        ]);
                      }}
                    />
                  </View>
                )}
              </View>
            );
          })}

          <Field label={t('service.workshop')} value={workshop} onChangeText={setWorkshop} />
          <Field label={t('service.generalNotes')} value={notes} onChangeText={setNotes} multiline />
          <Text style={styles.total}>{t('service.total', { amount: formatEgp(total, i18n.language) })}</Text>
        </>
      )}

      {error && <ErrorText>{error}</ErrorText>}
      <Button
        title={t(kmOnly ? 'service.saveKmOnly' : 'service.save')}
        onPress={() => save()}
        loading={busy}
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  odometer: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10 },
  item: {
    padding: 10,
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  itemOn: { borderColor: colors.primary },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  total: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, textAlign: 'left' },
});
