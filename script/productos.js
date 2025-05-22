// Constantes y Variables Globales
const numeroProductosCarrito=document.getElementById('divNumeroProductosCarrito');
const categorias = [
    "ALIMENTOS",
    "ELECTRODOMÉSTICOS",
    "MEDICAMENTOS",
    "HIGIENE",
    "MASCOTAS",
    "INFANTIL",
    "SERVICIOS",
    "HOGAR"
];
let carrito=localStorage.getItem('carrito');
if(carrito==null){
    carrito=[];
    localStorage.setItem('carrito',JSON.stringify(carrito));
}else{
    carrito=JSON.parse(carrito);
}
let numeroArticulos = carrito.reduce((total, producto) => total + parseInt(producto.cantidad || 0), 0);
numeroProductosCarrito.innerHTML = numeroArticulos || 0;
// Funciones de Utilidad
function obtenerParametrosURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        categoria: urlParams.get('categoria'),
        buscar: urlParams.get('buscar')
    };
}

function rutaCategoria(categoria) {
    window.location.href = `productos.html?categoria=${categoria}`;
}

// Funciones de Generación de HTML
function generarCategoriasMenu() {
    const divCategorias = document.getElementById('categorias');
    categorias.forEach(categoria => {
        divCategorias.innerHTML += `
        <li class="nav-item">
            <button class="nav-link active" onclick="rutaCategoria('${categoria}')">${categoria}</button>
        </li>`;
    });
}

function generarModalAgregar(producto) {
    return `
    <div class="modal fade" id="addCarr${producto.id_producto}" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Agregar al Carrito</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>¿Cuántas unidades desea agregar al carrito?</p>
                    <input type="number" class="form-control" id="cantidad${producto.id_producto}" 
                           min="1" max="${producto.stock}" value="1">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" 
                            onclick="agregarAlCarrito(${producto.id_producto})">Agregar</button>
                </div>
            </div>
        </div>
    </div>`;
}

function generarModalEliminar(producto) {
    return `
    <div class="modal fade" id="delCarr${producto.id_producto}" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Eliminar Producto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>¿Está seguro que desea eliminar el producto "${producto.nombre}"?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" 
                            onclick="eliminarProducto(${producto.id_producto})">Eliminar</button>
                </div>
            </div>
        </div>
    </div>`;
}

function generarModalEditar(producto) {
    return `
    <div class="modal fade" id="updCarr${producto.id_producto}" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Producto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="editNombre${producto.id_producto}" 
                               value="${producto.nombre}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Categoría</label>
                        <select class="form-control" id="editCategoria${producto.id_producto}">
                            ${categorias.map(cat => 
                                `<option value="${cat}" ${cat === producto.categoria ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Precio</label>
                        <input type="number" class="form-control" id="editPrecio${producto.id_producto}" 
                               value="${producto.precio}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Stock</label>
                        <input type="number" class="form-control" id="editStock${producto.id_producto}" 
                               value="${producto.stock}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" id="editDescripcion${producto.id_producto}">${producto.descripcion || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" 
                            onclick="actualizarProducto(${producto.id_producto})">Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>`;
}

function generarTarjetaProducto(producto) {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('col');
    productoDiv.innerHTML = `
        <div class="card h-100" id="card-${producto.id_producto}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text"><small class="text-muted">Categoría: ${producto.categoria}</small></p>
                <p class="card-text"><strong>Precio: $${producto.precio}</strong></p>
                <p class="card-text"><small class="text-muted">Stock disponible: ${producto.stock}</small></p>
                
                <button class="btn btn-primary agregar-carrito" data-bs-toggle="modal" 
                        data-bs-target="#addCarr${producto.id_producto}">
                    <i class="bi bi-cart-plus"></i> Agregar al carrito
                </button>

                <div class="container mt-4 justify-content-around">
                    <button class="btn btn-danger" data-bs-toggle="modal" 
                            data-bs-target="#delCarr${producto.id_producto}">
                        <i class="bi bi-x-circle-fill"></i> Eliminar
                    </button>

                    <button class="btn btn-success" data-bs-toggle="modal" 
                            data-bs-target="#updCarr${producto.id_producto}">
                        <i class="bi bi-pen-fill"></i> Editar
                    </button>
                </div>

                ${generarModalAgregar(producto)}
                ${generarModalEliminar(producto)}
                ${generarModalEditar(producto)}
            </div>
        </div>`;
    return productoDiv;
}

// Funciones de Manejo de Productos
function generarProducto(data) {
    const productos = document.getElementById('productos');
    productos.innerHTML = '';
    productos.classList.add('row', 'row-cols-1', 'row-cols-md-4', 'g-4', 'text-center');
    productos.appendChild(generarTarjetaProducto(data));
}

function generarProductos(data) {
    const productos = document.getElementById('productos');
    productos.classList.add('row', 'row-cols-1', 'row-cols-md-4', 'g-4', 'text-center');
    productos.innerHTML = '';
    data.productos.forEach(producto => {
        productos.appendChild(generarTarjetaProducto(producto));
    });
}

// Funciones de API
async function cargarProductos(categoria = '') {
    try {
        const headers = {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
        const url = categoria 
            ? `http://localhost:3000/api/products/listar-productos/${categoria}`
            : 'http://localhost:3000/api/products/listar-productos';
        const response = await fetch(url, { headers });
        const data = await response.json();
        generarProductos(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los productos');
    }
}

async function buscarProducto(termino) {
    try {
        const headers = {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
        const responseNombre = await fetch(`http://localhost:3000/api/products/buscar-producto-nombre/${termino}`,{headers}        );
        const dataNombre = await responseNombre.json();
        
        if (dataNombre.message === 'Producto no encontrado!') {
            const responseId = await fetch(`http://localhost:3000/api/products/buscar-producto-id/${termino}`,{headers}
            );
            const dataId = await responseId.json();
            
            if (dataId.message === 'Producto no encontrado') {
                alert('Producto no encontrado');
                return;
            }
            if(dataId.message==='Your session is not valid!'){
                alert('Sesión no validada');
                return;
            }
            generarProducto(dataId);
        } else {
            if(dataNombre.message==='Your session is not valid!'){
                alert('Sesión no validada');
                return;
            } else{
                generarProductos(dataNombre);

            }
        }
    } catch (error) {
        console.error('Error:', error);
        return
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    generarCategoriasMenu();
    const params = obtenerParametrosURL();
    
    if (params.categoria) {
        cargarProductos(params.categoria);
    } else if (params.buscar) {
        buscarProducto(params.buscar);
    } else {
        cargarProductos();
    }
});

const btnBuscar = document.getElementById('btnBuscar');
btnBuscar.addEventListener('click', () => {
    const inputBuscar = document.getElementById('inputBuscar').value;
    if (inputBuscar === "") window.location.reload();
    buscarProducto(inputBuscar);
});

const btnAgregarProducto = document.getElementById('btnAgregarProducto');
btnAgregarProducto.addEventListener('click', async () => {
    const formData = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/products/crear-producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.message === 'Producto creado exitosamente') {
            alert('Producto agregado correctamente');
            window.location.reload();
        } else {
            alert('Error al agregar el producto: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
});

// Funciones de Operaciones CRUD
function agregarAlCarrito(id) {
    const cantidad = document.getElementById(`cantidad${id}`).value;
    // Implementar lógica de agregar al carrito
    let productoCarrito={id:id,cantidad:cantidad}
    carrito.push(productoCarrito);
    localStorage.setItem('carrito',JSON.stringify(carrito));
    window.location.reload();
}

function actualizarProducto(id) {
    // Obtener valores
    const nombre = document.getElementById(`editNombre${id}`).value.trim();
    const categoria = document.getElementById(`editCategoria${id}`).value;
    const precio = parseFloat(document.getElementById(`editPrecio${id}`).value);
    const stock = parseInt(document.getElementById(`editStock${id}`).value);
    const descripcion = document.getElementById(`editDescripcion${id}`).value.trim();

    // Validaciones
    if (!nombre) {
        alert('El nombre del producto es obligatorio');
        return;
    }
    if (precio <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
    }
    if (stock < 0) {
        alert('El stock no puede ser negativo');
        return;
    }

    const producto = {
        id: id,
        nombre: nombre,
        categoria: categoria,
        precio: precio,
        stock: stock,
        descripcion: descripcion
    };

    fetch(`http://localhost:3000/api/products/actualizar-producto/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ localStorage.getItem('token')
        },
        body: JSON.stringify(producto)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Tu sesión no es válida');
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Producto editado exitosamente') {
            alert('Producto editado exitosamente');
            window.location.reload();
        } else {
            alert('Error al editar el producto: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error al actualizar el producto: ' + error.message);
    });
}

function eliminarProducto(id) {
    // Implementar lógica de eliminación
    fetch(`http://localhost:3000/api/products/eliminar-producto/${id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ localStorage.getItem('token')
            }
        }
    )
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Producto desactivado exitosamente') {
            alert('Producto eliminado exitosamente');
            window.location.reload();
        } else {
            alert('Error al eliminar el producto:'+ data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })
}
