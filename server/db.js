/**
 * db.js
 * Funciones para gestionar el almacenamiento de perfiles de usuario.
 * (Simulación de base de datos con localStorage)
 */

const KEY_PREFIJO = 'perfil_';
const KEY_USUARIO_ACTUAL = 'usuarioActual';

// Función para guardar el perfil completo del usuario
export function guardarPerfil(perfilCompleto) {
    try {
        const clave = KEY_PREFIJO + perfilCompleto.correo;
        localStorage.setItem(clave, JSON.stringify(perfilCompleto));
        localStorage.setItem(KEY_USUARIO_ACTUAL, perfilCompleto.correo);
        return true; // Éxito
    } catch (e) {
        console.error("Error al guardar en el almacenamiento local:", e);
        return false; // Fracaso
    }
}

// Función para cargar un perfil específico
export function cargarPerfil(correo) {
    const perfilJSON = localStorage.getItem(KEY_PREFIJO + correo);
    if (perfilJSON) {
        return JSON.parse(perfilJSON);
    }
    return null;
}

// Función para obtener el perfil del usuario actualmente "logueado"
export function obtenerPerfilActual() {
    const correoActual = localStorage.getItem(KEY_USUARIO_ACTUAL);
    if (correoActual) {
        return cargarPerfil(correoActual);
    }
    return null;
}