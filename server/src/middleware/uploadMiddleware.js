const upload = require('../config/multer');
const { errorResponse } = require('../utils/responseHelper');

// Wrapper upload single file dengan penanganan error Multer (misal ukuran melebihi limit)
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Ukuran file terlalu besar! Maksimal ukuran file adalah 5MB.', 400);
        }
        return errorResponse(res, err.message || 'Gagal mengunggah file gambar.', 400);
      }
      next();
    });
  };
};
// Wrapper upload multiple fields
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadHandler = upload.fields(fields);
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Ukuran file terlalu besar! Maksimal ukuran file adalah 5MB.', 400);
        }
        return errorResponse(res, err.message || 'Gagal mengunggah file gambar.', 400);
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadFields,
};
