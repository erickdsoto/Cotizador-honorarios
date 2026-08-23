"use client";

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg px-5 py-2.5"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
