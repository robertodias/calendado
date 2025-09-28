import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';
import LoadingSpinner from '../LoadingSpinner';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  roles: UserRole[];
  createdAt: Date;
  lastSignIn?: Date;
}

const UsersRolesPanel: React.FC = () => {
  const { user, refreshToken } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isSuperAdmin = user?.hasRole('superadmin');
  const availableRoles: UserRole[] = [
    'superadmin',
    'admin',
    'support',
    'editor',
    'viewer',
  ];

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Check if current user has permission to view users
    if (!user?.hasRole(['admin', 'superadmin', 'support'])) {
      console.warn('User does not have permission to view users list');
      setLoading(false);
      return;
    }

    const usersRef = collection(db, 'users');
    // Use a simpler query without orderBy to avoid index issues
    const q = query(usersRef);

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const userList: UserRecord[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            roles: data.roles || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            lastSignIn: data.lastSignIn?.toDate(),
          });
        });
        // Sort by email since we can't use Firestore orderBy
        userList.sort((a, b) => a.email.localeCompare(b.email));
        setUsers(userList);
        setLoading(false);
      },
      error => {
        console.error('Error loading users:', error);
        setLoading(false);
        // Set empty array if there's a permission error
        setUsers([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName &&
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRoleUpdate = async (targetUid: string, newRoles: UserRole[]) => {
    if (!isSuperAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Only superadmins can change roles',
      });
      return;
    }

    setIsUpdatingRoles(true);
    setUpdateMessage(null);

    try {
      const functions = getFunctions();
      const updateUserRoles = httpsCallable(functions, 'updateUserRoles');

      await updateUserRoles({
        targetUid,
        roles: newRoles,
      });

      setUpdateMessage({
        type: 'success',
        text: 'Roles updated successfully. User must re-login or refresh token to see new access.',
      });
      setSelectedUser(null);

      // Refresh our own token if we updated our own roles
      if (targetUid === user?.uid) {
        await refreshToken();
      }
    } catch (error: unknown) {
      console.error('Error updating roles:', error);
      setUpdateMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update roles',
      });
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  if (loading) {
    return (
      <div className='p-6 flex justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='p-6 sm:p-8 lg:p-10 space-y-8'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold text-neutral-900'>
            Users & Roles
          </h2>
          <p className='text-sm sm:text-base text-neutral-600 max-w-2xl'>
            Manage access levels for every teammate. Only superadmins can modify
            roles, but everyone can review the current assignments.
          </p>
        </div>
        <div className='text-sm text-neutral-500'>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${
            updateMessage.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {updateMessage.text}
        </div>
      )}

      {/* Search */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search users by email or name...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-full max-w-md rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200'
        />
      </div>

      {/* Users Table */}
      <div className='overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                User
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Roles
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Created
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-neutral-100'>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className='px-6 py-8 text-center text-neutral-500'
                >
                  {searchTerm ? (
                    'No users found matching your search.'
                  ) : (
                    <div className='space-y-2'>
                      <div>No users found in the system yet.</div>
                      <div className='text-sm text-neutral-400'>
                        Users will appear here when roles are assigned to them.
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredUsers.map(userRecord => (
                <tr
                  key={userRecord.uid}
                  className='transition hover:bg-neutral-50'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div>
                        <div className='text-sm font-medium text-neutral-900'>
                          {userRecord.displayName || 'No name'}
                        </div>
                        <div className='text-sm text-neutral-500'>
                          {userRecord.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {userRecord.roles.length > 0 ? (
                        userRecord.roles.map(role => (
                          <span
                            key={role}
                            className='inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700'
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className='text-sm text-neutral-500'>
                          No roles
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-500'>
                    {userRecord.createdAt.toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => setSelectedUser(userRecord)}
                      disabled={!isSuperAdmin}
                      className={`text-primary-600 transition hover:text-primary-800 ${
                        !isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSuperAdmin ? 'Edit Roles' : 'View Only'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Edit Modal */}
      {selectedUser && (
        <RoleEditModal
          user={selectedUser}
          availableRoles={availableRoles}
          isUpdating={isUpdatingRoles}
          onSave={newRoles => handleRoleUpdate(selectedUser.uid, newRoles)}
          onCancel={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

interface RoleEditModalProps {
  user: UserRecord;
  availableRoles: UserRole[];
  isUpdating: boolean;
  onSave: (roles: UserRole[]) => void;
  onCancel: () => void;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({
  user,
  availableRoles,
  isUpdating,
  onSave,
  onCancel,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = () => {
    onSave(selectedRoles);
  };

  return (
    <div className='fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl'>
        <div className='mb-6'>
          <h3 className='text-xl font-semibold text-neutral-900'>Edit Roles</h3>
          <p className='mt-1 text-sm text-neutral-600'>
            {user.displayName || user.email}
          </p>
        </div>

        <div className='space-y-3'>
          {availableRoles.map(role => (
            <label
              key={role}
              className='flex items-center justify-between rounded-xl border border-neutral-200 p-3 transition hover:border-primary-300'
            >
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={isUpdating}
                  className='h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50'
                />
                <span className='text-sm font-medium text-neutral-700 capitalize'>
                  {role}
                </span>
              </div>
              <span className='text-xs text-neutral-400'>Role</span>
            </label>
          ))}
        </div>

        <div className='mt-8 flex items-center justify-end gap-3'>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className='rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className='flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50'
          >
            {isUpdating && <LoadingSpinner size='sm' />}
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesPanel;
