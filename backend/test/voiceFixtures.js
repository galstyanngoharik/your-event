const opusHead=Buffer.concat([Buffer.from('OpusHead'),Buffer.from([1,1,0,0,128,187,0,0,0,0,0])]);
const silence=Buffer.from([248,255,254]);
const unsigned=(value,length=4)=>{
  const bytes=Buffer.alloc(length);
  bytes.writeUIntBE(value,0,length);
  return bytes;
};
const element=(id,value)=>{
  const identifier=Buffer.from(id,'hex');
  const data=typeof value==='number'?unsigned(value):typeof value==='string'?Buffer.from(value):value;
  const size=data.length<127?Buffer.from([128|data.length]):Buffer.from([64|(data.length>>8),data.length&255]);
  return Buffer.concat([identifier,size,data]);
};
const webm=(seconds=1,unknownClusters=false)=>{
  const info=element('1549a966',element('2ad7b1',1000000));
  const audio=element('e1',element('9f',unsigned(1,1)));
  const track=element('ae',Buffer.concat([
    element('d7',unsigned(1,1)),element('83',unsigned(2,1)),element('86','A_OPUS'),element('63a2',opusHead),audio,
  ]));
  const block=element('a3',Buffer.concat([Buffer.from([129,0,0,128]),silence]));
  const clusters=[];
  for(let index=0;index<=Math.floor(seconds);index++){
    const payload=Buffer.concat([element('e7',Math.max(0,Math.floor(Math.min(index,seconds-0.02)*1000))),block]);
    clusters.push(unknownClusters?Buffer.concat([Buffer.from('1f43b675ff','hex'),payload]):element('1f43b675',payload));
  }
  return Buffer.concat([element('1a45dfa3',element('4282','webm')),Buffer.from('1853806701ffffffffffffff','hex'),info,element('1654ae6b',track),...clusters]);
};
const ogg=(seconds=1)=>{
  const page=(number,packets,granule,flags)=>{
    const header=Buffer.alloc(27+packets.length);
    header.write('OggS');
    header[5]=flags;
    header.writeBigUInt64LE(BigInt(granule),6);
    header.writeUInt32LE(1,14);
    header.writeUInt32LE(number,18);
    header[26]=packets.length;
    packets.forEach((packet,index)=>{header[27+index]=packet.length;});
    const result=Buffer.concat([header,...packets]);
    let checksum=0;
    for(const byte of result){
      checksum^=byte<<24;
      for(let bit=0;bit<8;bit++)checksum=(checksum&0x80000000)?(checksum<<1)^0x04c11db7:checksum<<1;
    }
    result.writeUInt32LE(checksum>>>0,22);
    return result;
  };
  const pages=[page(0,[opusHead],0,2),page(1,[Buffer.concat([Buffer.from('OpusTags'),Buffer.alloc(8)])],0,0)];
  const count=Math.round(seconds*50);
  for(let offset=0;offset<count;offset+=200){
    const packets=Array.from({length:Math.min(200,count-offset)},()=>silence);
    const end=offset+packets.length;
    pages.push(page(pages.length,packets,end*960,end===count?4:0));
  }
  return Buffer.concat(pages);
};
const box=(type,data)=>Buffer.concat([unsigned(data.length+8),Buffer.from(type),data]);
const mp4=(seconds=1,fragmented=false)=>{
  const mdhd=Buffer.alloc(24);
  mdhd.writeUInt32BE(48000,12);
  mdhd.writeUInt32BE(fragmented?0:Math.round(seconds*48000),16);
  const tkhd=Buffer.alloc(24);
  tkhd.writeUInt32BE(1,12);
  const hdlr=Buffer.concat([Buffer.alloc(8),Buffer.from('soun'),Buffer.alloc(12)]);
  const sample=box('mp4a',Buffer.alloc(28));
  const stsd=box('stsd',Buffer.concat([Buffer.alloc(4),unsigned(1),sample]));
  const mdia=box('mdia',Buffer.concat([box('mdhd',mdhd),box('hdlr',hdlr),box('minf',box('stbl',stsd))]));
  const track=box('trak',Buffer.concat([box('tkhd',tkhd),mdia]));
  const trex=box('trex',Buffer.concat([Buffer.alloc(4),unsigned(1),unsigned(1),unsigned(1024),Buffer.alloc(8)]));
  const moov=box('moov',Buffer.concat([track,...(fragmented?[box('mvex',trex)]:[])]));
  const ftyp=box('ftyp',Buffer.concat([Buffer.from('isom'),Buffer.alloc(4),Buffer.from('mp42')]));
  const fragments=[];
  if(fragmented){
    const tfhd=box('tfhd',Buffer.concat([Buffer.alloc(4),unsigned(1)]));
    const tfdt=box('tfdt',Buffer.concat([Buffer.alloc(4),unsigned(0)]));
    const trun=box('trun',Buffer.concat([unsigned(0x100),unsigned(1),unsigned(Math.round(seconds*48000))]));
    fragments.push(box('moof',box('traf',Buffer.concat([tfhd,tfdt,trun]))));
  }
  return Buffer.concat([ftyp,moov,...fragments,box('mdat',Buffer.from([0,1,2,3]))]);
};
module.exports={webm,ogg,mp4};
