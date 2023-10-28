const { request, response } = require("express");
const Usuario = require("../models/usuario");


const validarCorreo = async(req = request, res = response, next) => {

    const {correo} = req.body;

    try {
        
        const usuario = await Usuario.findOne({correo});

        if(!usuario){
            return res.status(400).json({
                msg:'El usuario no existe'
            });
        }
        req.usuario = usuario;
        next();

    } catch (error) {
        res.status(500).json({
            msg:'Algo salio mal - al validar Correo'
        })
    }
}


const existeIdEnDB = async(id) => {
    if(id.length < 24){
        throw new Error('El usuario no existe - id')
    }

    const existeId = await Usuario.findById(id);
    if(!existeId){
        throw new Error('El usuario no existe - id')
    }

    return true;
}


module.exports = {
    validarCorreo,
    existeIdEnDB
}