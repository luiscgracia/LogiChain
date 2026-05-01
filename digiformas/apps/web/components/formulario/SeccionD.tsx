/**
 * Componente: SeccionD_Documentacion
 * Sección D: Documentación Adicional
 */

"use client";

import { FileCheck } from "lucide-react";

interface Documento {
  tipo: string;
  requerido: boolean;
  numero: string | null;
}

interface Documentacion {
  [key: string]: Documento;
}

interface Props {
  documentacion: Documentacion;
  onChange: (doc: Documentacion) => void;
  riesgos: { [key: string]: "SI" | "NO" | null };
  readonly?: boolean;
}

const DOCUMENTOS_DEFAULT: Documento[] = [
  { tipo: "Permiso de Trabajo en Alturas", requerido: false, numero: null },
  { tipo: "Permiso de Espacios Confinados", requerido: false, numero: null },
  { tipo: "Permiso de Aislamiento de Energía (LOTO)", requerido: false, numero: null },
  { tipo: "Autorización de Excavación", requerido: false, numero: null },
  { tipo: "Análisis de Riesgo (ATS)", requerido: true, numero: null },
  { tipo: "Certificado de Gases", requeridor: false, numero: null },
  { tipo: "Permiso de Oxicorte", requeridor: false, numero: null },
  { tipo: "Permiso de Presurización", requerido: false, numero: null },
  { tipo: "Permiso de Trabajo Eléctrico", requerido: false, numero: null },
];

export function SeccionD({ documentacion, onChange, riesgos, readonly = false }: Props) {
  // Determinar qué documentos son obligatorios según los riesgos
  const getDocumentosRequerridos = (): Documento[] => {
    return DOCUMENTOS_DEFAULT.map((doc) => {
      let requerido = doc.tipo === "Análisis de Riesgo (ATS)" || doc.tipo === "Análisis de Riesgo (ATS)";
      
      // 根据 riesgos activar documentos
      if (riesgos.item_06 === "SI" && doc.tipo.includes("Alturas")) {
        requerido = true;
      }
      if (riesgos.item_05 === "SI" && doc.tipo.includes("Espacios Confinados")) {
        requerido = true;
      }
      if (riesgos.item_29 === "SI" && doc.tipo.includes("Aislamiento")) {
        requerido = true;
      }
      if (riesgos.item_17 === "SI" || riesgos.item_18 === "SI" || riesgos.item_19 === "SI") {
        if (doc.tipo.includes("Excavación")) {
          requerido = true;
        }
      }
      if (riesgos.item_24 === "SI" && doc.tipo.includes("Oxicorte")) {
        requerido = true;
      }
      if (riesgos.item_32 === "SI" && doc.tipo.includes("Presurización")) {
        requerido = true;
      }
      if (riesgos.item_30 === "SI" && doc.tipo.includes("Eléctrico")) {
        requerido = true;
      }
      
      return { ...doc, requerido };
    });
  };

  const handleToggle = (key: string, checked: boolean) => {
    onChange({
      ...documentacion,
      [key]: {
        ...documentacion[key],
        tipo: DOCUMENTOS_DEFAULT.find((d) => d.tipo === key)?.tipo || key,
        requeridor: checked,
        numero: checked ? (documentacion[key]?.numero || null) : null,
      },
    });
  };

  const handleNumero = (key: string, numero: string) => {
    onChange({
      ...documentacion,
      [key]: {
        ...documentacion[key],
        numero: numero || null,
      },
    });
  };

  const documentos = getDocumentosRequerridos();
  const totalCompletos = documentos.filter(
    (d) => !d.requerido || (d.requerido && d.numero)
  ).length;

  return (
    <div className="card space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <FileCheck className="w-5 h-5" />
        Sección D: Documentación Adicional
      </h2>

      <div className="space-y-3">
        {documentos.map((doc, idx) => {
          const key = `doc_${idx}`;
          const data = documentacion[key] || { tipo: doc.tipo, requeridor: doc.requerido, numero: doc.numero };
          const docKey = Object.keys(documentacion).find(
            (k) => documentacion[k]?.tipo === doc.tipo
          );
          const isChecked = docKey ? documentacion[docKey]?.requeridor : doc.requerido;
          const numero = docKey ? documentacion[docKey]?.numero : data.numero;

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isChecked && !numero
                  ? "border-amber-300 bg-amber-50"
                  : isChecked && numero
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggle(key, e.target.checked)}
                  disabled={readonly}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <label className="font-medium text-gray-900">
                    {doc.tipo}
                    {doc.requerido && (
                      <span className="ml-2 text-xs text-red-600">*Obligatorio</span>
                    )}
                  </label>
                  
                  {isChecked && (
                    <input
                      type="text"
                      value={numero || ""}
                      onChange={(e) => handleNumero(key, e.target.value)}
                      placeholder={`Número de ${doc.tipo}`}
                      className="mt-2 input-field text-sm"
                      disabled={readonly}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation status */}
      <div className={`p-3 rounded-lg ${
        totalCompletos === documentos.length
          ? "bg-green-50 border border-green-200"
          : "bg-amber-50 border border-amber-200"
      }`}>
        <p className={`text-sm ${
          totalCompletos === documentos.length
            ? "text-green-700"
            : "text-amber-700"
        }`}>
          Documentos completados: {totalCompletos}/{documentos.length}
          {totalCompletos < documentos.length && " - Faltan documentos obligatorios"}
        </p>
      </div>
    </div>
  );
}