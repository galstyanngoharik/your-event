const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const {randomUUID}=require('crypto');
const {z}=require('zod');
const {User,PortfolioItem}=require('../models');
const {auth,role}=require('../middleware/auth');
const {wrap,fail,parse}=require('../utils/http');

const r=express.Router();
const id=z.coerce.number().int().positive();
const dir=path.resolve(__dirname,'../../uploads/portfolio');
fs.mkdirSync(dir,{recursive:true});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:50*1024*1024}});
const safe=fn=>wrap(fn);

const detectMedia=file=>{
  const buffer=file.buffer;
  if(buffer.length>=3&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff)return {mediaType:'image',extension:'.jpg',maxSize:5*1024*1024};
  if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {mediaType:'image',extension:'.png',maxSize:5*1024*1024};
  if(buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return {mediaType:'image',extension:'.webp',maxSize:5*1024*1024};
  if(buffer.length>=12&&buffer.toString('ascii',4,8)==='ftyp')return {mediaType:'video',extension:'.mp4',maxSize:50*1024*1024};
  if(buffer.length>=4&&buffer.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])))return {mediaType:'video',extension:'.webm',maxSize:50*1024*1024};
  throw fail(400,'Unsupported media. Upload a JPG, PNG, WEBP, MP4 or WEBM file.');
};

r.get('/:id/portfolio',safe(async(req,res)=>{
  const providerId=id.parse(req.params.id);
  const provider=await User.findOne({where:{id:providerId,role:'provider'},attributes:['id']});
  if(!provider)throw fail(404,'Provider not found');
  res.json(await PortfolioItem.findAll({where:{providerId},order:[['position','ASC'],['createdAt','ASC']]}));
}));

r.post('/me/portfolio',auth,role('provider'),upload.single('media'),safe(async(req,res)=>{
  if(!req.file)throw fail(400,'Media file is required.');
  const media=detectMedia(req.file);
  if(req.file.size>media.maxSize)throw fail(400,media.mediaType==='image'?'Images must be smaller than 5 MB.':'Videos must be smaller than 50 MB.');
  const body=parse(z.object({caption:z.string().trim().max(250).nullable().optional()}).strict(),req.body);
  const filename=`${randomUUID()}${media.extension}`;
  const filepath=path.join(dir,filename);
  await fs.promises.writeFile(filepath,req.file.buffer,{flag:'wx'});
  try{
    const position=Number(await PortfolioItem.max('position',{where:{providerId:req.user.id}})??-1)+1;
    const item=await PortfolioItem.create({providerId:req.user.id,mediaUrl:`/uploads/portfolio/${filename}`,mediaType:media.mediaType,caption:body.caption?.trim()||null,position});
    res.status(201).json(item);
  }catch(error){
    await fs.promises.unlink(filepath).catch(()=>{});
    throw error;
  }
}));

r.patch('/me/portfolio/:id',auth,role('provider'),safe(async(req,res)=>{
  const item=await PortfolioItem.findOne({where:{id:id.parse(req.params.id),providerId:req.user.id}});
  if(!item)throw fail(404,'Portfolio item not found');
  const data=parse(z.object({caption:z.string().trim().max(250).nullable().optional(),position:z.number().int().min(0).max(10000).optional()}).strict(),req.body);
  await item.update({...data,caption:data.caption===undefined?undefined:data.caption?.trim()||null});
  res.json(item);
}));

r.delete('/me/portfolio/:id',auth,role('provider'),safe(async(req,res)=>{
  const item=await PortfolioItem.findOne({where:{id:id.parse(req.params.id),providerId:req.user.id}});
  if(!item)throw fail(404,'Portfolio item not found');
  if(!item.mediaUrl.startsWith('/uploads/portfolio/'))throw fail(400,'Invalid media path');
  const filepath=path.resolve(dir,path.basename(item.mediaUrl));
  if(!filepath.startsWith(`${dir}${path.sep}`))throw fail(400,'Invalid media path');
  await item.destroy();
  await fs.promises.unlink(filepath).catch(error=>{if(error.code!=='ENOENT')throw error;});
  res.status(204).end();
}));

module.exports=r;