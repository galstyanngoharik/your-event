const {Readable}=require('node:stream');
const fs=require('node:fs');
const jwt=require('jsonwebtoken');

process.env.JWT_SECRET='messaging-test-secret-with-more-than-32-characters';
const messages=new Map();
const files=new Set();
let nextId=1;
const conversation={id:1,organizerId:7,providerId:8,async update(values){Object.assign(this,values);}};
const makeMessage=values=>({
  id:nextId++,createdAt:new Date('2026-11-01T10:00:00Z'),editedAt:null,deletedAt:null,
  attachmentKey:null,attachmentName:null,attachmentMime:null,attachmentSize:null,
  ...values,
  async update(data){Object.assign(this,data);},
  toJSON(){return Object.fromEntries(Object.entries(this).filter(([,value])=>typeof value!=='function'));},
});
const models={
  db:{async transaction(callback){return callback({LOCK:{UPDATE:'UPDATE'}});}},
  User:{async findByPk(id){return [7,8,9].includes(id)?{id,role:id===8?'provider':'organizer'}:null;}},
  Conversation:{async findByPk(id){return id===1?conversation:null;}},
  Message:{
    async create(values){
      const message=makeMessage(values);
      messages.set(message.id,message);
      if(message.attachmentKey)files.add(message.attachmentKey);
      return message;
    },
    async findOne({where}){
      const message=messages.get(where.id);
      return message?.conversationId===where.conversationId?message:null;
    },
    async findAll({where,limit}){
      return [...messages.values()].filter(message=>message.conversationId===where.conversationId)
        .sort((a,b)=>b.id-a.id).slice(0,limit);
    },
  },
};
require.cache[require.resolve('../src/models')]={exports:models};
const router=require('../src/routes/messages');
const {mediaPath,removeMedia}=require('../src/utils/messageMedia');

const multipart=(bytes,name='photo.png',mime='image/png',body='A photo')=>{
  const boundary='YourEventMessageTestBoundary';
  const payload=Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="body"\r\n\r\n${body}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="attachment"; filename="${name}"\r\nContent-Type: ${mime}\r\n\r\n`),
    bytes,Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  return {payload,contentType:`multipart/form-data; boundary=${boundary}`};
};

const invoke=(method,path,{userId=7,params={},body={},upload}={})=>new Promise((resolve,reject)=>{
  const route=router.stack.find(layer=>layer.route?.path===path&&layer.route.methods[method]).route;
  const req=Readable.from(upload?[upload.payload]:[]);
  req.method=method.toUpperCase();
  req.params={id:'1',...params};
  req.body=body;
  req.headers={
    'content-type':upload?.contentType||'application/json',
    'content-length':String(upload?.payload.length||0),
    ...(userId===null?{}:{authorization:`Bearer ${jwt.sign({id:userId},process.env.JWT_SECRET)}`}),
  };
  let status=200;
  const headers={};
  const res={
    status(value){status=value;return res;},
    json(value){resolve({status,data:value});},
    setHeader(key,value){headers[key]=value;},
    type(value){headers.type=value;return res;},
    sendFile(file,callback){fs.promises.readFile(file).then(data=>resolve({status,data,headers})).catch(callback);},
  };
  let index=0;
  const next=error=>{
    if(error)return reject(error);
    try{Promise.resolve(route.stack[index++].handle(req,res,next)).catch(reject);}catch(failure){reject(failure);}
  };
  next();
});
const cleanup=async()=>{for(const key of files)await removeMedia(key);};

module.exports={invoke,multipart,messages,models,mediaPath,cleanup};
