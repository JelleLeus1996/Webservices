import Joi from 'joi';

const sponsorSchema = Joi.object({
  sponsorId: Joi.number().integer().required(),
  name: Joi.string().min(1).max(99).required(),
  industry: Joi.string().min(1).max(99).required(),
  teamId: Joi.number().integer().required(),
  contribution: Joi.number().min(100000).max(100000000),
});


const validationResult = sponsorSchema.validate({ industry: 'abc', contribution: 250000 });

if (validationResult.error) {
  console.error(validationResult.error.message);
} else {
  console.log(validationResult.value);
}

export default {sponsorSchema};