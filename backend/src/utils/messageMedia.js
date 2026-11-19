const multer=require('multer');
const fs=require('fs');
const path=require('path');
const {randomUUID}=require('crypto');
const {fail}=require('./http');
const voiceMetadata=require('./voiceMetadata');

const directory=path.resolve(__dirname,'../../private/message-media');
fs.mkdirSync(directory,{recursive:true});
const imageLimit=10*1024*1024;
const videoLimit=50*1024*1024;
const upload=multer({
  storage:multer.diskStorage({
    destination:directory,
    filename:(req,file,callback)=>callback(null,`${randomUUID()}.upload`),
  }),
  limits:{fileSize:videoLimit,files:1,fields:1,fieldSize:12000},
});

const mediaPath=key=>{
  if(!/^[0-9a-f-]{36}\.(upload|jpg|png|webp|mp4|webm|ogg|m4a)$/.test(key))throw fail(400,'Invalid attachment.');
  return path.join(directory,key);
};

const removeMedia=async key=>{
  if(!key)return;
  await fs.promises.unlink(mediaPath(key)).catch(error=>{
    if(error.code!=='ENOENT')console.error('Could not remove message attachment:',error.code);
  });
};

const inspectMedia=async file=>{
  const handle=await fs.promises.open(file.path,'r');
  const bytes=Buffer.alloc(Math.min(file.size,4096));
  try{await handle.read(bytes,0,bytes.length,0);}finally{await handle.close();}
  const voice=await voiceMetadata(file,bytes);
  let mime;
  let extension;
  if(voice){mime=voice.mime;extension=voice.extension;}
  else if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255){mime='image/jpeg';extension='jpg';}
  else if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){mime='image/png';extension='png';}
  else if(bytes.length>=12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){mime='image/webp';extension='webp';}
  else if(bytes.length>=16&&bytes.toString('ascii',4,8)==='ftyp'){
    const boxSize=bytes.readUInt32BE(0);
    const brands=['isom','iso2','mp41','mp42','avc1','M4V ','dash'];
    if(boxSize<16||boxSize>file.size||!brands.includes(bytes.toString('ascii',8,12)))throw fail(400,'Upload a valid MP4 video.');
    mime='video/mp4';extension='mp4';
  }else if(bytes.length>=4&&bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]))&&bytes.includes(Buffer.from([66,130,132,119,101,98,109]))){
    mime='video/webm';extension='webm';
  }else throw fail(400,'Choose a JPEG, PNG, WEBP, MP4 or WEBM file.');
  if(mime.startsWith('image/')&&file.size>imageLimit)throw fail(400,'Images must be 10 MB or smaller.');
  const key=`${randomUUID()}.${extension}`;
  await fs.promises.rename(file.path,mediaPath(key));
  return {
    attachmentKey:key,
    attachmentName:path.basename(file.originalname).replace(/[\x00-\x1f\x7f]/g,'').slice(0,200)||`attachment.${extension}`,
    attachmentMime:mime,
    attachmentSize:file.size,
    attachmentDuration:voice?.duration||null,
  };
};

const publicMessage=message=>{
  const data=message.toJSON();
  const {attachmentKey,attachmentName,attachmentMime,attachmentSize,attachmentDuration,...result}=data;
  result.attachment=!data.deletedAt&&attachmentKey?{
    url:`/conversations/${data.conversationId}/messages/${data.id}/attachment`,
    name:attachmentName,mime:attachmentMime,size:attachmentSize,
    type:attachmentMime.startsWith('audio/')?'audio':attachmentMime.startsWith('image/')?'image':'video',
    duration:attachmentDuration||null,
  }:null;
  if(data.deletedAt)result.body='';
  return result;
};

module.exports={upload,inspectMedia,removeMedia,mediaPath,publicMessage};
