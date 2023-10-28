const { request, response } = require("express");
const Notificacion = require("../models/notificacion");

const getNotificacionSolicitud = async(req = request, res = response) => {

    try{
        res.status(200).json({
            msg:'Obtener Solicitud'
        })
    }catch(error){
        res.status(500).json({
            msg:'Algo salio mal - Al obtener Solicitud'
        })
    }
};






module.exports = {
    getNotificacionSolicitud,
}