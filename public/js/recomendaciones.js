const API_BASE = 'https://makeup-dpl7.onrender.com/api';
const marcaStatus = {};

/**
 * Función que se ejecuta cuando una imagen falla (onerror).
 * Decrementa el contador visible y oculta la marca si llega a cero.
 * @param {string} safeMarca - El nombre de la marca (sanitizado)
 * @param {string} containerId - El ID del contenedor de la marca
 */
function ajustarContadorFallido(safeMarca) {
    if (marcaStatus[safeMarca]) {
    marcaStatus[safeMarca].count--;
        
        const encabezado = document.getElementById(marcaStatus[safeMarca].headerId);
        const contenedor = document.getElementById(marcaStatus[safeMarca].containerId);
        
        if (encabezado) {
            encabezado.textContent = `Marca: ${marcaStatus[safeMarca].marca} (${marcaStatus[safeMarca].count} productos)`;
        }

        if (marcaStatus[safeMarca].count <= 0 && contenedor) {
            contenedor.style.display = 'none';
        }
    }
}

async function cargarFeedGeneral() {
    const catalogoGeneralDiv = document.getElementById('catalogoGeneral');
    catalogoGeneralDiv.innerHTML = '<div class="p-6 text-center"><span class="animate-pulse text-xl text-rose-500 font-semibold">✨ Cargando las mejores recomendaciones...</span></div>';
    Object.keys(marcaStatus).forEach(key => delete marcaStatus[key]);
    
    try {
        const response = await fetch(`${API_BASE}/productos/catalogo`);
        if (!response.ok) {
            catalogoGeneralDiv.innerHTML = `<p class="text-red-500 p-4">❌ Error de Conexión: ${response.statusText}. Asegúrate de que server.js esté corriendo.</p>`;
            return;
        }
        const productos = await response.json();
        const productosViables = productos
            .filter(p => p.image_link && p.image_link.startsWith('http'))
            .map(p => ({
                ...p, 
                image_link: p.image_link.replace('http://', 'https://') 
            }));
        const productosPorMarca = productosViables.reduce((acc, producto) => {
            const marca = producto.brand || 'Sin Marca';
            if (!acc[marca]) {
                acc[marca] = [];
            }
            acc[marca].push(producto);
            return acc;
        }, {});
        let htmlContent = '';
        for (const marca in productosPorMarca) {
            const productosDeMarca = productosPorMarca[marca].slice(0, 5); 
            
            if (productosDeMarca.length > 0) {
                const safeMarca = marca.replace(/[^a-zA-Z0-9]/g, '_');
                const headerId = `header-${safeMarca}`; 
                const containerId = `container-${safeMarca}`;
                marcaStatus[safeMarca] = {
                    marca: marca,
                    count: productosDeMarca.length,
                    headerId: headerId,
                    containerId: containerId
                };
                htmlContent += `<div class="seccion-marca my-12 p-8 bg-white rounded-2xl shadow-xl border-l-8 border-rose-500 transition-all duration-500" id="${containerId}">`;
                htmlContent += `<h3 id="${headerId}" class="text-3xl font-extrabold text-rose-600 mb-6 pb-2 uppercase tracking-wide">✨ ${marca} (${productosDeMarca.length} productos)</h3>`;
                htmlContent += `<div class="flex space-x-6 pb-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-gray-100">`;
                productosDeMarca.forEach(p => {
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

async function activarFiltroInteligenteAutomatico() {
    const perfilString = sessionStorage.getItem('userProfile');
    
    if (!perfilString) {
        document.getElementById('productosFiltrados').querySelector('p').textContent = '⚠️ Error: No se encontraron datos de perfil en la sesión.';
        return;
    }

    const perfil = JSON.parse(perfilString);
    const tipoPiel = perfil.tipoPiel;
    const nivelTono = perfil.nivelTono;
    const productosFiltradosDiv = document.getElementById('productosFiltrados');
    productosFiltradosDiv.innerHTML = `<h3 class="text-2xl font-bold text-rose-600 mb-3">Resultados de Filtro Inteligente</h3><p class="text-gray-600">🔎 Analizando Perfil ${tipoPiel} y Tono ${nivelTono}...</p>`;
    
    try {
        const url = `${API_BASE}/productos/filtrado?tipoPiel=${tipoPiel}&nivelTono=${nivelTono}`;
        const response = await fetch(url);
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
            htmlContent += `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">`;
            productos.forEach(p => {
                htmlContent += renderProducto(p, null, 'grid'); 
            });
            htmlContent += `</div>`; 
        }
        
        productosFiltradosDiv.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error en el filtro inteligente automático:', error);
        productosFiltradosDiv.innerHTML = `<h3 class="text-red-600">❌ Error de Conexión</h3><p class="text-red-500">No se pudo contactar al servidor: ${error.message}</p>`;
    }
}

/**
 * Rendersiza una tarjeta de producto con dos posibles estilos de layout.
 * @param {object} p - Objeto del producto.
 * @param {string | null} safeMarca - Marca segura para manejo de fallos.
 * @param {'horizontal' | 'grid'} layout - Estilo de layout (carrusel o cuadrícula).
 */
function renderProducto(p, safeMarca = null, layout = 'grid') {
    
    let imageUrl = p.image_link; 
    if (!imageUrl) {
        if (safeMarca && typeof marcaStatus !== 'undefined' && marcaStatus[safeMarca]) {
            ajustarContadorFallido(safeMarca);
        }
        return ''; 
    }
    const onerrorAction = safeMarca 
        ? `this.closest('.producto').style.display='none'; ajustarContadorFallido('${safeMarca}');`
        : `this.closest('.producto').style.display='none';`; 
    const layoutClasses = layout === 'horizontal' 
        ? 'w-64 flex-shrink-0' 
        : 'w-full'; 
    const productTypeChip = p.product_type 
        ? `<span class="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">${p.product_type.replace(/_/g, ' ')}</span>`
        : '';
    const clickAction = `verDetalleProducto('${p.id}')`; 
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
/**
 * Guarda el ID del producto y navega a la página de detalle.
 * @param {number} productId - El ID único del producto.
 */
function verDetalleProducto(productId) {
    if (productId) {
        localStorage.setItem('productoIdDetalle', productId);
        window.location.href = 'detalle.html'; 
    } else {
        console.error('Error: ID de producto no válido para la navegación.');
    }
}
window.verDetalleProducto = verDetalleProducto;
async function cargarOpcionesFiltro() {
    const contenedorFiltro = document.getElementById('contenedorFiltro');
    const perfilString = sessionStorage.getItem('userProfile');
    
    if (perfilString) {
        const perfil = JSON.parse(perfilString);
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
        contenedorFiltro.innerHTML = htmlContenido;
        document.getElementById('botonFiltroInteligente').addEventListener('click', activarFiltroInteligenteAutomatico);

    } else {
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
    const listContainer = document.getElementById(carouselId.replace('carrusel-', 'lista-productos-'));

    if (listContainer) {
        listContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth' 
        });
    }
}
/**
 * Guarda el ID del producto y navega a la página de detalle.
 * @param {number} productId - El ID único del producto.
 */
function verDetalleProducto(productId) {
    if (productId) {
        localStorage.setItem('productoIdDetalle', productId);
        window.location.href = 'detalle.html'; 
    } else {
        console.error('Error: ID de producto no válido para la navegación.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarFeedGeneral(); 
    cargarOpcionesFiltro();
});
