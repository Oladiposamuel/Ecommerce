const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const {mongoConnect} = require('./util/database');

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/', authRoutes);
app.use('/shop', shopRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
    const errorMessage = error.message || "Something went wrong";
    const errorStatus = error.statusCode || 500;
    return res.json({
        error: errorMessage,
        status: errorStatus,
        stack: error.stack,
        success: false,
    })
})

mongoConnect(() => {
    app.listen(8080, () => {
        console.log('Your server is running!');
    })
});



