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

- **User**: Maneja la identidad. (`id`, `email`, `password`, `name`, `role`). El rol puede ser ESTUDIANTE, AUXILIAR o ADMIN.
- **RecoveryCode**: (`codigos_recuperacion`) Tabla para la lógica de olvido de contraseñas. (`id`, `code`, `userId`, `expiresAt`).
- **Project**: Los repositorios/proyectos compartidos. (`id`, `title`, `description`, `techStack`, `tags`, `isHighlighted`, `authorId`).
- **Thread**: Hilos de discusión para el Sys-Reddit. (`id`, `title`, `content`, `authorId`, `category`).
- **Comment**: Comentarios de un hilo. (`id`, `content`, `authorId`, `threadId`).
- **Vote**: Tabla pivot para votos (+1 / -1) asegurando que un usuario solo vote una vez por hilo/comentario. (`id`, `value`, `userId`, `threadId`, `commentId`).

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
