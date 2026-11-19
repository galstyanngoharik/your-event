const {fail}=require('./http');
const invalid=()=>{throw fail(400,'Invalid MP4 voice recording.');};

module.exports=bytes=>{
  const boxes=(start,end)=>{
    const result=[];
    while(start<end){
      if(start+8>end)invalid();
      const small=bytes.readUInt32BE(start);
      const extended=small===1;
      if(extended&&start+16>end)invalid();
      const size=extended?Number(bytes.readBigUInt64BE(start+8)):small||end-start;
      const header=extended?16:8;
      if(size<header||start+size>end||result.length>100000)invalid();
      result.push({type:bytes.toString('ascii',start+4,start+8),start:start+header,end:start+size});
      start+=size;
    }
    return result;
  };
  const children=box=>box?boxes(box.start,box.end):[];
  const child=(box,type)=>children(box).find(entry=>entry.type===type);
  const u32=(offset,end)=>{
    if(offset+4>end)invalid();
    return bytes.readUInt32BE(offset);
  };
  const u64=(offset,end)=>{
    if(offset+8>end)invalid();
    return Number(bytes.readBigUInt64BE(offset));
  };
  const top=boxes(0,bytes.length);
  const moov=top.find(box=>box.type==='moov');
  if(!moov)return null;
  const tracks=children(moov).filter(box=>box.type==='trak').map(box=>{
    const mdia=child(box,'mdia');
    const handler=child(mdia,'hdlr');
    const header=child(mdia,'mdhd');
    const tkhd=child(box,'tkhd');
    if(!handler||handler.start+12>handler.end||!header||!tkhd)invalid();
    const type=bytes.toString('ascii',handler.start+8,handler.start+12);
    const version=bytes[header.start];
    const scale=u32(header.start+(version===1?20:12),header.end);
    const duration=version===1?u64(header.start+24,header.end):u32(header.start+16,header.end);
    const id=u32(tkhd.start+(bytes[tkhd.start]===1?20:12),tkhd.end);
    const stsd=child(child(child(mdia,'minf'),'stbl'),'stsd');
    const codec=stsd&&stsd.start+16<=stsd.end?bytes.toString('ascii',stsd.start+12,stsd.start+16):'';
    return {type,scale,duration,id,codec};
  });
  if(tracks.some(track=>track.type==='vide')||!tracks.length)return null;
  if(tracks.length!==1||tracks[0].type!=='soun'||tracks[0].codec!=='mp4a'||!tracks[0].scale)invalid();
  const track=tracks[0];
  let samples=track.duration===0xffffffff||track.duration>=Number.MAX_SAFE_INTEGER?0:track.duration;
  const trex=children(child(moov,'mvex')).find(box=>box.type==='trex'&&u32(box.start+4,box.end)===track.id);
  const fallback=trex?u32(trex.start+12,trex.end):0;
  for(const moof of top.filter(box=>box.type==='moof')){
    for(const traf of children(moof).filter(box=>box.type==='traf')){
      const tfhd=child(traf,'tfhd');
      if(!tfhd||u32(tfhd.start+4,tfhd.end)!==track.id)continue;
      const flags=u32(tfhd.start,tfhd.end)&0xffffff;
      let offset=tfhd.start+8+(flags&1?8:0)+(flags&2?4:0);
      const defaultDuration=flags&8?u32(offset,tfhd.end):fallback;
      const tfdt=child(traf,'tfdt');
      let position=tfdt?(bytes[tfdt.start]===1?u64(tfdt.start+4,tfdt.end):u32(tfdt.start+4,tfdt.end)):0;
      for(const trun of children(traf).filter(box=>box.type==='trun')){
        const options=u32(trun.start,trun.end)&0xffffff;
        const count=u32(trun.start+4,trun.end);
        if(count>100000)invalid();
        offset=trun.start+8+(options&1?4:0)+(options&4?4:0);
        for(let index=0;index<count;index++){
          const duration=options&0x100?u32(offset,trun.end):defaultDuration;
          if(!duration)invalid();
          position+=duration;
          offset+=(options&0x100?4:0)+(options&0x200?4:0)+(options&0x400?4:0)+(options&0x800?4:0);
          if(offset>trun.end)invalid();
        }
      }
      samples=Math.max(samples,position);
    }
  }
  if(!top.some(box=>box.type==='mdat'&&box.end>box.start))invalid();
  return {mime:'audio/mp4',extension:'m4a',duration:samples/track.scale};
};
