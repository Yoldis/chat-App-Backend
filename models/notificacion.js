const{Schema, model} = require('mongoose');


const NotificacionSchema = Schema({

    amigo:{
        type:Schema.Types.ObjectId,
        ref:'Usuario',
        required:true
    },

    notificacionSolicitud:{
        type:Number,
        default:0,
    },

})


NotificacionSchema.methods.toJson = function(){
    const{_v, _id, ...notificacion} = this.toObject();
    notificacion.id = _id;
    return notificacion;
}

module.exports = model('Notificacion', NotificacionSchema);