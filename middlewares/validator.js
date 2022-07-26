const validator = (req, res, next) => {
  try {
    let schema = res.locals.schema;
    let data = {};
    if (schema) {
      let validationResults = schema.validate(req.body);
      res.locals.validationResults = validationResults;
      if (!validationResults.error) {
        res.locals.validationResults = { success: 1 };
        next();
      } else {
        data.success = 0;
        data.msg = validationResults.error.details.map(x=>x.message).join(';')
        data.msgStatus = 'error'
        res.json(data);
      }
    } else {
      next(new Error("invalid schema"));
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = validator;
