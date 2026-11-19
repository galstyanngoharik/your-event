const fs=require('fs');
const {fail}=require('./http');
const webmVoice=require('./webmVoice');
const mp4Voice=require('./mp4Voice');
const oggVoice=require('./oggVoice');

module.exports=async(file,signature)=>{
  const declaredAudio=file.mimetype?.startsWith('audio/');
  const ogg=signature.toString('ascii',0,4)==='OggS';
  const webm=signature.length>=4&&signature.readUInt32BE(0)===0x1a45dfa3;
  const mp4=signature.toString('ascii',4,8)==='ftyp';
  if(!ogg&&!webm&&!mp4){
    if(declaredAudio)throw fail(400,'Choose a valid WebM, Ogg Opus or MP4 voice recording.');
    return null;
  }
  const bytes=await fs.promises.readFile(file.path);
  let result;
  try{
    result=ogg?oggVoice(bytes):webm?webmVoice(bytes):mp4Voice(bytes);
  }catch(error){
    if(!declaredAudio&&!ogg)return null;
    if(error.status)throw error;
    throw fail(400,'The voice recording is invalid or incomplete.');
  }
  if(!result){
    if(declaredAudio)throw fail(400,'A voice recording must contain only a supported audio track.');
    return null;
  }
  if(file.size>10*1024*1024)throw fail(400,'Voice recordings must be 10 MB or smaller.');
  if(!Number.isFinite(result.duration)||result.duration<=0)throw fail(400,'The voice recording is empty or incomplete.');
  if(result.duration>120)throw fail(400,'Voice recordings must be 2 minutes or shorter.');
  return result;
};
