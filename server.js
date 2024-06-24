const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar body-parser para manejar datos codificados en URL
app.use(bodyParser.urlencoded({ extended: true }));
// Ruta GET para servir el formulario de registro (Registrousu.html)
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Registrousu.html'));
});


// Configurar el directorio de archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB usando Mongoose
mongoose.connect('mongodb://localhost:27017/registroCuenta', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a la base de datos MongoDB'))
.catch(err => console.error('Error conectando a MongoDB', err));

// Definir el esquema de usuario
const Schema = mongoose.Schema;
const usuarioSchema = new Schema({
  nombre: String,
  apellidoPaterno: String,
  apellidoMaterno: String,
  fechaNacimiento: Date,
  direccion: String,
  dni: String,
  email: String,
  contrasena: String,
});

// Crear el modelo Usuario basado en el esquema
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Ruta GET para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta GET para servir el formulario de registro (Registrousu.html)
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Registrousu.html'));
});

// Ruta POST para manejar el registro de usuarios desde Registrousu.html
app.post('/registroUsuario', (req, res) => {
  const nuevoUsuario = new Usuario({
    nombre: req.body.nombre,
    apellidoPaterno: req.body.apellidoPaterno,
    apellidoMaterno: req.body.apellidoMaterno,
    fechaNacimiento: new Date(req.body.fechaNacimiento), // Convertir a objeto de fecha
    direccion: req.body.direccion,
    dni: req.body.dni,
    email: req.body.email,
    contrasena: req.body.contrasena,
  });

  nuevoUsuario.save()
    .then(() => {
      res.send('Usuario registrado correctamente');
    })
    .catch(err => {
      res.status(400).send('Error al registrar usuario: ' + err.message);
    });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
