const Joi = require('@hapi/joi');

const validateUser = (email, password) => {
  const validEmail = typeof email === "string" && email.trim() !== "";
  const validPassword =typeof password === "string" && password.trim().length >= 6;
   console.log(validPassword);
  return validEmail && validPassword;
};

const validatefield=(user)=>{
  //validaion user schema
  const schema = Joi.object().keys({
    name:Joi.string().min(2).required(),
    email: Joi.string().min(5).required().email(),
    lastname:Joi.string().min(2).required(),
    cellno:Joi.string().min(10).max(13).required(),
    password: Joi.string().min(6).required(),
    street:Joi.string().required(),
    surburb:Joi.string().required(),
    city:Joi.string().required(),
    province:Joi.string().required()
  });
  const {error}= Joi.validate(user,schema);
  return error ? error.details[0].message : null;
}
module.exports = {
  validateUser,
  validatefield
};
