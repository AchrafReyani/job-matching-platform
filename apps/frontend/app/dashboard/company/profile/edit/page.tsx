'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { getProfile, updateProfile } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EditCompanyProfilePage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
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
        if (data.role !== 'COMPANY') {
          router.push('/dashboard/job-seeker');
          return;
        }
        setCompanyName(data.company?.companyName || '');
        setWebsiteUrl(data.company?.websiteUrl || '');
        setDescription(data.company?.description || '');
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
      await updateProfile(token, { companyName, websiteUrl, description });
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-(--color-text)">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-secondary) p-4">
      <Card className="w-full max-w-md p-6 space-y-4 bg-(--color-bg) text-(--color-text)">
        <h1 className="text-2xl font-bold text-center mb-4">Edit Company Profile</h1>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-(--color-text)">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-text)">Website URL</label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-text)">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-(--color-muted) rounded-md px-3 py-2 mt-1 bg-(--color-bg) text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        {message && <p className="text-center text-sm mt-2">{message}</p>}

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => router.push('/dashboard/company/profile')}
            className="bg-(--color-secondary) text-(--color-text) hover:bg-secondary-dark"
          >
            Back
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-(--color-success-dark) text-(--color-on-primary) hover:bg-(--color-success-light)"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
