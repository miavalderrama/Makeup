/**
 * app.js
 * Lógica principal de la aplicación: maneja el envío del formulario de registro
 * y la comunicación con el servidor (backend).
 */

const API_REGISTRO_URL = 'http://localhost:3000/api/registro';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('encuestaPielForm');

    if (form) {
        form.addEventListener('submit', manejarEnvioRegistro);
    }
});

/**
 * Función auxiliar para actualizar el estilo y contenido del div de resultados
 * usando clases de Tailwind (coherente con index.html).
 * @param {'success' | 'error' | 'warning'} type 
 * @param {string} content 
 */
function actualizarResultado(type, content) {
    const resultadoDiv = document.getElementById('resultadoPerfil');
    
    // 1. Limpiar clases anteriores
    resultadoDiv.classList.remove('hidden', 'border-green-400', 'bg-green-50', 'text-green-700', 
                                  'border-red-400', 'bg-red-50', 'text-red-700', 
                                  'border-amber-400', 'bg-amber-50', 'text-amber-700');
    
    // 2. Aplicar clases de Tailwind según el tipo de mensaje
    if (type === 'success') {
        resultadoDiv.classList.add('border-green-400', 'bg-green-50', 'text-green-700');
    } else if (type === 'error') {
        resultadoDiv.classList.add('border-red-400', 'bg-red-50', 'text-red-700');
    } else if (type === 'warning') { // Para errores de conexión
        resultadoDiv.classList.add('border-amber-400', 'bg-amber-50', 'text-amber-700');
    }

    // 3. Insertar contenido y mostrar
    resultadoDiv.innerHTML = content;
    resultadoDiv.classList.remove('hidden');
}


async function manejarEnvioRegistro(event) {
    event.preventDefault(); 

    const form = document.getElementById('encuestaPielForm');
    const resultadoDiv = document.getElementById('resultadoPerfil');
    resultadoDiv.classList.add('hidden'); // Ocultar resultados anteriores

    // 1. Capturar los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value; 
    const tipoPiel = document.getElementById('tipoPiel').value;
    const subtonoPiel = document.getElementById('subtonoPiel').value;
    const nivelTono = document.getElementById('nivelTono').value;

    // 2. Crear el objeto de datos
    const datosRegistro = { nombre, correo, password, tipoPiel, subtonoPiel, nivelTono };

    try {
        // 3. Enviar los datos al servidor Express
        // CÁMBIALO A ESTO:
const response = await fetch('https://makeup-dpl7.onrender.com/api/registro', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosRegistro)
});

        const data = await response.json(); 

        // 4. Manejar la respuesta del servidor
        if (response.ok) {
    // Éxito (HTTP 201 Created)
    const successContent = `
        <p class="font-bold">✅ ¡Registro exitoso!</p>
        <p>Bienvenido/a: <span class="font-semibold">${datosRegistro.nombre}</span></p>
        <p>Perfil Guardado: ${datosRegistro.tipoPiel}, ${datosRegistro.subtonoPiel}, ${datosRegistro.nivelTono}</p>
        <p class="mt-2">🎉 Redireccionando a las recomendaciones en 3 segundos...</p>
    `;

    // 1. Creamos el objeto (como ya lo tenías)
    const datosUsuario = {
        nombre: datosRegistro.nombre, // Asegúrate de que se llame así en tu código
        perfil: {
            tipoPiel: datosRegistro.tipoPiel,
            nivelTono: datosRegistro.nivelTono,
            subtonoPiel: datosRegistro.subtonoPiel
        }
    };

    sessionStorage.setItem('userProfile', JSON.stringify(perfilParaFiltro));


    actualizarResultado('success', successContent);
    
    // Redirigir al usuario después de 3 segundos
    setTimeout(() => {
        window.location.href = "recomendaciones.html"; 
    }, 3000);
}else {
            // Error de la API (ej: correo duplicado, datos faltantes)
            const errorContent = `
                <p class="font-bold">❌ Error al registrar:</p>
                <p>${data.error || 'Ocurrió un error desconocido en el servidor.'}</p>
                <p class="mt-1 text-sm">Por favor, revisa tus datos e inténtalo de nuevo.</p>
            `;
            actualizarResultado('error', errorContent);
        }

    } catch (error) {
        // Error de red (el servidor no responde o no está corriendo)
        const warningContent = `
            <p class="font-bold">⚠️ Error de Conexión:</p>
            <p>Asegúrate de que el servidor Express esté corriendo en <code>http://localhost:3000</code>.</p>
        `;
        actualizarResultado('warning', warningContent);
        console.error('Error de fetch:', error);
    }
}