// .model/db.js
import mongoose from "mongoose";

//credenciales para entrar a la base de datos
const DB_HOST = process.env.DB_HOST;
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
//const url = `mongodb://${USER_DB}:${PASS}@localhost:27017/myProject?authSource=admin`
const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/myProject?authSource=admin`


//funcion para manejar la conexion a la BD 
export default function connectDB() {     
  try {
    mongoose.connect(url);  //inicia la conexion
  } catch (err) {   //por si ocurre un error
    console.error(err.message);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {    
    console.log(`Database connected: ${url}`);  //muestra un mensaje a consola confirmando la conexion
  });
     
  dbConnection.on("error", (err) => {   //escucha eventos de error en la conexion
    console.error(`connection error: ${err}`);
  });
  return;
}
