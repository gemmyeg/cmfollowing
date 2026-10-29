import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { CarForm } from '@/components/CarForm';
import { Button, Muted, Screen } from '@/components/ui';
import { deleteCar, updateCar, useCar } from '@/lib/cars';

export default function EditCar() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const car = useCar(id);

  if (car.loading) return <Screen><Muted>{t('common.loading')}</Muted></Screen>;
  if (!car.data) return <Screen><Muted>{t('car.notFound')}</Muted></Screen>;

  return (
    <CarForm
      initial={car.data}
      submitLabel={t('common.save')}
      onSubmit={async (input) => {
        await updateCar(id, input);
        router.back();
      }}
      footer={
        <Button
          title={t('car.delete')}
          variant="link"
          onPress={() =>
            Alert.alert(t('car.delete'), t('car.deleteConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('car.delete'),
                style: 'destructive',
                onPress: async () => {
                  await deleteCar(id);
                  router.dismissTo('/');
                },
              },
            ])
          }
        />
      }
    />
  );
}
