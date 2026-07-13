import React from 'react';
import { NotificationsClient } from '@/components/notifications/NotificationsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | CliqHire',
  description: 'View all your notifications',
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/20">
      <NotificationsClient />
    </div>
  );
}
