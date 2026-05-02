# SysHub - Fase 2: Implementación y Desarrollo

## 1. Arquitectura del Sistema
SysHub se basa en una arquitectura cliente-servidor separada:
- **Frontend**: Aplicación Single-Page (SPA) desarrollada en **Vue.js 3** con la Composition API. Utiliza **Tailwind CSS** para los estilos, **Vue Router** para la navegación y **Pinia** para la gestión del estado global (autenticación).
- **Backend**: API RESTful construida con **NestJS** (Node.js). Implementa guardias JWT para la seguridad, bcrypt para el hasheo de contraseñas, y el decorador  `@UseGuards(AuthGuard('jwt'))` para proteger rutas.
- **Base de Datos**: Base de datos relacional **PostgreSQL**, modelada e interactuada a través del ORM **Prisma**. El uso de Prisma asegura la persistencia de datos tipados y migraciones eficientes.

## 2. Documentación de la API

### Autenticación (`/auth`)
- `POST /auth/register`: Crea un nuevo usuario. Cuerpo: `name`, `email`, `password`, `role`.
- `POST /auth/login`: Autenticación. Retorna el access_token y datos del usuario.
- `POST /auth/forgot-password`: Genera y envía un código de 5 dígitos al correo para recuperación.
- `POST /auth/reset-password`: Valida el código y actualiza la contraseña. Cuerpo: `email`, `code`, `newPassword`.

### Usuarios (`/users`)
- `GET /users/profile`: (Protegido) Retorna la información del usuario autenticado, sus proyectos, y actividad en foros.
- `PUT /users/profile`: (Protegido) Actualiza el perfil del usuario.

### Proyectos (`/projects`)
- `GET /projects`: Lista todos los proyectos. Acepta query param `?q=` para búsqueda por título, tecnología o etiqueta.
- `POST /projects`: (Protegido) Sube un nuevo proyecto al "Hub".
- `PUT /projects/:id/highlight`: (Protegido - Auxiliar/Admin) Destaca o quita el destacado de un proyecto.

### Foros (`/threads`)
- `GET /threads`: Obtiene la lista de hilos de "Sys-Reddit" con sus contadores de votos y comentarios.
- `GET /threads/:id`: Obtiene un hilo específico con sus comentarios y votos.
- `POST /threads`: (Protegido) Crea un nuevo hilo de discusión.
- `POST /threads/:id/comments`: (Protegido) Agrega un comentario a un hilo.
- `POST /threads/:id/vote`: (Protegido) Emite un voto (+1 o -1) en un hilo.

### Administración (`/admin`)
- `GET /admin/users`: (Protegido - Admin) Lista todos los usuarios.
- `PUT /admin/users/:id/role`: (Protegido - Admin) Cambia el rol de un usuario.
- `DELETE /admin/users/:id`: (Protegido - Admin) Elimina un usuario del sistema.
- `DELETE /admin/threads/:id`: (Protegido - Admin/Auxiliar) Modera y elimina un hilo de discusión.

## 3. Diccionario de Datos Principal

A continuación se detallan las tablas que componen la base de datos de SysHub:

### Tabla: `User`
Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único autoincremental. |
| `email` | String (U) | Correo electrónico del usuario (único). |
| `password` | String | Contraseña hasheada. |
| `name` | String | Nombre completo del usuario. |
| `bio` | String? | Biografía opcional del usuario. |
| `roleId` | Int (FK) | Referencia al rol del usuario. |
| `statusId` | Int (FK) | Referencia al estado de la cuenta. |
| `createdAt` | DateTime | Fecha de creación del registro. |
| `updatedAt` | DateTime | Fecha de última actualización. |

### Tabla: `Role`
Define los roles disponibles en el sistema (ADMIN, AUXILIAR, ESTUDIANTE).

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `name` | String (U) | Nombre del rol. |

### Tabla: `Status`
Define los estados posibles de una cuenta de usuario.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `name` | String (U) | Nombre del estado (ej. Activo, Inactivo). |

### Tabla: `Project`
Repositorios y proyectos compartidos por los estudiantes.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `title` | String | Título del proyecto. |
| `description` | String | Descripción detallada. |
| `techStack` | String | Tecnologías utilizadas (texto). |
| `fileUrl` | String? | Enlace al archivo del proyecto. |
| `attachments` | String? | Adjuntos adicionales. |
| `category` | String? | Categoría del proyecto. |
| `authorId` | Int (FK) | ID del autor (User). |
| `highlightedById` | Int? (FK) | ID del auxiliar que destacó el proyecto. |
| `createdAt` | DateTime | Fecha de creación. |
| `updatedAt` | DateTime | Fecha de actualización. |

### Tabla: `Tag`
Etiquetas para categorizar los proyectos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `name` | String (U) | Nombre de la etiqueta. |

### Tabla: `ProjectTag`
Tabla pivot para la relación muchos a muchos entre Proyectos y Etiquetas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `projectId` | Int (PK, FK)| ID del proyecto. |
| `tagId` | Int (PK, FK) | ID de la etiqueta. |

### Tabla: `Thread`
Hilos de discusión en los foros (Sys-Reddit).

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `title` | String | Título del hilo. |
| `content` | String | Contenido o cuerpo del hilo. |
| `category` | String? | Categoría del hilo. |
| `authorId` | Int (FK) | ID del autor. |
| `createdAt` | DateTime | Fecha de creación. |
| `updatedAt` | DateTime | Fecha de actualización. |

### Tabla: `Comment`
Comentarios realizados en hilos, proyectos o blogs. Soporta anidamiento.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `content` | String | Contenido del comentario. |
| `authorId` | Int (FK) | ID del autor. |
| `threadId` | Int? (FK) | ID del hilo relacionado (si aplica). |
| `projectId` | Int? (FK) | ID del proyecto relacionado (si aplica). |
| `blogId` | Int? (FK) | ID del blog relacionado (si aplica). |
| `parentId` | Int? (FK) | ID del comentario padre (para respuestas). |
| `createdAt` | DateTime | Fecha de creación. |
| `updatedAt` | DateTime | Fecha de actualización. |

### Tabla: `Blog`
Artículos o publicaciones informativas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `title` | String | Título del artículo. |
| `content` | String | Contenido del artículo. |
| `authorId` | Int (FK) | ID del autor. |
| `createdAt` | DateTime | Fecha de creación. |
| `updatedAt` | DateTime | Fecha de actualización. |

### Tabla: `Vote`
Registro de votos (+1/-1) para hilos y comentarios.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `value` | Int | Valor del voto (1 o -1). |
| `userId` | Int (FK) | ID del usuario que vota. |
| `threadId` | Int? (FK) | ID del hilo votado. |
| `commentId` | Int? (FK) | ID del comentario votado. |

### Tabla: `codigos_recuperacion`
Códigos temporales para el restablecimiento de contraseñas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `code` | String | Código de 5-6 caracteres. |
| `userId` | Int (FK) | ID del usuario. |
| `createdAt` | DateTime | Fecha de generación. |
| `expiresAt` | DateTime | Fecha de expiración. |

### Tabla: `Report`
Reportes de moderación para contenidos del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Int (PK) | Identificador único. |
| `reason` | String | Motivo del reporte. |
| `status` | String | Estado (PENDING, RESOLVED, DISMISSED). |
| `reporterId` | Int (FK) | ID del usuario que reporta. |
| `targetType` | String | Tipo de objetivo (PROJECT, THREAD, etc.). |
| `targetId` | Int | ID del contenido reportado. |
| `createdAt` | DateTime | Fecha de creación. |
| `updatedAt` | DateTime | Fecha de actualización. |


---

## 4. Manual de Usuario (Guía Rápida)

### Guía de Inicio Rápido
1. Accede a la pantalla de inicio y haz clic en "Iniciar Sesión" o "Registrarse".
2. Si olvidaste tu contraseña, selecciona "¿Olvidaste tu contraseña?", ingresa tu correo y recibirás un código de 5 dígitos para restablecerla.

### Guía para el Estudiante
- **The Hub**: Entra a "The Hub" desde el menú. Usa el botón "Subir Proyecto" para agregar tus trabajos. Usa la barra de búsqueda para filtrar por tecnologías.
- **Sys-Reddit**: Entra a "Foros". Clica en "Nuevo Hilo" para consultar dudas. Puedes comentar los hilos de tus compañeros y usar los botones de flecha (upvote/downvote) para dar relevancia.
- **Mi Perfil**: Desde tu perfil puedes editar tus datos básicos, ver la lista de tus proyectos subidos y tu historial en foros.

### Guía para el Auxiliar
- Tienes permisos especiales en **The Hub**. Al ver un proyecto excepcional, haz clic en "Destacar". Esto añadirá una medalla visual (⭐ Destacado por Auxiliar) y lo resaltará para futuros estudiantes.

### Guía para el Administrador
- Tienes acceso al botón "Admin" en la barra de navegación superior.
- Desde este panel puedes visualizar a todos los usuarios registrados, modificar sus roles (Ascender a Auxiliar o degradar a Estudiante) y eliminar cuentas si fuera necesario para mantener el orden.
