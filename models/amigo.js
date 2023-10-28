const {Schema, model } = require('mongoose');

const AmigoSchema = Schema({

    usuario:{
        type:Schema.Types.ObjectId,
        ref:'Usuario',
        required:true
    },

    amigo:{
        type:Schema.Types.ObjectId,
        ref:'Usuario',
        required:true
    },

    solicitud:{
        type:Boolean,
        default:true
    },

    aceptado:{
        type:Boolean,
        default:false
    },

    mensajesUsuario:{
        type:Array
    },

    mensajesAmigo:{
        type:Array
    },

    ultimoUserEnChat:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },

    ultimoMsg:{
        type:String,
        default:''
    },

    notificacion:{
        type:Number,
        default:0,
    },

    notificacionAmigo:{
        type:Number,
        default:0,
    },
})

AmigoSchema.methods.toJSON = function(){
    const{__v, _id, ...amigos} = this.toObject();
    amigos.id = _id;
    return amigos;
}

module.exports = model('Amigo', AmigoSchema);