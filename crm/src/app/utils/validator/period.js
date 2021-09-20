"use strict";
const Joi = require("joi");

/**
 * @desc     Validate signup
 * @returns  Result after validate projectWorkingHours
 */
module.exports.create = (projectWorkingHours) => {
  const schema = Joi.object({
    hours: Joi.number().required(),
    description: Joi.string().min(2).max(1024).required(),

    date: Joi.string()
      .regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)
      .required()
      .label("date")
      .messages({
        "string.pattern.base": "Invalid Date form",
      }).required(),
  });

  return schema.validate(projectWorkingHours);
};
