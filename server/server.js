const express = require('express');
const bcrypt = require('bcryptjs'); 
const cors = require('cors'); 
const path = require('path'); 
const fetch = require('node-fetch');
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const app = express();
const port = process.env.PORT || 3000;

// ----------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------
app.use(cors()); 
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
const { Pool } = require('pg'); 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT 
});

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos Postgres:', err.stack);
        return;
    }
    console.log('✅ Conectado a la base de datos Postgres.');
});

// ===========================
// FUNCIÓN DE LÓGICA EXPERTA 
// ===========================
/**
 * Aplica la lógica de recomendación basada en tipo de piel y tono.
 * @param {object} producto - El objeto del producto de maquillaje.
 * @param {string} tipoPiel - Tipo de piel del usuario ('Grasa', 'Seca', 'Mixta', 'Normal').
 * @param {string} nivelTono - Nivel de tono del usuario ('Claro', 'Medio', 'Oscuro').
 * @returns {boolean} - True si el producto coincide con los criterios.
 */
function aplicarLogicaExperta(producto, tipoPiel, nivelTono) {
    const desc = (producto.description || '').toLowerCase() + ' ' + 
                 (producto.product_type || '').toLowerCase() + ' ' +
                 (producto.tag_list ? producto.tag_list.join(' ') : '');

    let matchPiel = false;

    if (tipoPiel === 'Grasa') {
        matchPiel = desc.includes('matte') || desc.includes('oil free') || desc.includes('long lasting') || desc.includes('pore minimizing') || desc.includes('oil control');
    } else if (tipoPiel === 'Seca') {
        matchPiel = desc.includes('hydrating') || desc.includes('dewy') || desc.includes('illuminating') || desc.includes('moisture') || desc.includes('oil');
    } else if (tipoPiel === 'Mixta' || tipoPiel === 'Normal') {
        matchPiel = desc.includes('satin') || desc.includes('natural') || desc.includes('coverage') || desc.includes('cream');
    } else if (tipoPiel === 'Sensible') {
         matchPiel = desc.includes('sensitive') || desc.includes('natural') || desc.includes('fragrance free') || desc.includes('mineral');
    }
    if (producto.product_type === 'eyeliner' || producto.product_type === 'mascara' || producto.product_type === 'nail_polish') {
        matchPiel = true; 
    }
    let matchTono = false;
    const nombre = (producto.name || '').toLowerCase();

    if (nivelTono === 'Claro') {
        matchTono = nombre.includes('light') || nombre.includes('fair') || nombre.includes('ivory') || nombre.includes('porcelain');
    } else if (nivelTono === 'Medio') {
        matchTono = nombre.includes('medium') || nombre.includes('beige') || nombre.includes('sand') || nombre.includes('tan');
    } else if (nivelTono === 'Oscuro') {
        matchTono = nombre.includes('dark') || nombre.includes('deep') || nombre.includes('mocha') || nombre.includes('espresso');
    }
    if (producto.product_type === 'eyeliner' || producto.product_type === 'mascara' || producto.product_type === 'nail_polish') {
        matchTono = true; 
    }
    return matchPiel && matchTono;
}
/**
 * Sugiere un look de maquillaje basado en el tipo de producto y marca.
 * @param {object} producto - El objeto del producto de maquillaje.
 * @returns {string} - Un texto con la recomendación de look.
 */


/**
 * un tutorial de maquillaje altamente detallado y personalizado.
 * * @param {object} producto - El objeto del producto de maquillaje.
 * @returns {object} - Un objeto con el look_recomendado estructurado y generado dinámicamente.
 */
async function sugerirLooks(producto) {
    const tipo = (producto.product_type || '').toLowerCase().replace(/_/g, ' ');
    const marca = producto.brand || 'Marca Desconocida';
    const nombre = producto.name || 'Producto de Maquillaje';
    let prompt = `Genera un tutorial de maquillaje detallado y creativo para un look que tenga como producto central el: "${nombre}" de la marca "${marca}" (Tipo: ${tipo}).`;
    const lookGenerado = {};
    
    try {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        if (tipo.includes('lipstick') || tipo.includes('lip liner')) {
            lookGenerado.titulo = `Look 'Bold Lip' con el labial ${nombre}`;
            lookGenerado.descripcion = `Un look moderno que equilibra un labio audaz con un rostro limpio y ojos sutiles. La clave es la precisión.`;
            lookGenerado.pasos = [
                `Prepara la base: Aplica una BB Cream ligera y corrector solo donde sea necesario. El rostro debe verse fresco y natural.`,
                `Ojos Mínimos: Define tus cejas, y aplica una sombra beige mate en el párpado. Utiliza una capa de máscara de pestañas.`,
                `Definición Labial (Paso Clave): Utiliza un delineador de labios (si es posible, el tono exacto de este labial) para definir el arco de cupido y las esquinas. Esto evitará que el color se corra.`,
                `Aplicación del Labial: Rellena los labios con tu ${nombre}. Para un acabado de mayor duración, presiona un pañuelo fino sobre los labios y aplica una segunda capa.`,
                `Toque Final: Un poco de iluminador en el hueso de la ceja y las sienes completará el look elegante.`
            ];
            
        } else if (tipo.includes('eyeshadow')) {
            lookGenerado.titulo = `Tutorial: 'Halo Eye' con la sombra ${nombre}`;
            lookGenerado.descripcion = `Esta técnica crea un efecto tridimensional en el ojo, haciendo que parezca más grande y profundo. Perfecto para un evento especial.`;
            lookGenerado.pasos = [
                `Base y Transición: Aplica un tono de transición mate (marrón claro) en la cuenca del ojo y difumínalo hacia el hueso de la ceja.`,
                `Crear la Oscuridad: Usa tu sombra ${nombre} en las esquinas interior y exterior del párpado móvil. Difumina los bordes sin llegar al centro.`,
                `El Halo (Paso Clave): Con una brocha plana, aplica una sombra metálica o brillante de un tono más claro (si la tienes) justo en el centro del párpado. Esto crea el efecto 'halo' o luz.`,
                `Línea Inferior: Aplica la sombra ${nombre} bajo la línea de las pestañas inferiores para enmarcar el ojo y conectarlo con la parte superior.`,
                `Termina con un delineado fino y abundante máscara de pestañas.`
            ];
            
        } else if (tipo.includes('blush')) {
            lookGenerado.titulo = `Look 'Sun-Kissed' con el rubor ${nombre}`;
            lookGenerado.descripcion = `Un rubor que simula un día en el sol, creando un look juvenil y vibrante.`;
            lookGenerado.pasos = [
                `Piel Fresca: Mantén tu base de maquillaje ligera. Un poco de corrector es suficiente.`,
                `Efecto Bronceado: Aplica un poco de bronceador mate en la frente y bajo los pómulos para calentar el rostro.`,
                `Aplicación del Rubor (Paso Clave): Sonríe y aplica tu rubor ${nombre} directamente en las manzanas de tus mejillas, difuminando ligeramente sobre el puente de la nariz.`,
                `Fusión: Aplica un poco de iluminador cremoso sobre el rubor, justo en el punto alto del pómulo, para dar un acabado húmedo y natural.`,
                `Completa con un brillo de labios rosa o nude.`
            ];
        } else {
            lookGenerado.titulo = `Guía Rápida para ${nombre}`;
            lookGenerado.descripcion = `Hemos creado una micro-guía para ayudarte a integrar este ${tipo} en tu look diario.`;
            lookGenerado.pasos = [
                `Primer Paso: Revisa si el producto es mate o luminoso. Si es mate, prepara una base hidratante.`,
                `Aplicación: Usa la herramienta adecuada (brocha, esponja o dedo) para aplicar el producto en la zona deseada.`,
                `Difuminado (Paso Clave): Siempre tómate el tiempo para difuminar los bordes y lograr un acabado sin líneas duras.`,
                `Recuerda: El maquillaje debe sentirse cómodo. Si no te gusta un look, ¡siempre puedes cambiarlo!`
            ];
        }

    } catch (error) {
        console.error("Error simulado al generar look con IA:", error);
        lookGenerado.titulo = "Sugerencia Simple";
        lookGenerado.descripcion = "No pudimos generar un tutorial avanzado, pero este producto es perfecto para el uso diario.";
        lookGenerado.pasos = ["Aplica y difumina.", "¡Disfruta tu nuevo look!"];
    }
    
    return lookGenerado;
}
const SIMULACION_TRADUCCION = {
    "with maybelline colour sensational vivids lipcolour bright goes gorgeous never garishget brighter color from maybelline's exclusive vivid pigmentsplus get creamier feel from nourishing honey nectarfeatures be bright and gorgeousexclusive vivid colors are brighterhoney nectar formula nourishes lipsfor best resultsapply lipcolor starting in the center of your upper lip work from the center to the outer edges of your lip following the contours of your mouth then glide across the entire bottom lipshade range": "¡Con el lápiz labial Maybelline Colour Sensational Vivids, el brillo se vuelve magnífico, nunca chillón! Obtén un color más brillante gracias a los pigmentos vivos exclusivos de Maybelline. Además, obtén una sensación más cremosa gracias al nutritivo néctar de miel. Características: Luce brillante y hermosa. Los colores vivos exclusivos son más brillantes. La fórmula de néctar de miel nutre los labios. Para mejores resultados: Aplica el labial comenzando en el centro de tu labio superior. Trabaja desde el centro hacia los bordes exteriores, siguiendo el contorno de tu boca. Luego desliza a través de todo el labio inferior. Rango de tonos:",
    "not available": "Descripción no disponible.",
};
async function traducirDescripcion(texto) {
    if (!texto) return "Descripción no disponible.";
    const normalizedText = texto
        .toLowerCase()
        .replace(/[\r\n\t]/g, '') 
        .replace(/[.,!?':;{}()]/g, '') 
        .replace(/\s+/g, ' ') 
        .trim();
    if (SIMULACION_TRADUCCION[normalizedText]) {
        console.log(`[Traductor Simulado] Traducción mapeada encontrada.`);
        return SIMULACION_TRADUCCION[normalizedText];
    }
    console.log(`[Traductor Simulado] Usando original + indicador de proceso.`);
    return `(Simulado) ${texto}`;
}

app.get('/api/productos/catalogo', async (req, res) => {
    const externalApiUrl = 'http://makeup-api.herokuapp.com/api/v1/products.json';
    
    try {
        const response = await fetch(externalApiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        let productos = await response.json(); 
        productos = productos.filter(p => p.name); 
        const productosBarajados = shuffleArray(productos); 

        res.status(200).json(productosBarajados.slice(0, 50)); 

    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        res.status(500).json({ error: 'No se pudo obtener el catálogo de la API externa.' });
    }
});


// ----------------------------------------------------
// RUTAS DE LA APLICACIÓN (API ENDPOINTS)
// ----------------------------------------------------
app.get('/api/test', (req, res) => {
    res.json({ message: 'El servidor está corriendo perfectamente. Ruta de prueba OK.' });
});
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, password, tipoPiel, subtonoPiel, nivelTono } = req.body;
    if (!nombre || !correo || !password || !tipoPiel || !subtonoPiel || !nivelTono) {
        return res.status(400).json({ error: 'Faltan campos obligatorios del registro.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const query = `
INSERT INTO usuarios (nombre, correo, contrasena, tipo_piel, subtono_piel, nivel_tono)
VALUES ($1, $2, $3, $4, $5, $6)
`;
        const values = [nombre, correo, passwordHash, tipoPiel, subtonoPiel, nivelTono];

        pool.query(query, values, (error, results) => {
            if (error) {
    if (error.code === '23505') { 
        return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }
    console.error('Error al insertar usuario en Postgres:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar.' });
}
            res.status(201).json({ 
                message: 'Usuario registrado con éxito', 
                userId: 'Registro exitoso'
            });
        });

    } catch (err) {
        console.error('Error de servidor/hashing:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Faltan correo o contraseña.' });
    }
    const query = 'SELECT * FROM usuarios WHERE correo = $1';

    pool.query(query, [correo], async (error, results) => {
        if (error) {
            console.error('Error al buscar usuario en Postgres:', error);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        if (results.rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        const user = results.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.contrasena);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

         const userProfile = {
            tipoPiel: user.tipo_piel,
             subtonoPiel: user.subtono_piel,
             nivelTono: user.nivel_tono
        };

         res.status(200).json({
             message: 'Login exitoso',
             nombre: user.nombre,
         perfil: userProfile 
    });
     });
});
app.get('/api/productos/filtrado', async (req, res) => {
    const { tipoPiel, nivelTono } = req.query; 
     const externalApiUrl = 'http://makeup-api.herokuapp.com/api/v1/products.json';

     if (!tipoPiel || !nivelTono) {
        return res.status(400).json({ error: 'Faltan los parámetros tipoPiel o nivelTono.' });
    }

     try {
         const response = await fetch(externalApiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const productos = await response.json();
        let productosFiltrados = productos.filter(p => {
             return aplicarLogicaExperta(p, tipoPiel, nivelTono);
         });



         const productosConFotoYCorregidos = productosFiltrados
             .filter(p => p.image_link && p.image_link.startsWith('http'))
             .map(p => ({
                 ...p,
             image_link: p.image_link.replace('http://', 'https://') 
}));
        const productosBarajados = shuffleArray(productosConFotoYCorregidos); 

         res.status(200).json({
         perfil: { tipoPiel, nivelTono },
         productos: productosBarajados.slice(0, 15)
});

     } catch (error) {
         console.error('Error en la ruta /api/productos/filtrado:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
 }
});
app.get('/api/productos/atributos', (req, res) => {
    const tipoPielQuery = 'SELECT DISTINCT tipo_piel FROM usuarios WHERE tipo_piel IS NOT NULL';
    const nivelTonoQuery = 'SELECT DISTINCT nivel_tono FROM usuarios WHERE nivel_tono IS NOT NULL';
    const getTiposPiel = new Promise((resolve, reject) => {
        pool.query(tipoPielQuery, (error, results) => {
            if (error) reject(error);
            resolve(results.rows.map(row => row.tipo_piel));
        });
    });

    const getNivelesTono = new Promise((resolve, reject) => {
        pool.query(nivelTonoQuery, (error, results) => {
            if (error) reject(error);
            resolve(results.map(row => row.nivel_tono));
        });
    });

    Promise.all([getTiposPiel, getNivelesTono])
        .then(([tiposPiel, nivelesTono]) => {
            res.status(200).json({
                tiposPiel: tiposPiel,
                nivelesTono: nivelesTono
            });
        })
        .catch(error => {
            console.error('Error al obtener atributos únicos de Postgres:', error);
            res.status(500).json({ error: 'Error al obtener atributos de filtro.' });
        });
});
app.get('/api/productos/:id', async (req, res) => {
    const productId = req.params.id;
    const externalApiUrl = `http://makeup-api.herokuapp.com/api/v1/products/${productId}.json`;
    
    try {
        const response = await fetch(externalApiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
            throw new Error(`Error fetching product details: ${response.statusText}`);
        }
        
        const productoDetalle = await response.json(); 
        productoDetalle.look_recomendado = await sugerirLooks(productoDetalle);
        res.status(200).json(productoDetalle); 

    } catch (error) {
        console.error(`Error al cargar el detalle del producto ${productId}:`, error);
        res.status(500).json({ error: 'No se pudo obtener el detalle del producto de la API externa.' });
    }
});

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------

app.listen(port, () => {
    console.log(`🚀 Servidor subido con éxito. Puerto: ${port}`);
});