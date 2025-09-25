import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 30 }, // 30MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'), false);
        }
    }
});

export default upload;