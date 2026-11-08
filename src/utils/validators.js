const AppError = require('./AppError');

function parseId(value, field = 'id') {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new AppError(`El ${field} debe ser un número entero positivo`, 400);
  }
  return number;
}

function parsePositiveInt(value, defaultValue, field) {
  if (value === undefined) {
    return defaultValue;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new AppError(`El parámetro ${field} debe ser un entero positivo`, 400);
  }
  return number;
}

function parseOptionalNumber(value, field) {
  if (value === undefined || value === '') {
    return undefined;
  }
  const number = Number(value);
  if (Number.isNaN(number) || number < 0) {
    throw new AppError(`El parámetro ${field} debe ser un número mayor o igual a 0`, 400);
  }
  return number;
}

module.exports = { parseId, parsePositiveInt, parseOptionalNumber };