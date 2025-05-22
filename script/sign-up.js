const btnRegistrar=document.getElementById('btnRegistrar');
const mensajeDiv=document.getElementById("mensaje");

btnRegistrar.addEventListener("click", function(){
    let nombre=document.getElementById('inputName').value;
    let correo=document.getElementById('inputEmail').value;
    let contraseña=document.getElementById('inputPassword').value;
    let contraseña2=document.getElementById('inputConfirmPassword').value;
    if(nombre=='' || correo=='' || contraseña=='' || contraseña2==''){
        alert("Todos los campos son obligatorios");
    }else if(contraseña!=contraseña2){
        alert("Las contraseñas no coinciden");}

    console.log(nombre, correo, contraseña, contraseña2);
    fetch('http://localhost:3000/api/users/sign-up',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: nombre,
            email: correo,
            password: contraseña,
            password_repeat: contraseña2,
            rol:"cliente"
        })
    })
    .then(response => response.json())
   .then(data => {
       console.log(data);
       if(data.message=='Registered!'){
        mensajeDiv.innerHTML=data.message;
        mensajeDiv.style.color="green";
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
       }
       else{
        mensajeDiv.innerHTML="¡Registrado con éxito!";
        mensajeDiv.style.color="red";
       }
   })


});