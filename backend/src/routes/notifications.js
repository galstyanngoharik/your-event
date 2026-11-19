const express=require('express');
const {z}=require('zod');
const {Notification}=require('../models');
const {auth}=require('../middleware/auth');
const {wrap,fail,parse}=require('../utils/http');
const r=express.Router();
const id=z.coerce.number().int().positive();

r.get('/notifications',auth,wrap(async(req,res)=>{
  const paging=parse(z.object({
    offset:z.coerce.number().int().min(0).default(0),
    limit:z.coerce.number().int().min(1).max(50).default(20),
  }).strict(),req.query);
  const where={recipientId:req.user.id};
  const [{rows,count},unreadCount]=await Promise.all([
    Notification.findAndCountAll({where,...paging,order:[['createdAt','DESC'],['id','DESC']],attributes:{exclude:['dedupeKey']}}),
    Notification.count({where:{...where,readAt:null}}),
  ]);
  res.json({notifications:rows,total:count,unreadCount});
}));
r.patch('/notifications/read-all',auth,wrap(async(req,res)=>{
  const [updated]=await Notification.update({readAt:new Date()},{where:{recipientId:req.user.id,readAt:null}});
  res.json({updated});
}));
r.patch('/notifications/:id/read',auth,wrap(async(req,res)=>{
  const notice=await Notification.findOne({where:{id:id.parse(req.params.id),recipientId:req.user.id},attributes:{exclude:['dedupeKey']}});
  if(!notice)throw fail(404,'Notification not found');
  if(!notice.readAt)await notice.update({readAt:new Date()});
  res.json(notice);
}));
module.exports=r;
