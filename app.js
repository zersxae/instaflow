document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const fetchBtn = document.getElementById('fetchBtn');
    const resultDiv = document.getElementById('result');

    // URL doğrulama fonksiyonu
    function isValidInstagramUrl(url) {
        return url.includes('instagram.com/') || url.includes('instagr.am/');
    }

    // Loading göstergesi
    function showLoading() {
        resultDiv.innerHTML = '<div class="loading"></div>';
    }

    // Hata mesajı gösterme
    function showError(message) {
        resultDiv.innerHTML = `<div class="error">${message}</div>`;
    }

    // Medya içeriğini gösterme
    function showMedia(data) {
        if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
            showError('İçerik bulunamadı.');
            return;
        }

        let html = '<div class="media-grid">';
        
        data.data.forEach((content, index) => {
            const mediaUrl = content.url;
            // API'den gelen filename'i kullan veya undefined olarak bırak (server random oluşturacak)
            const apiFilename = content.filename;
            const downloadUrl = `/download?url=${encodeURIComponent(mediaUrl)}${apiFilename ? `&filename=${encodeURIComponent(apiFilename)}` : ''}`;

            html += `
                <div class="media-item">
                    <div class="media-preview">
                        ${content.type === 'video' ? `
                            <video controls poster="${content.thumbnail || ''}">
                                <source src="${mediaUrl}" type="video/mp4">
                                Tarayıcınız video oynatmayı desteklemiyor.
                            </video>
                        ` : `
                            <img src="${mediaUrl}" alt="Instagram içeriği ${index + 1}">
                        `}
                    </div>
                    <div class="media-actions">
                        <a href="${downloadUrl}" class="download-btn" download>
                            <i class="fas fa-download"></i>
                            ${content.type === 'video' ? 'Videoyu' : 'Fotoğrafı'} İndir
                        </a>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        
        if (data.Join) {
            html += `
                <div class="telegram-invite">
                    <a href="https://t.me/zersjs" target="_blank" class="telegram-btn">
                        <i class="fab fa-telegram"></i>
                        Telegram Kanalımıza Katılın
                    </a>
                </div>
            `;
        }

        resultDiv.innerHTML = html;
    }

    // İçerik bilgilerini getirme
    async function fetchContent() {
        const url = urlInput.value.trim();

        if (!url) {
            showError('Lütfen bir Instagram URL\'si girin.');
            return;
        }

        if (!isValidInstagramUrl(url)) {
            showError('Geçersiz Instagram URL\'si. Lütfen geçerli bir URL girin.');
            return;
        }

        try {
            showLoading();
            fetchBtn.disabled = true;

            const response = await fetch(`http://localhost:3000/api/insta?url=${encodeURIComponent(url)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.successful === "success") {
                showMedia(data);
            } else {
                showError(data.message || 'İçerik bulunamadı veya bilgiler alınamadı.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('İçerik bilgileri alınırken bir hata oluştu. Lütfen sunucunun çalıştığından emin olun.');
        } finally {
            fetchBtn.disabled = false;
        }
    }

    // Event listeners
    fetchBtn.addEventListener('click', fetchContent);

    // Enter tuşu ile çalıştırma
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchContent();
        }
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
});
