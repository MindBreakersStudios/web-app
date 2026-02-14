# Admin Dashboard - Server Control

Production-ready admin interface for managing game servers via RCON commands.

## Overview

The Admin Dashboard allows authorized administrators to:
- View live server statistics (player count, map, version, etc.)
- Execute RCON commands (restart, announce, kick, custom)
- Monitor command execution status in real-time
- Review command history with detailed execution logs

## Components

### 1. ServerControl.tsx
**Main admin dashboard page**

- Protected route (admin/super_admin only)
- Server selector for multi-server support
- Orchestrates all sub-components
- Real-time updates via Supabase Realtime

**Location:** `/admin/server-control`

**Access Control:**
```typescript
// Only accessible if user.role = 'admin' or 'super_admin'
const { isAdmin } = useAuth();
if (!isAdmin) return <Navigate to="/dashboard" />;
```

### 2. ServerStatsCard.tsx
**Live server statistics display**

Features:
- Current players / max players
- Server name, map, game mode, version
- RCON availability indicator
- Last updated timestamp
- Game-specific data (season, weather, etc.)
- Real-time auto-refresh

**API Integration:**
```typescript
import { getServerStats, subscribeToServerStats } from '@/lib/api';

// Initial fetch
const stats = await getServerStats(serverId);

// Subscribe to updates
const sub = subscribeToServerStats(serverId, (newStats) => {
  setStats(newStats);
});
```

### 3. QuickActions.tsx
**Pre-configured RCON command buttons**

Features:
- Restart server (with confirmation)
- Announce message (modal input)
- Kick player (modal with player name + reason)
- Custom RCON command (modal input)
- Loading states during execution
- Success/error toast notifications

**API Integration:**
```typescript
import { createServerCommand } from '@/lib/api';

await createServerCommand({
  serverId: 'uuid',
  commandType: 'restart',
  rconCommand: 'restart',
  description: 'Scheduled maintenance'
});
```

### 4. CommandHistory.tsx
**Command execution log with real-time updates**

Features:
- Table of recent commands (last 50)
- Status badges (pending/processing/completed/failed)
- Expandable rows with detailed info
- Filter by status (all/pending/completed/failed)
- Real-time status updates
- Command result/error display
- Execution duration tracking

**API Integration:**
```typescript
import { getCommandHistory, subscribeToServerCommands } from '@/lib/api';

// Fetch history
const commands = await getCommandHistory({ serverId, limit: 50 });

// Subscribe to updates
const sub = subscribeToServerCommands(serverId, (command) => {
  // Update command in list
});
```

## File Structure

```
web-app/src/
├── pages/admin/
│   ├── ServerControl.tsx       # Main admin page
│   └── README.md               # This file
├── components/admin/
│   ├── ServerStatsCard.tsx     # Live stats display
│   ├── QuickActions.tsx        # Command buttons
│   ├── CommandHistory.tsx      # Command log
│   └── index.ts                # Exports
└── lib/api/
    ├── server-commands.ts      # API functions
    └── index.ts                # Re-exports
```

## Usage

### 1. Add Navigation Link

Update `DashboardLayout.tsx` or navigation to include admin link:

```tsx
{isAdmin && (
  <NavLink to="/admin/server-control">
    <ShieldCheckIcon className="h-5 w-5" />
    Server Control
  </NavLink>
)}
```

### 2. Configure Server RCON

Update your server in the database:

```sql
UPDATE servers
SET
  rcon_host = '127.0.0.1',
  rcon_port = 27015,
  rcon_password_encrypted = 'your-encrypted-password',
  rcon_enabled = true
WHERE slug = 'your-server-slug';
```

### 3. Grant Admin Access

Update user role in database:

```sql
UPDATE users
SET role = 'admin'
WHERE id = 'user-uuid';
```

### 4. Access Dashboard

Navigate to: `http://localhost:5173/admin/server-control`

## Features in Detail

### Real-Time Updates

All components use Supabase Realtime subscriptions:

**Server Stats:** Auto-updates when sync service runs (every 15 minutes)
```typescript
subscribeToServerStats(serverId, callback);
```

**Command Status:** Updates when executor service processes commands
```typescript
subscribeToCommandStatus(commandId, callback);
subscribeToServerCommands(serverId, callback);
```

### Command Execution Flow

1. **User Action:** Admin clicks button or submits custom command
2. **Queue:** Command inserted into `server_commands` table (status: pending)
3. **Notification:** Toast confirms command was queued
4. **Processing:** Windows service polls and executes (status: processing)
5. **Completion:** Service updates status (completed/failed) with result
6. **Real-time Update:** UI automatically shows new status

### Error Handling

**Network Errors:**
- Toast notification with error message
- Command not created in database
- User can retry immediately

**RCON Errors:**
- Command marked as "failed" in database
- Error message displayed in command history
- Server stats show "RCON Offline" indicator

**Validation Errors:**
- Empty inputs prevented via button disable
- Client-side validation before API call
- User-friendly error messages

### Security

**Access Control:**
- Route protected with `ProtectedRoute` wrapper
- Additional role check in component
- RLS policies in database enforce permissions

**Command Validation:**
- Only admins can create commands (RLS policy)
- Service role required to update command status
- Users can only cancel their own pending commands

**Audit Trail:**
- All commands logged with creator, timestamps
- Execution details (PID, hostname) recorded
- Full command history retained

## Styling

All components use Tailwind CSS with the existing design system:

**Colors:**
- Blue: Primary actions, info states
- Green: Success, active, online
- Red: Danger, errors, offline
- Yellow: Warnings, pending
- Gray: Neutral, backgrounds

**Responsive:**
- Mobile-first design
- Grid layouts adapt to screen size
- Modals work on small screens
- Tables scroll horizontally on mobile

## Testing Checklist

- [ ] Admin users can access `/admin/server-control`
- [ ] Non-admin users are redirected to `/dashboard`
- [ ] Server selector shows all RCON-enabled servers
- [ ] Server stats display correctly and update
- [ ] Restart command shows confirmation dialog
- [ ] Announce modal accepts input and queues command
- [ ] Kick player modal accepts name and reason
- [ ] Custom command modal accepts any command
- [ ] Toast notifications appear on success/error
- [ ] Command history shows recent commands
- [ ] Status badges update in real-time
- [ ] Expandable rows show full command details
- [ ] Filter buttons work correctly
- [ ] RCON errors are displayed appropriately
- [ ] Page works on mobile devices

## Troubleshooting

**No servers shown:**
- Check `servers` table has `rcon_enabled = true`
- Verify database connection

**Commands not executing:**
- Check Windows service is running (`pm2 list`)
- Verify RCON credentials in database
- Check service logs (`pm2 logs rcon-executor`)

**Stats not updating:**
- Check stats sync service is running
- Verify `server_stats` table has data
- Check last_rcon_error in stats

**Real-time not working:**
- Verify Supabase Realtime is enabled
- Check browser console for errors
- Ensure table RLS allows subscriptions

## Performance Notes

**Pagination:**
- Command history limited to 50 recent commands
- Additional pagination can be added if needed

**Caching:**
- Server stats cached in database (updated every 15 min)
- No client-side caching beyond React state

**Real-time:**
- Each component creates its own subscription
- Subscriptions cleaned up on unmount
- Minimal database load (only changes trigger updates)

## Future Enhancements

Potential improvements:
- [ ] Scheduled commands (execute at specific time)
- [ ] Command templates (save common commands)
- [ ] Bulk actions (kick multiple players)
- [ ] Server groups (execute on multiple servers)
- [ ] Command approval workflow (for sensitive operations)
- [ ] Audit log viewer (detailed admin activity)
- [ ] Performance metrics (command execution times)
- [ ] Email/Discord notifications (for critical events)

## Support

For issues or questions:
1. Check this README
2. Review component JSDoc comments
3. Check API function documentation in `lib/api/server-commands.ts`
4. Review Supabase migration: `20260213000001_rcon_command_queue.sql`
