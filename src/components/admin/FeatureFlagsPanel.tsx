import React, { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
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
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canEdit = user?.hasRole(['admin', 'superadmin']);

  useEffect(() => {
    if (!db) return;

    const flagsRef = doc(db, 'admin', 'featureFlags');

    const unsubscribe = onSnapshot(flagsRef, docSnap => {
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

      // Get current value for audit log
      const currentValue = flags[flagName] as boolean;

      // Use setDoc with merge to handle both create and update cases
      await setDoc(
        flagsRef,
        {
          [flagName]: value,
          lastUpdated: serverTimestamp(),
          lastUpdatedBy: user.email,
        },
        { merge: true }
      );

      // Create audit log entry
      await addDoc(collection(db, 'admin', 'auditLogs', 'entries'), {
        timestamp: serverTimestamp(),
        actorUid: user.uid,
        actorEmail: user.email,
        action: 'update_feature_flag',
        resource: 'feature_flags',
        before: { [flagName]: currentValue },
        after: { [flagName]: value },
        metadata: {
          flagName,
          userAgent: navigator.userAgent,
        },
      });

      setSaveMessage({
        type: 'success',
        text: `${flagName} ${value ? 'enabled' : 'disabled'} successfully`,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating flag:', error);
      setSaveMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to update feature flag',
      });
    } finally {
      setSaving(null);
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
            Feature Flags
          </h2>
          <p className='text-sm sm:text-base text-neutral-600 max-w-2xl'>
            Control experimental functionality and phased rollouts. Toggle
            features on for internal teams before exposing them to everyone.
            {!canEdit && ' (Read-only access)'}
          </p>
        </div>
        <div className='text-sm text-neutral-500'>
          {flags.lastUpdated && (
            <div className='text-right'>
              <div>Last updated: {flags.lastUpdated.toLocaleString()}</div>
              {flags.lastUpdatedBy && (
                <div className='text-xs text-neutral-400'>
                  by {flags.lastUpdatedBy}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`rounded-xl border p-3 ${
            saveMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Feature Flags Grid */}
      <div className='grid gap-4'>
        {Object.entries(flagDescriptions).map(([flagName, description]) => {
          const flagKey = flagName as keyof FeatureFlags;
          const isEnabled = flags[flagKey] as boolean;
          const isSaving = saving === flagKey;

          return (
            <div
              key={flagName}
              className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-primary-200'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3'>
                    <h3 className='text-lg font-semibold text-neutral-900 capitalize'>
                      {flagName.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isEnabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className='mt-2 text-sm text-neutral-600'>{description}</p>
                </div>

                <div className='flex items-center space-x-3'>
                  {isSaving && <LoadingSpinner size='sm' />}

                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={isEnabled}
                      onChange={e => updateFlag(flagKey, e.target.checked)}
                      disabled={!canEdit || isSaving}
                      className='sr-only peer'
                    />
                    <div
                      className={`relative h-6 w-11 rounded-full bg-neutral-300 transition ${
                        isEnabled ? 'bg-primary-600' : ''
                      } ${
                        !canEdit || isSaving
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          isEnabled ? 'translate-x-5' : ''
                        }`}
                      ></span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional info for specific flags */}
              {flagName === 'bookingAlpha' && isEnabled && (
                <div className='mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-5 w-5 text-yellow-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-amber-700'>
                        Alpha feature: Only enable for testing environments or
                        selected users.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {flagName === 'paymentsAlpha' && isEnabled && (
                <div className='mt-3 rounded-xl border border-red-200 bg-red-50 p-3'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-5 w-5 text-red-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-700'>
                        Payment processing enabled: Ensure proper testing and
                        compliance measures are in place.
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
      <div className='rounded-2xl border border-primary-200 bg-primary-50 p-5 shadow-sm'>
        <h3 className='mb-2 text-sm font-semibold text-primary-800'>
          Usage Instructions
        </h3>
        <ul className='space-y-1 text-sm text-primary-700'>
          <li>
            • Feature flags are applied in real-time across the application
          </li>
          <li>
            • Changes are logged and can be viewed in the Audit Logs panel
          </li>
          <li>• Only admins and superadmins can modify feature flags</li>
          <li>• Use alpha flags carefully in production environments</li>
        </ul>
      </div>
    </div>
  );
};

export default FeatureFlagsPanel;
