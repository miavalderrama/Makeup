// detalle.js (Versión Estilizada)



const API_PRODUCTO_BASE = 'https://makeup-dpl7.onrender.com/api/productos';



async function cargarDetalle() {

    // 1. Obtener el ID que guardamos en la página anterior

    const productId = localStorage.getItem('productoIdDetalle');

    const detalleDiv = document.getElementById('detalleProducto');



    if (!productId) {

        detalleDiv.innerHTML = '<p class="text-red-500 p-4">❌ No se especificó el ID del producto.</p>';

        return;

    }



    detalleDiv.innerHTML = '<p class="text-center text-xl text-rose-500 font-semibold">Cargando detalle...</p>';



    try {

        // 2. Llamada al nuevo endpoint de tu servidor

        const response = await fetch(`${API_PRODUCTO_BASE}/${productId}`);

       

        if (!response.ok) {

            const error = await response.json();

            detalleDiv.innerHTML = `<p class="text-red-500 p-4">❌ Error: ${error.error || 'Producto no disponible'}</p>`;

            return;

        }



        const p = await response.json();

       

        // Revertimos la lógica de traducción (según tu última petición)

        const descripcion = p.description || 'No hay una descripción detallada para este producto.';



        // --- Generación del HTML con Diseño Mejorado ---



        let htmlContent = `

            <div class="bg-white p-8 rounded-2xl shadow-2xl">

               

                <button onclick="window.location.href='recomendaciones.html'"

                        class="mb-6 text-gray-500 hover:text-rose-600 font-medium transition duration-200 flex items-center">

                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>

                    Volver al Catálogo

                </button>



                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

                   

                                        <div class="lg:col-span-1 flex justify-center items-start bg-gray-50 p-6 rounded-xl shadow-inner">

                        <img src="${p.image_link ? p.image_link.replace('http://', 'https://') : 'placeholder_image.jpg'}"

                             alt="${p.name}" class="w-full max-h-[500px] object-contain rounded-lg shadow-xl transition duration-500 hover:scale-[1.02]">

                    </div>

                   

                                        <div class="lg:col-span-2">

       

        <span class="inline-block bg-pink-500 text-white text-xs font-semibold tracking-wider px-3 py-1 rounded-full uppercase mb-2 shadow-md">

            ${p.product_type ? p.product_type.replace(/_/g, ' ') : 'General'}

        </span>

       

        <h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">${p.name || 'Producto sin nombre'}</h1>

        <h2 class="text-xl font-medium text-gray-600 mb-6 border-b pb-4">

            Marca: <span class="text-rose-700 font-bold hover:text-rose-800 transition duration-200">${p.brand || 'Desconocida'}</span>

        </h2>

       

        <div class="mb-6">

            <h3 class="text-2xl font-bold text-gray-800 mb-3">Descripción</h3>

            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${descripcion}</p>

        </div>

       

                ${p.look_recomendado ? `

            <div class="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-md">

                <h3 class="text-2xl font-extrabold text-purple-700 mb-2 flex items-center">

                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.871a.75.75 0 01.055 1.052L5.8 9.947a.75.75 0 00-.28 1.157l5.424 7.228a.75.75 0 01-1.127.95L4.414 11.5a.75.75 0 00-.73-.557l-1.025-.138a.75.75 0 01-.645-1.048L3.266 5.864a.75.75 0 01.761-.53l1.173.18a.75.75 0 00.73-.557l5.424-7.228a.75.75 0 011.052-.055z"></path></svg>

                    ¡Tutorial de Look: ${p.look_recomendado.titulo || 'Recomendado'}!

                </h3>

                <p class="text-gray-700 italic mb-4">${p.look_recomendado.descripcion || 'Sigue los pasos para un look ideal.'}</p>

               

                <h4 class="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Pasos para la Aplicación:</h4>

                <ol class="list-decimal list-inside space-y-2 text-gray-800">

                    ${p.look_recomendado.pasos && Array.isArray(p.look_recomendado.pasos) ? p.look_recomendado.pasos.map((paso, index) => `

                        <li class="${paso.includes('Clave') || paso.includes('CLAVE') ? 'font-bold text-rose-600' : 'font-normal'}">

                            ${paso}

                        </li>

                    `).join('') : '<li>No hay pasos detallados disponibles.</li>'}

                </ol>

            </div>

        ` : ''}



                ${p.product_colors && p.product_colors.length > 0 ? `

            <div class="mt-8">

                <h3 class="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Tonos Disponibles (${p.product_colors.length})</h3>

                <div class="flex flex-wrap gap-3">

                    ${p.product_colors.map(color => `

                        <span title="${color.colour_name}" style="background-color: ${color.hex_value};"

                              class="w-10 h-10 rounded-full border-2 border-white shadow-lg ring-2 ring-gray-300 transition duration-300 hover:ring-rose-500 cursor-pointer">

                        </span>

                    `).join('')}

                </div>

                <p class="text-sm text-gray-500 mt-2 italic">Hover sobre un tono para ver el nombre.</p>

            </div>

        ` : ''}

       

        <div class="mt-12 p-6 bg-rose-50 rounded-xl border border-rose-200 sticky bottom-0 lg:static shadow-inner">

            <p class="text-lg font-medium text-gray-600 mb-2">Precio sugerido:</p>

            <p class="text-6xl font-extrabold text-rose-600 mb-6 leading-none">

                ${p.price ? `${p.price_sign || '$'}${p.price}` : 'Precio N/A'}

            </p>

           

            <a href="${p.product_link || '#'}" target="_blank" class="w-full inline-block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-xl transition duration-300 transform hover:scale-[1.01]">

                🛒 Comprar en la Tienda Original

            </a>

        </div>



                    </div>

                </div>

            </div>

        `;



        detalleDiv.innerHTML = htmlContent;



    } catch (error) {

        console.error('Error al cargar el detalle:', error);

        detalleDiv.innerHTML = `<p class="text-red-500 p-4">❌ Error de conexión: ${error.message}</p>`;

    }

}



document.addEventListener('DOMContentLoaded', cargarDetalle);