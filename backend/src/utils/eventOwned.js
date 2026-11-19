const {z}=require('zod');
const {fail}=require('./http');
const id=z.coerce.number().int().positive();

module.exports=async req=>{
  const {Event}=require('../models');
  const event=await Event.findByPk(id.parse(req.params.eventId||req.params.id));
  if(!event)throw fail(404,'Event not found');
  if(event.organizerId!==req.user.id)throw fail(403,'Forbidden');
  return event;
};
