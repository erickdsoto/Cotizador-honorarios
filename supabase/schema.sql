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
  correo_prospecto text,
  notas text,
  -- Partidas congeladas al momento de cotizar: [{ servicioId, concepto,
  -- precioUnitario, cantidad, importe, cantidadBase, unidadBase, esAnual,
  -- incrementoBloque, tamanoBloque }]
  partidas jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  -- Tasa de IVA aplicada a esta cotizacion: 0.16 (general) o 0.08 (zona
  -- fronteriza). Se congela por cotizacion, un mismo usuario puede tener
  -- clientes en ambas zonas.
  tasa_iva numeric(4, 2) not null default 0.16 check (tasa_iva in (0.16, 0.08)),
  iva numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  estatus text not null default 'borrador' check (estatus in ('borrador', 'enviada', 'aceptada', 'no_aceptada')),
  fecha_aceptada timestamptz,
  -- Se oculta de la lista principal pero no se borra.
  archivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Datos bancarios del contador, para mostrarlos en el documento imprimible
-- de cada cotizacion. Una fila por usuario.
create table if not exists public.datos_pago (
  user_id uuid primary key references auth.users (id) on delete cascade,
  beneficiario text,
  banco text,
  clabe text,
  numero_cuenta text,
  tarjeta text,
  updated_at timestamptz not null default now()
);

-- Textos reutilizables del documento imprimible (membrete, alcance del
-- proyecto, notas legales, firma). Una fila por usuario, se usan igual en
-- todas sus cotizaciones.
create table if not exists public.plantilla_documento (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre_despacho text,
  ciudad text,
  texto_alcance text,
  notas_legales text,
  nombre_firma text,
  -- Direccion verificada en el proveedor de correo (ej. Resend) desde la
  -- que se mandan las cotizaciones a los prospectos.
  correo_remitente text,
  updated_at timestamptz not null default now()
);

create index if not exists servicios_user_id_idx on public.servicios (user_id);
create index if not exists cotizaciones_user_id_idx on public.cotizaciones (user_id);
create index if not exists cotizaciones_fecha_aceptada_idx on public.cotizaciones (fecha_aceptada);

alter table public.servicios enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.datos_pago enable row level security;
alter table public.plantilla_documento enable row level security;

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

create policy "datos_pago_select_own" on public.datos_pago
  for select using (auth.uid() = user_id);

create policy "datos_pago_insert_own" on public.datos_pago
  for insert with check (auth.uid() = user_id);

create policy "datos_pago_update_own" on public.datos_pago
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "datos_pago_delete_own" on public.datos_pago
  for delete using (auth.uid() = user_id);

create policy "plantilla_documento_select_own" on public.plantilla_documento
  for select using (auth.uid() = user_id);

create policy "plantilla_documento_insert_own" on public.plantilla_documento
  for insert with check (auth.uid() = user_id);

create policy "plantilla_documento_update_own" on public.plantilla_documento
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "plantilla_documento_delete_own" on public.plantilla_documento
  for delete using (auth.uid() = user_id);
