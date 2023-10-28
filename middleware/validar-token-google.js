const { request, response } = require("express");
const Usuario = require("../models/usuario");


const validarTokenGoogle = async(req = request, res = response, next) => {
    
    console.log(req.body)
    try {
        // if(!token){
        //     return res.status(400).json({
        //         token:'No hay token en la peticion'
        //     })
        // }

        // const {id} = jwt.verify(token, process.env.SECRET_TOKEN);

        next();

    } catch (error) {
        console.log(error)
        res.status(500).json({
            token:'El token no es valido'
        })
    }
}

module.exports = validarTokenGoogle;