const {test}=require('node:test');
const assert=require('node:assert/strict');

let owner=7;
let exists=true;
const palette={colors:['#D9A3AA'],layout:{},async update(value){Object.assign(this,value);}};
const models={
  Event:{async findByPk(){return exists?{id:1,organizerId:owner}:null;}},
  MoodboardItem:{async findAll(){return [{id:10,eventId:1}];}},
  MoodboardPalette:{async findOrCreate(){return [palette];},async findOne(){return palette;}},
};
require.cache[require.resolve('../src/models')]={exports:models};
require.cache[require.resolve('../src/middleware/auth')]={exports:{auth(){},role(){return ()=>{};}}};
const router=require('../src/routes/moodboard');
const put=router.stack.find(layer=>layer.route?.path==='/:eventId/moodboard/layout').route.stack.at(-1).handle;
const get=router.stack.find(layer=>layer.route?.path==='/:eventId/moodboard'&&layer.route.methods.get).route.stack.at(-1).handle;
const invoke=(handler,body)=>new Promise((resolve,reject)=>{
  handler({params:{eventId:'1'},user:{id:7},body},{json:resolve},reject);
});
const placement={x:150,y:260,width:280,rotation:-12,zIndex:5};

test('layout saves, reloads, and preserves existing palette',async()=>{
  const layout={'photo-10':placement,'color-#D9A3AA':{...placement,x:600}};
  assert.deepEqual(await invoke(put,{layout}),{layout});
  const reloaded=await invoke(get);
  assert.deepEqual(reloaded.layout,layout);
  assert.deepEqual(reloaded.colors,['#D9A3AA']);
});

test('layout rejects foreign photo ids and malformed coordinates',async()=>{
  await assert.rejects(invoke(put,{layout:{'photo-99':placement}}),{status:400});
  await assert.rejects(invoke(put,{layout:{'photo-10':{...placement,width:0}}}));
  await assert.rejects(invoke(put,{layout:{'photo-10':{...placement,x:Infinity}}}));
  await assert.rejects(invoke(put,{layout:{'photo-10':{...placement,extra:1}}}));
});

test('layout rejects another organizer and missing events',async()=>{
  owner=9;
  await assert.rejects(invoke(put,{layout:{}}),{status:403});
  owner=7;
  exists=false;
  await assert.rejects(invoke(put,{layout:{}}),{status:404});
  exists=true;
});
