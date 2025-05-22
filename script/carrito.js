// Obtener elementos del DOM
const tablaCarrito = document.getElementById('carritoItems');
const totalCarrito = document.getElementById('totalCarrito');
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
const numeroProductosCarrito = document.getElementById('divNumeroProductosCarrito');

// Obtener carrito del localStorage
let carrito = localStorage.getItem('carrito');
if (carrito == null) {
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
} else {
    carrito = JSON.parse(carrito);
}

// Actualizar número de productos en el carrito
let numeroArticulos = carrito.reduce((total, producto) => total + parseInt(producto.cantidad || 0), 0);
numeroProductosCarrito.innerHTML = numeroArticulos || 0;

// Función para cargar los productos en la tabla
async function cargarProductosCarrito() {
    tablaCarrito.innerHTML = '';
    let total = 0;

    for (const item of carrito) {
        try {
            const headers= {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
            const response = await fetch(`http://localhost:3000/api/products/buscar-producto-id/${item.id}`,
                {headers}
            );
            const producto = await response.json();

            if (producto) {
                const subtotal = producto.precio * item.cantidad;
                total += subtotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio}</td>
                    <td>
                        <div class="input-group" style="max-width: 150px;">
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="actualizarCantidad(${item.id}, ${parseInt(item.cantidad) - 1})">-</button>
                            <input type="number" class="form-control text-center" value="${item.cantidad}" 
                                   min="1" max="${producto.stock}" 
                                   onchange="actualizarCantidad(${item.id}, this.value)">
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="actualizarCantidad(${item.id}, ${parseInt(item.cantidad) + 1})">+</button>
                        </div>
                    </td>
                    <td>$${subtotal}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${item.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tablaCarrito.appendChild(tr);
                let carrito = localStorage.getItem('carrito');
                if (carrito == null) {
                    carrito = [];
                    localStorage.setItem('carrito', JSON.stringify(carrito));
                } else {
                    carrito = JSON.parse(carrito);
                }

                // Actualizar número de productos en el carrito
                let numeroArticulos = carrito.reduce((total, producto) => total + parseInt(producto.cantidad || 0), 0);
                numeroProductosCarrito.innerHTML = numeroArticulos || 0;
            }
        } catch (error) {
            console.error('Error al cargar producto:', error);
        }
    }

    totalCarrito.textContent = `$${total}`;
}

// Función para actualizar la cantidad de un producto
async function actualizarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad < 1) return;

    try {
        // Obtener el producto actual para verificar el stock
        const response = await fetch(`http://localhost:3000/api/products/buscar-producto-id/${id}`);
        const producto = await response.json();

        if (nuevaCantidad > producto.stock) {
            alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`);
            return;
        }

        const index = carrito.findIndex(item => item.id === id);
        if (index !== -1) {
            const numeroProductosCarrito = document.getElementById('numeroProductosCarrito');
            carrito[index].cantidad = parseInt(nuevaCantidad);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            cargarProductosCarrito();
            // Actualizar número de productos en el carrito
            // numeroArticulos = carrito.reduce((total, producto) => total + parseInt(producto.cantidad || 0), 0);
            // numeroProductosCarrito.innerHTML = numeroArticulos || 0;
            // let carr= localStorage.getItem('carrito');
            // carr=JSON.parse(carr);
            // numeroArticulos = carr.reduce((total, producto) => total + parseInt(producto.cantidad || 0), 0);
            // numeroProductosCarrito.innerHTML = numeroArticulos || 0;

        }
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar la cantidad del producto');
    }
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarProductosCarrito();
}

// Event Listeners
btnVaciarCarrito.addEventListener('click', () => {
    if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarProductosCarrito();
        // Actualizar el contador del carrito
        numeroArticulos = 0;
        numeroProductosCarrito.innerHTML = 0;
    }
});

btnFinalizarCompra.addEventListener('click', async () => {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    try {
        // Preparar los datos del carrito en el formato requerido
        const productosFormateados = [];
        let total = 0;

        for (const item of carrito) {
            const headers= {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
            const response = await fetch(`http://localhost:3000/api/products/buscar-producto-id/${item.id}`,{headers});
            const producto = await response.json();
            
            const subtotal = producto.precio * item.cantidad;
            total += subtotal;

            productosFormateados.push({
                id_producto: item.id,
                cantidad: item.cantidad,
                precio_unitario: producto.precio
            });
        }

        const ordenData = {
            total: total,
            estado: "pendiente",
            array: productosFormateados
        };

        const response = await fetch('http://localhost:3000/api/orders/crear-orden', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(ordenData)
        });

        const data = await response.json();
        if (data.success || data.message === 'Orden creada exitosamente y stock actualizado') {
            alert('¡Compra finalizada con éxito!');
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            cargarProductosCarrito();
            window.location.href = './index.html';
        } else {
            throw new Error(data.message || 'Error al crear la orden');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra: ' + error.message);
    }
});

// Cargar productos al iniciar
cargarProductosCarrito();