import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase';
import { useAuth, UserRole } from '../../contexts/AuthContext';
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
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSuperAdmin = user?.hasRole('superadmin');
  const availableRoles: UserRole[] = ['superadmin', 'admin', 'support', 'editor', 'viewer'];

  useEffect(() => {
    if (!db) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: UserRecord[] = [];
      snapshot.forEach((doc) => {
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
      setUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRoleUpdate = async (targetUid: string, newRoles: UserRole[]) => {
    if (!isSuperAdmin) {
      setUpdateMessage({ type: 'error', text: 'Only superadmins can change roles' });
      return;
    }

    setIsUpdatingRoles(true);
    setUpdateMessage(null);

    try {
      const functions = getFunctions();
      const updateUserRoles = httpsCallable(functions, 'updateUserRoles');
      
      await updateUserRoles({
        targetUid,
        roles: newRoles
      });

      setUpdateMessage({ 
        type: 'success', 
        text: 'Roles updated successfully. User must re-login or refresh token to see new access.' 
      });
      setSelectedUser(null);
      
      // Refresh our own token if we updated our own roles
      if (targetUid === user?.uid) {
        await refreshToken();
      }
    } catch (error: any) {
      console.error('Error updating roles:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update roles' 
      });
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users & Roles</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage user roles and permissions. Only superadmins can change roles.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {updateMessage.text}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((userRecord) => (
                <tr key={userRecord.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userRecord.displayName || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userRecord.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {userRecord.roles.length > 0 ? (
                        userRecord.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userRecord.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(userRecord)}
                      disabled={!isSuperAdmin}
                      className={`text-blue-600 hover:text-blue-900 ${
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
          onSave={(newRoles) => handleRoleUpdate(selectedUser.uid, newRoles)}
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
  onCancel
}) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = () => {
    onSave(selectedRoles);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Edit Roles for {user.displayName || user.email}
          </h3>
          
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <label key={role} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={isUpdating}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isUpdating && <LoadingSpinner size="sm" />}
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesPanel;
