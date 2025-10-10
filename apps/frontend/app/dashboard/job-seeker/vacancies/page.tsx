'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Vacancy {
  id: number;
  title: string;
  role: string;
  salaryRange?: string;
  jobDescription: string;
  createdAt: string;
  companyId: number;
}

interface Company {
  id: number;
  companyName: string;
}

export default function JobSeekerVacanciesPage() {
  const router = useRouter();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch vacancies
        const vacRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!vacRes.ok) throw new Error('Failed to fetch vacancies');
        const vacData: Vacancy[] = await vacRes.json();
        setVacancies(vacData);

        // Fetch companies
        const compRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!compRes.ok) throw new Error('Failed to fetch companies');
        const compData: Company[] = await compRes.json();
        const compMap: Record<number, string> = {};
        compData.forEach((c) => (compMap[c.id] = c.companyName));
        setCompanies(compMap);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">All Vacancies</h1>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {vacancies.length === 0 ? (
          <p className="text-gray-600 text-center">No vacancies available.</p>
        ) : (
          vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="p-4">
              <h2 className="font-semibold text-lg">{vacancy.title}</h2>
              <p><strong>Company:</strong> {companies[vacancy.companyId] || 'Unknown'}</p>
              <p><strong>Role:</strong> {vacancy.role}</p>
              {vacancy.salaryRange && <p><strong>Salary:</strong> {vacancy.salaryRange}</p>}
              <p>{vacancy.jobDescription}</p>
              <p className="text-sm text-gray-500 mt-1">
                Posted: {new Date(vacancy.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <Button onClick={() => alert('Apply feature coming soon')}>Apply</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => router.push('/dashboard/job-seeker')}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
