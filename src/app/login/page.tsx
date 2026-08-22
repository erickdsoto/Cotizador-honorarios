"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "./actions";

const ESTADO_INICIAL: AuthState = { error: null };

export default function LoginPage() {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [loginState, loginAction, loginPending] = useActionState(
    signIn,
    ESTADO_INICIAL
  );
  const [registroState, registroAction, registroPending] = useActionState(
    signUp,
    ESTADO_INICIAL
  );

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

        <div className="bg-tarjeta text-gray-900 rounded-2xl shadow-xl p-8">
          <div className="flex mb-6 rounded-lg bg-gray-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setModo("login")}
              className={`flex-1 rounded-md py-2 transition-colors ${
                modo === "login"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Iniciar Sesion
            </button>
            <button
              type="button"
              onClick={() => setModo("registro")}
              className={`flex-1 rounded-md py-2 transition-colors ${
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="tu@despacho.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contrasena
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete={
                  modo === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <p className="text-sm text-peligro">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primario hover:bg-primario-hover disabled:opacity-60 transition-colors text-white font-medium rounded-lg py-3"
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
