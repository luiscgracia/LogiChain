use sqlx::{PgPool, Row, Postgres};
use std::env;

pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| {
                "postgres://postgres:postgres@localhost:5432/digiformas".to_string()
            });

        let pool = PgPool::connect(&database_url).await?;

        Ok(Database { pool })
    }

    pub async fn obtener_sedes(&self) -> Result<Vec<crate::Sede>, sqlx::Error> {
        let rows = sqlx::query_as::<_, crate::Sede>(
            "SELECT id, nombre, prefijo_consecutivo, activa, fecha_creacion 
             FROM sedes WHERE activa = true ORDER BY nombre"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    pub async fn obtener_sede(&self, id: i32) -> Result<Option<crate::Sede>, sqlx::Error> {
        let row = sqlx::query_as::<_, crate::Sede>(
            "SELECT id, nombre, prefijo_consecutivo, activa, fecha_creacion 
             FROM sedes WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row)
    }

    pub async fn obtener_control_consecutivo(
        &self,
        sede_id: i32,
    ) -> Result<Option<crate::ControlConsecutivo>, sqlx::Error> {
        let row = sqlx::query_as::<_, crate::ControlConsecutivo>(
            "SELECT id, sede_id, form_referencia, ultimo_numero, bloque_actual, 
                    bloque_autorizado, token_autorizacion, ultimo_alerta_enviada
             FROM control_consecutivos 
             WHERE sede_id = $1 AND form_referencia = 'MP-CT03'"
        )
        .bind(sede_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row)
    }

    pub async fn siguiente_consecutivo(
        &self,
        sede_id: i32,
    ) -> Result<crate::ConsecutivoResponse, sqlx::Error> {
        // Obtener sede
        let sede = self.obtener_sede(sede_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        // Obtener control de consecutivos
        let mut control = self.obtener_control_consecutivo(sede_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let siguiente = control.ultimo_numero + 1;
        let limite_bloque = control.bloque_actual * 250;

        // Verificar si está bloqueado
        if siguiente > limite_bloque && !control.bloque_autorizado {
            return Err(sqlx::Error::RowNotFound); // Manejado como 403 en handler
        }

        // Verificar si necesita alerta (240, 490, etc.)
        let necesita_alerta = siguiente == (limite_bloque - 10) && 
            control.ultimo_alerta_enviada != siguiente;

        // Actualizar en la base de datos
        let _ = sqlx::query(
            "UPDATE control_consecutivos 
             SET ultimo_numero = $1 
             WHERE id = $2"
        )
        .bind(siguiente)
        .bind(control.id)
        .execute(&self.pool)
        .await;

        Ok(crate::ConsecutivoResponse {
            sede_id,
            prefijo: sede.prefijo_consecutivo,
            numero: siguiente,
            formato: format!("{}-{:06}", sede.prefijo_consecutivo, siguiente),
            bloque: control.bloque_actual,
            bloque_autorizado: control.bloque_autorizado,
            necesita_alerta,
        })
    }

    pub async fn autorizar_bloque(&self, token: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            "UPDATE control_consecutivos 
             SET bloque_autorizado = true, 
                 bloque_actual = bloque_actual + 1,
                 token_autorizacion = NULL
             WHERE token_autorizacion = $1
             RETURNING id"
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await?;

        Ok(result.is_some())
    }

    pub async fn listar_certificados(
        &self,
        sede_id: Option<i32>,
        estado: Option<String>,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<crate::Certificado>, sqlx::Error> {
        let mut query = String::from(
            "SELECT id, consecutive_completo, consecutive_num, sede_id, estado,
                    datos_tarea, administracion, riesgos, documentacion,
                    controles, firmas_aceptacion, firmas_autorizacion, cierre,
                    version, historial_cambios, fecha_creacion, fecha_actualizacion,
                    usuario_creador, usuario_actualizador
             FROM certificados_habilitacion WHERE 1=1"
        );

        if sede_id.is_some() {
            query.push_str(" AND sede_id = $1");
        }
        if estado.is_some() {
            query.push_str(" AND estado = $2");
        }
        query.push_str(" ORDER BY fecha_creacion DESC LIMIT $3 OFFSET $4");

        // Ejecutar query
        let mut q = sqlx::query_as::<_, crate::Certificado>(&query);
        
        if let Some(sid) = sede_id {
            q = q.bind(sid);
        }
        if let Some(est) = estado {
            q = q.bind(est);
        }
        q = q.bind(limit).bind(offset);

        let rows = q.fetch_all(&self.pool).await?;
        Ok(rows)
    }

    pub async fn crear_certificado(
        &self,
        req: &crate::CrearCertificadoRequest,
    ) -> Result<crate::Certificado, sqlx::Error> {
        // Obtener siguiente consecutivo
        let consecutive = self.siguiente_consecutivo(req.sede_id).await?;

        let id = uuid::Uuid::new_v4();
        
        let row = sqlx::query(
            "INSERT INTO certificados_habilitacion 
             (id, consecutive_completo, consecutive_num, sede_id, estado,
              datos_tarea, administracion, riesgos, documentacion,
              controles, firmas_aceptacion, firmas_autorizacion,
              historial_cambios, usuario_creador)
             VALUES ($1, $2, $3, $4, 'BORRADOR',
                    $5, $6, $7, $8, $9, $10, $11, '[]', $12)
             RETURNING *"
        )
        .bind(id)
        .bind(&consecutive.formato)
        .bind(consecutive.numero)
        .bind(req.sede_id)
        .bind(&req.datos_tarea)
        .bind(&req.administracion)
        .bind(&req.riesgos)
        .bind(&req.documentacion)
        .bind(&req.controles)
        .bind(&req.firmas_aceptacion)
        .bind(&req.firmas_autorizacion)
        .bind(&req.usuario)
        .fetch_one(&self.pool)
        .await?;

        Ok(row)
    }

    pub async fn actualizar_certificado(
        &self,
        id: uuid::Uuid,
        req: &crate::ActualizarCertificadoRequest,
    ) -> Result<crate::Certificado, sqlx::Error> {
        // Obtener certificado actual
        let actual = sqlx::query_as::<_, crate::Certificado>(
            "SELECT * FROM certificados_habilitacion WHERE id = $1"
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        // Construir historial
        let mut historial: Vec<crate::HistorialCambio> = 
            serde_json::from_value(actual.historial_cambios).unwrap_or_default();
        
        historial.push(crate::HistorialCambio {
            fecha: chrono::Utc::now().to_rfc3339(),
            nota: req.nota_cambio.clone(),
            usuario: req.usuario.clone(),
            campo: None,
        });

        let row = sqlx::query(
            "UPDATE certificados_habilitacion 
             SET datos_tarea = COALESCE($1, datos_tarea),
                 administracion = COALESCE($2, administracion),
                 riesgos = COALESCE($3, riesgos),
                 documentacion = COALESCE($4, documentacion),
                 controles = COALESCE($5, controles),
                 firmas_aceptacion = COALESCE($6, firmas_aceptacion),
                 firmas_autorizacion = COALESCE($7, firmas_autorizacion),
                 cierre = COALESCE($8, cierre),
                 version = version + 1,
                 historial_cambios = $9,
                 fecha_actualizacion = NOW(),
                 usuario_actualizador = $10,
                 estado = CASE WHEN estado = 'CERRADO' THEN 'ACTIVO' ELSE estado END
             WHERE id = $11
             RETURNING *"
        )
        .bind(&req.datos_tarea)
        .bind(&req.administracion)
        .bind(&req.riesgos)
        .bind(&req.documentacion)
        .bind(&req.controles)
        .bind(&req.firmas_aceptacion)
        .bind(&req.firmas_autorizacion)
        .bind(&req.cierre)
        .bind(serde_json::to_value(&historial).unwrap())
        .bind(&req.usuario)
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        Ok(row)
    }

    pub async fn anular_certificado(
        &self,
        id: uuid::Uuid,
        usuario: &str,
    ) -> Result<(), sqlx::Error> {
        let _ = sqlx::query(
            "UPDATE certificados_habilitacion 
             SET estado = 'ANULADO',
                 fecha_actualizacion = NOW(),
                 usuario_actualizador = $1
             WHERE id = $2"
        )
        .bind(usuario)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn verificar_usuario(
        &self,
        email: &str,
    ) -> Result<Option<crate::Usuario>, sqlx::Error> {
        let row = sqlx::query_as::<_, crate::Usuario>(
            "SELECT * FROM usuarios WHERE email = $1 AND activo = true"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row)
    }
}