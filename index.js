const path = require('path');

const express = require('express');
const {mongoConnect} = require('./util/database');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');




const shopRoutes = require('./routes/shop'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

//const {mongoConnect} = require('./util/database');

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    }
  });
  
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' 
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

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



