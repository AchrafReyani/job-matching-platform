'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CompanyStatsGrid } from '@/components/dashboard/StatsGrid';
import { NotificationList } from '@/components/notifications/NotificationList';
import { getDashboardStats } from '@/lib/dashboard/api';
import { CompanyStats } from '@/lib/dashboard/types';
import { Card } from '@/components/ui/Card';

export default function CompanyDashboard() {
  const t = useTranslations('Dashboard.company');
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data as CompanyStats);
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Section */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : stats ? (
          <CompanyStatsGrid stats={stats} />
        ) : null}

        {/* Notifications Section */}
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            {t('recentNotifications')}
          </h2>
          <NotificationList limit={5} showMarkAllRead={true} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
