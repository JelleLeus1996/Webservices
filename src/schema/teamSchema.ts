import Joi from 'joi';

const teamSchema = Joi.object({
  teamId: Joi.number().positive().required(),
  name: Joi.string().min(1).max(99).required(),
  country: Joi.string().min(1).max(50).required(),
  victories: Joi.number().min(0).max(250),
  points: Joi.number().min(0).max(1000000),
  team_status: Joi.string().min(3).max(3).required(),
  abbreviation: Joi.string().min(3).max(3).required(),
  director: Joi.string().min(1).max(99).required(),
  assistant: Joi.string().min(1).max(99).required(),
  representative: Joi.string().min(1).max(99).required(),
  bike: Joi.string().min(1).max(50).required(),
  overhead_cost: Joi.number().min(100000).max(50000000).required(),
});


const validationResult = teamSchema.validate({ country: 'abc', points: 1994 });

if (validationResult.error) {
  console.error(validationResult.error.message);
} else {
  console.log(validationResult.value);
}

export default {teamSchema};