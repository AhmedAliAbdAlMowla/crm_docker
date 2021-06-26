"use strict"
const Joi = require("joi");

/**
 * @desc     Validate signup
 * @returns  Result after validate project
 */
module.exports.create = (project) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    streetAddress: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    state: Joi.string().min(2).required(),
    zip: Joi.string().max(20).min(2).required(),
  });

  return schema.validate(project);
};
