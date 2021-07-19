"use strict"
const Joi = require("joi");

/**
 * @desc     Validate signup
 * @returns  Result after validate project
 */
module.exports.create = (project) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(60).required(),
    type:Joi.string().min(2).max(12).required(),
    budget: Joi.number().min(1).required(),
    startDate:Joi.date().required(),
    timeLine:Joi.number().min(1).required(),
    streetAddress: Joi.string().max(60).allow(null, ''),
    city: Joi.string().max(40).allow(null, ''),
    state: Joi.string().max(20).allow(null, ''),
    zip: Joi.string().max(10).allow(null, '')
  });

  return schema.validate(project);
};
