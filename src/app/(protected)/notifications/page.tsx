import React from 'react';
import { NotificationsClient } from '@/components/notifications/NotificationsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | CliqHire',
  description: 'View all your notifications',
};

export default function NotificationsPage() {
  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden bg-background">
      <NotificationsClient />
    </div>
  );
}
