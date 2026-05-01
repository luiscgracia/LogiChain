/**
 * Componente: FirmaCanvas
 * Canvas para captura de firmas digitales
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { Trash2, Save, User } from "lucide-react";

interface Firma {
  nombre: string;
  cedula: string;
  firma_base64: string;
  timestamp: string;
}

interface Props {
  firma: Firma | null;
  onChange: (firma: Firma) => void;
  rol: "EJECUTOR" | "INSPECTOR" | "EMISOR" | "SME";
  readonly?: boolean;
}

// Lista de personal demo (en producción vendría de la API)
const PERSONAL_DEMO = [
  { nombre: "Juan Pérez", cedula: "12345678", rol: "EJECUTOR" },
  { nombre: "Carlos López", cedula: "87654321", rol: "INSPECTOR" },
  { nombre: "María García", cedula: "11223344", rol: "EMISOR" },
  { nombre: "Pedro SME", cedula: "55667788", rol: "SME" },
];

export function FirmaCanvas({ firma, onChange, rol, readonly = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasFirma, setHasFirma] = useState(!!firma?.firma_base64);
  const [personaSeleccionada, setPersonaSeleccionada] = useState("");

  // Filtrar personal por rol
  const personalFiltrado = PERSONAL_DEMO.filter((p) => p.rol === rol);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Si hay firma guardada, dibujarla
    if (firma?.firma_base64) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = firma.firma_base64;
    }
  }, [firma?.firma_base64]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (readonly) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || readonly) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Guardar firma
    const canvas = canvasRef.current;
    if (canvas) {
      const firmaBase64 = canvas.toDataURL("image/png");
      setHasFirma(true);
      
      // Buscar persona
      const persona = PERSONAL_DEMO.find((p) => p.nombre === personaSeleccionada);
      
      onChange({
        nombre: personaSeleccionada,
        cedula: persona?.cedula || "",
        firma_base64: firmaBase64,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const limpiar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasFirma(false);
    
    onChange({
      nombre: "",
      cedula: "",
      firma_base64: "",
      timestamp: "",
    });
  };

  return (
    <div className="space-y-3">
      {/* Selector de persona */}
      <div>
        <label className="input-label flex items-center gap-2">
          <User className="w-4 h-4" />
          {rol === "EJECUTOR" && "Ejecutor"}
          {rol === "INSPECTOR" && "Inspector"}
          {rol === "EMISOR" && "Emisor"}
          {rol === "SME" && "Aprobador SME"}
        </label>
        <select
          value={personaSeleccionada}
          onChange={(e) => setPersonaSeleccionada(e.target.value)}
          disabled={readonly}
          className="input-field"
        >
          <option value="">- Seleccionar -</option>
          {personalFiltrado.map((p) => (
            <option key={p.cedula} value={p.nombre}>
              {p.nombre} - CC {p.cedula}
            </option>
          ))}
        </select>
      </div>

      {/* Canvas de firma */}
      <div className="relative">
        <div className="absolute top-2 left-2 text-xs text-gray-400">
          Firme aquí
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className={`w-full border-2 border-gray-300 rounded-lg firma-canvas ${
            readonly ? "bg-gray-50 cursor-not-allowed" : "bg-white cursor-crosshair"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Controles */}
      {!readonly && (
        <div className="flex gap-2">
          <button
            onClick={limpiar}
            type="button"
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      )}

      {/* Timestamp */}
      {firma?.timestamp && (
        <p className="text-xs text-gray-500">
          Firmado el: {new Date(firma.timestamp).toLocaleString("es-CO")}
        </p>
      )}
    </div>
  );
}