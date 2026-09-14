const { validationResult } = require('express-validator');

// Middleware untuk memeriksa hasil validasi dari express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    const firstMsg = formattedErrors[0]?.message;

    return res.status(422).json({
      success: false,
      message: firstMsg || 'Validasi input gagal. Silakan periksa kembali data yang Anda kirimkan.',
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = {
  validate,
};
