"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  signIn,
  signUp,
  solicitarRecuperacion,
  type AuthState,
  type RecuperacionState,
} from "./actions";

const ESTADO_INICIAL: AuthState = { error: null };
const ESTADO_RECUPERACION: RecuperacionState = { error: null, enviado: false };

export default function LoginPage() {
  const [modo, setModo] = useState<"login" | "registro" | "recuperar">(
    "login"
  );
  const [loginState, loginAction, loginPending] = useActionState(
    signIn,
    ESTADO_INICIAL
  );
  const [registroState, registroAction, registroPending] = useActionState(
    signUp,
    ESTADO_INICIAL
  );
  const [recuperarState, recuperarAction, recuperarPending] = useActionState(
    solicitarRecuperacion,
    ESTADO_RECUPERACION
  );

  if (modo === "recuperar") {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="block text-center text-texto-suave text-sm mb-6 hover:text-texto"
          >
            ← Cotizador de Honorarios
          </Link>

          <div className="bg-tarjeta text-gray-900 rounded-3xl shadow-xl shadow-black/5 p-9">
            <h2 className="text-xl font-bold tracking-tight mb-1">
              Recuperar Contraseña
            </h2>

            {recuperarState.enviado ? (
              <>
                <p className="text-sm text-gray-500 mt-3 mb-6">
                  Si ese correo tiene una cuenta, te acabamos de mandar un
                  link para poner una contraseña nueva. Revisa también tu
                  carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={() => setModo("login")}
                  className="w-full border border-gray-200 hover:border-gray-300 transition-colors text-gray-700 font-semibold rounded-full py-3.5"
                >
                  Volver a Iniciar Sesión
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Te mandamos un link a tu correo para poner una contraseña
                  nueva.
                </p>
                <form action={recuperarAction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Correo
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="w-full rounded-2xl bg-gray-100 border border-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario"
                      placeholder="tu@despacho.com"
                    />
                  </div>

                  {recuperarState.error && (
                    <p className="text-sm text-peligro">
                      {recuperarState.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={recuperarPending}
                    className="w-full bg-texto hover:opacity-90 disabled:opacity-60 transition-opacity text-white font-semibold rounded-full py-3.5 mt-2"
                  >
                    {recuperarPending
                      ? "Un Momento..."
                      : "Enviar Link de Recuperación"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModo("login")}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Volver a Iniciar Sesión
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  const state = modo === "login" ? loginState : registroState;
  const action = modo === "login" ? loginAction : registroAction;
  const pending = modo === "login" ? loginPending : registroPending;

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-texto-suave text-sm mb-6 hover:text-texto"
        >
          ← Cotizador de Honorarios
        </Link>

        <div className="bg-tarjeta text-gray-900 rounded-3xl shadow-xl shadow-black/5 p-9">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            {modo === "login" ? "Hola de nuevo" : "Crea tu cuenta"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {modo === "login"
              ? "Entra para ver tus cotizaciones."
              : "Empieza a cotizar en minutos."}
          </p>

          <div className="flex mb-7 rounded-full bg-gray-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setModo("login")}
              className={`flex-1 rounded-full py-2.5 transition-colors ${
                modo === "login"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setModo("registro")}
              className={`flex-1 rounded-full py-2.5 transition-colors ${
                modo === "registro"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Registrarme
            </button>
          </div>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Correo
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl bg-gray-100 border border-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario"
                placeholder="tu@despacho.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Contraseña
                </label>
                {modo === "login" && (
                  <button
                    type="button"
                    onClick={() => setModo("recuperar")}
                    className="text-xs font-semibold text-primario hover:underline"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                required
                autoComplete={
                  modo === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-2xl bg-gray-100 border border-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario"
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <p className="text-sm text-peligro">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-texto hover:opacity-90 disabled:opacity-60 transition-opacity text-white font-semibold rounded-full py-3.5 mt-2"
            >
              {pending
                ? "Un Momento..."
                : modo === "login"
                ? "Entrar"
                : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
