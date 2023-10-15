const authRouter = require('./auth')
const userRouter = require('./user')

function route(app) {
    app.use('/v1/auth', authRouter);
    app.use('/v1/user', userRouter);
} 

module.exports = route;