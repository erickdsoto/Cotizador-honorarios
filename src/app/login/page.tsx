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

          <div className="bg-tarjeta text-gray-900 rounded-2xl shadow-xl p-8">
            <h2 className="text-lg font-semibold mb-1">Recuperar Contrasena</h2>

            {recuperarState.enviado ? (
              <>
                <p className="text-sm text-gray-600 mt-3 mb-6">
                  Si ese correo tiene una cuenta, te acabamos de mandar un
                  link para poner una contrasena nueva. Revisa tambien tu
                  carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={() => setModo("login")}
                  className="w-full border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 font-medium rounded-lg py-3"
                >
                  Volver a Iniciar Sesion
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Te mandamos un link a tu correo para poner una contrasena
                  nueva.
                </p>
                <form action={recuperarAction} className="space-y-4">
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

                  {recuperarState.error && (
                    <p className="text-sm text-peligro">
                      {recuperarState.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={recuperarPending}
                    className="w-full bg-primario hover:bg-primario-hover disabled:opacity-60 transition-colors text-white font-medium rounded-lg py-3"
                  >
                    {recuperarPending
                      ? "Un Momento..."
                      : "Enviar Link de Recuperacion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModo("login")}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Volver a Iniciar Sesion
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contrasena
                </label>
                {modo === "login" && (
                  <button
                    type="button"
                    onClick={() => setModo("recuperar")}
                    className="text-xs text-primario hover:underline"
                  >
                    ¿Olvidaste tu contrasena?
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
