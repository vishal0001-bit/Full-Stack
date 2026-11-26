
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Temporary Product Data
let products = [
    {
        id: 1,
        name: "Laptop",
        price: 50000,
        description: "HP Laptop"
    },
    {
        id: 2,
        name: "Mobile",
        price: 20000,
        description: "Samsung Mobile"
    }
];

// 1. CREATE - POST
app.post('/products', (req, res) => {
    const product = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    };

    products.push(product);

    res.status(201).json({
        message: "Product Added Successfully",
        product: product
    });
});

// 2. READ ALL - GET
app.get('/products', (req, res) => {
    res.json(products);
});

// 3. READ SINGLE - GET
app.get('/products/:id', (req, res) => {
    const product = products.find(
        p => p.id === parseInt(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            message: "Product Not Found"
        });
    }

    res.json(product);
});

// 4. UPDATE - PUT
app.put('/products/:id', (req, res) => {
    const product = products.find(
        p => p.id === parseInt(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            message: "Product Not Found"
        });
    }

    product.name = req.body.name;
    product.price = req.body.price;
    product.description = req.body.description;

    res.json({
        message: "Product Updated Successfully",
        product: product
    });
});

// 5. DELETE - DELETE
app.delete('/products/:id', (req, res) => {
    const index = products.findIndex(
        p => p.id === parseInt(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Product Not Found"
        });
    }

    products.splice(index, 1);

    res.json({
        message: "Product Deleted Successfully"
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
