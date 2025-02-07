// ./model/productos.js
import mongoose from "mongoose";

//define la estructura y reglas para la coleccion productos
const ProductosSchema = new mongoose.Schema({  
  "id": {
    "type": "Number",
    "unique": true,   // Evita duplicados (identifica de manera unica)
    "required": [true, "El ID del producto es obligatorio"]  // Obligatorio para crear el documento
  },
  "title": {
    "type": "String",
    "required": true,   // Necesario para que cada producto tenga un título
    "validate": {
      validator: function (value) {
        return /^[A-Z]/.test(value); // La primera letra debe ser mayúscula
      },
      message: "El título debe comenzar con una letra mayúscula",
    }
  },
  "price": {
    "type": "Number",
    "required": true,   // Necesario para indicar el precio del producto
    min: [0, "El precio debe ser mayor o igual a 0"], //Comprueba que no se pueda poner un numero negativo como precio
    
  },
  "description": {
    "type": "String",      // Opcional, puede estar vacío
    maxlength: [500, "La descripción no puede exceder los 500 caracteres"] // Limitar la longitud de la descripción
  },
  "category": {
    "type": "String",
    "required": [true, "La categoría del producto es obligatoria"],
    enum: {
      values: ["electronics", "jewelery", "men's clothing", "women's clothing"], // Categorias que solo se venden en la tienda
      message: "La categoría no es válida"
    }
  },
  "image": {
    "type": "String"      // Ruta o URL de la imagen, opcional si no todas tienen imagen
  },
  "rating": {
    "rate": {
      "type": "Number",    // Calificación del producto, opcional
      min: [0, "La calificación no puede ser menor que 0"], //Comprueba que no se pueda poner un numero negativo 
    },
    "count": {
      "type": "Number",    // Número de votos para el rating, opcional
      min: [0, "El número no puede ser menor que 0"] //Comprueba que no se pueda poner un numero negativo 
    }
  },
  "destacado": {
    "type": "Boolean",
    "default": false    // Por defecto no destacado, opcional
  }
});

//definicion y exportacion del modelo Productos
const Productos = mongoose.model("productos", ProductosSchema);
export default Productos;

