"use strict"
const Joi = require("joi");

/**
 * @desc     Validate create folder
 * @returns  Result after validate folder
 */
module.exports.create = (folder) => {
  const schema = Joi.object({
    folderName: Joi.string().min(1).max(25).required(),
 
  });

  return schema.validate(folder);
};
