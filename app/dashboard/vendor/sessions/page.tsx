'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useSessions } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Power } from 'lucide-react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SessionsPage() {
  const { user } = useAuthStore();
  const { data: sessions, isLoading } = useSessions(user?.vendorId);
  const { toast } = useToast();
  const [kickSessionId, setKickSessionId] = useState<string | null>(null);
  const [isKickingSession, setIsKickingSession] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeSessions = sessions?.filter((s) => s.status === 'active').length || 0;
  const disconnectedSessions = sessions?.filter((s) => s.status === 'disconnected').length || 0;
  const totalBandwidth = sessions?.reduce((sum, s) => sum + s.bytesDownloaded + s.bytesUploaded, 0) || 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const paginatedSessions = useMemo(() => {
    if (!sessions) return { sessions: [], totalPages: 0, totalCount: 0 };
    
    const filtered = sessions.filter((session) => {
      const matchesSearch =
        session.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.routerId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return {
      sessions: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [sessions, searchTerm, statusFilter, currentPage]);

  const formatBytes = (bytes: number) => {
    const gb = (bytes / 1024 / 1024 / 1024).toFixed(2);
    return `${gb} GB`;
  };

  const handleKickSession = async () => {
    setIsKickingSession(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast({
        title: 'Success',
        description: 'User session terminated.',
      });
      setKickSessionId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to kick session.',
        variant: 'destructive',
      });
    } finally {
      setIsKickingSession(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Active Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time user sessions monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold text-green-500">{activeSessions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Disconnected</p>
              <p className="text-2xl font-bold text-muted-foreground">{disconnectedSessions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Bandwidth</p>
              <p className="text-2xl font-bold text-foreground">{formatBytes(totalBandwidth)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <SearchFilterControls
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by username or router ID..."
        filters={[
          {
            value: statusFilter,
            onValueChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
            placeholder: "Filter Status",
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Disconnected", value: "disconnected" },
            ],
          },
        ]}
      />

      {/* Sessions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Router
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Duration (min)
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Download
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Upload
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading sessions...
                    </td>
                  </tr>
                ) : paginatedSessions.sessions && paginatedSessions.sessions.length > 0 ? (
                  paginatedSessions.sessions.map((session) => (
                    <tr key={session.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground font-semibold">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${session.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {session.username}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{session.routerId}</td>
                      <td className="py-3 px-4 text-foreground">{session.duration}</td>
                      <td className="py-3 px-4 text-foreground">
                        {(session.bytesDownloaded / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {(session.bytesUploaded / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            session.status === 'active'
                              ? 'bg-green-500/20 text-green-500 border-0'
                              : 'bg-red-500/20 text-red-500 border-0'
                          }
                        >
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {session.status === 'active' && (
                          <Dialog open={kickSessionId === session.id} onOpenChange={(open) => !open && setKickSessionId(null)}>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => setKickSessionId(session.id)}
                                className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                              >
                                <Power className="w-4 h-4" />
                                <span className="text-xs">Kick</span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                              <DialogHeader>
                                <DialogTitle>Disconnect User: {session.username}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Are you sure you want to disconnect this user session? They can reconnect immediately.
                                </p>
                                <div className="bg-background/50 p-3 rounded-lg text-xs">
                                  <p><span className="text-muted-foreground">Username:</span> <span className="font-semibold">{session.username}</span></p>
                                  <p><span className="text-muted-foreground">Router:</span> <span className="font-semibold">{session.routerId}</span></p>
                                  <p><span className="text-muted-foreground">Duration:</span> <span className="font-semibold">{session.duration} min</span></p>
                                  <p><span className="text-muted-foreground">Downloaded:</span> <span className="font-semibold">{(session.bytesDownloaded / 1024 / 1024).toFixed(2)} MB</span></p>
                                </div>
                              </div>
                              <DialogFooter className="gap-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button
                                  variant="destructive"
                                  onClick={handleKickSession}
                                  disabled={isKickingSession}
                                >
                                  {isKickingSession ? 'Disconnecting...' : 'Disconnect'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No sessions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={paginatedSessions.totalPages}
            totalItems={paginatedSessions.totalCount}
            itemsLabel="sessions"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
