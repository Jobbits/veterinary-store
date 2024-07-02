const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Pedido = require('../models/pedido');

// Controladores para Usuarios
exports.getUsuarios = async (req, res) => {
  const usuarios = await Usuario.find();
  res.render('admin/usuarios', { usuarios });
};

// ... (más controladores para crear, editar, eliminar usuarios)

// Controladores para Productos
exports.getProductos = async (req, res) => {
  const productos = await Producto.find();
  res.render('admin/productos', { productos });
};
// Mostrar el formulario de edición del producto
exports.getEditarProducto = async (req, res) => {
    const productoId = req.params.id;
    try {
      const producto = await Producto.findById(productoId);
      if (!producto) {
        return res.status(404).send('Producto no encontrado');
      }
      res.render('admin/editar-producto', { producto });
    } catch (error) {
      res.status(500).send('Error al obtener el producto');
    }
  };
  
  // Manejar la actualización del producto
  exports.postEditarProducto = async (req, res) => {
    const productoId = req.params.id;
    const { nombre, descripcion, precio, stock, categoria, marca, ofertasYDescuentos, tipoMascota, edadMascota, tamanoMascota, tipoAlimento, imagen } = req.body;
  
    try {
      const producto = await Producto.findById(productoId);
      if (!producto) {
        return res.status(404).send('Producto no encontrado');
      }
  
      producto.nombre = nombre;
      producto.descripcion = descripcion;
      producto.precio = precio;
      producto.stock = stock;
      producto.categoria = categoria;
      producto.marca = marca;
      producto.ofertasYDescuentos = ofertasYDescuentos;
      producto.tipoMascota = tipoMascota;
      producto.edadMascota = edadMascota;
      producto.tamanoMascota = tamanoMascota;
      producto.tipoAlimento = tipoAlimento;
      producto.imagen = imagen;
  
      await producto.save();
      res.redirect('/admin/productos'); // Redirige a la lista de productos después de la actualización
    } catch (error) {
      res.status(500).send('Error al actualizar el producto');
    }
  };
// ... (más controladores para crear, editar, eliminar productos)
exports.getIndex = async (req, res) => {
    try {
      const productos = await Producto.find();
      res.render('admin/index', { productos });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).send('Error al obtener productos');
    }
  };

// Controladores para Pedidos
exports.getPedidos = async (req, res) => {
  const pedidos = await Pedido.find().populate('usuario');
  res.render('admin/pedidos', { pedidos });
};

// ... (más controladores para ver y eliminar pedidos)
