-- Cotizador de Honorarios — esquema de base de datos
-- Ejecutar en el SQL editor de Supabase (proyecto nuevo o existente).

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Identificador estable para servicios estructurales (regimenes de
  -- contabilidad mensual y adicionales predefinidos). Null para servicios
  -- genericos agregados libremente desde Configuracion.
  clave text,
  concepto text not null,
  tipo text not null default 'fijo' check (tipo in ('fijo', 'por_bloque')),
  -- 'fijo': precio unitario que se multiplica por la cantidad capturada.
  -- 'por_bloque': precio del primer bloque (0 a tamano_bloque-1 unidades).
  precio numeric(12, 2) not null check (precio >= 0),
  -- Solo 'por_bloque': monto que se suma por cada bloque completo adicional.
  incremento_bloque numeric(12, 2) check (incremento_bloque is null or incremento_bloque >= 0),
  -- Solo 'por_bloque': tamano de cada bloque (ej. 50 cfdi, 10 empleados).
  tamano_bloque integer check (tamano_bloque is null or tamano_bloque > 0),
  -- Etiqueta de la cantidad que se captura al cotizar (ej. "CFDI mensuales").
  unidad text,
  created_at timestamptz not null default now(),
  constraint servicios_por_bloque_check check (
    (tipo = 'fijo' and incremento_bloque is null and tamano_bloque is null)
    or
    (tipo = 'por_bloque' and incremento_bloque is not null and tamano_bloque is not null)
  )
);

-- Evita sembrar dos veces el mismo servicio estructural para un usuario.
create unique index if not exists servicios_user_clave_unique
  on public.servicios (user_id, clave)
  where clave is not null;

create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prospecto text not null,
  notas text,
  -- Partidas congeladas al momento de cotizar: [{ servicioId, concepto,
  -- precioUnitario, cantidad, importe, cantidadBase, unidadBase, esAnual }]
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
