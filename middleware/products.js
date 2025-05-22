const jwt = require("jsonwebtoken");
module.exports = {
  validateProduct: (req, res, next) => {
    // Validar campos obligatorios
    if (!req.body.nombre || req.body.nombre.trim().length < 2) {
      return res.status(400).send({
        message: 'El nombre del producto debe tener al menos 2 caracteres'
      });
    }

    if (!req.body.precio || req.body.precio <= 0) {
      return res.status(400).send({
        message: 'El precio debe ser un valor positivo'
      });
    }

    if (!req.body.descripcion || req.body.descripcion.trim().length < 10) {
      return res.status(400).send({
        message: 'La descripción debe tener al menos 10 caracteres'
      });
    }


    next();
  },

  validateStock: (req, res, next) => {
    if (req.body.stock === undefined || req.body.stock < 0) {
      return res.status(400).send({
        message: 'El stock no puede ser negativo'
      });
    }
    next();
  },

  validateCategory: (req, res, next) => {
    const categoriasPermitidas = ["ALIMENTOS", "ELECTRODOMÉSTICOS", "MEDICAMENTOS", "HIGIENE", "MASCOTAS","INFANTIL", "SERVICIOS", "HOGAR"];
    if (!req.body.categoria || !categoriasPermitidas.includes(req.body.categoria.toUpperCase())) {
      return res.status(400).send({
        message: 'Categoría no válida'
      });
    }
    next();
  }
};