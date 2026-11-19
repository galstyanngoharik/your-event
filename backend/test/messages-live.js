require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const express=require('express');
const jwt=require('jsonwebtoken');
const {db,User,Conversation,Message}=require('../src/models');
const {errors}=require('../src/utils/http');
const {removeMedia}=require('../src/utils/messageMedia');

const users=[];
let conversation;
let server;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const video=Buffer.concat([Buffer.from([0,0,0,20]),Buffer.from('ftypisom'),Buffer.from([0,0,0,0]),Buffer.from('mp42')]);

async function run(){
  await db.authenticate();
  await require('../src/utils/messageSchema')(db);
  const marker=randomUUID();
  for(const [index,role] of ['organizer','provider','organizer'].entries()){
    users.push(await User.create({name:'Messaging verification',email:`message-check-${marker}-${index}@example.test`,passwordHash:'temporary-test-account-not-for-login',role}));
  }
  conversation=await Conversation.create({organizerId:users[0].id,providerId:users[1].id});
  const app=express();
  app.use(express.json());
  app.use('/api',require('../src/routes/messages'));
  app.use(errors);
  server=await new Promise((resolve,reject)=>{
    const listening=app.listen(0,'127.0.0.1',()=>resolve(listening));
    listening.on('error',reject);
  });
  const root=`http://127.0.0.1:${server.address().port}/api/conversations/${conversation.id}/messages`;
  const request=async(method,suffix='',user=0,body)=>{
    const headers=user===null?{}:{Authorization:`Bearer ${jwt.sign({id:users[user].id},process.env.JWT_SECRET)}`};
    if(body&&!(body instanceof FormData))headers['Content-Type']='application/json';
    return fetch(root+suffix,{method,headers,body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
  };
  const upload=(bytes,name,type,caption)=>{
    const data=new FormData();
    data.append('body',caption);
    data.append('attachment',new Blob([bytes],{type}),name);
    return data;
  };
  let response=await request('POST','',0,upload(png,'photo.png','image/png','Photo caption'));
  assert.equal(response.status,201);
  const photo=await response.json();
  assert.equal(photo.attachment.mime,'image/png');
  assert.equal(photo.attachmentKey,undefined);
  response=await request('GET',`/${photo.id}/attachment`,1);
  assert.equal(response.status,200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),png);
  assert.equal((await request('GET',`/${photo.id}/attachment`,2)).status,403);
  assert.equal((await request('GET','',null)).status,401);
  response=await request('POST','',1,upload(video,'video.mp4','video/mp4',''));
  assert.equal(response.status,201);
  const clip=await response.json();
  assert.equal(clip.attachment.type,'video');
  assert.equal((await request('GET',`/${clip.id}/attachment`,0)).status,200);
  response=await request('PATCH',`/${photo.id}`,0,{body:'Edited caption'});
  assert.equal(response.status,200);
  const edited=await response.json();
  assert.equal(edited.createdAt,photo.createdAt);
  assert.equal(edited.attachment.url,photo.attachment.url);
  assert.ok(edited.editedAt);
  assert.equal((await request('PATCH',`/${photo.id}`,1,{body:'Forbidden'})).status,403);
  assert.equal((await request('DELETE',`/${photo.id}`,1)).status,403);
  assert.equal((await request('PATCH',`/${photo.id}`,0,{body:''})).status,400);
  assert.equal((await request('POST','',0,{body:'Plain text'})).status,201);
  response=await request('GET','',1);
  assert.equal((await response.json()).length,3);
  const voiceFormats=require('./voiceFixtures');
  for(const [role,bytes,mime] of [[0,voiceFormats.webm(2),'audio/webm'],[1,voiceFormats.ogg(2),'audio/ogg'],[0,voiceFormats.mp4(2,true),'audio/mp4']]){
    response=await request('POST','',role,upload(bytes,'voice-recording',mime,''));
    assert.equal(response.status,201);
    const voice=await response.json();
    assert.equal(voice.attachment.type,'audio');
    assert.ok(voice.attachment.duration>=1.9&&voice.attachment.duration<=2.1);
    const stored=await Message.findByPk(voice.id);
    assert.equal(stored.attachmentDuration,voice.attachment.duration);
    response=await request('GET',`/${voice.id}/attachment`,role===0?1:0);
    assert.equal(response.status,200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
    assert.equal((await request('PATCH',`/${voice.id}`,role,{body:'Edit audio'})).status,400);
    assert.equal((await request('DELETE',`/${voice.id}`,role)).status,200);
    assert.equal((await request('GET',`/${voice.id}/attachment`,role===0?1:0)).status,404);
  }
  response=await request('DELETE',`/${photo.id}`,0);
  assert.equal(response.status,200);
  const deleted=await response.json();
  assert.equal(deleted.body,'');
  assert.equal(deleted.attachment,null);
  assert.ok(deleted.deletedAt);
  assert.equal((await request('GET',`/${photo.id}/attachment`,1)).status,404);
  const record=await Message.findByPk(photo.id);
  assert.equal(record.attachmentKey,null);
  assert.equal(record.body,'');
  assert.equal((await request('POST','',0,upload(Buffer.from('invalid'),'fake.png','image/png',''))).status,400);
  console.log('Live PostgreSQL + HTTP checks passed: both roles, voice/WebM/Ogg/MP4, saved durations, private access, text/photo/video, edit, soft delete and invalid files. Browser playback was not tested.');
}

run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{
    if(conversation){
      const records=await Message.findAll({where:{conversationId:conversation.id}});
      for(const message of records)await removeMedia(message.attachmentKey);
      await conversation.destroy();
    }
    for(const user of users)await user.destroy();
  }finally{
    if(server)await new Promise(resolve=>server.close(resolve));
    await db.close();
  }
});
