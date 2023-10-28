const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');

const dbConection = require('../db/config');
const socketController = require('../socket/socketController');



class Server {
    constructor(){
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server, {cors:{
            origin:'http://localhost:5173'
        }});

        this.port = process.env.PORT;

        this.path = {
            auth:'/api/auth/',
            amigos:'/api/amigos/',
            notificacion:'/api/notificacion/',
        };

        this.conectedDataBase();

        this.middleware();

        this.routes();
        
        this.socket();
    }

    async conectedDataBase(){
        await dbConection();
    }

    middleware(){
        this.app.use(cors());
        this.app.use(express.static('public'));
        this.app.use(express.json());

        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/'
        }));
    }

    routes(){
        this.app.use(this.path.auth, require('../routes/authRoutes'));
        this.app.use(this.path.amigos, require('../routes/amigoRouter'));
        this.app.use(this.path.notificacion, require('../routes/notificacionRouter'));

        this.app.get('*', (req , res) => {
            res.sendFile('index.html', {'root': __dirname + '/../public/'});
        });
    }

    socket(){
        this.io.on('connection', (socket) => socketController(socket, this.io));
    }

    listen(){
        this.server.listen(this.port, () => {
            console.log('Servidor Lenvantado en el puerto ' + this.port);
        })
    }

}

module.exports = Server;