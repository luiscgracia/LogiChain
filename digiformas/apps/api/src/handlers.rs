use axum::{
    Json,
    extract::{State, Path, Query},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;

use crate::{AppState, models::*};

#[derive(Deserialize)]
pub struct ListQuery {
    sede_id: Option<i32>,
    estado: Option<String>,
    limit: Option<i32>,
    offset: Option<i32>,
}

// ============================================
// HANDLERS DE SEDES
// ============================================

pub async fn listar_sedes(
    State(state): State<AppState>,
) -> Result<Json<Vec<Sede>>, StatusCode> {
    let sedes = state.db.obtener_sedes()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(sedes))
}

// ============================================
// HANDLERS DE CONSECUTIVOS
// ============================================

pub async fn obtener_consecutivo(
    State(state): State<AppState>,
    Path(sede_id): Path<i32>,
) -> Result<Json<ConsecutivoResponse>, StatusCode> {
    let control = state.db.obtener_control_consecutivo(sede_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let sede = state.db.obtener_sede(sede_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(ConsecutivoResponse {
        sede_id,
        prefijo: sede.prefijo_consecutivo,
        numero: control.ultimo_numero,
        formato: format!("{}-{:06}", sede.prefijo_consecutivo, control.ultimo_numero),
        bloque: control.bloque_actual,
        bloque_autorizado: control.bloque_autorizado,
        necesita_alerta: control.ultimo_numero == (control.bloque_actual * 250) - 10,
    }))
}

pub async fn siguiente_consecutivo(
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let sede_id = match payload.get("sede_id").and_then(|v| v.as_i64()) {
        Some(id) => id as i32,
        None => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({
            "error": "sede_id requerido"
        }))).into_response(),
    };

    match state.db.siguiente_consecutivo(sede_id).await {
        Ok(consecutivo) => (StatusCode::OK, Json(consecutivo)).into_response(),
        Err(sqlx::Error::RowNotFound) => (StatusCode::FORBIDDEN, Json(serde_json::json!({
            "error": "Bloque agotado",
            "mensaje": "Contacte al administrador para autorizar el siguiente bloque de 250",
            "sede_id": sede_id
        }))).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
            "error": "Error interno"
        }))).into_response(),
    }
}

pub async fn autorizar_bloque(
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let token = match payload.get("token").and_then(|v| v.as_str()) {
        Some(t) => t,
        None => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({
            "error": "token requerido"
        }))).into_response(),
    };

    match state.db.autorizar_bloque(token).await {
        Ok(true) => (StatusCode::OK, Json(serde_json::json!({
            "success": true,
            "mensaje": "Bloque autorizado correctamente"
        }))).into_response(),
        Ok(false) => (StatusCode::NOT_FOUND, Json(serde_json::json!({
            "error": "Token inválido"
        }))).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
            "error": "Error interno"
        }))).into_response(),
    }
}

// ============================================
// HANDLERS DE CERTIFICADOS
// ============================================

pub async fn listar_certificados(
    State(state): State<AppState>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<Certificado>>, StatusCode> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);
    
    let certificados = state.db.listar_certificados(
        query.sede_id,
        query.estado,
        limit,
        offset,
    ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(certificados))
}

pub async fn crear_certificado(
    State(state): State<AppState>,
    Json(req): Json<CrearCertificadoRequest>,
) -> Result<Json<Certificado>, StatusCode> {
    let certificado = state.db.crear_certificado(&req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(certificado))
}

pub async fn obtener_certificado(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<Certificado>, StatusCode> {
    // Por implementar - obtener un certificado por ID
    // Retornar error temporal
    Ok(Json(Certificado {
        id,
        consecutive_completo: String::new(),
        consecutive_num: 0,
        sede_id: 0,
        estado: String::new(),
        datos_tarea: serde_json::json!({}),
        administracion: serde_json::json!({}),
        riesgos: serde_json::json!({}),
        documentacion: serde_json::json!({}),
        controles: serde_json::json!({}),
        firmas_aceptacion: serde_json::json!({}),
        firmas_autorizacion: serde_json::json!({}),
        cierre: serde_json::json!({}),
        version: 0,
        historial_cambios: serde_json::json!({}),
        fecha_creacion: chrono::Utc::now(),
        fecha_actualizacion: chrono::Utc::now(),
        usuario_creador: None,
        usuario_actualizador: None,
    }))
}

pub async fn actualizar_certificado(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(req): Json<ActualizarCertificadoRequest>,
) -> Result<Json<Certificado>, StatusCode> {
    let certificado = state.db.actualizar_certificado(id, &req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(certificado))
}

pub async fn anular_certificado(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> impl IntoResponse {
    // Por implementar
    (StatusCode::OK, Json(serde_json::json!({
        "success": true
    }))).into_response()
}

// ============================================
// HANDLERS DE AUTH
// ============================================

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> impl IntoResponse {
    // Por implementar con bcrypt y JWT
    // Por ahora retornamos un token mock
    (StatusCode::OK, Json(LoginResponse {
        token: "mock_token_123".to_string(),
        usuario: UsuarioResponse {
            id: 1,
            email: req.email,
            nombre: "Usuario Demo".to_string(),
            rol: "OPERARIO".to_string(),
            sede_id: Some(1),
        },
    })).into_response()
}

pub async fn me() -> impl IntoResponse {
    (StatusCode::OK, Json(UsuarioResponse {
        id: 1,
        email: "demo@digiformas.com".to_string(),
        nombre: "Usuario Demo".to_string(),
        rol: "OPERARIO".to_string(),
        sede_id: Some(1),
    })).into_response()
}