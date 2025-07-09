import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

/**
 * Obtiene una tarea de Firestore por su ID.
 * @param {string} id - ID del documento en la colección "tareas".
 * @returns {Promise<Object|null>} - Retorna la tarea si existe, o null si no.
 */
export async function getTareaById(id) {
  try {
    const docRef = doc(db, "tareas", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`No se encontró la tarea con id: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener la tarea:", error);
    throw error;
  }
}
