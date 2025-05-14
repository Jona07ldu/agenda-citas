const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Firebase
const serviceAccount = require("./firebase-config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Obtener todas las citas (para el calendario)
app.get("/api/citas", async (req, res) => {
  const snapshot = await db.collection("citas").get();
  const citas = snapshot.docs.map(doc => doc.data());
  res.json(citas);
});

// Agendar cita
app.post("/api/cita", async (req, res) => {
  const { nombre, telefono, fecha } = req.body;

  // Validar si ya hay cita ese día y hora
  const snapshot = await db.collection("citas")
    .where("fecha", "==", fecha)
    .get();

  if (!snapshot.empty) {
    return res.status(400).json({ error: "Ya hay una cita agendada en esa fecha y hora." });
  }

  await db.collection("citas").add({ nombre, telefono, fecha });
  res.status(200).json({ message: "Cita guardada" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
