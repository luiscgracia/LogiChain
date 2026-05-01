# ARQUITECTURA TÉCNICA - DigiFormas

## 1. VISTA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 14)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Dashboard │  │  Formulario │  │   Panel Admin/Auditoría│  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND API (Rust + Axum)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │  Control   │  │  Certificados │  │   Auditoría         │     │
│  │ Consecutivos│  │     CRUD      │  │   & Historial       │     │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘     │
└─────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (PostgreSQL)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │  Sedes   │ │ Personal │ │Control   │ │ Certificados    │   │
│  │          │ │          │ │Consecut. │ │ (JSONB)        │   │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. ENDPOINTS DE API

### 2.1 Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/auth/me | Datos del usuario actual |

### 2.2 Sedes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/sedes | Listar todas las sedes |
| GET | /api/sedes/:id | Obtener sede por ID |
| POST | /api/sedes | Crear nueva sede (admin) |
| PUT | /api/sedes/:id | Actualizar sede (admin) |

### 2.3 Consecutivos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/consecutivos/:sede_id | Ver estado de consecutivos |
| POST | /api/consecutivos/siguiente | Obtener siguiente número |
| POST | /api/consecutivos/autorizar | Autorizar siguiente bloque |

### 2.4 Certificados
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/certificados | Listar certificados |
| GET | /api/certificados/:id | Obtener certificado |
| POST | /api/certificados | Crear nuevo certificado |
| PUT | /api/certificados/:id | Actualizar certificado |
| DELETE | /api/certificados/:id | Anular certificado |
| POST | /api/certificados/:id/pdf | Generar PDF |

### 2.5 Auditoría
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/auditoria | Ver log de auditoría |
| GET | /api/certificados/:id/historial | Historial de cambios |

## 3. FLUJO DE CONSECUTIVOS

```
┌──────────────────────────────────────────────────────────────┐
│                    SOLICITUD DE NUEVO CERTIFICADO               │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. Frontend pide número al BACKEND                            │
│    POST /api/consecutivos/siguiente?sede_id=X                 │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend verifica estado del BLOQUE (1-250, 251-500, etc.) │
│                                                             │
│    IF numero == 240 THEN                                     │
│       - Enviar correo al ADMIN con enlace de autorización       │
│       - WARNING: "Quedan 10 certificados"                   │
│    END IF                                                  │
│                                                             │
│    IF numero > 250 AND !bloque_autorizado THEN                │
│       - ERROR 403: "Bloque agotado, contacte al admin"       │
│    END IF                                                  │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend retorna número (ej: BOG-000241)                  │
│    {                                                     │
│      consecutivos: "BOG-000241",                           │
│      numero: 241,                                         │
│      bloque: 1,                                            │
│      alerta: false                                         │
│    }                                                     │
└──────────────────────────────────────────────────────────────┘
```

## 4. ESTRUCTURA DE DATOS (JSONB)

### Certificado completo:
```json
{
  "id": "uuid",
  "consecutivo_completo": "BOG-000001",
  "consecutivo_num": 1,
  "sede_id": 1,
  "estado": "BORRADOR",
  
  "datos_tarea": {
    "instalacion": "-planta BOG",
    "ubicacion": "Tanque TK-101",
    "equipo": "Bomba P-101",
    "descripcion": "Mantenimiento preventivo",
    "fecha": "23/04/2026",
    "hora_inicio": "08:00",
    "hora_fin": "17:00"
  },
  
  "administracion": {
    "misma_especie": true,
    "diferentes_especie": false
  },
  
  "riesgos": {
    "item_01_induccion": "SI",
    "item_02_area_clasificada": "NO",
    // ... 36 items
    "item_36_plan_emergencia": "SI"
  },
  
  "documentacion": {
    "trabajo_alturas": { "requerido": true, "numero": "AL-2026-001" }
  },
  
  "firmas_aceptacion": {
    "ejecutor": { "nombre": "Juan Pérez", "firma_base64": "...", "timestamp": "..." },
    "inspector": { "nombre": "Carlos López", "firma_base64": "...", "timestamp": "..." }
  },
  
  "firmas_autorizacion": {
    "emisor": { "nombre": "María García", "firma_base64": "...", "timestamp": "..." }
  },
  
  "historial_cambios": [
    { "fecha": "2026-04-23T10:30:00Z", "nota": "Se corrigió hora fin", "usuario": "juan.perez" }
  ]
}
```

## 5. FLUJO DE EDICIÓN

```
1. Usuario da clic en "Editar" certificado existente
         │
         ▼
2. Frontend carga datos en formulario (modo edición)
         │
         ▼
3. Banner AMARILLO: "Editando certificado BOG-000125"
         │
         ▼
4. Usuario modifica campos y da clic en "Guardar"
         │
         ▼
5. MODAL OBLIGATORIO: "Ingrese motivo del cambio"
         │
         ▼
6. Backend registra en historial_cambios:
   {
     "fecha": "2026-04-23T14:30:00Z",
     "nota": "Se ajustó hora de inicio de 08:00 a 09:00",
     "campo": "datos_tarea.hora_inicio",
     "valor_anterior": "08:00",
     "valor_nuevo": "09:00",
     "usuario": "inspector.sede"
   }
         │
         ▼
7. Version se incrementa (version++)
         │
         ▼
8. PDF generado incluye marca de agua: "MODIFICADO"
```

## 6. MODELO DE ROLES

| Rol | Permisos |
|-----|---------|
| OPERARIO | Crear certificados, firmar como Ejecutor |
| INSPECTOR | Crear certificados, firmar como Inspector, editar con nota |
| EMISOR | Firmar como Emisor, aprobar SME |
| ADMIN | Autorizar bloques, CRUD sedes, ver auditoría |

## 7. CONSIDERACIONES PARA 15 TERMINALES

### Offline/Sincronización:
- Service Worker para guardar en localStorage
- Cola de sincronización cuando hay conexión
- Conflict resolution: "Última escritura gana" + ауditoría

### Sesión:
- JWT con refresh token
- Expira en 8 horas de inactividad
- Cada terminal independiente

### Rendimiento:
- conex concurrentes: PostgreSQL con pool de 50
- Cache Redis para consecutivo actual
- CDN para assets estáticos