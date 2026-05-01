/**
 * API Client para DigiFormas
 * Funciones para comunicar el frontend con el backend Rust
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiError {
  error: string;
  mensaje?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.mensaje || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// TIPOS
// ============================================

export interface Sede {
  id: number;
  nombre: string;
  prefijo_consecutivo: string;
  activa: boolean;
}

export interface ConsecutivoResponse {
  sede_id: number;
  prefijo: string;
  numero: number;
  formato: string;
  bloque: number;
  bloque_autorizado: boolean;
  necesita_alerta: boolean;
}

export interface Certificado {
  id: string;
  consecutivos_completo: string;
  consecutive_num: number;
  sede_id: number;
  estado: "BORRADOR" | "ACTIVO" | "CERRADO" | "ANULADO";
  datos_tarea: Record<string, unknown>;
  administracion: Record<string, unknown>;
  riesgos: Record<string, unknown>;
  documentacion: Record<string, unknown>;
  controles: Record<string, unknown>;
  firmas_aceptacion: Record<string, unknown>;
  firmas_autorizacion: Record<string, unknown>;
  cierre: Record<string, unknown>;
  version: number;
  historial_cambios: HistorialCambio[];
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creador?: string;
  usuario_actualizador?: string;
}

export interface HistorialCambio {
  fecha: string;
  nota: string;
  usuario: string;
  campo?: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: "OPERARIO" | "SUPERVISOR" | "ADMIN";
  sede_id?: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// ============================================
// AUTH API
// ============================================

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<Usuario> {
  return fetchApi<Usuario>("/api/auth/me");
}

// ============================================
// SEDES API
// ============================================

export async function listarSedes(): Promise<Sede[]> {
  return fetchApi<Sede[]>("/api/sedes");
}

export async function obtenerSede(id: number): Promise<Sede | null> {
  return fetchApi<Sede | null>(`/api/sedes/${id}`);
}

// ============================================
// CONSECUTIVOS API
// ============================================

export async function obtenerConsecutivo(sedeId: number): Promise<ConsecutivoResponse> {
  return fetchApi<ConsecutivoResponse>(`/api/consecutivos/${sedeId}`);
}

export async function siguienteConsecutivo(sedeId: number): Promise<ConsecutivoResponse> {
  return fetchApi<ConsecutivoResponse>("/api/consecutivos/siguiente", {
    method: "POST",
    body: JSON.stringify({ sede_id: sedeId }),
  });
}

export async function autorizarBloque(token: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>("/api/consecutivos/autorizar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// ============================================
// CERTIFICADOS API
// ============================================

export interface ListCertificadosParams {
  sede_id?: number;
  estado?: string;
  limit?: number;
  offset?: number;
}

export async function listarCertificados(
  params: ListCertificadosParams = {}
): Promise<Certificado[]> {
  const searchParams = new URLSearchParams();
  if (params.sede_id) searchParams.set("sede_id", params.sede_id.toString());
  if (params.estado) searchParams.set("estado", params.estado);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());

  const query = searchParams.toString();
  return fetchApi<Certificado[]>(`/api/certificados${query ? `?${query}` : ""}`);
}

export async function crearCertificado(
  sedeId: number,
  datos: {
    datos_tarea: Record<string, unknown>;
    administracion: Record<string, unknown>;
    riesgos: Record<string, unknown>;
    documentacion: Record<string, unknown>;
    controles: Record<string, unknown>;
    firmas_aceptacion: Record<string, unknown>;
    firmas_autorizacion: Record<string, unknown>;
  }
): Promise<Certificado> {
  return fetchApi<Certificado>("/api/certificados", {
    method: "POST",
    body: JSON.stringify({
      sede_id: sedeId,
      ...datos,
      usuario: "current_user", // TODO: get from auth
    }),
  });
}

export async function obtenerCertificado(id: string): Promise<Certificado> {
  return fetchApi<Certificado>(`/api/certificados/${id}`);
}

export async function actualizarCertificado(
  id: string,
  datos: {
    datos_tarea?: Record<string, unknown>;
    administracion?: Record<string, unknown>;
    riesgos?: Record<string, unknown>;
    documentacion?: Record<string, unknown>;
    controles?: Record<string, unknown>;
    firmas_aceptacion?: Record<string, unknown>;
    firmas_autorizacion?: Record<string, unknown>;
    cierre?: Record<string, unknown>;
    nota_cambio: string;
  }
): Promise<Certificado> {
  return fetchApi<Certificado>(`/api/certificados/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...datos,
      usuario: "current_user", // TODO: get from auth
    }),
  });
}

export async function anularCertificado(id: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/api/certificados/${id}/anular`, {
    method: "DELETE",
  });
}

// ============================================
// GENERACIÓN DE PDF
// ============================================

import jsPDF from "jspdf";

export function generarPDF(certificado: Certificado, sede: Sede): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Título
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICADO DE HABILITACIÓN", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("MP-CT03", pageWidth / 2, y, { align: "center" });
  y += 15;

  // Consecutivo
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Consecutivo: ${certificado.consecutivo_completo}`, margin, y);
  y += 10;

  // Sede
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Sede: ${sede.nombre}`, margin, y);
  y += 8;

  // Sección A: Datos de tarea
  doc.setFont("helvetica", "bold");
  doc.text("SECCIÓN A: DATOS DE TAREA", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");

  const datosTarea = certificado.datos_tarea as Record<string, string>;
  if (datosTarea) {
    doc.text(`Instalación: ${datosTarea.instalacion || "-"}`, margin, y);
    y += 6;
    doc.text(`Ubicación: ${datosTarea.ubicacion || "-"}`, margin, y);
    y += 6;
    doc.text(`Equipo: ${datosTarea.equipo || "-"}`, margin, y);
    y += 6;
    doc.text(`Fecha: ${datosTarea.fecha || "-"}`, margin, y);
    y += 6;
    doc.text(`Hora: ${datosTarea.hora_inicio || "-"} a ${datosTarea.hora_fin || "-"}`, margin, y);
    y += 6;
    doc.text(`Descripción: ${datosTarea.descripcion || "-"}`, margin, y);
    y += 10;
  }

  // Sección C: Riesgos
  const riesgos = certificado.riesgos as Record<string, string>;
  if (riesgos) {
    doc.setFont("helvetica", "bold");
    doc.text("SECCIÓN C: IDENTIFICACIÓN DE RIESGOS", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    const items = Object.entries(riesgos).filter(([k]) => k.startsWith("item_"));
    for (const [key, value] of items.slice(0, 20)) {
      doc.text(`${key}: ${value || "-"}`, margin, y);
      y += 5;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    }
  }

  // Estado
  if (certificado.estado === "ANULADO") {
    doc.setFontSize(20);
    doc.setTextColor(255, 0, 0);
    doc.text("ANULADO", pageWidth / 2, 150, { align: "center" });
  }

  // Historial de cambios
  if (certificado.historial_cambios.length > 0) {
    doc.addPage();
    y = margin;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("HISTORIAL DE CAMBIOS", margin, y);
    y += 10;

    doc.setFontSize(9);
    for (const cambio of certificado.historial_cambios) {
      doc.text(`${cambio.fecha} - ${cambio.usuario}`, margin, y);
      y += 5;
      doc.text(`Nota: ${cambio.nota}`, margin + 5, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    }
  }

  return doc.output("blob");
}