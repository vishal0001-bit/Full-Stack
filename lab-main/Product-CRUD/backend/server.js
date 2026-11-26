const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Force Node.js to use Google DNS (fixes querySrv ECONNREFUSED on restricted networks)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
const port = process.env.PORT || 3002;
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]);

app.use(express.json());

app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin && allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

function validateProduct(body) {
    const { name, price, rating } = body || {};
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
        return {
            error: 'Enter a product name, a price greater than 0, and a rating from 0 to 5.',
        };
    }

    return {
        value: {
            name: name.trim(),
            price: parsedPrice,
            rating: parsedRating,
        },
    };
}

function getProductId(req, res) {
    const id = req.params.id;
    if (!/^[a-f\d]{24}$/i.test(id)) {
        res.status(400).json({ error: 'Product ID must be a valid MongoDB ObjectId.' });
        return null;
    }
    return id;
}

function formatProduct(product) {
    return {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        rating: product.rating,
    };
}

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(formatProduct));
});

app.get('/api/products/:id', async (req, res) => {
    const id = getProductId(req, res);
    if (id === null) return;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(formatProduct(product));
});

app.post('/api/products', async (req, res) => {
    const result = validateProduct(req.body);
    if (result.error) return res.status(400).json(result);

    const product = await Product.create(result.value);
    res.status(201).json(formatProduct(product));
});

app.put('/api/products/:id', async (req, res) => {
    const id = getProductId(req, res);
    if (id === null) return;

    const result = validateProduct(req.body);
    if (result.error) return res.status(400).json(result);

    const product = await Product.findByIdAndUpdate(id, result.value, {
        new: true,
        runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(formatProduct(product));
});

app.delete('/api/products/:id', async (req, res) => {
    const id = getProductId(req, res);
    if (id === null) return;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
});

async function startServer() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required. Add it to backend/.env.');
    }

    const uriDatabaseName = decodeURIComponent(
        new URL(mongoUri).pathname.slice(1).split('/')[0]
    );
    const databaseName = process.env.MONGODB_DB || uriDatabaseName || 'product_crud';
    await mongoose.connect(mongoUri, { dbName: databaseName });
    app.listen(port, () => {
        console.log(`Product API running at http://localhost:${port}`);
        console.log(`Connected to MongoDB database "${databaseName}".`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start Product API:', error.message);
    process.exitCode = 1;
});
