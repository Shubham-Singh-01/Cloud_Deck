const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'FollowThatDamnTrainCJ';


// Create a User using: POST "/api/auth/Createuser". No Login Required
router.post('/Createuser',     [
    body('name', 'Enter a valid name').isLength({ min:5 }),
    body('password','Enter a valid 8 Character password').isLength({ min:8 }),
    body('email','Enter a valid email').isEmail(),
] , async (req, res)=>{

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    // Check whether the user with this email exists already
    try {
       let user = await User.findOne({email: req.body.email});
        if (user){
            return res.status(400).json({error: "Sorry a user with this email already exists"})
        }
    
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    
    // Create a new User
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });
    // JwtAuthToken    
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken})
        // res.json(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal error occurred");
    }

    // .then(user => res.json(user))
    // .catch(error => {
    //     console.error('Error creating user:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    // });
});
module.exports = router