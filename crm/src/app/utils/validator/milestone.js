"use strict"
const Joi = require("joi");

/**
 * @desc     Validate create milestone
 * @returns  Result after validate milestone
 */
module.exports.create = (milestone) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().min(2).required(),
  });

  return schema.validate(milestone);
};
