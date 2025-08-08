import { TareaService } from "./service.js";

const filtroEstado = document.getElementById("filterEstado");
const filtroPrioridad = document.getElementById("filterPrioridad");
const kanban = document.getElementById("kanban");
const btnAdd = document.getElementById("btnAdd");
const inputTitulo = document.getElementById("titulo");
const inputFecha = document.getElementById("vencimiento");
const selectPrioridad = document.getElementById("prioridad");

btnAdd.addEventListener("click", async () => {
  const titulo = inputTitulo.value.trim();
  const fecha = inputFecha.value;
  const prioridad = selectPrioridad.value;

  if (!titulo || !fecha) {
    alert("Completa título y fecha.");
    return;
  }

  try {
    await TareaService.agregarTarea({ titulo, fecha_vencimiento: fecha, prioridad });
    inputTitulo.value = "";
    inputFecha.value = "";
    selectPrioridad.value = "media";
  } catch (err) {
    console.error("Error agregando tarea:", err);
  }
});

function cargarTareas() {
  const condiciones = [];
  if (filtroEstado.value) condiciones.push(where("estado", "==", filtroEstado.value));
  if (filtroPrioridad.value) condiciones.push(where("prioridad", "==", filtroPrioridad.value));

  TareaService.escucharTareas(condiciones, (snapshot) => {
    document.querySelectorAll(".tarealist").forEach(col => (col.innerHTML = ""));
    snapshot.forEach(docTarea => pintarTarea({ id: docTarea.id, ...docTarea.data() }));
  });
}

function pintarTarea(tarea) {
  const columna = kanban.querySelector(`[data-estado="${tarea.estado}"] .tarealist`);
  if (!columna) return;

  const fechaVence = tarea.fecha_vencimiento?.toDate?.().toLocaleDateString() || "Sin fecha";
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

  card.querySelector(".btnEliminar").addEventListener("click", async () => {
    if (confirm("¿Eliminar esta tarea y sus subtareas?")) {
      await TareaService.eliminarTareaConSubtareas(tarea.id);
    }
  });

  const inputSub = card.querySelector(".newSub");
  const contSubtareas = card.querySelector(".subtareacont");

  inputSub.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const desc = e.target.value.trim();
      if (!desc) return;
      await TareaService.agregarSubtarea({ tarea_id: tarea.id, descripcion: desc, estado: "pendiente" });
      e.target.value = "";
    }
  });

  TareaService.escucharSubtareasPorTarea(tarea.id, (snapshotSub) => {
    contSubtareas.innerHTML = "";
    snapshotSub.forEach(docSub => {
      const sub = { id: docSub.id, ...docSub.data() };
      const divSub = document.createElement("div");
      divSub.classList.add("subtarea");
      divSub.innerHTML = `
        <input type="checkbox" ${sub.estado === "completada" ? "checked" : ""} />
        <span>${sub.descripcion}</span>
        <button class="btnDelSub">X</button>
      `;

      divSub.querySelector("input").addEventListener("change", (e) => {
        const nuevoEstado = e.target.checked ? "completada" : "pendiente";
        TareaService.actualizarSubtarea(sub.id, { estado: nuevoEstado });
      });

      divSub.querySelector(".btnDelSub").addEventListener("click", () => {
        TareaService.eliminarSubtarea(sub.id);
      });

      contSubtareas.appendChild(divSub);
    });

    TareaService.actualizarEstadoSiTodasCompletas(tarea.id, snapshotSub, tarea);
  });

  columna.appendChild(card);
}

filtroEstado.addEventListener("change", cargarTareas);
filtroPrioridad.addEventListener("change", cargarTareas);

cargarTareas();
