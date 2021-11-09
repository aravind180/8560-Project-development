/*  Author: Aravind Ravikumar   
Aravind's Shopping cart */

//All images are downloaded from the free site https://www.pexels.com/

// import dependencies 
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// Express Validator setup
const {check, validationResult} = require('express-validator'); // ES6 standard for destructuring an object

// variable setup
var myApp = express();
myApp.use(bodyParser.urlencoded({extended:false}));

// connect to db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// setup of paths

myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

//passing data to DB
const Customer = mongoose.model('Customer', {
    name: String,
    address: String,
    city: String,
    province: String,
    phone: Number,
    email: String,
    tax: Number,
    cart: {},
    totalPrice: Number,
    totalTax: Number,
    pincode: String,
    delCharge: Number,
});

const items = [
    {
        name: 'Sneakers',
        id: 'sneakers'
    },
    {
        name: 'Flipflops',
        id: 'flipflops'
    },
    {
        name: 'Shoes',
        id: 'shoes'
    },
];

let cart = [];

//Home page
myApp.get('/',function(req,res){
    res.render('home',{
        items: items,
    }); 
});

//sneakers page
myApp.get('/items/sneakers', function(req, res){
    res.render('items/sneakers', { errors: [] }); 
});

myApp.post('/items/sneakers', [
    check('qty', 'Quantity must be a number').isNumeric()
 ], function(req, res){

    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        return res.render('items/sneakers', { errors }); 
    }

    const qty = req.body.qty;
    const price = req.body.price;
    if (parseInt(qty)) {
        cart.push({ id: 'sneakers', qty: parseInt(qty), price: parseInt(price) });
    }
    res.render('items/sneakers', { errors: [] }); 
});

//flipflops page
myApp.get('/items/flipflops', function(req, res){
    res.render('items/flipflops', { errors: [] }); 
});

myApp.post('/items/flipflops',  [
    check('qty', 'Quantity must be a number').isNumeric()
 ], function(req, res){
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        return res.render('items/flipflops', { errors }); 
    }

    const qty = req.body.qty;
    const price = req.body.price;
    if (parseInt(qty)) {
        cart.push({ id: 'flipflops', qty: parseInt(qty), price: parseInt(price) });
    }
    res.render('items/flipflops', { errors: [] }); 
});

//shoes page
myApp.get('/items/shoes', function(req, res){
    res.render('items/shoes', { errors: [] }); 
});

myApp.post('/items/shoes', [
    check('qty', 'Quantity must be a number').isNumeric()
 ], function(req, res){
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        return res.render('items/shoes', { errors }); 
    }
    
    const qty = req.body.qty;
    const price = req.body.price;
    if (parseInt(qty)) {
        cart.push({ id: 'shoes', qty: parseInt(qty), price: parseInt(price) });
    }
    res.render('items/shoes', { errors: [] }); 
});

//shoppingcart page
myApp.get('/shoppingcart',function(req,res){
    res.render('shoppingcart', {
        cart: cart,
    }); 
});

//allorders page route
myApp.get('/allorders', function(req, res){
    Customer.find({}).then(function(allOrders) {
        res.render('allorders', {
            allOrders,
        }); 
    });
});

//shoppingcart page clear button
myApp.get('/clear',function(req,res){
    cart = [];
    res.redirect('/shoppingcart');
});

myApp.get('/receipt',function(req,res){
    res.render('customer', { errors: [] }); 
});

//receipt page
myApp.post('/receipt', [
    check('name', 'Must have a name').notEmpty(),
    check('address', 'Must have address').notEmpty(),
    check('phone', 'Must have a valid phone number').isNumeric(),
    check('city', 'Must have a city').notEmpty(),
    check('email', 'Must have email').isEmail(),
    check('province', 'Must have a valid province').isIn(['Alberta', 'Yukon', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'British Columbia', 'Saskatchewan']),
    check('pincode', 'Invalid pincode').matches(/^[A-Z]\d[A-Z]-\d[A-Z]\d$/),
    check('delivery', 'Invalid delivery option').isIn(['1', '2', '3']),
 ], function(req,res){
    const name = req.body.name;
    const address = req.body.address;
    const city = req.body.city;
    const province = req.body.province;
    const phone = req.body.phone;
    const email = req.body.email;
    const pincode = req.body.pincode;
    const delivery = req.body.delivery;
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        return res.render('customer', { errors }); 
    }

    let tax = 0;
    if (province === "Alberta") {
        tax = 0.05;
    } else if (province === "British Columbia") {
        tax = 0.12;
    } else if (province === "Manitoba") {
        tax = 0.12;
    } else if (province === "New Brunswick") {
        tax = 0.15;
    } else if (province === "Newfoundland and Labrador") {
        tax = 0.15;
    } else if (province === "Northwest Territories") {
        tax = 0.13;
    } else if (province === "Nova Scotia") {
        tax = 0.11;
    } else if (province === "Nunavut") {
        tax = 0.13;
    } else if (province === "Ontario") {
        tax = 0.13;
    } else if (province === "Prince Edward Island") {
        tax = 0.11;
    } else if (province === "Quebec") {
        tax = 0.13;
    } else if (province === "Saskatchewan") {
        tax = 0.13;
    } else if (province === "Yukon") {
        tax = 0.11;
    }

    let delCharge = 0;
    if (delivery == "1") {
        delCharge = 30;
    } else if (delivery == "2") {
        delCharge = 20;
    } else {
        delCharge = 10;
    }

    let totalPrice = 0;
    let totalTax = 0;
    cart.forEach(item => {
        item.rowPrice = item.price * item.qty;
        item.rowTax = (item.qty * item.price) * tax;
        totalPrice += item.price * item.qty;
        totalTax += (item.qty * item.price) * tax;
    });
    // totalPrice += delCharge;

    const cust = new Customer({ name, address, city, province, phone, email, tax, cart, totalPrice, totalTax, pincode, delCharge });
    cust.save().then((saved) => {
        res.render('receipt', {
            customer: saved,
        }); 
    });
});


// server listening to port 8080
myApp.listen(8080);

//tell everything was ok
console.log('Everything executed fine.. website at port 8080....');


