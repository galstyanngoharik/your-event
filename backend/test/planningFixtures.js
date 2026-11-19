const jwt=require('jsonwebtoken');
process.env.JWT_SECRET='planning-notification-test-secret-more-than-32-characters';
const {Op}=require('sequelize');
const hooks=new Map();
const events=new Map([[1,{id:1,organizerId:7,title:'First event',date:new Date('2026-11-16T18:00:00Z'),status:'planning'}],[2,{id:2,organizerId:9,title:'Other event',date:new Date('2026-11-16T19:00:00Z'),status:'planning'}]]);
const activities=new Map();
const notices=new Map();
const tasks=[];
let nextActivity=1;
let nextNotice=1;
const record=(values,destroy)=>({
  ...values,async update(changes){Object.assign(this,changes);},async destroy(){destroy?.(this.id);},
  toJSON(){return Object.fromEntries(Object.entries(this).filter(([,value])=>typeof value!=='function'));},
});
const models={
  User:{async findByPk(id){return [7,8,9].includes(id)?{id,name:`User ${id}`,role:id===8?'provider':'organizer'}:null;}},
  Event:{
    async findByPk(id){return events.get(id)||null;},
    async findAll({where}){return [...events.values()].filter(event=>event.status===where.status&&event.date>where.date[Op.gt]&&event.date<=where.date[Op.lte]);},
  },
  Conversation:{async findByPk(id){return id===1?{id:1,organizerId:7,providerId:8}:null;}},
  Message:{addHook(_event,name,callback){hooks.set(name,callback);}},
  Guest:{addHook(_event,name,callback){hooks.set(name,callback);}},
  Task:{async findAll({where}){
    const [first,last]=where.dueDate[Op.between];
    return tasks.filter(task=>!task.completed&&task.dueDate>=first&&task.dueDate<=last&&events.get(task.eventId)?.status==='planning')
      .map(task=>({...task,Event:events.get(task.eventId)}));
  }},
  TimelineActivity:{
    async create(values){const item=record({id:nextActivity++,...values},id=>activities.delete(id));activities.set(item.id,item);return item;},
    async findOne({where}){const item=activities.get(where.id);return item?.eventId===where.eventId?item:null;},
    async findAll({where}){return [...activities.values()].filter(item=>item.eventId===where.eventId).sort((a,b)=>a.startTime.localeCompare(b.startTime)||a.id-b.id);},
  },
  Notification:{
    async findOrCreate({where,defaults}){
      const existing=[...notices.values()].find(item=>item.dedupeKey===where.dedupeKey);
      if(existing)return [existing,false];
      const item=record({id:nextNotice++,readAt:null,createdAt:new Date(),...defaults});
      notices.set(item.id,item);
      return [item,true];
    },
    async findOne({where}){const item=notices.get(where.id);return item?.recipientId===where.recipientId?item:null;},
    async findAndCountAll({where,offset,limit}){
      const all=[...notices.values()].filter(item=>item.recipientId===where.recipientId).sort((a,b)=>b.id-a.id);
      return {rows:all.slice(offset,offset+limit),count:all.length};
    },
    async count({where}){return [...notices.values()].filter(item=>item.recipientId===where.recipientId&&!item.readAt).length;},
    async update(values,{where}){
      let count=0;
      for(const item of notices.values())if(item.recipientId===where.recipientId&&!item.readAt){await item.update(values);count++;}
      return [count];
    },
  },
};
require.cache[require.resolve('../src/models')]={exports:models};
require('../src/utils/notificationEvents')(models);
const routers=[require('../src/routes/timeline'),require('../src/routes/notifications')];
const invoke=(method,path,{userId=7,params={},body={},query={}}={})=>new Promise((resolve,reject)=>{
  const route=routers.flatMap(router=>router.stack).find(layer=>layer.route?.path===path&&layer.route.methods[method]).route;
  const req={params:{eventId:'1',...params},body,query,headers:userId===null?{}:{authorization:`Bearer ${jwt.sign({id:userId},process.env.JWT_SECRET)}`}};
  let status=200;
  const res={status(value){status=value;return res;},json(value){resolve({status,data:JSON.parse(JSON.stringify(value))});},end(){resolve({status});}};
  let index=0;
  const next=error=>{
    if(error)return reject(error);
    try{Promise.resolve(route.stack[index++].handle(req,res,next)).catch(reject);}catch(failure){reject(failure);}
  };
  next();
});
module.exports={invoke,models,events,activities,notices,tasks,hooks};
