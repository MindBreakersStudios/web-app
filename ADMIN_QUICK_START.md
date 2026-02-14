# Admin Dashboard - Quick Start Guide

## 1. Grant Admin Access

```sql
UPDATE users SET role = 'admin' WHERE id = 'USER_UUID';
```

## 2. Configure Server RCON

```sql
UPDATE servers
SET
  rcon_host = '127.0.0.1',
  rcon_port = 27015,
  rcon_password_encrypted = 'YOUR_ENCRYPTED_PASSWORD',
  rcon_enabled = true
WHERE slug = 'your-server-slug';
```

## 3. Access Admin Dashboard

Navigate to: **http://localhost:5173/admin/server-control**

## 4. Use Components

```tsx
import {
  ServerStatsCard,
  QuickActions,
  CommandHistory
} from '@/components/admin';

function MyPage() {
  const serverId = 'server-uuid';
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ServerStatsCard serverId={serverId} />
      <QuickActions
        serverId={serverId}
        onCommandCreated={() => setRefreshTrigger(prev => prev + 1)}
      />
      <div className="lg:col-span-2">
        <CommandHistory serverId={serverId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
```

## 5. Available Actions

- **Restart Server**: `restart` command
- **Announce**: `announce <message>` command
- **Kick Player**: `kick <player> [reason]` command
- **Custom Command**: Any RCON command

## 6. Status Flow

1. User executes command → Status: `pending`
2. Service picks up command → Status: `processing`
3. RCON executes → Status: `completed` or `failed`
4. UI updates automatically via real-time subscription

## 7. Important Files

- **Main Page**: `/src/pages/admin/ServerControl.tsx`
- **Components**: `/src/components/admin/*.tsx`
- **API Functions**: `/src/lib/api/server-commands.ts`
- **Database Schema**: `/supabase/migrations/20260213000001_rcon_command_queue.sql`
- **Services**: `/services/rcon-executor/` and `/services/stats-sync/`

## 8. Check Services

```bash
# View running services
pm2 list

# View logs
pm2 logs rcon-executor
pm2 logs stats-sync
```

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| No servers showing | Check `rcon_enabled = true` in database |
| Commands not executing | Check `pm2 list` - ensure services running |
| Stats not updating | Check `pm2 logs stats-sync` for errors |
| Access denied | Verify user role is 'admin' or 'super_admin' |

## 10. API Reference

```typescript
import {
  // Data fetching
  getServerStats,
  getCommandHistory,
  getAllServersStats,

  // Command operations
  createServerCommand,
  getCommandStatus,
  cancelCommand,

  // Real-time subscriptions
  subscribeToServerStats,
  subscribeToCommandStatus,
  subscribeToServerCommands,

  // Utilities
  formatCommandStatus,
  getStatusColor,
  isCommandFinished,
  getCommandDuration,
} from '@/lib/api';
```

## Complete Example

```tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  ServerStatsCard,
  QuickActions,
  CommandHistory
} from '@/components/admin';

export const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [serverId] = useState('your-server-uuid');
  const [refresh, setRefresh] = useState(0);

  // Protect route
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Server Control</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <ServerStatsCard serverId={serverId} />
        <QuickActions
          serverId={serverId}
          onCommandCreated={() => setRefresh(prev => prev + 1)}
        />
      </div>

      <CommandHistory serverId={serverId} refreshTrigger={refresh} />
    </div>
  );
};
```

## Need Help?

- Full Documentation: `/src/pages/admin/README.md`
- Usage Guide: `/src/components/admin/USAGE.md`
- Summary: `/web-app/ADMIN_DASHBOARD_SUMMARY.md`
