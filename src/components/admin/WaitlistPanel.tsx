import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  status: 'pending' | 'active' | 'invited';
  createdAt: Date;
  locale?: string;
  comms?: {
    confirmation?: {
      sent: boolean;
      sentAt: Date | null;
    };
  };
}

type WaitlistStatus = 'all' | 'pending' | 'active' | 'invited';

const WaitlistPanel: React.FC = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WaitlistStatus>('all');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!db) return;

    const waitlistRef = collection(db, 'waitlist');
    let q = query(waitlistRef, orderBy('createdAt', 'desc'));

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      q = query(
        waitlistRef,
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, snapshot => {
      const waitlistEntries: WaitlistEntry[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        waitlistEntries.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          locale: data.locale || data.language,
          comms: data.comms
            ? {
                ...data.comms,
                confirmation: data.comms.confirmation
                  ? {
                      ...data.comms.confirmation,
                      sentAt: data.comms.confirmation.sentAt?.toDate() || null,
                    }
                  : undefined,
              }
            : undefined,
        });
      });
      setEntries(waitlistEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const filteredEntries = entries.filter(
    entry =>
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.name &&
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      const csvContent = [
        // Header row
        [
          'Email',
          'Name',
          'Status',
          'Created At',
          'Locale',
          'Confirmation Sent',
        ].join(','),
        // Data rows
        ...filteredEntries.map(entry =>
          [
            `"${entry.email}"`,
            `"${entry.name || ''}"`,
            `"${entry.status}"`,
            `"${entry.createdAt.toISOString()}"`,
            `"${entry.locale || ''}"`,
            `"${entry.comms?.confirmation?.sent ? 'Yes' : 'No'}"`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className='p-6 flex justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>
            Waitlist Management
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            View and manage waitlist entries. Total entries: {entries.length}
          </p>
        </div>
        <div className='text-sm text-gray-500'>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-gray-50 rounded-lg p-4'>
          <div className='text-2xl font-bold text-gray-900'>
            {entries.length}
          </div>
          <div className='text-sm text-gray-600'>Total</div>
        </div>
        <div className='bg-yellow-50 rounded-lg p-4'>
          <div className='text-2xl font-bold text-yellow-800'>
            {statusCounts.pending || 0}
          </div>
          <div className='text-sm text-yellow-600'>Pending</div>
        </div>
        <div className='bg-green-50 rounded-lg p-4'>
          <div className='text-2xl font-bold text-green-800'>
            {statusCounts.active || 0}
          </div>
          <div className='text-sm text-green-600'>Active</div>
        </div>
        <div className='bg-blue-50 rounded-lg p-4'>
          <div className='text-2xl font-bold text-blue-800'>
            {statusCounts.invited || 0}
          </div>
          <div className='text-sm text-blue-600'>Invited</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='flex-1'>
          <input
            type='text'
            placeholder='Search by email or name...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div className='flex gap-2'>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as WaitlistStatus)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='active'>Active</option>
            <option value='invited'>Invited</option>
          </select>
          <button
            onClick={exportToCSV}
            disabled={isExporting || filteredEntries.length === 0}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {isExporting && <LoadingSpinner size='sm' />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg'>
        <table className='min-w-full divide-y divide-gray-300'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Joined
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Confirmation
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Locale
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                  {searchTerm || statusFilter !== 'all'
                    ? 'No entries found matching your filters.'
                    : 'No waitlist entries found.'}
                </td>
              </tr>
            ) : (
              filteredEntries.map(entry => (
                <tr key={entry.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {entry.name || 'No name provided'}
                      </div>
                      <div className='text-sm text-gray-500'>{entry.email}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <div>{entry.createdAt.toLocaleDateString()}</div>
                    <div className='text-xs text-gray-400'>
                      {entry.createdAt.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {entry.comms?.confirmation?.sent ? (
                      <div className='text-green-600'>
                        <div>✓ Sent</div>
                        {entry.comms.confirmation.sentAt && (
                          <div className='text-xs text-gray-400'>
                            {entry.comms.confirmation.sentAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='text-gray-400'>Not sent</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {entry.locale || 'Not set'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredEntries.length > 0 && (
        <div className='mt-4 text-sm text-gray-500 text-center'>
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      )}
    </div>
  );
};

export default WaitlistPanel;
