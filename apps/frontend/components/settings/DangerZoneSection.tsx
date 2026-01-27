'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { DeleteAccountModal } from './DeleteAccountModal';

interface DangerZoneSectionProps {
  role: 'JOB_SEEKER' | 'COMPANY' | 'ADMIN';
}

export function DangerZoneSection({ role }: DangerZoneSectionProps) {
  const t = useTranslations('Settings.dangerZone');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Admin cannot delete their own account
  if (role === 'ADMIN') {
    return null;
  }

  return (
    <>
      <div className="bg-[var(--color-bg)] border-2 border-red-300 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          {t('title')}
        </h2>
        <p className="text-sm text-[var(--color-text)] opacity-70 mb-4">
          {t('description')}
        </p>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteModal(true)}
        >
          {t('deleteAccount')}
        </Button>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        role={role}
      />
    </>
  );
}
