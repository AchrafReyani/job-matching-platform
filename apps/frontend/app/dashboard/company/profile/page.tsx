'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProfileDetailsCompany from '@/features/profile/components/ProfileDetailsCompany';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { VacancyCard } from '@/features/vacancies/components';
import { getProfile } from '@/lib/auth/api';
import { getCompanyProfile } from '@/lib/companies/api';
import type { ProfileResponse } from '@/lib/auth/types';
import type { CompanyWithVacancies } from '@/lib/companies/types';

export default function DashboardCompanyProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [companyData, setCompanyData] = useState<CompanyWithVacancies | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Profile.company');
  const tTabs = useTranslations('Profile.tabs');

  useEffect(() => {
    (async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);

        if (profileData.company?.id) {
          const companyProfileData = await getCompanyProfile(profileData.company.id);
          setCompanyData(companyProfileData);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditVacancy = (vacancyId: number) => {
    router.push(`/dashboard/company/vacancies/edit/${vacancyId}`);
  };

  return (
    <DashboardLayout requiredRole="COMPANY">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <Button onClick={() => router.push('/dashboard/company/profile/edit')}>
            {t('editProfile')}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : profile ? (
          <Card className="p-6">
            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">{tTabs('about')}</TabsTrigger>
                <TabsTrigger value="vacancies">
                  {tTabs('vacancies')} ({companyData?.vacancies.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <ProfileDetailsCompany profile={profile} />
              </TabsContent>

              <TabsContent value="vacancies">
                {companyData?.vacancies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[var(--color-text)] opacity-60 mb-4">
                      {tTabs('noVacancies')}
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/company/vacancies/add')}
                    >
                      {tTabs('addVacancy')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companyData?.vacancies.map((vacancy) => (
                      <VacancyCard
                        key={vacancy.id}
                        vacancy={vacancy}
                        showDescription={true}
                        showDate={true}
                        actionButton={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVacancy(vacancy.id)}
                          >
                            {tTabs('edit')}
                          </Button>
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
