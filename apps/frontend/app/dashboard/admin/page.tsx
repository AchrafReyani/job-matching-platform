'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { getAdminStats } from '@/lib/admin/api';
import { AdminStats } from '@/lib/admin/types';
import Link from 'next/link';

// Icons
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export default function AdminDashboardPage() {
  const t = useTranslations('Admin.dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-[var(--color-text)]">{t('loadingStats')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={t('totalJobSeekers')}
                value={stats.totalJobSeekers}
                icon={<UsersIcon />}
              />
              <StatCard
                title={t('totalCompanies')}
                value={stats.totalCompanies}
                icon={<BuildingIcon />}
              />
              <StatCard
                title={t('totalVacancies')}
                value={stats.totalVacancies}
                icon={<BriefcaseIcon />}
              />
              <StatCard
                title={t('totalApplications')}
                value={stats.totalApplications}
                icon={<DocumentIcon />}
              />
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={t('activeVacancies')}
                value={stats.activeVacancies}
                icon={<BriefcaseIcon />}
                variant="success"
              />
              <StatCard
                title={t('pendingApplications')}
                value={stats.pendingApplications}
                icon={<ClockIcon />}
                variant="warning"
              />
              <StatCard
                title={t('newUsersThisWeek')}
                value={stats.newUsersThisWeek}
                icon={<TrendingUpIcon />}
                variant="success"
              />
              <StatCard
                title={t('applicationsThisMonth')}
                value={stats.applicationsThisMonth}
                icon={<DocumentIcon />}
              />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/dashboard/admin/users"
                className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                    <UsersIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('userManagement')}</h3>
                    <p className="text-sm text-[var(--color-text)] opacity-70">{t('userManagementDesc')}</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/vacancies"
                className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                    <BriefcaseIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('vacancyManagement')}</h3>
                    <p className="text-sm text-[var(--color-text)] opacity-70">{t('vacancyManagementDesc')}</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
