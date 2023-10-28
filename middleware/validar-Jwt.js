const { request, response } = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");


const validarToken = async(req = request, res = response, next) => {
    
    const{'x-token':token} = req.headers;

    try {
        if(!token){
            return res.status(400).json({
                token:'No hay token en la peticion'
            })
        }

        const {id} = jwt.verify(token, process.env.SECRET_TOKEN);

        const usuario = await Usuario.findById(id);
        if(!usuario){
            return res.status(400).json({
                token:'El usuario no existe'
            })
        }

        req.usuario = usuario;
        next();

    } catch (error) {
        console.log(error)
        res.status(500).json({
            token:'El token no es valido'
        })
    }
}

module.exports = validarToken;