'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createVacancy } from '@/lib/vacancies/api';
import type { CreateVacancyPayload } from '@/lib/vacancies/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddVacancyPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateVacancyPayload>({
    title: '',
    role: '',
    jobDescription: '',
    salaryRange: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof CreateVacancyPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createVacancy(form);
      router.push('/dashboard/company/vacancies');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Add New Vacancy</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Job Title
              </label>
              <Input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Role
              </label>
              <Input
                type="text"
                placeholder="e.g. Frontend, Backend, Full Stack"
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Job Description
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                value={form.jobDescription}
                onChange={(e) => updateField('jobDescription', e.target.value)}
                className="w-full border border-[var(--color-secondary)] rounded-lg p-3 resize-none h-32
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                  bg-[var(--color-bg)] text-[var(--color-text)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Salary Range (optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. $80,000 - $120,000"
                value={form.salaryRange}
                onChange={(e) => updateField('salaryRange', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/company/vacancies')}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Vacancy'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
