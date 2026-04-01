import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).required(),
  estimated_hours: Joi.number().positive().max(100).required(),
  required_skills: Joi.array().items(Joi.string()).min(1).required()
});