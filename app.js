import {
    collection, addDoc, doc, onSnapshot, query, where,
    updateDoc, deleteDoc, getDocs, Timestamp
  } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
  
  import { db } from "./firebase-config.js";
  
  const filtroEstado = document.getElementById("filterEstado");
  const filtroPrioridad = document.getElementById("filterPrioridad");
  const kanban = document.getElementById("kanban");
  const btnAdd = document.getElementById("btnAdd");
  const inputTitulo = document.getElementById("titulo");
  const inputFecha = document.getElementById("vencimiento");
  const selectPrioridad = document.getElementById("prioridad");
  
  // Solo si todos los elementos están presentes
  if (btnAdd && inputTitulo && inputFecha && selectPrioridad) {
    // Función para agregar tarea
    btnAdd.addEventListener("click", async () => {
      const titulo = inputTitulo.value.trim();
      const fecha = inputFecha.value;
      const prioridad = selectPrioridad.value;
  
      if (!titulo || !fecha) {
        alert("Completa título y fecha.");
        return;
      }
  
      try {
        await addDoc(collection(db, "tareas"), {
          usuario_id: "usuario_demo",
          titulo,
          estado: "pendiente",
          prioridad,
          fecha_vencimiento: Timestamp.fromDate(new Date(fecha))
        });
  
        inputTitulo.value = "";
        inputFecha.value = "";
        selectPrioridad.value = "media";
      } catch (error) {
        console.error("Error agregando tarea:", error);
        alert("Error agregando tarea. Mira la consola.");
      }
    });
  }
  
  // Función para cargar tareas con filtros
  function cargarTareas() {
    let q = collection(db, "tareas");
    const estadoFiltro = filtroEstado.value;
    const prioridadFiltro = filtroPrioridad.value;
  
    const condiciones = [];
    if (estadoFiltro) condiciones.push(where("estado", "==", estadoFiltro));
    if (prioridadFiltro) condiciones.push(where("prioridad", "==", prioridadFiltro));
  
    if (condiciones.length > 0) {
      q = query(q, ...condiciones);
    }
  
    onSnapshot(q, (snapshot) => {
      // Limpiar columnas
      document.querySelectorAll(".tarealist").forEach(col => col.innerHTML = "");
      snapshot.forEach(docTarea => pintarTarea(docTarea));
    });
  }
  
  // Función para pintar tarea y gestionar subtareas
  async function pintarTarea(docTarea) {
    const tarea = { id: docTarea.id, ...docTarea.data() };
    const columna = kanban.querySelector(`[data-estado="${tarea.estado}"] .tarealist`);
    if (!columna) return;
  
    // Asegurar que fecha_vencimiento exista y se convierta bien
    const fechaVence = tarea.fecha_vencimiento && tarea.fecha_vencimiento.toDate
      ? tarea.fecha_vencimiento.toDate().toLocaleDateString()
      : "Sin fecha";
  
    const card = document.createElement("div");
    card.classList.add("tarjeta");
    card.dataset.id = tarea.id;
  
    card.innerHTML = `
      <strong>${tarea.titulo}</strong>
      <p>Prioridad: ${tarea.prioridad}</p>
      <p>Fecha de entrega: ${fechaVence}</p>
      <button class="btnEliminar">Eliminar</button>
      <div class="subtareacont"></div>
      <input class="newSub" placeholder="Nueva subtarea" />
    `;
  
    // Eliminar tarea y subtareas
    card.querySelector(".btnEliminar").addEventListener("click", async () => {
      if (confirm("¿Eliminar esta tarea y sus subtareas?")) {
        await eliminarSubtareasDeTarea(tarea.id);
        await deleteDoc(doc(db, "tareas", tarea.id));
      }
    });
  
    // Agregar nueva subtarea
    const inputSub = card.querySelector(".newSub");
    inputSub.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const desc = e.target.value.trim();
        if (!desc) return;
        await addDoc(collection(db, "subtareas"), {
          tarea_id: tarea.id,
          descripcion: desc,
          estado: "pendiente"
        });
        e.target.value = "";
      }
    });
  
    const contSubtareas = card.querySelector(".subtareacont");
  
    // Escuchar subtareas en tiempo real
    const qSubtareas = query(collection(db, "subtareas"), where("tarea_id", "==", tarea.id));
    onSnapshot(qSubtareas, async (snapshotSub) => {
      contSubtareas.innerHTML = "";
      let todasCompletas = true;
  
      snapshotSub.forEach(docSub => {
        const sub = { id: docSub.id, ...docSub.data() };
        const divSub = document.createElement("div");
        divSub.classList.add("subtarea");
        divSub.innerHTML = `
          <input type="checkbox" ${sub.estado === "completada" ? "checked" : ""} />
          <span>${sub.descripcion}</span>
          <button class="btnDelSub">X</button>
        `;
  
        // Cambiar estado subtarea
        divSub.querySelector("input").addEventListener("change", async (ev) => {
          const nuevoEstado = ev.target.checked ? "completada" : "pendiente";
          await updateDoc(doc(db, "subtareas", sub.id), { estado: nuevoEstado });
        });
  
        // Eliminar subtarea
        divSub.querySelector(".btnDelSub").addEventListener("click", async () => {
          await deleteDoc(doc(db, "subtareas", sub.id));
        });
  
        contSubtareas.appendChild(divSub);
  
        if (sub.estado !== "completada") todasCompletas = false;
      });
  
      // Actualizar estado tarea automáticamente
      const tareaRef = doc(db, "tareas", tarea.id);
      let nuevoEstado = "en_progreso";
  
      if (todasCompletas && snapshotSub.size > 0) {
        nuevoEstado = "completada";
      } else if (snapshotSub.size === 0) {
        nuevoEstado = tarea.estado; // No cambiar si no hay subtareas
      }
  
      if (nuevoEstado !== tarea.estado) {
        await updateDoc(tareaRef, { estado: nuevoEstado });
      }
    });
  
    columna.appendChild(card);
  }
  
  // Función para eliminar todas subtareas de una tarea
  async function eliminarSubtareasDeTarea(tareaId) {
    const qSub = query(collection(db, "subtareas"), where("tarea_id", "==", tareaId));
    const snapshotSub = await getDocs(qSub);
    const promesas = [];
    snapshotSub.forEach(docSub => {
      promesas.push(deleteDoc(doc(db, "subtareas", docSub.id)));
    });
    await Promise.all(promesas);
  }
  
  // Listeners para filtros
  filtroEstado.addEventListener("change", cargarTareas);
  filtroPrioridad.addEventListener("change", cargarTareas);
  
  // Cargar tareas al inicio
  cargarTareas();
  