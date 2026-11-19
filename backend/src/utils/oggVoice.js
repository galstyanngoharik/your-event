const {fail}=require('./http');
module.exports=bytes=>{
  const invalid=()=>{throw fail(400,'Invalid Ogg Opus voice recording.');};
  let offset=0;
  let serial;
  let lastGranule=0;
  let preSkip=0;
  let packet=Buffer.alloc(0);
  let packets=0;
  let ended=false;
  while(offset<bytes.length){
    if(offset+27>bytes.length||bytes.toString('ascii',offset,offset+4)!=='OggS'||bytes[offset+4]!==0)invalid();
    const stream=bytes.readUInt32LE(offset+14);
    if(serial!==undefined&&serial!==stream)invalid();
    serial=stream;
    const granule=bytes.readBigUInt64LE(offset+6);
    if(granule!==0xffffffffffffffffn)lastGranule=Number(granule);
    ended=Boolean(bytes[offset+5]&4);
    const segments=bytes[offset+26];
    const start=offset+27+segments;
    if(start>bytes.length)invalid();
    let content=start;
    for(let index=0;index<segments;index++){
      const size=bytes[offset+27+index];
      if(content+size>bytes.length)invalid();
      if(packet.length+size>65536)invalid();
      packet=Buffer.concat([packet,bytes.subarray(content,content+size)]);
      content+=size;
      if(size<255){
        if(packets===0){
          if(packet.length<19||packet.toString('ascii',0,8)!=='OpusHead')invalid();
          preSkip=packet.readUInt16LE(10);
        }else if(packets===1&&packet.toString('ascii',0,8)!=='OpusTags')invalid();
        packets++;
        packet=Buffer.alloc(0);
      }
    }
    offset=content;
  }
  if(!ended||packets<3||packet.length)invalid();
  return {mime:'audio/ogg',extension:'ogg',duration:(lastGranule-preSkip)/48000};
};
