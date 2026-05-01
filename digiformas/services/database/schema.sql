-- ============================================
-- ESQUEMA DE BASE DE DATOS - DIGIFORMAS
-- Certificado de Habilitación MP-CT03
-- ============================================

-- ============================================
-- 1. CATÁLOGO DE SEDES/CIUDADES
-- ============================================
CREATE TABLE sedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,        -- 'Bogotá (Puente Aranda)'
    prefijo_consecutivo VARCHAR(6) UNIQUE NOT NULL, -- 'BOG'
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las 11 sedes iniciales
INSERT INTO sedes (nombre, prefijo_consecutivo) VALUES
('Bucaramanga', 'BUC'),
('Buenaventura', 'BUE'),
('Cartagena', 'CTG'),
('Cartago', 'CAR'),
('Galapa', 'GAL'),
('Gualanday', 'GUA'),
('La Dorada', 'DOR'),
('Mancilla', 'MAN'),
('Medellín', 'MED'),
('Bogotá (Puente Aranda)', 'BOG'),
('Yumbo', 'YUM');

-- ============================================
-- 2. PERSONAL AUTORIZADO
-- ============================================
CREATE TABLE personal (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('EJECUTOR', 'INSPECTOR', 'EMISOR', 'SME', 'ADMIN')),
    sede_id INT REFERENCES sedes(id),
    induccion_vigente DATE,  -- Vigencia menor a 1 año
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CONTROL DE CONSECUTIVOS
-- ============================================
CREATE TABLE control_consecutivos (
    id SERIAL PRIMARY KEY,
    sede_id INT REFERENCES sedes(id),
    form_referencia VARCHAR(20) DEFAULT 'MP-CT03',
    ultimo_numero INT DEFAULT 0,           -- 0 a 999999
    bloque_actual INT DEFAULT 1,         -- 1=1-250, 2=251-500
    bloque_autorizado BOOLEAN DEFAULT TRUE,
    token_autorizacion VARCHAR(100),      -- UUID para enlace de correo
    ultimo_alerta_enviada INT DEFAULT 0,  -- track alertas enviadas
    UNIQUE(sede_id, form_referencia)
);

-- Inicializar control para cada sede
INSERT INTO control_consecutivos (sede_id, form_referencia)
SELECT id, 'MP-CT03' FROM sedes;

-- ============================================
-- 4. CERTIFICADOS MP-CT03
-- ============================================
CREATE TABLE certificados_habilitacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación
    consecutivo_completo VARCHAR(20) UNIQUE NOT NULL, -- 'BOG-000001'
    consecutivo_num INT NOT NULL,
    sede_id INT REFERENCES sedes(id),
    estado VARCHAR(20) DEFAULT 'BORRADOR', -- 'BORRADOR', 'ACTIVO', 'CERRADO', 'ANULADO'
    
    -- Sección A: Datos de Tarea
    datos_tarea JSONB NOT NULL DEFAULT '{}',
    
    -- Sección B: Administración
    administracion JSONB NOT NULL DEFAULT '{}',
    
    -- Sección C: Identificación de Riesgos (36 items)
    riesgos JSONB NOT NULL DEFAULT '{}',
    
    -- Sección D: Documentación Adicional
    documentacion JSONB NOT NULL DEFAULT '{}',
    
    -- Sección E: Controles de Ejecución
    controles JSONB NOT NULL DEFAULT '{}',
    
    -- Sección F: Aceptación (Firmas)
    firmas_aceptacion JSONB NOT NULL DEFAULT '{}',
    
    -- Sección G: Autorización (Firmas)
    firmas_autorizacion JSONB NOT NULL DEFAULT '{}',
    
    -- Sección H: Cierre
    cierre JSONB NOT NULL DEFAULT '{}',
    
    -- Auditoría
    version INT DEFAULT 1,
    historial_cambios JSONB DEFAULT '[]',  -- [{fecha, nota, usuario, campo}]
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creador VARCHAR(100),
    usuario_actualizador VARCHAR(100)
);

-- ============================================
-- 5. USUARIOS DEL SISTEMA
-- ============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('OPERARIO', 'SUPERVISOR', 'ADMIN')),
    sede_id INT REFERENCES sedes(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. AUDITORÍA GENERAL
-- ============================================
CREATE TABLE auditoria_log (
    id SERIAL PRIMARY KEY,
    certificado_id UUID REFERENCES certificados_habilitacion(id),
    accion VARCHAR(50) NOT NULL,  -- 'CREACION', 'EDICION', 'ANULACION', 'CIERRE'
    usuario VARCHAR(100),
    detalles JSONB DEFAULT '{}',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX idx_certificados_sede ON certificados_habilitacion(sede_id);
CREATE INDEX idx_certificados_estado ON certificados_habilitacion(estado);
CREATE INDEX idx_certificados_consecutivo ON certificados_habilitacion(consecutivo_num);
CREATE INDEX idx_auditoria_fecha ON auditoria_log(fecha DESC);
CREATE INDEX idx_auditoria_certificado ON auditoria_log(certificado_id);