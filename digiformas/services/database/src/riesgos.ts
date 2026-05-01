/**
 * MAPA COMPLETO DE RIESGOS - Sección C
 * Certificado de Habilitación MP-CT03
 * 36 items con preguntas exactas del PDF
 */

export const RIESGOS_MAP = [
  // ============================================
  // GRUPO 1: GENERALES Y ÁREA (Items 1-19)
  // ============================================
  {
    id: 1,
    pregunta: '¿Todas las personas tienen Inducción SHE vigente (menor a 1 año)?',
    categoria: 'Generales',
  },
  {
    id: 2,
    pregunta: '¿Trabajo en Áreas Clasificadas (Clase 1 Div. I ó Div. II)?',
    categoria: 'Generales',
  },
  {
    id: 3,
    pregunta: '¿Trabajos en o adyacentes a un Llenadero?',
    categoria: 'Generales',
  },
  {
    id: 4,
    pregunta: '¿Entrada o Salida bloqueados?',
    categoria: 'Generales',
  },
  {
    id: 5,
    pregunta: '¿Ingreso a Espacios Confinados?',
    categoria: 'Generales',
    requiereSME: true,  // Activa firma de SME en Sección G
  },
  {
    id: 6,
    pregunta: '¿Trabajo en Alturas (Posible caída >2mt / 1.5mt Col)?',
    categoria: 'Generales',
    requiereDocumento: 'trabajo_alturas',
  },
  {
    id: 7,
    pregunta: '¿Trabajos de Procesos de líneas de producto de Control o instrumentos?',
    categoria: 'Generales',
  },
  {
    id: 8,
    pregunta: '¿Se desactivará algún Equipo Crítico?',
    categoria: 'Generales',
  },
  {
    id: 9,
    pregunta: '¿Se afectan otros Sistemas Operacionales no-Críticos?',
    categoria: 'Generales',
  },
  {
    id: 10,
    pregunta: '¿Exposición al Movimiento de Vehículos?',
    categoria: 'Generales',
  },
  {
    id: 11,
    pregunta: '¿Manejo de Cargas con Grúas?',
    categoria: 'Generales',
    requiereDocumento: 'gruas',
  },
  {
    id: 12,
    pregunta: '¿Trabajo en Objetos Potencialmente Inestables?',
    categoria: 'Generales',
  },
  {
    id: 13,
    pregunta: '¿Trabajo sobre el Agua?',
    categoria: 'Generales',
  },
  {
    id: 14,
    pregunta: '¿Trabajo Subacuático?',
    categoria: 'Generales',
  },
  {
    id: 15,
    pregunta: '¿Limpieza con Chorro de Agua a Presión?',
    categoria: 'Generales',
  },
  {
    id: 16,
    pregunta: '¿Radiografías o Fuentes de Radiación similares?',
    categoria: 'Generales',
  },
  {
    id: 17,
    pregunta: '¿Excavación Manual a más de 23 cms?',
    categoria: 'Generales',
    requiereDocumento: 'excavacion',
  },
  {
    id: 18,
    pregunta: '¿Excavación con Máquina, cualquier profundidad?',
    categoria: 'Generales',
    requiereDocumento: 'excavacion',
  },
  {
    id: 19,
    pregunta: '¿Inserción de Estacas en el terreno?',
    categoria: 'Generales',
    requiereDocumento: 'excavacion',
  },

  // ============================================
  // GRUPO 2: SUSTANCIAS PELIGROSAS (Items 20-22)
  // ============================================
  {
    id: 20,
    pregunta: '¿Manejo / Exposición a Sustancias Peligrosas?',
    categoria: 'Sustancias',
    requireSi: ['item_22'],  // Fuerza marcar item_22
  },
  {
    id: 21,
    pregunta: '¿Exposición a Productos con Plomo?',
    categoria: 'Sustancias',
    requireSi: ['item_22'],  // Fuerza marcar item_22
  },
  {
    id: 22,
    pregunta: 'Si respondió SI a 20 o 21, ¿Revisó las MSDS?',
    categoria: 'Sustancias',
    obligatorioSi: ['item_20', 'item_21'],  // Solo visible si 20 o 21 son SI
  },

  // ============================================
  // GRUPO 3: FUENTES DE IGNICIÓN (Items 23-28)
  // ============================================
  {
    id: 23,
    pregunta: '¿Fuentes de Ignición (chispas, llamas, calor >200°C)?',
    categoria: 'Ignicion',
  },
  {
    id: 24,
    pregunta: '¿Trabajo con Equipo de Oxiacetileno?',
    categoria: 'Ignicion',
    requiereDocumento: 'oxicorte',
  },
  {
    id: 25,
    pregunta: '¿Uso de Equipos con Motor de Combustión?',
    categoria: 'Ignicion',
  },
  {
    id: 26,
    pregunta: '¿Uso de Equipos/Herramientas Eléctricos?',
    categoria: 'Ignicion',
  },
  {
    id: 27,
    pregunta: '¿Uso de Maquinaria de Percusión?',
    categoria: 'Ignicion',
  },
  {
    id: 28,
    pregunta: '¿SandBlasting / Granallado / WetBlasting?',
    categoria: 'Ignicion',
  },

  // ============================================
  // GRUPO 4: ENERGÍAS PELIGROSAS (Items 29-36)
  // ============================================
  {
    id: 29,
    pregunta: '¿Aislamiento Eléctrico de Equipos?',
    categoria: 'Energias',
    requiereDocumento: 'aislamiento_energia',
  },
  {
    id: 30,
    pregunta: '¿Trabajos en Sistemas Eléctricos Energizados?',
    categoria: 'Energias',
    requiereDocumento: 'trabajo_electrico',
  },
  {
    id: 31,
    pregunta: '¿Desacople Mecánico de Equipos?',
    categoria: 'Energias',
  },
  {
    id: 32,
    pregunta: '¿Trabajos a Sistemas Presurizados o pruebas de Presión?',
    categoria: 'Energias',
    requiereDocumento: 'presion',
  },
  {
    id: 33,
    pregunta: '¿Temperaturas Peligrosas?',
    categoria: 'Energias',
  },
  {
    id: 34,
    pregunta: '¿La labor requiere consultar al SME?',
    categoria: 'Energias',
    requiereSME: true,  // Activa firma de SME
  },
  {
    id: 35,
    pregunta: '¿Se revisaron los procedimientos de seguridad que apliquen?',
    categoria: 'Energias',
  },
  {
    id: 36,
    pregunta: '¿El trabajo requiere de un plan específico de emergencia?',
    categoria: 'Energias',
  },
] as const;

export type CategoriaRiesgo = 'Generales' | 'Sustancias' | 'Ignicion' | 'Energias';

export const CATEGORIAS_RIESGO = [
  { id: 'Generales', titulo: 'Generales y Área', indices: [1, 19] },
  { id: 'Sustancias', titulo: 'Sustancias Peligrosas', indices: [20, 22] },
  { id: 'Ignicion', titulo: 'Fuentes de Ignición', indices: [23, 28] },
  { id: 'Energias', titulo: 'Energías Peligrosas', indices: [29, 36] },
] as const;

// ============================================
// DOCUMENTACIÓN REQUERIDA POR TIPO DE RIESGO
// ============================================

export const DOCUMENTACION_REQUERIDA: Record<string, string> = {
  item_06: 'Permiso de Trabajo en Alturas',
  item_05: 'Permiso de Espacios Confinados',
  item_29: 'Permiso de Aislamiento de Energía (LOTO)',
  item_30: 'Permiso de Trabajo Eléctrico',
  item_17: 'Autorización de Excavación',
  item_18: 'Autorización de Excavación',
  item_19: 'Autorización de Excavación',
  item_24: 'Permiso de Oxicorte',
  item_32: 'Permiso de Presurización',
} as const;