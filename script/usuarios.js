// Obtener elementos del DOM
const contenedorUsuarios = document.getElementById('contenedorUsuarios');
const inputBuscar = document.getElementById('inputBuscar');
const btnBuscar = document.getElementById('btnBuscar');
const btnGuardarUsuario = document.getElementById('btnGuardarUsuario');
const usuarioForm = document.getElementById('usuarioForm');

// Obtener token del localStorage
const token = localStorage.getItem('token');

// Función para cargar usuarios
async function cargarUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/users/listar-usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const usuarios = data.usuarios;
        
        contenedorUsuarios.innerHTML = '';
        usuarios.forEach(usuario => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${usuario.nombre}</h5>
                            <span class="badge ${usuario.rol === 'admin' ? 'bg-danger' : 'bg-primary'}">${usuario.rol}</span>
                        </div>
                        <p class="card-text">
                            <i class="bi bi-envelope me-2"></i>${usuario.email}
                        </p>
                        <p class="card-text">
                            <small class="text-muted">ID: ${usuario.id_usuario}</small>
                        </p>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>Creado: ${new Date(usuario.creado_en).toLocaleDateString()}
                            </small>
                        </p>
                        ${usuario.ultimo_login ? 
                            `<p class="card-text">
                                <small class="text-muted">
                                    <i class="bi bi-box-arrow-in-right me-1"></i>Último login: ${new Date(usuario.ultimo_login).toLocaleDateString()}
                                </small>
                            </p>` : ''
                        }
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-outline-primary btn-sm" onclick="editarUsuario('${usuario.id_usuario}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="eliminarUsuario('${usuario.id_usuario}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedorUsuarios.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar usuarios');
    }
}

// Función para crear usuario
btnGuardarUsuario.addEventListener('click', async () => {
    const usuarioData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/users/crear-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });

        const data = await response.json();
        if (data.success) {
            alert('Usuario creado exitosamente');
            usuarioForm.reset();
            document.getElementById('agregarUsuario').classList.remove('show');
            document.querySelector('.modal-backdrop').remove();
            cargarUsuarios();
        } else {
            alert('Error al crear usuario: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear usuario');
    }
});

// Función para editar usuario
async function editarUsuario(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/buscar-usuario/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const usuario = await response.json();

        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('email').value = usuario.email;
        document.getElementById('rol').value = usuario.rol;
        document.getElementById('password').value = ''; // Por seguridad no mostramos la contraseña

        const modal = new bootstrap.Modal(document.getElementById('agregarUsuario'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del usuario');
    }
}

// Función para eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/users/eliminar-usuario/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            alert('Usuario eliminado exitosamente');
            cargarUsuarios();
        } else {
            alert('Error al eliminar usuario: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
    }
}

// Función para buscar usuarios
btnBuscar.addEventListener('click', async () => {
    const termino = inputBuscar.value;
    if (!termino) {
        cargarUsuarios();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/users/buscar-usuario/${termino}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const usuario = await response.json();

        contenedorUsuarios.innerHTML = '';
        if (usuario) {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${usuario.nombre}</h5>
                            <span class="badge ${usuario.rol === 'admin' ? 'bg-danger' : 'bg-primary'}">${usuario.rol}</span>
                        </div>
                        <p class="card-text">
                            <i class="bi bi-envelope me-2"></i>${usuario.email}
                        </p>
                        <p class="card-text">
                            <small class="text-muted">ID: ${usuario.id_usuario}</small>
                        </p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-outline-primary btn-sm" onclick="editarUsuario('${usuario.id_usuario}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="eliminarUsuario('${usuario.id_usuario}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedorUsuarios.appendChild(card);
        } else {
            contenedorUsuarios.innerHTML = '<div class="col-12 text-center">No se encontraron usuarios</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al buscar usuario');
    }
});

// Cargar usuarios cuando la página se cargue
document.addEventListener('DOMContentLoaded', cargarUsuarios);