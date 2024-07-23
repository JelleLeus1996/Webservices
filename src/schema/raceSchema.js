const Joi = require('joi');

const raceSchema = Joi.object({
  raceId: Joi.number().integer().required(),
  name: Joi.string().min(1).max(99).required(),
  date: Joi.date().greater('1-1-2022').required(),
  location: Joi.string().min(1).max(99).required(),
});


const validationResult = raceSchema.validate({ location: 'Ghent', date: '24-03-2024' });

if (validationResult.error) {
  console.error(validationResult.error.message);
} else {
  console.log(validationResult.value);
}

module.exports={raceSchema};