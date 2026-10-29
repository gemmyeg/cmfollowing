import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CarForm } from '@/components/CarForm';
import { useAuth } from '@/lib/auth';
import { createCar } from '@/lib/cars';

export default function NewCar() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <CarForm
      showRecommended
      submitLabel={t('common.save')}
      onSubmit={async (input, itemKeys) => {
        const id = await createCar(input, user!.uid, itemKeys);
        router.replace({ pathname: '/cars/[id]', params: { id } });
      }}
    />
  );
}
