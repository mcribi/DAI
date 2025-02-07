//tienda.js
import express from "express";  //framework para crear el servidor web
import nunjucks from "nunjucks";    //ayuda a renderizar html dinamico
import connectDB from "./model/db.js";  //conecta a la base de datos
import TiendaRouter from "./routes/router_tienda.js";   // Las demas rutas especificas con código en el directorio routes
import session from 'express-session';  //permite manejar sesiones de usuario en el servidor
import cookieParser from "cookie-parser"; //para generar y enviar el token
import jwt from "jsonwebtoken";
import usuariosRouter from './routes/usuarios.js';
import ApiRatingsRouter from './routes/api_ratings.js';
import logger from './logger.js'; // Importar el logger (para nota)



connectDB();

const app = express();  //creamos una instancia de express 
const IN = process.env.IN || 'development';

app.use(cookieParser());
app.use(express.json()); // Permite manejar datos JSON en las solicitudes
app.use(express.urlencoded({ extended: true })); ///incluir la configuración de urlencoded para que Express procese los datos de formulario de búsqueda


app.use(session({
  secret: 'my-secret',      // Usa una cadena secreta para firmar la cookie de ID de sesión
  resave: false,            // No guardar la sesión si no ha sido modificada
  saveUninitialized: false  // No crear sesión hasta que se almacene algo
}));

app.use('/usuarios', usuariosRouter);

// Rutas para la API REST
app.use('/api', ApiRatingsRouter);


// Configuración de Nunjucks
nunjucks.configure('views', {   // directorio 'views' para las plantillas html
  autoescape: true,
  noCache: IN == 'development', // true para desarrollo, sin cache
  watch: IN == 'development',   // reinicio con Ctrl-S
  express: app
});
app.set('view engine', 'html');
app.use('/public', express.static('public'));   // directorio public para archivos

// Middleware de autenticación basado en JWT
const autentificación = (req, res, next) => {
  const token = req.cookies.access_token; // Obtiene el token desde las cookies
  if (token) {
    try {
      // Verifica el token y extrae los datos
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.username = data.usuario; // Asigna el nombre de usuario
      req.admin = data.admin || false; // Asigna privilegios de administrador
    } catch (err) {
      console.error("Error al verificar el token:", err);
      res.clearCookie("access_token"); // Limpia la cookie si el token es inválido
      req.username = null; // Elimina el usuario autenticado
      req.admin = false; // Elimina los privilegios de administrador
    }
  } else {
    // Si no hay token, no hay usuario autenticado
    req.username = null;
    req.admin = false; // Se pone que es admin a false
  }
  next();
};
app.use(autentificación)

app.use("/", TiendaRouter);

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

//Apuntes clase: error 500 es el error del servidos. Instalar Rest Client de VSCode. 





