"use client";

import { useActionState, useMemo, useState } from "react";
import { crearCotizacion, type CotizacionFormState } from "../actions";
import {
  calcularTotales,
  precioPorBloque,
  TASA_IVA_DEFAULT,
  TASAS_IVA,
} from "@/lib/quotes";
import { formatoMoneda } from "@/lib/format";
import { CLAVES_REGIMEN } from "@/lib/types";
import type { Partida, Servicio } from "@/lib/types";

const ESTADO_INICIAL: CotizacionFormState = { error: null };

export function ConstructorCotizacion({
  servicios,
}: {
  servicios: Servicio[];
}) {
  const porClave = useMemo(() => {
    const mapa: Record<string, Servicio> = {};
    for (const s of servicios) if (s.clave) mapa[s.clave] = s;
    return mapa;
  }, [servicios]);

  const regimenes = useMemo(
    () =>
      (CLAVES_REGIMEN as readonly string[])
        .map((clave) => porClave[clave])
        .filter((s): s is Servicio => Boolean(s)),
    [porClave]
  );

  const genericos = useMemo(() => servicios.filter((s) => !s.clave), [servicios]);

  const nomina = porClave["nomina"];
  const contabilidadElectronica = porClave["contabilidad_electronica"];
  const estadoCuenta = porClave["estado_cuenta"];
  const facturas = porClave["generacion_facturas"];
  const cuestionarioQr = porClave["cuestionario_qr"];
  const altaRegistroPatronal = porClave["alta_registro_patronal"];
  const repseAlta = porClave["repse_alta"];
  const repseDeclaracion = porClave["repse_declaracion"];

  const [tasaIva, setTasaIva] = useState<number>(TASA_IVA_DEFAULT);

  // --- Regimen fiscal y contabilidad mensual ---
  const [regimenId, setRegimenId] = useState<string>("");
  const [cfdiCantidad, setCfdiCantidad] = useState<number>(0);
  const [incluirAnual, setIncluirAnual] = useState<boolean>(false);

  // --- Adicionales ---
  const [nominaActiva, setNominaActiva] = useState<boolean>(false);
  const [empleados, setEmpleados] = useState<number>(0);

  const [contabElectronicaActiva, setContabElectronicaActiva] =
    useState<boolean>(false);

  const [estadoCuentaActivo, setEstadoCuentaActivo] = useState<boolean>(false);
  const [estadosCantidad, setEstadosCantidad] = useState<number>(1);

  const [facturasActivo, setFacturasActivo] = useState<boolean>(false);
  const [facturasCantidad, setFacturasCantidad] = useState<number>(0);

  const [cuestionarioQrActivo, setCuestionarioQrActivo] =
    useState<boolean>(false);

  const [altaRegistroPatronalActivo, setAltaRegistroPatronalActivo] =
    useState<boolean>(false);

  const [repseAltaActivo, setRepseAltaActivo] = useState<boolean>(false);
  const [repseDeclaracionActivo, setRepseDeclaracionActivo] =
    useState<boolean>(false);

  // --- Otros servicios genericos (clave = null) ---
  const [seleccionGenericos, setSeleccionGenericos] = useState<
    Record<string, { checked: boolean; cantidad: number }>
  >(() => {
    const base: Record<string, { checked: boolean; cantidad: number }> = {};
    for (const s of genericos) {
      base[s.id] = { checked: false, cantidad: 1 };
    }
    return base;
  });

  const [state, formAction, pending] = useActionState(
    crearCotizacion,
    ESTADO_INICIAL
  );

  const regimenSeleccionado = regimenes.find((s) => s.id === regimenId);

  const partidas: Partida[] = useMemo(() => {
    const resultado: Partida[] = [];

    if (regimenSeleccionado) {
      const precio = precioPorBloque(
        cfdiCantidad,
        regimenSeleccionado.precio,
        regimenSeleccionado.incremento_bloque ?? 0,
        regimenSeleccionado.tamano_bloque ?? 1
      );
      resultado.push({
        servicioId: regimenSeleccionado.id,
        concepto: regimenSeleccionado.concepto,
        precioUnitario: precio,
        cantidad: 1,
        importe: precio,
        cantidadBase: cfdiCantidad,
        unidadBase: regimenSeleccionado.unidad,
      });

      if (incluirAnual) {
        const etiqueta = regimenSeleccionado.concepto.replace(
          /^Contabilidad Mensual/,
          "Declaracion Anual"
        );
        resultado.push({
          servicioId: regimenSeleccionado.id,
          concepto: etiqueta,
          precioUnitario: precio,
          cantidad: 1,
          importe: precio,
          cantidadBase: cfdiCantidad,
          unidadBase: regimenSeleccionado.unidad,
          esAnual: true,
        });
      }
    }

    if (nominaActiva && nomina) {
      const precio = precioPorBloque(
        empleados,
        nomina.precio,
        nomina.incremento_bloque ?? 0,
        nomina.tamano_bloque ?? 1
      );
      resultado.push({
        servicioId: nomina.id,
        concepto: nomina.concepto,
        precioUnitario: precio,
        cantidad: 1,
        importe: precio,
        cantidadBase: empleados,
        unidadBase: nomina.unidad,
      });
    }

    if (contabElectronicaActiva && contabilidadElectronica) {
      resultado.push({
        servicioId: contabilidadElectronica.id,
        concepto: contabilidadElectronica.concepto,
        precioUnitario: contabilidadElectronica.precio,
        cantidad: 1,
        importe: contabilidadElectronica.precio,
      });
    }

    if (estadoCuentaActivo && estadoCuenta) {
      const cantidad = Math.max(1, estadosCantidad);
      resultado.push({
        servicioId: estadoCuenta.id,
        concepto: estadoCuenta.concepto,
        precioUnitario: estadoCuenta.precio,
        cantidad,
        importe: Math.round(estadoCuenta.precio * cantidad * 100) / 100,
      });
    }

    if (facturasActivo && facturas) {
      const precio = precioPorBloque(
        facturasCantidad,
        facturas.precio,
        facturas.incremento_bloque ?? 0,
        facturas.tamano_bloque ?? 1
      );
      resultado.push({
        servicioId: facturas.id,
        concepto: facturas.concepto,
        precioUnitario: precio,
        cantidad: 1,
        importe: precio,
        cantidadBase: facturasCantidad,
        unidadBase: facturas.unidad,
      });
    }

    if (cuestionarioQrActivo && cuestionarioQr) {
      resultado.push({
        servicioId: cuestionarioQr.id,
        concepto: cuestionarioQr.concepto,
        precioUnitario: cuestionarioQr.precio,
        cantidad: 1,
        importe: cuestionarioQr.precio,
      });
    }

    if (altaRegistroPatronalActivo && altaRegistroPatronal) {
      resultado.push({
        servicioId: altaRegistroPatronal.id,
        concepto: altaRegistroPatronal.concepto,
        precioUnitario: altaRegistroPatronal.precio,
        cantidad: 1,
        importe: altaRegistroPatronal.precio,
      });
    }

    if (repseAltaActivo && repseAlta) {
      resultado.push({
        servicioId: repseAlta.id,
        concepto: repseAlta.concepto,
        precioUnitario: repseAlta.precio,
        cantidad: 1,
        importe: repseAlta.precio,
      });
    }

    if (repseDeclaracionActivo && repseDeclaracion) {
      resultado.push({
        servicioId: repseDeclaracion.id,
        concepto: repseDeclaracion.concepto,
        precioUnitario: repseDeclaracion.precio,
        cantidad: 1,
        importe: repseDeclaracion.precio,
      });
    }

    for (const s of genericos) {
      const sel = seleccionGenericos[s.id];
      if (sel?.checked) {
        const cantidad = Math.max(1, sel.cantidad);
        resultado.push({
          servicioId: s.id,
          concepto: s.concepto,
          precioUnitario: s.precio,
          cantidad,
          importe: Math.round(s.precio * cantidad * 100) / 100,
        });
      }
    }

    return resultado;
  }, [
    regimenSeleccionado,
    cfdiCantidad,
    incluirAnual,
    nominaActiva,
    nomina,
    empleados,
    contabElectronicaActiva,
    contabilidadElectronica,
    estadoCuentaActivo,
    estadoCuenta,
    estadosCantidad,
    facturasActivo,
    facturas,
    facturasCantidad,
    cuestionarioQrActivo,
    cuestionarioQr,
    altaRegistroPatronalActivo,
    altaRegistroPatronal,
    repseAltaActivo,
    repseAlta,
    repseDeclaracionActivo,
    repseDeclaracion,
    genericos,
    seleccionGenericos,
  ]);

  const totales = calcularTotales(partidas, tasaIva);

  function actualizarGenerico(
    servicioId: string,
    cambios: Partial<{ checked: boolean; cantidad: number }>
  ) {
    setSeleccionGenericos((prev) => ({
      ...prev,
      [servicioId]: { ...prev[servicioId], ...cambios },
    }));
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-superficie border border-borde rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1">
              Prospecto
            </label>
            <input
              type="text"
              name="prospecto"
              required
              placeholder="Nombre del prospecto o empresa"
              className="w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1">
              Correo del Prospecto (Opcional)
            </label>
            <input
              type="email"
              name="correo_prospecto"
              placeholder="para poder mandarle la cotizacion despues"
              className="w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1">
              Notas (Opcional)
            </label>
            <textarea
              name="notas"
              rows={2}
              className="w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-texto-suave mb-2">
              IVA Aplicable
            </span>
            <div className="flex gap-4">
              {TASAS_IVA.map((tasa) => (
                <label
                  key={tasa}
                  className="flex items-center gap-2 text-sm text-texto"
                >
                  <input
                    type="radio"
                    name="tasa_iva_ui"
                    checked={tasaIva === tasa}
                    onChange={() => setTasaIva(tasa)}
                    className="h-4 w-4 accent-primario"
                  />
                  {Math.round(tasa * 100)}%{" "}
                  {tasa === 0.08 ? "(Zona Fronteriza)" : "(General)"}
                </label>
              ))}
            </div>
          </div>
        </div>

        {regimenes.length > 0 && (
          <div className="bg-superficie border border-borde rounded-2xl p-5 space-y-4">
            <h2 className="text-texto font-medium text-sm">
              Regimen Fiscal y Contabilidad Mensual
            </h2>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-texto-suave">
                <input
                  type="radio"
                  name="regimen_ui"
                  checked={regimenId === ""}
                  onChange={() => setRegimenId("")}
                  className="h-4 w-4 accent-primario"
                />
                Ninguno (No Incluir Contabilidad Mensual)
              </label>
              {regimenes.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-texto"
                >
                  <input
                    type="radio"
                    name="regimen_ui"
                    checked={regimenId === s.id}
                    onChange={() => setRegimenId(s.id)}
                    className="h-4 w-4 accent-primario"
                  />
                  {s.concepto.replace(/^Contabilidad Mensual — /, "")}
                </label>
              ))}
            </div>

            {regimenSeleccionado && (
              <div className="border-t border-borde pt-4 space-y-3">
                <label className="block text-sm">
                  <span className="text-texto-suave">
                    {regimenSeleccionado.unidad ?? "Cantidad"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={cfdiCantidad}
                    onChange={(e) =>
                      setCfdiCantidad(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full mt-1 rounded-lg border border-borde bg-transparent px-3 py-2 font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
                  />
                </label>
                <p className="text-sm text-texto-suave">
                  Contabilidad Mensual:{" "}
                  <span className="font-mono tabular-nums text-texto">
                    {formatoMoneda(
                      precioPorBloque(
                        cfdiCantidad,
                        regimenSeleccionado.precio,
                        regimenSeleccionado.incremento_bloque ?? 0,
                        regimenSeleccionado.tamano_bloque ?? 1
                      )
                    )}
                  </span>
                </p>
                <label className="flex items-center gap-2 text-sm text-texto">
                  <input
                    type="checkbox"
                    checked={incluirAnual}
                    onChange={(e) => setIncluirAnual(e.target.checked)}
                    className="h-4 w-4 accent-primario"
                  />
                  Incluir Declaracion Anual (Mismo Importe que 1 Mensualidad)
                </label>
              </div>
            )}
          </div>
        )}

        <div className="bg-superficie border border-borde rounded-2xl p-5 space-y-4">
          <h2 className="text-texto font-medium text-sm">Adicionales</h2>

          {contabilidadElectronica && (
            <label className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={contabElectronicaActiva}
                onChange={(e) => setContabElectronicaActiva(e.target.checked)}
                className="h-4 w-4 accent-primario"
              />
              {contabilidadElectronica.concepto} (
              {formatoMoneda(contabilidadElectronica.precio)})
            </label>
          )}

          {nomina && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-texto">
                <input
                  type="checkbox"
                  checked={nominaActiva}
                  onChange={(e) => setNominaActiva(e.target.checked)}
                  className="h-4 w-4 accent-primario"
                />
                {nomina.concepto}
              </label>
              {nominaActiva && (
                <div className="pl-6 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2 text-texto-suave">
                    {nomina.unidad ?? "empleados"}
                    <input
                      type="number"
                      min={0}
                      value={empleados}
                      onChange={(e) =>
                        setEmpleados(Math.max(0, Number(e.target.value) || 0))
                      }
                      className="w-24 rounded-lg border border-borde bg-transparent px-2 py-1 font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
                    />
                  </label>
                  <span className="font-mono tabular-nums text-texto">
                    {formatoMoneda(
                      precioPorBloque(
                        empleados,
                        nomina.precio,
                        nomina.incremento_bloque ?? 0,
                        nomina.tamano_bloque ?? 1
                      )
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {estadoCuenta && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-texto">
                <input
                  type="checkbox"
                  checked={estadoCuentaActivo}
                  onChange={(e) => setEstadoCuentaActivo(e.target.checked)}
                  className="h-4 w-4 accent-primario"
                />
                {estadoCuenta.concepto} ({formatoMoneda(estadoCuenta.precio)}{" "}
                c/u)
              </label>
              {estadoCuentaActivo && (
                <div className="pl-6 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2 text-texto-suave">
                    {estadoCuenta.unidad ?? "cantidad"}
                    <input
                      type="number"
                      min={1}
                      value={estadosCantidad}
                      onChange={(e) =>
                        setEstadosCantidad(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="w-20 rounded-lg border border-borde bg-transparent px-2 py-1 font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {facturas && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-texto">
                <input
                  type="checkbox"
                  checked={facturasActivo}
                  onChange={(e) => setFacturasActivo(e.target.checked)}
                  className="h-4 w-4 accent-primario"
                />
                {facturas.concepto}
              </label>
              {facturasActivo && (
                <div className="pl-6 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2 text-texto-suave">
                    {facturas.unidad ?? "facturas"}
                    <input
                      type="number"
                      min={0}
                      value={facturasCantidad}
                      onChange={(e) =>
                        setFacturasCantidad(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-24 rounded-lg border border-borde bg-transparent px-2 py-1 font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
                    />
                  </label>
                  <span className="font-mono tabular-nums text-texto">
                    {formatoMoneda(
                      precioPorBloque(
                        facturasCantidad,
                        facturas.precio,
                        facturas.incremento_bloque ?? 0,
                        facturas.tamano_bloque ?? 1
                      )
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {cuestionarioQr && (
            <label className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={cuestionarioQrActivo}
                onChange={(e) => setCuestionarioQrActivo(e.target.checked)}
                className="h-4 w-4 accent-primario"
              />
              {cuestionarioQr.concepto} ({formatoMoneda(cuestionarioQr.precio)})
            </label>
          )}

          {altaRegistroPatronal && (
            <label className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={altaRegistroPatronalActivo}
                onChange={(e) =>
                  setAltaRegistroPatronalActivo(e.target.checked)
                }
                className="h-4 w-4 accent-primario"
              />
              {altaRegistroPatronal.concepto} (
              {formatoMoneda(altaRegistroPatronal.precio)})
            </label>
          )}

          {repseAlta && (
            <label className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={repseAltaActivo}
                onChange={(e) => setRepseAltaActivo(e.target.checked)}
                className="h-4 w-4 accent-primario"
              />
              {repseAlta.concepto} ({formatoMoneda(repseAlta.precio)})
            </label>
          )}

          {repseDeclaracion && (
            <label className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={repseDeclaracionActivo}
                onChange={(e) => setRepseDeclaracionActivo(e.target.checked)}
                className="h-4 w-4 accent-primario"
              />
              {repseDeclaracion.concepto} (
              {formatoMoneda(repseDeclaracion.precio)})
            </label>
          )}
        </div>

        {genericos.length > 0 && (
          <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-texto-suave border-b border-borde">
                  <th className="px-5 py-3 font-medium w-10"></th>
                  <th className="px-5 py-3 font-medium">Otros Servicios</th>
                  <th className="px-5 py-3 font-medium text-right w-28">
                    Precio
                  </th>
                  <th className="px-5 py-3 font-medium text-right w-24">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {genericos.map((s) => (
                  <tr key={s.id} className="border-b border-borde last:border-0">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={seleccionGenericos[s.id]?.checked ?? false}
                        onChange={(e) =>
                          actualizarGenerico(s.id, { checked: e.target.checked })
                        }
                        className="h-4 w-4 accent-primario"
                      />
                    </td>
                    <td className="px-5 py-3 text-texto">{s.concepto}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-texto-suave">
                      {formatoMoneda(s.precio)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <input
                        type="number"
                        min={1}
                        value={seleccionGenericos[s.id]?.cantidad ?? 1}
                        onChange={(e) =>
                          actualizarGenerico(s.id, {
                            cantidad: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        disabled={!seleccionGenericos[s.id]?.checked}
                        className="w-16 rounded-lg border border-borde bg-transparent px-2 py-1 text-right font-mono tabular-nums text-texto disabled:opacity-40 focus:outline-none focus:border-primario"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-superficie border border-borde rounded-2xl p-6 sticky top-6">
          <div className="flex justify-between text-texto-suave text-sm mb-1">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(totales.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-texto-suave text-sm mb-3">
            <span>IVA ({Math.round(tasaIva * 100)}%)</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(totales.iva)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-borde pt-3 mb-5">
            <span className="text-texto font-medium">Total</span>
            <span className="text-3xl font-semibold text-primario font-mono tabular-nums">
              {formatoMoneda(totales.total)}
            </span>
          </div>

          <input
            type="hidden"
            name="partidas"
            value={JSON.stringify(partidas)}
            readOnly
          />
          <input type="hidden" name="tasa_iva" value={tasaIva} readOnly />

          {state.error && (
            <p className="text-sm text-peligro mb-3">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || partidas.length === 0}
            className="w-full bg-primario hover:bg-primario-hover disabled:opacity-50 transition-colors text-white font-medium rounded-lg py-3"
          >
            {pending ? "Guardando..." : "Guardar Cotizacion"}
          </button>
        </div>
      </div>
    </form>
  );
}
