import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminRouteGuard from '../../components/AdminRouteGuard';
import WaitlistTable from '../../components/admin/WaitlistTable';
import WaitlistDrawer from '../../components/admin/WaitlistDrawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Download, UserPlus, UserX, RefreshCw } from 'lucide-react';
import { useToastContext } from '../../components/ToastProvider';

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
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
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  userAgent?: string;
  ip?: string;
}

export type WaitlistStatus =
  | 'pending'
  | 'confirmed'
  | 'invited'
  | 'blocked'
  | 'rejected'
  | 'active';

const AdminWaitlistPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToastContext();

  // State management
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WaitlistStatus | 'all'>(
    'all'
  );
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    hasNext: false,
    hasPrev: false,
    total: 0,
  });
  // const [lastDoc, setLastDoc] = useState<any>(null);
  // const [firstDoc, setFirstDoc] = useState<any>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load waitlist entries
  const loadEntries = useCallback(
    async (_reset = false) => {
      if (!user?.hasRole(['admin', 'superadmin', 'support'])) return;

      setLoading(true);
      try {
        // This would be replaced with actual Firestore query
        // For now, using mock data
        const mockEntries: WaitlistEntry[] = [
          {
            id: '1',
            email: 'john@example.com',
            name: 'John Doe',
            source: 'Website',
            status: 'pending',
            createdAt: new Date('2024-01-15'),
            notes: 'Interested in premium features',
            utm: { source: 'google', medium: 'cpc', campaign: 'brand' },
          },
          {
            id: '2',
            email: 'jane@example.com',
            name: 'Jane Smith',
            source: 'Social Media',
            status: 'invited',
            createdAt: new Date('2024-01-14'),
            utm: {
              source: 'facebook',
              medium: 'social',
              campaign: 'awareness',
            },
          },
          {
            id: '3',
            email: 'bob@example.com',
            name: 'Bob Johnson',
            source: 'Referral',
            status: 'confirmed',
            createdAt: new Date('2024-01-13'),
            notes: 'Referred by existing customer',
          },
        ];

        setEntries(mockEntries);
        setPagination(prev => ({
          ...prev,
          total: mockEntries.length,
          hasNext: false,
          hasPrev: false,
        }));
      } catch {
        console.error('Error loading waitlist entries');
        toast({
          title: 'Error',
          description: 'Failed to load waitlist entries',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [user, toast]
  );

  // Load entries when dependencies change
  useEffect(() => {
    loadEntries(true);
  }, [loadEntries, debouncedSearch, selectedStatus]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle status filter
  const handleStatusFilter = (status: WaitlistStatus | 'all') => {
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
      setSelectedEntries(new Set(entries.map(entry => entry.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  // Handle row actions
  const handleInvite = async (_entryId: string) => {
    try {
      // TODO: Implement invite logic
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
      await loadEntries();
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
      // TODO: Implement reject logic
      toast({
        title: 'Success',
        description: 'Entry rejected successfully',
      });
      await loadEntries();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reject entry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (_entryId: string) => {
    try {
      // TODO: Implement delete logic
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      await loadEntries();
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
      await loadEntries();
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
      await loadEntries();
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

  // Status options
  const statusOptions: {
    value: WaitlistStatus | 'all';
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

  return (
    <AdminRouteGuard>
      <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-neutral-900'>
                  Waitlist Management
                </h1>
                <p className='text-neutral-600 mt-2'>
                  Manage waitlist entries, send invitations, and track user
                  onboarding
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => loadEntries(true)}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button variant='secondary' size='sm'>
                  <Download className='h-4 w-4 mr-2' />
                  Export
                </Button>
              </div>
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
                    placeholder='Search by email or domain...'
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

          {/* Table */}
          <div className='bg-white rounded-lg shadow-sm border border-neutral-200'>
            <WaitlistTable
              entries={entries}
              loading={loading}
              selectedEntries={selectedEntries}
              onEntrySelect={handleEntrySelect}
              onSelectAll={handleSelectAll}
              onEntryClick={handleEntryClick}
              onInvite={handleInvite}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          </div>

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-neutral-600'>
              Showing {entries.length} of {pagination.total} entries
            </div>
            <div className='flex gap-2'>
              <Button
                variant='secondary'
                size='sm'
                disabled={!pagination.hasPrev || loading}
                onClick={() => {
                  // TODO: Implement previous page
                }}
              >
                Previous
              </Button>
              <Button
                variant='secondary'
                size='sm'
                disabled={!pagination.hasNext || loading}
                onClick={() => {
                  // TODO: Implement next page
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Right Drawer */}
        <WaitlistDrawer
          entry={selectedEntry}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </AdminRouteGuard>
  );
};

export default AdminWaitlistPage;
