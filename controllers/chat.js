// exports.show = (req, res) => {
//     res.render('chat', {
//         title: "ChatS"
//     });
// }

var gravatar = require('gravatar');

var Chat = require('../models/chatMsg');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// const server = require('http').createServer()
// const io = require('socket.io')(server)
// const path = require('path')
// const express = require('express')
// const bodyParser = require('body-parser')
// const Chatkit = require('pusher-chatkit-server')

// const app = express()
// const chatkit = new Chatkit.default(require({
//     instanceLocator: "v1:us1:a945d917-b687-4adc-bd87-12c8825d1349",
//     key: "2bbb1c2c-4c86-4006-821c-eeb9a7bd2831:yyTBrQlKD4TW6ckUXDAwx5u9pIgFn3U4XsKmHVjkbaQ="
// }))

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(express.static(path.join(__dirname, 'assets')))

// app.post('/session/auth', (req, res) => {
//     res.json(chatkit.authenticate(req.body, req.query.user_id))
// })

// app.post('/session/load', (req, res, next) => {
//     // Attempt to create a new user with the email serving as the ID of the user.
//     // If there is no user matching the ID, we create one but if there is one we skip
//     // creating and go straight into fetching the chat room for that user
//     chatkit.createUser(req.body.email, req.body.name)
//         .then(() => getUserRoom(req, res, next))
//         .catch(err => {
//             (err.error_type === 'services/chatkit/user/user_already_exists')
//                 ? getUserRoom(req, res, next)
//                 : next(err)
//         })

//     function getUserRoom(req, res, next) {
//         const name  = req.body.name
//         const email = req.body.email

//         // Get the list of rooms the user belongs to. Check within that room 
//         // list for one whos name matches the users ID. If we find one, we 
//         // return that as the response, else we create the room and return 
//         // it as the response.
//         chatkit.apiRequest({method: 'GET', 'path': `/users/${email}/rooms`})
//             .then(rooms => {
//                 let clientRoom = false

//                 // Loop through user rooms to see if there is already a room for 
//                 // the client
//                 rooms.forEach(room => {
//                     return room.name === email ? (clientRoom = room) : false
//                 })

//                 if (clientRoom && clientRoom.id) {
//                     return res.json(clientRoom)
//                 }

//                 const createRoomRequest = {
//                     method: 'POST',
//                     path: '/rooms',
//                     jwt: chatkit.generateAccessToken({userId: email}).token,
//                     body: { name: email, private: false, user_ids: ['adminuser'] },
//                 };

//                 // Since we can't find a client room, we will create one and return 
//                 // that.
//                 chatkit.apiRequest(createRoomRequest)
//                        .then(room => res.json(room))
//                        .catch(err => next(
//                            new Error(`${err.error_type} - ${err.error_description}`)
//                        ))
//             })
//             .catch(err => next(
//                 new Error(`${err.error_type} - ${err.error_description}`)
//             ))
//     }
// })


// app.get('/', (req, res) => {
//     res.sendFile('index.html', {root: __dirname + '/views'})
//   })

// io.on('connection', function (client) {
//     socket.emit('subscribe', conversation_id);
    
//     socket.emit('send message', {
//         room: conversation_id,
//         message: "Some message"
//     });

//     socket.on('conversation private post', function(data) {
//         //display data.message
//    });
// },

// io.on('connection', function (server) {   
//     socket.on('subscribe', function(room) {
//         console.log('joining room', room);
//         socket.join(room);
//     });

//     socket.on('send message', function(data) {
//         console.log('sending room post', data.room);
//         socket.broadcast.to(data.room).emit('conversation private post', {
//             message: data.message
//         });
//     });

//     io.on('connection', function(socket) {
//         chatConnections++;
//         console.log("Num of chat users connected: "+chatConnections);

//         socket.on('disconnect', function() {
//             chatConnections++;
//             console.log("Num of chat users connected: "+chatConnections);
//         });
//     })
// }),

exports.list = function (req, res) {
    sequelize.query('select * from chat', { model: Chat}).then((chat) => {

        res.render('messages', {
            title: 'Chats',
            message: messages,
            gravatar: gravatar.url(chat.username, { s: '80', r: 'x', d: 'retro' }, true),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};

exports.create = function (req, res) {
    console.log("sending messages")

    var chatData = {
        message: req.body.message,
        username: req.username
    }

    Chat.create(chatData).then((newMessage, created) => {
        if (!newMessage) {
            return res.send(400, {
                message: "error"
            });
        }

        res.redirect('/chatMsg');
    })
};

exports.hasAuthorization = function (req, res, next){
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

// var io = socketIO();
// io.on('connection', function (socket){
//     // this runs whenever a client connects to this server
//     socket.on('anotherEventName', function (msg, nameSpaceName) {
//         io.of(nameSpaceName).emit('myEventName', msg, socket.id);
//     });
//     socket.on('disconnect', function() {
//         // this runs whenever a client disconnects from this server
//     });
// })

// app.post('/messages', function (req, res) {
//     // req.body contains messages sent by client
//     // to broadcast to everyone
//     io.emit('myEventName', req.body)
//     res.sendStatus(200)
// });

// server = require('http').createServer(app),
// io = require('socket.io').listen(server);
// conversations = {};

// app.get('/', function(req, res) {
// res.sendfile('/');
// });

// io.sockets.on('connection', function (socket) {

// socket.on('send message', function (data) {

//     var conversation_id = data.conversation_id;

//     if (conversation_id in conversations) {
//         console.log (conversation_id + ' is already in the conversations object');

//         // emit the message [data.message] to all connected users in the conversation

//     } else {
//         socket.conversation_id = data;
//         conversations[socket.conversation_id] = socket;

//         conversations[conversation_id] = data.conversation_id;

//         console.log ('adding '  + conversation_id + ' to conversations.');

//         // emit the message [data.message] to all connected users in the conversation

//     }
// })
// });

// io.on('connection', function (client) {
//     socket.emit('subscribe', conversation_id);
    
//     socket.emit('send message', {
//         room: conversation_id,
//         message: "Some message"
//     });

//     socket.on('conversation private post', function(data) {
//         //display data.message
//    });
// },

// io.on('connection', function (server) {   
//     socket.on('subscribe', function(room) {
//         console.log('joining room', room);
//         socket.join(room);
//     });

//     socket.on('send message', function(data) {
//         console.log('sending room post', data.room);
//         socket.broadcast.to(data.room).emit('conversation private post', {
//             message: data.message
//         });
//     });

//     io.on('connection', function(socket) {
//         chatConnections++;
//         console.log("Num of chat users connected: "+chatConnections);

//         socket.on('disconnect', function() {
//             chatConnections++;
//             console.log("Num of chat users connected: "+chatConnections);
//         });
//     })
// }),