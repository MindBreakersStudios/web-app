# MindBreakers API Module

Production-ready Supabase API helper functions for the MindBreakers web application.

## Overview

This module provides type-safe, well-documented functions for interacting with the Supabase backend, specifically for the RCON command queue system and server statistics.

## Features

- **Type Safety**: Full TypeScript types matching database schema
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Real-time Updates**: Supabase Realtime subscriptions for live data
- **Input Validation**: Built-in validation for all parameters
- **Documentation**: JSDoc comments for all public functions
- **Row Level Security**: Respects Supabase RLS policies

## Installation

```typescript
import {
  createServerCommand,
  getCommandStatus,
  getCommandHistory,
  cancelCommand,
  getServerStats,
  getAllServersStats,
  subscribeToServerStats,
  subscribeToCommandStatus,
  subscribeToServerCommands,
} from '@/lib/api';
```

## Usage Examples

### Creating Commands

```typescript
import { createServerCommand } from '@/lib/api';

// Restart a server
const restartCmd = await createServerCommand({
  serverId: 'uuid-here',
  commandType: 'restart',
  rconCommand: 'restart',
  description: 'Scheduled maintenance restart'
});

// Kick a player
const kickCmd = await createServerCommand({
  serverId: 'uuid-here',
  commandType: 'kick_player',
  rconCommand: 'kick PlayerName',
  params: {
    player: 'PlayerName',
    reason: 'AFK'
  },
  description: 'Kick inactive player'
});

// Custom RCON command
const customCmd = await createServerCommand({
  serverId: 'uuid-here',
  commandType: 'custom',
  rconCommand: 'save',
  description: 'Manual world save'
});
```

### Monitoring Commands

```typescript
import { getCommandStatus, subscribeToCommandStatus } from '@/lib/api';

// Get current status
const command = await getCommandStatus('command-uuid');
console.log('Status:', command.status);

// Subscribe to updates
const subscription = subscribeToCommandStatus('command-uuid', (updated) => {
  console.log('Status changed to:', updated.status);

  if (updated.status === 'completed') {
    console.log('Result:', updated.result);
  } else if (updated.status === 'failed') {
    console.error('Error:', updated.error_message);
  }
});

// Cleanup
subscription.unsubscribe();
```

### Server Statistics

```typescript
import { getServerStats, subscribeToServerStats } from '@/lib/api';

// Get current stats
const stats = await getServerStats('server-uuid');
if (stats) {
  console.log(`Players: ${stats.current_players}/${stats.max_players}`);
  console.log(`Map: ${stats.map_name}`);
}

// Subscribe to live updates
const subscription = subscribeToServerStats('server-uuid', (updated) => {
  console.log(`Players online: ${updated.current_players}`);
  console.log('Player list:', updated.player_list);
});

// Cleanup
subscription.unsubscribe();
```

### Command History

```typescript
import { getCommandHistory } from '@/lib/api';

// Get all pending commands
const pending = await getCommandHistory({
  status: 'pending',
  limit: 20
});

// Get commands for specific server
const serverCommands = await getCommandHistory({
  serverId: 'server-uuid',
  limit: 50
});

// Get recent failed commands
const failed = await getCommandHistory({
  status: 'failed',
  limit: 10
});
```

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import {
  getServerStats,
  subscribeToServerStats,
  type ServerStats
} from '@/lib/api';

function ServerStatsDisplay({ serverId }: { serverId: string }) {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial stats
    getServerStats(serverId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Subscribe to updates
    const subscription = subscribeToServerStats(serverId, (updated) => {
      setStats(updated);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [serverId]);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div>
      <h3>{stats.server_name}</h3>
      <p>Players: {stats.current_players}/{stats.max_players}</p>
      <p>Map: {stats.map_name}</p>
      <p>RCON: {stats.rcon_available ? '✅' : '❌'}</p>
      <small>Last updated: {new Date(stats.last_updated).toLocaleString()}</small>
    </div>
  );
}
```

### Admin Dashboard Example

```typescript
import React, { useState } from 'react';
import {
  createServerCommand,
  subscribeToCommandStatus,
  type CommandType
} from '@/lib/api';

function AdminCommandPanel({ serverId }: { serverId: string }) {
  const [commandType, setCommandType] = useState<CommandType>('restart');
  const [description, setDescription] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCommand = async () => {
    setIsExecuting(true);

    try {
      const command = await createServerCommand({
        serverId,
        commandType,
        rconCommand: commandType, // or build from UI
        description
      });

      // Monitor execution
      const subscription = subscribeToCommandStatus(command.id, (updated) => {
        if (updated.status === 'completed') {
          alert('Command completed: ' + updated.result);
          setIsExecuting(false);
          subscription.unsubscribe();
        } else if (updated.status === 'failed') {
          alert('Command failed: ' + updated.error_message);
          setIsExecuting(false);
          subscription.unsubscribe();
        }
      });
    } catch (error) {
      console.error('Failed to execute command:', error);
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <select
        value={commandType}
        onChange={e => setCommandType(e.target.value as CommandType)}
      >
        <option value="restart">Restart Server</option>
        <option value="info">Get Server Info</option>
        <option value="announce">Send Announcement</option>
      </select>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <button onClick={executeCommand} disabled={isExecuting}>
        {isExecuting ? 'Executing...' : 'Execute Command'}
      </button>
    </div>
  );
}
```

## API Reference

### Command Operations

#### `createServerCommand(params)`
Create a new RCON command for execution. Requires admin role.

**Parameters:**
- `params.serverId` (string): Server UUID
- `params.commandType` (CommandType): Type of command
- `params.rconCommand` (string): Actual RCON command to execute
- `params.params` (object, optional): Command parameters for logging
- `params.description` (string, optional): Human-readable description

**Returns:** `Promise<ServerCommand>`

---

#### `getCommandStatus(commandId)`
Retrieve current status of a specific command.

**Parameters:**
- `commandId` (string): Command UUID

**Returns:** `Promise<ServerCommand>`

---

#### `getCommandHistory(filters?)`
Get command history with optional filtering.

**Parameters:**
- `filters.serverId` (string, optional): Filter by server
- `filters.status` (CommandStatus, optional): Filter by status
- `filters.limit` (number, optional): Max results (default: 50, max: 200)

**Returns:** `Promise<ServerCommand[]>`

---

#### `cancelCommand(commandId)`
Cancel a pending command.

**Parameters:**
- `commandId` (string): Command UUID

**Returns:** `Promise<boolean>`

---

### Server Stats Operations

#### `getServerStats(serverId)`
Get cached statistics for a specific server.

**Parameters:**
- `serverId` (string): Server UUID

**Returns:** `Promise<ServerStats | null>`

---

#### `getAllServersStats()`
Get statistics for all servers.

**Returns:** `Promise<ServerStats[]>`

---

### Real-time Subscriptions

#### `subscribeToServerStats(serverId, callback)`
Subscribe to live server statistics updates.

**Parameters:**
- `serverId` (string): Server UUID
- `callback` (function): Called when stats update

**Returns:** `RealtimeChannel` (call `.unsubscribe()` to cleanup)

---

#### `subscribeToCommandStatus(commandId, callback)`
Subscribe to command status changes.

**Parameters:**
- `commandId` (string): Command UUID
- `callback` (function): Called when command updates

**Returns:** `RealtimeChannel` (call `.unsubscribe()` to cleanup)

---

#### `subscribeToServerCommands(serverId, callback)`
Subscribe to all command updates for a server.

**Parameters:**
- `serverId` (string): Server UUID
- `callback` (function): Called when any command updates

**Returns:** `RealtimeChannel` (call `.unsubscribe()` to cleanup)

---

### Utility Functions

#### `isCommandFinished(command)`
Check if command is in a terminal state.

**Returns:** `boolean`

---

#### `isCommandExecuting(command)`
Check if command is currently processing.

**Returns:** `boolean`

---

#### `getCommandDuration(command)`
Calculate command execution duration.

**Returns:** `number | null` (milliseconds)

---

#### `formatCommandStatus(status)`
Format status enum for display.

**Returns:** `string`

---

#### `getStatusColor(status)`
Get color indicator for UI styling.

**Returns:** `'success' | 'error' | 'warning' | 'info' | 'default'`

---

## Types

### `CommandStatus`
```typescript
type CommandStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
```

### `CommandType`
```typescript
type CommandType =
  | 'restart'
  | 'info'
  | 'kick_player'
  | 'ban_player'
  | 'unban_player'
  | 'announce'
  | 'teleport'
  | 'give_item'
  | 'shutdown'
  | 'custom';
```

### `ServerCommand`
```typescript
interface ServerCommand {
  id: string;
  server_id: string;
  command_type: CommandType;
  rcon_command: string;
  params?: Record<string, any>;
  description?: string;
  status: CommandStatus;
  result?: string;
  error_message?: string;
  created_by: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  attempt_count: number;
  max_attempts: number;
  executor_pid?: number;
  executor_hostname?: string;
}
```

### `ServerStats`
```typescript
interface ServerStats {
  id: string;
  server_id: string;
  server_name?: string;
  map_name?: string;
  game_mode?: string;
  version?: string;
  current_players: number;
  max_players: number;
  player_list?: any[];
  game_data?: Record<string, any>;
  last_updated: string;
  rcon_available: boolean;
  last_rcon_error?: string;
  sync_interval_seconds: number;
}
```

## Error Handling

All functions throw errors with descriptive messages. Wrap calls in try-catch blocks:

```typescript
try {
  const command = await createServerCommand({...});
  console.log('Success:', command);
} catch (error) {
  console.error('Failed:', error.message);
  // Handle error (show toast, etc.)
}
```

## Security

- **Authentication Required**: All operations require Supabase authentication
- **Row Level Security**: Database policies enforce access control
- **Admin-Only Commands**: Only admins can create/execute commands
- **User Isolation**: Users see only their own commands (unless admin)

## Performance

- **Pagination**: Command history defaults to 50 results, max 200
- **Caching**: Server stats are cached and updated every 15 minutes
- **Real-time**: Subscriptions use Supabase Realtime (WebSocket)
- **Optimistic Updates**: Consider optimistic UI updates for better UX

## Next Steps

For the Admin Dashboard UI (Task #4), use these functions to:

1. Display live server stats
2. Show command queue/history
3. Execute RCON commands with real-time feedback
4. Monitor command execution progress
5. Handle errors gracefully

## Support

For issues or questions, contact the MindBreakers development team.
