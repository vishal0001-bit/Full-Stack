const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is connected' });
});

let products = [
    { id: 1, name: 'Wireless Headphones', price: 89.99, rating: 4.7 },
    { id: 2, name: 'Smart Watch', price: 149.5, rating: 4.5 },
    { id: 3, name: 'Portable Speaker', price: 59.99, rating: 4.2 },
];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { name, price, rating } = req.body || {};
    const parsedPrice = Number(price);
    const parsedRating = Number(rating);

    if (
        typeof name !== 'string' ||
        !name.trim() ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice <= 0 ||
        !Number.isFinite(parsedRating) ||
        parsedRating < 0 ||
        parsedRating > 5
    ) {
        return res.status(400).json({
            error: 'Enter a product name, a price greater than 0, and a rating from 0 to 5.',
        });
    }

    const product = {
        id: products.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1,
        name: name.trim(),
        price: parsedPrice,
        rating: parsedRating,
    };

    products.push(product);
    res.status(201).json(product);
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
