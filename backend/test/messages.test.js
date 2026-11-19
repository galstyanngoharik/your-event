const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {invoke,multipart,messages,models,mediaPath,cleanup}=require('./messageFixtures');
const {inspectMedia,removeMedia}=require('../src/utils/messageMedia');
const history='/conversations/:id/messages';
const single='/conversations/:id/messages/:messageId';
const attachment='/conversations/:id/messages/:messageId/attachment';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const mp4=Buffer.concat([Buffer.from([0,0,0,20]),Buffer.from('ftypisom'),Buffer.from([0,0,0,0]),Buffer.from('mp42')]);
after(cleanup);

let photo;
let video;
test('organizer sends photo plus caption; provider retrieves the private image',async()=>{
  const response=await invoke('post',history,{upload:multipart(png)});
  assert.equal(response.status,201);
  photo=response.data;
  assert.equal(photo.body,'A photo');
  assert.equal(photo.senderId,7);
  assert.equal(photo.attachment.type,'image');
  assert.equal(photo.attachment.mime,'image/png');
  assert.equal(photo.attachmentKey,undefined);
  const media=await invoke('get',attachment,{userId:8,params:{messageId:String(photo.id)}});
  assert.deepEqual(media.data,png);
  assert.equal(media.headers['Cache-Control'],'private, no-store');
  await assert.rejects(invoke('get',attachment,{userId:9,params:{messageId:String(photo.id)}}),{status:403});
});

test('provider sends media-only video; organizer sees it in history',async()=>{
  video=(await invoke('post',history,{userId:8,upload:multipart(mp4,'video.mp4','video/mp4','')})).data;
  assert.equal(video.senderId,8);
  assert.equal(video.body,'');
  assert.equal(video.attachment.type,'video');
  const response=await invoke('get',history);
  assert.ok(response.data.some(message=>message.id===video.id&&message.attachment.mime==='video/mp4'));
  const media=await invoke('get',attachment,{params:{messageId:String(video.id)}});
  assert.deepEqual(media.data,mp4);
});

test('text editing retains attachment, sender, and original timestamp',async()=>{
  const params={messageId:String(photo.id)};
  const result=(await invoke('patch',single,{params,body:{body:'Updated caption'}})).data;
  assert.equal(result.body,'Updated caption');
  assert.ok(result.editedAt);
  assert.equal(result.createdAt.getTime(),photo.createdAt.getTime());
  assert.deepEqual(result.attachment,photo.attachment);
  await assert.rejects(invoke('patch',single,{userId:8,params,body:{body:'Not mine'}}),{status:403});
  await assert.rejects(invoke('patch',single,{userId:9,params,body:{body:'Not a member'}}),{status:403});
  await assert.rejects(invoke('patch',single,{params,body:{body:'  '}}));
  await assert.rejects(invoke('patch',single,{params,body:{body:'Valid',senderId:8}}));
  await assert.rejects(invoke('patch',single,{userId:8,params:{messageId:String(video.id)},body:{body:'Caption'}}),{status:400});
});

test('deletion clears content and metadata and prevents attachment retrieval and edits',async()=>{
  const params={messageId:String(photo.id)};
  const key=messages.get(photo.id).attachmentKey;
  await assert.rejects(invoke('delete',single,{userId:8,params}),{status:403});
  const result=(await invoke('delete',single,{params})).data;
  assert.ok(result.deletedAt);
  assert.equal(result.body,'');
  assert.equal(result.attachment,null);
  assert.equal(result.attachmentName,undefined);
  assert.equal(fs.existsSync(mediaPath(key)),false);
  const historyResult=(await invoke('get',history,{userId:8})).data.find(message=>message.id===photo.id);
  assert.equal(historyResult.body,'');
  assert.equal(historyResult.attachment,null);
  await assert.rejects(invoke('get',attachment,{params}),{status:404});
  await assert.rejects(invoke('patch',single,{params,body:{body:'Restore'}}),{status:410});
  assert.ok((await invoke('delete',single,{params})).data.deletedAt);
});

test('plain text remains supported; blank, oversized, forged and unauthenticated messages fail',async()=>{
  const result=(await invoke('post',history,{body:{body:' Hello '}})).data;
  assert.equal(result.body,'Hello');
  assert.equal(result.attachment,null);
  await assert.rejects(invoke('post',history,{body:{body:''}}),{status:400});
  await assert.rejects(invoke('post',history,{body:{body:'x'.repeat(3001)}}));
  await assert.rejects(invoke('post',history,{body:{body:'Forged',senderId:8}}));
  await assert.rejects(invoke('get',history,{userId:null}),{status:401});
  await assert.rejects(invoke('post',history,{userId:9,body:{body:'Hello'}}),{status:403});
  await assert.rejects(invoke('get',history,{params:{id:'2'}}),{status:404});
  await assert.rejects(invoke('patch',single,{params:{messageId:'999'},body:{body:'Hello'}}),{status:404});
});

test('uploads use actual signatures rather than declared MIME or extension; failed uploads are cleaned',async()=>{
  await assert.rejects(invoke('post',history,{upload:multipart(Buffer.from('<script>alert(1)</script>'),'fake.png','image/png')}),{status:400});
  const result=(await invoke('post',history,{upload:multipart(png,'fake.mp4','video/mp4')})).data;
  assert.equal(result.attachment.mime,'image/png');
  const originalCreate=models.Message.create;
  let failedKey;
  models.Message.create=async values=>{failedKey=values.attachmentKey;throw new Error('Database unavailable');};
  try{await assert.rejects(invoke('post',history,{upload:multipart(png)}),/Database unavailable/);}
  finally{models.Message.create=originalCreate;}
  assert.ok(failedKey);
  assert.equal(fs.existsSync(mediaPath(failedKey)),false);
});

test('image sizes are limited to 10 MB and video uploads to 50 MB',async()=>{
  const filename=`${randomUUID()}.upload`;
  const filepath=mediaPath(filename);
  await fs.promises.writeFile(filepath,png);
  try{await assert.rejects(inspectMedia({path:filepath,size:10*1024*1024+1,originalname:'large.png'}),/10 MB/);}
  finally{await removeMedia(filename);}
  const oversized=Buffer.alloc(50*1024*1024+1);
  await assert.rejects(invoke('post',history,{upload:multipart(oversized,'large.mp4','video/mp4')}),error=>error.code==='LIMIT_FILE_SIZE');
});

test('JPEG, WEBP and WEBM signatures are recognized; MOV and unsafe paths are rejected',async()=>{
  const formats=[
    [Buffer.from([255,216,255,224]),'image/jpeg'],
    [Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBP')]),'image/webp'],
    [Buffer.from([26,69,223,163,66,130,132,119,101,98,109]),'video/webm'],
  ];
  for(const [bytes,mime] of formats){
    const filename=`${randomUUID()}.upload`;
    const filepath=mediaPath(filename);
    await fs.promises.writeFile(filepath,bytes);
    const media=await inspectMedia({path:filepath,size:bytes.length,originalname:'sample'});
    assert.equal(media.attachmentMime,mime);
    await removeMedia(media.attachmentKey);
  }
  const mov=Buffer.concat([Buffer.from([0,0,0,20]),Buffer.from('ftypqt  '),Buffer.alloc(8)]);
  await assert.rejects(invoke('post',history,{upload:multipart(mov,'clip.mov','video/quicktime')}),{status:400});
  assert.throws(()=>mediaPath('../secret.png'),{status:400});
});

test('legacy messages and recent history survive repeated reads',async()=>{
  const legacy=await models.Message.create({body:'Legacy text',conversationId:1,senderId:7});
  for(let number=0;number<205;number++)await models.Message.create({body:`Message ${number}`,conversationId:1,senderId:8});
  const result=(await invoke('get',history)).data;
  assert.equal(result.length,200);
  assert.equal(result.at(-1).body,'Message 204');
  assert.equal(result[0].body,'Message 5');
  assert.equal(legacy.attachmentKey,null);
});
