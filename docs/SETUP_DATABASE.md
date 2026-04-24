# Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `njwlzneexobgyypuijnt`
3. Navigate to **SQL Editor** in the left sidebar

## Step 2: Run the Schema

1. Open the SQL Editor
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

## Step 3: Verify Tables Created

After running the schema, verify that all tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see the following tables:
   - `users`
   - `customers`
   - `branches`
   - `services`
   - `orders`
   - `order_items`
   - `payments`
   - `delivery_tasks`
   - `inventory`
   - `inventory_logs`
   - `expenses`
   - `machines`
   - `maintenance_logs`
   - `employee_timesheets`
   - `notifications`

## Step 4: Add Sample Data (Optional)

You can add some sample data to test the system:

### Add a Branch
```sql
INSERT INTO public.branches (name, address, phone, email, is_active)
VALUES ('Main Branch', '123 Main St', '+250788123456', 'main@imesero.com', true);
```

### Add Services
```sql
INSERT INTO public.services (name, type, base_price, is_active)
VALUES 
  ('Regular Washing', 'washing', 5.00, true),
  ('Dry Cleaning', 'dry_cleaning', 15.00, true),
  ('Ironing', 'ironing', 3.00, true),
  ('Folding', 'folding', 2.00, true),
  ('Stain Removal', 'stain_removal', 10.00, true);
```

## Step 5: Test Registration

1. Go to your app's registration page
2. Try creating a new account
3. The customer should be created successfully in the `customers` table

## Troubleshooting

If you encounter any errors:

1. **"relation does not exist"**: Make sure you ran the schema.sql file completely
2. **"permission denied"**: Check that RLS policies are set up correctly
3. **"duplicate key"**: Some tables might already exist - you can drop them first or use `CREATE TABLE IF NOT EXISTS`

### To Drop All Tables (if needed to start fresh):

```sql
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.employee_timesheets CASCADE;
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.inventory_logs CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.delivery_tasks CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

Then run the schema.sql again.

