const Amigo = require("../models/amigo");
const Notificacion = require("../models/notificacion");
const Usuario = require("../models/usuario");


const userAceptados = async(id) => {

    let deleteAmigos = [];
    let userActivo = await Amigo.find({amigo:id}).populate('usuario', 'nombre correo foto descripcion');

    if(userActivo.length !== 0){
        userActivo.forEach(amigo => {
            if(amigo.aceptado) deleteAmigos.push(amigo.usuario.id);
        });
    }

    userActivo = await Amigo.find({usuario:id}).populate('amigo', 'nombre correo foto descripcion');

    if(userActivo.length !== 0){
        userActivo.forEach(amigo => {
            if(amigo.aceptado) deleteAmigos.push(amigo.amigo.id);
        });
    }
   
    return deleteAmigos;
}

const agregarAmigo = async({usuario, amigo}) => {

    try {
        let [existeAmigo, notificacion] = await Promise.all([
            Amigo.findOne({$and:[{usuario}, {amigo}]}),
            Notificacion.findOne({amigo})
        ]);
        
        if(existeAmigo){
            const solicitud = existeAmigo.solicitud ? false:true;

            if(existeAmigo.solicitud) {
                if(notificacion.notificacionSolicitud) notificacion = notificacion.notificacionSolicitud-=1;
                else notificacion = 0;
            }
            else notificacion = notificacion.notificacionSolicitud+=1;
            
            let[updateAmigo, updateNotificacion] = await Promise.all([
                Amigo.findOneAndDelete({$and:[{usuario}, {amigo}]}, {new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion'),

                Notificacion.findOneAndUpdate({amigo}, {notificacionSolicitud:notificacion}, {new:true}),
            ]);

            const deleteAmigos = await userAceptados(amigo);

            const usuarios = await Usuario.find({_id:{$nin:[amigo, ...deleteAmigos]}});

            const{id} = updateAmigo.amigo;
            const{notificacionSolicitud} = updateNotificacion;
            updateAmigo.solicitud = solicitud;

            return {
                ok:true,
                data:updateAmigo,
                id,
                notificacion:notificacionSolicitud,
                usuarios,
            }
        }


        await Amigo.create({usuario, amigo});
        const amigos = await Amigo.findOne({$and:[{usuario}, {amigo}]}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion');
        
        const deleteAmigos = await userAceptados(amigo);
        const usuarios = await Usuario.find({_id:{$nin:[usuario, amigo, ...deleteAmigos]}});

        const{id} = amigos.amigo;

        if(notificacion){
            notificacion = notificacion.notificacionSolicitud+=1;
            notificacion = await Notificacion.findOneAndUpdate({amigo}, {notificacionSolicitud:notificacion}, {new:true});
        }
        else notificacion = await Notificacion.create({amigo, notificacionSolicitud:1});
        const{notificacionSolicitud} = notificacion;

        return {
            ok:true,
            data:amigos,
            id,
            notificacion:notificacionSolicitud,
            usuarios,
        }

    } catch (error) {
        console.log(error)
        return {
            ok:false,
            msg:'Algo salio mal'
        }
    }
}


const eliminarSolicitud = async({usuario, amigo}) => {

    try {
        const data = await Amigo.findOneAndDelete({$and:[{usuario:amigo}, {amigo:usuario}]},{new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion');
        const usuarios = await Usuario.find({_id:{$nin:[usuario]}});
        data.solicitud = false;

        const{id} = data.usuario;
        return {
            ok:true,
            data,
            id,
            usuarios
        }

    } catch (error) {
        console.log(error);
        return {
            ok:false,
            msg:'No se pudo eliminar la solicitud'
        }
    }
}


const resetNotificacion = async(id) => {

    try {
        await Notificacion.findOneAndUpdate({amigo:id}, {notificacionSolicitud:0}, {new:true});
        return {
            ok:true,
            data:0
        }

    } catch (error) {
        console.log(error)
        return {
            ok:false,
            msg:'algo salio mal al - restablecer notificacion'
        }
    }
}


const aceptarSolicitud = async({usuario, amigo}) =>{

    let data = {};
    
    try {
        const solicitud = await Amigo.findOne({$and:[{usuario:amigo}, {amigo:usuario}]});

        if(solicitud){
            data = await Amigo.findOneAndUpdate({$and:[{usuario:amigo}, {amigo:usuario}]}, {solicitud:false, aceptado:true}, {new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion')
        };
        
        const deleteAmigos1 = await userAceptados(amigo);

        const usuarios = await Usuario.find({_id:{$nin:[data.usuario.id, ...deleteAmigos1]}});

        const{id} = data.usuario;
        return {
            ok:true,
            data,
            id,
            usuarios
        }

    } catch (error) {
        console.log(error)
        return {
            ok:false,
            msg:'Algo salio mal al - Aceptar solicitud'
        }
    }
};


const deleteAmigo = async({amigo, usuario}) => {

    try{
         const[solicitud1, solicitud2] = await Promise.all([
            Amigo.findOne({$and:[{usuario}, {amigo}]}),
            Amigo.findOne({$and:[{usuario:amigo}, {amigo:usuario}]}),
        ]);
        

        if(solicitud1){
            data = await Amigo.findOneAndDelete({$and:[{usuario}, {amigo}]}, {new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion');

            const dataUser = data.usuario;

            data.usuario = data.amigo
            data.amigo = dataUser;

            const{id} = data.usuario;
            return {
                ok: true,
                data,
                id,
            };
        }

        if(solicitud2){
            data = await Amigo.findOneAndDelete({$and:[{usuario:amigo}, {amigo:usuario}]},{new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion');

            const{id} = data.usuario;
            return {
                ok: true,
                data,
                id,
            };
        };

        
    }catch(error){
        console.log(error)
        return {
            ok:false,
            msg:'Algo salio mal al - Eliminar amigo'
        }
    }
};


const enviarMensaje = async(payload) => {

    const{usuario, amigo, mensaje} = payload;

    let cortarMensaje = mensaje;
    if(mensaje.length > 25) cortarMensaje = cortarMensaje.slice(0, 25) + '...'

    try {
        const[mensaje1, mensaje2] = await Promise.all([
            Amigo.findOneAndUpdate({$and:[{usuario}, {amigo}]}, {$push:{mensajesUsuario:payload, mensajesAmigo:payload}, ultimoMsg:cortarMensaje, $inc:{notificacionAmigo:1}, ultimoUserEnChat:usuario}, {new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion'),

            Amigo.findOneAndUpdate({$and:[{usuario:amigo}, {amigo:usuario}]}, {$push:{mensajesUsuario:payload, mensajesAmigo:payload}, ultimoMsg:cortarMensaje, $inc:{notificacion:1}, ultimoUserEnChat:usuario}, {new:true}).populate('usuario', 'nombre correo foto descripcion').populate('amigo', 'nombre correo foto descripcion'),
        ]);

        
        if(mensaje1){
            const{mensajesUsuario,mensajesAmigo, amigo, usuario, ultimoMsg, solicitud,aceptado, notificacionAmigo, ultimoUserEnChat} = mensaje1;

            const{nombre:nombreU, correo:correoU, foto:fotoU, descripcion:descripcionU} = usuario;
            let upDataUsuario = {nombre:nombreU, correo:correoU, foto:fotoU, descripcion:descripcionU, _id:usuario.id};

            const{nombre, correo, foto, descripcion} = amigo;
            let upDataAmigo = {nombre, correo, foto, descripcion, _id:amigo.id};

            return{
                ok:true,
                data:{usuario:upDataUsuario, amigo:upDataAmigo, ultimoMsg, solicitud,aceptado, mensajesAmigo, mensajesUsuario, notificacion:notificacionAmigo, ultimoUserEnChat},
                id:amigo.id,
            }
        }
        else if(mensaje2){
            const{mensajesUsuario,mensajesAmigo, amigo, usuario, ultimoMsg, solicitud,aceptado, notificacion, ultimoUserEnChat} = mensaje2;

            const{nombre:nombreU, correo:correoU, foto:fotoU, descripcion:descripcionU} = usuario;
            let upDataUsuario = {nombre:nombreU, correo:correoU, foto:fotoU, descripcion:descripcionU, _id:usuario.id};

            const{nombre, correo, foto, descripcion} = amigo;
            let upDataAmigo = {nombre, correo, foto, descripcion, _id:amigo.id};

            return{
                ok:true,
                data:{usuario:upDataAmigo, amigo:upDataUsuario, ultimoMsg, solicitud,aceptado, mensajesAmigo:mensajesUsuario, mensajesUsuario:mensajesAmigo, notificacion, ultimoUserEnChat},
                id:usuario.id,
            }
        }
        else{
            return{
                ok:true,
                data:{mensajesAmigo:[], mensajesUsuario:[]},
                id:amigo,
            }
        }

    } catch (error) {
        console.log(error);
        return{
            ok:false,
            msg:'Algo salio mal - al Enviar mensaje'
        }
    }
};


const eliminarChat = async({usuario, amigo}) => {

    try {
        await Promise.all([
            Amigo.findOneAndUpdate({$and:[{usuario}, {amigo}]}, {mensajesUsuario:[], notificacionAmigo:0, notificacion:0}, {new:true}),
            Amigo.findOneAndUpdate({$and:[{usuario:amigo}, {amigo:usuario}]}, {mensajesAmigo:[], notificacionAmigo:0, notificacion:0}, {new:true})
        ]);

        return{
            ok:true,
            data:[],
        }


    } catch (error) {
        return {
            ok:false,
            msg:'Algo salio mal al - Eliminar el chat'
        }
    }
}


const obtenerMensajePorChat = async(payload) => {

    const{usuario, amigo} = payload;

    try {
        const[mensaje1, mensaje2] = await Promise.all([
            Amigo.findOneAndUpdate({$and:[{usuario}, {amigo}]}, {notificacionAmigo:0, notificacion:0}, {new:true}),
            Amigo.findOneAndUpdate({$and:[{usuario:amigo}, {amigo:usuario}]}, {notificacionAmigo:0, notificacion:0}, {new:true}),
        ]);

        
        if(mensaje1){
            return{
                ok:true,
                data:mensaje1,
                id:mensaje1.amigo
            }
        }
        else if(mensaje2){
            const{mensajesUsuario,mensajesAmigo, notificacion, usuario} = mensaje2;

            return{
                ok:true,
                data:{mensajesAmigo:mensajesUsuario, mensajesUsuario:mensajesAmigo, notificacion},
                id:usuario
            }
        }
        else{
            return{
                ok:true,
                data:{mensajesAmigo:[], mensajesUsuario:[], notificacion:0},
            }
        }

    } catch (error) {
        console.log(error);
        return{
            ok:false,
            msg:'Algo salio mal - al Obtener mensajes'
        }
    }
};


const updateNotificacionMsg = async({usuario, amigo }) => {
    
    try{
        await Promise.all([
            Amigo.findOneAndUpdate({$and:[{usuario}, {amigo}]}, {notificacion:0}, {new:true}),
            Amigo.findOneAndUpdate({$and:[{usuario:amigo}, {amigo:usuario}]}, {notificacionAmigo:0}, {new:true}),
        ]);
        return {
            ok:true
        }
    }catch(error){
        console.log(error)
        return {
            ok:false,
            msg:'Algo salio mal al - reset notiificacion'
        }
    }
};


const eliminarCuenta = async(id) => {

    try {
        const amigos = await Amigo.find({$or:[{usuario:id}, {amigo:id}]});
        amigos.forEach(async(amigo) => {
            await Amigo.findOneAndDelete({$or:[{usuario:id}, {amigo:id}]})
        });
        
        await Notificacion.findOneAndDelete({amigo:id});
        await Usuario.findByIdAndDelete(id);
        
        return {
            ok:true
        }
        
    } catch (error) {
        console.log(error);
        return {
            ok:false,
            msg:'Algo salio mal al - Eliminar la cuenta'
        };
    }
}

module.exports = {
    agregarAmigo,
    eliminarSolicitud,
    resetNotificacion,
    aceptarSolicitud,
    deleteAmigo,
    enviarMensaje,
    eliminarChat,
    obtenerMensajePorChat,
    updateNotificacionMsg,
    eliminarCuenta
}