import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

interface FeatureFlags {
  bookingAlpha: boolean;
  paymentsAlpha: boolean;
  advancedCalendar: boolean;
  mobileApp: boolean;
  lastUpdated?: Date;
  lastUpdatedBy?: string;
}

const defaultFlags: FeatureFlags = {
  bookingAlpha: false,
  paymentsAlpha: false,
  advancedCalendar: false,
  mobileApp: false,
};

const flagDescriptions = {
  bookingAlpha: 'Enable alpha booking functionality for early testing',
  paymentsAlpha: 'Enable alpha payment processing features',
  advancedCalendar: 'Enable advanced calendar features and integrations',
  mobileApp: 'Enable mobile app features and deep linking',
};

const FeatureFlagsPanel: React.FC = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEdit = user?.hasRole(['admin', 'superadmin']);

  useEffect(() => {
    if (!db) return;

    const flagsRef = doc(db, 'admin', 'featureFlags');
    
    const unsubscribe = onSnapshot(flagsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFlags({
          bookingAlpha: data.bookingAlpha || false,
          paymentsAlpha: data.paymentsAlpha || false,
          advancedCalendar: data.advancedCalendar || false,
          mobileApp: data.mobileApp || false,
          lastUpdated: data.lastUpdated?.toDate(),
          lastUpdatedBy: data.lastUpdatedBy,
        });
      } else {
        setFlags(defaultFlags);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateFlag = async (flagName: keyof FeatureFlags, value: boolean) => {
    if (!canEdit || !db || !user) return;

    setSaving(flagName);
    setSaveMessage(null);

    try {
      const flagsRef = doc(db, 'admin', 'featureFlags');
      await updateDoc(flagsRef, {
        [flagName]: value,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.email,
      });

      setSaveMessage({ 
        type: 'success', 
        text: `${flagName} ${value ? 'enabled' : 'disabled'} successfully` 
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating flag:', error);
      setSaveMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update feature flag' 
      });
    } finally {
      setSaving(null);
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
          <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control application features and experimental functionality.
            {!canEdit && ' (Read-only access)'}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {flags.lastUpdated && (
            <div>
              <div>Last updated: {flags.lastUpdated.toLocaleString()}</div>
              {flags.lastUpdatedBy && (
                <div className="text-xs">by {flags.lastUpdatedBy}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Feature Flags Grid */}
      <div className="space-y-4">
        {Object.entries(flagDescriptions).map(([flagName, description]) => {
          const flagKey = flagName as keyof FeatureFlags;
          const isEnabled = flags[flagKey] as boolean;
          const isSaving = saving === flagKey;

          return (
            <div
              key={flagName}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {flagName.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {description}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {isSaving && <LoadingSpinner size="sm" />}
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => updateFlag(flagKey, e.target.checked)}
                      disabled={!canEdit || isSaving}
                      className="sr-only peer"
                    />
                    <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                      !canEdit || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}></div>
                  </label>
                </div>
              </div>

              {/* Additional info for specific flags */}
              {flagName === 'bookingAlpha' && isEnabled && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Alpha feature: Only enable for testing environments or selected users.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {flagName === 'paymentsAlpha' && isEnabled && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Payment processing enabled: Ensure proper testing and compliance measures are in place.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Usage Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Feature flags are applied in real-time across the application</li>
          <li>• Changes are logged and can be viewed in the Audit Logs panel</li>
          <li>• Only admins and superadmins can modify feature flags</li>
          <li>• Use alpha flags carefully in production environments</li>
        </ul>
      </div>
    </div>
  );
};

export default FeatureFlagsPanel;
