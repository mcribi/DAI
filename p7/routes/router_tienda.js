// ./routes/router_tienda.js
// archivo para definir las rutas mas especificas
import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();


// Ruta para la página principal que redirige a la portada
router.get('/', (req, res) => {
    res.redirect('/portada'); // Redirige a /portada
});

// Ruta para mostrar la portada con productos destacados y todos los productos
router.get('/portada', async (req, res) => {
  try {
    const usuario = req.username || null; // Recupera el usuario autenticado
    
    // Obtener los 5 productos con mayor calificación
    const productosDestacados = await Productos.find()
      .sort({ "rating.rate": -1 })
      .limit(5);

    // Obtener todos los productos
    const productos = await Productos.find(); 

    // Obtener todas las categorías
    const categorias = await Productos.distinct('category');

    //Inicializar el carrito si no existe en la sesión
    if (!req.session.carrito) {
      req.session.carrito = [];
    }
    
    const carrito = req.session.carrito|| [];
    
    // Renderizar la portada con los datos necesarios
    res.render('portada.html', { productos, productosDestacados, categorias, carrito, usuario });
  } catch (err) {
    console.log("Error al renderizar la portada:", err);
    res.status(500).send({ err });
  }
});


// Ruta para manejar las solicitudes de categorías
router.get('/categoria/:categoria', async (req, res) => {
    const { categoria } = req.params; // Obtiene el parámetro de la ruta
    try {
        const productosPorCategoria = await Productos.find({ category: categoria }); // Busca productos en la categoría
        const categorias = await Productos.distinct('category'); // Obtener todas las categorías
        res.render('categoria.html', { productos: productosPorCategoria, categorias }); // Renderiza la vista con los productos
    } catch (err) {
        console.log("Error al manejar las solicitudes de categorias:", err); 
        res.status(500).send({ err });
    }
});

//Ruta para manejar busqueda
router.post('/buscar', async (req, res) => {
    const { searchQuery } = req.body;
    try {
        const productos = await Productos.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } }, // Busca en el título
                { description: { $regex: searchQuery, $options: 'i' } } // Busca en la descripción
            ]
        });
        res.render('buscar.html', { productos });
    } catch (err) {
        console.log("Error al manejar la busqueda:", err);
        res.status(500).send({ err });
    }
});

//Ruta para el carrito
router.get('/carrito', (req, res) => {
    const carrito = req.session.carrito || [];  // Recupera el carrito desde la sesion
    res.render('carrito.html', { carrito });    // Renderiza la pagina de carrito mostrando sus productos
});

// Ruta para ver el detalle de un producto
router.get('/producto/:id', async (req, res) => {
  try {
    const { id } = req.params;  //Recupera el ID
    const producto = await Productos.findById(id); //Busco por el id
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }
    // Recupera el usuario autenticado (puedes adaptarlo según tu lógica de autenticación)
    const usuario = req.username || null;  // Asume que 'req.username' está definido si el usuario está autenticado

    res.render('producto.html', { producto, usuario: { username: req.username, admin: req.admin } });
  } catch (err) {
    console.log("Error al ver el detalle de un producto:", err);
    res.status(500).send({ err });
  }
});

// Ruta para agregar un producto al carrito
router.post('/comprar/:id', async (req, res) => {
  const productoId = req.params.id; // Recupero el ID del producto desde la sesion URL

  // Inicializar el carrito si no existe
  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  // Busca el producto en la base de datos
  const producto = await Productos.findById(productoId);
  if (!producto) {
    return res.redirect('/portada'); // Redirigir si no se encuentra el producto
  }

  // Evitar duplicados 
  const productoEnCarrito = req.session.carrito.find(item => item._id.toString() === productoId);
  if (!productoEnCarrito) {
    req.session.carrito.push(producto); // Agrega el producto completo al carrito
  }

  res.redirect('/portada'); // Redirigir a la página principal
});

// Ruta para la página de pago (checkout)
router.get('/checkout', (req, res) => {
    const carrito = req.session.carrito || [];  // Recupero el carrito de la sesion
    const total = carrito.reduce((sum, item) => sum + item.price, 0); // Calcula el total
    res.render('checkout.html', { total });  //renderizo la pagina de checkout pasando el total del carrito para poder mostrarlo
});

// Ruta para manejar la actualizacion de los productos por parte de un administrador
router.post('/producto/:id/editar', async (req, res) => {
  const { id } = req.params;  // Obtiene tanto id como titulo y precio del producto
  const { titulo, precio } = req.body;

  try {
    // Verificar si el usuario es un admin a partir del token JWT
    if (!req.username || !req.admin) {
      return res.status(403).send("No tienes permisos para realizar esta acción");
    }

    // Actualizar el producto
    const producto = await Productos.findByIdAndUpdate(
      id,
      { price: precio, title: titulo },
      { new: true, runValidators: true } // Devuelve el producto actualizado y ejecuta las validaciones
    );

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Renderizar la vista con el producto actualizado y los permisos del usuario
    res.render('producto.html', {
      producto: producto,
      usuario: { admin: req.admin }, // Pasar la información del usuario
      alert: "Producto actualizado correctamente", // Pasar la alerta para notifcar que el producto se ha actualizado correctamente
    });
  } catch (err) {
    console.log("Error al actualizar el producto:", err);
    res.status(500).send("Error interno del servidor");
  }
});


// ... más rutas aquí

export default router;

