// Genera las opciones de hora cada 30 minutos entre hora de inicio y fin
function poblarHoras(inicio = "09:00", fin = "18:00", intervaloMin = 30) {
  const selectHora = document.getElementById("hora");
  selectHora.innerHTML = ""; // limpia opciones previas

  // Convierte "HH:MM" a minutos totales
  const toMinutos = str => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };

  const inicioMin = toMinutos(inicio);
  const finMin    = toMinutos(fin);

  for (let t = inicioMin; t < finMin; t += intervaloMin) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    const val = `${h}:${m}`;
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    selectHora.appendChild(opt);
  }
}

// Inicializa el calendario con citas del backend
async function defineCalendar() {
  const calendarEl = document.getElementById('calendar');
  const res = await fetch("/api/citas");
  const citas = await res.json();
  const eventos = citas.map(cita => ({
    title: "Ocupado",
    start: cita.fecha,
    allDay: false
  }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    locale: 'es',
    events: eventos,
    dateClick(info) {
      document.getElementById('fecha').value = info.dateStr;
    }
  });
  calendar.render();
}

// Manejador de envío de formulario
async function handleSubmit(e) {
  e.preventDefault();

  const nombre   = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const servicio = document.getElementById("servicio").value.trim();
  const fecha    = document.getElementById("fecha").value; // YYYY-MM-DD
  const hora     = document.getElementById("hora").value;    // HH:MM

  if (!fecha || !hora) {
    alert('Por favor selecciona fecha y hora.');
    return;
  }

  // Combina fecha y hora en ISO compatible con Firebase
  const fechaHoraISO = new Date(`${fecha}T${hora}:00`).toISOString();

  try {
    const res = await fetch("/api/cita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, servicio, fecha: fechaHoraISO }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar cita');

    // Refrescar calendario con nueva cita
    await defineCalendar();

    alert('✅ ' + data.message);
    document.getElementById('formulario').reset();
  } catch (err) {
    alert('⚠️ ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Verificar que FullCalendar esté cargado
  if (typeof FullCalendar === 'undefined') {
    console.error('FullCalendar no está definido. Asegúrate de importar fullcalendar/main.min.js antes de este script.');
    return;
  }

  poblarHoras();
  defineCalendar();
  document.getElementById("formulario").addEventListener("submit", handleSubmit);
});
