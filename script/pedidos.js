// Obtener elementos del DOM
const tablaPedidos = document.getElementById('tablaPedidos');
const mensajeDiv = document.getElementById('mensaje');
const btnGuardarPedido = document.getElementById('btnGuardarPedido');
const selectCliente = document.getElementById('cliente');
const selectProductos = document.getElementById('productos');
const inputBuscar = document.getElementById('inputBuscar');
const btnBuscar = document.getElementById('btnBuscar');

// Obtener datos del usuario del localStorage
let id_usuario = JSON.parse(localStorage.getItem('user')).id_usuario;

let token = localStorage.getItem('token');

// Cargar clientes al select
async function cargarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/users/listar-usuarios', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        
        data.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id_usuario;
            option.textContent = cliente.nombre;
            selectCliente.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Cargar productos al select
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/api/products/listar-productos');
        const data = await response.json();
        
        data.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id_producto;
            option.textContent = `${producto.nombre} - $${producto.precio}`;
            selectProductos.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para listar pedidos
// Función para listar pedidos
async function listarPedidos() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/listar-ordenes-usuario' , {
            headers: {
                'Content-Type': 'application/json', // Asegúrate de que el tipo de contenido sea 'application/json' en lugar de 'text/plain' o 'application/x-www-form-urlencoded'
                'Authorization': 'Bearer ' + token
            }
        });
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData); // Para debug

        // Verificar si la respuesta tiene la estructura esperada
        if (!responseData || !responseData.data) {
            mensajeDiv.innerHTML = "No hay órdenes disponibles";
            mensajeDiv.style.color = "red";
            tablaPedidos.innerHTML = '';
            return;
        }

        const data = responseData.data;

        if (data.length === 0) {
            mensajeDiv.innerHTML = "No hay órdenes disponibles";
            mensajeDiv.style.color = "red";
            tablaPedidos.innerHTML = '';
        } else {
            mensajeDiv.innerHTML = "Órdenes disponibles";
            mensajeDiv.style.color = "green";
            
            tablaPedidos.innerHTML = '';
            data.forEach(pedido => {
                console.log('Pedido:', pedido); // Para debug
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${pedido.id_pedido}</td>
                    <td>${JSON.parse(localStorage.getItem('user')).nombre}</td>
                    <td>${new Date(pedido.creado_en).toLocaleDateString()}</td>
                    <td>${pedido.estado}</td>
                    <td>$${pedido.total}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarPedido(${pedido.id_pedido})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarPedido(${pedido.id_pedido})">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="buscarPedido(${pedido.id_pedido})">
                            <i class="bi bi-search"></i>
                        </button>                        
                    </td>
                `;
                tablaPedidos.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeDiv.innerHTML = "Error al cargar los pedidos";
        mensajeDiv.style.color = "red";
    }
}


// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    // cargarClientes();
    // cargarProductos();
    listarPedidos();
});
function buscarPedido(id_pedido) {
    window.location.href = `buscar-pedido.html?id_pedido=${id_pedido}`;
}