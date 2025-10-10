'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Vacancy {
  id: number;
  title: string;
  role: string;
  salaryRange?: string;
  jobDescription: string;
  createdAt: string;
}

export default function CompanyVacanciesPage() {
  const router = useRouter();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVacancies = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // First get profile to know companyId
        const profile = await getProfile(token);
        const companyId = profile.company?.id;
        if (!companyId) throw new Error('Company ID not found');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies/company/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your vacancies');

        const data: Vacancy[] = await res.json();
        setVacancies(data);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, [router]);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">My Vacancies</h1>

      <div className="flex flex-col gap-4 w-full max-w-2xl mb-6">
        <Button onClick={() => router.push('/dashboard/company/vacancies/add')}>Add New Vacancy</Button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {vacancies.length === 0 ? (
          <p className="text-gray-600 text-center">You have not posted any vacancies.</p>
        ) : (
          vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="p-4">
              <h2 className="font-semibold text-lg">{vacancy.title}</h2>
              <p><strong>Role:</strong> {vacancy.role}</p>
              {vacancy.salaryRange && <p><strong>Salary:</strong> {vacancy.salaryRange}</p>}
              <p>{vacancy.jobDescription}</p>
              <p className="text-sm text-gray-500 mt-1">
                Posted: {new Date(vacancy.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <Button onClick={() => router.push(`/dashboard/company/vacancies/edit/${vacancy.id}`)}>
                  Edit
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => router.push('/dashboard/company')}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
