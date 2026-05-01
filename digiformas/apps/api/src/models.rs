use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Sede {
    pub id: i32,
    pub nombre: String,
    pub prefijo_consecutivo: String,
    pub activa: bool,
    pub fecha_creacion: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ControlConsecutivo {
    pub id: i32,
    pub sede_id: i32,
    pub form_referencia: String,
    pub ultimo_numero: i32,
    pub bloque_actual: i32,
    pub bloque_autorizado: bool,
    pub token_autorizacion: Option<String>,
    pub ultimo_alerta_enviada: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsecutivoResponse {
    pub sede_id: i32,
    pub prefijo: String,
    pub numero: i32,
    pub formato: String,
    pub bloque: i32,
    pub bloque_autorizado: bool,
    pub necesita_alerta: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Usuario {
    pub id: i32,
    pub email: String,
    pub password_hash: String,
    pub nombre: String,
    pub rol: String,
    pub sede_id: Option<i32>,
    pub activo: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
    pub usuario: UsuarioResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsuarioResponse {
    pub id: i32,
    pub email: String,
    pub nombre: String,
    pub rol: String,
    pub sede_id: Option<i32>,
}

impl From<Usuario> for UsuarioResponse {
    fn from(u: Usuario) -> Self {
        UsuarioResponse {
            id: u.id,
            email: u.email,
            nombre: u.nombre,
            rol: u.rol,
            sede_id: u.sede_id,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Certificado {
    pub id: uuid::Uuid,
    pub consecutivo_completo: String,
    pub consecutivo_num: i32,
    pub sede_id: i32,
    pub estado: String,
    pub datos_tarea: serde_json::Value,
    pub administracion: serde_json::Value,
    pub riesgos: serde_json::Value,
    pub documentacion: serde_json::Value,
    pub controles: serde_json::Value,
    pub firmas_aceptacion: serde_json::Value,
    pub firmas_autorizacion: serde_json::Value,
    pub cierre: serde_json::Value,
    pub version: i32,
    pub historial_cambios: serde_json::Value,
    pub fecha_creacion: DateTime<Utc>,
    pub fecha_actualizacion: DateTime<Utc>,
    pub usuario_creador: Option<String>,
    pub usuario_actualizador: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrearCertificadoRequest {
    pub sede_id: i32,
    pub datos_tarea: serde_json::Value,
    pub administracion: serde_json::Value,
    pub riesgos: serde_json::Value,
    pub documentacion: serde_json::Value,
    pub controles: serde_json::Value,
    pub firmas_aceptacion: serde_json::Value,
    pub firmas_autorizacion: serde_json::Value,
    pub usuario: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActualizarCertificadoRequest {
    pub datos_tarea: Option<serde_json::Value>,
    pub administracion: Option<serde_json::Value>,
    pub riesgos: Option<serde_json::Value>,
    pub documentacion: Option<serde_json::Value>,
    pub controles: Option<serde_json::Value>,
    pub firmas_aceptacion: Option<serde_json::Value>,
    pub firmas_autorizacion: Option<serde_json::Value>,
    pub cierre: Option<serde_json::Value>,
    pub nota_cambio: String,
    pub usuario: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistorialCambio {
    pub fecha: String,
    pub nota: String,
    pub usuario: String,
    pub campo: Option<String>,
}