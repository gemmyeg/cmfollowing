import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { RECOMMENDED_ITEMS } from '@/lib/maintenance';
import type {
  Car,
  MaintenanceItem,
  Photo,
  ServiceItemDone,
  ServiceRecord,
  UserProfile,
} from '@/lib/types';

function requireDb() {
  if (!db) throw new Error('firebase-not-configured');
  return db;
}

type Live<T> = { data: T; loading: boolean; error: Error | null };

/** Subscribes to a Firestore query and keeps the rows in state. */
function useLiveQuery<T>(makeQuery: () => Query<DocumentData> | null, deps: unknown[]): Live<T[]> {
  const [state, setState] = useState<Live<T[]>>({ data: [], loading: true, error: null });
  useEffect(() => {
    const q = makeQuery();
    if (!q) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    return onSnapshot(
      q,
      (snap) =>
        setState({
          data: snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })),
          loading: false,
          error: null,
        }),
      (error) => setState({ data: [], loading: false, error }),
    );
  }, deps);
  return state;
}

/** Admins get every car; users only the cars assigned to them. */
export function useCars(): Live<Car[]> {
  const { user, isAdmin } = useAuth();
  return useLiveQuery<Car>(() => {
    if (!db || !user) return null;
    const cars = collection(db, 'cars');
    return isAdmin
      ? query(cars, orderBy('createdAt', 'desc'))
      : query(cars, where('assignedUserIds', 'array-contains', user.uid));
  }, [user?.uid, isAdmin]);
}

export function useCar(carId: string): Live<Car | null> {
  const [state, setState] = useState<Live<Car | null>>({ data: null, loading: true, error: null });
  useEffect(() => {
    if (!db) return setState({ data: null, loading: false, error: null });
    return onSnapshot(
      doc(db, 'cars', carId),
      (snap) =>
        setState({
          data: snap.exists() ? { ...(snap.data() as Car), id: snap.id } : null,
          loading: false,
          error: null,
        }),
      (error) => setState({ data: null, loading: false, error }),
    );
  }, [carId]);
  return state;
}

export function useItems(carId: string): Live<MaintenanceItem[]> {
  return useLiveQuery<MaintenanceItem>(
    () => (db ? collection(db, 'cars', carId, 'items') : null),
    [carId],
  );
}

/** Every user, for the admin to assign cars. */
export function useUsers(): Live<UserProfile[]> {
  const { isAdmin } = useAuth();
  return useLiveQuery<UserProfile>(
    () => (db && isAdmin ? query(collection(db, 'users'), orderBy('name')) : null),
    [isAdmin],
  );
}

export type CarInput = Omit<Car, 'id' | 'createdBy' | 'createdAt' | 'currentKmAt'>;

/** Creates a car with the recommended maintenance items (the chosen keys only). */
export async function createCar(input: CarInput, createdBy: string, itemKeys: string[]) {
  const db = requireDb();
  const now = Date.now();
  const carRef = doc(collection(db, 'cars'));
  const batch = writeBatch(db);
  batch.set(carRef, {
    ...input,
    currentKmAt: now,
    initialKm: input.currentKm,
    initialKmAt: now,
    createdBy,
    createdAt: now,
  });
  for (const rec of RECOMMENDED_ITEMS.filter((r) => itemKeys.includes(r.key))) {
    const item: Omit<MaintenanceItem, 'id'> = {
      key: rec.key,
      name: rec.key,
      intervalKm: rec.intervalKm,
      intervalMonths: rec.intervalMonths,
      // Until the first service is logged, count from the day the car was added.
      lastDoneKm: input.currentKm,
      lastDoneAt: now,
    };
    batch.set(doc(collection(carRef, 'items')), item);
  }
  await batch.commit();
  return carRef.id;
}

export async function updateCar(carId: string, changes: Partial<CarInput>) {
  const update: Partial<Car> = { ...changes };
  if (changes.currentKm != null) update.currentKmAt = Date.now();
  await updateDoc(doc(requireDb(), 'cars', carId), update);
}

export async function deleteCar(carId: string) {
  await deleteDoc(doc(requireDb(), 'cars', carId));
}

export async function addItem(carId: string, item: Omit<MaintenanceItem, 'id'>) {
  await addDoc(collection(requireDb(), 'cars', carId, 'items'), item);
}

export async function updateItem(carId: string, itemId: string, changes: Partial<MaintenanceItem>) {
  await updateDoc(doc(requireDb(), 'cars', carId, 'items', itemId), changes);
}

export async function deleteItem(carId: string, itemId: string) {
  await deleteDoc(doc(requireDb(), 'cars', carId, 'items', itemId));
}

/** Items of several cars at once, keyed by car id (one listener per car; fine for a family fleet). */
export function useItemsForCars(carIds: string[]): Record<string, MaintenanceItem[]> {
  const [byCar, setByCar] = useState<Record<string, MaintenanceItem[]>>({});
  const key = carIds.join(',');
  useEffect(() => {
    if (!db) return;
    const firestore = db;
    setByCar({});
    const unsubs = carIds.map((carId) =>
      onSnapshot(collection(firestore, 'cars', carId, 'items'), (snap) =>
        setByCar((prev) => ({
          ...prev,
          [carId]: snap.docs.map((d) => ({ ...(d.data() as MaintenanceItem), id: d.id })),
        })),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [key]);
  return byCar;
}

export function useServices(carId: string): Live<ServiceRecord[]> {
  return useLiveQuery<ServiceRecord>(
    () => (db ? query(collection(db, 'cars', carId, 'services'), orderBy('date', 'desc')) : null),
    [carId],
  );
}

export function usePhotos(carId: string, photoIds: string[]): Record<string, Photo> {
  const [photos, setPhotos] = useState<Record<string, Photo>>({});
  const key = photoIds.join(',');
  useEffect(() => {
    if (!db || photoIds.length === 0) return;
    const firestore = db;
    const unsubs = photoIds.map((id) =>
      onSnapshot(doc(firestore, 'cars', carId, 'photos', id), (snap) => {
        if (snap.exists()) setPhotos((p) => ({ ...p, [id]: { ...(snap.data() as Photo), id } }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [carId, key]);
  return photos;
}

/** Services of several cars, for the dashboard's spending totals. */
export function useServicesForCars(carIds: string[]): Record<string, ServiceRecord[]> {
  const [byCar, setByCar] = useState<Record<string, ServiceRecord[]>>({});
  const key = carIds.join(',');
  useEffect(() => {
    if (!db) return;
    const firestore = db;
    setByCar({});
    const unsubs = carIds.map((carId) =>
      onSnapshot(collection(firestore, 'cars', carId, 'services'), (snap) =>
        setByCar((prev) => ({
          ...prev,
          [carId]: snap.docs.map((d) => ({ ...(d.data() as ServiceRecord), id: d.id })),
        })),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [key]);
  return byCar;
}

export type ServiceItemInput = {
  item: MaintenanceItem;
  cost: number;
  notes: string;
  /** Data URIs of photos to attach. */
  photos: string[];
};

export type ServiceInput = {
  km: number;
  date: number;
  items: ServiceItemInput[];
  workshop: string;
  notes: string;
  odometerPhoto: string | null;
};

/**
 * Logs a service in one batch: the record, its photos, each item's new "last done",
 * and the car's mileage. With no items it just updates the mileage.
 */
export async function logService(car: Car, input: ServiceInput, uid: string) {
  const db = requireDb();
  const carRef = doc(db, 'cars', car.id);
  const batch = writeBatch(db);
  const now = Date.now();

  const addPhoto = (dataUri: string) => {
    const ref = doc(collection(carRef, 'photos'));
    const photo: Omit<Photo, 'id'> = { dataUri, createdBy: uid, createdAt: now };
    batch.set(ref, photo);
    return ref.id;
  };

  if (input.items.length > 0) {
    const items: ServiceItemDone[] = input.items.map(({ item, cost, notes, photos }) => ({
      itemId: item.id,
      key: item.key,
      name: item.name,
      cost,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(photos.length ? { photoIds: photos.map(addPhoto) } : {}),
    }));
    const record: Omit<ServiceRecord, 'id'> = {
      km: input.km,
      date: input.date,
      currency: 'EGP',
      items,
      totalCost: items.reduce((sum, i) => sum + i.cost, 0),
      createdBy: uid,
      ...(input.workshop.trim() ? { workshop: input.workshop.trim() } : {}),
      ...(input.notes.trim() ? { notes: input.notes.trim() } : {}),
      ...(input.odometerPhoto ? { odometerPhotoId: addPhoto(input.odometerPhoto) } : {}),
    };
    batch.set(doc(collection(carRef, 'services')), record);

    for (const { item } of input.items) {
      batch.update(doc(carRef, 'items', item.id), { lastDoneKm: input.km, lastDoneAt: input.date });
    }
  }

  // Only move the odometer forward; an old service logged late must not lower it.
  if (input.km > car.currentKm) {
    batch.update(carRef, { currentKm: input.km, currentKmAt: now });
  }
  await batch.commit();
}

export async function deleteService(carId: string, service: ServiceRecord) {
  const db = requireDb();
  const carRef = doc(db, 'cars', carId);
  const batch = writeBatch(db);
  const photoIds = [
    ...service.items.flatMap((i) => i.photoIds ?? []),
    ...(service.odometerPhotoId ? [service.odometerPhotoId] : []),
  ];
  for (const id of photoIds) batch.delete(doc(carRef, 'photos', id));
  batch.delete(doc(carRef, 'services', service.id));
  await batch.commit();
}
