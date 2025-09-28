import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorUid: string;
  actorEmail?: string;
  targetUid?: string;
  targetEmail?: string;
  action: string;
  resource: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const LOGS_PER_PAGE = 50;

const getActionBadgeColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'bg-green-100 text-green-800';
    case 'update':
    case 'modify':
      return 'bg-blue-100 text-blue-800';
    case 'delete':
    case 'remove':
      return 'bg-red-100 text-red-800';
    case 'login':
    case 'signin':
      return 'bg-purple-100 text-purple-800';
    case 'logout':
    case 'signout':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const AuditLogsPanel: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Check if current user has permission to view audit logs
    if (!user?.hasRole(['admin', 'superadmin', 'support'])) {
      setLoading(false);
      return;
    }

    const logsRef = collection(db, 'admin', 'auditLogs', 'entries');
    const q = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(LOGS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const auditLogs: AuditLogEntry[] = [];
        let lastDocument: QueryDocumentSnapshot | null = null;

        snapshot.forEach(doc => {
          const data = doc.data();
          auditLogs.push({
            id: doc.id,
            timestamp: data.timestamp?.toDate() || new Date(),
            actorUid: data.actorUid,
            actorEmail: data.actorEmail,
            targetUid: data.targetUid,
            targetEmail: data.targetEmail,
            action: data.action,
            resource: data.resource,
            before: data.before,
            after: data.after,
            metadata: data.metadata,
          });
          lastDocument = doc;
        });

        setLogs(auditLogs);
        setLastDoc(lastDocument);
        setHasMore(snapshot.size === LOGS_PER_PAGE);
        setLoading(false);
      },
      error => {
        console.error('Error loading audit logs:', error);
        setLoading(false);
        setLogs([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const loadMoreLogs = async () => {
    if (!db || !lastDoc || !hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const logsRef = collection(db, 'admin', 'auditLogs', 'entries');
      const q = query(
        logsRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(LOGS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const newLogs: AuditLogEntry[] = [];
      let newLastDoc: QueryDocumentSnapshot | null = null;

      snapshot.forEach(doc => {
        const data = doc.data();
        newLogs.push({
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          actorUid: data.actorUid,
          actorEmail: data.actorEmail,
          targetUid: data.targetUid,
          targetEmail: data.targetEmail,
          action: data.action,
          resource: data.resource,
          before: data.before,
          after: data.after,
          metadata: data.metadata,
        });
        newLastDoc = doc;
      });

      setLogs(prev => [...prev, ...newLogs]);
      setLastDoc(newLastDoc);
      setHasMore(snapshot.size === LOGS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more logs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDiff = (
    before: Record<string, unknown> | undefined,
    after: Record<string, unknown> | undefined
  ) => {
    if (!before && !after) return null;

    const changes: string[] = [];

    if (before && after) {
      Object.keys({ ...before, ...after }).forEach(key => {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          changes.push(
            `${key}: ${JSON.stringify(before[key])} → ${JSON.stringify(after[key])}`
          );
        }
      });
    } else if (before) {
      changes.push(`Removed: ${JSON.stringify(before)}`);
    } else if (after) {
      changes.push(`Added: ${JSON.stringify(after)}`);
    }

    return changes.join(', ');
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
            Audit Logs
          </h2>
          <p className='text-sm sm:text-base text-neutral-600 max-w-2xl'>
            Review every administrative action and systemic event. Entries
            update in real time and always remain read-only.
          </p>
        </div>
        <div className='text-sm text-neutral-500'>
          Total entries: {logs.length}
          {hasMore && '+'}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className='overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Time
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Actor
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Action
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Target
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                Changes
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-neutral-100'>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className='px-6 py-8 text-center text-neutral-500'
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr
                  key={log.id}
                  className='cursor-pointer transition hover:bg-neutral-50'
                  onClick={() => setSelectedLog(log)}
                >
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-neutral-900'>
                    <div>{log.timestamp.toLocaleDateString()}</div>
                    <div className='text-xs text-neutral-500'>
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-neutral-900'>
                    <div>{log.actorEmail || 'System'}</div>
                    {log.actorUid && (
                      <div className='font-mono text-xs text-neutral-400'>
                        {log.actorUid.substring(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getActionBadgeColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                      <span className='text-xs text-neutral-500'>
                        {log.resource}
                      </span>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-neutral-500'>
                    {log.targetEmail || log.targetUid ? (
                      <div>
                        <div>{log.targetEmail || 'N/A'}</div>
                        {log.targetUid && (
                          <div className='font-mono text-xs text-neutral-400'>
                            {log.targetUid.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className='text-neutral-400'>N/A</span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm text-neutral-500'>
                    <div className='max-w-xs truncate'>
                      {formatDiff(log.before, log.after) ||
                        'No changes recorded'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className='flex justify-center'>
          <button
            onClick={loadMoreLogs}
            disabled={loadingMore}
            className='flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loadingMore && <LoadingSpinner size='sm' />}
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

interface AuditLogDetailModalProps {
  log: AuditLogEntry;
  onClose: () => void;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  log,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-semibold text-neutral-900'>
              Audit Log Details
            </h3>
            <p className='text-sm text-neutral-500'>
              {log.timestamp.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-full border border-neutral-200 p-2 text-neutral-400 transition hover:text-neutral-600'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-xl border border-neutral-100 p-4'>
            <div className='text-xs font-medium uppercase tracking-wide text-neutral-400'>
              Actor
            </div>
            <div className='mt-2 text-sm text-neutral-900'>
              {log.actorEmail || 'System'}
            </div>
            {log.actorUid && (
              <div className='mt-1 font-mono text-xs text-neutral-400'>
                UID: {log.actorUid}
              </div>
            )}
          </div>
          <div className='rounded-xl border border-neutral-100 p-4'>
            <div className='text-xs font-medium uppercase tracking-wide text-neutral-400'>
              Target
            </div>
            <div className='mt-2 text-sm text-neutral-900'>
              {log.targetEmail || log.targetUid || 'N/A'}
            </div>
            {log.targetUid && (
              <div className='mt-1 font-mono text-xs text-neutral-400'>
                UID: {log.targetUid}
              </div>
            )}
          </div>
          <div className='rounded-xl border border-neutral-100 p-4'>
            <div className='text-xs font-medium uppercase tracking-wide text-neutral-400'>
              Action
            </div>
            <div className='mt-2 text-sm text-neutral-900'>{log.action}</div>
          </div>
          <div className='rounded-xl border border-neutral-100 p-4'>
            <div className='text-xs font-medium uppercase tracking-wide text-neutral-400'>
              Resource
            </div>
            <div className='mt-2 text-sm text-neutral-900'>{log.resource}</div>
          </div>
        </div>

        {(log.before || log.after) && (
          <div className='mt-6 grid gap-4 sm:grid-cols-2'>
            <div>
              <h4 className='mb-2 text-sm font-semibold text-neutral-700'>
                Before
              </h4>
              <pre className='max-h-48 overflow-auto rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-700'>
                {JSON.stringify(log.before || {}, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className='mb-2 text-sm font-semibold text-neutral-700'>
                After
              </h4>
              <pre className='max-h-48 overflow-auto rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-700'>
                {JSON.stringify(log.after || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {log.metadata && (
          <div className='mt-6'>
            <h4 className='mb-2 text-sm font-semibold text-neutral-700'>
              Metadata
            </h4>
            <pre className='max-h-48 overflow-auto rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-700'>
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div className='mt-8 flex justify-end'>
          <button
            onClick={onClose}
            className='rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-200'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPanel;
