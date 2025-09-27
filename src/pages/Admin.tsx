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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <AdminConsole />
      </div>
    </AdminRouteGuard>
  );
};

const AdminConsole: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activePanel, setActivePanel] = useState<AdminPanel>('users');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Initialize admin collections on first load
  useEffect(() => {
    if (user && user.roles.length > 0) {
      // Only initialize if user has any roles
      initializeAdminCollections({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        roles: user.roles
      });
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
    <>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-primary">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-headline-medium font-semibold text-neutral-900">Calendado Admin</h1>
                <p className="text-body-small text-neutral-600">Administrative Console</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-body-medium font-medium text-neutral-900">
                      {user.displayName || user.email}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-label-small font-medium bg-primary-100 text-primary-800"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {user.photoURL && (
                    <img
                      className="h-10 w-10 rounded-full ring-2 ring-primary-100"
                      src={user.photoURL}
                      alt={user.displayName || 'User avatar'}
                    />
                  )}
                </div>
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 text-neutral-700 text-body-medium font-medium rounded-xl shadow-sm hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-md transition-all duration-normal ease-standard focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSigningOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-72 flex-shrink-0">
            <nav className="space-y-3">
              {availablePanels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full flex items-center px-5 py-4 text-left rounded-2xl transition-all duration-normal ease-standard group ${
                    activePanel === panel.id
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-primary'
                      : 'text-neutral-700 hover:bg-white hover:shadow-lg border border-transparent hover:border-neutral-200'
                  }`}
                >
                  <span className="text-2xl mr-4 transition-transform duration-normal group-hover:scale-110">
                    {panel.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-title-medium">{panel.name}</div>
                    <div className={`text-body-small mt-0.5 ${
                      activePanel === panel.id ? 'text-primary-600' : 'text-neutral-500'
                    }`}>
                      {panel.requiredRoles.join(', ')} access
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Stats Card */}
            <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-title-medium font-semibold text-neutral-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-small text-neutral-600">Active Session</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-label-small font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-small text-neutral-600">Last Login</span>
                  <span className="text-body-small font-medium text-neutral-900">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-lg overflow-hidden">
              {activePanel === 'users' && <UsersRolesPanel />}
              {activePanel === 'waitlist' && <WaitlistPanel />}
              {activePanel === 'flags' && <FeatureFlagsPanel />}
              {activePanel === 'audit' && <AuditLogsPanel />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
