const mongoose = require('mongoose');

const dbConection = async() => {

    try {
        await mongoose.connect(process.env.MONGO_CNN);
        console.log('Base de datos Online');
        
    } catch (error) {
        console.log(error);
        throw new Error('Error al inicial la base de datos');
    }
}

module.exports = dbConection;