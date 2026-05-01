# DigiFormas API - Backend Rust

Backend API para el sistema de certificados digitales.

## Requisitos

- Rust 1.70+
- PostgreSQL 14+

## Variables de Entorno

```bash
DATABASE_URL=postgres://user:password@localhost:5432/digiformas
PORT=3001
RUST_LOG=info
```

## Ejecutar

```bash
cd apps/api
cargo run
```

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/sedes | Listar sedes |
| GET | /api/consecutivos/:sede_id | Ver estado de consecutivos |
| POST | /api/consecutivos/siguiente | Obtener siguiente número |
| POST | /api/consecutivos/autorizar | Autorizar bloque |
| GET | /api/certificados | Listar certificados |
| POST | /api/certificados | Crear certificado |
| PUT | /api/certificados/:id | Actualizar certificado |
| DELETE | /api/certificados/:id/anular | Anular certificado |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuario actual |