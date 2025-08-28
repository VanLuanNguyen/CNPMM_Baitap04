require('dotenv').config();

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRouter = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8888;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomepage);
app.use('/', webAPI);

app.use('/v1/api/', apiRouter);
(async () => {
    try {
        await connection();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.log('Failed to connect to database', error);
    }
})()