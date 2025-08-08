import {
  collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot, query, where, Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

// Colecciones
const tareasCol = collection(db, "tareas");
const subtareasCol = collection(db, "subtareas");

export const TareaRepository = {
  async add(tarea) {
    tarea.fecha_vencimiento = Timestamp.fromDate(new Date(tarea.fecha_vencimiento));
    return addDoc(tareasCol, tarea);
  },

  async getById(id) {
    const snap = await getDoc(doc(db, "tareas", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  listenAll(condiciones = [], callback) {
    let q = tareasCol;
    if (condiciones.length) {
      q = query(tareasCol, ...condiciones);
    }
    return onSnapshot(q, callback);
  },

  update(id, data) {
    return updateDoc(doc(db, "tareas", id), data);
  },

  delete(id) {
    return deleteDoc(doc(db, "tareas", id));
  }
};

export const SubtareaRepository = {
  add(subtarea) {
    return addDoc(subtareasCol, subtarea);
  },

  getByTareaId(tareaId, callback) {
    const q = query(subtareasCol, where("tarea_id", "==", tareaId));
    return onSnapshot(q, callback);
  },

  update(id, data) {
    return updateDoc(doc(db, "subtareas", id), data);
  },

  delete(id) {
    return deleteDoc(doc(db, "subtareas", id));
  },

  async deleteAllByTareaId(tareaId) {
    const q = query(subtareasCol, where("tarea_id", "==", tareaId));
    const snap = await getDocs(q);
    const promises = [];
    snap.forEach(docSub => promises.push(deleteDoc(docSub.ref)));
    return Promise.all(promises);
  }
};
