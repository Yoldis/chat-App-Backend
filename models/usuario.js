const {Schema, model } = require('mongoose');


const UsuarioSchema = Schema({
    nombre:{
        type:String,
        required:true
    },

    correo:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        default:''
    },

    foto:{
        type:String,
        default:''
    },

    descripcion:{
        type:String,
        default:'Disponible'
    },
    
})

UsuarioSchema.methods.toJSON = function(){
    const{__v, password, _id, ...usuario} = this.toObject();
    usuario.id = _id;
    return usuario;
}


module.exports = model('Usuario', UsuarioSchema );