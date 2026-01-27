'use client';

import { useEffect, useState, useCallback } from 'react';
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
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filter]);

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
      setError(err instanceof Error ? err.message : 'Failed to update user');
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
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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
      setError(err instanceof Error ? err.message : 'Failed to perform bulk delete');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">User Management</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1">
            Manage job seekers and companies
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-[var(--color-text)] mb-1">Search</label>
              <div className="flex gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by email or name..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text)] mb-1">Filter by Role</label>
              <div className="flex gap-2">
                <Button
                  variant={!filter.role ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={filter.role === 'JOB_SEEKER' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole('JOB_SEEKER')}
                >
                  Job Seekers
                </Button>
                <Button
                  variant={filter.role === 'COMPANY' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterRole('COMPANY')}
                >
                  Companies
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
            Delete All Job Seekers
          </Button>
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteType('companies')}
          >
            Delete All Companies
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text)]">
                    Loading...
                  </td>
                </tr>
              ) : users?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text)]">
                    No users found
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
                        {user.role === 'JOB_SEEKER' ? 'Job Seeker' : 'Company'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(user)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingUser(user)}>
                          Delete
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
                Showing {((users.page - 1) * users.pageSize) + 1} to {Math.min(users.page * users.pageSize, users.total)} of {users.total}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={users.page <= 1}
                  onClick={() => handlePageChange(users.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={users.page >= users.totalPages}
                  onClick={() => handlePageChange(users.page + 1)}
                >
                  Next
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
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">Email</label>
                <Input
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">Name</label>
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditSubmit} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Confirm Delete</h2>
            <p className="text-[var(--color-text)]">
              Are you sure you want to delete user <strong>{deletingUser.email}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Confirm Bulk Delete</h2>
            <p className="text-[var(--color-text)]">
              Are you sure you want to delete <strong>all {bulkDeleteType === 'job-seekers' ? 'job seekers' : 'companies'}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-6">
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
                {bulkDeleteLoading ? 'Deleting...' : 'Delete All'}
              </Button>
              <Button variant="secondary" onClick={() => setBulkDeleteType(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
