import multer from "multer"

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
fileFilter: (req, file, cb) => {
	// const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

	if (file.mimetype.startsWith('image/')) {
	  cb(null, true)
	} else {
	  cb(new Error('Only images allowed'), false)
	}
  },
});
