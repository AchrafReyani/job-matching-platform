'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { getAllVacancies } from '@/lib/vacancies/api';
import { getAllCompanies } from '@/lib/companies/api';
import { createApplication } from '@/lib/applications/api';

import type { Vacancy } from '@/lib/vacancies/types';
import type { Company } from '@/lib/companies/types';
import type { ApiError } from '@/lib/types';

/** Type guard for ApiError */
function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('status' in err || 'message' in err)
  );
}

export default function JobSeekerVacanciesPage() {
  const router = useRouter();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [companies, setCompanies] = useState<Record<number, Company>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  /** ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [vacancyList, companyList] = await Promise.all([
          getAllVacancies(),
          getAllCompanies(),
        ]);

        const map: Record<number, Company> = {};
        companyList.forEach((c) => (map[c.id] = c));

        setVacancies(vacancyList);
        setCompanies(map);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** ---------------- APPLY TO VACANCY ---------------- */
  const handleApply = async (vacancyId: number) => {
    setSubmitting(vacancyId);
    setError(null);

    try {
      await createApplication({ vacancyId });
      setPopupMessage('✅ Application submitted successfully!');
    } catch (err: unknown) {
      console.error(err);

      if (isApiError(err)) {
        if (err.status === 409 || err.status === 403) {
          setPopupMessage('⚠️ You have already applied for this vacancy.');
        } else {
          setPopupMessage('❌ An error occurred while applying.');
        }
      } else {
        setPopupMessage('❌ An unexpected error occurred.');
      }
    } finally {
      setSubmitting(null);
    }
  };

  const closePopup = () => setPopupMessage(null);

  /** ---------------- RENDER ---------------- */

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-(--color-text) bg-(--color-bg) min-h-screen items-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-10 bg-(--color-bg) min-h-screen flex items-center justify-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-(--color-bg) p-4 flex flex-col items-center text-(--color-text)">
      <h1 className="text-2xl font-bold mb-6">All Vacancies</h1>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {vacancies.length === 0 ? (
          <p className="text-(--color-muted) text-center">No vacancies available.</p>
        ) : (
          vacancies.map((vacancy) => {
            const company = companies[vacancy.companyId];

            return (
              <Card
                key={vacancy.id}
                className="p-4 bg-(--color-secondary) text-(--color-text) border border-(--color-muted)"
              >
                <h2 className="font-semibold text-lg">{vacancy.title}</h2>

                <p>
                  <strong>Company:</strong> {company?.companyName || 'Unknown'}
                </p>

                <p>
                  <strong>Role:</strong> {vacancy.role}
                </p>

                {vacancy.salaryRange && (
                  <p>
                    <strong>Salary:</strong> {vacancy.salaryRange}
                  </p>
                )}

                <p>{vacancy.jobDescription}</p>

                {vacancy.createdAt && (
                  <p className="text-sm text-(--color-muted) mt-1">
                    Posted: {new Date(vacancy.createdAt).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => handleApply(vacancy.id)}
                    disabled={submitting === vacancy.id}
                    className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
                  >
                    {submitting === vacancy.id ? 'Applying...' : 'Apply'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/profiles/${company?.userId}`)}
                    disabled={!company?.userId}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <Button
          onClick={() => router.push('/dashboard/job-seeker')}
          className="bg-(--color-accent) hover:bg-accent-dark text-(--color-on-primary)"
        >
          Back to Dashboard
        </Button>
      </div>

      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-(--color-secondary) p-6 rounded-2xl shadow-lg max-w-sm text-center text-(--color-text)">
            <p className="mb-4">{popupMessage}</p>
            <Button
              onClick={closePopup}
              className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
