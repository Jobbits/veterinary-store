const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar body-parser para manejar datos codificados en URL
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar el directorio de archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar sesión de Express
app.use(session({
  secret: 'secreto-para-sesion',
  resave: false,
  saveUninitialized: false
}));

// Función para conectar a la base de datos MongoDB
async function conectarBD() {
  try {
    await mongoose.connect('mongodb://localhost:27017/PetShop', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a la base de datos MongoDB');

    // Crear usuario administrativo si no existe
    await crearUsuarioAdministrativo();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
  }
}

// Definir esquemas y modelos
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

const adminSchema = new Schema({
  username: String,
  password: String,
  role: { type: String, default: 'admin' }
});

// Encriptar la contraseña antes de guardar el administrador
adminSchema.pre('save', async function(next) {
  const admin = this;
  if (!admin.isModified('password')) return next();

  try {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    admin.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Función para autenticar al administrador
async function autenticarAdmin(username, password) {
  const admin = await Admin.findOne({ username: username });
  if (!admin) {
    throw new Error('Nombre de usuario incorrecto');
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Contraseña incorrecta');
  }
  return admin;
}

// Función para crear usuario administrativo si no existe
async function crearUsuarioAdministrativo() {
  try {
    const existente = await Admin.findOne({ username: 'admin' });
    if (!existente) {
      const nuevoAdmin = new Admin({
        username: 'admin',
        password: 'admin123',  // Aquí deberías usar una contraseña segura y encriptada
      });
      await nuevoAdmin.save();
      console.log('Usuario administrativo creado exitosamente');
    } else {
      console.log('El usuario administrativo ya existe');
    }
  } catch (error) {
    console.error('Error creando usuario administrativo:', error.message);
  }
}

// Middleware para verificar la sesión del administrador
function verificarSesion(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Rutas

// Página de inicio (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Formulario de registro de usuario
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Registrousu.html'));
});
// Procesar registro de usuario (ruta POST)
app.post('/registroUsuario', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      apellidoPaterno: req.body.apellidoPaterno,
      apellidoMaterno: req.body.apellidoMaterno,
      fechaNacimiento: new Date(req.body.fechaNacimiento),
      direccion: req.body.direccion,
      dni: req.body.dni,
      email: req.body.email,
      contrasena: req.body.contrasena,
    });

    await nuevoUsuario.save();
    res.send('Usuario registrado correctamente');
  } catch (error) {
    res.status(400).send('Error al registrar usuario: ' + error.message);
  }
});
// Página de inicio de sesión para administradores
app.get('/login', (req, res) => {
  res.render('login');
});

// Procesar inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await autenticarAdmin(username, password);
    req.session.admin = admin; // Almacenar el administrador en la sesión
    res.redirect('/admin');
  } catch (error) {
    res.status(401).send(error.message);
  }
});

// Panel de administración (requiere autenticación)
app.get('/admin', verificarSesion, async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('admin-panel', { usuarios: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Crear nuevo usuario desde el panel de administración
app.post('/admin/crear-usuario', verificarSesion, async (req, res) => {
  try {
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      apellidoPaterno: req.body.apellidoPaterno,
      apellidoMaterno: req.body.apellidoMaterno,
      fechaNacimiento: new Date(req.body.fechaNacimiento),
      direccion: req.body.direccion,
      dni: req.body.dni,
      email: req.body.email,
      contrasena: req.body.contrasena,
    });

    await nuevoUsuario.save();
    res.redirect('/admin');
  } catch (error) {
    res.status(400).send('Error al crear usuario: ' + error.message);
  }
});

// Eliminar usuario desde el panel de administración
app.post('/admin/eliminar-usuario/:id', verificarSesion, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    res.status(400).send('Error al eliminar usuario: ' + error.message);
  }
});

// Editar usuario desde el panel de administración (mostrar formulario)
app.get('/admin/editar-usuario/:id', verificarSesion, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    res.render('editar-usuario', { usuario: usuario });
  } catch (error) {
    res.status(400).send('Error al cargar usuario para editar: ' + error.message);
  }
});

// Procesar edición de usuario desde el panel de administración
app.post('/admin/editar-usuario/:id', verificarSesion, async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, {
      nombre: req.body.nombre,
      apellidoPaterno: req.body.apellidoPaterno,
      apellidoMaterno: req.body.apellidoMaterno,
      fechaNacimiento: new Date(req.body.fechaNacimiento),
      direccion: req.body.direccion,
      dni: req.body.dni,
      email: req.body.email,
      contrasena: req.body.contrasena,
    });
    res.redirect('/admin');
  } catch (error) {
    res.status(400).send('Error al editar usuario: ' + error.message);
  }
});

// Cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Iniciar el servidor
async function iniciarServidor() {
  await conectarBD();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Iniciar el servidor
iniciarServidor();
