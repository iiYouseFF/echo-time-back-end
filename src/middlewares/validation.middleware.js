import { HttpException } from '../core/HttpException.js';

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const message = error.details.map((i) => i.message).join(',');
      throw new HttpException(400, message);
    }

    next();
  };
};