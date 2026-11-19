const {Op}=require('sequelize');
const timeZone=process.env.APP_TIMEZONE||'Asia/Yerevan';
let running=null;

const generateReminders=(now=new Date())=>{
  if(running)return running;
  running=(async()=>{
    const {Event,Task,Notification}=require('../models');
    const tomorrow=new Date(now.getTime()+24*60*60*1000);
    const events=await Event.findAll({where:{status:'planning',date:{[Op.gt]:now,[Op.lte]:tomorrow}}});
    for(const event of events){
      const date=new Date(event.date);
      const when=date.toLocaleString('en-US',{timeZone,dateStyle:'medium',timeStyle:'short'});
      const values={
        recipientId:event.organizerId,type:'event_reminder',title:'Your event is approaching',
        description:`${event.title} starts ${when}.`.slice(0,500),
        entityId:event.id,link:`/organizer/events/${event.id}`,
        dedupeKey:`event:${event.id}:${date.toISOString()}:24h`,
      };
      await Notification.findOrCreate({where:{dedupeKey:values.dedupeKey},defaults:values});
    }
    const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
    const tasks=await Task.findAll({
      where:{completed:false,dueDate:{[Op.between]:[day(now),day(tomorrow)]}},
      include:[{model:Event,required:true,where:{status:'planning'}}],
    });
    for(const task of tasks){
      if(!task.Event)continue;
      const values={
        recipientId:task.Event.organizerId,type:'task_reminder',title:'Task due soon',
        description:`${task.title} is due ${task.dueDate} for ${task.Event.title}.`.slice(0,500),
        entityId:task.eventId,link:`/organizer/events/${task.eventId}`,
        dedupeKey:`task:${task.id}:${task.dueDate}`,
      };
      await Notification.findOrCreate({where:{dedupeKey:values.dedupeKey},defaults:values});
    }
  })().finally(()=>{running=null;});
  return running;
};
const startReminders=()=>{
  const check=()=>generateReminders().catch(error=>console.error('Notification reminders failed:',error.message));
  void check();
  const interval=setInterval(check,60000);
  interval.unref();
  return ()=>clearInterval(interval);
};
module.exports={generateReminders,startReminders};
