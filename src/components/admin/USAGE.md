# Admin Components - Usage Guide

Quick reference for using the admin components in your application.

## Installation

Components are already installed. No additional dependencies needed.

## Import Components

```typescript
// Import individual components
import { ServerStatsCard } from '@/components/admin/ServerStatsCard';
import { QuickActions } from '@/components/admin/QuickActions';
import { CommandHistory } from '@/components/admin/CommandHistory';

// Or import all at once
import { ServerStatsCard, QuickActions, CommandHistory } from '@/components/admin';
```

## Basic Usage

### ServerStatsCard

Display live server statistics with auto-refresh:

```tsx
import { ServerStatsCard } from '@/components/admin';

function MyPage() {
  const serverId = 'your-server-uuid';

  return (
    <ServerStatsCard serverId={serverId} />
  );
}
```

**Props:**
- `serverId` (required): UUID of the server to display

**Features:**
- Auto-fetches stats on mount
- Subscribes to real-time updates
- Shows RCON availability status
- Displays game-specific data if available
- Shows player list if available

---

### QuickActions

Provide quick access to common RCON commands:

```tsx
import { QuickActions } from '@/components/admin';

function MyPage() {
  const serverId = 'your-server-uuid';

  const handleCommandCreated = () => {
    console.log('Command was queued successfully');
    // Optionally refresh command history
  };

  return (
    <QuickActions
      serverId={serverId}
      onCommandCreated={handleCommandCreated}
    />
  );
}
```

**Props:**
- `serverId` (required): UUID of the server
- `onCommandCreated` (optional): Callback when command is queued

**Available Actions:**
- **Restart Server**: Shows confirmation dialog
- **Announce**: Opens modal for message input
- **Kick Player**: Opens modal for player name and reason
- **Custom Command**: Opens modal for any RCON command

**Toast Notifications:**
- Success: Green toast when command queued
- Error: Red toast when command fails

---

### CommandHistory

Display command execution log with real-time updates:

```tsx
import { CommandHistory } from '@/components/admin';

function MyPage() {
  const serverId = 'your-server-uuid';
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommandCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <CommandHistory
      serverId={serverId}
      refreshTrigger={refreshTrigger}
    />
  );
}
```

**Props:**
- `serverId` (optional): Filter to specific server
- `refreshTrigger` (optional): Increment to force refresh

**Features:**
- Shows last 50 commands
- Filter by status (all/pending/processing/completed/failed)
- Expandable rows for detailed info
- Real-time status updates
- Shows execution duration
- Displays command results and errors

---

## Complete Example

Full admin page with all components:

```tsx
import React, { useState } from 'react';
import {
  ServerStatsCard,
  QuickActions,
  CommandHistory
} from '@/components/admin';

export const ServerAdmin = () => {
  const [serverId] = useState('your-server-uuid');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommandCreated = () => {
    // Refresh command history when new command is created
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Server Stats and Actions in a grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServerStatsCard serverId={serverId} />
        <QuickActions
          serverId={serverId}
          onCommandCreated={handleCommandCreated}
        />
      </div>

      {/* Command History */}
      <CommandHistory
        serverId={serverId}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};
```

## Admin Protection

Always protect admin pages with role checking:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();

  // Check both isAdmin flag and user role
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user role from database
    if (user) {
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setUserRole(data?.role));
    }
  }, [user]);

  // Redirect non-admins
  if (!isAdmin && userRole !== 'admin' && userRole !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      {/* Admin content */}
    </div>
  );
};
```

## Styling

All components use Tailwind CSS classes compatible with the existing design system.

**Custom Styling:**

You can wrap components in custom containers:

```tsx
<div className="bg-gray-900 p-6 rounded-xl">
  <h2 className="text-xl font-bold mb-4">Server Control</h2>
  <ServerStatsCard serverId={serverId} />
</div>
```

## API Functions

Components use API functions from `@/lib/api`:

```typescript
import {
  // Fetch functions
  getServerStats,
  getCommandHistory,
  getCommandStatus,

  // Command creation
  createServerCommand,
  cancelCommand,

  // Real-time subscriptions
  subscribeToServerStats,
  subscribeToCommandStatus,
  subscribeToServerCommands,

  // Utility functions
  isCommandFinished,
  isCommandExecuting,
  getCommandDuration,
  formatCommandStatus,
  getStatusColor,
} from '@/lib/api';
```

## Error Handling

All components handle errors gracefully:

**ServerStatsCard:**
- Shows loading spinner during fetch
- Displays error message if fetch fails
- Shows "No stats available" if server has no data

**QuickActions:**
- Toast notifications for all errors
- Button disabled during execution
- Validation prevents empty inputs

**CommandHistory:**
- Shows loading spinner during fetch
- Displays error message if fetch fails
- Shows "No commands" if history is empty

## Real-Time Updates

Components automatically subscribe to Supabase Realtime:

```typescript
// Subscription is created on mount
useEffect(() => {
  const sub = subscribeToServerStats(serverId, (newStats) => {
    setStats(newStats);
  });

  // Cleanup on unmount
  return () => sub.unsubscribe();
}, [serverId]);
```

**No manual refresh needed** - UI updates automatically when:
- Sync service updates server stats
- Executor service processes commands
- Command status changes

## TypeScript Types

All components are fully typed. Import types as needed:

```typescript
import type {
  ServerStats,
  ServerCommand,
  CommandStatus,
  CommandType,
  CreateCommandParams,
} from '@/lib/api';
```

## Troubleshooting

**Components not rendering:**
- Check serverId is valid UUID
- Verify user has admin access
- Check browser console for errors

**Real-time not working:**
- Verify Supabase Realtime is enabled
- Check RLS policies allow subscriptions
- Ensure service role key is configured

**Commands not executing:**
- Check Windows service is running
- Verify RCON credentials in database
- Check service logs for errors

## Best Practices

1. **Always handle onCommandCreated:** Refresh command history when commands are created
2. **Validate user access:** Check both `isAdmin` flag and database role
3. **Use loading states:** Components show spinners during async operations
4. **Clean up subscriptions:** Components handle this automatically
5. **Show user feedback:** Components display toast notifications
6. **Mobile responsive:** Components work on all screen sizes

## Advanced Usage

### Custom Command Types

Create reusable command templates:

```tsx
const sendCustomAnnouncement = async (message: string) => {
  await createServerCommand({
    serverId,
    commandType: 'announce',
    rconCommand: `announce [ADMIN] ${message}`,
    description: `Admin announcement: ${message}`,
    params: { message, prefix: '[ADMIN]' }
  });
};
```

### Multi-Server Actions

Execute same command on multiple servers:

```tsx
const restartAllServers = async (serverIds: string[]) => {
  const promises = serverIds.map(id =>
    createServerCommand({
      serverId: id,
      commandType: 'restart',
      rconCommand: 'restart',
      description: 'Multi-server restart'
    })
  );
  await Promise.all(promises);
};
```

### Custom Filters

Filter command history programmatically:

```tsx
const [commands, setCommands] = useState<ServerCommand[]>([]);

// Get only failed commands
const failedCommands = commands.filter(cmd => cmd.status === 'failed');

// Get commands from last hour
const recentCommands = commands.filter(cmd =>
  Date.now() - new Date(cmd.created_at).getTime() < 3600000
);
```

## Support

For issues or questions, refer to:
- Main README: `/pages/admin/README.md`
- API Documentation: `/lib/api/server-commands.ts`
- Database Schema: `/supabase/migrations/20260213000001_rcon_command_queue.sql`
