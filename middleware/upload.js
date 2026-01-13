const multer = require('multer');
const path = require('path');

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // O diretório deve existir: ./public/uploads/
        cb(null, path.join(__dirname, '..', 'public', 'uploads')); 
    },
    filename: function (req, file, cb) {
        // Define o nome do arquivo como: barbeiro-<timestamp>.<extensao>
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'barbeiro-' + uniqueSuffix + ext);
    }
});

// Filtro de arquivo (apenas imagens)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

// Limites do arquivo (ex: 5MB)
const limits = {
    fileSize: 5 * 1024 * 1024 // 5 MB
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

module.exports = upload;