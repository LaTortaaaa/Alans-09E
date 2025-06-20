5. Gestor de Tareas con Subtareas y Prioridades
Descripción:
Sistema para gestión de tareas jerárquicas con subtareas y prioridades.
Requerimientos funcionales:
CRUD de tareas y subtareas.
Filtros por estado y prioridad.
Tablero Kanban básico (texto o visual).
Base de datos sugerida:
Tareas(id, usuario_id, titulo, estado, prioridad, fecha_vencimiento)
Subtareas(id, tarea_id, descripcion, estado)
Reglas de negocio:
Si todas las subtareas están completas, la tarea se marca como completa automáticamente.
Objetivo técnico:
Evaluar estructuras jerárquicas, automatización lógica y relaciones padre-hijo.