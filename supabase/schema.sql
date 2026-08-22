-- Cotizador de Honorarios — esquema de base de datos
-- Ejecutar en el SQL editor de Supabase (proyecto nuevo o existente).

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concepto text not null,
  precio numeric(12, 2) not null check (precio >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prospecto text not null,
  notas text,
  -- Partidas congeladas al momento de cotizar: [{ servicioId, concepto, precioUnitario, cantidad, importe }]
  partidas jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  iva numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  estatus text not null default 'borrador' check (estatus in ('borrador', 'enviada', 'aceptada')),
  fecha_aceptada timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists servicios_user_id_idx on public.servicios (user_id);
create index if not exists cotizaciones_user_id_idx on public.cotizaciones (user_id);
create index if not exists cotizaciones_fecha_aceptada_idx on public.cotizaciones (fecha_aceptada);

alter table public.servicios enable row level security;
alter table public.cotizaciones enable row level security;

-- Cada usuario ve, crea, actualiza y borra unicamente lo propio. Sin tablas
-- de equipo/organizacion: el aislamiento es siempre a nivel de usuario.

create policy "servicios_select_own" on public.servicios
  for select using (auth.uid() = user_id);

create policy "servicios_insert_own" on public.servicios
  for insert with check (auth.uid() = user_id);

create policy "servicios_update_own" on public.servicios
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "servicios_delete_own" on public.servicios
  for delete using (auth.uid() = user_id);

create policy "cotizaciones_select_own" on public.cotizaciones
  for select using (auth.uid() = user_id);

create policy "cotizaciones_insert_own" on public.cotizaciones
  for insert with check (auth.uid() = user_id);

create policy "cotizaciones_update_own" on public.cotizaciones
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cotizaciones_delete_own" on public.cotizaciones
  for delete using (auth.uid() = user_id);
