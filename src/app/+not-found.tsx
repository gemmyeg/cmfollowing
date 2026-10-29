import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

// "/" only exists for signed-in users, so a signed-out start (or a link Expo Go opens with an
// extra path) lands here. Send it to the right first screen instead of "Unmatched Route".
export default function NotFound() {
  const { user } = useAuth();
  return <Redirect href={user ? '/' : '/sign-in'} />;
}
