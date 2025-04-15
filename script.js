document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const formatSelect = document.getElementById('formatSelect');
    const resizeBtn = document.getElementById('resizeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const originalPreview = document.getElementById('originalPreview');
    const resizedPreview = document.getElementById('resizedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const resizedInfo = document.getElementById('resizedInfo');

    let originalImage = null;

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // File input handling
    document.querySelector('.browse-btn').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                loadImage(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.src = event.target.result;
            originalImage.onload = () => {
                originalPreview.src = originalImage.src;
                widthInput.value = originalImage.width;
                heightInput.value = originalImage.height;
                updateImageInfo(originalInfo, originalImage.width, originalImage.height, file.size);
                downloadBtn.disabled = true;
            };
        };
        reader.readAsDataURL(file);
    }

    // Quality slider
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    // Dimension inputs
    widthInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && originalImage) {
            const ratio = originalImage.height / originalImage.width;
            heightInput.value = Math.round(widthInput.value * ratio);
        }
    });

    heightInput.addEventListener('input', () => {
        if (maintainAspectRatio.checked && originalImage) {
            const ratio = originalImage.width / originalImage.height;
            widthInput.value = Math.round(heightInput.value * ratio);
        }
    });

    // Resize functionality
    resizeBtn.addEventListener('click', () => {
        if (!originalImage) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = parseInt(widthInput.value);
        canvas.height = parseInt(heightInput.value);

        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        const quality = parseInt(qualitySlider.value) / 100;
        const format = formatSelect.value;
        
        resizedPreview.src = canvas.toDataURL(format, quality);
        updateImageInfo(resizedInfo, canvas.width, canvas.height);
        downloadBtn.disabled = false;
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const format = formatSelect.value;
        const extension = format.split('/')[1];
        const link = document.createElement('a');
        link.download = `resized-image.${extension}`;
        link.href = resizedPreview.src;
        link.click();
    });

    function updateImageInfo(element, width, height, size = null) {
        let info = `${width}x${height}px`;
        if (size) {
            info += ` (${formatFileSize(size)})`;
        }
        element.textContent = info;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});