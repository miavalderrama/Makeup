
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

    const correo = document.getElementById('correoLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const datosLogin = {
        correo: correo,
        password: password
    };

    try {

        const response = await fetch('https://makeup-dpl7.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosLogin)
        });

        const data = await response.json();
        if (response.ok) {

            resultadoDiv.style.borderColor = '#4caf50';
            resultadoDiv.style.backgroundColor = '#e8f5e9';
            resultadoDiv.innerHTML = `
                <p><strong>¡Inicio de sesión exitoso!</strong></p>
                <p>Bienvenido/a: <strong>${data.nombre}</strong></p>
                <p>Redireccionando a tus recomendaciones...</p>
            `;
            setTimeout(() => {
                sessionStorage.setItem('userProfile', JSON.stringify(data.perfil));
                window.location.href = "recomendaciones.html"; 
            }, 1500);

        } else {
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
            <p>El servicio de Render no está disponible.</p>
            <p>URL de la API: <code>https://makeup-dpl7.onrender.com</code></p>
        `;
        console.error('Error de fetch:', error);
    }

    resultadoDiv.style.display = 'block';
}