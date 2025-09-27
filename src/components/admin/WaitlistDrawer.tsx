import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Globe, 
  Smartphone, 
  MapPin,
  History,
  Save,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import type { WaitlistEntry } from '../../pages/admin/waitlist';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
}

interface WaitlistDrawerProps {
  entry: WaitlistEntry | null;
  open: boolean;
  onClose: () => void;
}

const WaitlistDrawer: React.FC<WaitlistDrawerProps> = ({
  entry,
  open,
  onClose,
}) => {
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Load audit logs when entry changes
  useEffect(() => {
    if (entry && open) {
      loadAuditLogs(entry.id);
      setNotes(entry.notes || '');
    }
  }, [entry, open]);

  // Load audit logs
  const loadAuditLogs = async (_entryId: string) => {
    setLoadingAuditLogs(true);
    try {
      // TODO: Implement actual audit log loading
      // Mock data for now
      const mockAuditLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date('2024-01-15T10:30:00'),
          action: 'created',
          actor: 'System',
          details: 'Waitlist entry created',
        },
        {
          id: '2',
          timestamp: new Date('2024-01-15T11:45:00'),
          action: 'updated',
          actor: 'admin@calendado.com',
          details: 'Added note: Interested in premium features',
        },
        {
          id: '3',
          timestamp: new Date('2024-01-15T14:20:00'),
          action: 'invited',
          actor: 'admin@calendado.com',
          details: 'Invitation sent via email',
        },
      ];
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Handle notes save
  const handleSaveNotes = async () => {
    if (!entry) return;
    
    try {
      // TODO: Implement notes saving
      console.log('Saving notes:', notes);
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Handle notes edit
  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  // Handle notes cancel
  const handleCancelNotes = () => {
    setNotes(entry?.notes || '');
    setIsEditingNotes(false);
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

  if (!entry) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${open ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Waitlist Entry Details
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {entry.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-neutral-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {entry.email}
                      </div>
                      <div className="text-sm text-neutral-500">Email address</div>
                    </div>
                  </div>

                  {entry.name && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-neutral-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {entry.name}
                        </div>
                        <div className="text-sm text-neutral-500">Full name</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-neutral-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {format(entry.createdAt, 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm text-neutral-500">Created date</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-5 w-5 mr-3 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                    </div>
                    <div>
                      <Badge
                        variant={getStatusBadgeVariant(entry.status)}
                        className={`${getStatusColor(entry.status)} border`}
                      >
                        {entry.status}
                      </Badge>
                      <div className="text-sm text-neutral-500 mt-1">Current status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Information */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">
                  Source Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-neutral-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {entry.source || 'Unknown'}
                      </div>
                      <div className="text-sm text-neutral-500">Source</div>
                    </div>
                  </div>

                  {entry.utm && (
                    <div className="space-y-2">
                      {entry.utm.source && (
                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {entry.utm.source}
                            </div>
                            <div className="text-sm text-neutral-500">UTM Source</div>
                          </div>
                        </div>
                      )}

                      {entry.utm.medium && (
                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {entry.utm.medium}
                            </div>
                            <div className="text-sm text-neutral-500">UTM Medium</div>
                          </div>
                        </div>
                      )}

                      {entry.utm.campaign && (
                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {entry.utm.campaign}
                            </div>
                            <div className="text-sm text-neutral-500">UTM Campaign</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {entry.userAgent && (
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-neutral-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900 max-w-xs truncate">
                          {entry.userAgent}
                        </div>
                        <div className="text-sm text-neutral-500">User Agent</div>
                      </div>
                    </div>
                  )}

                  {entry.ip && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-neutral-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {entry.ip}
                        </div>
                        <div className="text-sm text-neutral-500">IP Address</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">
                    Notes
                  </h3>
                  {!isEditingNotes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditNotes}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this waitlist entry..."
                      className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelNotes}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-md">
                    <p className="text-sm text-neutral-900">
                      {entry.notes || 'No notes added yet.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Audit History */}
              <div>
                <div className="flex items-center mb-4">
                  <History className="h-5 w-5 text-neutral-400 mr-2" />
                  <h3 className="text-lg font-medium text-neutral-900">
                  Audit History
                  </h3>
                </div>

                {loadingAuditLogs ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-neutral-600 mt-2">Loading history...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-neutral-600">No audit history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start p-3 bg-neutral-50 rounded-md"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-900">
                              {log.action}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {format(log.timestamp, 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">
                            {log.details}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            by {log.actor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement invite action
                  console.log('Invite entry:', entry.id);
                }}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistDrawer;
