'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobSeekerStatsGrid } from '@/components/dashboard/StatsGrid';
import { NotificationList } from '@/components/notifications/NotificationList';
import { getDashboardStats } from '@/lib/dashboard/api';
import { JobSeekerStats } from '@/lib/dashboard/types';
import { Card } from '@/components/ui/Card';

export default function JobSeekerDashboard() {
  const [stats, setStats] = useState<JobSeekerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data as JobSeekerStats);
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout requiredRole="JOB_SEEKER">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1">
            Track your job applications and activity
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
          <JobSeekerStatsGrid stats={stats} />
        ) : null}

        {/* Notifications Section */}
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Recent Notifications
          </h2>
          <NotificationList limit={5} showMarkAllRead={true} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
