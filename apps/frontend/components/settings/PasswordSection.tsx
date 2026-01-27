'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { changePassword } from '@/lib/settings/api';

export function PasswordSection() {
  const t = useTranslations('Settings.password');
  const tCommon = useTranslations('Common');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {t('title')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-[var(--color-text)] mb-1">
            {t('currentPassword')}
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text)] mb-1">
            {t('newPassword')}
          </label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <p className="text-xs text-[var(--color-text)] opacity-70 mt-1">
            {t('passwordRequirements')}
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text)] mb-1">
            {t('confirmPassword')}
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            {t('updateSuccess')}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? tCommon('saving') : t('changePassword')}
        </Button>
      </form>
    </div>
  );
}
