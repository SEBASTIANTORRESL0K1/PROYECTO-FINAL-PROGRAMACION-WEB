const jwt = require("jsonwebtoken");

module.exports = {
    validateOrder: (req, res, next) => {
        if (!req.body.total || !req.body.estado || !req.body.array || !Array.isArray(req.body.array)) {
            return res.status(400).send({
                message: 'Faltan datos requeridos o formato incorrecto'
            });
        }
        next();
    },

    validateOrderStatus: (req, res, next) => {
        const estadosValidos = ['pendiente', 'en proceso', 'completado', 'cancelado'];
        if (!req.body.estado || !estadosValidos.includes(req.body.estado.toLowerCase())) {
            return res.status(400).send({
                message: 'Estado no válido'
            });
        }
        next();
    },

    isOrderOwner: (req, res, next) => {
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
                if (req.userData.rol !== 'admin' && req.userData.userId !== result[0].id_usuario) {
                    return res.status(403).send({
                        message: 'No tienes permiso para esta operación'
                    });
                }
                next();
            }
        );
    }
};