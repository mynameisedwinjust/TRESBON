# Fresh Start Guide - Delete All Tables and Data

## Option 1: Delete Everything Only

If you just want to delete all tables and data:

1. Open Supabase SQL Editor
2. Open file: `supabase/delete_all_tables.sql`
3. Copy entire file
4. Paste and run in SQL Editor
5. Done! All tables and data are deleted

## Option 2: Delete and Recreate (Recommended)

If you want to delete everything AND recreate it fresh in one go:

1. Open Supabase SQL Editor
2. Open file: `supabase/complete_fresh_start.sql`
3. Copy entire file
4. Paste and run in SQL Editor
5. Done! Fresh database with all tables created

## What Gets Deleted

- ✅ All tables (users, customers, orders, etc.)
- ✅ All data in those tables
- ✅ All RLS policies
- ✅ All indexes
- ✅ All functions

## What Gets Created (Option 2)

- ✅ All 13 tables recreated
- ✅ All indexes
- ✅ All RLS policies
- ✅ All permissions
- ✅ Ready to use!

## ⚠️ WARNING

**This will DELETE ALL YOUR DATA!**
- All customers
- All orders
- All payments
- Everything!

Make sure you really want to start fresh before running these scripts.

## After Running

1. **If you used Option 1** (delete only):
   - Run `supabase/silent_create_all_tables.sql` to recreate tables

2. **If you used Option 2** (delete and recreate):
   - You're done! Everything is fresh and ready

## Quick Commands

**Just delete:**
```sql
-- Run: supabase/delete_all_tables.sql
```

**Delete and recreate:**
```sql
-- Run: supabase/complete_fresh_start.sql
```

