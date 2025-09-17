const express = require('express');
const jwt = require('jsonwebtoken');

const addUserToRequest = (req, res, next) => {
    req.user = jwt;
    next();
};

const app = express();
app.use(addUserToRequest);