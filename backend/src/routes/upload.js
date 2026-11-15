const express=require('express');const multer=require('multer');const path=require('path');const fs=require('fs');const {randomUUID}=require('crypto');const {auth}=require('../middleware/auth');const {wrap}=require('../utils/http');
const r=express.Router();const dir=path.join(__dirname,'../../uploads');fs.mkdirSync(dir,{recursive:true});
const storage=multer.diskStorage({destination:dir,filename:(req,file,cb)=>cb(null,randomUUID()+({ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[file.mimetype]||'.bin'))});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
r.post('/',auth,upload.single('image'),(req,res)=>{if(!req.file)return res.status(400).json({message:'Valid image required (jpg/png/webp)'});res.status(201).json({url:`/uploads/${req.file.filename}`});});module.exports=r;
