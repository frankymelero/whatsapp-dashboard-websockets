import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { authenticate, addVideo } from './api';

export async function iniciarBot() {
    await authenticate(); 

    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Bot conectado a WhatsApp');
        } else if (connection === 'close') {
            console.log('❌ Conexión cerrada, reconectando...');
            setTimeout(iniciarBot, 5000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];

        console.log('📩 Mensaje recibido:', msg);

        if (msg.message?.extendedTextMessage?.text?.startsWith('!guardaVideo')) {
            await handleSaveVideoCommand(sock, msg);
        }
    });
}

/**
 * Maneja el comando !guardaVideo <titulo> <url>
 */
async function handleSaveVideoCommand(sock: any, msg: any) {
    const texto = msg.message.extendedTextMessage.text;
    const partes = texto.split(' ');

    if (partes.length < 3) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Uso incorrecto. El formato correcto es: !guardaVideo <titulo> <url>' });
        return;
    }

    const titulo = partes.slice(1, partes.length - 1).join(' ');
    const url = partes[partes.length - 1];

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|e\/|.*\/videos\/)([a-zA-Z0-9_-]+)($|\&)/;
    if (!youtubeRegex.test(url)) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL no válida. Asegúrate de que sea un enlace de YouTube.' });
        return;
    }

    const result = await addVideo(titulo, url);
    if (result) {
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Video guardado correctamente:\nTítulo: ${titulo}\nURL: ${url}` });
    } else {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error al guardar el video.' });
    }
}
