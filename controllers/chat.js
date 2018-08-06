// exports.show = (req, res) => {
//     res.render('chat', {
//         title: "ChatS"
//     });
// }

// var gravatar = require('gravatar');

// var Chat = require('./models/chatMsg.js');
// var myDatabase = require('./database');
// var sequelize = myDatabase.sequelize;

// exports.list = function (req, res) {
//     sequelize.query('select * from chat', { model: Chat}).then((chat) => {

//         res.render('chat', {
//             title: 'Chats',
//             comments: chat,
//         })
//     }).catch((err)=>{
//         return res.status(400).send({
//             message: err
//         });
//     });
// };

// exports.create = function (req, res) {
//     console.log("sending messages")

//     var chatData = {
//         title: req.body.title,
//         content: req.body.content,
//         user_id: req.user.id
//     }

//     Chat.create(chatData).then((newMessage, created) => {
//         if (!newMessage) {
//             return res.send(400, {
//                 message: "error"
//             });
//         }

//         res.redirect('/chat');
//     })
// };

// exports.hasAuthorization = function (req, res, next){
//     if (req.isAuthenticated())
//         return next();
//     res.redirect('/login');
// }