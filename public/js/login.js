// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', manejarInicioSesion);
    }
});

async function manejarInicioSesion(event) {
    event.preventDefault(); 

    const resultadoDiv = document.getElementById('resultadoLogin');
    resultadoDiv.style.display = 'none';
    
    // 1. Capturar los valores
    const correo = document.getElementById('correoLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const datosLogin = {
        correo: correo,
        password: password
    };

    try {
        // 2. Llamada a la nueva ruta de API en server.js
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosLogin)
        });

        const data = await response.json();

        // 3. Manejar la respuesta
        if (response.ok) {
            // Éxito: El servidor nos confirma que la contraseña es correcta
            resultadoDiv.style.borderColor = '#4caf50';
            resultadoDiv.style.backgroundColor = '#e8f5e9';
            resultadoDiv.innerHTML = `
                <p><strong>¡Inicio de sesión exitoso!</strong></p>
                <p>Bienvenido/a: <strong>${data.nombre}</strong></p>
                <p>Redireccionando a tus recomendaciones...</p>
            `;
            
            // 4. Redirección
            // Aquí vamos a usar la información del perfil que el backend nos devuelve
            setTimeout(() => {
                // Para llevar el perfil a la siguiente pantalla (usaremos localStorage temporalmente)
                sessionStorage.setItem('userProfile', JSON.stringify(data.perfil));
                window.location.href = "recomendaciones.html"; 
            }, 1500);

        } else {
            // Error de autenticación (ej: 401 Unauthorized)
            resultadoDiv.style.borderColor = '#f44336';
            resultadoDiv.style.backgroundColor = '#ffebee';
            resultadoDiv.innerHTML = `
                <p><strong>Error:</strong> ${data.error || 'Credenciales incorrectas o usuario no encontrado.'}</p>
            `;
        }

    } catch (error) {
        resultadoDiv.style.borderColor = '#ff9800';
        resultadoDiv.style.backgroundColor = '#fff3e0';
        resultadoDiv.innerHTML = `
            <p><strong>Error de Conexión:</strong></p>
            <p>Asegúrate de que el servidor esté corriendo en <code>http://localhost:3000</code>.</p>
        `;
        console.error('Error de fetch:', error);
    }

    resultadoDiv.style.display = 'block';
}