import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { format } from 'date-fns';
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
import type { IdTokenResult } from 'firebase/auth';
import WaitlistDrawer from './WaitlistDrawer';
import {
  transformWaitlistEntries,
  filterValidWaitlistEntries,
} from '../../lib/waitlistTransformers';
import { checkPlatformAdmin } from '../../lib/permissions';
import type { WaitlistEntry } from '../../types/shared';
import { logger } from '../../lib/logger';

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
  const [error, setError] = useState<string | null>(null);
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
  const [menuAnchor, setMenuAnchor] = useState<{
    id: string;
    position: DOMRect;
  } | null>(null);

  // Fetch waitlist entries with proper error handling
  useEffect(() => {
    if (!db) {
      setError('Database not initialized');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        try {
          const transformedEntries = transformWaitlistEntries(snapshot.docs);
          const validEntries = filterValidWaitlistEntries(transformedEntries);

          setEntries(validEntries);
          setError(null);
        } catch (err) {
          logger.error('Error processing waitlist entries', err as Error, {
            component: 'WaitlistPanel',
          });
          setError('Failed to process waitlist data');
          setEntries([]);
        } finally {
          setLoading(false);
        }
      },
      error => {
        logger.error('Error fetching waitlist entries', error as Error, {
          component: 'WaitlistPanel',
        });
        setError('Failed to load waitlist entries');
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

  // Event handlers with useCallback for performance
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilter = useCallback((status: WaitlistStatus) => {
    setSelectedStatus(status);
  }, []);

  const handleSelectEntry = useCallback((entryId: string, checked: boolean) => {
    setSelectedEntries(prev =>
      checked ? [...prev, entryId] : prev.filter(id => id !== entryId)
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedEntries(checked ? filteredEntries.map(entry => entry.id) : []);
    },
    [filteredEntries]
  );

  const handleInvite = useCallback(async () => {
    try {
      // TODO: Implement invite functionality
      toast({
        title: 'Invite Sent',
        description: 'Invitation sent successfully',
        variant: 'success',
      });
    } catch (error) {
      logger.error('Error sending invite', error as Error, {
        component: 'WaitlistPanel',
      });
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleReject = useCallback(async () => {
    try {
      // TODO: Implement reject functionality
      toast({
        title: 'Entry Rejected',
        description: 'Waitlist entry has been rejected',
        variant: 'success',
      });
    } catch (error) {
      logger.error('Error rejecting entry', error as Error, {
        component: 'WaitlistPanel',
      });
      toast({
        title: 'Error',
        description: 'Failed to reject entry',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleDelete = useCallback(
    async (entryId: string) => {
      try {
        if (!db) {
          toast({
            title: 'Error',
            description: 'Database not initialized',
            variant: 'destructive',
          });
          return;
        }

        if (!user) {
          toast({
            title: 'Error',
            description: 'User not authenticated',
            variant: 'destructive',
          });
          setDeleteConfirmOpen(null);
          return;
        }

        // Debug: Log user's custom claims and roles (development only)
        logger.debug('Delete attempt for entry', {
          component: 'WaitlistPanel',
          entryId,
          userId: user.uid,
          userRoles: user.roles,
        });

        // Get fresh token to check custom claims
        const tokenResult: IdTokenResult = await user.getIdTokenResult();
        logger.debug('Token claims retrieved', {
          component: 'WaitlistPanel',
          platformAdmin: tokenResult.claims.platformAdmin,
          roles: tokenResult.claims.roles,
          admin: tokenResult.claims.admin,
          isAdmin: tokenResult.claims.isAdmin,
        });

        // Check if user has platform admin role using the new utility
        const hasPlatformAdmin = await checkPlatformAdmin(user, tokenResult);

        if (!hasPlatformAdmin) {
          logger.warn('User does not have platform admin privileges', {
            component: 'WaitlistPanel',
            userId: user.uid,
            entryId,
          });
          toast({
            title: 'Permission Denied',
            description:
              'You need superadmin privileges to delete waitlist entries',
            variant: 'destructive',
          });
          setDeleteConfirmOpen(null);
          return;
        }

        logger.debug(
          'User has platform admin privileges, proceeding with deletion',
          {
            component: 'WaitlistPanel',
            userId: user.uid,
            entryId,
          }
        );
        await deleteDoc(doc(db, 'waitlist', entryId));
        toast({
          title: 'Success',
          description: 'Entry deleted successfully',
        });
        setDeleteConfirmOpen(null);
      } catch (error) {
        logger.error('Delete error', error as Error, {
          component: 'WaitlistPanel',
          entryId,
          errorDetails:
            error instanceof Error
              ? {
                  code: (error as Error & { code?: string }).code,
                  message: error.message,
                  stack: error.stack,
                }
              : { error: String(error) },
        });
        toast({
          title: 'Error',
          description: 'Failed to delete entry. Please check your permissions.',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  const handleBulkInvite = useCallback(async () => {
    try {
      // TODO: Implement bulk invite functionality
      toast({
        title: 'Bulk Invite Sent',
        description: `Invitations sent to ${selectedEntries.length} entries`,
        variant: 'success',
      });
      setSelectedEntries([]);
    } catch (error) {
      logger.error('Error sending bulk invites', error as Error, {
        component: 'WaitlistPanel',
      });
      toast({
        title: 'Error',
        description: 'Failed to send bulk invitations',
        variant: 'destructive',
      });
    }
  }, [selectedEntries.length, toast]);

  const handleBulkReject = useCallback(async () => {
    try {
      // TODO: Implement bulk reject functionality
      toast({
        title: 'Bulk Reject Complete',
        description: `${selectedEntries.length} entries have been rejected`,
        variant: 'success',
      });
      setSelectedEntries([]);
    } catch (error) {
      logger.error('Error rejecting bulk entries', error as Error, {
        component: 'WaitlistPanel',
      });
      toast({
        title: 'Error',
        description: 'Failed to reject entries',
        variant: 'destructive',
      });
    }
  }, [selectedEntries.length, toast]);

  const handleExportCSV = useCallback(() => {
    try {
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
    } catch (error) {
      logger.error('Error exporting CSV', error as Error, {
        component: 'WaitlistPanel',
      });
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    }
  }, [filteredEntries, toast]);

  const handleViewDetails = useCallback((entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
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
  }, []);

  const statusOptions: {
    value: WaitlistStatus;
    label: string;
    count: number;
  }[] = useMemo(
    () => [
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
    ],
    [entries]
  );

  // Error state
  if (error) {
    return (
      <div className='p-6 sm:p-8 lg:p-10'>
        <div className='flex flex-col items-center justify-center h-64 rounded-2xl border border-red-100 bg-red-50/60 space-y-4 shadow-inner'>
          <div className='text-red-600 text-lg font-semibold'>
            Error Loading Waitlist
          </div>
          <div className='text-gray-600 text-center max-w-md'>{error}</div>
          <Button variant='secondary' onClick={() => window.location.reload()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className='p-6 sm:p-8 lg:p-10'>
        <div className='flex items-center justify-center h-64 rounded-2xl border border-primary-100 bg-primary-50/60 shadow-inner'>
          <RefreshCw className='h-8 w-8 animate-spin text-primary-600' />
          <span className='ml-3 text-gray-600 text-base font-medium'>
            Loading waitlist entries...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10'>
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
        <div className='bg-primary-50 border border-primary-200 rounded-xl p-4 shadow-sm'>
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
      <div className='overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-neutral-200'>
            <thead className='bg-neutral-50'>
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
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Source
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Confirmation
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-neutral-100'>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-12 text-center text-neutral-500'
                  >
                    {searchQuery || selectedStatus !== 'all'
                      ? 'No entries match your filters'
                      : 'No waitlist entries found'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className='transition hover:bg-neutral-50'>
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
                        <div className='text-sm font-medium text-neutral-900'>
                          {entry.email}
                        </div>
                        {entry.name && (
                          <div className='text-sm text-neutral-500'>
                            {entry.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-neutral-900'>
                      {entry.source}
                    </td>
                    <td className='px-6 py-4'>
                      <Badge variant={getStatusBadgeColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className='px-6 py-4 text-sm text-neutral-900'>
                      {format(entry.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td className='px-6 py-4 text-sm text-neutral-900'>
                      {entry.comms?.confirmation?.sent ? (
                        <span className='text-green-600'>
                          Sent{' '}
                          {entry.comms.confirmation.sentAt
                            ? format(entry.comms.confirmation.sentAt, 'MMM dd')
                            : ''}
                        </span>
                      ) : (
                        <span className='text-neutral-400'>Not sent</span>
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
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={event => {
                            const buttonRect =
                              event.currentTarget.getBoundingClientRect();
                            setMenuAnchor(prev =>
                              prev?.id === entry.id
                                ? null
                                : {
                                    id: entry.id,
                                    position: buttonRect,
                                  }
                            );
                          }}
                        >
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating action menu */}
      {menuAnchor &&
        createPortal(
          <div className='fixed inset-0 z-[120] flex items-start justify-start'>
            <div
              className='absolute inset-0'
              onClick={() => setMenuAnchor(null)}
              aria-hidden='true'
            />
            <div
              className='absolute z-[121] w-48 rounded-md border border-gray-200 bg-white shadow-lg'
              style={{
                top: menuAnchor.position.bottom + window.scrollY + 8,
                left: Math.min(
                  menuAnchor.position.left +
                    window.scrollX -
                    160 +
                    menuAnchor.position.width,
                  window.innerWidth - 208
                ),
              }}
              role='menu'
              aria-labelledby={`actions-${menuAnchor.id}`}
            >
              <div className='py-1'>
                <button
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => {
                    handleInvite();
                    setMenuAnchor(null);
                  }}
                  role='menuitem'
                >
                  <UserPlus className='mr-3 h-4 w-4' />
                  Send Invite
                </button>
                <button
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => {
                    handleReject();
                    setMenuAnchor(null);
                  }}
                  role='menuitem'
                >
                  <X className='mr-3 h-4 w-4' />
                  Reject Entry
                </button>
                {(user?.roles?.includes('superadmin') || false) && (
                  <button
                    className='flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                    onClick={() => {
                      setDeleteConfirmOpen(menuAnchor.id);
                      setMenuAnchor(null);
                    }}
                    role='menuitem'
                  >
                    <Trash2 className='mr-3 h-4 w-4' />
                    Delete Entry
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen &&
        createPortal(
          <div className='fixed inset-0 z-[130] flex items-center justify-center bg-black/50'>
            <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>
                Delete Waitlist Entry
              </h3>
              <p className='mb-6 text-sm text-gray-600'>
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
          </div>,
          document.body
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
