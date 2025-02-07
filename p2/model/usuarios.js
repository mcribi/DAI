// ./model/usuarios.js
import mongoose from 'mongoose';

const UsuariosSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, //Obligatorio
    unique: true, //Unico en la coleccion
  },
  password: {
    type: String,
    required: true, //Obligatorio
  },
  admin: {
    type: Boolean,
    default: false, // Por defecto, los usuarios no son admins
  },
});



const Usuarios = mongoose.model("Usuarios", UsuariosSchema); //creamos un modelo basado en el esquema anterior
export default Usuarios; // Se exporta para que lo podamos utilizar en otras partes 

// Función para hacer a "johnd" un admin (quiero poner a uno de admin para probar que se pueden actualizar los productos siendo admin)
async function hacerAdmin() {
  try {
    const usuario = await Usuarios.findOneAndUpdate(
      { username: 'johnd', password: 'm38rmF$' }, // Busca por username y contraseña
      { admin: true },                                  // Establece el campo admin a true
      { new: true }                                     // Devuelve el documento actualizado
    );

    if (!usuario) {
      console.log('Usuario no encontrado o la contraseña es incorrecta');
    } else {
      console.log('Usuario actualizado:', usuario);
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
  }
}

hacerAdmin(); // Hace admin a johnd
