import { TareaRepository, SubtareaRepository } from "./repository.js";

export const TareaService = {
  async agregarTarea({ titulo, fecha_vencimiento, prioridad }) {
    const tarea = {
      usuario_id: "usuario_demo",
      titulo,
      estado: "pendiente",
      prioridad,
      fecha_vencimiento
    };
    return await TareaRepository.add(tarea);
  },

  async eliminarTareaConSubtareas(tareaId) {
    await SubtareaRepository.deleteAllByTareaId(tareaId);
    return await TareaRepository.delete(tareaId);
  },

  actualizarEstadoSiTodasCompletas(tareaId, snapshotSub, tareaActual) {
    let todasCompletas = true;
    snapshotSub.forEach(docSub => {
      if (docSub.data().estado !== "completada") todasCompletas = false;
    });

    let nuevoEstado = "en_progreso";
    if (todasCompletas && snapshotSub.size > 0) nuevoEstado = "completada";
    else if (snapshotSub.size === 0) nuevoEstado = tareaActual.estado;

    if (nuevoEstado !== tareaActual.estado) {
      return TareaRepository.update(tareaId, { estado: nuevoEstado });
    }
  },

  escucharTareas(condiciones = [], callback) {
    return TareaRepository.listenAll(condiciones, callback);
  },

  agregarSubtarea(subtarea) {
    return SubtareaRepository.add(subtarea);
  },

  escucharSubtareasPorTarea(tareaId, callback) {
    return SubtareaRepository.getByTareaId(tareaId, callback);
  },

  actualizarSubtarea(id, data) {
    return SubtareaRepository.update(id, data);
  },

  eliminarSubtarea(id) {
    return SubtareaRepository.delete(id);
  }
};

