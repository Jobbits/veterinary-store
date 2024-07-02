const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const session = require('express-session');
const Producto = require('./models/producto');
const Pedido = require('./models/pedido');
const router = express.Router();
const multer = require('multer');
const Counter = require('./models/counter');
const productoRoutes = require('./routes/productRoutes');

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
    initializeCounter();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
  }
}

async function getNextSequence(name) {
  const ret = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
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
  const admin = await Admin.findOne({ username });
  if (!admin) {
    throw new Error('Nombre de usuario incorrecto');
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Contraseña incorrecta');
  }
  return admin;
}

router.get('/api/productos', async (req, res) => {
  try {
      const productosPerros = await Producto.find({ tipo_mascota: 'perro' }).sort({ _id: -1 }).limit(4);
      const productosGatos = await Producto.find({ tipo_mascota: 'gato' }).sort({ _id: -1 }).limit(4);
      res.json({ productosPerros, productosGatos });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

module.exports = router;

// Middleware para verificar la sesión del administrador
function verificarSesion(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/login');
  }
}
// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Renombra el archivo para evitar conflictos
  }
});
const upload = multer({ storage });
// Rutas
app.get('/admin/nuevo-usuario', (req, res) => {
  res.render('admin/nuevo-usuario'); // Renderiza la vista correspondiente
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Registrousu.html'));
});

app.post('/registroUsuario', async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, direccion, dni, email, contrasena } = req.body;
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento || !direccion || !dni || !email || !contrasena) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = new Usuario({
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento: new Date(fechaNacimiento),
      direccion,
      dni,
      email,
      contrasena: hashedPassword,
    });

    await nuevoUsuario.save();
    res.status(201).redirect('/index.html');
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    if (error.code === 11000) {
      res.status(400).send('Error: Email o DNI ya están en uso');
    } else {
      res.status(500).send('Error al registrar usuario');
    }
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await autenticarAdmin(username, password);
    req.session.admin = admin;
    res.redirect('/admin');
  } catch (error) {
    res.status(401).send(error.message);
  }
});

app.get('/admin', verificarSesion, (req, res) => {
  res.render('admin/admin-panel');
});

// Rutas para gestionar usuarios
app.get('/admin/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('admin/usuarios', { usuarios }); // Renderiza la vista con los usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
});

app.get('/admin/editar-usuario/:id', verificarSesion, async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  res.render('admin/editar-usuario', { usuario });
});

app.post('/admin/editar-usuario/:id', verificarSesion, async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, direccion, dni, email, contrasena } = req.body;
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  await Usuario.findByIdAndUpdate(req.params.id, {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento: new Date(fechaNacimiento),
    direccion,
    dni,
    email,
    contrasena: hashedPassword,
  });
  res.redirect('/admin/usuarios');
});
// Ruta para crear un nuevo usuario
app.post('/admin/nuevo-usuario', async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, email, contrasena, direccion, dni } = req.body;

  try {
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear un nuevo usuario con la contraseña hasheada
    const nuevoUsuario = new Usuario({
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      email,
      contrasena: hashedPassword, // Guarda la contraseña hasheada en la base de datos
      direccion,
      dni
    });

    await nuevoUsuario.save();
    console.log('Usuario creado exitosamente');

    // Redireccionar al listado de usuarios después de crear el usuario
    res.redirect('/admin/usuarios'); // Cambia '/admin/usuarios' por tu ruta real
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).send('Error al crear usuario');
  }
});


app.post('/admin/eliminar-usuario/:id', verificarSesion, async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.redirect('/admin/usuarios');
});

// Rutas para gestionar productos
app.get('/admin/nuevo-producto', verificarSesion, (req, res) => {
  res.render('admin/nuevo-producto');
});
app.get('/admin/productos', verificarSesion, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.render('admin/productos', { productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

app.get('/admin/editar-producto/:id', verificarSesion, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    res.render('admin/editar-producto', { producto });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).send('Error al obtener producto');
  }
});

app.post('/admin/editar-producto/:id', verificarSesion, async (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    stock,
    categoria,
    marca,
    ofertasYDescuentos,
    tipoMascota,
    edadMascota,
    tamanoMascota,
    tipoAlimento,
    imagenes
  } = req.body;

  try {
    await Producto.findByIdAndUpdate(req.params.id, {
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      marca,
      ofertasYDescuentos,
      tipoMascota,
      edadMascota,
      tamanoMascota,
      tipoAlimento,
      imagenes // Asegúrate de que esto sea un array de URLs de imágenes
    });
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).send('Error al actualizar producto');
  }
});

app.post('/admin/eliminar-producto/:id', verificarSesion, async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('Error al eliminar producto');
  }
});
// Endpoint para crear un nuevo producto
app.post('/admin/nuevo-producto', upload.single('imagen'), async (req, res) => {
  try {
    const codigo = await getNextSequence('producto_codigo');
    const { nombre, descripcion, precio, stock, categoria, marca, ofertasYDescuentos, tipoMascota, edadMascota, tamanoMascota, tipoAlimento } = req.body;
    const imagen = req.file.path;

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      marca,
      ofertasYDescuentos,
      tipoMascota,
      edadMascota,
      tamanoMascota,
      tipoAlimento,
      imagen,
      codigo // Asigna el código generado
    });

    await nuevoProducto.save();
    res.redirect('/admin/nuevo-producto');
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('Error al crear producto');
  }
});
const initializeCounter = async () => {
  const counter = await Counter.findById('producto_codigo');
  if (!counter) {
    await new Counter({ _id: 'producto_codigo', seq: 0 }).save();
  }
};
// Rutas para gestionar pedidos
app.get('/admin/pedidos', verificarSesion, async (req, res) => {
  const pedidos = await Pedido.find();
  res.render('admin/pedidos', { pedidos });
});

app.get('/admin/editar-pedido/:id', verificarSesion, async (req, res) => {
  const pedido = await Pedido.findById(req.params.id);
  res.render('admin/editar-pedido', { pedido });
});

app.post('/admin/editar-pedido/:id', verificarSesion, async (req, res) => {
  const { estado, fechaEntrega } = req.body;
  await Pedido.findByIdAndUpdate(req.params.id, { estado, fechaEntrega });
  res.redirect('/admin/pedidos');
});

app.post('/admin/eliminar-pedido/:id', verificarSesion, async (req, res) => {
  await Pedido.findByIdAndDelete(req.params.id);
  res.redirect('/admin/pedidos');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

async function iniciarServidor() {
  await conectarBD();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}
app.get('/admin/productos', verificarSesion, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.render('admin/productos', { productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});
app.get('/admin/pedidos', verificarSesion, async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.render('admin/pedidos', { pedidos });
  } catch (error) {
    console.error('Error al buscar pedidos:', error);
    res.status(500).send('Error interno al buscar pedidos');
  }
});

app.use('/api/productos', productoRoutes);
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
iniciarServidor();
