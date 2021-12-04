const Joi = require('joi');
const { RequestHandler } = require('express');

/**
 * Uses Joi to validate the request against a set of schemas
 * and updates the request to the sanitized values.
 *
 * Calls the next middleware if request is valid.
 * Sends a 400 response if the request is invalid.
 *
 * @param {Joi.ObjectSchema} schema
 * @returns {RequestHandler} a middleware
 */
function validRequest(schema) {
  return (req, res, next) => {
    const errors = {};
    let anyErrors = false;

    for (const key in schema) {
      const validateResult = schema[key]
        .required()
        .label('req.' + key)
        .validate(req[key], { abortEarly: false });

      if (validateResult.error) {
        errors[key] = validateResult.error;
        anyErrors = true;
      } else {
        req[key] = validateResult.value;
      }
    }

    if (anyErrors) {
      const error = new Error('Request data is invalid. See details.');
      error.status = 400;
      error.details = errors;
      return next(error);
    } else {
      return next();
    }
  };
}

module.exports = validRequest;
