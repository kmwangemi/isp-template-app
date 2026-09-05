import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Router, Wifi, WifiOff } from 'lucide-react';
import { RouterStatus } from '@/lib/api/mockData';
import Link from 'next/link';

interface RouterStatusCardProps {
  router: RouterStatus;
  href?: string;
}

export function RouterStatusCard({ router, href }: RouterStatusCardProps) {
  const StatusIcon = router.status === 'online' ? Wifi : WifiOff;
  const statusColor =
    router.status === 'online' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500';

  const content = (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Router className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{router.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{router.ipAddress}</p>
            </div>
          </div>
          <Badge className={statusColor + ' border-0'}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {router.status.charAt(0).toUpperCase() + router.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-lg font-semibold text-foreground">{router.uptime}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-lg font-semibold text-foreground">{router.activeUsers}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CPU Usage</p>
            <div className="w-full bg-border rounded-full h-2 mt-1">
              <div
                className="bg-chart-1 h-2 rounded-full"
                style={{ width: `${router.cpuUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-foreground mt-1">{router.cpuUsage}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Memory Usage</p>
            <div className="w-full bg-border rounded-full h-2 mt-1">
              <div
                className="bg-chart-2 h-2 rounded-full"
                style={{ width: `${router.memoryUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-foreground mt-1">{router.memoryUsage}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
