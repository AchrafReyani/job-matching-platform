'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { deleteAccount } from '@/lib/settings/api';
import { clearToken } from '@/lib/api';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'JOB_SEEKER' | 'COMPANY';
}

export function DeleteAccountModal({ isOpen, onClose, role }: DeleteAccountModalProps) {
  const t = useTranslations('Settings.dangerZone');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = password.length > 0 && confirmation === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    setError(null);

    try {
      await deleteAccount({ password, confirmation });
      clearToken();
      router.push('/?deleted=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          {t('confirmDeleteTitle')}
        </h2>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">{t('warningTitle')}</p>
            <p>{t('warningMessage')}</p>
          </div>

          <div className="text-sm text-[var(--color-text)]">
            <p className="font-medium mb-2">{t('willBeDeleted')}</p>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text)] opacity-70">
              {role === 'JOB_SEEKER' ? (
                <>
                  <li>{t('deleteJobSeekerProfile')}</li>
                  <li>{t('deleteApplications')}</li>
                  <li>{t('deleteMessages')}</li>
                </>
              ) : (
                <>
                  <li>{t('deleteCompanyProfile')}</li>
                  <li>{t('deleteVacancies')}</li>
                  <li>{t('deleteCompanyApplications')}</li>
                  <li>{t('deleteMessages')}</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text)] mb-1">
              {t('enterPassword')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text)] mb-1">
              {t('typeDelete')}
            </label>
            <Input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || loading}
            className="flex-1"
          >
            {loading ? t('deleting') : t('confirmDelete')}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tCommon('cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
