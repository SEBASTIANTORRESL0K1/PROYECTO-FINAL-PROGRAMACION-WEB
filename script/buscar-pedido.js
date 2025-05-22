// Obtener elementos del DOM
const numeroPedido = document.getElementById('numeroPedido');
const nombreCliente = document.getElementById('nombreCliente');
const fechaPedido = document.getElementById('fechaPedido');
const estadoPedido = document.getElementById('estadoPedido');
const totalPedido = document.getElementById('totalPedido');
const tablaProductos = document.getElementById('tablaProductos');

// Obtener el ID del pedido de la URL
const urlParams = new URLSearchParams(window.location.search);
const id_pedido = urlParams.get('id_pedido');

// Obtener token del localStorage
const token = localStorage.getItem('token');

// Función para cargar los detalles del pedido
async function cargarDetallePedido() {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/obtener-detalles/${id_pedido}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const pedido = data.pedido;

        if (!pedido) {
            alert('No se encontró el pedido');
            window.location.href = './pedidos.html';
            return;
        }

        // Llenar la información general
        numeroPedido.textContent = `#${pedido.id_pedido}`;
        nombreCliente.textContent = JSON.parse(localStorage.getItem('user')).nombre;
        fechaPedido.textContent = new Date(pedido.creado_en).toLocaleDateString();
        
        // Establecer el estado con el color correspondiente
        estadoPedido.textContent = pedido.estado;
        switch (pedido.estado.toLowerCase()) {
            case 'pendiente':
                estadoPedido.classList.add('bg-warning');
                break;
            case 'en_proceso':
                estadoPedido.classList.add('bg-info');
                break;
            case 'completado':
                estadoPedido.classList.add('bg-success');
                break;
            case 'cancelado':
                estadoPedido.classList.add('bg-danger');
                break;
        }

        totalPedido.textContent = `$${pedido.total}`;

        // Llenar la tabla de productos
        tablaProductos.innerHTML = '';
        pedido.detalles.forEach(detalle => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${detalle.producto.nombre}</td>
                <td>${detalle.cantidad}</td>
                <td>$${detalle.precio_unitario}</td>
                <td>$${(detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2)}</td>
            `;
            tablaProductos.appendChild(tr);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

// Cargar los detalles cuando la página se cargue
document.addEventListener('DOMContentLoaded', cargarDetallePedido);