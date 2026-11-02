
-- Roles
create type public.app_role as enum ('admin', 'host', 'renter');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Profiles (public name + photo)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles are readable" on public.profiles for select to anon, authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Private quiz answers
create table public.renter_preferences (
  user_id uuid primary key,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.renter_preferences to authenticated;
grant all on public.renter_preferences to service_role;
alter table public.renter_preferences enable row level security;
create policy "Own preferences" on public.renter_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- New user setup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'renter') on conflict do nothing;
  if new.raw_user_meta_data->>'role' = 'host' then
    insert into public.user_roles (user_id, role) values (new.id, 'host') on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Hosting is self-service (not a privilege)
create or replace function public.become_host()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'host') on conflict do nothing;
end; $$;
revoke execute on function public.become_host() from public, anon;
grant execute on function public.become_host() to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Listings
create table public.listings (
  id text primary key default ('h-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  host_id uuid not null default auth.uid(),
  data jsonb not null,
  photos text[] not null default '{}',
  status text not null default 'live' check (status in ('live', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "Live listings are public" on public.listings for select to anon, authenticated using (status = 'live' or host_id = auth.uid());
create policy "Hosts create listings" on public.listings for insert to authenticated with check (host_id = auth.uid() and public.has_role(auth.uid(), 'host'));
create policy "Hosts update own listings" on public.listings for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "Hosts delete own listings" on public.listings for delete to authenticated using (host_id = auth.uid());
create trigger listings_touch before update on public.listings for each row execute function public.touch_updated_at();

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  listing_title text not null,
  renter_id uuid not null default auth.uid(),
  host_id uuid,
  duration text not null check (duration in ('1w', '1m', '3m', '11m')),
  start_date date not null,
  total integer not null check (total > 0),
  message text not null default '',
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "Renter or host reads booking" on public.bookings for select to authenticated using (renter_id = auth.uid() or host_id = auth.uid());
create policy "Renters request bookings" on public.bookings for insert to authenticated with check (renter_id = auth.uid());
create policy "Renter or host updates booking" on public.bookings for update to authenticated using (renter_id = auth.uid() or host_id = auth.uid());

create or replace function public.bookings_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.renter_id := auth.uid();
  select host_id into new.host_id from public.listings where id = new.listing_id;
  if new.host_id = new.renter_id then raise exception 'You cannot book your own home'; end if;
  -- Sample homes have no host account, so their trials confirm straight away.
  new.status := case when new.host_id is null then 'accepted' else 'requested' end;
  return new;
end; $$;
create trigger bookings_insert before insert on public.bookings for each row execute function public.bookings_before_insert();

create or replace function public.bookings_before_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return new; end if;
  -- Only the status can change.
  new.listing_id := old.listing_id; new.listing_title := old.listing_title; new.renter_id := old.renter_id;
  new.host_id := old.host_id; new.duration := old.duration; new.start_date := old.start_date; new.total := old.total;
  new.message := old.message; new.created_at := old.created_at; new.updated_at := now();
  if new.status = old.status then return new; end if;
  if uid = old.host_id and old.status = 'requested' and new.status in ('accepted', 'declined') then return new; end if;
  if uid = old.host_id and old.status = 'accepted' and new.status = 'completed' then return new; end if;
  if uid = old.renter_id and old.status in ('requested', 'accepted') and new.status = 'cancelled' then return new; end if;
  if uid = old.renter_id and old.host_id is null and old.status = 'accepted' and new.status = 'completed' then return new; end if;
  raise exception 'That change is not allowed';
end; $$;
create trigger bookings_update before update on public.bookings for each row execute function public.bookings_before_update();

-- Transactions / invoices
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  ref text not null default ('TXN-' || to_char(now(), 'YY') || '-' || lpad((floor(random() * 99999))::int::text, 5, '0')),
  booking_id uuid references public.bookings(id) on delete set null,
  payer_id uuid not null,
  payee_id uuid,
  property text not null default '',
  type text not null check (type in ('rent', 'deposit', 'refund', 'maintenance', 'utility', 'additional', 'repair')),
  description text not null,
  amount integer not null check (amount > 0),
  status text not null default 'pending' check (status in ('paid', 'pending', 'refunded')),
  due date not null default current_date,
  method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "Payer or payee reads" on public.transactions for select to authenticated using (payer_id = auth.uid() or payee_id = auth.uid());
create policy "Hosts invoice their renters" on public.transactions for insert to authenticated with check (
  payee_id = auth.uid() and status = 'pending' and booking_id is null
  and exists (select 1 from public.bookings b where b.host_id = auth.uid() and b.renter_id = payer_id and b.status in ('accepted', 'completed'))
);

create or replace function public.bookings_after_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status <> 'accepted') then
    insert into public.transactions (booking_id, payer_id, payee_id, property, type, description, amount, due)
    values (new.id, new.renter_id, new.host_id, new.listing_title, 'rent',
      'Trial stay, ' || case new.duration when '1w' then '1 week' when '1m' then '1 month' when '3m' then '3 months' else '11 months' end,
      new.total, new.start_date);
  end if;
  return new;
end; $$;
create trigger bookings_after after insert or update on public.bookings for each row execute function public.bookings_after_change();

create or replace function public.pay_transaction(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.transactions set status = 'paid', method = 'UPI · simulated', paid_at = now()
  where id = _id and payer_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Nothing to pay'; end if;
end; $$;
revoke execute on function public.pay_transaction(uuid) from public, anon;
grant execute on function public.pay_transaction(uuid) to authenticated;

-- Lived-in reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  author_id uuid not null default auth.uid(),
  rating integer not null check (rating between 1 and 5),
  topic text not null default 'commute' check (topic in ('water', 'power', 'noise', 'safety', 'commute')),
  tone text not null default 'good' check (tone in ('good', 'mixed')),
  body text not null check (char_length(body) between 4 and 600),
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Reviews are public" on public.reviews for select to anon, authenticated using (true);
create policy "Guests who stayed can review" on public.reviews for insert to authenticated with check (
  author_id = auth.uid()
  and exists (select 1 from public.bookings b where b.renter_id = auth.uid() and b.listing_id = reviews.listing_id and b.status in ('accepted', 'completed'))
);
create policy "Authors delete own reviews" on public.reviews for delete to authenticated using (author_id = auth.uid());

-- Messages between renter and host
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  renter_id uuid not null,
  host_id uuid not null,
  sender_id uuid not null default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "Participants read messages" on public.messages for select to authenticated using (renter_id = auth.uid() or host_id = auth.uid());
create policy "Participants send messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (select 1 from public.listings l where l.id = listing_id and l.host_id = messages.host_id)
  and ((sender_id = renter_id and renter_id <> host_id) or sender_id = host_id)
);
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;

create index on public.bookings (renter_id);
create index on public.bookings (host_id);
create index on public.transactions (payer_id);
create index on public.transactions (payee_id);
create index on public.reviews (listing_id);
create index on public.messages (renter_id, host_id, listing_id);
