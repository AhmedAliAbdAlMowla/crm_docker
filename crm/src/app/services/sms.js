"use strict"
const AWS = require("aws-sdk");
/**
 * @desc      Send sms
 * @param     text, to, sender
 */

async function sendSMS(params) {
  return  new AWS.SNS().publish(params).promise();
}

exports.sendSms = async (sender, to, text) => {
  const params = {
    Message: text, // MESSAGE_TEXT
    PhoneNumber: to,
    MessageAttributes:{
        "AWS.SNS.SMS.SenderID" : {
            DataType: "String",
            StringValue: "abc22"
        }
    },
  };

  await sendSMS(params);
};
