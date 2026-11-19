const express=require('express');
const {z}=require('zod');
const {TimelineActivity}=require('../models');
const {auth,role}=require('../middleware/auth');
const {wrap,fail,parse}=require('../utils/http');
const eventOwned=require('../utils/eventOwned');

const r=express.Router();
const id=z.coerce.number().int().positive();
const time=z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/,'Use a valid time in HH:mm format.');
const fields=z.object({
  title:z.string().trim().min(1).max(160),
  startTime:time,
  endTime:time.nullable().optional(),
  description:z.string().trim().max(1500).nullable().optional(),
  location:z.string().trim().max(250).nullable().optional(),
}).strict();
const validateOrder=values=>{
  if(values.endTime&&values.endTime<=values.startTime)throw fail(400,'End time must be later than start time on the same day.');
};
const activityOwned=async req=>{
  const event=await eventOwned(req);
  const activity=await TimelineActivity.findOne({where:{id:id.parse(req.params.activityId),eventId:event.id}});
  if(!activity)throw fail(404,'Timeline activity not found');
  return activity;
};

r.get('/events/:eventId/timeline',auth,role('organizer'),wrap(async(req,res)=>{
  const event=await eventOwned(req);
  res.json(await TimelineActivity.findAll({where:{eventId:event.id},order:[['startTime','ASC'],['id','ASC']]}));
}));
r.post('/events/:eventId/timeline',auth,role('organizer'),wrap(async(req,res)=>{
  const event=await eventOwned(req);
  const values=parse(fields,req.body);
  validateOrder(values);
  res.status(201).json(await TimelineActivity.create({...values,eventId:event.id}));
}));
r.patch('/events/:eventId/timeline/:activityId',auth,role('organizer'),wrap(async(req,res)=>{
  const activity=await activityOwned(req);
  const values=parse(fields.partial().refine(value=>Object.keys(value).length>0,'Provide at least one field.'),req.body);
  validateOrder({...activity.toJSON(),...values});
  await activity.update(values);
  res.json(activity);
}));
r.delete('/events/:eventId/timeline/:activityId',auth,role('organizer'),wrap(async(req,res)=>{
  const activity=await activityOwned(req);
  await activity.destroy();
  res.status(204).end();
}));
module.exports=r;
