use axum::{
    routing::{get, post, put, delete},
    Router,
    Json,
    Extract,
};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInit};

mod models;
mod handlers;
mod db;

pub use models::*;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<db::Database>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .init();

    let db = db::Database::new().await.expect("Failed to connect to database");
    let state = AppState { db: Arc::new(db) };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(|| async { "DigiFormas API v1" }))
        .route("/api/sedes", get(handlers::listar_sedes))
        .route("/api/consecutivos/:sede_id", get(handlers::obtener_consecutivo))
        .route("/api/consecutivos/siguiente", post(handlers::siguiente_consecutivo))
        .route("/api/consecutivos/autorizar", post(handlers::autorizar_bloque))
        .route("/api/certificados", get(handlers::listar_certificados))
        .route("/api/certificados", post(handlers::crear_certificado))
        .route("/api/certificados/:id", get(handlers::obtener_certificado))
        .route("/api/certificados/:id", put(handlers::actualizar_certificado))
        .route("/api/certificados/:id/anular", delete(handlers::anular_certificado))
        .route("/api/auth/login", post(handlers::login))
        .route("/api/auth/me", get(handlers::me))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse()
        .unwrap_or(3001);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .expect("Failed to bind port");

    tracing::info!("Server running on http://localhost:{}", port);

    axum::serve(listener, app)
        .await
        .expect("Server error");
}