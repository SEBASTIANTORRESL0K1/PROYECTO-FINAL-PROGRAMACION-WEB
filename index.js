// index.js

const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const userRouter = require('./router/users.router.js');
const productRouter = require('./router/products.router.js');
const orderRouter = require('./router/orders.router.js');

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.get('/', (req, res) => {
    console.log(req.params);
    res.send('Hello World!');
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))