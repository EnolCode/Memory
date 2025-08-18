# 🚀 Memory App - Roadmap de Implementación Completo

## 📋 Visión General
Desarrollar una aplicación completa de gestión de lecturas con notas y aprendizajes, siguiendo un enfoque iterativo donde cada fase construye sobre la anterior.

## 🎯 Estado Actual del Proyecto

### ✅ Completado
- **Docker Setup**: Contenedores funcionando (PostgreSQL, Redis, Backend, Frontend)
- **Base de datos**: PostgreSQL configurado en puerto 5433
- **Dependencias Backend**: TypeORM, JWT, Passport, Bcrypt, Swagger instaladas
- **Dependencias Frontend**: Vue Router, Pinia, Axios, PrimeVue, Chart.js instaladas
- **Documentación**: Database design y roadmap creados

### 🚧 En Progreso
- **Fase 0**: Configuración base (80% completado)

### 📝 Próximos Pasos
1. Configurar TypeORM con PostgreSQL
2. Crear estructura de carpetas
3. Comenzar con módulo de autenticación (Fase 1)

### 🔧 Stack Tecnológico Decidido
- **ORM**: TypeORM
- **UI Framework**: PrimeVue
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Charts**: Chart.js con vue-chartjs
- **Date handling**: date-fns

---

## 🎯 FASE 0: Setup y Configuración Base (2-3 horas) ✅ COMPLETADO
*Objetivo: Tener el entorno de desarrollo completamente configurado*

### Backend Setup ✅
- [x] ~~Instalar dependencias base de NestJS~~ **COMPLETADO - Todas las dependencias ya están en package.json**
  - TypeORM, JWT, Passport, Bcrypt, Swagger, etc. ya instaladas
  - `passport-local` agregado para autenticación local
- [ ] Configurar TypeORM en `app.module.ts`
- [ ] Crear archivo de configuración de base de datos
- [ ] Configurar variables de entorno (.env)
- [ ] Configurar Swagger para documentación de API
- [ ] Crear estructura de carpetas (common, config, database)

### Frontend Setup ✅
- [ ] Limpiar proyecto Vue inicial
- [x] ~~Instalar dependencias necesarias~~ **COMPLETADO - Todas las dependencias ya están en package.json**
  - axios, pinia, vue-router ya instaladas
  - @vueuse/core para composables útiles
  - PrimeVue + PrimeIcons para UI
  - chart.js + vue-chartjs para gráficos
  - date-fns para manejo de fechas
  - vue-toastification para notificaciones
  - unplugin-auto-import y unplugin-vue-components para DX
- [ ] Configurar Vue Router
- [ ] Configurar Pinia store
- [ ] Configurar Axios con interceptores
- [ ] Crear estructura de carpetas (views, components, services, stores, utils)
- [ ] Configurar sistema de diseño base (colores, tipografía)
- [ ] Configurar PrimeVue theme

---

## 🎯 FASE 1: Sistema de Autenticación (3-4 días)
*Objetivo: Sistema completo de auth funcionando con JWT*

### Backend - Auth Module
- [ ] Generar módulo de autenticación
  ```bash
  # Desde tu terminal de Windows:
  docker exec -it memory_backend bash
  
  # Dentro del contenedor:
  nest g module auth
  nest g controller auth
  nest g service auth
  nest g module users
  nest g service users
  
  exit
  ```
- [ ] Crear entidad User con TypeORM
- [ ] Crear DTOs (RegisterDto, LoginDto, UpdateUserDto)
- [ ] Implementar servicio de usuarios
  - [ ] Crear usuario con hash de password
  - [ ] Buscar usuario por email/username
  - [ ] Validar credenciales
- [ ] Implementar JWT Strategy
- [ ] Implementar Local Strategy
- [ ] Crear Auth Guards (JWT, Local)
- [ ] Endpoints de autenticación:
  - [ ] POST /auth/register
  - [ ] POST /auth/login
  - [ ] POST /auth/refresh
  - [ ] POST /auth/logout
  - [ ] GET /auth/profile
- [ ] Implementar refresh tokens
- [ ] Tests unitarios del servicio auth

### Frontend - Auth System
- [ ] Crear vistas de autenticación
  - [ ] LoginView.vue
  - [ ] RegisterView.vue
  - [ ] ForgotPasswordView.vue (placeholder)
- [ ] Crear Auth Store (Pinia)
  - [ ] Estado: user, token, isAuthenticated
  - [ ] Actions: login, register, logout, refreshToken
- [ ] Crear Auth Service (Axios)
- [ ] Implementar Auth Guard para rutas
- [ ] Implementar interceptor de Axios para tokens
- [ ] Implementar auto-refresh de tokens
- [ ] Crear componente de layout con navbar
- [ ] Manejo de errores y mensajes de feedback

---

## 🎯 FASE 2: Módulo de Libros - CRUD Básico (3-4 días)
*Objetivo: Poder crear, listar, ver y editar libros*

### Backend - Books Module
- [ ] Crear entidades con TypeORM
  - [ ] BookCatalog entity
  - [ ] UserBook entity
  - [ ] Crear migraciones
- [ ] Generar módulo de libros
  ```bash
  nest g module books
  nest g controller books
  nest g service books
  ```
- [ ] Crear DTOs
  - [ ] CreateBookDto
  - [ ] UpdateBookDto
  - [ ] BookResponseDto
- [ ] Implementar servicio de libros
  - [ ] Crear libro en catálogo
  - [ ] Agregar libro a biblioteca personal
  - [ ] Actualizar estado de lectura
  - [ ] Listar libros del usuario (con filtros)
  - [ ] Obtener detalle de libro
- [ ] Endpoints:
  - [ ] GET /books (listar mis libros)
  - [ ] GET /books/:id (detalle)
  - [ ] POST /books (agregar libro)
  - [ ] PUT /books/:id (actualizar)
  - [ ] DELETE /books/:id (eliminar)
  - [ ] PATCH /books/:id/status (cambiar estado)
  - [ ] PATCH /books/:id/progress (actualizar progreso)
- [ ] Agregar paginación
- [ ] Agregar filtros (status, rating, etc)
- [ ] Validaciones y manejo de errores

### Frontend - Books Management
- [ ] Crear vistas de libros
  - [ ] BooksListView.vue (grid/lista de libros)
  - [ ] BookDetailView.vue (detalle del libro)
  - [ ] AddBookView.vue (formulario)
  - [ ] EditBookView.vue
- [ ] Crear componentes
  - [ ] BookCard.vue
  - [ ] BookForm.vue
  - [ ] BookFilters.vue
  - [ ] StatusBadge.vue
  - [ ] RatingStars.vue
- [ ] Crear Books Store
  - [ ] Estado: books, currentBook, filters, loading
  - [ ] Actions: fetchBooks, fetchBook, createBook, updateBook
- [ ] Crear Books Service
- [ ] Implementar búsqueda y filtros
- [ ] Implementar cambio de vista (grid/lista)
- [ ] Lazy loading de imágenes
- [ ] Placeholder para libros sin portada

---

## 🎯 FASE 3: Sistema de Notas (4-5 días)
*Objetivo: CRUD completo de notas asociadas a libros*

### Backend - Notes Module
- [ ] Crear entidad Note
- [ ] Crear migración
- [ ] Generar módulo
  ```bash
  nest g module notes
  nest g controller notes
  nest g service notes
  ```
- [ ] Crear DTOs
  - [ ] CreateNoteDto
  - [ ] UpdateNoteDto
  - [ ] NoteResponseDto
- [ ] Implementar servicio
  - [ ] Crear nota
  - [ ] Listar notas de un libro
  - [ ] Actualizar nota
  - [ ] Eliminar nota
  - [ ] Buscar en notas
- [ ] Endpoints:
  - [ ] GET /books/:bookId/notes
  - [ ] GET /notes/:id
  - [ ] POST /books/:bookId/notes
  - [ ] PUT /notes/:id
  - [ ] DELETE /notes/:id
  - [ ] GET /notes/search?q=
- [ ] Ordenamiento (fecha, página, tipo)
- [ ] Validaciones de permisos

### Frontend - Notes System
- [ ] Actualizar BookDetailView con sección de notas
- [ ] Crear componentes de notas
  - [ ] NotesList.vue
  - [ ] NoteCard.vue
  - [ ] NoteForm.vue (modal/drawer)
  - [ ] NoteEditor.vue (textarea mejorado)
  - [ ] NoteTypeSelector.vue
- [ ] Crear Notes Store
  - [ ] Estado: notes, currentNote, filters
  - [ ] Actions: fetchNotes, createNote, updateNote, deleteNote
- [ ] Implementar tipos de notas con colores/iconos
- [ ] Implementar búsqueda en notas
- [ ] Implementar filtros por tipo
- [ ] Preview de Markdown (opcional)
- [ ] Copiar cita al portapapeles
- [ ] Exportar notas (formato básico)

---

## 🎯 FASE 4: Sistema de Tags (2-3 días)
*Objetivo: Categorización flexible con tags*

### Backend - Tags System
- [ ] Crear entidades
  - [ ] Tag entity
  - [ ] UserBookTag entity
  - [ ] NoteTag entity
- [ ] Crear migraciones
- [ ] Agregar endpoints a books controller
  - [ ] POST /books/:id/tags
  - [ ] DELETE /books/:id/tags/:tagId
- [ ] Agregar endpoints a notes controller
  - [ ] POST /notes/:id/tags
  - [ ] DELETE /notes/:id/tags/:tagId
- [ ] Endpoint de tags
  - [ ] GET /tags (listar todos)
  - [ ] POST /tags (crear)
  - [ ] GET /tags/popular (más usados)
- [ ] Actualizar queries para incluir tags
- [ ] Búsqueda por tags

### Frontend - Tags
- [ ] Crear componente TagInput.vue (autocomplete)
- [ ] Crear componente TagList.vue
- [ ] Crear componente TagCloud.vue
- [ ] Integrar tags en BookForm
- [ ] Integrar tags en NoteForm
- [ ] Agregar filtro por tags en listados
- [ ] Vista de todos los tags
- [ ] Gestión de colores de tags

---

## 🎯 FASE 5: Integración API Externa (2-3 días)
*Objetivo: Autocompletar información de libros*

### Backend - External APIs
- [ ] Integrar Google Books API
  - [ ] Crear servicio GoogleBooksService
  - [ ] Endpoint de búsqueda: GET /books/search?q=
  - [ ] Endpoint de detalle: GET /books/external/:isbn
- [ ] Cachear resultados en Redis
- [ ] Mapear datos externos a nuestro modelo
- [ ] Manejar límites de rate de la API

### Frontend - Book Search
- [ ] Crear vista SearchBookView.vue
- [ ] Crear componente BookSearchResults.vue
- [ ] Implementar búsqueda con debounce
- [ ] Preview de libro antes de agregar
- [ ] Opción de editar datos antes de guardar
- [ ] Loading states y skeletons
- [ ] Manejo de errores de API

---

## 🎯 FASE 6: Estadísticas y Dashboard (3-4 días)
*Objetivo: Visualización de hábitos de lectura*

### Backend - Statistics
- [ ] Crear servicio de estadísticas
- [ ] Endpoints:
  - [ ] GET /stats/overview (resumen general)
  - [ ] GET /stats/yearly/:year
  - [ ] GET /stats/reading-pace
  - [ ] GET /stats/genres
  - [ ] GET /stats/authors
- [ ] Queries optimizadas con agregaciones
- [ ] Cache de estadísticas en Redis

### Frontend - Dashboard
- [ ] Instalar librería de gráficos (Chart.js o ApexCharts)
- [ ] Crear DashboardView.vue
- [ ] Crear componentes de estadísticas
  - [ ] StatsCard.vue
  - [ ] ReadingChart.vue
  - [ ] YearlyProgress.vue
  - [ ] GenreDistribution.vue
  - [ ] ReadingStreak.vue
  - [ ] RecentActivity.vue
- [ ] Crear Stats Store
- [ ] Implementar período de tiempo seleccionable
- [ ] Exportar estadísticas a PDF

---

## 🎯 FASE 7: Tracking de Sesiones y Metas (2-3 días)
*Objetivo: Seguimiento detallado del progreso*

### Backend - Reading Tracking
- [ ] Crear entidades
  - [ ] ReadingSession entity
  - [ ] ReadingGoal entity
- [ ] Endpoints de sesiones
  - [ ] POST /books/:id/sessions
  - [ ] GET /books/:id/sessions
  - [ ] PUT /sessions/:id
- [ ] Endpoints de metas
  - [ ] GET /goals/:year
  - [ ] POST /goals
  - [ ] PUT /goals/:id
- [ ] Cálculo automático de progreso

### Frontend - Progress Tracking
- [ ] Crear componente SessionTimer.vue
- [ ] Crear componente QuickProgress.vue
- [ ] Crear vista GoalsView.vue
- [ ] Crear componente GoalProgress.vue
- [ ] Integrar en BookDetailView
- [ ] Notificaciones de logros

---

## 🎯 FASE 8: Mejoras UX/UI (3-4 días)
*Objetivo: Pulir la experiencia de usuario*

### General Improvements
- [ ] Implementar dark mode
- [ ] Implementar diseño responsive completo
- [ ] Agregar animaciones y transiciones
- [ ] Implementar búsqueda global (cmd+k)
- [ ] Shortcuts de teclado
- [ ] Tour de onboarding
- [ ] Confirmaciones de acciones destructivas
- [ ] Estados vacíos ilustrados
- [ ] Skeleton loaders
- [ ] Pull to refresh en móvil
- [ ] PWA básico

### Performance
- [ ] Lazy loading de rutas
- [ ] Virtualización de listas largas
- [ ] Optimización de imágenes
- [ ] Implementar service worker
- [ ] Cache de API calls

---

## 🎯 FASE 9: Testing (A lo largo del desarrollo)
*Objetivo: Cobertura de tests > 70%*

### Backend Testing
- [ ] Tests unitarios de servicios
- [ ] Tests de integración de controllers
- [ ] Tests e2e de flujos críticos
- [ ] Tests de autorización

### Frontend Testing
- [ ] Tests unitarios de stores
- [ ] Tests de componentes con Vitest
- [ ] Tests e2e con Playwright/Cypress
- [ ] Tests de accesibilidad

---

## 🎯 FASE 10: Deployment (2-3 días)
*Objetivo: Aplicación en producción*

### Preparación
- [ ] Configurar Docker para producción
- [ ] Configurar variables de entorno de producción
- [ ] Optimizar queries de base de datos
- [ ] Configurar logs y monitoring
- [ ] Configurar backups de BD

### Deployment Options
- [ ] Opción A: VPS (DigitalOcean/Linode)
  - [ ] Configurar servidor
  - [ ] Configurar nginx
  - [ ] Configurar SSL con Let's Encrypt
  - [ ] CI/CD con GitHub Actions
  
- [ ] Opción B: PaaS
  - [ ] Backend en Railway/Render
  - [ ] Frontend en Vercel/Netlify
  - [ ] BD en Supabase/Neon

### Post-deployment
- [ ] Configurar dominio
- [ ] Configurar analytics
- [ ] Configurar error tracking (Sentry)
- [ ] Documentación de API
- [ ] Documentación de usuario

---

## 📊 Estimación de Tiempo Total

| Fase | Tiempo Estimado | Prioridad |
|------|----------------|-----------|
| Fase 0: Setup | 2-3 horas | Crítica |
| Fase 1: Auth | 3-4 días | Crítica |
| Fase 2: Books CRUD | 3-4 días | Crítica |
| Fase 3: Notes | 4-5 días | Crítica |
| Fase 4: Tags | 2-3 días | Alta |
| Fase 5: API Externa | 2-3 días | Media |
| Fase 6: Estadísticas | 3-4 días | Media |
| Fase 7: Tracking | 2-3 días | Media |
| Fase 8: UX/UI | 3-4 días | Alta |
| Fase 9: Testing | Continuo | Alta |
| Fase 10: Deployment | 2-3 días | Crítica |

**Total estimado**: 4-6 semanas para MVP completo (Fases 0-3)
**Total con todas las features**: 8-10 semanas

## 🎯 Definición de MVP (Minimum Viable Product)

**MVP = Fases 0, 1, 2, 3**
- Usuario puede registrarse y loguearse
- Usuario puede agregar libros a su biblioteca
- Usuario puede cambiar estado de lectura
- Usuario puede agregar notas a sus libros
- Usuario puede ver y editar sus notas

**MVP+** (Recomendado) **= MVP + Fases 4, 5**
- Sistema de tags para organización
- Búsqueda de libros con API externa

## 💡 Consejos de Implementación

1. **Empieza siempre por el backend**: Es más fácil construir el frontend cuando la API está lista
2. **Usa Postman/Insomnia**: Prueba tus endpoints antes de hacer el frontend
3. **Commits frecuentes**: Un commit por feature pequeña
4. **No te saltes fases**: Cada fase depende de la anterior
5. **Prueba mientras desarrollas**: No dejes los tests para el final
6. **Documentación inline**: Comenta el código complejo mientras lo escribes
7. **Refactoriza pronto**: Si algo se siente mal, probablemente lo es

## 🚦 Checkpoints de Validación

### Después de Fase 1 (Auth)
- [ ] Puedo registrar un usuario nuevo
- [ ] Puedo hacer login y recibir un token
- [ ] Las rutas protegidas requieren token
- [ ] El token se refresca automáticamente

### Después de Fase 2 (Books)
- [ ] Puedo ver mi biblioteca vacía
- [ ] Puedo agregar un libro manualmente
- [ ] Puedo ver el detalle de un libro
- [ ] Puedo cambiar el estado de lectura
- [ ] Los libros se filtran correctamente

### Después de Fase 3 (Notes) - MVP Completo
- [ ] Puedo agregar notas a un libro
- [ ] Puedo ver todas las notas de un libro
- [ ] Puedo editar y eliminar notas
- [ ] Las notas se ordenan por fecha
- [ ] Puedo buscar en mis notas

## 🎨 Decisiones de Diseño Pendientes

- [ ] ¿Paleta de colores? (Sugerencia: tonos cálidos, papel/sepia)
- [ ] ¿Font principal? (Sugerencia: Serif para lectura)
- [ ] ¿Iconos? (FontAwesome, Heroicons, Phosphor)
- [ ] ¿Componentes UI? (PrimeVue, Vuetify, custom con Tailwind)
- [ ] ¿Logo y branding?

## 📚 Recursos Útiles

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Vue 3 Docs](https://vuejs.org)
- [Google Books API](https://developers.google.com/books)
- [JWT.io](https://jwt.io)
- [Pinia Docs](https://pinia.vuejs.org)

---

**Siguiente paso inmediato**: Completar Fase 0 (Setup) y comenzar con Fase 1 (Auth Backend)