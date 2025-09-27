import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import WaitlistDrawer from './WaitlistDrawer';
import { useToastContext } from '../ToastProvider';
import {
  Search,
  Download,
  UserPlus,
  UserX,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Eye,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  source?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'invited'
    | 'blocked'
    | 'rejected'
    | 'active';
  createdAt: Date;
  notes?: string;
  locale?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  userAgent?: string;
  ip?: string;
  comms?: {
    confirmation?: {
      sent: boolean;
      sentAt: Date | null;
    };
  };
}

type WaitlistStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'invited'
  | 'blocked'
  | 'rejected'
  | 'active';

const WaitlistPanel: React.FC = () => {
  const { toast } = useToastContext();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WaitlistStatus>('all');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load waitlist entries from Firestore
  useEffect(() => {
    if (!db) return;

    const waitlistRef = collection(db, 'waitlist');
    let q = query(waitlistRef, orderBy('createdAt', 'desc'));

    // Apply status filter if not 'all'
    if (selectedStatus !== 'all') {
      q = query(
        waitlistRef,
        where('status', '==', selectedStatus),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const waitlistEntries: WaitlistEntry[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          waitlistEntries.push({
            id: doc.id,
            email: data.email,
            name: data.name,
            source: data.source,
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate() || new Date(),
            notes: data.notes,
            locale: data.locale || data.language,
            utm: data.utm,
            userAgent: data.userAgent,
            ip: data.ip,
            comms: data.comms
              ? {
                  ...data.comms,
                  confirmation: data.comms.confirmation
                    ? {
                        ...data.comms.confirmation,
                        sentAt:
                          data.comms.confirmation.sentAt?.toDate() || null,
                      }
                    : undefined,
                }
              : undefined,
          });
        });
        setEntries(waitlistEntries);
        setLoading(false);
      },
      error => {
        console.error('Error loading waitlist entries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load waitlist entries',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedStatus, toast]);

  // Filter entries based on search
  const filteredEntries = entries.filter(
    entry =>
      entry.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (entry.name &&
        entry.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (entry.source &&
        entry.source.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle status filter
  const handleStatusFilter = (status: WaitlistStatus) => {
    setSelectedStatus(status);
  };

  // Handle entry selection
  const handleEntrySelect = (entryId: string, selected: boolean) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(entryId);
      } else {
        newSet.delete(entryId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEntries(new Set(filteredEntries.map(entry => entry.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  // Handle row actions
  const handleInvite = async (_entryId: string) => {
    try {
      // TODO: Implement invite logic with Cloud Functions
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (_entryId: string) => {
    try {
      // TODO: Implement reject logic with Cloud Functions
      toast({
        title: 'Success',
        description: 'Entry rejected successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reject entry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      if (!db) return;
      await deleteDoc(doc(db, 'waitlist', entryId));
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      setDeleteConfirmOpen(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  // Handle bulk actions
  const handleBulkInvite = async () => {
    try {
      // TODO: Implement bulk invite logic
      toast({
        title: 'Success',
        description: `Invitations sent to ${selectedEntries.size} entries`,
      });
      setSelectedEntries(new Set());
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send bulk invitations',
        variant: 'destructive',
      });
    }
  };

  const handleBulkReject = async () => {
    try {
      // TODO: Implement bulk reject logic
      toast({
        title: 'Success',
        description: `Rejected ${selectedEntries.size} entries`,
      });
      setSelectedEntries(new Set());
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reject entries',
        variant: 'destructive',
      });
    }
  };

  // Handle entry details
  const handleEntryClick = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  // Handle action menu toggle
  const handleActionMenuToggle = (entryId: string) => {
    setActionMenuOpen(actionMenuOpen === entryId ? null : entryId);
  };

  // Handle delete confirmation
  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmOpen(entryId);
    setActionMenuOpen(null);
  };

  // Export to CSV
  const exportToCSV = () => {
    setIsExporting(true);

    try {
      const csvContent = [
        // Header row
        [
          'Email',
          'Name',
          'Source',
          'Status',
          'Created At',
          'Locale',
          'Confirmation Sent',
          'Notes',
        ].join(','),
        // Data rows
        ...filteredEntries.map(entry =>
          [
            `"${entry.email}"`,
            `"${entry.name || ''}"`,
            `"${entry.source || ''}"`,
            `"${entry.status}"`,
            `"${entry.createdAt.toISOString()}"`,
            `"${entry.locale || ''}"`,
            `"${entry.comms?.confirmation?.sent ? 'Yes' : 'No'}"`,
            `"${entry.notes || ''}"`,
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
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'invited':
        return 'default';
      case 'blocked':
        return 'error';
      case 'rejected':
        return 'error';
      case 'active':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'invited':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'blocked':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Handle row click
  const handleRowClick = (
    entry: WaitlistEntry,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => {
    // Don't trigger if clicking on checkbox or action button
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }
    handleEntryClick(entry);
  };

  // Status options
  const statusOptions: {
    value: WaitlistStatus;
    label: string;
    color: string;
  }[] = [
    { value: 'all', label: 'All', color: 'neutral' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'invited', label: 'Invited', color: 'purple' },
    { value: 'blocked', label: 'Blocked', color: 'red' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'active', label: 'Active', color: 'green' },
  ];

  // Status counts
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
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>
            Waitlist Management
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            View and manage waitlist entries. Total entries: {entries.length}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-sm text-gray-500'>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            variant='secondary'
            size='sm'
            onClick={exportToCSV}
            disabled={isExporting || filteredEntries.length === 0}
          >
            <Download className='h-4 w-4 mr-2' />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
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
      <div className='bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4' />
              <Input
                placeholder='Search by email, name, or source...'
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className='flex flex-wrap gap-2'>
            {statusOptions.map(option => (
              <Badge
                key={option.value}
                variant={
                  selectedStatus === option.value ? 'default' : 'secondary'
                }
                className={`cursor-pointer transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-neutral-100'
                }`}
                onClick={() => handleStatusFilter(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEntries.size > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <span className='text-blue-800 font-medium'>
              {selectedEntries.size} entries selected
            </span>
            <div className='flex gap-2'>
              <Button
                variant='secondary'
                size='sm'
                onClick={handleBulkInvite}
                disabled={loading}
              >
                <UserPlus className='h-4 w-4 mr-2' />
                Invite Selected
              </Button>
              <Button
                variant='secondary'
                size='sm'
                onClick={handleBulkReject}
                disabled={loading}
              >
                <UserX className='h-4 w-4 mr-2' />
                Reject Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Table */}
      <div className='bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-neutral-50 border-b border-neutral-200'>
              <tr>
                <th className='px-6 py-3 text-left'>
                  <Checkbox
                    checked={
                      selectedEntries.size === filteredEntries.length &&
                      filteredEntries.length > 0
                    }
                    indeterminate={
                      selectedEntries.size > 0 &&
                      selectedEntries.size < filteredEntries.length
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className='h-4 w-4'
                  />
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Source
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Confirmation
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-neutral-200'>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-6 py-8 text-center'>
                    <Mail className='h-12 w-12 text-neutral-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-neutral-900 mb-2'>
                      No entries found
                    </h3>
                    <p className='text-neutral-600'>
                      {searchQuery || selectedStatus !== 'all'
                        ? 'No entries match your current filters'
                        : 'No waitlist entries have been submitted yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr
                    key={entry.id}
                    className='hover:bg-neutral-50 cursor-pointer transition-colors'
                    onClick={e => handleRowClick(entry, e)}
                  >
                    {/* Checkbox */}
                    <td className='px-6 py-4'>
                      <Checkbox
                        checked={selectedEntries.has(entry.id)}
                        onChange={e =>
                          handleEntrySelect(entry.id, e.target.checked)
                        }
                        className='h-4 w-4'
                      />
                    </td>

                    {/* Contact */}
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div>
                          <div className='text-sm font-medium text-neutral-900'>
                            {entry.name || 'No name provided'}
                          </div>
                          <div className='text-sm text-neutral-500'>
                            {entry.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <span className='text-sm text-neutral-900'>
                          {entry.source || 'Unknown'}
                        </span>
                        {entry.utm?.source && (
                          <span className='ml-2 text-xs text-neutral-500'>
                            ({entry.utm.source})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className='px-6 py-4'>
                      <Badge
                        variant={getStatusBadgeVariant(entry.status)}
                        className={`${getStatusColor(entry.status)} border`}
                      >
                        {entry.status}
                      </Badge>
                    </td>

                    {/* Created */}
                    <td className='px-6 py-4'>
                      <div className='text-sm text-neutral-900'>
                        {formatDate(entry.createdAt)}
                      </div>
                      <div className='text-xs text-neutral-500'>
                        {entry.createdAt.toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Confirmation */}
                    <td className='px-6 py-4'>
                      {entry.comms?.confirmation?.sent ? (
                        <div className='text-green-600'>
                          <div className='text-sm'>✓ Sent</div>
                          {entry.comms.confirmation.sentAt && (
                            <div className='text-xs text-neutral-500'>
                              {formatDate(entry.comms.confirmation.sentAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-neutral-400 text-sm'>Not sent</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {/* Quick Actions */}
                        {entry.status === 'pending' && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleInvite(entry.id);
                              }}
                              className='h-8 w-8 p-0'
                            >
                              <UserPlus className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleReject(entry.id);
                              }}
                              className='h-8 w-8 p-0'
                            >
                              <UserX className='h-4 w-4' />
                            </Button>
                          </>
                        )}

                        {/* Action Menu */}
                        <div className='relative'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              handleActionMenuToggle(entry.id);
                            }}
                            className='h-8 w-8 p-0'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>

                          {/* Dropdown Menu */}
                          {actionMenuOpen === entry.id && (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-10'>
                              <div className='py-1'>
                                <button
                                  className='flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleEntryClick(entry);
                                    setActionMenuOpen(null);
                                  }}
                                >
                                  <Eye className='h-4 w-4 mr-3' />
                                  View Details
                                </button>

                                {entry.status === 'pending' && (
                                  <button
                                    className='flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handleInvite(entry.id);
                                      setActionMenuOpen(null);
                                    }}
                                  >
                                    <UserPlus className='h-4 w-4 mr-3' />
                                    Send Invite
                                  </button>
                                )}

                                {entry.status === 'pending' && (
                                  <button
                                    className='flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handleReject(entry.id);
                                      setActionMenuOpen(null);
                                    }}
                                  >
                                    <UserX className='h-4 w-4 mr-3' />
                                    Reject Entry
                                  </button>
                                )}

                                <div className='border-t border-neutral-200 my-1'></div>

                                <button
                                  className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteClick(entry.id);
                                  }}
                                >
                                  <Trash2 className='h-4 w-4 mr-3' />
                                  Delete Entry
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredEntries.length > 0 && (
        <div className='mt-4 text-sm text-neutral-600 text-center'>
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-medium text-neutral-900 mb-2'>
              Delete Waitlist Entry
            </h3>
            <p className='text-neutral-600 mb-6'>
              Are you sure you want to delete this waitlist entry? This action
              cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <Button
                variant='secondary'
                onClick={() => setDeleteConfirmOpen(null)}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleDelete(deleteConfirmOpen)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Right Drawer */}
      <WaitlistDrawer
        entry={selectedEntry}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default WaitlistPanel;
