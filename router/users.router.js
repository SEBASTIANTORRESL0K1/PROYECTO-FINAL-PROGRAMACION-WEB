// routes/router.js

const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');

// routes/router.js

router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    console.log(req.body);
    db.query(
      'SELECT id_usuario FROM usuarios WHERE LOWER(nombre) = LOWER(?)',
      [req.body.username],
      (err, result) => {
        if (result && result.length) {
          // error
          return res.status(409).send({
            message: 'Este nombre de usuario ya está en uso',
          });
        } else {
          // username not in use
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).send({
                message: err,
              });
            } else {
              db.query(
                'INSERT INTO usuarios (id_usuario, nombre, email,password_hash, rol,creado_en) VALUES (?, ?, ?, ?,?,now());',
                [uuid.v4(), req.body.username,req.body.email, hash,req.body.rol],
                (err, result) => {
                  if (err) {
                    return res.status(400).send({
                      message: err,
                    });
                  }
                  return res.status(201).send({
                    message: 'Registered!',
                  });
                }
              );
            }
          });
        }
      }
    );
  });
  router.post('/login', (req, res, next) => {
    db.query(
      `SELECT * FROM usuarios WHERE nombre = ?;`,
      [req.body.username],
      (err, result) => {
        if (err) {
          return res.status(400).send({
            message: err,
          });
        }
        if (!result.length) {
          return res.status(400).send({
            message: 'Username or password incorrect!',
          });
        }
        bcrypt.compare(
          req.body.password,
          result[0]['password_hash'], // Cambiar 'password' por 'password_hash'
          (bErr, bResult) => {
            if (bErr) {
              return res.status(400).send({
                message: 'Username or password incorrect!',
              });
            }
            if (bResult) {
              // password match
              const token = jwt.sign(
                {
                  username: result[0].nombre, // Cambiar username por nombre
                  userId: result[0].id_usuario,
                  rol: result[0].rol  // Agregar el rol al token
                },
                'SECRETKEY',
                { expiresIn: '7d' }
              );
              db.query(`UPDATE usuarios SET ultimo_login = now() WHERE id_usuario = ?;`, [ // Cambiar 'users' por 'usuarios'
                result[0].id_usuario // Cambiar id por id_usuario
              ]);
              return res.status(200).send({
                message: 'Logged in!',
                token,
                user: result[0],
              });
            }
            return res.status(400).send({
              message: 'Username or password incorrect!',
            });
          }
        );
      }
    );
  });
  router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.json({msg:'This is the secret content. Only logged in users can see that!'});
  });
router.get('/buscar-usuario-nombre/:nombre', userMiddleware.isLoggedIn, userMiddleware.isAdmin,(req, res, next) => {
    db.query(
      'SELECT id_usuario,nombre,email,rol, creado_en, ultimo_login FROM usuarios WHERE nombre LIKE ?;',
      [`%${req.params.nombre}%`],
      (err, result) => {
        if (err) {
          return res.status(400).send({
            message: err,
          });
        }
        if (!result.length) {
          return res.status(400).send({
            message: 'Usuario no encontrado!',
          });
        }
        return res.status(200).send({
          data: result
        });
      }
    );
});
router.get('/listar-usuarios', userMiddleware.isLoggedIn, userMiddleware.isAdmin,(req, res, next) => {
    console.log("entro la peticion")
    db.query(
      'SELECT id_usuario,nombre,email,rol, creado_en, ultimo_login FROM usuarios WHERE rol="cliente";',
      (err, result) => {
        if (err) {
          return res.status(400).send({
            message: err,
          });
        }
        // Agregar la respuesta con los resultados
        return res.status(200).send({
          usuarios: result
        });
      }
    );
});
router.put('/actualizar-usuario/:id', userMiddleware.isLoggedIn, userMiddleware.validateRegister, (req, res, next) => {
  // Verificar si el usuario es admin o si está actualizando su propia información
  if (req.userData.rol !== 'admin' && req.userData.userId !== req.params.id) {
    return res.status(403).send({
      message: 'No tienes permiso para actualizar la información de otro usuario'
    });
  }

  // Check if user exists before updating
  db.query(
    'SELECT rol FROM usuarios WHERE id_usuario = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err
        });
      }
      if (!result.length) {
        return res.status(404).send({
          message: 'Usuario no encontrado'
        });
      }

      // Only hash password if it was provided
      if (req.body.password) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err
            });
          }
          updateUser(hash);
        });
      } else {
        updateUser(null);
      }

      function updateUser(hash) {
        const updateQuery = hash 
          ? 'UPDATE usuarios SET nombre = ?, email = ?, password_hash = ? WHERE id_usuario = ?'
          : 'UPDATE usuarios SET nombre = ?, email = ? WHERE id_usuario = ?';
        
        const queryParams = hash
          ? [req.body.username, req.body.email, hash, req.params.id]
          : [req.body.username, req.body.email, req.params.id];

        db.query(updateQuery, queryParams, (err, result) => {
          if (err) {
            return res.status(400).send({
              message: err
            });
          }
          return res.status(200).send({
            message: 'Usuario actualizado!'
          });
        });
      }
    }
  );
});

router.delete('/eliminar-usuario/:id', userMiddleware.isLoggedIn, userMiddleware.isAdmin, (req, res, next) => {

  if (req.userData.rol !== 'admin' && req.userData.userId !== req.params.id) {
    return res.status(403).send({
      message: 'No tienes permiso para eliminar la información de otro usuario'
    });
  }

  // Verificar que el usuario existe antes de eliminarlo
  db.query(
    'SELECT rol FROM usuarios WHERE id_usuario = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err,
        });
      }
      if (!result.length) {
        return res.status(404).send({
          message: 'Usuario no encontrado'
        });
      }
      


      // Proceder con la eliminación
      db.query(
        'DELETE FROM usuarios WHERE id_usuario = ?;',
        [req.params.id],
        (err, result) => {
          if (err) {
            return res.status(400).send({
              message: err,
            });
          }
          return res.status(200).send({
            message: 'Usuario eliminado exitosamente'
          });
        }
      );
    }
  );
});

router.get('/buscar-usuario-id/:id', userMiddleware.isLoggedIn, userMiddleware.isAdmin,(req, res, next) => {
  db.query(
    'SELECT id_usuario,nombre,email,rol, creado_en, ultimo_login FROM usuarios WHERE id_usuario = ?;',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err,
        });
      }
      if (!result.length) {
        return res.status(400).send({
          message: 'Usuario no encontrado!',
        });
      }
      return res.status(200).send({
        data: result
      });
    }
  );
});
module.exports = router;
