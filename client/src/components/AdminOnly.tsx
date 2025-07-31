import React from 'react';
// import { useUser } from '../lib/useUser';
import { isAdmin } from '../lib/admin';

export default function AdminOnly({ user, children }: { user: { uid: string } | null, children: React.ReactNode }) {
  // const { user } = useUser();

  if (!user || !isAdmin(user.uid)) return null;

  return <>{children}</>;
} 