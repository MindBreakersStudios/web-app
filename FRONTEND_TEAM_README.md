# RCON Admin Dashboard - Frontend Documentation

## 🎯 Quick Start (5 minutes)

Read in this order:
1. `ADMIN_QUICK_START.md` - Get started in 5 minutes
2. `src/lib/api/README.md` - API functions you'll use
3. `src/components/admin/USAGE.md` - UI components guide

## 📚 Complete Documentation

### For Development
- **`ADMIN_DASHBOARD_SUMMARY.md`** - Complete system overview
- **`src/lib/api/README.md`** - API documentation (CRITICAL)
- **`src/components/admin/USAGE.md`** - Component usage guide
- **`src/pages/admin/README.md`** - Admin page documentation

### For Reference
- **`src/lib/api/IMPLEMENTATION_SUMMARY.md`** - Technical details
- **`supabase/migrations/20260213000001_rcon_command_queue.sql`** - Database schema

## 🚀 What's Already Built

### API Layer (`src/lib/api/`)
✅ **13 API functions** ready to use:
```typescript
import {
  createServerCommand,
  getCommandStatus,
  getCommandHistory,
  getServerStats,
  subscribeToServerStats,
  // ... and more
} from '@/lib/api';
```

### UI Components (`src/components/admin/`)
✅ **3 React components** ready to use:
- `<ServerStatsCard serverId="..." />` - Live server stats
- `<QuickActions serverId="..." />` - Command buttons
- `<CommandHistory serverId="..." />` - Execution log

### Admin Page (`src/pages/admin/`)
✅ **Complete admin dashboard** at `/admin/server-control`

## 🎨 Customization Points

### Easy Customizations
1. **Add new command buttons** in `QuickActions.tsx`
2. **Customize stats display** in `ServerStatsCard.tsx`
3. **Add filters** to `CommandHistory.tsx`
4. **Style with Tailwind** - all components use Tailwind CSS

### Advanced Customizations
1. **Add command templates** - predefined command sets
2. **Scheduled commands** - execute at specific times
3. **Multi-command macros** - run multiple commands in sequence
4. **Custom notifications** - Discord/Slack integration

## 🔐 Security Notes

- Only users with `role = 'admin'` or `'super_admin'` can access
- Row Level Security enforced at database level
- All components check user permissions
- Routes protected with `ProtectedRoute` wrapper

## 💡 Usage Examples

### Execute a restart command
```typescript
const command = await createServerCommand({
  serverId: 'server-uuid',
  commandType: 'restart',
  rconCommand: 'restart',
  description: 'Scheduled maintenance'
});
```

### Subscribe to live stats
```typescript
useEffect(() => {
  const sub = subscribeToServerStats(serverId, (stats) => {
    setStats(stats);
  });
  return () => sub.unsubscribe();
}, [serverId]);
```

### Display command history
```tsx
<CommandHistory 
  serverId={serverId}
  refreshTrigger={refreshCounter}
/>
```

## 🆘 Need Help?

1. Check the README files in order listed above
2. Look at existing component code for patterns
3. API functions have JSDoc comments with examples
4. All components have prop type definitions

## 📊 System Architecture

```
Web App (You) → API Layer → Supabase → Windows Service → Game Server
```

You only need to work with the **API Layer** - everything else is handled!

## ✅ Testing Checklist

Before deployment:
- [ ] Admin access verified (`role = 'admin'` in database)
- [ ] Server configured with RCON credentials
- [ ] Windows services running (`pm2 status`)
- [ ] Can view `/admin/server-control` page
- [ ] Can execute restart command
- [ ] Real-time stats updating
- [ ] Command history showing updates
- [ ] Mobile responsive working

## 🎊 You're Ready!

The system is complete and production-ready. Focus on:
1. Understanding the API functions (`src/lib/api/README.md`)
2. Using the existing components
3. Customizing to your needs

Happy coding! 🚀
