const { validarTokenSocket } = require("../helpers/generarToken");
const { agregarAmigo, eliminarSolicitud, resetNotificacion, aceptarSolicitud, deleteAmigo, enviarMensaje, eliminarChat, obtenerMensajePorChat, updateNotificacionMsg, eliminarCuenta } = require("./amigoSocket");


const socketController = async(socket, io) => {
    
    // const token = socket.handshake.headers.token;
    // const {ok, usuario} = await validarTokenSocket(token);

    const id = socket.handshake.headers.id;
    if(!id){
        return socket.disconnect();
    }

    socket.join(id);
    io.emit('conectado', {id:id, online:true});


    socket.on('disconnect', () => {
        io.emit('desconectado', {id:id, online:false});
    });

    
    socket.on('agregar-amigo', async(payload, callback) => {
        const {usuario, amigo} = payload;

        const data = await agregarAmigo({usuario, amigo});
        callback(data);
        socket.to(data.id).emit('enviar-agregar-amigo', data);
    });


    socket.on('eliminar-solicitud', async(payload, callback) => {
        const {usuario, amigo} = payload;

        const data = await eliminarSolicitud({usuario, amigo});
        callback(data);
        socket.to(data.id).emit('enviar-eliminar-solicitud', data);
    });


    socket.on('reset-notificacion', async(payload, callback) => {
        
        const{id} = payload;
        const data = await resetNotificacion(id);
        callback(data);
    });


    socket.on('aceptar-solicitud', async(payload, callback) => {
        const {usuario, amigo} = payload;

        const data = await aceptarSolicitud({usuario, amigo});
        callback(data);
        socket.to(data.id).emit('enviar-aceptar-solicitud', data);
    });

    
    socket.on('eliminar-amigo', async(payload, callback) =>{
        
        const data = await deleteAmigo(payload);
        callback(data);
        socket.to(data.id).emit('enviar-eliminar-amigo', data);
    });


    socket.on('enviar-mensaje', async(payload, callback) => {

        const data = await enviarMensaje(payload);
        callback(data);
        socket.to(data.id).emit('enviar-recibir-mensaje', data);
    });


    socket.on('eliminar-chat', async(payload, callback) => {

        const data = await eliminarChat(payload);
        callback(data);
    });


    socket.on('obtener-mensajes', async(payload, callback) => {
        
        const data = await obtenerMensajePorChat(payload);
        callback(data);
    });

    socket.on('escribiendo', async(payload) => {
        
        await updateNotificacionMsg(payload);
        socket.to(payload.amigo).emit('recibir-escribiendo', payload);
    });

    socket.on('eliminar-cuenta', async(payload) => {
        
        await eliminarCuenta(payload.usuario);
        socket.broadcast.emit('enviar-eliminar-cuenta', payload);
    });

}


module.exports = socketController;