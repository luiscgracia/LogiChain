/**
 * Componente: SeccionA_DatosTarea
 * Sección A: Identificación de Tarea
 */

"use client";

import { useState } from "react";
import { Calculator, Clock, MapPin, Package, FileText } from "lucide-react";

interface DatosTarea {
  instalacion: string;
  ubicacion: string;
  equipo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Props {
  datos: DatosTarea;
  onChange: (datos: DatosTarea) => void;
  readonly?: boolean;
}

export function SeccionA({ datos, onChange, readonly = false }: Props) {
  const handleChange = (campo: keyof DatosTarea, valor: string) => {
    onChange({ ...datos, [campo]: valor });
  };

  // Auto-completar fecha actual
  const hoy = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="card space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Sección A: Identificación de Tarea
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instalación */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Package className="w-4 h-4" />
            Instalación
          </label>
          <input
            type="text"
            value={datos.instalacion}
            onChange={(e) => handleChange("instalacion", e.target.value)}
            placeholder="-Seleccionar instalación-"
            className="input-field"
            disabled={readonly}
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="input-label flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Ubicación
          </label>
          <input
            type="text"
            value={datos.ubicacion}
            onChange={(e) => handleChange("ubicacion", e.target.value)}
            placeholder="-Ingresar ubicación-"
            className="input-field"
            disabled={readonly}
          />
        </div>

        {/* Equipo */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Equipo
          </label>
          <input
            type="text"
            value={datos.equipo}
            onChange={(e) => handleChange("equipo", e.target.value)}
            placeholder="-Ingresar equipo-"
            className="input-field"
            disabled={readonly}
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="input-label flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Fecha
          </label>
          <input
            type="text"
            value={datos.fecha || hoy}
            onChange={(e) => handleChange("fecha", e.target.value)}
            placeholder="DD/MM/AAAA"
            className="input-field"
            disabled={readonly}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="input-label">Descripción de la Tarea</label>
        <textarea
          value={datos.descripcion}
          onChange={(e) => handleChange("descripcion", e.target.value)}
          placeholder="-Describir el trabajo a realizar-"
          rows={3}
          className="input-field"
          disabled={readonly}
        />
      </div>

      {/* Horas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Hora Inicio
          </label>
          <input
            type="time"
            value={datos.hora_inicio}
            onChange={(e) => handleChange("hora_inicio", e.target.value)}
            className="input-field"
            disabled={readonly}
          />
        </div>
        <div>
          <label className="input-label flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Hora Fin
          </label>
          <input
            type="time"
            value={datos.hora_fin}
            onChange={(e) => handleChange("hora_fin", e.target.value)}
            className="input-field"
            disabled={readonly}
          />
        </div>
      </div>

      {/* Validación de horario */}
      {datos.hora_inicio && datos.hora_fin && (
        <ValidacionHorario horaInicio={datos.hora_inicio} horaFin={datos.hora_fin} />
      )}
    </div>
  );
}

function ValidacionHorario({ horaInicio, horaFin }: { horaInicio: string; horaFin: string }) {
  const [inicioMinutos, finMinutos] = [
    parseInt(horaInicio.split(":")[0]) * 60 + parseInt(horaInicio.split(":")[1]),
    parseInt(horaFin.split(":")[0]) * 60 + parseInt(horaFin.split(":")[1]),
  ];
  const duracion = finMinutos - inicioMinutos;
  const horas = Math.floor(duracion / 60);
  const minutos = duracion % 60;

  const esValido = duracion > 0 && duracion <= 12 * 60; // Max 12 horas

  return (
    <div className={`p-3 rounded-lg ${esValido ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
      <p className={`text-sm font-medium ${esValido ? "text-green-700" : "text-red-700"}`}>
        Duración calculated: {horas}h {minutos}m 
        {!esValido && " - exceeds 12 hours! Please verify"}
      </p>
    </div>
  );
}