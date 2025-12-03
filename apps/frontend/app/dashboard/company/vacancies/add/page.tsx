'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddVacancyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, role, jobDescription, salaryRange }),
      });

      if (!res.ok) {
        throw new Error('Failed to create vacancy');
      }

      router.push('/dashboard/company/vacancies');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Vacancy</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            className="border rounded-lg p-2 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-(--color-bg) text-(--color-text)"
            required
          />
          <Input
            type="text"
            placeholder="Salary Range (optional)"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />

          {error && <p className="text-(--color-error-dark) text-sm text-center">{error}</p>}

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              className="bg-(--color-secondary) hover:bg-secondary-dark text-(--color-on-primary)"
              onClick={() => router.push('/dashboard/company/vacancies')}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            >
              {loading ? 'Adding...' : 'Add Vacancy'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
