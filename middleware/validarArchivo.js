const { request, response } = require("express");



const validarFoto = async(req = request, res = response, next) => {

    if(!req.files || !req.files?.archivo){
        return res.status(500).json({
            msg:'No hay archivo para subir'
        })
    }
    next();
};



module.exports = {
    validarFoto
}