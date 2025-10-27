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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">Edit Profile</h1>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Experience Summary</label>
            <textarea
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
        </div>

        {message && <p className="text-center text-sm mt-2">{message}</p>}

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => router.push('/dashboard/job-seeker/profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
