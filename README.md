


          
# Sistema de Gestión de Pedidos

## Descripción
Este sistema permite a los clientes registrarse, iniciar sesión, navegar por productos y realizar compras. También incluye funcionalidades administrativas para gestión de productos y usuarios.

## Características Principales
- Registro e inicio de sesión de usuarios
- Catálogo de productos
- Carrito de compras
- Gestión de pedidos
- Panel administrativo

## Tecnologías Utilizadas
- Frontend: HTML, CSS (Bootstrap 5), JavaScript
- Backend: Node.js
- Base de datos: MySQL

## Estructura del Proyecto
```
PROYECTO FINAL/
├── frontend/
│   ├── index.html
│   ├── productos.html
│   ├── usuarios.html
│   ├── pedidos.html
│   ├── carrito.html
│   └── buscar-pedido.html
├── script/
│   ├── carrito.js
│   ├── pedidos.js
│   ├── productos.js
│   └── usuarios.js
```

## API Endpoints

### Autenticación
Todas las rutas protegidas requieren el siguiente header:
```
Authorization: Bearer <token>
```

### Usuarios

#### Registro
```
POST /api/users/crear-usuario
Content-Type: application/json

{
    "nombre": "string",
    "email": "string",
    "password": "string",
    "rol": "string"
}
```

#### Login
```
POST /api/users/login
Content-Type: application/json

{
    "email": "string",
    "password": "string"
}
```

### Productos

#### Listar Productos
```
GET /api/products/listar-productos
Authorization: Bearer <token>
```

#### Buscar Producto
```
GET /api/products/buscar-producto-id/:id
Authorization: Bearer <token>
```

### Pedidos

#### Crear Pedido
```
POST /api/orders/crear-orden
Authorization: Bearer <token>
Content-Type: application/json

{
    "total": number,
    "estado": "string",
    "array": [
        {
            "id_producto": number,
            "cantidad": number,
            "precio_unitario": number
        }
    ]
}
```

#### Listar Pedidos
```
GET /api/orders/listar-ordenes
Authorization: Bearer <token>
```

## Funcionalidades Administrativas

### Gestión de Usuarios
- Listar todos los usuarios
- Crear nuevos usuarios
- Modificar usuarios existentes
- Eliminar usuarios

### Gestión de Productos
- Crear nuevos productos
- Modificar productos existentes
- Eliminar productos
- Gestionar inventario

### Gestión de Pedidos
- Ver todos los pedidos
- Actualizar estado de pedidos
- Ver detalles de pedidos específicos

## Instalación y Configuración

1. Clonar el repositorio
2. Instalar dependencias
3. Configurar variables de entorno
4. Iniciar el servidor

## Uso
1. Iniciar sesión como administrador o cliente
2. Navegar por el catálogo de productos
3. Agregar productos al carrito
4. Realizar pedidos
5. Gestionar usuarios y productos (solo administrador)

## Seguridad
- Autenticación mediante JWT
- Validación de roles
- Protección de rutas sensibles
- Encriptación de contraseñas

## Contribución
Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT.

        