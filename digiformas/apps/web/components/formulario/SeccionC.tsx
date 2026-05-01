/**
 * Componente: SeccionC_Riesgos
 * Sección C: Identificación de Riesgos (36 items)
 */

"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { RIESGOS_MAP, CATEGORIAS_RIESGO } from "../../../../services/database/src/riesgos";

type Respuesta = "SI" | "NO" | null;

interface Riesgos {
  [key: string]: Respuesta;
}

interface Props {
  riesgos: Riesgos;
  onChange: (riesgos: Riesgos) => void;
  readonly?: boolean;
}

export function SeccionC({ riesgos, onChange, readonly = false }: Props) {
  const [categoriaExpandida, setCategoriaExpandida] = useState<string>("Generales");

  const handleChange = (itemId: number, respuesta: "SI" | "NO") => {
    onChange({
      ...riesgos,
      [`item_${itemId.toString().padStart(2, "0")}`]: respuesta,
    });
  };

  const [expandidas, setExpandidas] = useState<Set<string>>(new Set(["Generales"]));

  const toggleCategoria = (categoria: string) => {
    const nuevas = new Set(expandidas);
    if (nuevas.has(categoria)) {
      nuevas.delete(categoria);
    } else {
      nuevas.add(categoria);
    }
    setExpandidas(nuevas);
  };

  // Contar respuestas
  const totalRespondidos = Object.values(riesgos).filter((v) => v !== null).length;
  const progreso = Math.round((totalRespondidos / 36) * 100);

  return (
    <div className="card space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Sección C: Identificación de Riesgos
      </h2>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progreso: {totalRespondidos}/36</span>
          <span className="font-medium">{progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progreso === 100 ? "bg-green-500" : "bg-primary-500"
            }`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Categorías como accordions */}
      {CATEGORIAS_RIESGO.map((categoria) => {
        const riesgosCategoria = RIESGOS_MAP.filter((r) => r.categoria === categoria.id);
        const expandida = expandidas.has(categoria.id);
        const respondidos = riesgosCategoria.filter(
          (r) => riesgos[`item_${r.id.toString().padStart(2, "0")}`] !== null
        ).length;

        return (
          <div key={categoria.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header de categoría */}
            <button
              onClick={() => toggleCategoria(categoria.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              disabled={readonly}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{categoria.titulo}</span>
                <span className="text-sm text-gray-500">
                  ({respondidos}/{riesgosCategoria.length})
                </span>
              </div>
              {expandida ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Riesgos de la categoría */}
            {expandida && (
              <div className="border-t border-gray-200">
                {riesgosCategoria.map((riesgo) => (
                  <RiesgoItem
                    key={riesgo.id}
                    riesgo={riesgo}
                    respuesta={
                      riesgos[`item_${riesgo.id.toString().padStart(2, "0")}`]
                    }
                    onChange={(resp) => handleChange(riesgo.id, resp)}
                    readonly={readonly}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Validaciones cruzadas */}
      {totalRespondidos === 36 && (
        <ValidacionesCruzadas riesgos={riesgos} />
      )}
    </div>
  );
}

interface RiesgoItemProps {
  riesgo: (typeof RIESGOS_MAP)[number];
  respuesta: Respuesta;
  onChange: (respuesta: "SI" | "NO") => void;
  readonly: boolean;
}

function RiesgoItem({ riesgo, respuesta, onChange, readonly }: RiesgoItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 pr-4">
        <span className="text-sm text-gray-900">
          <span className="font-medium">{riesgo.id}.</span> {riesgo.pregunta}
        </span>
        {riesgo.requiereSME && respuesta === "SI" && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Requiere SME
          </span>
        )}
        {riesgo.requiereDocumento && respuesta === "SI" && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Requiere Documento
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => onChange("SI")}
          disabled={readonly}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            respuesta === "SI"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-green-100"
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-1" />
          SÍ
        </button>
        <button
          onClick={() => onChange("NO")}
          disabled={readonly}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            respuesta === "NO"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-red-100"
          }`}
        >
          <XCircle className="w-4 h-4 inline mr-1" />
          NO
        </button>
      </div>
    </div>
  );
}

interface ValidacionesProps {
  riesgos: Riesgos;
}

function ValidacionesCruzadas({ riesgos }: ValidacionesProps) {
  const problemas: string[] = [];

  // Validación: Si item 20 o 21 = SI, item 22 debe ser SI
  if (
    (riesgos.item_20 === "SI" || riesgos.item_21 === "SI") &&
    riesgos.item_22 !== "SI"
  ) {
    problemas.push(
      "Si marcó SI en manejo de sustancias peligrosas o Plomo, debe revisar las MSDS"
    );
  }

  // Validación: Espacios confinados = SI requiere SME
  if (riesgos.item_05 === "SI" && riesgos.item_34 !== "SI") {
    problemas.push(
      "El item 34 (consulta SME) debe marcarse SI para ingreso a espacios confinados"
    );
  }

  // Validación: Alturas requiere documento
  if (riesgos.item_06 === "SI") {
    problemas.push(
      "Debe ingresar documento de Permiso de Trabajo en Alturas en Sección D"
    );
  }

  if (problemas.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Todas las validaciones completadas correctamente
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
      <p className="text-sm font-medium text-amber-800">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        Validaciones pendientes:
      </p>
      <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
        {problemas.map((problema, i) => (
          <li key={i}>{problema}</li>
        ))}
      </ul>
    </div>
  );
}