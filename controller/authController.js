const { request, response } = require("express");
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const { v4: uuidv4 } = require('uuid');

const Usuario = require("../models/usuario");
const {generateToken} = require("../helpers/generarToken");
const Amigo = require("../models/amigo");
const Notificacion = require("../models/notificacion");

const fotoDefault = 'https://res.cloudinary.com/dljqyy9l7/image/upload/v1694990391/yk0adqwmt615fkpezdgx.jpg';



// Registrar usuario
const registerController = async(req = request, res = response) => {

    const{nombre, correo, password} = req.body;

    try {
        let usuario = await Usuario.findOne({correo});

        if(usuario){
            return res.status(400).json({
                msg:'El usuario ya esta registrado.'
            })
        }

        usuario = new Usuario({nombre, correo, password, foto:fotoDefault});

        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt);
        usuario.password = hash;


        const[dataUser, token] = await Promise.all([
            usuario.save(),
            generateToken(usuario.id)
        ])
        

        res.status(200).json({
            data:dataUser,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al registrar usuario'
        })
    }
    
}

// Loguear Usuario
const loginController = async(req = request, res = response) => {

    const{password} = req.body;
    const usuario  = req.usuario;

    try { 
        const verifyPassword = bcrypt.compareSync(password, usuario.password);
        if(!verifyPassword){
            return res.status(400).json({
                msg:'La contrasena es incorrecta'
            });
        }

        const token = await generateToken(usuario.id);

        res.status(200).json({
            data:usuario,
            token,
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal en el Login'
        });
    }
    
}

// Renovar Token
const tokenController = (req = request, res = response) =>{

    const usuario = req.usuario;
    try {
        res.status(201).json({
            data:usuario
        });

    } catch (error) {
        res.status(500).json({
            msg:'Algo salio mal al revisar el token'
        })
    }
}


// Actualizar Perfil
const updateProcfile = async(req = request, res = response) => {

    const{id} = req.params;
    const{nombre, descripcion, foto} = req.body;
    
    try {
        const usuario = await Usuario.findById(id);
        if(foto !== usuario.foto){
            const urlCortado = usuario.foto.split('/');
            const [url] = urlCortado[urlCortado.length - 1].split('.');
            await cloudinary.uploader.destroy(`ChatApp/FotoPerfil/${url}`);
            usuario.foto = foto;
        }

        descripcion ?  usuario.descripcion = descripcion : usuario.descripcion = 'Disponible';
        usuario.nombre = nombre;

        await usuario.save();
        res.status(200).json({
            data:usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:'Algo salio mal al - actualizar el perfil'
        })
    }
}


// Cargar Foto
const updateFoto = async(req = request, res = response) => {

    const{img} = req.body;

    try {
        if(img){
            const urlCortado = img.split('/');
            const [url] = urlCortado[urlCortado.length - 1].split('.');
            await cloudinary.uploader.destroy(`ChatApp/FotoPerfil/${url}`);
        }

        const path = `ChatApp/FotoPerfil/${uuidv4()}`;
        const foto = req.files.archivo.tempFilePath;

        const {secure_url} = await cloudinary.uploader.upload(foto, {public_id:path});

        res.status(201).json({
            foto:secure_url
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
          msg: "Algo salio mal - al actualizar Foto",
        });
        
    }
}

// Cancelar Foto
const cancelFoto = async(req = request, res = response) => {

    const{img} = req.body;

    try {
        if(img){
            const urlCortado = img.split('/');
            const [url] = urlCortado[urlCortado.length - 1].split('.');
            await cloudinary.uploader.destroy(`ChatApp/FotoPerfil/${url}`);
        }
        
        res.status(200).json({
            msg:'Foto cancelada'
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al cancelar la foto'
        })
    }
}



const googleController = async(req = request, res = response) => {

    const{name, email, picture} = req.body;

    try {

        let usuario = await Usuario.findOne({correo:email});
        if(!usuario){
            usuario = new Usuario({nombre:name, correo:email, foto:picture});
            await usuario.save();
        }

        const gToken = await generateToken(usuario.id);

        res.status(201).json({
            data:usuario,
            token:gToken
        });
        

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al - Iniciar con google'
        })
    }
};


// const eliminarCuenta = async(req = request, res = response) => {
//     const{id} = req.params;

//     try {
//         const amigos = await Amigo.find({$or:[{usuario:id}, {amigo:id}]});
//         amigos.forEach(async(amigo) => {
//             await Amigo.findOneAndDelete({$or:[{usuario:id}, {amigo:id}]})
//         });
        
//         await Notificacion.findOneAndDelete({amigo:id});
//         await Usuario.findByIdAndDelete(id);

//         res.status(200).json({
//             amigos
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             msg:'Algo salio mal al - Eliminar la cuenta'
//         });
//     }
// }

module.exports = {
    registerController,
    loginController,
    tokenController,
    updateProcfile,
    updateFoto,
    cancelFoto,
    googleController,
    // eliminarCuenta
}
