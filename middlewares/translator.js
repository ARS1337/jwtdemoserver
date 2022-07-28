const i18n = require("../i18n");

const translator = (req, res, next) => {
  try {
    const receivedLanguages = req.acceptsLanguages() || "en";
    res.locals.translate = i18n(receivedLanguages[0]);
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = translator;
