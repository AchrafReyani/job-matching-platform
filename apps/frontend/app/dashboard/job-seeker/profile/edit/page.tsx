'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile, updateProfile } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EditJobSeekerProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        if (data.role !== 'JOB_SEEKER') {
          router.push('/dashboard/company');
          return;
        }
        setFullName(data.jobSeeker?.fullName || '');
        setPortfolioUrl(data.jobSeeker?.portfolioUrl || '');
        setExperienceSummary(data.jobSeeker?.experienceSummary || '');
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(token, { fullName, portfolioUrl, experienceSummary });
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-(--color-text) bg-(--color-bg)">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-4 text-(--color-text)">
      <Card className="w-full max-w-md p-6 space-y-4 bg-(--color-secondary) text-(--color-text)">
        <h1 className="text-2xl font-bold text-center mb-4">Edit Profile</h1>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-(--color-text)">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-text)">
              Portfolio URL
            </label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-text)">
              Experience Summary
            </label>
            <textarea
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              rows={4}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text)"
            />
          </div>
        </div>

        {message && <p className="text-center text-sm mt-2">{message}</p>}

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => router.push('/dashboard/job-seeker/profile')}
            className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
          >
            Back
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-(--color-accent) hover:bg-accent-dark text-(--color-on-primary)"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
