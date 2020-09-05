const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { isAuthenticated } = require('../helpers/auth') 


router.get('/notes', isAuthenticated, async (req,res)=>{
    await Note.find({user: req.user.id}).sort({date:'desc'})
    .then(documentos =>{
        const contexto = {
            notes: documentos.map(documento =>{
                return{
                    id: documento.id,
                    title: documento.title,
                    description: documento.description
                }
            })
        }
        res.render('notes/all-notes',{
            notes: contexto.notes
        });
    })
});

router.get('/notes/add', isAuthenticated, (req, res) =>{
    res.render('notes/new-note');
})

router.post('/notes/new-note', isAuthenticated, async (req,res)=>{
    const {title, description} = req.body;
    const errors =[];
    if(!title){
        errors.push({text: 'Porfavor ingresa un titulo'});
    }
    if(!description){
        errors.push({text: 'Porfavor ingresa una descripcion'})
    }
    if(errors.length>0){
        res.render('notes/new-note',{
            errors,
            title,
            description
        });
    }else{
        const newNote = new Note({ title, description});
        newNote.user = req.user.id;
        await newNote.save()
        req.flash('success_msg', 'Nota agregada correctamente');
        res.redirect('/notes')
    }
    
})

router.get('/notes/edit/:id', isAuthenticated, async (req, res)=>{
    const {id}= req.params;
    const notes = await Note.findById(id)
    .then(data =>{
        return{
            title:data.title,
            description:data.description,
            _id: data.id
        }
    })    
        console.log(notes)
        res.render('notes/edit-note',{notes});
})

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id,{title,description});
    req.flash('success_msg','Nota actualizada correctamente');
    res.redirect('/notes');
});

router.delete('/notes/delete/:id',isAuthenticated, async (req, res) => {
     await Note.findOneAndDelete(req.params.id)
     req.flash('success_msg','Nota eliminada correctamente')
    res.redirect("/notes");
});

module.exports = router;