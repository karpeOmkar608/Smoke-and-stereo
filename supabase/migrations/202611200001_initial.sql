-- Money is stored as integer paise. Apply in Supabase SQL editor or CLI.
create extension if not exists pgcrypto;
create sequence public.website_order_number start 1001;
create table public.profiles (id uuid primary key references auth.users on delete cascade, full_name text not null default '', email text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.orders (
 id uuid primary key default gen_random_uuid(), order_number text unique not null default ('W-' || nextval('public.website_order_number')) check(order_number ~ '^W-[0-9]+$'),
 idempotency_key uuid not null unique, request_fingerprint text not null, guest_token_hash text not null,
 user_id uuid references auth.users on delete set null, customer_name text not null, customer_email text not null, customer_phone text not null,
 address text not null, city text not null, state text not null, pincode text not null check(pincode ~ '^[1-9][0-9]{5}$'),
 subtotal bigint not null check(subtotal>=0), shipping_amount bigint not null check(shipping_amount>=0), discount_amount bigint not null default 0 check(discount_amount>=0), total_amount bigint not null check(total_amount=subtotal+shipping_amount-discount_amount),
 payment_method text not null check(payment_method in ('cod','online')), payment_status text not null default 'unpaid' check(payment_status in ('unpaid','pending','paid','failed','refunded')),
 order_status text not null default 'confirmed' check(order_status in ('pending_payment','confirmed','processing','shipped','delivered','cancelled','refunded')),
 integration_status text not null default 'pending' check(integration_status in ('pending','processing','submitted','failed','reconciliation_required')),
 external_response jsonb, integration_error text, email_status text not null default 'not_sent', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders on delete cascade, external_sku text not null, product_name_snapshot text not null, product_image_snapshot text, selected_variant text not null, quantity integer not null check(quantity between 1 and 10), unit_price bigint not null check(unit_price>=0), total_price bigint not null check(total_price=unit_price*quantity), created_at timestamptz not null default now(), unique(order_id,external_sku));
create table public.wishlist (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, external_sku text not null, created_at timestamptz not null default now(), unique(user_id,external_sku));
create table public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text unique not null check(length(email)<=254), status text not null default 'subscribed' check(status in ('subscribed','unsubscribed')), created_at timestamptz not null default now());
create table public.site_settings (id uuid primary key default gen_random_uuid(), setting_key text unique not null, setting_value jsonb not null, updated_at timestamptz not null default now());
create table public.payment_transactions (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders, provider text not null, provider_transaction_id text unique, amount bigint not null check(amount>=0), status text not null, payment_response jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.integration_attempts (id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders,status text not null,response jsonb,error text,created_at timestamptz not null default now(),completed_at timestamptz);
create table public.admin_audit (id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users,action text not null,target text not null,details jsonb,created_at timestamptz not null default now());
create table public.product_merchandising (external_sku text primary key,featured boolean not null default false,hidden boolean not null default false,collections text[] not null default '{}',editorial_description text,size_guide text,updated_at timestamptz not null default now());
create table public.saved_addresses (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,label text not null,address text not null,city text not null,state text not null,pincode text not null check(pincode ~ '^[1-9][0-9]{5}$'),phone text not null,created_at timestamptz not null default now());
create table public.saved_carts (user_id uuid primary key references auth.users on delete cascade,items jsonb not null default '[]',updated_at timestamptz not null default now());
create index orders_user_created on public.orders(user_id,created_at desc);
create index orders_integration on public.orders(integration_status,created_at);
create index order_items_order on public.order_items(order_id);
create index attempts_order on public.integration_attempts(order_id,created_at desc);
create index saved_addresses_user on public.saved_addresses(user_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
create trigger touch_orders before update on public.orders for each row execute function public.touch_updated_at();
create trigger touch_profiles before update on public.profiles for each row execute function public.touch_updated_at();
create trigger touch_settings before update on public.site_settings for each row execute function public.touch_updated_at();
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,email) values(new.id,new.email);return new;end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.integration_attempts enable row level security;
alter table public.admin_audit enable row level security;
alter table public.product_merchandising enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.saved_carts enable row level security;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy orders_own on public.orders for select to authenticated using ((select auth.uid())=user_id);
create policy items_own on public.order_items for select to authenticated using (exists(select 1 from public.orders where orders.id=order_id and orders.user_id=(select auth.uid())));
create policy wishlist_own on public.wishlist for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy addresses_own on public.saved_addresses for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy carts_own on public.saved_carts for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- No public policies on privileged data. Admin handlers verify app_metadata then use service role.
revoke all on public.orders,public.order_items,public.payment_transactions,public.site_settings,public.product_merchandising,public.newsletter_subscribers,public.integration_attempts,public.admin_audit from anon,authenticated;
grant select on public.orders,public.order_items to authenticated;
revoke all on sequence public.website_order_number from anon,authenticated;
create function public.create_checkout_order(p_key uuid,p_fingerprint text,p_user uuid,p_customer jsonb,p_subtotal bigint,p_shipping bigint,p_token_hash text,p_items jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result public.orders; item jsonb; calculated bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into result from public.orders where idempotency_key=p_key;
 if found then return jsonb_build_object('id',result.id,'order_number',result.order_number,'request_fingerprint',result.request_fingerprint);end if;
 if jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>30 then raise exception 'Invalid item count';end if;
 select sum((v->>'total_price')::bigint) into calculated from jsonb_array_elements(p_items) v;
 if calculated<>p_subtotal then raise exception 'Invalid subtotal';end if;
 insert into public.orders(idempotency_key,request_fingerprint,user_id,guest_token_hash,customer_name,customer_email,customer_phone,address,city,state,pincode,subtotal,shipping_amount,total_amount,payment_method)
 values(p_key,p_fingerprint,p_user,p_token_hash,p_customer->>'name',p_customer->>'email',p_customer->>'phone',p_customer->>'address',p_customer->>'city',p_customer->>'state',p_customer->>'pincode',p_subtotal,p_shipping,p_subtotal+p_shipping,'cod') returning * into result;
 for item in select * from jsonb_array_elements(p_items) loop
 insert into public.order_items(order_id,external_sku,product_name_snapshot,product_image_snapshot,selected_variant,quantity,unit_price,total_price) values(result.id,item->>'external_sku',item->>'product_name_snapshot',item->>'product_image_snapshot',item->>'selected_variant',(item->>'quantity')::integer,(item->>'unit_price')::bigint,(item->>'total_price')::bigint);
 end loop;
 return jsonb_build_object('id',result.id,'order_number',result.order_number,'request_fingerprint',result.request_fingerprint);
end $$;
revoke all on function public.create_checkout_order(uuid,text,uuid,jsonb,bigint,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_checkout_order(uuid,text,uuid,jsonb,bigint,bigint,text,jsonb) to service_role;
