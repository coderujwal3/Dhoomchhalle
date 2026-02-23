const app = require('./app');
require('dotenv').config()


const connectToDB = require('./config/db');
connectToDB();

const port = 3000
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})