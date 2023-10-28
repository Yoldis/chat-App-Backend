const {Router} = require('express');
const { loginController, registerController, tokenController, updateProcfile, updateFoto, cancelFoto, googleController, eliminarCuenta } = require('../controller/authController');
const { check } = require('express-validator');
const validarCampos = require('../middleware/valirCampos');
const validarToken = require('../middleware/validar-Jwt');
const { validarCorreo, existeIdEnDB } = require('../middleware/validarDB');
const { validarFoto } = require('../middleware/validarArchivo');

const router = Router();


router.post('/register', [
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('correo', 'El correo debe ser valido').isEmail(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({min:6}),
    validarCampos
], registerController);


router.post('/login', [
    check('correo', 'El correo debe ser valido').isEmail(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({min:6}),
    validarCampos,
    validarCorreo,
], loginController);


router.get('/token', validarToken, tokenController);


router.post('/updateFoto', [validarToken, validarFoto], updateFoto);

router.post('/cancelFoto', cancelFoto);

router.put('/updateProcfile/:id', [
    // validarToken,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    validarCampos,
], updateProcfile);


router.post('/google', [
    
], googleController);

// router.delete('/eliminarCuenta/:id', [
//     check('id').custom(existeIdEnDB),
//     validarCampos
// ], eliminarCuenta);

module.exports = router;