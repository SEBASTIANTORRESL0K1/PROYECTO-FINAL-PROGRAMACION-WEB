const btnLogin=document.getElementById('btnLogin');
const mensajeDiv=document.getElementById("mensaje");
let valorLoggeado=localStorage.getItem('isLogged');
const miModal=document.getElementById("miModal");

if(valorLoggeado=="true"){
    let respuesta=prompt("¿Desea cerrar sesión? (si/no)");
    if(respuesta=="si"){
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('isLogged');
        goOut();
    }
    else{
        window.location.href = './index.html'; // Redirige al usuario a la página de inicio de sesión
    }
}
function goOut(){
            setTimeout(() => {
            window.location.reload();
        }, 1000);
}

btnLogin.addEventListener("click", function(){
    let nombre=document.getElementById('inputName').value;
    let contraseña=document.getElementById('inputPassword').value;
    if(nombre=='' || contraseña==''){
        alert("Todos los campos son obligatorios");
    }

    console.log(nombre, contraseña);
    fetch('http://localhost:3000/api/users/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: nombre,
            password: contraseña,
        })
    })
    .then(response => response.json())
    .then(data => {
       console.log(data);
       if(data.message=='Username or password incorrect!'){
        mensajeDiv.innerHTML="Usuario o contraseña incorrecta";
        mensajeDiv.style.color="red";
       }
       else{
        mensajeDiv.innerHTML="¡Inicio de sesión exitoso!";
        mensajeDiv.style.color="green";

        localStorage.setItem('token', data.token);
        localStorage.setItem('rol', data.user.rol);
        localStorage.setItem('user',JSON.stringify(data.user));
        localStorage.setItem('isLogged', true);
        setTimeout(() => {
              window.location.href = './index.html';
          }, 2000);}
        
       })

   })


