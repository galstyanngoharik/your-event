const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const {randomUUID}=require('crypto');
const {z}=require('zod');
const {Event,MoodboardItem,MoodboardPalette}=require('../models');
const {auth,role}=require('../middleware/auth');
const {wrap,fail,parse}=require('../utils/http');

const r=express.Router();
const id=z.coerce.number().int().positive();
const safe=fn=>wrap(fn);
const dir=path.resolve(__dirname,'../../uploads/moodboards');
fs.mkdirSync(dir,{recursive:true});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});
const colorsSchema=z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(20);

const eventOwned=async(req)=>{
  const event=await Event.findByPk(id.parse(req.params.eventId));
  if(!event)throw fail(404,'Event not found');
  if(event.organizerId!==req.user.id)throw fail(403,'Forbidden');
  return event;
};

const imageExtension=file=>{
  const bytes=file.buffer;
  if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return '.jpg';
  if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return '.png';
  if(bytes.length>=12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return '.webp';
  throw fail(400,'Upload a valid JPG, PNG or WEBP image.');
};

r.get('/:eventId/moodboard',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const [items,palette]=await Promise.all([
    MoodboardItem.findAll({where:{eventId:event.id},order:[['position','ASC'],['createdAt','ASC']]}),
    MoodboardPalette.findOne({where:{eventId:event.id}}),
  ]);
  res.json({items,colors:palette?.colors||[],layout:palette?.layout||{}});
}));

r.post('/:eventId/moodboard',auth,role('organizer'),upload.single('image'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  if(!req.file)throw fail(400,'Image file is required.');
  const extension=imageExtension(req.file);
  const body=parse(z.object({caption:z.string().trim().max(250).nullable().optional()}).strict(),req.body);
  const filename=`${event.id}-${randomUUID()}${extension}`;
  const filepath=path.join(dir,filename);
  await fs.promises.writeFile(filepath,req.file.buffer,{flag:'wx'});
  try{
    const maxPosition=await MoodboardItem.max('position',{where:{eventId:event.id}});
    const item=await MoodboardItem.create({eventId:event.id,imageUrl:`/uploads/moodboards/${filename}`,caption:body.caption?.trim()||null,position:Number(maxPosition??-1)+1});
    res.status(201).json(item);
  }catch(error){
    await fs.promises.unlink(filepath).catch(()=>{});
    throw error;
  }
}));

r.patch('/:eventId/moodboard/order',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const body=parse(z.object({itemIds:z.array(id).max(200)}).strict(),req.body);
  if(new Set(body.itemIds).size!==body.itemIds.length)throw fail(400,'Duplicate moodboard item ids are not allowed.');
  const items=await MoodboardItem.findAll({where:{eventId:event.id}});
  if(items.length!==body.itemIds.length||items.some(item=>!body.itemIds.includes(item.id)))throw fail(400,'Order must include every moodboard item exactly once.');
  await Promise.all(body.itemIds.map((itemId,position)=>MoodboardItem.update({position},{where:{id:itemId,eventId:event.id}})));
  res.json(await MoodboardItem.findAll({where:{eventId:event.id},order:[['position','ASC'],['createdAt','ASC']]}));
}));

r.put('/:eventId/moodboard/layout',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const entry=z.object({
    x:z.number().finite().min(0).max(5000),
    y:z.number().finite().min(0).max(5000),
    width:z.number().finite().min(120).max(600),
    rotation:z.number().finite().min(-180).max(180),
    zIndex:z.number().int().min(0).max(1000000),
  }).strict();
  const body=parse(z.object({layout:z.record(entry)}).strict(),req.body);
  const keys=Object.keys(body.layout);
  if(keys.length>220)throw fail(400,'Too many layout entries.');
  const items=await MoodboardItem.findAll({where:{eventId:event.id}});
  const validKeys=new Set(items.map(item=>`photo-${item.id}`));
  for(const key of keys){
    if(!validKeys.has(key)&&!/^color-#[0-9A-F]{6}$/.test(key))throw fail(400,'Invalid layout item.');
  }
  const [palette]=await MoodboardPalette.findOrCreate({where:{eventId:event.id},defaults:{colors:[]}});
  await palette.update({layout:body.layout});
  res.json({layout:palette.layout});
}));

r.patch('/:eventId/moodboard/:itemId',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const item=await MoodboardItem.findOne({where:{id:id.parse(req.params.itemId),eventId:event.id}});
  if(!item)throw fail(404,'Moodboard item not found');
  const body=parse(z.object({caption:z.string().trim().max(250).nullable().optional()}).strict(),req.body);
  await item.update({caption:body.caption===undefined?undefined:body.caption?.trim()||null});
  res.json(item);
}));

r.delete('/:eventId/moodboard/:itemId',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const item=await MoodboardItem.findOne({where:{id:id.parse(req.params.itemId),eventId:event.id}});
  if(!item)throw fail(404,'Moodboard item not found');
  const filename=path.basename(item.imageUrl);
  const filepath=path.resolve(dir,filename);
  if(!item.imageUrl.startsWith(`/uploads/moodboards/${event.id}-`)||!filepath.startsWith(`${dir}${path.sep}`))throw fail(400,'Invalid moodboard image path.');
  await item.destroy();
  await fs.promises.unlink(filepath).catch(error=>{if(error.code!=='ENOENT')throw error;});
  res.status(204).end();
}));

r.put('/:eventId/moodboard/colors',auth,role('organizer'),safe(async(req,res)=>{
  const event=await eventOwned(req);
  const body=parse(z.object({colors:colorsSchema}).strict(),req.body);
  const [palette]=await MoodboardPalette.findOrCreate({where:{eventId:event.id},defaults:{colors:body.colors}});
  if(JSON.stringify(palette.colors)!==JSON.stringify(body.colors))await palette.update({colors:body.colors});
  res.json({colors:palette.colors});
}));

module.exports=r;
