import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  UserPlus,
  X,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../ToastProvider';
import { db } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import WaitlistDrawer from './WaitlistDrawer';

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

// Helper function to safely convert Firestore timestamps to Date
const safeToDate = (timestamp: unknown): Date | null => {
  if (!timestamp) return null;
  
  try {
    // If it's already a Date, return it
    if (timestamp instanceof Date) {
      return isValid(timestamp) ? timestamp : null;
    }
    
    // If it's a Firestore Timestamp, convert it
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
      const date = (timestamp as any).toDate();
      return isValid(date) ? date : null;
    }
    
    // If it's a number (milliseconds), create Date
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isValid(date) ? date : null;
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isValid(date) ? date : null;
    }
    
    return null;
  } catch (error) {
    console.warn('Error converting timestamp to date:', error);
    return null;
  }
};

type WaitlistStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'invited'
  | 'blocked'
  | 'rejected'
  | 'active';

const WaitlistPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToastContext();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WaitlistStatus>('all');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(
    null
  );

  // Fetch waitlist entries
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const waitlistEntries: WaitlistEntry[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || '',
            name: data.name || null,
            source: data.source || 'Unknown',
            status: data.status || 'pending',
            createdAt: safeToDate(data.createdAt) || new Date(),
            notes: data.notes || '',
            locale: data.locale || 'en',
            utm: data.utm || {},
            userAgent: data.userAgent || '',
            ip: data.ip || '',
            comms: data.comms ? {
            ...data.comms,
            confirmation: data.comms.confirmation ? {
              sent: data.comms.confirmation.sent || false,
              sentAt: safeToDate(data.comms.confirmation.sentAt)
            } : undefined
          } : {},
          };
        });
        setEntries(waitlistEntries);
        setLoading(false);
      },
      error => {
        console.error('Error fetching waitlist entries:', error);
        setEntries([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter entries based on search and status
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch =
        entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.name &&
          entry.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.source &&
          entry.source.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        selectedStatus === 'all' || entry.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, selectedStatus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status: WaitlistStatus) => {
    setSelectedStatus(status);
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, entryId]);
    } else {
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleInvite = async () => {
    try {
      // TODO: Implement invite functionality
      toast({
        title: 'Invite Sent',
        description: 'Invitation sent successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    try {
      // TODO: Implement reject functionality
      toast({
        title: 'Entry Rejected',
        description: 'Waitlist entry has been rejected',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error rejecting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject entry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      if (!db) {
        toast({
          title: 'Error',
          description: 'Database not initialized',
          variant: 'destructive',
        });
        return;
      }

      // Check if user has platform admin role
      const hasPlatformAdmin = user?.roles?.includes('superadmin') || false;

      if (!hasPlatformAdmin) {
        toast({
          title: 'Permission Denied',
          description:
            'You need superadmin privileges to delete waitlist entries',
          variant: 'destructive',
        });
        setDeleteConfirmOpen(null);
        return;
      }

      await deleteDoc(doc(db, 'waitlist', entryId));
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      setDeleteConfirmOpen(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkInvite = async () => {
    try {
      // TODO: Implement bulk invite functionality
      toast({
        title: 'Bulk Invite Sent',
        description: `Invitations sent to ${selectedEntries.length} entries`,
        variant: 'success',
      });
      setSelectedEntries([]);
    } catch (error) {
      console.error('Error sending bulk invites:', error);
      toast({
        title: 'Error',
        description: 'Failed to send bulk invitations',
        variant: 'destructive',
      });
    }
  };

  const handleBulkReject = async () => {
    try {
      // TODO: Implement bulk reject functionality
      toast({
        title: 'Bulk Reject Complete',
        description: `${selectedEntries.length} entries have been rejected`,
        variant: 'success',
      });
      setSelectedEntries([]);
    } catch (error) {
      console.error('Error rejecting bulk entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject entries',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Source', 'Status', 'Created At', 'Notes'],
      ...filteredEntries.map(entry => [
        entry.email,
        entry.name || '',
        entry.source || '',
        entry.status,
        format(entry.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        entry.notes || '',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'primary';
      case 'invited':
        return 'success';
      case 'active':
        return 'success';
      case 'rejected':
        return 'error';
      case 'blocked':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const statusOptions: {
    value: WaitlistStatus;
    label: string;
    count: number;
  }[] = [
    { value: 'all', label: 'All', count: entries.length },
    {
      value: 'pending',
      label: 'Pending',
      count: entries.filter(e => e.status === 'pending').length,
    },
    {
      value: 'confirmed',
      label: 'Confirmed',
      count: entries.filter(e => e.status === 'confirmed').length,
    },
    {
      value: 'invited',
      label: 'Invited',
      count: entries.filter(e => e.status === 'invited').length,
    },
    {
      value: 'active',
      label: 'Active',
      count: entries.filter(e => e.status === 'active').length,
    },
    {
      value: 'rejected',
      label: 'Rejected',
      count: entries.filter(e => e.status === 'rejected').length,
    },
    {
      value: 'blocked',
      label: 'Blocked',
      count: entries.filter(e => e.status === 'blocked').length,
    },
  ];

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin text-primary-600' />
        <span className='ml-2 text-gray-600'>Loading waitlist entries...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Waitlist Management
          </h2>
          <p className='text-gray-600'>
            Manage waitlist entries and send invitations
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button
            variant='secondary'
            onClick={handleExportCSV}
            disabled={filteredEntries.length === 0}
          >
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search by email, name, or source...'
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <span className='text-sm text-gray-600'>Filter:</span>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className='flex flex-wrap gap-2'>
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleStatusFilter(option.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === option.value
                ? 'bg-primary-100 text-primary-800 border border-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-primary-800'>
              {selectedEntries.length} entries selected
            </span>
            <div className='flex items-center space-x-2'>
              <Button variant='secondary' size='sm' onClick={handleBulkInvite}>
                <UserPlus className='h-4 w-4 mr-1' />
                Invite Selected
              </Button>
              <Button variant='secondary' size='sm' onClick={handleBulkReject}>
                <X className='h-4 w-4 mr-1' />
                Reject Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left'>
                  <Checkbox
                    checked={
                      selectedEntries.length === filteredEntries.length &&
                      filteredEntries.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Source
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Confirmation
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    {searchQuery || selectedStatus !== 'all'
                      ? 'No entries match your filters'
                      : 'No waitlist entries found'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onChange={e =>
                          handleSelectEntry(entry.id, e.target.checked)
                        }
                      />
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {entry.email}
                        </div>
                        {entry.name && (
                          <div className='text-sm text-gray-500'>
                            {entry.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {entry.source}
                    </td>
                    <td className='px-6 py-4'>
                      <Badge variant={getStatusBadgeColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {format(entry.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {entry.comms?.confirmation?.sent ? (
                        <span className='text-green-600'>
                          Sent{' '}
                          {entry.comms.confirmation.sentAt
                            ? format(entry.comms.confirmation.sentAt, 'MMM dd')
                            : ''}
                        </span>
                      ) : (
                        <span className='text-gray-400'>Not sent</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-medium'>
                      <div className='flex items-center justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewDetails(entry)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <div className='relative'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const menu = document.getElementById(
                                `menu-${entry.id}`
                              );
                              if (menu) {
                                menu.classList.toggle('hidden');
                              }
                            }}
                          >
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                          <div
                            id={`menu-${entry.id}`}
                            className='hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200'
                          >
                            <div className='py-1'>
                              <button
                                className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                onClick={() => handleInvite()}
                              >
                                <UserPlus className='h-4 w-4 mr-3' />
                                Send Invite
                              </button>
                              <button
                                className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                onClick={() => handleReject()}
                              >
                                <X className='h-4 w-4 mr-3' />
                                Reject Entry
                              </button>
                              {(user?.roles?.includes('superadmin') ||
                                false) && (
                                <button
                                  className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                                  onClick={() => {
                                    setDeleteConfirmOpen(entry.id);
                                    const menu = document.getElementById(
                                      `menu-${entry.id}`
                                    );
                                    if (menu) {
                                      menu.classList.add('hidden');
                                    }
                                  }}
                                >
                                  <Trash2 className='h-4 w-4 mr-3' />
                                  Delete Entry
                                </button>
                              )}
                            </div>
                          </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Delete Waitlist Entry
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete this waitlist entry? This action
              cannot be undone.
            </p>
            <div className='flex justify-end space-x-3'>
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

      {/* Waitlist Drawer */}
      <WaitlistDrawer
        entry={selectedEntry}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default WaitlistPanel;




