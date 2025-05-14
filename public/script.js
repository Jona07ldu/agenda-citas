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
  
    for (let t = inicioMin; t <= finMin; t += intervaloMin) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      const val = `${h}:${m}`;
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      selectHora.appendChild(opt);
    }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    // 1) Poblar selector de horas
    poblarHoras("09:00", "18:00", 30);
  
    // 2) Inicializar FullCalendar con citas desde el backend
    const calendarEl = document.getElementById('calendar');
    const res = await fetch("/api/citas");
    const citas = await res.json();
    const eventos = citas.map(cita => ({ title: "Ocupado", start: cita.fecha, allDay: false }));
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      selectable: true,
      events: eventos,
      locale: 'es'
    });
  
    calendar.render();
  });
  
  // Manejador de envío de formulario
  document.getElementById("formulario").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    // Leemos valores del formulario
    const nombre   = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const servicio = document.getElementById("servicio").value;
    const fecha    = document.getElementById("fecha").value; // "YYYY-MM-DD"
    const hora     = document.getElementById("hora").value;  // "HH:MM"
  
    // Combina fecha y hora en ISO para backend y calendario
    const fechaHoraISO = new Date(`${fecha}T${hora}`).toISOString();
  
    // Envía al backend
    const res = await fetch("/api/cita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, servicio, fecha: fechaHoraISO }),
    });
  
    if (res.ok) {
      // Formatea para mensaje de WhatsApp
      const fechaFormateada = new Date(fechaHoraISO).toLocaleString("es-EC", {
        dateStyle: "full",
        timeStyle: "short"
      });
  
      const mensaje =
        `Hola, mi nombre es ${nombre} y deseo agendar una cita para el servicio de ${servicio} ` +
        `el día ${fechaFormateada}. Mi número de contacto es ${telefono}.`;
  
      const url = `https://wa.me/593984235123?text=${encodeURIComponent(mensaje)}`; // sustituye tu número
      window.open(url, "_blank");
  
      alert("Cita registrada y enviada por WhatsApp.");
    } else {
      const { error } = await res.json();
      alert(error || "Error al registrar cita.");
    }
  });
  
  
 
  