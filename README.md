# Bitácora de Campaña (MVP Fase 1)

Libreta digital offline-first para partidas de D&D y juegos de rol de mesa. Permite gestionar campañas, registrar sesiones detalladas y anotar crónicas de juego con persistencia en el almacenamiento local del navegador.

## Características implementadas

- **Gestión de Campañas**:
  - Creación y edición de campañas (Nombre, Sistema de juego, Descripción, Estado [activa, pausada, completada, abandonada], Fecha de inicio, Notas privadas del DM).
  - Contador de sesiones y fecha de la última sesión.
  - Eliminación segura con confirmación modal.

- **Registro de Sesiones**:
  - Numeración autonumérica con cálculo automático del siguiente número de sesión.
  - Registro de título, fecha real, días transcurridos en el mundo de juego (inicio/fin), duración en horas y notas narrativas.
  - Sistema de etiquetas dinámicas (#combate, #mazmorra, etc.).
  - Vista de lectura optimizada con tipografía serif/sans-serif de alto contraste.
  - Paginación y navegación entre sesiones anteriores y siguientes.

- **Fase 2 Preparada**:
  - Estructuras de datos declaradas para NPCs, Lugares, Misiones y Objetos.
  - Sección visual reservada para vinculaciones en futuras fases.

- **Persistencia y Respaldo**:
  - Persistencia automática en `localStorage` (`bitacora_campanas` y `bitacora_sesiones`).
  - **Exportar datos**: Descarga un archivo JSON estructurado con todas las campañas y sesiones.
  - **Importar datos**: Carga y valida archivos JSON de respaldo mediante explorador o arrastrar y soltar.

## Despliegue en Vercel

1. Sube este repositorio a tu cuenta de GitHub (o importa el archivo ZIP).
2. Conecta el repositorio en [Vercel](https://vercel.com).
3. Vercel detectará la configuración automáticamente (Vite, `npm run build`, carpeta `dist/`).
4. ¡Listo para usar en mesa de juego o en el móvil!
