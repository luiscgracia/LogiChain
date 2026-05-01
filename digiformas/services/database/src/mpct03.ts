/**
 * MAPA DE DATOS: Certificado de Habilitación MP-CT03
 * Basado en el PDF "01 Certificado de Habilitacion.pdf"
 */

export interface SeccionA_DatosTarea {
  // Identificación
  instalacion: string;
  ubiacion: string;
  equipo: string;
  descripcion: string;
  
  // Fechas y horas
  fecha: string;           // DD/MM/AAAA
  hora_inicio: string;     // HH:MM
  hora_fin: string;       // HH:MM
  
  // Información adicional
  numero_permiso: string;  // Auto-generado por el sistema
}

export interface SeccionB_Administracion {
  misma_especie: boolean;
  diferentes_especie: boolean;
}

export interface RiesgoItem {
  id: number;
  pregunta: string;
  respuesta: 'SI' | 'NO' | null;
}

export interface Riesgo {
  // GENERALES Y ÁREA (Items 1-19)
  item_01_induccion: 'SI' | 'NO' | null;
  item_02_area_clasificada: 'SI' | 'NO' | null;
  item_03_llenadero: 'SI' | 'NO' | null;
  item_04_entrada_bloqueada: 'SI' | 'NO' | null;
  item_05_espacios_confinados: 'SI' | 'NO' | null;
  item_06_alturas: 'SI' | 'NO' | null;
  item_07_lineas_producto: 'SI' | 'NO' | null;
  item_08_equipo_critico: 'SI' | 'NO' | null;
  item_09_sistemas_no_criticos: 'SI' | 'NO' | null;
  item_10_movimiento_vehiculos: 'SI' | 'NO' | null;
  item_11_gruas: 'SI' | 'NO' | null;
  item_12_objetos_inestables: 'SI' | 'NO' | null;
  item_13_sobre_agua: 'SI' | 'NO' | null;
  item_14_subacuatico: 'SI' | 'NO' | null;
  item_15_agua_presion: 'SI' | 'NO' | null;
  item_16_radiacion: 'SI' | 'NO' | null;
  item_17_excavacion_manual: 'SI' | 'NO' | null;
  item_18_excavacion_maquina: 'SI' | 'NO' | null;
  item_19_estacas: 'SI' | 'NO' | null;
  
  // SUSTANCIAS PELIGROSAS (Items 20-22)
  item_20_sustancias_peligrosas: 'SI' | 'NO' | null;
  item_21_plomo: 'SI' | 'NO' | null;
  item_22_reviso_msds: 'SI' | 'NO' | null;
  
  // FUENTES DE IGNICIÓN (Items 23-28)
  item_23_fuentes_ignicion: 'SI' | 'NO' | null;
  item_24_oxiacetileno: 'SI' | 'NO' | null;
  item_25_motor_combustion: 'SI' | 'NO' | null;
  item_26_equipos_electricos: 'SI' | 'NO' | null;
  item_27_maquinaria_percusion: 'SI' | 'NO' | null;
  item_28_sandblasting: 'SI' | 'NO' | null;
  
  // ENERGÍAS PELIGROSAS (Items 29-36)
  item_29_aislamiento_electrico: 'SI' | 'NO' | null;
  item_30_sistemas_energizados: 'SI' | 'NO' | null;
  item_31_desacople_mecanico: 'SI' | 'NO' | null;
  item_32_presurizados: 'SI' | 'NO' | null;
  item_33_temperaturas: 'SI' | 'NO' | null;
  item_34_consulta_sme: 'SI' | 'NO' | null;
  item_35_procedimientos: 'SI' | 'NO' | null;
  item_36_plan_emergencia: 'SI' | 'NO' | null;
}

export interface DocumentoItem {
  tipo: string;
  requerido: boolean;
  numero: string | null;
}

export interface SeccionD_Documentacion {
  trabajo_alturas: DocumentoItem;
  espacios_confinados: DocumentoItem;
  aislamiento_energia: DocumentoItem;
  excavacion: DocumentoItem;
  analisis_riesgo: DocumentoItem;
  certificado_gases: DocumentoItem;
  // ... más campos según necesidad
}

export interface SeccionE_Controles {
  hora_inicio_efectiva: string;
  hora_fin_efectiva: string;
  codigo_autorizacion: string;
}

export interface Firma {
 nombre: string;
  cedula: string;
  firma_base64: string;  // Canvas.toDataURL()
  timestamp: string;
}

export interface SeccionF_Aceptacion {
  ejecutor: Firma | null;
  inspector: Firma | null;
}

export interface SeccionG_Autorizacion {
  emisor: Firma | null;
  sme: Firma | null;  // Condicional según riesgos
}

export interface SeccionCierre {
  trabajo_realizado: 'COMPLETO' | 'PARCIAL' | 'CANCELADO';
  area_segura: boolean;
  ejecutor: Firma | null;
  inspector: Firma | null;
  emisor: Firma | null;
  observaciones: string;
}

// ============================================
// MAPA DE VALIDACIONES CRUZADAS
// ============================================

export const VALIDACIONES_CONDICIONALES = {
  // Si marca SI en item_22 (MSDS), debe ser porque marcó SI en item_20 o item_21
  'item_22': ['item_20', 'item_21'],
  
  // Si marca SI en espacios confinados, requiere SME
  'item_05': ['sm_requerido'],
  
  // Si marca SI en trabajo en alturas, requiere documento en Sección D
  'item_06': ['trabajo_alturas'],
  
  // Si marca SI en aislamiento eléctrico, requiere documento
  'item_29': ['aislamiento_energia'],
  
  // Si marca SI en excavación, requiere documento
  'item_17': ['excavacion'],
  'item_18': ['excavacion'],
  'item_19': ['excavacion'],
};

// ============================================
// MAPA DE CIUDADES/PREFIJOS
// ============================================

export const SEDES_CONFIG = {
  BUC: { nombre: 'Bucaramanga', prefijo: 'BUC' },
  BUE: { nombre: 'Buenaventura', prefijo: 'BUE' },
  CTG: { nombre: 'Cartagena', prefijo: 'CTG' },
  CAR: { nombre: 'Cartago', prefijo: 'CAR' },
  GAL: { nombre: 'Galapa', prefijo: 'GAL' },
  GUA: { nombre: 'Gualanday', prefijo: 'GUA' },
  DOR: { nombre: 'La Dorada', prefijo: 'DOR' },
  MAN: { nombre: 'Mancilla', prefijo: 'MAN' },
  MED: { nombre: 'Medellín', prefijo: 'MED' },
  BOG: { nombre: 'Bogotá (Puente Aranda)', prefijo: 'BOG' },
  YUM: { nombre: 'Yumbo', prefijo: 'YUM' },
} as const;

// ============================================
// FORMATO DE CONSECUTIVO
// ============================================

export function formatConsecutivo(prefijo: string, numero: number): string {
  return `${prefijo}-${numero.toString().padStart(6, '0')}`;
  // Ejemplo: 'BOG-000001'
}

export function parseConsecutivo(consecutivo: string): { prefijo: string; numero: number } | null {
  const match = /^([A-Z]{3})-(\d{6})$/.exec(consecutivo);
  if (!match) return null;
  return { prefijo: match[1], numero: parseInt(match[2], 10) };
}