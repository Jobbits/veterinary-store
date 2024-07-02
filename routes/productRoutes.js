const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
  Producto.find()
    .then(productos => res.json(productos))
    .catch(error => {
      console.error('Error al obtener los productos:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    });
});

module.exports = router;