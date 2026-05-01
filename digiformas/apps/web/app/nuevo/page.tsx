"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2
} from "lucide-react";
import { SeccionA } from "../components/formulario/SeccionA";
import { SeccionC } from "../components/formulario/SeccionC";
import { SeccionD } from "../components/formulario/SeccionD";
import { FirmaCanvas } from "../components/formulario/FirmaCanvas";

type Respuesta = "SI" | "NO" | null;

interface DatosTarea {
  instalacion: string;
  ubicacion: string;
  equipo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Riesgos {
  [key: string]: Respuesta;
}

interface Documentacion {
  [key: string]: { tipo: string; requerido: boolean; numero: string | null };
}

interface Firma {
  nombre: string;
  cedula: string;
  firma_base64: string;
  timestamp: string;
}

export default function NuevoCertificado() {
  const router = useRouter();
  const [consecutivo, setConsecutivo] = useState("BOG-000001");
  const [guardando, setGuardando] = useState(false);
  const [seccionActual, setSeccionActual] = useState(0);

  // Datos del formulario
  const [datosTarea, setDatosTarea] = useState<DatosTarea>({
    instalacion: "",
    ubicacion: "",
    equipo: "",
    descripcion: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const [administracion, setAdministracion] = useState({
    misma_especie: false,
    diferentes_especie: false,
  });

  const [riesgos, setRiesgos] = useState<Riesgos>({});
  const [documentacion, setDocumentacion] = useState<Documentacion>({});
  const [firmas, setFirmas] = useState<{
    ejecutor: Firma | null;
    inspector: Firma | null;
    emisor: Firma | null;
    sme: Firma | null;
  }>({
    ejecutor: null,
    inspector: null,
    emisor: null,
    sme: null,
  });

  // Secciones del formulario
  const secciones = [
    { id: "A", titulo: "Datos de Tarea", icono: FileText },
    { id: "B", titulo: "Administración", icono: Building2 },
    { id: "C", titulo: "Identificación de Riesgos", icono: AlertTriangle },
    { id: "D", titulo: "Documentación", icono: FileText },
    { id: "F", titulo: "Aceptación", icono: CheckCircle },
  ];

  const validarSeccion = (seccion: number): boolean => {
    switch (seccion) {
      case 0: // Sección A
        return !!(datosTarea.instalacion && datosTarea.ubicacion && datosTarea.hora_inicio);
      case 1: // Sección B
        return administracion.misma_especie || administracion.diferentes_especie;
      case 2: // Sección C
        return Object.values(riesgos).filter((v) => v !== null).length === 36;
      case 3: // Sección D
        return true; // Los documentos son opcionales a menos que el riesgoactive
      default:
        return true;
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // Aquí iría la llamada a la API
      console.log("Guardando certificado:", {
        consecutive,
        datosTarea,
        administracion,
        riesgos,
        documentacion,
        firmas,
      });
      
      // Simulacreed: redireccionar al dashboard
      router.push("/?success=true");
    } catch (error) {
      console.error("Error guardando:", error);
    } finally {
      setGuardando(false);
    }
  };

  const requiereSME = riesgos.item_05 === "SI" || riesgos.item_34 === "SI";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {consecutivo}
                  </span>
                  <span className="floating-badge badge-warning">BORRADOR</span>
                </div>
                <p className="text-xs text-gray-500">Nuevo Certificado MP-CT03</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de secciones */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scroll-indicator">
            {secciones.map((sec, idx) => {
              const Icon = sec.icono;
              const isActive = idx === seccionActual;
              const isValid = validarSeccion(idx);
              
              return (
                <button
                  key={sec.id}
                  onClick={() => setSeccionActual(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : isValid
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {sec.id}: {sec.titulo}
                  {isValid && idx < seccionActual && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenido del formulario */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {seccionActual === 0 && (
          <SeccionA
            datos={datosTarea}
            onChange={setDatosTarea}
          />
        )}

        {seccionActual === 1 && (
          <div className="card space-y-4">
            <h2 className="section-title">Sección B: Administración</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="administracion"
                  checked={administracion.misma_especie}
                  onChange={() => setAdministracion({
                    misma_especie: true,
                    diferentes_especie: false,
                  })}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="font-medium">Misma Especie</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="administracion"
                  checked={administracion.diferentes_especie}
                  onChange={() => setAdministracion({
                    misma_especie: false,
                    diferentes_especie: true,
                  })}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="font-medium">Diferente Especie</span>
              </label>
            </div>
          </div>
        )}

        {seccionActual === 2 && (
          <SeccionC
            riesgos={riesgos}
            onChange={setRiesgos}
          />
        )}

        {seccionActual === 3 && (
          <SeccionD
            documentacion={documentacion}
            onChange={setDocumentacion}
            riesgos={riesgos}
          />
        )}

        {seccionActual === 4 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Sección F: Aceptación
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                El ejecutor e inspector confirman la lectura de restricciones
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <FirmaCanvas
                    firma={firmas.ejecutor}
                    onChange={(f) => setFirmas({ ...firmas, ejecutor: f })}
                    rol="EJECUTOR"
                  />
                </div>
                <div>
                  <FirmaCanvas
                    firma={firmas.inspector}
                    onChange={(f) => setFirmas({ ...firmas, inspector: f })}
                    rol="INSPECTOR"
                  />
                </div>
              </div>
            </div>

            {requiereSME && (
              <div className="card">
                <h2 className="section-title flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Sección G: Autorización SME
                </h2>
                <p className="text-sm text-amber-600 mb-4">
                  Requiere firma de SME por riesgos identificados
                </p>
                <FirmaCanvas
                  firma={firmas.sme}
                  onChange={(f) => setFirmas({ ...firmas, sme: f })}
                  rol="SME"
                />
              </div>
            )}

            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Sección G: Autorización del Emisor
              </h2>
              <FirmaCanvas
                firma={firmas.emisor}
                onChange={(f) => setFirmas({ ...firmas, emisor: f })}
                rol="EMISOR"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}