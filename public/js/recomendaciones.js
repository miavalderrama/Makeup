// recomendaciones.js (VERSIÓN MEJORADA)

// URL base de tu servidor Express
const API_BASE = 'http://localhost:3000/api';

// =================================================================
// ESTRUCTURA GLOBAL PARA CONTEO REACTIVO DE FALLOS (CRUCIAL)
// =================================================================
// Almacena el número inicial de productos válidos y los IDs de los contenedores
const marcaStatus = {};

/**
 * Función que se ejecuta cuando una imagen falla (onerror).
 * Decrementa el contador visible y oculta la marca si llega a cero.
 * @param {string} safeMarca - El nombre de la marca (sanitizado)
 * @param {string} containerId - El ID del contenedor de la marca
 */
function ajustarContadorFallido(safeMarca) {
    if (marcaStatus[safeMarca]) {
        // 1. Decrementar el contador visible
        marcaStatus[safeMarca].count--;
        
        const encabezado = document.getElementById(marcaStatus[safeMarca].headerId);
        const contenedor = document.getElementById(marcaStatus[safeMarca].containerId);
        
        if (encabezado) {
            // 2. Actualizar el texto del encabezado en tiempo real
            encabezado.textContent = `Marca: ${marcaStatus[safeMarca].marca} (${marcaStatus[safeMarca].count} productos)`;
        }

        if (marcaStatus[safeMarca].count <= 0 && contenedor) {
            // 3. Ocultar la sección COMPLETA de la marca si no quedan productos visibles
            contenedor.style.display = 'none';
        }
    }
}


// =================================================================
// LÓGICA 1: CARGA DEL CATÁLOGO GENERAL (Agrupado por Marcas)
// =================================================================

/**
 * Llama a la ruta /catalogo, agrupa los productos por marca y los renderiza.
 */
async function cargarFeedGeneral() {
    const catalogoGeneralDiv = document.getElementById('catalogoGeneral');
    // Mejoramos el placeholder de carga
    catalogoGeneralDiv.innerHTML = '<div class="p-6 text-center"><span class="animate-pulse text-xl text-rose-500 font-semibold">✨ Cargando las mejores recomendaciones...</span></div>';
    
    // Limpiamos el estado global antes de una nueva carga
    Object.keys(marcaStatus).forEach(key => delete marcaStatus[key]);
    
    try {
        const response = await fetch(`${API_BASE}/productos/catalogo`);
        if (!response.ok) {
            catalogoGeneralDiv.innerHTML = `<p class="text-red-500 p-4">❌ Error de Conexión: ${response.statusText}. Asegúrate de que server.js esté corriendo.</p>`;
            return;
        }
        const productos = await response.json();
        
        // 1. Limpiar y Corregir HTTPS en el Cliente (Filtro inicial de links inválidos)
        const productosViables = productos
            .filter(p => p.image_link && p.image_link.startsWith('http'))
            .map(p => ({
                ...p, 
                image_link: p.image_link.replace('http://', 'https://') 
            }));

        // 2. Agrupar productos POR MARCA (usando solo los viables)
        const productosPorMarca = productosViables.reduce((acc, producto) => {
            const marca = producto.brand || 'Sin Marca';
            if (!acc[marca]) {
                acc[marca] = [];
            }
            acc[marca].push(producto);
            return acc;
        }, {});
        
        // 3. Renderizar y Preparar el Estado Reactivo
        let htmlContent = '';
        for (const marca in productosPorMarca) {
            const productosDeMarca = productosPorMarca[marca].slice(0, 5); // Tomamos máximo 5
            
            if (productosDeMarca.length > 0) {
                // Generamos IDs únicos y amigables con el DOM
                const safeMarca = marca.replace(/[^a-zA-Z0-9]/g, '_');
                const headerId = `header-${safeMarca}`; 
                const containerId = `container-${safeMarca}`;

                // Inicializamos el estado de conteo de esta marca con el valor teórico (máx. 5)
                marcaStatus[safeMarca] = {
                    marca: marca,
                    count: productosDeMarca.length,
                    headerId: headerId,
                    containerId: containerId
                };

                // ESTILO HERMOSO 1: SECCIÓN DE MARCA (MEJORADO)
                // Usamos border-l-8 y p-8 para un estilo de bloque más elegante.
                htmlContent += `<div class="seccion-marca my-12 p-8 bg-white rounded-2xl shadow-xl border-l-8 border-rose-500 transition-all duration-500" id="${containerId}">`;
                
                // ESTILO HERMOSO 2: ENCABEZADO DE MARCA (Color ROSE y tamaño grande)
                htmlContent += `<h3 id="${headerId}" class="text-3xl font-extrabold text-rose-600 mb-6 pb-2 uppercase tracking-wide">✨ ${marca} (${productosDeMarca.length} productos)</h3>`;
                
                // CONTENEDOR DE CARRUSEL HORIZONTAL
                // scrollbar-hide (si se usa un plugin) o personalización de scrollbar (como ya tenías)
                htmlContent += `<div class="flex space-x-6 pb-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-gray-100">`;

                // Renderiza los productos
                productosDeMarca.forEach(p => {
                    // Pasamos el safeMarca a renderProducto para el manejo de fallos
                    htmlContent += renderProducto(p, safeMarca, 'horizontal'); 
                });
                
                htmlContent += `</div></div>`;
            }
        }

        catalogoGeneralDiv.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error al cargar el catálogo general:', error);
        catalogoGeneralDiv.innerHTML = `<p class="text-red-500 p-4">❌ Error al cargar el catálogo: ${error.message}</p>`;
    }
}


// =================================================================
// LÓGICA 2: FILTRO INTELIGENTE (Simulación de IA)
// =================================================================

/**
 * Obtiene las selecciones del usuario y llama a la API con la lógica de filtrado.
 */
/**
 * Versión automática del filtro que toma los datos del perfil guardado.
 */
async function activarFiltroInteligenteAutomatico() {
    const perfilString = sessionStorage.getItem('userProfile');
    
    if (!perfilString) {
        // Esto no debería pasar si se mostró el botón, pero es buena práctica.
        document.getElementById('productosFiltrados').querySelector('p').textContent = '⚠️ Error: No se encontraron datos de perfil en la sesión.';
        return;
    }

    const perfil = JSON.parse(perfilString);
    const tipoPiel = perfil.tipoPiel;
    const nivelTono = perfil.nivelTono;
    const productosFiltradosDiv = document.getElementById('productosFiltrados');

    // Muestra el mensaje de carga mientras se llama a la API
    productosFiltradosDiv.innerHTML = `<h3 class="text-2xl font-bold text-rose-600 mb-3">Resultados de Filtro Inteligente</h3><p class="text-gray-600">🔎 Analizando Perfil ${tipoPiel} y Tono ${nivelTono}...</p>`;
    
    try {
        // Llamada a la misma ruta en server.js: /api/productos/filtrado
        const url = `${API_BASE}/productos/filtrado?tipoPiel=${tipoPiel}&nivelTono=${nivelTono}`;
        const response = await fetch(url);
        
        // El resto de la lógica de renderizado puede ser igual a la anterior:

        if (!response.ok) {
            const errorData = await response.json();
            productosFiltradosDiv.innerHTML = `<h3 class="text-red-600">❌ Error en el Filtro</h3><p class="text-red-500">${errorData.error}</p>`;
            return;
        }

        const data = await response.json();
        const productos = data.productos;

        let htmlContent = `<h3 class="text-2xl font-bold text-rose-600 mb-4">Tus recomendaciones</h3>`;
        
        if (productos.length === 0) {
            htmlContent += '<div class="p-8 bg-gray-50 rounded-lg text-center"><p class="text-lg text-gray-500">Lo sentimos, no encontramos coincidencias estrictas. Intenta con otra combinación.</p></div>';
        } else {
            htmlContent += `<p class="text-lg text-green-600 mb-6 font-medium">✅ Éxito: Encontramos **${productos.length}** recomendaciones de alta calidad:</p>`;
            
            // CONTENEDOR GRID PARA EL FILTRO INTELIGENTE
            htmlContent += `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">`;
            productos.forEach(p => {
                htmlContent += renderProducto(p, null, 'grid'); 
            });
            htmlContent += `</div>`; // Cierra el grid
        }
        
        productosFiltradosDiv.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error en el filtro inteligente automático:', error);
        productosFiltradosDiv.innerHTML = `<h3 class="text-red-600">❌ Error de Conexión</h3><p class="text-red-500">No se pudo contactar al servidor: ${error.message}</p>`;
    }
}

// =================================================================
// FUNCIÓN AUXILIAR DE RENDERIZADO (ESTILO DIVINO DE TARJETA)
// =================================================================
/**
 * Rendersiza una tarjeta de producto con dos posibles estilos de layout.
 * @param {object} p - Objeto del producto.
 * @param {string | null} safeMarca - Marca segura para manejo de fallos.
 * @param {'horizontal' | 'grid'} layout - Estilo de layout (carrusel o cuadrícula).
 */
function renderProducto(p, safeMarca = null, layout = 'grid') {
    
    let imageUrl = p.image_link; 
    
    // --- Lógica de Manejo de Imagenes Fallidas ---
    if (!imageUrl) {
        // Asumiendo que 'marcaStatus' y 'ajustarContadorFallido' están definidos globalmente en el archivo completo
        if (safeMarca && typeof marcaStatus !== 'undefined' && marcaStatus[safeMarca]) {
            ajustarContadorFallido(safeMarca);
        }
        return ''; 
    }

    // Acción para el evento 'onerror' de la imagen
    const onerrorAction = safeMarca 
        ? `this.closest('.producto').style.display='none'; ajustarContadorFallido('${safeMarca}');`
        : `this.closest('.producto').style.display='none';`; 
    
    // Configuración de layout
    const layoutClasses = layout === 'horizontal' 
        ? 'w-64 flex-shrink-0' // Fijo para el carrusel
        : 'w-full';  // Flexible para la cuadrícula
    
    // Generamos el chip de tipo de producto
    const productTypeChip = p.product_type 
        ? `<span class="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">${p.product_type.replace(/_/g, ' ')}</span>`
        : '';
    
    // **CORRECCIÓN CLAVE:** Define la acción de clic para el div.
    const clickAction = `verDetalleProducto('${p.id}')`; 

    // CLASES DE TAILWIND PARA LA TARJETA DEL PRODUCTO
    return `
        <div class="producto bg-white border border-gray-100 p-4 rounded-xl shadow-md 
                     hover:shadow-xl transition-all duration-300 transform hover:scale-[1.05] 
                     flex flex-col text-left overflow-hidden cursor-pointer group ${layoutClasses}" 
                     
                     onclick="${clickAction}"> 
                     
            <div class="w-full h-40 object-contain mb-3 rounded-lg bg-gray-100 p-2 overflow-hidden flex items-center justify-center">
                <img src="${imageUrl}" alt="${p.name || 'Producto sin nombre'}" 
                    class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    onerror="${onerrorAction}">
            </div>
            
            <div class="flex flex-col w-full">
                
                <strong class="text-lg font-bold text-gray-800 leading-tight line-clamp-2 mb-1">
                    ${p.name || 'Nombre no disponible'}
                </strong>
                
                ${productTypeChip}

                <span class="text-xs text-gray-500 mt-2">
                    Marca: <span class="font-bold text-gray-700">${p.brand || 'Desconocida'}</span>
                </span>
                
                <p class="text-2xl font-extrabold text-rose-500 mt-2">
                    ${p.price ? `${p.price_sign || '$'}${p.price}` : 'Precio N/A'}
                </p>
                
                <p class="text-xs text-gray-400 mt-2 italic line-clamp-2">
                    ${p.description ? p.description.substring(0, 70).replace(/\s+/g, ' ') + '...' : 'Sin descripción detallada.'}
                </p>
            </div>
        </div>
    `;
}

// =================================================================
// FUNCIÓN DE NAVEGACIÓN A DETALLE (¡Nueva y necesaria!)
// Se debe hacer accesible en el ámbito global (window)
// =================================================================

/**
 * Guarda el ID del producto y navega a la página de detalle.
 * @param {number} productId - El ID único del producto.
 */
function verDetalleProducto(productId) {
    if (productId) {
        // 1. Guardar el ID en localStorage para que la página de destino lo lea.
        localStorage.setItem('productoIdDetalle', productId);
        
        // 2. Redirigir a la nueva página de detalle.
        // Asegúrate de que tengas un archivo llamado 'detalle.html' en tu carpeta 'public'.
        window.location.href = 'detalle.html'; 
    } else {
        console.error('Error: ID de producto no válido para la navegación.');
    }
}
// Hacemos la función accesible globalmente para que funcione con el 'onclick' del HTML
window.verDetalleProducto = verDetalleProducto;
async function cargarOpcionesFiltro() {
    const contenedorFiltro = document.getElementById('contenedorFiltro');
    
    // 1. Intentamos obtener el perfil del usuario de sessionStorage
    const perfilString = sessionStorage.getItem('userProfile');
    
    if (perfilString) {
        // PERFIL ENCONTRADO: Tomaremos los datos de aquí, no de los select.
        const perfil = JSON.parse(perfilString);
        
        // 2. Creamos el HTML que SÓLO contiene el botón (y un mensaje de bienvenida)
        let htmlContenido = `
            <div class="flex items-center justify-between w-full p-3 bg-rose-50 border border-rose-200 rounded-lg sm:p-4 mb-4">
                <p class="text-sm font-medium text-gray-700 sm:text-lg">
                    Recomendaciones para TI y solo para TI
                </p>
                <button id="botonFiltroInteligente" class="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap text-sm sm:text-base">
                    ✨ Aplicar Mi Filtro Inteligente
                </button>
            </div>
        `;

        // 3. Inyectamos el contenido
        contenedorFiltro.innerHTML = htmlContenido;
        
        // 4. Adjuntar el evento al botón recién creado
        document.getElementById('botonFiltroInteligente').addEventListener('click', activarFiltroInteligenteAutomatico);

    } else {
        // PERFIL NO ENCONTRADO: Mostramos un mensaje de advertencia
        contenedorFiltro.innerHTML = `
            <p class="text-red-500 p-3 bg-red-100 rounded-lg w-full">
                ⚠️ No se encontró la sesión del usuario. Por favor, inicia sesión para usar el filtro inteligente.
            </p>`;
    }
}
/**
 * Controla el desplazamiento horizontal de un carrusel dado su ID.
 * Esta función es llamada por los botones 'onclick' en recomendaciones.html.
 * @param {string} carouselId - El ID del contenedor que tiene el overflow-x-hidden.
 * @param {number} scrollAmount - La cantidad de píxeles a desplazar (ej. 300 para derecha, -300 para izquierda).
 */
function scrollCarousel(carouselId, scrollAmount) {
    // Obtenemos el contenedor que tiene la lista real de productos
    const listContainer = document.getElementById(carouselId.replace('carrusel-', 'lista-productos-'));

    if (listContainer) {
        // Usamos scrollBy para moverlo desde su posición actual.
        // La clase scroll-smooth en el HTML hace la animación.
        listContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth' 
        });
    }
}
// =================================================================
// FUNCIÓN DE NAVEGACIÓN A DETALLE
// =================================================================

/**
 * Guarda el ID del producto y navega a la página de detalle.
 * @param {number} productId - El ID único del producto.
 */
function verDetalleProducto(productId) {
    if (productId) {
        // 1. Guardar el ID en localStorage (o sessionStorage)
        localStorage.setItem('productoIdDetalle', productId);
        
        // 2. Redirigir a la nueva página de detalle
        // Asegúrate de que este archivo HTML exista en tu carpeta 'public'
        window.location.href = 'detalle.html'; 
    } else {
        console.error('Error: ID de producto no válido para la navegación.');
    }
}
// =================================================================
// INICIALIZACIÓN FINAL: SOLO UN EVENT LISTENER
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hacemos la función del carrusel accesible globalmente (si la usas)
    // window.scrollCarousel = scrollCarousel; 
    
    // 2. Cargar el catálogo general inmediatamente
    cargarFeedGeneral(); 
    
    // 3. ¡NUEVO! Cargar las opciones de filtro dinámicamente
    cargarOpcionesFiltro();
    
    // NOTA: El evento 'click' al botón se adjunta dentro de cargarOpcionesFiltro()
});
