// seed.js
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch'; //para hacer solicitudes HTTP
import fs from 'fs'; //para escribir archivos en el sistema
import path from 'path'; //para manejar las rutas de los archivos
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

console.log('🏁 seed.js ----------------->');

// del archivo .env, se accede de forma segura porque no se escribe directamente en el código
const USER_DB = process.env.USER_DB;  //usuario
const PASS = process.env.PASS;  //contraseña

//crea una cadena para conectarse a la base de datos donde están incluidos el usuario y contraseña
const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// Carpeta para guardar las imágenes
const carpetaImagenes = './imagenes_productos'; 


// función asíncrona para insertar datos en una colección
async function insertaDatosEnColeccion (coleccion, apiUrl) {
  try {

    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const collection = db.collection(coleccion);

    //limpiamos la colección antes de insertar los nuevos datos 
    await collection.deleteMany({});  // Borra todos los documentos en la colección (cuando hacemos la consulta de la suma, por ejemplo, si no daría incorrecto porque cada vez que se ejecuta se van duplicando)

    //se hace solicitud HTTP a la url dada por parámetro y convierte la respuesta en un JSON
    const datos = await fetch(apiUrl).then((res) => res.json());


    //insertar los datos en la colección
    const insertResult = await collection.insertMany(datos);
    console.log(`Se han insertado ${insertResult.insertedCount} documentos en la colección ${coleccion}`);

    return `${datos.length} datos traidos para ${coleccion}`;
    
  } catch (err) { //si ocurre algún error en el try se pasa a aquí
    console.error(`Error en fetch para la colección ${coleccion}:`, err);
    throw err;
  }
}

//función asíncrona para consultar productos de más de 100 $
async function consultaProductosMasCien() {
  try {
    
    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const productos = db.collection('productos');

    //consulta productos mas de 100 $
    const productosCaros = await productos.find({ price: { $gt: 100 } }).toArray();
    
    //muestra dichos productos 
    console.log('Productos con precio mayor a 100 $:', productosCaros);
    return productosCaros;
    
  } catch (err) { //si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de productos de más de 100 $:', err);
    throw err;
  }
}

//función asíncrona para consultar productos con "winter" en la descripción, ordenados por precio (asumo que es precio ascendente)
async function consultaProductosWinter() {
  try {

    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const productos = db.collection('productos');

    //consulta productos de invierno
    const productosWinter = await productos
      .find({ description: { $regex: 'winter', $options: 'i' } }) //regex busca patrones de cadenas de texto y además, pongo la opcion i para que no distinga entre mayúsculas y minúsculas, es decir "Winter"=="WINTER"=="winter"
      .sort({ price: 1 }) //ordeno por precio ascendente, como no se dice nada al respecto sobre el orden, si fuese descendiente solo habría que cambiar el 1 por -1
      .toArray();

    //muestra dichos productos
    console.log('Productos que contienen "winter" en la descripción, ordenados por precio (ascendente):', productosWinter);
    return productosWinter;
    
  } catch (err) { //si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de productos con "winter":', err);
    throw err;
  }
}

//función asíncrona para consultar productos de joyería ordenados por rating (asumo descendente)
async function consultaProductosJoyería() {
  try {
    
    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const productos = db.collection('productos');

    //consulta productos joyería por rating descendente (arriba los mejor valorados)
    const productosJoyería = await productos
      .find({ category: "jewelery" })
      .sort({ 'rating.rate': -1 }) //ordeno por rating descendente
      .toArray();

    //muestra dichos productos
    console.log('Productos de joyería ordenados por rating (decendente):', productosJoyería);
    return productosJoyería;
    
  } catch (err) {//si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de productos de joyería:', err);
    throw err;
  }
}

//Función asíncrona para obtener la cantidad total de reseñas (count en rating)
async function consultaTotalReseñas() { 
  try {
    
    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const productos = db.collection('productos');

    //consulta reseñas totales (count en rating)
    const totalReseñas = await productos.aggregate([
      {
        $group: {
          _id: null,  //cogemos todos los productos, sin agrupar por ningun campo, de ahí el null
          totalReseñas: { $sum: "$rating.count" } //sumo las reseñas
        }
      }
    ]).toArray();

    //muestra dichos productos si hay alguno para mostrar, sino devuleve 0
    const total = totalReseñas.length > 0 ? totalReseñas[0].totalReseñas : 0;   
    console.log('Total de reseñas:', total);
    return total;
    
  } catch (err) {//si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de reseñas:', err);
    throw err;
  }
}

//Función asíncrona para consultar la puntuación media por categoría de producto
async function consultaPuntuacionMedia() { 
  try {
    
    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const productos = db.collection('productos');

    //consulta puntuacion media por categoria
    const puntuacionMedia = await productos.aggregate([
      {
        $group: {
          _id: "$category", //agrupa por la categoría de producto
          puntuacionMedia: { $avg: "$rating.rate" } //calcula el average (media) de rating
        }
      }
    ]).toArray();

    //muestra el resultado de la consulta
    console.log('Puntuación media por categoría:', puntuacionMedia);
    return puntuacionMedia;
    
  } catch (err) {//si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de la puntuación media:', err);
    throw err;
  }
}


//función asíncrona para consultar los usuarios sin digitos en el password
async function consultaPasswordSinDigitos() { 
  try {
    
    //conecta al cliente y selecciona la base de datos
    const db = client.db(dbName);
    const usuarios = db.collection('usuarios');

    //consulta usuarios sin digitos en la contraseña
    const usuariosSinDig = await usuarios
      .find({ password: { $regex: '^[^0-9]*$' } })  //expresion regular 
      .toArray();

    //muestra el resultado de la consulta
    console.log('Usuarios sin digitos en el password:', usuariosSinDig);
    return usuariosSinDig;
    
  } catch (err) {//si ocurre algún error en el try se pasa a aquí
    console.error('Error en la consulta de usuarios sin digitos en el password:', err);
    throw err;
  }
}


//función asíncrona para descargar una imagen desde una URL
async function descargarImagen(urlImagen, nombreArchivo) {  //se le da tanto la url de la imagen a descargar como el nombre con el que se guardará
  try {

    //solicita la imagen desde la url
    const respuesta = await fetch(urlImagen);
    if (!respuesta.ok) throw new Error(`Error al descargar la imagen: ${respuesta.statusText}`);

    //se construye la ruta donde se guardará la imagen
    const rutaImagen = path.join(carpetaImagenes, nombreArchivo);

    //streamPipeline es una funcion para manejar flujos de datos (streams) de manera eficiente
    //toma los datos de la imagen descargada y los gaurda en el ordenador
    await streamPipeline(respuesta.body, fs.createWriteStream(rutaImagen));

    //muestra ruta donde ha guardado la imagen
    console.log(`Imagen guardada: ${rutaImagen}`);

  } catch (error) {//si ocurre algún error en el try se pasa a aquí
    console.error(`Error al descargar o guardar la imagen ${nombreArchivo}:`, error);
  }
}


//función asíncrona para obtener los productos y descargar sus imágenes
async function descargarImagenesProductos() {
  try {

    //Se crea la carpeta si no existe ya
    if (!fs.existsSync(carpetaImagenes)) {
      fs.mkdirSync(carpetaImagenes);
    }

    //conecta al cliente, selecciona la base de datos y obtiene los productos de la coleccion convirtiendolos en array
    await client.connect();
    const db = client.db(dbName);
    const productos = await db.collection('productos').find().toArray();

    //Descarga de las imágenes de cada producto
    for (const producto of productos) { //iteramos sobre cada producto
      const urlImagen = producto.image; //obtenemos el url de la imagen
      const nombreArchivo = `${normalizarNombreArchivo(producto.title)}.jpg`; //se genera un titulo normalizado como nombre de archivo
      await descargarImagen(urlImagen, nombreArchivo);//se descarga la imagen con la funcion anterior
    }

  } catch (error) {//si ocurre algún error en el try se pasa a aquí
    console.error('Error en la descarga de imágenes:', error);

  } finally { //aseguramos cierre de la conexion con la bd
    await client.close();
    console.log('Conexión a MongoDB cerrada.');
  }
}

//función para normalizar el nombre del archivo (hay una imagen que sino da error)
function normalizarNombreArchivo(titulo) {
  return titulo
    .replace(/[^a-zA-Z0-9-_ ]/g, '') //elimina caracteres no permitidos, solo dejamos: letras, numeros, guiones o espacios
    .replace(/\s+/g, '_') //reemplaza espacios por guiones bajos
    .toLowerCase(); //paso a minúsculas
}


// Función principal
async function run() {
  try {
    await client.connect();
    
    // Inserción consecutiva
    await insertaDatosEnColeccion('productos', 'https://fakestoreapi.com/products') //productos
      .then((r) => console.log(`Todo bien: ${r}`))
      .then(() => insertaDatosEnColeccion('usuarios', 'https://fakestoreapi.com/users'))  //usuarios
      .then((r) => console.log(`Todo bien: ${r}`))
      .catch((err) => console.error('Algo mal:', err));

    //Consultas (ir descomentando la consulta que se quiera realizar, si no se van a mezclar los resultados)
    await consultaProductosMasCien();
    //await consultaProductosWinter();
    //await consultaProductosJoyería();
    //await consultaTotalReseñas();
    //await consultaPuntuacionMedia();
    //await consultaPasswordSinDigitos();

    //Copia de seguridad de la BD con mongodump
    //Primero me he descargado mongodump y después EN LA TERMINAL se ejecuta la siguiente línea:
    //mongodump --uri="mongodb://root:example@localhost:27017/myProject" --out  ~/Escritorio/5DGIIM/DAI/practicas --authenticationDatabase=admin

    //Restaurar copia de seguridad de la carpeta donde hemos guardado la copia de seguridad (EJECUTAR EN LA TERMINAL, NO AQUÍ)
    //mongorestore --uri="mongodb://root:example@localhost:27017/myProject_backup" ~/Escritorio/5DGIIM/DAI/practicas/myProject --authenticationDatabase=admin
    
    //Bajarse los archivos de imagen de los productos, y guardarlos en una carpeta
    //await descargarImagenesProductos();

  } finally {
    await client.close(); // Cerrar la conexión al cliente
  }
}
run().catch(console.dir);
console.log('Lo primero que pasa');

