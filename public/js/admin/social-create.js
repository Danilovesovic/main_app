(function() {
    var btnImages = document.getElementById('btn-choose-images');
    var inputImages = document.getElementById('images');
    var spanImages = document.getElementById('images-chosen');
    var previewContainer = document.getElementById('images-preview');
    var currentUrls = [];
    if (btnImages && inputImages) {
        btnImages.addEventListener('click', function() { inputImages.click(); });
        inputImages.addEventListener('change', function() {
            currentUrls.forEach(function(u) { URL.revokeObjectURL(u); });
            currentUrls = [];
            if (previewContainer) previewContainer.innerHTML = '';
            var n = this.files.length;
            if (spanImages) spanImages.textContent = n > 0 ? n + ' file(s) chosen' : '';
            for (var i = 0; i < n; i++) {
                var file = this.files[i];
                if (!file.type.match('^image/')) continue;
                var url = URL.createObjectURL(file);
                currentUrls.push(url);
                var img = document.createElement('img');
                img.src = url;
                img.alt = 'Preview';
                img.className = 'img-thumbnail';
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.objectFit = 'cover';
                if (previewContainer) previewContainer.appendChild(img);
            }
        });
    }
})();
