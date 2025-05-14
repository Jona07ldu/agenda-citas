const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("firebase-admin");

// Cargar las credenciales de Firebase desde el archivo JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);  // <-- Aquí

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Obtener citas
app.get("/api/citas", async (req, res) => {
  const snapshot = await db.collection("citas").get();
  const citas = snapshot.docs.map(doc => doc.data());
  res.json(citas);
});

// Agendar cita
app.post("/api/cita", async (req, res) => {
  const { nombre, telefono, fecha } = req.body;

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
