// routes/api_ratings.js
import express from 'express';
import Productos from '../model/productos.js';
import logger from '../logger.js'; // Importar el logger (para nota)

const router = express.Router();

// Obtener la lista de ratings de todos los productos. Esta es la funcionalidad principal (descomentar y comentar la de subir nota)
// router.get('/ratings', async (req, res) => {
//     try {
//         const productos = await Productos.find({}, { _id: 1, title: 1, 'rating.rate': 1 });
//         res.json(productos);
//     } catch (err) {
//         console.error("Error al obtener los ratings:", err);
//         res.status(500).send({ error: "Error al obtener los ratings" });
//     }
// });

//Para nota: poner un paginador al primer endopint para sacar los 5 primeros ratings (descomentar para utilizarlo para que no se solapen rutas)
// router.get('/ratings', async (req, res) => {
//     try {
//         const { desde = 0, hasta = 4 } = req.query;
//         const start = parseInt(desde); // Índice inicial
//         const end = parseInt(hasta); // Índice final

//         //el principio y el final tienen que ser numeros validos, positivos y que el final este despues del principio
//         if (isNaN(start) || isNaN(end) || start < 0 || end < start) {
//             return res.status(400).json({ error: "Parámetros inválidos: usa valores numéricos para 'desde' y 'hasta'." });
//         }

//         const limit = end - start + 1; // Calcular cuántos resultados obtener
//         const productos = await Productos.find({}, { _id: 1, title: 1, 'rating.rate': 1 })
//             .skip(start) // Ignora los primeros "start" resultados
//             .limit(limit); // Limitar la cantidad de resultados a "limit" (aseguramos que solo se devuelvan los que queremos)

//         res.status(200).json(productos);
//     } catch (error) {
//         console.error("Error al obtener los ratings:", error);
//         res.status(500).json({ message: "Error al obtener los ratings" });
//     }
// });

//para nota: poner un logger en la aplicacion
router.get('/ratings', async (req, res) => {
    try {
        const { desde = 0, hasta = 4 } = req.query;

        // Log de la solicitud
        logger.info(`Solicitando ratings desde ${desde} hasta ${hasta}`);

        const start = parseInt(desde);
        const end = parseInt(hasta);

        if (isNaN(start) || isNaN(end) || start < 0 || end < start) {
            logger.warn(`Parámetros inválidos: desde=${desde}, hasta=${hasta}`);
            return res.status(400).json({ error: "Parámetros inválidos: usa valores numéricos para 'desde' y 'hasta'." });
        }

        const limit = end - start + 1;
        const productos = await Productos.find({}, { _id: 1, title: 1, 'rating.rate': 1 })
            .skip(start)
            .limit(limit);

        res.status(200).json(productos);
    } catch (error) {
        logger.error(`Error al obtener ratings: ${error.message}`);
        res.status(500).json({ message: "Error al obtener los ratings" });
    }
});

// Obtener el rating de un producto por ID
router.get('/ratings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el producto con su rate, count y nombre
        const producto = await Productos.findById(id, { _id: 1, title: 1, 'rating.rate': 1, 'rating.count': 1 });

        if (!producto) {
            return res.status(404).send({ error: "Producto no encontrado" });
        }

        res.json(producto);
    } catch (err) {
        console.error("Error al obtener el rating del producto:", err);
        res.status(500).send({ error: "Error al obtener el rating" });
    }
});



// Actualizar el rating de un producto
router.put('/ratings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        // Validar que el rating está dentro del rango permitido
        if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
            return res.status(400).send({ error: "El rating debe estar entre 0 y 5" });
        }

        // Obtener el producto de la base de datos
        const producto = await Productos.findById(id);

        if (!producto) {
            return res.status(404).send({ error: "Producto no encontrado" });
        }

        // Calcular la nueva media del rating
        const currentCount = producto.rating.count || 0; // Cantidad actual de ratings
        const currentRate = producto.rating.rate || 0;   // Media actual
        const newCount = currentCount + 1;               // Incrementar el conteo
        const newRate = ((currentRate * currentCount) + rating) / newCount; // Nueva media

        // Actualizar el producto con los nuevos valores
        producto.rating.rate = newRate;
        producto.rating.count = newCount;

        // Agregar log antes de guardar los datos
        console.log(`Producto ID: ${id}`);
        console.log(`Nuevo rating: ${rating}`);
        console.log(`Contador previo: ${currentCount}, Nueva cantidad: ${newCount}`);
        console.log(`Valor previo: ${currentRate}, Nuevo valor: ${newRate}`);

        await producto.save();

        res.json({ 
            message: "Rating actualizado correctamente", 
            producto: { 
                name: producto.title, 
                rating: { rate: newRate.toFixed(2), count: newCount } // Redondeo de decimales si es necesario
            } 
        });
    } catch (err) {
        console.error("Error al actualizar el rating:", err);
        res.status(500).send({ error: "Error al actualizar el rating" });
    }


});




export default router;

