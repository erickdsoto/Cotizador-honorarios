# Cotizador de Honorarios

Cotizador de honorarios contables. Catalogo de servicios propio y
cotizaciones por prospecto que calculan subtotal, IVA (16%) y total
automaticamente. Cada usuario ve unicamente su propio catalogo y sus
propias cotizaciones.

Ver el detalle funcional completo en [PROMPT.md](./PROMPT.md).

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Authentication → Providers → Email**, desactiva "Confirm email"
   para que el registro no requiera confirmar el correo (segun el punto 2
   del prompt).
3. Abre el **SQL Editor** y ejecuta el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea las tablas
   `servicios` y `cotizaciones` con Row Level Security por usuario.
4. En **Project Settings → API**, copia la `Project URL` y la `anon public
   key`.

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Pega la URL y la anon key de tu proyecto en `.env.local`.

### 3. Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Al registrarte, tu
catalogo se siembra automaticamente con los servicios de ejemplo del
prompt (editables despues en **Catalogo**).

### 4. Publicar en Vercel

1. Sube el repositorio a GitHub y crea un proyecto en
   [vercel.com](https://vercel.com) apuntando a el.
2. Agrega las mismas variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en **Project Settings → Environment
   Variables**.
3. Despliega. No se requiere configuracion adicional.

## Stack

Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth, RLS).
Sin librerias de UI adicionales ni manejadores de estado externos.
