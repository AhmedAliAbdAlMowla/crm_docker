"use strict"
const Joi = require("joi");

/**
 * @desc     Validate create milestone
 * @returns  Result after validate milestone
 */
module.exports.create = (milestone) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(60).required(),
    description: Joi.string().min(2).max(1024).required(),
  });

  return schema.validate(milestone);
};
