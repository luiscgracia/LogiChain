# DigiFormas - Sistema de Certificados Digitales

Plataforma para gestión de certificados de habilitación en terminales PRIMAX Colombia.

## Estructura del Proyecto

```
digiformas/
├── apps/
│   ├── web/              # Frontend Next.js 14 (App Router)
│   └── api/              # Backend Rust/Axum
├── packages/
│   └── ui/              # Componentes compartidos
├── services/
│   └── database/        # PostgreSQL + Prisma
├── input/               # PDFs fuentes
└── docs/               # Documentación
```

## Fases de Desarrollo

### Fase 1: Cimientos
- [ ] Configurar repositorio monorepo (Turborepo)
- [ ] Diseño DB PostgreSQL con control de consecutivos
- [ ] Backend Rust: API de consecutivos yauth
- [ ] Frontend Next.js: Setup + Tailwind

### Fase 2: Formulario MP-CT03
- [ ] Sección A: Datos de tarea
- [ ] Sección B: Administración  
- [ ] Sección C: 36 riesgos (SÍ/NO)
- [ ] Sección D: Documentación
- [ ] Sección E: Controles
- [ ] Secciones F,G,H: Firmas

### Fase 3: Funcionalidades
- [ ] CRUD completo
- [ ] Edición con notas obligatorias
- [ ] Generación PDF
- [ ] Panel admin y auditoría

### Fase 4: Despliegue
- [ ] Configurar dominio
- [ ] 15 terminales
- [ ] Modo offline/PWA