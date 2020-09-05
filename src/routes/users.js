const express = require('express')
const router = express.Router();
const User = require('../models/User')
const passport = require('passport')

router.get('/users/signin', (req,res)=>{
    res.render('users/signin')
})

router.post('/users/signin',passport.authenticate('local',{
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureflash: true
}));

router.get('/users/signup', (req,res)=>{
    res.render('users/signup');
})

router.post('/users/signup',async (req,res)=>{
    const {name, email, password, confirm_password} = req.body;
    const errors = [];
    if(name.length<= 0 || email.length<= 0 || password.length<= 0 || confirm_password.length <= 0){
        errors.push({texto: 'Porfavor rellena todos los campos'});
    }
    if(password.length < 4){
        errors.push({texto: 'La contraseña debe ser minimo 4 caracteres'});
    }
    if(password != confirm_password){
        errors.push({texto:" las contraseñas no coinciden"})
    }
    if(errors.length > 0){
        res.render('users/signup',{errors,name,email});
    }else{
        const emailUSer = await User.findOne({email: email});
        if(emailUSer){
            req.flash('error_msg','El email ya está en uso');
            res.redirect('/users/signup');
        }
        const newUser = new User({name,email,password});
        newUser.password = await newUser.encryptPassword(password)
        await newUser.save();
        req.flash('success_msg', 'Registro exitoso');
        res.redirect('/users/signin');
    }
})

router.get('/users/logout', (req,res) => {
    req.logout();
    res.redirect('/');
});


module.exports = router;