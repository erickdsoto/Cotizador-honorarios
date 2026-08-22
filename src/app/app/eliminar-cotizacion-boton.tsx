"use client";

import { eliminarCotizacion } from "./actions";

export function EliminarCotizacionBoton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <form
      action={eliminarCotizacion.bind(null, id)}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("¿Borrar esta cotizacion? No se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className={className ?? "text-texto-suave hover:text-peligro text-xs"}
      >
        Eliminar
      </button>
    </form>
  );
}
