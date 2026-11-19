module.exports=({Message,Guest,Conversation,Event,User,Notification})=>{
  const store=(values,transaction)=>Notification.findOrCreate({
    where:{dedupeKey:values.dedupeKey},defaults:values,transaction,
  });
  const conversationNotice=async(message,options,updated=false)=>{
    const transaction=options.transaction;
    const conversation=await Conversation.findByPk(message.conversationId,{transaction});
    if(!conversation)return;
    const fromOrganizer=message.senderId===conversation.organizerId;
    if(!fromOrganizer&&message.senderId!==conversation.providerId)return;
    const recipientId=fromOrganizer?conversation.providerId:conversation.organizerId;
    const sender=await User.findByPk(message.senderId,{transaction});
    const name=sender?.businessName||sender?.name||'User';
    const action=message.deletedAt?'deleted':updated?'edited':'sent';
    const occurrence=updated?`${message.deletedAt?'deleted':'edited'}:${new Date(message.deletedAt||message.editedAt).toISOString()}`:'new';
    await store({
      recipientId,type:updated?'conversation_update':'message',
      title:updated?'Conversation updated':`New message from ${name}`.slice(0,160),
      description:`${name} ${action} a message.`.slice(0,500),
      entityId:conversation.id,
      link:`/${fromOrganizer?'provider':'organizer'}/messages?chat=${conversation.id}`,
      dedupeKey:`message:${message.id}:${occurrence}`,
    },transaction);
  };
  Message.addHook('afterCreate','notifyRecipient',(message,options)=>conversationNotice(message,options));
  Message.addHook('afterUpdate','notifyConversationUpdate',(message,options)=>{
    if(message.changed('deletedAt')||message.changed('editedAt'))return conversationNotice(message,options,true);
  });
  Guest.addHook('afterCreate','notifyRsvp',async(guest,options)=>{
    if(!options.notifyRsvp||!['going','declined'].includes(guest.status))return;
    const event=await Event.findByPk(guest.eventId,{transaction:options.transaction});
    if(!event)return;
    await store({
      recipientId:event.organizerId,type:'rsvp',title:'New notification',
      description:`${guest.name} ${guest.status==='going'?'will attend':'declined'}: ${event.title}`.slice(0,500),
      entityId:event.id,link:`/organizer/events/${event.id}`,
      dedupeKey:`rsvp:${guest.id}`,
    },options.transaction);
  });
};
