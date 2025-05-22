const express = require('express');
const router = express.Router();


const db = require('../lib/db.js');
const productMiddleware = require('../middleware/products.js');
const userMiddleware = require('../middleware/users.js');

router.post('/crear-producto', 
    userMiddleware.isLoggedIn,    // Primero verifica que esté logueado
    userMiddleware.isAdmin,       // Luego verifica que sea administrador
    productMiddleware.validateProduct,
    productMiddleware.validateStock,
    productMiddleware.validateCategory,
    (req, res, next) => {
    console.log(req.body);

    /*
    agregar validacion para que el usuario sea solo admin
    */ 
    db.query(
        'SELECT id_producto FROM productos WHERE LOWER(nombre) = LOWER(?)',
        [req.body.nombre],
        (err, result) => {
            if (result && result.length) {
                return res.status(409).send({
                    message: 'El producto ya existe',
                });
            } else {
                db.query(
                    'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, creado_en) VALUES (?, ?, ?, ?, ?, NOW())',
                    [req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock, req.body.categoria],
                    (err, result) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error al crear el producto'
                            });
                        }
                        return res.status(201).send({
                            message: 'Producto creado exitosamente'
                        });
                    }
                );
            }
        }
    );
});
router.get('/buscar-producto-id/:id', userMiddleware.isLoggedIn,(req, res, next) => {
    const query = req.userData.rol === 'admin' 
    ? 'SELECT * FROM productos WHERE id_producto =?'
    : 'SELECT * FROM productos WHERE activo = TRUE';
    db.query(
        'SELECT * FROM productos WHERE id_producto = ?',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al buscar el producto'
                });
            }
            if (!result || !result.length) {
                return res.status(404).send({
                    message: 'Producto no encontrado'
                });
            }
            return res.status(200).send(result[0]);
        }
    );
});

router.get('/listar-productos', userMiddleware.isLoggedIn, (req, res, next) => {
    // Consulta SQL condicional basada en el rol del usuario
    const query = req.userData.rol === 'admin' 
        ? 'SELECT * FROM productos'
        : 'SELECT * FROM productos WHERE activo = TRUE and stock > 0';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al listar los productos'
            });
        }
        if (!result || !result.length) {
            return res.status(404).send({
                message: 'No hay productos disponibles'
            });
        }
        return res.status(200).send({
            productos: result
        });
    });
});
router.put('/actualizar-producto/:id',
    userMiddleware.isLoggedIn,    // Primero verifica que esté logueado
    userMiddleware.isAdmin,       // Luego verifica que sea administrador
    productMiddleware.validateProduct,
    productMiddleware.validateStock,
    productMiddleware.validateCategory,
    (req, res, next) => {
    db.query(
        'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id_producto = ?',
        [req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock, req.body.categoria, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al editar el producto'
                });         
            }       
            return res.status(200).send({
                message: 'Producto editado exitosamente'
            });
        }
    )
    }
);

router.get('/listar-productos/:categoria', (req, res, next) => {
    db.query(
        'SELECT * FROM productos WHERE categoria = ? AND activo=TRUE',
        [req.params.categoria],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al listar los productos por categoría'
                });
            }
            if (!result || !result.length) {
                return res.status(404).send({
                    message: 'No hay productos disponibles en esta categoría'
                });
            }
            return res.status(200).send({
                categoria: req.params.categoria,
                productos: result
            });
        }
    );
});

router.get('/listar-productos-agrupados', (req, res, next) => {
    db.query(
        'SELECT * FROM productos ORDER BY categoria',
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al listar los productos'
                });
            }
            if (!result || !result.length) {
                return res.status(404).send({
                    message: 'No hay productos disponibles'
                });
            }

            // Agrupar productos por categoría
            const productosPorCategoria = result.reduce((acc, producto) => {
                if (!acc[producto.categoria]) {
                    acc[producto.categoria] = [];
                }
                acc[producto.categoria].push(producto);
                return acc;
            }, {});

            return res.status(200).send({
                productos_por_categoria: productosPorCategoria
            });
        }
    );
});
router.get('/buscar-producto-nombre/:nombre',userMiddleware.isLoggedIn,(req, res, next) => {
    db.query(
      'SELECT * FROM productos WHERE nombre LIKE ?',
      [`%${req.params.nombre}%`],
      (err, result) => {
        if (err) {
          return res.status(400).send({
            message: err,
          });
        }
        if (!result.length) {
          return res.status(400).send({
            message: 'Producto no encontrado!',
          });
        }
        return res.status(200).send({
          productos: result
        });
      }
    );
});
router.delete('/eliminar-producto/:id', userMiddleware.isLoggedIn, userMiddleware.isAdmin, (req, res, next) => {
    db.query(
        'UPDATE productos SET activo = FALSE WHERE id_producto = ?',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    message: err,
                });
            }
            return res.status(200).send({
                message: 'Producto desactivado exitosamente'
            });
        }
    );
});
module.exports = router;