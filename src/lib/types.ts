/**
 * Firestore data model.
 *
 * users/{uid}                      UserProfile
 * cars/{carId}                     Car (visible to admins and to the uids in assignedUserIds)
 * cars/{carId}/items/{itemId}      MaintenanceItem (what to service and how often)
 * cars/{carId}/services/{id}       ServiceRecord (one visit, with the items done and their cost)
 * cars/{carId}/photos/{id}         Photo (optional photos attached to items done)
 */

/** Admins see and manage every car; users only see cars assigned to them. */
export type Role = 'admin' | 'user';

export type UserProfile = {
  uid: string;
  role: Role;
  name: string;
  email: string;
  language: 'ar' | 'en';
  createdAt: number;
};

export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  /** Small JPEG data URI used as the car's profile picture. */
  photo?: string | null;
  ownerName: string;
  ownerPhone?: string;
  /** Latest odometer reading in km. */
  currentKm: number;
  currentKmAt: number;
  /** uids of the users this car is assigned to. */
  assignedUserIds: string[];
  createdBy: string;
  createdAt: number;
};

export type MaintenanceItem = {
  id: string;
  /** Key of a built-in item (e.g. "engineOil"), or null for a custom one. */
  key: string | null;
  name: string;
  /** Service again after this many km (null = not km based). */
  intervalKm: number | null;
  /** Service again after this many months (null = not time based). */
  intervalMonths: number | null;
  lastDoneKm: number | null;
  lastDoneAt: number | null;
};

/** Money is stored in whole piasters to avoid floating point errors. */
export type Currency = 'EGP';

export type ServiceItemDone = {
  itemId: string;
  name: string;
  /** Cost in piasters (1 EGP = 100). */
  cost: number;
  notes?: string;
  photoIds?: string[];
};

export type ServiceRecord = {
  id: string;
  km: number;
  date: number;
  currency: Currency;
  items: ServiceItemDone[];
  /** Sum of items[].cost, in piasters. */
  totalCost: number;
  workshop?: string;
  notes?: string;
  odometerPhotoUrl?: string;
  createdBy: string;
};

export type Photo = {
  id: string;
  /** JPEG data URI. */
  dataUri: string;
  createdBy: string;
  createdAt: number;
};
