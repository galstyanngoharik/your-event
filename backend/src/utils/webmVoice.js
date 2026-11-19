const {fail}=require('./http');
const invalid=()=>{throw fail(400,'Invalid WebM voice recording.');};
const vint=(bytes,offset,identifier=false)=>{
  if(offset>=bytes.length||bytes[offset]===0)invalid();
  let length=1;
  let marker=128;
  while(!(bytes[offset]&marker)){length++;marker>>=1;}
  if(length>8||offset+length>bytes.length)invalid();
  let value=identifier?bytes[offset]:bytes[offset]&~marker;
  for(let index=1;index<length;index++)value=value*256+bytes[offset+index];
  return {value,length,unknown:!identifier&&value===2**(length*7)-1};
};
const uint=bytes=>{
  let value=0;
  for(const byte of bytes)value=value*256+byte;
  return value;
};
const opusDuration=packet=>{
  if(!packet.length)invalid();
  const configuration=packet[0]>>3;
  const frame=configuration>=16?2.5*2**(configuration%4):configuration>=12?10*2**(configuration%2):[10,20,40,60][configuration%4];
  const code=packet[0]&3;
  const frames=code===0?1:code===3?(packet[1]||0)&63:2;
  if(!frames||frame*frames>120)invalid();
  return frame*frames/1000;
};

module.exports=bytes=>{
  const tracks=[];
  const blocks=[];
  let scale=1000000;
  let cluster=0;
  let docType='';
  const containers=new Set([0x1a45dfa3,0x18538067,0x1549a966,0x1654ae6b,0xa0]);
  const walk=(start,end,depth=0,track=null,insideCluster=false)=>{
    if(depth>12)invalid();
    let offset=start;
    while(offset<end){
      const id=vint(bytes,offset,true);
      if(insideCluster&&id.value===0x1f43b675)return offset;
      const size=vint(bytes,offset+id.length);
      const content=offset+id.length+size.length;
      const stop=size.unknown?end:content+size.value;
      if(stop>end||stop<=offset)invalid();
      const value=bytes.subarray(content,stop);
      if(id.value===0x1f43b675){
        offset=walk(content,stop,depth+1,track,true);
        continue;
      }
      if(id.value===0xae){
        const entry={};
        walk(content,stop,depth+1,entry);
        tracks.push(entry);
      }else if(containers.has(id.value))walk(content,stop,depth+1,track);
      else if(id.value===0x4282)docType=value.toString();
      else if(id.value===0x2ad7b1)scale=uint(value);
      else if(id.value===0xe7)cluster=uint(value);
      else if(track&&id.value===0x83)track.type=uint(value);
      else if(track&&id.value===0xd7)track.number=uint(value);
      else if(track&&id.value===0x86)track.codec=value.toString();
      else if(track&&id.value===0x63a2)track.header=value;
      else if(track&&id.value===0x56aa)track.delay=uint(value)/1e9;
      else if(id.value===0xa3||id.value===0xa1){
        const number=vint(bytes,content);
        const header=content+number.length;
        if(header+3>=stop)invalid();
        blocks.push({track:number.value,time:cluster+bytes.readInt16BE(header),flags:bytes[header+2],packet:bytes.subarray(header+3,stop)});
      }
      offset=stop;
    }
    return offset;
  };
  walk(0,bytes.length);
  if(tracks.some(track=>track.type===1)||!tracks.length)return null;
  if(docType!=='webm'||tracks.length!==1||tracks[0].type!==2||tracks[0].codec!=='A_OPUS')invalid();
  const track=tracks[0];
  if(!track.header||track.header.length<19||track.header.toString('ascii',0,8)!=='OpusHead'||!track.header[9])invalid();
  let duration=0;
  let count=0;
  for(const block of blocks){
    if(block.track!==track.number)continue;
    if(block.flags&6)invalid();
    duration=Math.max(duration,block.time*scale/1e9+opusDuration(block.packet));
    count++;
  }
  if(!count)invalid();
  return {mime:'audio/webm',extension:'webm',duration:Math.max(0,duration-(track.delay||0))};
};
