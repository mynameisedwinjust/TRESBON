# Quick Start Guide - Fix All Database Errors

## 🚨 If You're Getting Errors About Missing Tables

Run this **ONE script** to create everything:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Complete Setup Script
1. Open the file: `supabase/create_all_tables_and_permissions.sql`
2. **Copy the ENTIRE file** (Ctrl+A, then Ctrl+C)
3. **Paste it** into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
5. Wait for success message: "✅ All tables created successfully!"

### Step 3: Set Environment Variables
Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**To get your keys:**
1. Go to Supabase Dashboard → Settings → API
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 4: Restart Dev Server
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ What This Script Creates

**All Tables:**
- ✅ `users` - Staff/admin accounts
- ✅ `customers` - Customer accounts
- ✅ `branches` - Branch locations
- ✅ `services` - Laundry services
- ✅ `orders` - Customer orders
- ✅ `order_items` - Items in orders
- ✅ `payments` - Payment records
- ✅ `delivery_tasks` - Pickup/delivery tasks
- ✅ `inventory` - Stock items
- ✅ `expenses` - Business expenses
- ✅ `machines` - Equipment
- ✅ `employee_timesheets` - Time tracking
- ✅ `notifications` - System notifications

**Permissions:**
- ✅ Service role has FULL access (bypasses RLS)
- ✅ Authenticated users can view their own data
- ✅ Customers can create orders
- ✅ Public can view services and branches

## 🎯 After Running the Script

1. **Verify Tables**: Go to Supabase → Table Editor → You should see all 13 tables
2. **Test Admin Dashboard**: Go to `/admin/dashboard` - should work without errors
3. **Test Customer Dashboard**: Create an order - should work
4. **Check Real-Time**: Orders should appear in admin dashboard immediately

## 🐛 Common Errors & Solutions

### Error: "relation 'public.customers' does not exist"
**Solution**: Run `supabase/create_all_tables_and_permissions.sql`

### Error: "permission denied for table users"
**Solution**: 
1. Make sure you ran the complete setup script
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
3. Restart dev server

### Error: "Could not find the table 'public.orders'"
**Solution**: Run `supabase/create_all_tables_and_permissions.sql`

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Solution**: 
1. Get service role key from Supabase Dashboard → Settings → API
2. Add to `.env.local`
3. Restart dev server

## 📋 Checklist

- [ ] Ran `create_all_tables_and_permissions.sql` in Supabase
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Restarted dev server
- [ ] Verified tables exist in Supabase Table Editor
- [ ] Tested admin dashboard - no errors
- [ ] Tested customer dashboard - can create orders
- [ ] Orders appear in admin dashboard

## 🎉 You're Done!

Once you've completed these steps, your entire application should work:
- ✅ Admin dashboard shows all data
- ✅ Customer dashboard works
- ✅ Orders sync in real-time
- ✅ No permission errors
- ✅ All tables accessible

