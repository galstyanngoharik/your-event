const {test}=require('node:test');
const assert=require('node:assert/strict');

let organizerId=7;
let invitation=null;
const models={
  db:{},
  User:{},Task:{},Expense:{},Guest:{},Service:{},Favorite:{},Conversation:{},Message:{},Review:{},
  Event:{async findByPk(){return {id:1,organizerId};}},
  Invitation:{
    async findOne({where}){
      if(where.token&&(!invitation?.published||invitation.token!==where.token))return null;
      return invitation;
    },
    async create(values){
      invitation={...values,token:'test-token',async update(data){Object.assign(this,data);}};
      return invitation;
    },
  },
};
require.cache[require.resolve('../src/models')]={exports:models};
require.cache[require.resolve('../src/middleware/auth')]={exports:{auth(){},role(){return ()=>{};}}};
const router=require('../src/routes');
const handler=path=>router.stack.find(layer=>layer.route?.path===path).route.stack.at(-1).handle;
const save=handler('/events/:eventId/invitation');
const read=handler('/invitations/:token');
const invoke=(route,body={})=>new Promise((resolve,reject)=>{
  const response={status(){return response;},json:resolve};
  route({params:{eventId:'1',token:'test-token'},user:{id:7},body},response,reject);
});

test('all twelve backgrounds save independently of the gallery photo and reach the public response',async()=>{
  const image='/uploads/gallery-photo.jpeg';
  for(let number=1;number<=12;number++){
    const backgroundTemplate=`f${number}`;
    const result=await invoke(save,{backgroundTemplate,backgroundImage:image,published:true});
    assert.equal(result.backgroundTemplate,backgroundTemplate);
    assert.equal(result.backgroundImage,image);
    assert.equal((await invoke(read)).backgroundTemplate,backgroundTemplate);
  }
});

test('legacy payloads preserve the selection, and null removes only the template',async()=>{
  await invoke(save,{backgroundTemplate:'f3',backgroundImage:'/uploads/keep.jpeg'});
  await invoke(save,{title:'Updated title'});
  assert.equal(invitation.backgroundTemplate,'f3');
  await invoke(save,{backgroundTemplate:null});
  assert.equal(invitation.backgroundTemplate,null);
  assert.equal(invitation.backgroundImage,'/uploads/keep.jpeg');
});

test('invalid backgrounds and unauthorized organizers cannot modify the invitation',async()=>{
  for(const backgroundTemplate of ['f0','f13','/images/f1.jpeg','https://example.com/photo.jpeg',3]){
    await assert.rejects(invoke(save,{backgroundTemplate}),error=>error.name==='ZodError');
  }
  organizerId=9;
  await assert.rejects(invoke(save,{backgroundTemplate:'f1'}),{status:403});
  organizerId=7;
});

test('all three envelope selections save and reload without changing background or gallery photo',async()=>{
  for(const envelope of ['invitation1','invitation2','invitation3']){
    const saved=await invoke(save,{envelope,backgroundTemplate:'f8',backgroundImage:'/uploads/keep.jpeg',published:true});
    assert.equal(saved.envelope,envelope);
    const restored=await invoke(read);
    assert.equal(restored.envelope,envelope);
    assert.equal(restored.backgroundTemplate,'f8');
    assert.equal(restored.backgroundImage,'/uploads/keep.jpeg');
  }
  await invoke(save,{title:'Keep settings'});
  assert.equal((await invoke(read)).envelope,'invitation3');
});

test('envelope selection accepts legacy null and rejects unknown choices and foreign organizers',async()=>{
  await invoke(save,{envelope:null});
  assert.equal((await invoke(read)).envelope,null);
  for(const envelope of ['invitation4','/images/invitation2.png',5]){
    await assert.rejects(invoke(save,{envelope}),error=>error.name==='ZodError');
  }
  organizerId=9;
  await assert.rejects(invoke(save,{envelope:'invitation2'}),{status:403});
  organizerId=7;
});

test('Dusty Rose, Cream and Burgundy preset colors are accepted and returned',async()=>{
  for(const backgroundColor of ['dustyRose','cream','burgundy']){
    await invoke(save,{backgroundColor});
    assert.equal((await invoke(read)).backgroundColor,backgroundColor);
  }
});
