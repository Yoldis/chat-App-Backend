const { request, response } = require("express");
const Usuario = require("../models/usuario");
const Amigo = require("../models/amigo");


const getSugerencias = async(req = request, res = response) => {

    const {id} = req.params;
    let amigos = [];
    let deleteAmigos = [];
    let usuarios = [];

    try {
        const userAceptados = async(id) => {
            let deleteAmigos = [];
            let userActivo = await Amigo.find({amigo:id}).populate('usuario', 'nombre correo foto descripcion');

            if(userActivo.length !== 0){
                userActivo.forEach(amigo => {
                    if(amigo.aceptado || amigo.solicitud) deleteAmigos.push(amigo.usuario.id);
                });
            }
            
            return deleteAmigos;
        }

        amigos = await Amigo.find({usuario:id}).populate('amigo', 'nombre correo foto descripcion');

        if(amigos.length !== 0){
            amigos.forEach(amigo => {
                if(amigo.aceptado || amigo.solicitud) deleteAmigos.push(amigo.amigo.id);
            });

            const deleteUserActivo = await userAceptados(id);
            usuarios = await Usuario.find({_id:{$nin:[...deleteAmigos, id, ...deleteUserActivo]}});
            
            const addUsuarios = [];
            amigos.forEach((a, i) => {
                if(a.solicitud){
                    const{id, nombre, correo, foto, descripcion} = a.amigo;
                    addUsuarios.push({id, nombre, correo,foto, descripcion, solicitud:a.solicitud});
                }
            });

            return res.status(200).json({
                data:[...usuarios, ...addUsuarios]
            });
        }

        amigos = await Amigo.find({amigo:id}).populate('usuario', 'nombre correo foto descripcion');
        
        if(amigos.length !== 0 ){
            amigos.forEach(amigo => {
                if(amigo.aceptado || amigo.solicitud) deleteAmigos.push(amigo.usuario.id);
            });

            usuarios = await Usuario.find({_id:{$nin:[...deleteAmigos, id]}});

            return res.status(200).json({
                data:usuarios
            });
        }

        else {
            usuarios = await Usuario.find({_id:{$nin:[id]}})
            res.status(200).json({
                data:usuarios
            });
    
        } 

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal - Sugerencia'
        })
    }
}


const getSolicitudes = async(req = request, res = response) => {
    const {id} = req.params;

    try {
        const amigos = await Amigo.find({amigo:id, solicitud:true, aceptado:false}).populate('usuario', 'nombre correo foto descripcion');

        const filterAmigos = amigos.map((amigo) => {
            const{id, nombre, correo, foto, descripcion} = amigo.usuario;
            return {id, nombre, correo, foto, descripcion, solicitud:amigo.solicitud, aceptado:amigo.aceptado}
        });

        res.status(200).json({
            data:filterAmigos
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al obtener - solicitudes'
        });
    }
}


const getAmigos = async(req = request, res = response) => {
    const {id} = req.params;
    let amigos = [];
    let filterAmigos = [];

    try {
        amigos = await Amigo.find({amigo:id, solicitud:false, aceptado:true}).populate('usuario', 'nombre correo foto descripcion');

        if(amigos){
            amigos.forEach((amigo) => {
                const{id, nombre, correo, foto, descripcion} = amigo.usuario;
                filterAmigos.push({id, nombre, correo, foto, descripcion, solicitud:amigo.solicitud, aceptado:amigo.aceptado, ultimoMsg:amigo.ultimoMsg, notificacion:amigo.notificacionAmigo, ultimoUserEnChat:amigo.ultimoUserEnChat}) ;
            });
        }

        if(amigos){
            amigos = await Amigo.find({usuario:id, solicitud:false, aceptado:true}).populate('amigo', 'nombre correo foto descripcion');

            amigos.forEach((amigo) => {
                const{id, nombre, correo, foto, descripcion} = amigo.amigo;
                filterAmigos.push({id, nombre, correo, foto, descripcion, solicitud:amigo.solicitud, aceptado:amigo.aceptado, ultimoMsg:amigo.ultimoMsg, notificacion:amigo.notificacion, ultimoUserEnChat:amigo.ultimoUserEnChat});
            });
        }
        
        res.status(200).json({
            data:filterAmigos
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al obtener - solicitudes'
        });
    }
}


module.exports = {
    getSugerencias,
    getSolicitudes,
    getAmigos,
}