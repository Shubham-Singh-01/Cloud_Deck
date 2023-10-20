const express = require('express');
const User = require('../models/User');
const router = express.Router();


// Create a User using: POST "/api/auth". Doesn't require Auth
router.post('/', (req, res)=>{
    console.log(req.body);
    res.send(req.body);
    const user = User(req.body);
    user.save()
    res.json(obj)

})

module.exports = router