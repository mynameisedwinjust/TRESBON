# How Orders Show on Customer Dashboard

## ✅ What I've Done

1. **Updated Dashboard** - Always shows "Your Orders" section (even when empty)
2. **Real-Time Updates** - Dashboard automatically refreshes when orders are created
3. **SQL Script Updated** - Includes real-time enablement for orders table
4. **Order Creation** - Redirects to dashboard so you can see your order immediately

## 📋 SQL Scripts to Run

### Step 1: Run Main Setup Script

1. Go to Supabase SQL Editor
2. Open: `supabase/complete_system_setup.sql`
3. Copy entire file and run it
4. This creates all tables AND enables real-time

### Step 2: (Optional) If Real-Time Doesn't Work

If orders don't update automatically, run this additional script:

1. Open: `supabase/enable_realtime_for_orders.sql`
2. Copy and run it in SQL Editor

## 🎯 How It Works

### When You Create an Order:

1. **Order is saved** to database with `customer_id` linked to you
2. **Status is "received"** (waiting for admin approval)
3. **You're redirected** to dashboard
4. **Dashboard loads** and shows your order immediately
5. **Real-time subscription** keeps it updated

### Dashboard Shows:

- ✅ **Stats Cards**: Total Orders, Active Orders, Completed, Total Spent
- ✅ **Your Orders Section**: List of all your orders (up to 5 most recent)
- ✅ **Order Details**: Order number, status, items, amount, date
- ✅ **Status Badge**: "⏳ Waiting for Admin Approval" for new orders

## 🔄 Real-Time Updates

The dashboard subscribes to order changes:
- When you create an order → Shows immediately
- When admin accepts order → Status updates automatically
- When order status changes → Updates in real-time

## 📊 What You'll See

After creating an order, the dashboard will show:

1. **Stats update**:
   - Total Orders: +1
   - Active Orders: +1
   - Completed: unchanged (until delivered)

2. **Orders section**:
   - Your new order appears at the top
   - Shows order number
   - Shows "⏳ Waiting for Admin Approval" badge
   - Shows item count and total amount
   - Shows creation date/time

## ✅ Checklist

- [ ] Run `supabase/complete_system_setup.sql` in Supabase
- [ ] Restart dev server (`npm run dev`)
- [ ] Create a test order
- [ ] Check dashboard - order should appear immediately
- [ ] Verify stats cards show correct numbers

## 🐛 If Orders Don't Show

1. **Check browser console** - Look for errors
2. **Verify customer_id** - Make sure order has your customer_id
3. **Check RLS policies** - Make sure policies allow you to see your orders
4. **Refresh dashboard** - Sometimes a manual refresh helps
5. **Check SQL script** - Make sure it ran completely

## 💡 Tips

- Orders are sorted by newest first
- Only shows your orders (filtered by customer_id)
- Real-time updates work automatically
- Dashboard refreshes when you navigate to it

---

**Everything is set up!** Just run the SQL script and create an order - it will show on your dashboard immediately! 🎉

