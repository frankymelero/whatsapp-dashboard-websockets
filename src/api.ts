import { CONFIG } from './config';

let token: string | null = null;

/**
 * Retrieves a JWT from API.
 */
export async function authenticate() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: CONFIG.EMAIL,
                password: CONFIG.PASSWORD,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error al autenticar: ${response.statusText}`);
        }

        const data = await response.json();
        token = data.token;
        console.log('✅ Autenticación exitosa. Token obtenido.');
    } catch (error) {
        console.error('❌ Error en autenticación:', error);
    }
}

/**
 * Adds a new caption with urltype video
 */
export async function addVideo(title: string, url: string) {
    if (!token) {
        console.error('❌ No hay token. No se puede agregar el video.');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, url }),
        });

        if (!response.ok) {
            throw new Error(`Error al guardar video: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Video guardado en API:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al guardar video:', error);
    }
}
