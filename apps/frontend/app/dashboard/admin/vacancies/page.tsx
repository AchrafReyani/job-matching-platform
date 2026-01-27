'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getVacancies,
  deleteVacancy,
  updateVacancy,
  deleteAllVacancies,
} from '@/lib/admin/api';
import { VacancyListItem, VacancyFilter, PaginatedResult, UpdateVacancyData } from '@/lib/admin/types';

export default function VacancyManagementPage() {
  const t = useTranslations('Admin.vacancies');
  const tCommon = useTranslations('Common');
  const [vacancies, setVacancies] = useState<PaginatedResult<VacancyListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VacancyFilter>({ page: 1, pageSize: 10 });
  const [searchInput, setSearchInput] = useState('');

  // Edit modal state
  const [editingVacancy, setEditingVacancy] = useState<VacancyListItem | null>(null);
  const [editForm, setEditForm] = useState<UpdateVacancyData>({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deletingVacancy, setDeletingVacancy] = useState<VacancyListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk delete state
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVacancies(filter);
      setVacancies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const handleSearch = () => {
    setFilter({ ...filter, search: searchInput, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page });
  };

  const handleEdit = (vacancy: VacancyListItem) => {
    setEditingVacancy(vacancy);
    setEditForm({ title: vacancy.title, role: vacancy.role });
  };

  const handleEditSubmit = async () => {
    if (!editingVacancy) return;
    setEditLoading(true);
    try {
      await updateVacancy(editingVacancy.id, editForm);
      setEditingVacancy(null);
      fetchVacancies();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToUpdate'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVacancy) return;
    setDeleteLoading(true);
    try {
      await deleteVacancy(deletingVacancy.id);
      setDeletingVacancy(null);
      fetchVacancies();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToDelete'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await deleteAllVacancies();
      setShowBulkDelete(false);
      fetchVacancies();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToBulkDelete'));
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-[var(--color-text)] mb-1">{t('search')}</label>
              <div className="flex gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>{t('search')}</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={() => setShowBulkDelete(true)}
          >
            {t('deleteAllVacancies')}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">{tCommon('ok')}</button>
          </div>
        )}

        {/* Vacancies Table */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('vacancyTitle')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('companyName')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('role')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('applications')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('created')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text)]">
                    {tCommon('loading')}
                  </td>
                </tr>
              ) : vacancies?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text)]">
                    {t('noVacanciesFound')}
                  </td>
                </tr>
              ) : (
                vacancies?.data.map((vacancy) => (
                  <tr key={vacancy.id} className="border-t border-[var(--color-secondary)]">
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">{vacancy.title}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">{vacancy.companyName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {vacancy.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">{vacancy.applicationCount}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">
                      {new Date(vacancy.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(vacancy)}>
                          {tCommon('edit')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingVacancy(vacancy)}>
                          {tCommon('delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {vacancies && vacancies.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[var(--color-secondary)] flex items-center justify-between">
              <p className="text-sm text-[var(--color-text)]">
                {t('showingResults', {
                  from: ((vacancies.page - 1) * vacancies.pageSize) + 1,
                  to: Math.min(vacancies.page * vacancies.pageSize, vacancies.total),
                  total: vacancies.total
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={vacancies.page <= 1}
                  onClick={() => handlePageChange(vacancies.page - 1)}
                >
                  {t('previous')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={vacancies.page >= vacancies.totalPages}
                  onClick={() => handlePageChange(vacancies.page + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingVacancy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('editVacancy')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('vacancyTitle')}</label>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('role')}</label>
                <Input
                  value={editForm.role || ''}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('salaryRange')}</label>
                <Input
                  value={editForm.salaryRange || ''}
                  onChange={(e) => setEditForm({ ...editForm, salaryRange: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('jobDescription')}</label>
                <textarea
                  className="w-full px-3 py-2 border border-[var(--color-secondary)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
                  rows={4}
                  value={editForm.jobDescription || ''}
                  onChange={(e) => setEditForm({ ...editForm, jobDescription: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditSubmit} disabled={editLoading}>
                {editLoading ? tCommon('saving') : tCommon('save')}
              </Button>
              <Button variant="secondary" onClick={() => setEditingVacancy(null)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVacancy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('confirmDelete')}</h2>
            <p className="text-[var(--color-text)]">
              {t('confirmDeleteMessage', { title: deletingVacancy.title })}
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? t('deleting') : tCommon('delete')}
              </Button>
              <Button variant="secondary" onClick={() => setDeletingVacancy(null)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('confirmBulkDelete')}</h2>
            <p className="text-[var(--color-text)]">
              {t('confirmBulkDeleteMessage')}
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
                {bulkDeleteLoading ? t('deleting') : t('deleteAll')}
              </Button>
              <Button variant="secondary" onClick={() => setShowBulkDelete(false)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
