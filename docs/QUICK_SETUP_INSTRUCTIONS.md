# Quick Setup Instructions - Your Supabase Project is Ready!

## ✅ What I've Done

1. ✅ Updated your `.env.local` file with your Supabase credentials
2. ✅ Created the database setup script: `supabase/setup_database.sql`

## 🚀 Next Steps

### Step 1: Create the Database Tables

1. Go to https://supabase.com/dashboard
2. Select your project: **llisvvrhsszfoirrafgv**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button
5. Open the file: `supabase/setup_database.sql`
6. **Copy the ENTIRE file** (Ctrl+A, then Ctrl+C)
7. **Paste it** into the SQL Editor
8. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
9. Wait for success - all tables will be created!

### Step 2: Restart Your Dev Server

```bash
# Stop your current server (Ctrl+C if running)
npm run dev
```

### Step 3: Test Everything

1. **Test Customer Registration:**
   - Go to `/auth/register`
   - Create a new account
   - Should work without errors

2. **Test Admin Dashboard:**
   - Go to `/auth/login`
   - Click "Admin Access" button
   - Enter PIN: `0000`
   - Should redirect to admin dashboard

3. **Test Order Creation:**
   - Login as customer
   - Go to `/customer/book`
   - Create an order
   - Should appear in admin dashboard immediately

## 📋 What Gets Created

The SQL script creates:
- ✅ 13 database tables (users, customers, orders, etc.)
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Permissions for service_role (admin access)
- ✅ Permissions for authenticated users (customers)

## 🔐 Your Credentials (Already Set)

- **Project URL:** https://llisvvrhsszfoirrafgv.supabase.co
- **Anon Key:** ✅ Set in `.env.local`
- **Service Role Key:** ✅ Set in `.env.local`

## ⚠️ Important Notes

1. **Never commit `.env.local` to git** - it contains secrets!
2. **Service Role Key is powerful** - keep it secret
3. **After running SQL script**, restart your dev server

## 🐛 If You Get Errors

1. **"Table does not exist"** → Run the SQL script in Supabase
2. **"Permission denied"** → Make sure SQL script ran completely
3. **Connection errors** → Check `.env.local` has correct values
4. **RLS errors** → Verify all policies were created

## ✅ Checklist

- [ ] Run `supabase/setup_database.sql` in Supabase SQL Editor
- [ ] Restart dev server (`npm run dev`)
- [ ] Test customer registration
- [ ] Test admin dashboard access
- [ ] Test order creation
- [ ] Verify orders appear in admin dashboard

---

**You're all set!** Just run the SQL script and restart your server. Everything else is configured! 🎉

