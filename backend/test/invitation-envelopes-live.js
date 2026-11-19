require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const express=require('express');
const jwt=require('jsonwebtoken');
const {db,User,Event,Invitation,Guest}=require('../src/models');
const {errors}=require('../src/utils/http');

let organizer;
let event;
let server;
async function run(){
  await db.authenticate();
  organizer=await User.create({name:'Envelope verification',email:`envelope-${randomUUID()}@example.test`,passwordHash:'temporary-test-account-not-for-login',role:'organizer'});
  event=await Event.create({organizerId:organizer.id,title:'Envelope verification',type:'birthday',date:new Date(),city:'Yerevan'});
  const legacy=await Invitation.create({eventId:event.id,published:true,title:'Invitation content',backgroundImage:'/uploads/existing-photo.png',backgroundTemplate:'f6'});
  assert.equal(legacy.envelope,'invitation1');
  const app=express();
  app.use(express.json());
  app.use('/api',require('../src/routes'));
  app.use(errors);
  server=await new Promise((resolve,reject)=>{
    const listening=app.listen(0,'127.0.0.1',()=>resolve(listening));
    listening.on('error',reject);
  });
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const headers={'Content-Type':'application/json',Authorization:`Bearer ${jwt.sign({id:organizer.id},process.env.JWT_SECRET)}`};
  for(const envelope of ['invitation1','invitation2','invitation3']){
    const saved=await fetch(`${base}/events/${event.id}/invitation`,{method:'PUT',headers,body:JSON.stringify({envelope})});
    assert.equal(saved.status,200);
    assert.equal((await saved.json()).envelope,envelope);
    const persisted=await Invitation.findByPk(legacy.id);
    assert.equal(persisted.envelope,envelope);
    const refreshed=await fetch(`${base}/events/${event.id}`,{headers});
    assert.equal((await refreshed.json()).invitation.envelope,envelope);
    const response=await fetch(`${base}/invitations/${legacy.token}`);
    assert.equal(response.status,200);
    const publicInvitation=await response.json();
    assert.equal(publicInvitation.envelope,envelope);
    assert.equal(publicInvitation.backgroundTemplate,'f6');
    assert.equal(publicInvitation.backgroundImage,'/uploads/existing-photo.png');
    assert.equal(publicInvitation.title,'Invitation content');
  }
  const rsvp=await fetch(`${base}/invitations/${legacy.token}/rsvp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Envelope RSVP verification',status:'going'})});
  assert.equal(rsvp.status,201);
  assert.equal((await rsvp.json()).status,'going');
  console.log('Live PostgreSQL + HTTP verification passed: default burgundy, all three saved envelopes, organizer reload, public response, preserved photo/background/content, and RSVP.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{
    if(event){
      await Guest.destroy({where:{eventId:event.id}});
      await event.destroy();
    }
    if(organizer)await organizer.destroy();
  }finally{
    if(server)await new Promise(resolve=>server.close(resolve));
    await db.close();
  }
});
