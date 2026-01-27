'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { deleteMatch } from '@/lib/applications/api';

interface DeleteMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  otherPartyName: string;
  vacancyTitle: string;
  basePath: string;
}

export function DeleteMatchModal({
  isOpen,
  onClose,
  applicationId,
  otherPartyName,
  vacancyTitle,
  basePath,
}: DeleteMatchModalProps) {
  const t = useTranslations('Messages.deleteMatch');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteMatch(applicationId);
      router.push(`${basePath}/messages`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          {t('title')}
        </h2>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <p className="font-semibold mb-2">{t('warningTitle')}</p>
            <p>{t('warningMessage', { name: otherPartyName, vacancy: vacancyTitle })}</p>
          </div>

          <div className="text-sm text-[var(--color-text)]">
            <p className="font-medium mb-2">{t('willBeDeleted')}</p>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text)] opacity-70">
              <li>{t('deleteMessages')}</li>
              <li>{t('deleteConnection')}</li>
            </ul>
          </div>

          <div className="text-sm text-[var(--color-muted)]">
            <p>{t('reapplyNote')}</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1"
          >
            {loading ? t('deleting') : t('confirm')}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tCommon('cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
