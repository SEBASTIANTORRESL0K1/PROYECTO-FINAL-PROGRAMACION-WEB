const express = require('express');
const router = express.Router();

const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');
const orderMiddleware = require('../middleware/orders.js');

// Aquí irán tus rutas de órdenes
router.get('/listar-ordenes', userMiddleware.isLoggedIn, (req, res, next) => {
    db.query(
        'SELECT * FROM pedidos;',
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al obtener las ordenes',
                    error: err
                });
            }
            res.status(200).send({
                data: result
            });
        }
    )
});
router.get('/listar-ordenes-usuario', userMiddleware.isLoggedIn, (req, res, next) => {
    db.query(
        'SELECT * FROM pedidos WHERE id_usuario =?;',
        [req.userData.userId],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    
                })
            }  
            if (!result.length) {
                return res.status(404).send({
                    message: 'Orden no encontrada'
                });
            }
            res.status(200).send({
                data: result
            });

        }

    )
})
router.get('buscar-orden/:id', userMiddleware.isLoggedIn, (req, res, next) => {
    db.query(
        'SELECT * FROM pedidos WHERE id_pedido =?;',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al obtener la orden',
                    error: err
                });
            }
            if (!result.length) {
                return res.status(404).send({
                    message: 'Orden no encontrada'
                });
            }
            res.status(200).send({
                data: result
            });
        }
    )
});
router.post('/crear-orden', 
    userMiddleware.isLoggedIn, 
    orderMiddleware.validateOrder,
    async (req, res, next) => {
    
    try {
        // Primero verificamos el stock disponible para todos los productos
        for (const item of req.body.array) {
            const [stockResult] = await db.promise().query(
                'SELECT stock FROM productos WHERE id_producto = ?',
                [item.id_producto]
            );

            if (!stockResult.length || stockResult[0].stock < item.cantidad) {
                return res.status(400).send({
                    message: `Stock insuficiente para el producto ID: ${item.id_producto}`,
                    stockDisponible: stockResult.length ? stockResult[0].stock : 0
                });
            }
        }

        // Crear la orden principal
        const [orderResult] = await db.promise().query(
            'INSERT INTO pedidos (id_usuario, creado_en, total, estado) VALUES (?, NOW(), ?, ?)',
            [req.userData.userId, req.body.total, req.body.estado]
        );

        // Insertar detalles y actualizar stock
        for (const item of req.body.array) {
            await db.promise().query(
                'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?,?,?,?)',
                [orderResult.insertId, item.id_producto, item.cantidad, item.precio_unitario]
            );

            await db.promise().query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        res.status(201).send({
            message: 'Orden creada exitosamente y stock actualizado',
            orderId: orderResult.insertId
        });

    } catch (error) {
        // Si hay error, intentar revertir la orden
        if (orderResult && orderResult.insertId) {
            await db.promise().query('DELETE FROM pedidos WHERE id_pedido = ?', [orderResult.insertId]);
        }
        
        res.status(500).send({
            message: 'Error al procesar la orden',
            error: error.message
        });
    }
});
router.put('/actualizar-orden/:id', 
    userMiddleware.isLoggedIn, 
    orderMiddleware.validateOrderStatus,
    orderMiddleware.isOrderOwner,
    (req, res, next) => {
    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'en proceso', 'completado', 'cancelado'];
    if (!req.body.estado || !estadosValidos.includes(req.body.estado.toLowerCase())) {
        return res.status(400).send({
            message: 'Estado no válido'
        });
    }

    // Verificar si el usuario es admin o es el dueño de la orden
    db.query(
        'SELECT id_usuario FROM pedidos WHERE id_pedido = ?',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al verificar la orden',
                    error: err
                });
            }
            if (!result.length) {
                return res.status(404).send({
                    message: 'Orden no encontrada'
                });
            }

            // Verificar permisos
            if (req.userData.rol !== 'admin' && req.userData.userId !== result[0].id_usuario) {
                return res.status(403).send({
                    message: 'No tienes permiso para actualizar esta orden'
                });
            }

            // Actualizar el estado
            db.query(
                'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
                [req.body.estado.toLowerCase(), req.params.id],
                (err, updateResult) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Error al actualizar la orden',
                            error: err
                        });
                    }
                    return res.status(200).send({
                        message: 'Orden actualizada exitosamente'
                    });
                }
            );
        }
    );
});
router.delete('/eliminar-orden/:id', 
    userMiddleware.isLoggedIn, 
    orderMiddleware.isOrderOwner,
    (req, res, next) => {
    // Verificar si el usuario es admin o es el dueño de la orden
    db.query(
        'SELECT id_usuario FROM pedidos WHERE id_pedido = ?',
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al verificar la orden',
                    error: err      
                });
            }   
            if (!result.length) {
                return res.status(404).send({
                    message: 'Orden no encontrada'
                });
            }       
            // Verificar permisos
            if (req.userData.rol !== 'admin' && req.userData.userId !== result[0].id_usuario) {
                return res.status(403).send({
                    message: 'No tienes permiso para eliminar esta orden'
                });
            }

            // Primero eliminar los detalles
            db.query(
                'DELETE FROM detalles_pedidos WHERE id_pedido = ?',
                [req.params.id],
                (err, deleteDetailsResult) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Error al eliminar los detalles de la orden',
                            error: err
                        });
                    }

                    // Después eliminar la orden principal
                    db.query(
                        'DELETE FROM pedidos WHERE id_pedido = ?',
                        [req.params.id],
                        (err, deleteResult) => {
                            if (err) {
                                return res.status(500).send({
                                    message: 'Error al eliminar la orden',
                                    error: err
                                });
                            }
                            return res.status(200).send({
                                message: 'Orden y detalles eliminados exitosamente'
                            });
                        }
                    );
                }
            );
        }
    );
});
router.get('/listar-ordenes/:estado', userMiddleware.isLoggedIn, (req, res, next) => {
    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'en proceso', 'completado', 'cancelado'];
    if (!estadosValidos.includes(req.params.estado.toLowerCase())) {
        return res.status(400).send({
            message: 'Estado no válido'
        });
    }

    // Consultar las órdenes por estado
    db.query(
        'SELECT * FROM pedidos WHERE estado = ?',
        [req.params.estado.toLowerCase()],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al listar las órdenes',
                    error: err
                });
            }
            if (!result || !result.length) {
                return res.status(404).send({
                    message: 'No hay órdenes con este estado'
                });
            }
            return res.status(200).send({
                estado: req.params.estado.toLowerCase(),
                ordenes: result
            });
        }
    );
});
router.get('/obtener-detalles/:id', userMiddleware.isLoggedIn, (req, res, next) => {
    db.query(
        `SELECT 
            p.id_pedido, 
            p.id_usuario, 
            p.estado, 
            p.total, 
            p.creado_en AS pedido_creado_en, 
            pr.id_producto, 
            pr.nombre AS nombre_producto, 
            pr.descripcion, 
            pr.categoria, 
            dp.cantidad, 
            dp.precio_unitario 
        FROM pedidos p 
        JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido 
        JOIN productos pr ON dp.id_producto = pr.id_producto 
        WHERE p.id_pedido = ?;`,
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al obtener los detalles del pedido',
                    error: err
                });
            }
            if (!result || !result.length) {
                return res.status(404).send({
                    message: 'Pedido no encontrado o sin detalles'
                });
            }
            return res.status(200).send({
                pedido: {
                    id_pedido: result[0].id_pedido,
                    id_usuario: result[0].id_usuario,
                    estado: result[0].estado,
                    total: result[0].total,
                    creado_en: result[0].pedido_creado_en,
                    detalles: result.map(item => ({
                        producto: {
                            id_producto: item.id_producto,
                            nombre: item.nombre_producto,
                            descripcion: item.descripcion,
                            categoria: item.categoria
                        },
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_unitario
                    }))
                }
            });
        }
    );
});

module.exports = router;