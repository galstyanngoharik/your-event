require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const express=require('express');
const jwt=require('jsonwebtoken');
const {db,User,Event,Task,Invitation,Conversation,Message,Notification,TimelineActivity}=require('../src/models');
const {generateReminders}=require('../src/utils/notificationReminders');
const {errors}=require('../src/utils/http');
const users=[];
const events=[];
let conversation;
let server;

async function run(){
  await db.authenticate();
  const marker=randomUUID();
  for(const [index,role] of ['organizer','provider','organizer'].entries()){
    users.push(await User.create({name:`Planning test ${index}`,email:`planning-${marker}-${index}@example.test`,passwordHash:'temporary-test-account-not-for-login',role}));
  }
  const date=new Date(Date.now()+2*60*60*1000);
  for(const index of [0,2])events.push(await Event.create({organizerId:users[index].id,title:'Planning verification',type:'birthday',date,city:'Yerevan'}));
  conversation=await Conversation.create({organizerId:users[0].id,providerId:users[1].id});
  const invitation=await Invitation.create({eventId:events[0].id,published:true});
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:process.env.APP_TIMEZONE||'Asia/Yerevan',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const task=await Task.create({eventId:events[0].id,title:'Planning test task',dueDate:today,completed:false});
  const app=express();
  app.use(express.json());
  app.use('/api',require('../src/routes/timeline'));
  app.use('/api',require('../src/routes/notifications'));
  app.use('/api',require('../src/routes/messages'));
  app.use('/api',require('../src/routes'));
  app.use(errors);
  server=await new Promise((resolve,reject)=>{
    const listening=app.listen(0,'127.0.0.1',()=>resolve(listening));
    listening.on('error',reject);
  });
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const request=(method,path,user=0,body)=>fetch(base+path,{
    method,headers:{'Content-Type':'application/json',...(user===null?{}:{Authorization:`Bearer ${jwt.sign({id:users[user].id},process.env.JWT_SECRET)}`})},
    body:body?JSON.stringify(body):undefined,
  });
  const timeline=`/events/${events[0].id}/timeline`;
  let response=await request('POST',timeline,0,{title:'Dinner',startTime:'18:00',endTime:'19:30'});
  assert.equal(response.status,201);
  const late=await response.json();
  response=await request('POST',timeline,0,{title:'Arrival',startTime:'15:00'});
  assert.equal(response.status,201);
  const first=await response.json();
  response=await request('POST',timeline,0,{title:'Welcome',startTime:'15:00'});
  const second=await response.json();
  let list=await (await request('GET',timeline)).json();
  assert.deepEqual(list.map(item=>item.id),[first.id,second.id,late.id]);
  assert.equal((await request('GET',timeline,2)).status,403);
  assert.equal((await request('GET',timeline,1)).status,403);
  assert.equal((await request('GET',timeline,null)).status,401);
  assert.equal((await request('PATCH',`${timeline}/${late.id}`,0,{startTime:'14:00',location:'Main hall'})).status,200);
  list=await (await request('GET',timeline)).json();
  assert.equal(list[0].id,late.id);
  assert.equal(list[0].startTime,'14:00');
  assert.equal((await TimelineActivity.findByPk(late.id)).location,'Main hall');
  assert.equal((await Event.findByPk(events[0].id)).date.getTime(),date.getTime());
  assert.equal((await request('POST',timeline,0,{title:'Invalid',startTime:'16:00',endTime:'15:00'})).status,400);
  const foreign=await TimelineActivity.create({eventId:events[1].id,title:'Foreign',startTime:'10:00'});
  assert.equal((await request('PATCH',`${timeline}/${foreign.id}`,0,{title:'Forbidden'})).status,404);
  assert.equal((await request('DELETE',`${timeline}/${late.id}`)).status,204);
  assert.equal(await TimelineActivity.findByPk(late.id),null);

  response=await request('POST',`/conversations/${conversation.id}/messages`,0,{body:'Private planning message'});
  assert.equal(response.status,201);
  const message=await response.json();
  await Message.runHooks('afterCreate',await Message.findByPk(message.id),{});
  assert.equal(await Notification.count({where:{dedupeKey:`message:${message.id}:new`}}),1);
  const providerNotices=await (await request('GET','/notifications',1)).json();
  const messageNotice=providerNotices.notifications.find(item=>item.entityId===conversation.id&&item.type==='message');
  assert.ok(messageNotice);
  assert.equal(messageNotice.recipientId,users[1].id);
  assert.equal(messageNotice.description.includes(message.body),false);
  assert.equal(messageNotice.dedupeKey,undefined);
  assert.equal((await request('PATCH',`/notifications/${messageNotice.id}/read`,0)).status,404);
  assert.equal((await request('PATCH',`/notifications/${messageNotice.id}/read`,1)).status,200);
  assert.ok((await Notification.findByPk(messageNotice.id)).readAt);
  assert.equal((await request('PATCH',`/conversations/${conversation.id}/messages/${message.id}`,0,{body:'Edited planning message'})).status,200);
  assert.ok(await Notification.findOne({where:{recipientId:users[1].id,type:'conversation_update'}}));
  response=await request('POST',`/invitations/${invitation.token}/rsvp`,null,{name:'Planning RSVP guest',status:'going'});
  assert.equal(response.status,201);
  assert.ok(await Notification.findOne({where:{recipientId:users[0].id,type:'rsvp',entityId:events[0].id}}));
  await generateReminders();
  await generateReminders();
  assert.equal(await Notification.count({where:{recipientId:users[0].id,type:'event_reminder',entityId:events[0].id}}),1);
  assert.equal(await Notification.count({where:{dedupeKey:`task:${task.id}:${today}`}}),1);
  assert.equal((await request('PATCH','/notifications/read-all')).status,200);
  const notices=await (await request('GET','/notifications')).json();
  assert.equal(notices.unreadCount,0);
  assert.ok(notices.notifications.every(item=>item.recipientId===users[0].id));
  assert.equal((await request('GET','/notifications',null)).status,401);
  console.log('Live PostgreSQL + HTTP checks passed: timeline CRUD/order/persistence/ownership, event date unchanged, message/RSVP notifications, reminder deduplication, recipient privacy and read operations.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{
    if(conversation)await conversation.destroy();
    for(const event of events)await event.destroy();
    for(const user of users)await user.destroy();
  }finally{
    if(server)await new Promise(resolve=>server.close(resolve));
    await db.close();
  }
});
