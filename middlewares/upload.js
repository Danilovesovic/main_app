const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads/profiles/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Automatski kreira folder ako ne postoji
}

// Konfiguracija gde i kako se čuvaju fajlovi 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // folder gde se čuvaju slike
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        if (!ext && file.mimetype) {
            const mimeExt = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };
            ext = mimeExt[file.mimetype] || '.bin';
        }
        cb(null, unique + (ext || '.bin'));
    }
});

// Filter - samo slike i gifovi
const imageFilter = function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype)); // To accept the file pass `true`овако: cb(null, true)
};

const upload = multer({  
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});

module.exports = upload; 
