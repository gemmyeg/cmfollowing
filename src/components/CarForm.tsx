import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PhotoField } from '@/components/maintenance';
import { Button, CheckRow, ErrorText, Field, Muted, ScrollScreen, Section } from '@/components/ui';
import { useUsers, type CarInput } from '@/lib/cars';
import { RECOMMENDED_ITEMS } from '@/lib/maintenance';
import type { Car } from '@/lib/types';

type Props = {
  initial?: Car;
  /** Only when creating: lets the admin pick which recommended items to follow. */
  showRecommended?: boolean;
  submitLabel: string;
  onSubmit: (input: CarInput, itemKeys: string[]) => Promise<void>;
  footer?: ReactNode;
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function CarForm({ initial, showRecommended, submitLabel, onSubmit, footer }: Props) {
  const { t } = useTranslation();
  const users = useUsers();
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [year, setYear] = useState(initial ? String(initial.year) : '');
  const [plate, setPlate] = useState(initial?.plate ?? '');
  const [color, setColor] = useState(initial?.color ?? '');
  const [km, setKm] = useState(initial ? String(initial.currentKm) : '');
  const [ownerName, setOwnerName] = useState(initial?.ownerName ?? '');
  const [ownerPhone, setOwnerPhone] = useState(initial?.ownerPhone ?? '');
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [assigned, setAssigned] = useState<string[]>(initial?.assignedUserIds ?? []);
  const [itemKeys, setItemKeys] = useState(RECOMMENDED_ITEMS.map((r) => r.key));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const yearNum = Number(year);
    const kmNum = Number(km);
    const thisYear = new Date().getFullYear();
    if (
      !make.trim() || !model.trim() || !plate.trim() || !ownerName.trim() ||
      !Number.isInteger(yearNum) || yearNum < 1950 || yearNum > thisYear + 1 ||
      !Number.isFinite(kmNum) || kmNum < 0 || km.trim() === ''
    ) {
      return setError('car.invalid');
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(
        {
          make: make.trim(),
          model: model.trim(),
          year: yearNum,
          plate: plate.trim(),
          color: color.trim(),
          currentKm: Math.round(kmNum),
          ownerName: ownerName.trim(),
          ownerPhone: ownerPhone.trim(),
          photo,
          assignedUserIds: assigned,
        },
        itemKeys,
      );
    } catch {
      setError('common.error');
      setBusy(false);
    }
  }

  return (
    <ScrollScreen>
      <PhotoField label={t('car.photo')} value={photo} onChange={setPhoto} />

      <Section>{t('car.details')}</Section>
      <Field label={t('car.make')} value={make} onChangeText={setMake} />
      <Field label={t('car.model')} value={model} onChangeText={setModel} />
      <Field label={t('car.year')} value={year} onChangeText={setYear} keyboardType="number-pad" />
      <Field label={t('car.plate')} value={plate} onChangeText={setPlate} />
      <Field label={t('car.color')} value={color} onChangeText={setColor} />
      <Field label={t('car.currentKm')} value={km} onChangeText={setKm} keyboardType="number-pad" />

      <Section>{t('car.owner')}</Section>
      <Field label={t('car.ownerName')} value={ownerName} onChangeText={setOwnerName} />
      <Field
        label={t('car.ownerPhone')}
        value={ownerPhone}
        onChangeText={setOwnerPhone}
        keyboardType="phone-pad"
      />

      <Section>{t('car.assignedTo')}</Section>
      {users.data.length === 0 && !users.loading && <Muted>{t('car.noUsers')}</Muted>}
      {users.data.map((u) => (
        <CheckRow
          key={u.uid}
          label={u.name || u.email}
          sub={u.email}
          checked={assigned.includes(u.uid)}
          onToggle={() => setAssigned((a) => toggle(a, u.uid))}
        />
      ))}

      {showRecommended && (
        <>
          <Section>{t('car.recommendedTitle')}</Section>
          <Muted>{t('car.recommendedHint')}</Muted>
          {RECOMMENDED_ITEMS.map((r) => (
            <CheckRow
              key={r.key}
              label={t(`items.${r.key}`)}
              sub={[
                r.intervalKm && t('item.intervalKm', { count: r.intervalKm.toLocaleString() }),
                r.intervalMonths && t('item.intervalMonths', { count: r.intervalMonths }),
              ]
                .filter(Boolean)
                .join(' / ')}
              checked={itemKeys.includes(r.key)}
              onToggle={() => setItemKeys((k) => toggle(k, r.key))}
            />
          ))}
        </>
      )}

      {error && <ErrorText>{t(error)}</ErrorText>}
      <Button title={submitLabel} onPress={submit} loading={busy} />
      {footer}
    </ScrollScreen>
  );
}
