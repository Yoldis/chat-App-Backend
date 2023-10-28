const{Router} = require('express');
const router = Router();


const{getNotificacionSolicitud, updateNotificacionAtCero} = require('../controller/notificacionController');



router.post('/solicitud', getNotificacionSolicitud);




module.exports = router;