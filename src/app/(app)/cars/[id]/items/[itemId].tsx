import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ErrorText, Field, Muted, ScrollScreen } from '@/components/ui';
import { addItem, deleteItem, updateItem, useCar, useItems } from '@/lib/cars';
import { itemName } from '@/lib/maintenance';

const toDateInput = (ts: number | null) => (ts ? new Date(ts).toISOString().slice(0, 10) : '');

/** Parses an optional positive number field; undefined means invalid. */
function optionalNumber(text: string): number | null | undefined {
  if (text.trim() === '') return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export default function EditItem() {
  const { t } = useTranslation();
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const isNew = itemId === 'new';
  const car = useCar(id);
  const items = useItems(id);
  const item = items.data.find((i) => i.id === itemId);

  const [name, setName] = useState('');
  const [everyKm, setEveryKm] = useState('');
  const [everyMonths, setEveryMonths] = useState('');
  const [lastKm, setLastKm] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fill the form once the item (or, for a new item, the car's km) has loaded.
  useEffect(() => {
    if (loaded) return;
    if (isNew && car.data) {
      setLastKm(String(car.data.currentKm));
      setLastDate(toDateInput(Date.now()));
      setLoaded(true);
    } else if (item) {
      setName(itemName(item, t));
      setEveryKm(item.intervalKm != null ? String(item.intervalKm) : '');
      setEveryMonths(item.intervalMonths != null ? String(item.intervalMonths) : '');
      setLastKm(item.lastDoneKm != null ? String(item.lastDoneKm) : '');
      setLastDate(toDateInput(item.lastDoneAt));
      setLoaded(true);
    }
  }, [isNew, car.data, item, loaded]);

  if (!loaded) return <ScrollScreen><Muted>{t('common.loading')}</Muted></ScrollScreen>;

  async function save() {
    const intervalKm = optionalNumber(everyKm);
    const intervalMonths = optionalNumber(everyMonths);
    const lastDoneKm = optionalNumber(lastKm);
    const lastDoneAt = lastDate.trim() ? Date.parse(lastDate.trim()) : null;
    if (
      !name.trim() || intervalKm === undefined || intervalMonths === undefined ||
      lastDoneKm === undefined || (lastDoneAt !== null && Number.isNaN(lastDoneAt)) ||
      (!intervalKm && !intervalMonths)
    ) {
      return setError('item.invalid');
    }
    setBusy(true);
    try {
      // Renaming a built-in item turns it into a custom one.
      const renamed = !item?.key || name.trim() !== itemName(item, t);
      const fields = {
        key: renamed ? null : item!.key,
        name: name.trim(),
        intervalKm,
        intervalMonths,
        lastDoneKm,
        lastDoneAt,
      };
      if (isNew) await addItem(id, fields);
      else await updateItem(id, itemId, fields);
      router.back();
    } catch {
      setError('common.error');
      setBusy(false);
    }
  }

  return (
    <ScrollScreen>
      <Stack.Screen options={{ title: t(isNew ? 'item.new' : 'item.edit') }} />
      <Field label={t('item.name')} value={name} onChangeText={setName} />
      <Field label={t('item.everyKm')} value={everyKm} onChangeText={setEveryKm} keyboardType="number-pad" />
      <Field
        label={t('item.everyMonths')}
        value={everyMonths}
        onChangeText={setEveryMonths}
        keyboardType="number-pad"
      />
      <Muted>{t('item.intervalHint')}</Muted>
      <Field label={t('item.lastDoneKm')} value={lastKm} onChangeText={setLastKm} keyboardType="number-pad" />
      <Field label={t('item.lastDoneDate')} value={lastDate} onChangeText={setLastDate} />
      {error && <ErrorText>{t(error)}</ErrorText>}
      <Button title={t('common.save')} onPress={save} loading={busy} />
      {!isNew && (
        <Button
          title={t('item.delete')}
          variant="link"
          onPress={async () => {
            await deleteItem(id, itemId);
            router.back();
          }}
        />
      )}
    </ScrollScreen>
  );
}
