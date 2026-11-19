const express=require('express');
const {z}=require('zod');
const {db,Conversation,Message,User}=require('../models');
const {auth}=require('../middleware/auth');
const {wrap,fail,parse}=require('../utils/http');
const {upload,inspectMedia,removeMedia,mediaPath,publicMessage}=require('../utils/messageMedia');

const r=express.Router();
const id=z.coerce.number().int().positive();
const conversationOwned=wrap(async(req,res,next)=>{
  const conversation=await Conversation.findByPk(id.parse(req.params.id));
  if(!conversation)throw fail(404,'Conversation not found');
  if(conversation.organizerId!==req.user.id&&conversation.providerId!==req.user.id)throw fail(403,'Forbidden');
  req.conversation=conversation;
  next();
});
const findMessage=async(req,transaction)=>{
  const message=await Message.findOne({
    where:{id:id.parse(req.params.messageId),conversationId:req.conversation.id},
    ...(transaction?{transaction,lock:transaction.LOCK.UPDATE}:{}),
  });
  if(!message)throw fail(404,'Message not found');
  return message;
};
const editable=message=>{
  if(message.deletedAt)throw fail(410,'Message was deleted');
};

r.get('/conversations/:id/messages',auth,conversationOwned,wrap(async(req,res)=>{
  const messages=await Message.findAll({
    where:{conversationId:req.conversation.id},
    include:[{model:User,as:'sender',attributes:['id','name']}],
    order:[['createdAt','DESC'],['id','DESC']],limit:200,
  });
  res.json(messages.reverse().map(publicMessage));
}));

r.post('/conversations/:id/messages',auth,conversationOwned,upload.single('attachment'),wrap(async(req,res)=>{
  let media;
  try{
    const body=parse(z.object({body:z.string().trim().max(3000).optional()}).strict(),req.body);
    if(!body.body&&!req.file)throw fail(400,'Write a message or attach a photo or video.');
    if(req.file)media=await inspectMedia(req.file);
    const message=await db.transaction(async transaction=>{
      const item=await Message.create({body:body.body||'',...media,conversationId:req.conversation.id,senderId:req.user.id},{transaction});
      await req.conversation.update({updatedAt:new Date()},{transaction});
      return item;
    });
    res.status(201).json(publicMessage(message));
  }catch(error){
    await removeMedia(media?.attachmentKey||req.file?.filename);
    throw error;
  }
}));

r.patch('/conversations/:id/messages/:messageId',auth,conversationOwned,wrap(async(req,res)=>{
  const body=parse(z.object({body:z.string().trim().min(1).max(3000)}).strict(),req.body);
  const message=await db.transaction(async transaction=>{
    const item=await findMessage(req,transaction);
    if(item.senderId!==req.user.id)throw fail(403,'Only the sender can edit a message.');
    editable(item);
    if(!item.body||item.attachmentMime?.startsWith('audio/'))throw fail(400,'Voice and media-only messages cannot be edited.');
    await item.update({body:body.body,editedAt:new Date()},{transaction});
    return item;
  });
  res.json(publicMessage(message));
}));

r.delete('/conversations/:id/messages/:messageId',auth,conversationOwned,wrap(async(req,res)=>{
  let key;
  const message=await db.transaction(async transaction=>{
    const item=await findMessage(req,transaction);
    if(item.senderId!==req.user.id)throw fail(403,'Only the sender can delete a message.');
    if(item.deletedAt)return item;
    key=item.attachmentKey;
    await item.update({body:'',deletedAt:new Date(),attachmentKey:null,attachmentName:null,attachmentMime:null,attachmentSize:null,attachmentDuration:null},{transaction});
    return item;
  });
  await removeMedia(key);
  res.json(publicMessage(message));
}));

r.get('/conversations/:id/messages/:messageId/attachment',auth,conversationOwned,wrap(async(req,res,next)=>{
  const message=await findMessage(req);
  if(message.deletedAt||!message.attachmentKey)throw fail(404,'Attachment not found');
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.type(message.attachmentMime);
  res.sendFile(mediaPath(message.attachmentKey),error=>{
    if(error)next(error.code==='ENOENT'?fail(404,'Attachment not found'):error);
  });
}));

module.exports=r;
