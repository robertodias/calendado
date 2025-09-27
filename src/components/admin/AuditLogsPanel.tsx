import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, startAfter, QueryDocumentSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
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
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
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

    const logsRef = collection(db, 'admin', 'auditLogs', 'entries');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(LOGS_PER_PAGE));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const auditLogs: AuditLogEntry[] = [];
        let lastDocument: QueryDocumentSnapshot | null = null;

        snapshot.forEach((doc) => {
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
      (error) => {
        console.error('Error loading audit logs:', error);
        setLoading(false);
        // Set empty array if there's a permission error
        setLogs([]);
      }
    );

    return () => unsubscribe();
  }, []);

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

      snapshot.forEach((doc) => {
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


  const formatDiff = (before: any, after: any) => {
    if (!before && !after) return null;
    
    const changes: string[] = [];
    
    if (before && after) {
      Object.keys({ ...before, ...after }).forEach(key => {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          changes.push(`${key}: ${JSON.stringify(before[key])} → ${JSON.stringify(after[key])}`);
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
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all administrative actions and system events. Read-only access.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total entries: {logs.length}{hasMore && '+'}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Changes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{log.timestamp.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{log.actorEmail || 'System'}</div>
                    {log.actorUid && (
                      <div className="text-xs text-gray-500 font-mono">
                        {log.actorUid.substring(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.resource}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.targetEmail || log.targetUid ? (
                      <div>
                        <div>{log.targetEmail || 'N/A'}</div>
                        {log.targetUid && (
                          <div className="text-xs font-mono">
                            {log.targetUid.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {formatDiff(log.before, log.after) || 'No changes recorded'}
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
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMoreLogs}
            disabled={loadingMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loadingMore && <LoadingSpinner size="sm" />}
            {loadingMore ? 'Loading...' : 'Load More'}
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

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Audit Log Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <div className="mt-1 text-sm text-gray-900">
                  {log.timestamp.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Actor</label>
              <div className="mt-1 text-sm text-gray-900">
                <div>{log.actorEmail || 'System'}</div>
                {log.actorUid && (
                  <div className="text-xs text-gray-500 font-mono">{log.actorUid}</div>
                )}
              </div>
            </div>

            {(log.targetEmail || log.targetUid) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Target</label>
                <div className="mt-1 text-sm text-gray-900">
                  <div>{log.targetEmail || 'N/A'}</div>
                  {log.targetUid && (
                    <div className="text-xs text-gray-500 font-mono">{log.targetUid}</div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Resource</label>
              <div className="mt-1 text-sm text-gray-900">{log.resource}</div>
            </div>

            {(log.before || log.after) && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Changes</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.before && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Before</div>
                      <pre className="text-xs bg-red-50 p-2 rounded border overflow-auto max-h-32">
                        {JSON.stringify(log.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.after && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">After</div>
                      <pre className="text-xs bg-green-50 p-2 rounded border overflow-auto max-h-32">
                        {JSON.stringify(log.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {log.metadata && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Metadata</label>
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPanel;
