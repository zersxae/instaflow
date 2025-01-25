const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ana endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Instagram içerik indirme API'si
app.get('/api/insta', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            successful: "error",
            message: "URL parametresi gerekli"
        });
    }

    try {
        const apiResponse = await axios.get(`https://ar-api-08uk.onrender.com/insta?url=${encodeURIComponent(url)}`);
        return res.json(apiResponse.data);
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        res.status(500).json({
            successful: "error",
            message: "İçerik indirme başarısız oldu: " + (error.response?.data?.message || error.message)
        });
    }
});

// Direk indirme endpoint'i
app.get('/download', async (req, res) => {
    const { url, filename } = req.query;

    if (!url) {
        return res.status(400).send('URL parametresi gerekli');
    }

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        // Content-Type header'ını ayarla
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        
        // Dosya adını belirle
        let finalFilename = filename;
        if (!finalFilename) {
            // Random bir dosya adı oluştur
            const timestamp = new Date().getTime();
            const random = Math.floor(Math.random() * 10000);
            finalFilename = contentType.includes('video') 
                ? `video_${timestamp}_${random}.mp4` 
                : `photo_${timestamp}_${random}.jpg`;
        }

        // Content-Disposition header'ını ayarla
        res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);

        // Stream'i doğrudan response'a aktar
        response.data.pipe(res);
    } catch (error) {
        console.error('Download Error:', error.message);
        res.status(500).send('İndirme işlemi başarısız oldu');
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
