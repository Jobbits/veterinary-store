const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  categoria: {
    type: String,
    enum: ['Alimentos', 'Juguetes', 'Medicamentos', 'Productos de higiene', 'Accesorios'],
    required: true
  },
  marca: {
    type: String,
    enum: ['Premier', "Hill's", 'Whiskas', 'Pedigree', 'Royal Canin'],
    required: true
  },
  ofertasYDescuentos: {
    type: String,
    enum: ['Seco', 'Humedo', 'Natural/Organico', 'Dietietico/Medicinal'],
    required: true
  },
  tipoMascota: {
    type: String,
    enum: ['Perro', 'Gato', 'Aves', 'Pez'],
    required: true
  },
  edadMascota: {
    type: String,
    enum: ['Cachorros', 'Adultos', 'Senior'],
    required: true
  },
  tamanoMascota: {
    type: String,
    enum: ['Pequeno', 'Mediano', 'Grande'],
    required: true
  },
  tipoAlimento: {
    type: String,
    enum: ['Seco', 'Humedo', 'Natural/Organico', 'Dietietico/Medicinal'],
    required: true
  },
  imagen: {
    type: String,
    required: true
  },
  codigo: {
    type: Number,
    unique: true // Asegúrate de que sea único
  },
  fecha_agregado: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
