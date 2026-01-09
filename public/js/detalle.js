// 1. CONFIGURACIÓN GLOBAL (Estas variables las ven todas las funciones)
const API_BASE = 'https://makeup-dpl7.onrender.com/api';
const API_PRODUCTO_BASE = 'https://makeup-dpl7.onrender.com/api/productos';
const productoId = localStorage.getItem('productoIdDetalle');

// 2. FUNCIÓN PARA CARGAR EL DETALLE DEL PRODUCTO
async function cargarDetalle() {
    const detalleDiv = document.getElementById('detalleProducto');
    
    if (!productoId) {
        detalleDiv.innerHTML = '<p class="text-red-500 p-4 font-bold">❌ Error: No se encontró el ID del producto.</p>';
        return;
    }

    detalleDiv.innerHTML = '<p class="text-center text-xl text-rose-500 font-semibold animate-pulse">Cargando detalles premium...</p>';

    try {
        const response = await fetch(`${API_PRODUCTO_BASE}/${productoId}`);
        if (!response.ok) {
            detalleDiv.innerHTML = `<p class="text-red-500 p-4">❌ El producto no está disponible en este momento.</p>`;
            return;
        }

        const p = await response.json();
        const descripcion = p.description || 'Este producto no cuenta con una descripción detallada todavía.';

        // Renderizado del HTML con tu diseño
        detalleDiv.innerHTML = `
            <div class="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <button onclick="window.location.href='recomendaciones.html'"
                        class="mb-6 text-gray-500 hover:text-rose-600 font-medium transition flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    Volver al Catálogo
                </button>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div class="lg:col-span-1 flex justify-center items-start bg-gray-50 p-6 rounded-xl shadow-inner">
                        <img src="${p.image_link ? p.image_link.replace('http://', 'https://') : 'placeholder_image.jpg'}"
                             alt="${p.name}" class="w-full max-h-[500px] object-contain rounded-lg shadow-xl transition hover:scale-105">
                    </div>

                    <div class="lg:col-span-2">
                        <span class="inline-block bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase mb-2">
                            ${p.product_type ? p.product_type.replace(/_/g, ' ') : 'Cosmético'}
                        </span>
                        <h1 class="text-4xl font-extrabold text-gray-900 mb-2">${p.name}</h1>
                        <h2 class="text-xl text-gray-600 mb-6 pb-4 border-b">
                            Marca: <span class="text-rose-700 font-bold">${p.brand || 'Original'}</span>
                        </h2>

                        <div class="mb-6">
                            <h3 class="text-2xl font-bold text-gray-800 mb-3">Descripción</h3>
                            <p class="text-gray-700 leading-relaxed">${descripcion}</p>
                        </div>

                        ${p.look_recomendado ? `
                            <div class="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
                                <h3 class="text-xl font-bold text-purple-700 mb-2">✨ Tutorial: ${p.look_recomendado.titulo}</h3>
                                <p class="text-sm text-gray-600 mb-4 italic">${p.look_recomendado.descripcion}</p>
                                <ol class="list-decimal list-inside space-y-1 text-gray-800 text-sm">
                                    ${p.look_recomendado.pasos.map(paso => `<li>${paso}</li>`).join('')}
                                </ol>
                            </div>
                        ` : ''}

                        ${p.product_colors && p.product_colors.length > 0 ? `
                            <div class="mt-8">
                                <h3 class="text-lg font-bold text-gray-800 mb-4">Tonos Disponibles</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${p.product_colors.map(color => `
                                        <div style="background-color: ${color.hex_value};" title="${color.colour_name}"
                                             class="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200"></div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="mt-12 p-6 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center">
                            <div>
                                <p class="text-gray-500 text-sm">Precio estimado</p>
                                <p class="text-4xl font-black text-rose-600">${p.price ? `${p.price_sign || '$'}${p.price}` : 'Consultar'}</p>
                            </div>
                            <a href="${p.product_link}" target="_blank" class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105">
                                🛒 Comprar Ahora
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        detalleDiv.innerHTML = `<p class="p-4 bg-red-100 text-red-700 rounded-lg">Error al conectar con el servidor.</p>`;
    }
}

// 3. FUNCIÓN PARA ENVIAR RESEÑA
async function enviarResena() {
    const calificacion = document.getElementById('rating').value;
    const comentario = document.getElementById('comentario').value;
    const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario Invitado';
    const msg = document.getElementById('msgResena');
    const btn = document.querySelector("button[onclick='enviarResena()']");

    // 1. Validar que haya comentario
    if (!comentario.trim()) {
        msg.className = "text-center text-sm mt-2 text-red-500 font-semibold";
        msg.textContent = "⚠️ Por favor, escribe un comentario.";
        return; // Aquí salimos si está vacío
    }

    // 2. Estado visual de carga
    btn.innerText = "Enviando...";
    btn.disabled = true;
    msg.textContent = ""; 

    const datosResena = {
        producto_id: productoId,
        usuario_nombre: nombreUsuario,
        calificacion: parseInt(calificacion),
        comentario: comentario
    };

    try {
        const response = await fetch(`${API_BASE}/resenas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosResena)
        });

        if (response.ok) {
            msg.className = "text-center text-sm mt-2 text-green-600 font-bold";
            msg.textContent = "✅ ¡Reseña publicada con éxito!";
            document.getElementById('comentario').value = ""; // Limpiar el campo
            cargarResenas(); // Recargar la lista
        } else {
            msg.className = "text-center text-sm mt-2 text-red-500 font-semibold";
            msg.textContent = "❌ Error al publicar la reseña.";
        }
    } catch (error) {
        console.error("Error al enviar reseña:", error);
        msg.textContent = "❌ Error de conexión con el servidor.";
    } finally {
        // 3. REGRESAR EL BOTÓN A SU ESTADO NORMAL (Pase lo que pase)
        btn.innerText = "Publicar Reseña";
        btn.disabled = false;
        btn.classList.add("bg-rose-500", "text-white"); 
    }
}

// 4. FUNCIÓN PARA CARGAR RESEÑAS
async function cargarResenas() {
    const lista = document.getElementById('listaResenas');
    if (!productoId) return;

    try {
        const response = await fetch(`${API_BASE}/resenas/${productoId}`);
        const resenas = await response.json();

        if (resenas.length > 0) {
            lista.innerHTML = resenas.map(r => `
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-gray-700">${r.usuario_nombre}</span>
                        <span class="text-yellow-500 text-xs">${"⭐".repeat(r.calificacion)}</span>
                    </div>
                    <p class="text-gray-600 text-sm italic">"${r.comentario}"</p>
                    <span class="text-[10px] text-gray-400 uppercase mt-2 block italic">
                        ${new Date(r.fecha_creacion).toLocaleDateString()}
                    </span>
                </div>
            `).join('');
        } else {
            lista.innerHTML = '<p class="text-gray-400 italic text-center py-4">Aún no hay reseñas. ¡Sé el primero en opinar!</p>';
        }
    } catch (error) {
        console.error("Error cargando reseñas:", error);
    }
}

// 5. INICIO DE LA PÁGINA (Se ejecutan ambas al cargar)
document.addEventListener('DOMContentLoaded', () => {
    cargarDetalle();
    cargarResenas();
});