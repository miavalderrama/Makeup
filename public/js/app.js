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
    resultadoDiv.classList.remove('hidden', 'border-green-400', 'bg-green-50', 'text-green-700', 
                                  'border-red-400', 'bg-red-50', 'text-red-700', 
                                  'border-amber-400', 'bg-amber-50', 'text-amber-700');
    
    if (type === 'success') {
        resultadoDiv.classList.add('border-green-400', 'bg-green-50', 'text-green-700');
    } else if (type === 'error') {
        resultadoDiv.classList.add('border-red-400', 'bg-red-50', 'text-red-700');
    } else if (type === 'warning') { 
        resultadoDiv.classList.add('border-amber-400', 'bg-amber-50', 'text-amber-700');
    }

    resultadoDiv.innerHTML = content;
    resultadoDiv.classList.remove('hidden');
}


async function manejarEnvioRegistro(event) {
    event.preventDefault(); 

    const form = document.getElementById('encuestaPielForm');
    const resultadoDiv = document.getElementById('resultadoPerfil');
    resultadoDiv.classList.add('hidden'); 

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value; 
    const tipoPiel = document.getElementById('tipoPiel').value;
    const subtonoPiel = document.getElementById('subtonoPiel').value;
    const nivelTono = document.getElementById('nivelTono').value;
    const datosRegistro = { nombre, correo, password, tipoPiel, subtonoPiel, nivelTono };

    try {
const response = await fetch('https://makeup-dpl7.onrender.com/api/registro', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosRegistro)
});

        const data = await response.json(); 
        if (response.ok) {
            const successContent = `
                <p class="font-bold">✅ ¡Registro exitoso!</p>
                <p>Bienvenido/a: <span class="font-semibold">${datosRegistro.nombre}</span></p>
                <p>Perfil Guardado: ${datosRegistro.tipoPiel}, ${datosRegistro.subtonoPiel}, ${datosRegistro.nivelTono}</p>
                <p class="mt-2">🎉 Redireccionando a las recomendaciones en 3 segundos...</p>
            `;
            const perfilParaFiltro = {
                tipoPiel: datosRegistro.tipoPiel,
                nivelTono: datosRegistro.nivelTono,
                subtonoPiel: datosRegistro.subtonoPiel
            };
            sessionStorage.setItem('userProfile', JSON.stringify(perfilParaFiltro));
            localStorage.setItem('nombreUsuario', datosRegistro.nombre);
            actualizarResultado('success', successContent);
            
            setTimeout(() => {
                window.location.href = "recomendaciones.html"; 
            }, 3000);
        }else {
            const errorContent = `
                <p class="font-bold">❌ Error al registrar:</p>
                <p>${data.error || 'Ocurrió un error desconocido en el servidor.'}</p>
                <p class="mt-1 text-sm">Por favor, revisa tus datos e inténtalo de nuevo.</p>
            `;
            actualizarResultado('error', errorContent);
        }

    } catch (error) {
        const warningContent = `
            <p class="font-bold">⚠️ Error de Conexión:</p>
            <p>Asegúrate de que el servidor Express esté corriendo en <code>http://localhost:3000</code>.</p>
        `;
        actualizarResultado('warning', warningContent);
        console.error('Error de fetch:', error);
    }
}