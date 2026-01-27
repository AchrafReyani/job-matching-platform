'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getUsers,
  deleteUser,
  updateUser,
  deleteAllJobSeekers,
  deleteAllCompanies,
} from '@/lib/admin/api';
import { UserListItem, UserFilter, PaginatedResult, UpdateUserData } from '@/lib/admin/types';

export default function UserManagementPage() {
  const t = useTranslations('Admin.users');
  const tCommon = useTranslations('Common');
  const [users, setUsers] = useState<PaginatedResult<UserListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserFilter>({ page: 1, pageSize: 10 });
  const [searchInput, setSearchInput] = useState('');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserData>({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk delete state
  const [bulkDeleteType, setBulkDeleteType] = useState<'job-seekers' | 'companies' | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(filter);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setFilter({ ...filter, search: searchInput, page: 1 });
  };

  const handleFilterRole = (role: 'JOB_SEEKER' | 'COMPANY' | undefined) => {
    setFilter({ ...filter, role, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page });
  };

  const handleEdit = (user: UserListItem) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    setEditLoading(true);
    try {
      await updateUser(editingUser.id, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToUpdate'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToDelete'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteType) return;
    setBulkDeleteLoading(true);
    try {
      if (bulkDeleteType === 'job-seekers') {
        await deleteAllJobSeekers();
      } else {
        await deleteAllCompanies();
      }
      setBulkDeleteType(null);
      fetchUsers();
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
            <div>
              <label className="block text-sm text-[var(--color-text)] mb-1">{t('filterByRole')}</label>
              <div className="flex gap-2">
                <Button
                  variant={!filter.role ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole(undefined)}
                >
                  {t('all')}
                </Button>
                <Button
                  variant={filter.role === 'JOB_SEEKER' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole('JOB_SEEKER')}
                >
                  {t('jobSeekers')}
                </Button>
                <Button
                  variant={filter.role === 'COMPANY' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole('COMPANY')}
                >
                  {t('companies')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteType('job-seekers')}
          >
            {t('deleteAllJobSeekers')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteType('companies')}
          >
            {t('deleteAllCompanies')}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">{tCommon('ok')}</button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('email')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('name')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('role')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('created')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text)]">
                    {tCommon('loading')}
                  </td>
                </tr>
              ) : users?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text)]">
                    {t('noUsersFound')}
                  </td>
                </tr>
              ) : (
                users?.data.map((user) => (
                  <tr key={user.id} className="border-t border-[var(--color-secondary)]">
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">{user.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'JOB_SEEKER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {user.role === 'JOB_SEEKER' ? t('jobSeeker') : t('company')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(user)}>
                          {tCommon('edit')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingUser(user)}>
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
          {users && users.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[var(--color-secondary)] flex items-center justify-between">
              <p className="text-sm text-[var(--color-text)]">
                {t('showingResults', {
                  from: ((users.page - 1) * users.pageSize) + 1,
                  to: Math.min(users.page * users.pageSize, users.total),
                  total: users.total
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={users.page <= 1}
                  onClick={() => handlePageChange(users.page - 1)}
                >
                  {t('previous')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={users.page >= users.totalPages}
                  onClick={() => handlePageChange(users.page + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('editUser')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('email')}</label>
                <Input
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">{t('name')}</label>
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditSubmit} disabled={editLoading}>
                {editLoading ? tCommon('saving') : tCommon('save')}
              </Button>
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('confirmDelete')}</h2>
            <p className="text-[var(--color-text)]">
              {t('confirmDeleteMessage', { email: deletingUser.email })}
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? t('deleting') : tCommon('delete')}
              </Button>
              <Button variant="secondary" onClick={() => setDeletingUser(null)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('confirmBulkDelete')}</h2>
            <p className="text-[var(--color-text)]">
              {bulkDeleteType === 'job-seekers' ? t('confirmBulkDeleteJobSeekers') : t('confirmBulkDeleteCompanies')}
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
                {bulkDeleteLoading ? t('deleting') : t('deleteAll')}
              </Button>
              <Button variant="secondary" onClick={() => setBulkDeleteType(null)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
