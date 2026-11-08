const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({
    error: { message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` },
  });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'El JSON enviado no es válido' } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Error interno del servidor' } });
}

module.exports = { notFound, errorHandler };