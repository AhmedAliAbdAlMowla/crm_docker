"use strict";
const Joi = require("joi");

/**
 * @desc     Validate uuid
 * @returns  Result after validate uuid
 */
module.exports.uuidValidator = (uuid) => {
  const schema = Joi.object({
    id: Joi.string()
      .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
      .label("id")
      .messages({
        "string.pattern.base": "Invalid ID form",
      }),
  });
  return schema.validate(uuid);
};
