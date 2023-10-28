const { Router } = require('express');
const { check } = require('express-validator');
const { getSugerencias, getSolicitudes, getAmigos } = require('../controller/amigoController');
const { existeIdEnDB } = require('../middleware/validarDB');
const validarCampos = require('../middleware/valirCampos');

const router = Router();


router.get('/sugerencias/:id', [
    check('id').custom(existeIdEnDB),
    validarCampos
], getSugerencias);


router.get('/solicitudes/:id', [
    check('id').custom(existeIdEnDB),
    validarCampos
], getSolicitudes);

router.get('/:id', [
    check('id').custom(existeIdEnDB),
    validarCampos
], getAmigos);




module.exports = router;

