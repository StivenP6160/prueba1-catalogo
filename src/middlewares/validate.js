const AppError = require('../utils/AppError');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      throw new AppError('Datos inválidos', 400, details);
    }

    req.body = result.data;
    next();
  };
}

module.exports = validate;