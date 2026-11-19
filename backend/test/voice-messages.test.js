const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {invoke,multipart,messages,mediaPath,cleanup}=require('./messageFixtures');
const {inspectMedia,removeMedia}=require('../src/utils/messageMedia');
const {webm,ogg,mp4}=require('./voiceFixtures');
const history='/conversations/:id/messages';
const single='/conversations/:id/messages/:messageId';
const attachment='/conversations/:id/messages/:messageId/attachment';
after(cleanup);

test('both roles send and retrieve private voice recordings in WebM, Ogg, MP4 and fragmented MP4',async()=>{
  const formats=[[webm(2),'audio/webm'],[ogg(2),'audio/ogg'],[mp4(2),'audio/mp4'],[mp4(2,true),'audio/mp4']];
  for(const [index,[bytes,mime]] of formats.entries()){
    const userId=index%2===0?7:8;
    const response=await invoke('post',history,{userId,upload:multipart(bytes,'voice',mime,'')});
    assert.equal(response.status,201);
    assert.equal(response.data.attachment.type,'audio');
    assert.equal(response.data.attachment.mime,mime);
    assert.ok(Math.abs(response.data.attachment.duration-2)<0.03);
    assert.equal(response.data.attachmentKey,undefined);
    const params={messageId:String(response.data.id)};
    const received=await invoke('get',attachment,{userId:userId===7?8:7,params});
    assert.deepEqual(received.data,bytes);
    await assert.rejects(invoke('get',attachment,{userId:9,params}),{status:403});
  }
});

test('long streamed WebM recordings with unknown cluster sizes are accepted',async()=>{
  const response=await invoke('post',history,{upload:multipart(webm(100,true),'voice.webm','audio/webm','')});
  assert.ok(response.data.attachment.duration>=99.9);
  assert.ok(response.data.attachment.duration<=100.1);
});

test('server rejects recordings over two minutes regardless of the client MIME',async()=>{
  for(const [bytes,mime] of [[webm(121),'audio/webm'],[webm(121),'video/webm'],[ogg(121),'audio/ogg'],[mp4(121),'audio/mp4'],[mp4(121,true),'audio/mp4']]){
    await assert.rejects(invoke('post',history,{upload:multipart(bytes,'long-recording',mime,'')}),/2 minutes/);
  }
});

test('invalid, empty and forged recordings and client duration metadata are rejected',async()=>{
  await assert.rejects(invoke('post',history,{upload:multipart(Buffer.alloc(0),'empty.webm','audio/webm','')}),{status:400});
  await assert.rejects(invoke('post',history,{upload:multipart(Buffer.from('not audio'),'fake.ogg','audio/ogg','')}),{status:400});
  await assert.rejects(invoke('post',history,{upload:multipart(ogg(0),'empty.ogg','audio/ogg','')}),{status:400});
  await assert.rejects(invoke('post',history,{upload:multipart(mp4(0),'empty.m4a','audio/mp4','')}),{status:400});
  await assert.rejects(invoke('post',history,{body:{body:'Voice',attachmentDuration:1}}));
});

test('voice size limit is enforced at ten MB',async()=>{
  const filename=`${randomUUID()}.upload`;
  const filepath=mediaPath(filename);
  const file=ogg(1);
  await fs.promises.writeFile(filepath,file);
  try{
    await assert.rejects(inspectMedia({path:filepath,size:10*1024*1024+1,mimetype:'audio/ogg',originalname:'voice.ogg'}),/10 MB/);
  }finally{await removeMedia(filename);}
});

test('voice captions cannot be edited; deletion clears duration and denies subsequent downloads',async()=>{
  const sent=(await invoke('post',history,{upload:multipart(ogg(1),'voice.ogg','audio/ogg','Voice caption')})).data;
  const params={messageId:String(sent.id)};
  await assert.rejects(invoke('patch',single,{params,body:{body:'Changed'}}),{status:400});
  await assert.rejects(invoke('delete',single,{userId:8,params}),{status:403});
  const key=messages.get(sent.id).attachmentKey;
  const deleted=(await invoke('delete',single,{params})).data;
  assert.equal(deleted.attachment,null);
  assert.equal(deleted.body,'');
  assert.equal(deleted.attachmentDuration,undefined);
  assert.equal(messages.get(sent.id).attachmentDuration,null);
  assert.equal(fs.existsSync(mediaPath(key)),false);
  await assert.rejects(invoke('get',attachment,{userId:8,params}),{status:404});
});
