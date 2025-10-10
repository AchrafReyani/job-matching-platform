'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Vacancy {
  id: number;
  title: string;
  role: string;
  jobDescription: string;
  salaryRange?: string;
}

export default function EditVacancyPage() {
  const router = useRouter();
  const params = useParams();
  const vacancyId = params.id;
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vacancy by ID
  useEffect(() => {
    const fetchVacancy = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies/${vacancyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch vacancy');
        const data: Vacancy = await res.json();
        setVacancy(data);
        setTitle(data.title);
        setRole(data.role);
        setJobDescription(data.jobDescription);
        setSalaryRange(data.salaryRange || '');
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancy();
  }, [vacancyId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies/${vacancyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, role, jobDescription, salaryRange }),
      });
      if (!res.ok) throw new Error('Failed to update vacancy');

      router.push('/dashboard/company/vacancies');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this vacancy?');
    if (!confirmed) return;

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies/${vacancyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete vacancy');

      router.push('/dashboard/company/vacancies');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!vacancy) return <div className="text-center mt-10">Vacancy not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Edit Vacancy</h1>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          <textarea
            placeholder="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="border rounded-lg p-2 resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <Input
            type="text"
            placeholder="Salary Range (optional)"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex justify-between mt-4">
            <Button type="button" onClick={() => router.push('/dashboard/company/vacancies')}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
              <Button variant="secondary" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
