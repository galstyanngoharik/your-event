const {test}=require('node:test');
const assert=require('node:assert/strict');
const {invoke,models,events,notices,tasks,hooks}=require('./planningFixtures');
const {generateReminders}=require('../src/utils/notificationReminders');
const timeline='/events/:eventId/timeline';
const activity='/events/:eventId/timeline/:activityId';

test('timeline creates, reloads, sorts equal times stably, edits, and deletes',async()=>{
  const late=(await invoke('post',timeline,{body:{title:'Dinner',startTime:'18:00',endTime:'19:30'}})).data;
  const first=(await invoke('post',timeline,{body:{title:'Arrival',startTime:'15:00'}})).data;
  const second=(await invoke('post',timeline,{body:{title:'Welcome',startTime:'15:00'}})).data;
  let items=(await invoke('get',timeline)).data;
  assert.deepEqual(items.map(item=>item.id),[first.id,second.id,late.id]);
  await invoke('patch',activity,{params:{activityId:String(late.id)},body:{startTime:'14:00',description:'Complete details',location:'Main hall'}});
  items=(await invoke('get',timeline)).data;
  assert.equal(items[0].id,late.id);
  assert.equal(items[0].description,'Complete details');
  assert.equal(items[0].eventId,1);
  assert.equal((await invoke('delete',activity,{params:{activityId:String(late.id)}})).status,204);
  assert.equal((await invoke('get',timeline)).data.length,2);
});

test('timeline rejects invalid times, blank titles, reversed intervals and foreign records',async()=>{
  for(const body of [{title:'',startTime:'15:00'},{title:'Activity',startTime:'24:00'},{title:'Activity',startTime:'10:00',endTime:'09:00'},{title:'Activity',startTime:'10:00',endTime:'10:00'}]){
    await assert.rejects(invoke('post',timeline,{body}));
  }
  await assert.rejects(invoke('get',timeline,{userId:9}),{status:403});
  await assert.rejects(invoke('get',timeline,{userId:8}),{status:403});
  await assert.rejects(invoke('get',timeline,{userId:null}),{status:401});
  await assert.rejects(invoke('get',timeline,{params:{eventId:'999'}}),{status:404});
  const foreign=await models.TimelineActivity.create({eventId:2,title:'Private',startTime:'10:00'});
  await assert.rejects(invoke('patch',activity,{params:{activityId:String(foreign.id)},body:{title:'Changed'}}),{status:404});
  const own=(await invoke('post',timeline,{body:{title:'Owned',startTime:'15:00',endTime:'16:00'}})).data;
  await assert.rejects(invoke('patch',activity,{params:{activityId:String(own.id)},body:{startTime:'17:00'}}),{status:400});
  await assert.rejects(invoke('delete',activity,{params:{activityId:'invalid'}}));
});

test('message and RSVP hooks generate only real occurrences and deduplicate retries',async()=>{
  const message={id:1,conversationId:1,senderId:7,body:'Private message body'};
  await hooks.get('notifyRecipient')(message,{});
  await hooks.get('notifyRecipient')(message,{});
  let matching=[...notices.values()].filter(item=>item.dedupeKey==='message:1:new');
  assert.equal(matching.length,1);
  assert.equal(matching[0].recipientId,8);
  assert.equal(matching[0].link,'/provider/messages?chat=1');
  assert.equal(matching[0].description.includes(message.body),false);
  await hooks.get('notifyRecipient')({...message,id:2,senderId:8},{});
  assert.ok([...notices.values()].some(item=>item.dedupeKey==='message:2:new'&&item.recipientId===7));
  await hooks.get('notifyConversationUpdate')({...message,editedAt:new Date('2026-11-16T10:00:00Z'),changed:field=>field==='editedAt'},{});
  assert.ok([...notices.values()].some(item=>item.type==='conversation_update'));
  const guest={id:1,eventId:1,name:'Guest',status:'going'};
  const before=notices.size;
  await hooks.get('notifyRsvp')(guest,{});
  assert.equal(notices.size,before);
  await hooks.get('notifyRsvp')(guest,{notifyRsvp:true});
  await hooks.get('notifyRsvp')(guest,{notifyRsvp:true});
  matching=[...notices.values()].filter(item=>item.dedupeKey==='rsvp:1');
  assert.equal(matching.length,1);
  assert.equal(matching[0].recipientId,7);
});

test('upcoming events and incomplete dated tasks create persistent deduplicated reminders',async()=>{
  tasks.push({id:1,eventId:1,title:'Today task',dueDate:'2026-11-16',completed:false});
  tasks.push({id:2,eventId:1,title:'Done task',dueDate:'2026-11-16',completed:true});
  tasks.push({id:3,eventId:1,title:'Old task',dueDate:'2026-11-10',completed:false});
  await generateReminders(new Date('2026-11-16T10:00:00Z'));
  const count=notices.size;
  await generateReminders(new Date('2026-11-16T10:01:00Z'));
  assert.equal(notices.size,count);
  assert.ok([...notices.values()].some(item=>item.type==='event_reminder'&&item.recipientId===7));
  assert.ok([...notices.values()].some(item=>item.dedupeKey==='task:1:2026-11-16'));
  assert.equal([...notices.values()].some(item=>item.dedupeKey.startsWith('task:2:')||item.dedupeKey.startsWith('task:3:')),false);
  events.get(1).date=new Date('2026-11-16T20:00:00Z');
  await generateReminders(new Date('2026-11-16T10:02:00Z'));
  assert.equal(notices.size,count+1);
});

test('notifications are newest first, recipient-scoped, and read state is idempotent',async()=>{
  const list=(await invoke('get','/notifications')).data;
  assert.ok(list.notifications.length>0);
  assert.ok(list.notifications.every(item=>item.recipientId===7));
  assert.deepEqual(list.notifications.map(item=>item.id),list.notifications.map(item=>item.id).sort((a,b)=>b-a));
  const own=list.notifications[0];
  const foreign=[...notices.values()].find(item=>item.recipientId===8);
  await assert.rejects(invoke('patch','/notifications/:id/read',{params:{id:String(foreign.id)}}),{status:404});
  await invoke('patch','/notifications/:id/read',{params:{id:String(own.id)}});
  const timestamp=notices.get(own.id).readAt;
  await invoke('patch','/notifications/:id/read',{params:{id:String(own.id)}});
  assert.equal(notices.get(own.id).readAt,timestamp);
  assert.equal((await invoke('get','/notifications')).data.unreadCount,list.unreadCount-1);
  await invoke('patch','/notifications/read-all');
  assert.equal((await invoke('get','/notifications')).data.unreadCount,0);
  assert.ok((await invoke('get','/notifications',{userId:8})).data.unreadCount>0);
  await assert.rejects(invoke('get','/notifications',{userId:null}),{status:401});
});
