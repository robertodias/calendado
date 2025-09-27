import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminRouteGuard from '../components/AdminRouteGuard';
import UsersRolesPanel from '../components/admin/UsersRolesPanel';
import WaitlistPanel from '../components/admin/WaitlistPanel';
import FeatureFlagsPanel from '../components/admin/FeatureFlagsPanel';
import AuditLogsPanel from '../components/admin/AuditLogsPanel';
import { initializeAdminCollections } from '../lib/adminUtils';

type AdminPanel = 'users' | 'waitlist' | 'flags' | 'audit';

const Admin: React.FC = () => {
  return (
    <AdminRouteGuard>
      <AdminConsole />
    </AdminRouteGuard>
  );
};

const AdminConsole: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activePanel, setActivePanel] = useState<AdminPanel>('users');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Initialize admin collections on first load
  useEffect(() => {
    if (user?.hasRole(['admin', 'superadmin'])) {
      initializeAdminCollections();
    }
  }, [user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const panels = [
    { id: 'users' as AdminPanel, name: 'Users & Roles', icon: '👥', requiredRoles: ['superadmin', 'admin', 'support'] },
    { id: 'waitlist' as AdminPanel, name: 'Waitlist', icon: '📋', requiredRoles: ['superadmin', 'admin', 'support'] },
    { id: 'flags' as AdminPanel, name: 'Feature Flags', icon: '🚀', requiredRoles: ['superadmin', 'admin'] },
    { id: 'audit' as AdminPanel, name: 'Audit Logs', icon: '📊', requiredRoles: ['superadmin', 'admin', 'support'] },
  ];

  const availablePanels = panels.filter(panel => 
    user?.hasRole(panel.requiredRoles as any)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Console
              </h1>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-600">Calendado</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Roles:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user?.roles.join(', ') || 'none'}
                    </span>
                  </div>
                </div>
                
                {user?.photoURL && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || 'User avatar'}
                  />
                )}
              </div>
              
              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {availablePanels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activePanel === panel.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mr-3">{panel.icon}</span>
                  <span className="font-medium">{panel.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {activePanel === 'users' && <UsersRolesPanel />}
              {activePanel === 'waitlist' && <WaitlistPanel />}
              {activePanel === 'flags' && <FeatureFlagsPanel />}
              {activePanel === 'audit' && <AuditLogsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
