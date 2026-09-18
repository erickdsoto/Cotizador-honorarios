-- Cotizador de Honorarios — esquema de base de datos
-- Ejecutar en el SQL editor de Supabase (proyecto nuevo o existente).

-- Despachos (firmas) y membresias con rol. Todos los datos (servicios,
-- cotizaciones, datos bancarios, plantilla) se comparten a nivel despacho,
-- no a nivel usuario individual: un dueno y sus colaboradores ven lo mismo.
create table if not exists public.despachos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Cada usuario pertenece a un solo despacho.
create table if not exists public.miembros_despacho (
  id uuid primary key default gen_random_uuid(),
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rol text not null default 'colaborador' check (rol in ('dueno', 'colaborador')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists miembros_despacho_despacho_id_idx
  on public.miembros_despacho (despacho_id);

-- Helpers de RLS (security definer para evitar recursion al consultar
-- miembros_despacho desde las policies de las demas tablas).
create or replace function public.es_miembro_despacho(p_despacho_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.miembros_despacho m
    where m.despacho_id = p_despacho_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.es_dueno_despacho(p_despacho_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.miembros_despacho m
    where m.despacho_id = p_despacho_id and m.user_id = auth.uid() and m.rol = 'dueno'
  );
$$;

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  -- Quien lo creo/edito por ultima vez, solo para referencia.
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Identificador estable para servicios estructurales (regimenes de
  -- contabilidad mensual y adicionales predefinidos). Null para servicios
  -- genericos agregados libremente desde Configuracion.
  clave text,
  concepto text not null,
  tipo text not null default 'fijo' check (tipo in ('fijo', 'por_bloque')),
  -- 'fijo': precio unitario que se multiplica por la cantidad capturada.
  -- 'por_bloque': precio del primer bloque (0 a tamano_bloque unidades,
  -- inclusive).
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

-- Evita sembrar dos veces el mismo servicio estructural para un despacho.
create unique index if not exists servicios_despacho_clave_unique
  on public.servicios (despacho_id, clave)
  where clave is not null;

create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  despacho_id uuid not null references public.despachos (id) on delete cascade,
  -- Quien la creo, solo para referencia.
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Folio secuencial por despacho (1, 2, 3...), lo asigna el trigger de
  -- abajo. Compartido entre el dueno y sus colaboradores.
  numero integer not null,
  prospecto text not null,
  correo_prospecto text,
  notas text,
  -- Partidas congeladas al momento de cotizar: [{ servicioId, concepto,
  -- precioUnitario, cantidad, importe, cantidadBase, unidadBase, esAnual,
  -- incrementoBloque, tamanoBloque }]
  partidas jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  -- Tasa de IVA aplicada a esta cotizacion: 0.16 (general) o 0.08 (zona
  -- fronteriza). Se congela por cotizacion, un mismo despacho puede tener
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

alter table public.cotizaciones add constraint cotizaciones_despacho_numero_unique unique (despacho_id, numero);

-- Asigna automaticamente el siguiente folio (por despacho) a cada
-- cotizacion nueva, para no depender de que el cliente lo calcule.
create or replace function public.asignar_numero_cotizacion()
returns trigger as $$
begin
  if new.numero is null then
    select coalesce(max(numero), 0) + 1 into new.numero
    from public.cotizaciones
    where despacho_id = new.despacho_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_asignar_numero_cotizacion
before insert on public.cotizaciones
for each row execute function public.asignar_numero_cotizacion();

-- Datos bancarios del despacho, para mostrarlos en el documento imprimible
-- de cada cotizacion. Una fila por despacho, solo el dueno los edita.
create table if not exists public.datos_pago (
  despacho_id uuid primary key references public.despachos (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  beneficiario text,
  banco text,
  clabe text,
  numero_cuenta text,
  tarjeta text,
  updated_at timestamptz not null default now()
);

-- Textos reutilizables del documento imprimible (membrete, alcance del
-- proyecto, notas legales, firma). Una fila por despacho, solo el dueno
-- los edita, se usan igual en todas las cotizaciones del despacho.
create table if not exists public.plantilla_documento (
  despacho_id uuid primary key references public.despachos (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
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

create index if not exists servicios_despacho_id_idx on public.servicios (despacho_id);
create index if not exists cotizaciones_despacho_id_idx on public.cotizaciones (despacho_id);
create index if not exists cotizaciones_fecha_aceptada_idx on public.cotizaciones (fecha_aceptada);

alter table public.despachos enable row level security;
alter table public.miembros_despacho enable row level security;
alter table public.servicios enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.datos_pago enable row level security;
alter table public.plantilla_documento enable row level security;

-- Todo se filtra por membresia al despacho. Cotizaciones y servicios son
-- CRUD completo para cualquier miembro (dueno o colaborador); datos_pago
-- y plantilla_documento son de solo lectura para colaboradores, solo el
-- dueno los edita.

create policy "despachos_select_miembros" on public.despachos
  for select using (public.es_miembro_despacho(id));

create policy "despachos_insert_propio" on public.despachos
  for insert with check (auth.uid() is not null);

create policy "despachos_update_dueno" on public.despachos
  for update using (public.es_dueno_despacho(id)) with check (public.es_dueno_despacho(id));

create policy "miembros_select_mismo_despacho" on public.miembros_despacho
  for select using (public.es_miembro_despacho(despacho_id));

create policy "miembros_insert_propio_o_dueno" on public.miembros_despacho
  for insert with check (
    user_id = auth.uid() or public.es_dueno_despacho(despacho_id)
  );

create policy "miembros_delete_dueno" on public.miembros_despacho
  for delete using (public.es_dueno_despacho(despacho_id) and user_id <> auth.uid());

create policy "servicios_select_miembros" on public.servicios
  for select using (public.es_miembro_despacho(despacho_id));

create policy "servicios_insert_miembros" on public.servicios
  for insert with check (public.es_miembro_despacho(despacho_id));

create policy "servicios_update_miembros" on public.servicios
  for update using (public.es_miembro_despacho(despacho_id)) with check (public.es_miembro_despacho(despacho_id));

create policy "servicios_delete_miembros" on public.servicios
  for delete using (public.es_miembro_despacho(despacho_id));

create policy "cotizaciones_select_miembros" on public.cotizaciones
  for select using (public.es_miembro_despacho(despacho_id));

create policy "cotizaciones_insert_miembros" on public.cotizaciones
  for insert with check (public.es_miembro_despacho(despacho_id));

create policy "cotizaciones_update_miembros" on public.cotizaciones
  for update using (public.es_miembro_despacho(despacho_id)) with check (public.es_miembro_despacho(despacho_id));

create policy "cotizaciones_delete_miembros" on public.cotizaciones
  for delete using (public.es_miembro_despacho(despacho_id));

create policy "datos_pago_select_miembros" on public.datos_pago
  for select using (public.es_miembro_despacho(despacho_id));

create policy "datos_pago_insert_dueno" on public.datos_pago
  for insert with check (public.es_dueno_despacho(despacho_id));

create policy "datos_pago_update_dueno" on public.datos_pago
  for update using (public.es_dueno_despacho(despacho_id)) with check (public.es_dueno_despacho(despacho_id));

create policy "datos_pago_delete_dueno" on public.datos_pago
  for delete using (public.es_dueno_despacho(despacho_id));

create policy "plantilla_documento_select_miembros" on public.plantilla_documento
  for select using (public.es_miembro_despacho(despacho_id));

create policy "plantilla_documento_insert_dueno" on public.plantilla_documento
  for insert with check (public.es_dueno_despacho(despacho_id));

create policy "plantilla_documento_update_dueno" on public.plantilla_documento
  for update using (public.es_dueno_despacho(despacho_id)) with check (public.es_dueno_despacho(despacho_id));

create policy "plantilla_documento_delete_dueno" on public.plantilla_documento
  for delete using (public.es_dueno_despacho(despacho_id));
