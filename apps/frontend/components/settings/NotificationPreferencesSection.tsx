'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/settings/api';
import type { NotificationPreferences } from '@/lib/settings/types';

interface NotificationPreferencesSectionProps {
  role: 'JOB_SEEKER' | 'COMPANY' | 'ADMIN';
}

export function NotificationPreferencesSection({ role }: NotificationPreferencesSectionProps) {
  const t = useTranslations('Settings.notifications');
  const tCommon = useTranslations('Common');

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await getNotificationPreferences();
        setPreferences(prefs);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [t]);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (err) {
      // Revert on error
      setPreferences(preferences);
      setError(err instanceof Error ? err.message : t('updateError'));
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6">
        <p className="text-[var(--color-text)]">{tCommon('loading')}</p>
      </div>
    );
  }

  // Admin doesn't have notification preferences
  if (role === 'ADMIN') {
    return null;
  }

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {t('title')}
      </h2>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            {tCommon('ok')}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {role === 'JOB_SEEKER' && preferences && (
          <>
            <ToggleSwitch
              label={t('applicationAccepted')}
              description={t('applicationAcceptedDesc')}
              checked={preferences.applicationAccepted ?? true}
              onChange={(value) => handleToggle('applicationAccepted', value)}
            />
            <ToggleSwitch
              label={t('applicationRejected')}
              description={t('applicationRejectedDesc')}
              checked={preferences.applicationRejected ?? true}
              onChange={(value) => handleToggle('applicationRejected', value)}
            />
            <ToggleSwitch
              label={t('newMessages')}
              description={t('newMessagesDesc')}
              checked={preferences.newMessages ?? true}
              onChange={(value) => handleToggle('newMessages', value)}
            />
          </>
        )}

        {role === 'COMPANY' && preferences && (
          <>
            <ToggleSwitch
              label={t('newApplications')}
              description={t('newApplicationsDesc')}
              checked={preferences.newApplications ?? true}
              onChange={(value) => handleToggle('newApplications', value)}
            />
            <ToggleSwitch
              label={t('newMessages')}
              description={t('newMessagesDesc')}
              checked={preferences.newMessages ?? true}
              onChange={(value) => handleToggle('newMessages', value)}
            />
            <ToggleSwitch
              label={t('applicationWithdrawn')}
              description={t('applicationWithdrawnDesc')}
              checked={preferences.applicationWithdrawn ?? true}
              onChange={(value) => handleToggle('applicationWithdrawn', value)}
            />
          </>
        )}
      </div>
    </div>
  );
}
