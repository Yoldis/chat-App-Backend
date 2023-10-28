const { validationResult } = require("express-validator");

const validarCampos = (req, res, next) => {

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json(errors);
}


module.exports = validarCampos;