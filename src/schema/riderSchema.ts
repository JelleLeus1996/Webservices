const Joi = require('joi');

const riderSchema = Joi.object({
  id: Joi.number().integer().required(),
  nationality: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  first_name: Joi.string().min(1).max(50).required(),
  teamId: Joi.number().integer().required(),
  birthday: Joi.date().greater('1-1-1970').required(),
  points: Joi.number().min(0).max(1000000),
  monthly_wage: Joi.number().min(0).max(1000000),
});


const validationResult = riderSchema.validate({ nationality: 'abc', points: 1994 });

if (validationResult.error) {
  console.error(validationResult.error.message);
} else {
  console.log(validationResult.value);
}

export default {riderSchema};