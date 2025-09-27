import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { 
  MoreHorizontal, 
  UserPlus, 
  UserX, 
  Trash2, 
  Eye,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import type { WaitlistEntry, WaitlistStatus } from '../../pages/admin/waitlist';

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  loading: boolean;
  selectedEntries: Set<string>;
  onEntrySelect: (entryId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEntryClick: (entry: WaitlistEntry) => void;
  onInvite: (entryId: string) => void;
  onReject: (entryId: string) => void;
  onDelete: (entryId: string) => void;
}

const WaitlistTable: React.FC<WaitlistTableProps> = ({
  entries,
  loading,
  selectedEntries,
  onEntrySelect,
  onSelectAll,
  onEntryClick,
  onInvite,
  onReject,
  onDelete,
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);

  // Get status badge variant
  const getStatusBadgeVariant = (status: WaitlistStatus) => {
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
  const getStatusColor = (status: WaitlistStatus) => {
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

  // Handle action menu toggle
  const handleActionMenuToggle = (entryId: string) => {
    setActionMenuOpen(actionMenuOpen === entryId ? null : entryId);
  };

  // Handle delete confirmation
  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmOpen(entryId);
    setActionMenuOpen(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (entryId: string) => {
    await onDelete(entryId);
    setDeleteConfirmOpen(null);
  };

  // Handle row click
  const handleRowClick = (entry: WaitlistEntry, event: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger if clicking on checkbox or action button
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }
    onEntryClick(entry);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-neutral-600 mt-2">Loading waitlist entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center">
        <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No entries found</h3>
        <p className="text-neutral-600">
          {selectedEntries.size > 0 
            ? 'No entries match your current filters'
            : 'No waitlist entries have been submitted yet'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={selectedEntries.size === entries.length && entries.length > 0}
                indeterminate={selectedEntries.size > 0 && selectedEntries.size < entries.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="hover:bg-neutral-50 cursor-pointer transition-colors"
              onClick={(e) => handleRowClick(entry, e)}
            >
              {/* Checkbox */}
              <td className="px-6 py-4">
                <Checkbox
                  checked={selectedEntries.has(entry.id)}
                  onChange={(e) => onEntrySelect(entry.id, e.target.checked)}
                  className="h-4 w-4"
                />
              </td>

              {/* Email */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {entry.email}
                    </div>
                    {entry.name && (
                      <div className="text-sm text-neutral-500">
                        {entry.name}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Source */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-sm text-neutral-900">
                    {entry.source || 'Unknown'}
                  </span>
                  {entry.utm?.source && (
                    <span className="ml-2 text-xs text-neutral-500">
                      ({entry.utm.source})
                    </span>
                  )}
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <Badge
                  variant={getStatusBadgeVariant(entry.status)}
                  className={`${getStatusColor(entry.status)} border`}
                >
                  {entry.status}
                </Badge>
              </td>

              {/* Created */}
              <td className="px-6 py-4">
                <div className="text-sm text-neutral-900">
                  {formatDate(entry.createdAt)}
                </div>
              </td>

              {/* Notes */}
              <td className="px-6 py-4">
                <div className="text-sm text-neutral-900 max-w-xs truncate">
                  {entry.notes || '-'}
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* Quick Actions */}
                  {entry.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onInvite(entry.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onReject(entry.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Action Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionMenuToggle(entry.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Dropdown Menu */}
                    {actionMenuOpen === entry.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-10">
                        <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEntryClick(entry);
                        setActionMenuOpen(null);
                      }}
                          >
                            <Eye className="h-4 w-4 mr-3" />
                            View Details
                          </button>
                          
                          {entry.status === 'pending' && (
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onInvite(entry.id);
                                setActionMenuOpen(null);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-3" />
                              Send Invite
                            </button>
                          )}
                          
                          {entry.status === 'pending' && (
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReject(entry.id);
                                setActionMenuOpen(null);
                              }}
                            >
                              <UserX className="h-4 w-4 mr-3" />
                              Reject Entry
                            </button>
                          )}
                          
                          <div className="border-t border-neutral-200 my-1"></div>
                          
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(entry.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-3" />
                            Delete Entry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Delete Waitlist Entry
            </h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this waitlist entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmOpen(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirm(deleteConfirmOpen)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistTable;
