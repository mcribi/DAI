// ./router/usuarios.js
import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch"; // Para realizar peticiones HTTP
import bcrypt from "bcrypt"; // Importa bcrypt para usar contraseñas cifradas 
import Usuarios from '../model/usuarios.js';
import mongoose from 'mongoose';

const router = express.Router();


// Para mostrar formulario de login (renderiza login.html para que los usuarios pongan su nombre de usuario y contraseña)
router.get('/login', (req, res) => {
  res.render("login.html");
});

// Para recoger datos del formulario de login 
router.post('/login', async (req, res) => {
  const { username, password } = req.body;  // REcoge el nombre de usuario y contraseña del cuerpo de la solicitud

  try {
    // Obtenemos los usuarios buscando el usuario que se ha ingresado
    const user_db = await Usuarios.findOne({ username: username }); 

    if (!user_db || user_db.password !== password) { // Comprueba que el usuario exista y sea la contraseña adeacuada
      return res.status(401).send("Usuario o contraseña incorrectos");
    }

    // Comparamos la contraseña ingresada con el hash almacenado
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(401).send("Usuario o contraseña incorrectos");
    // }

    // Genera un token JWT con usuario, si es admin o no y clave secreta
    const token = jwt.sign(
      { usuario: user_db.username, admin: user_db.admin },
      process.env.SECRET_KEY
    );
    
    // Guarda al usuario en la sesión
    req.session.usuario = { username: user_db.username };
    
    // Envía el token como cookie al cliente
    res
      .cookie("access_token", token, { // cookie en el response
        httpOnly: true, // Evita que la cookie sea accesible desde JavaScript en el navegador
        secure: process.env.IN === 'production', // en producción, solo con https
      })
      .render("bienvenida.html", { usuario: user_db.username }); // Renderiza la página de bienvenida
  } catch (error) {
    console.error("Error al autenticar usuario:", error);
    return res.status(500).send("Error interno del servidor");
  }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  const usuario = req.username; //Recupera el usuario
  res.clearCookie('access_token').render("despedida.html", { usuario }); //borra la cookie para invalidar la sesion y renderiza la pagina de despedida
});


export default router;


