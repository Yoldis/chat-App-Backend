const jwt = require('jsonwebtoken');
const Usuario = require("../models/usuario");


const generateToken = (id = '') =>{

    return new Promise((resolve, reject) => {
        
        jwt.sign({id}, process.env.SECRET_TOKEN, {
            expiresIn:'2h'
        }, (err, token) => {
           if(err){
            console.log('Algo salio mal al crear el token')
            reject('Algo salio mal al crear el token')
           }
           else{
            resolve(token);
           }
        });
    })
    
}


const validarTokenSocket = async(token) => {
    // console.log(token)

    if(!token){
        return {
            ok:false,
            msg:'El token no existe'
        }
    }

    try {
        const {id} = jwt.verify(token, process.env.SECRET_TOKEN);
        const usuario = await Usuario.findById(id);

        if(!usuario){
            return {
                ok:false,
                msg:'El usuario no existe'
            }
        }
        else{
            return {
                ok:true,
                usuario
            }
        }

    } catch (error) {
        console.log('error')
        return {
            ok:false,
            msg:'El token no es valido'
        }
    }
    
}

module.exports = {
    validarTokenSocket,
    generateToken};