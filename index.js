const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Rota para criptografar o texto usando AES
app.post('/encrypt', (req, res) => {
    const { plaintext, key } = req.body;

    if (!plaintext || !key) {
        return res.status(400).json({ error: 'Both plaintext and key are required' });
    }

    // Gerar IV aleatório
    const iv = CryptoJS.lib.WordArray.random(16);

    try {
        const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv: iv, mode: CryptoJS.mode.CBC }).toString();
        const encryptedData = {
            iv: iv.toString(CryptoJS.enc.Base64),
            ciphertext: encrypted
        };
        // Retornar IV e texto criptografado
        res.json({ iv: encryptedData.iv, encryptedText: encryptedData.ciphertext });
    } catch (error) {
        console.error('Encryption error:', error.message);
        res.status(400).json({ error: 'Encryption failed' });
    }
});

// Rota para descriptografar o texto usando AES
app.post('/decrypt', (req, res) => {
    const { encryptedText, key, iv } = req.body;

    if (!encryptedText || !key) {
        return res.status(400).json({ error: 'Both encryptedText and key are required' });
    }

    try {
        let decrypted;
        if (iv) {
            decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: CryptoJS.enc.Base64.parse(iv), mode: CryptoJS.mode.CBC });
        } else {
            decrypted = CryptoJS.AES.decrypt(encryptedText, key, { mode: CryptoJS.mode.CBC });
        }
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            return res.status(400).json({ error: 'Decryption failed' });
        }

        res.json({ decryptedText });
    } catch (error) {
        console.error('Decryption error:', error.message);
        res.status(400).json({ error: 'Decryption failed' });
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
