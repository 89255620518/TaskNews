import express from "express";

express.request.user = undefined;

const app = express();
app.use((req, res, next) => {
    req.user = undefined;
    next();
});
