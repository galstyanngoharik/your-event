const express=require('express');const bcrypt=require('bcryptjs');const jwt=require('jsonwebtoken');const {z}=require('zod');const {randomUUID}=require('crypto');
const {db,User,Event,Task,Expense,Guest,Invitation,Service,Favorite,Conversation,Message,Review}=require('../models');const {auth,role}=require('../middleware/auth');const {wrap,fail,parse,publicUser}=require('../utils/http');
const r=express.Router();const string=z.string().trim().min(1);const id=z.coerce.number().int().positive();const num=z.coerce.number().min(0);const obj=z.object;const check=(schema,req)=>parse(schema,req.body);const send=(res,v,status=200)=>res.status(status).json(v);const safe=(fn)=>wrap(fn);
const userFields=obj({name:string.max(120).optional(),avatar:z.string().max(500).nullable().optional(),bio:z.string().max(2000).nullable().optional(),businessName:z.string().max(160).nullable().optional(),workingCities:z.array(string.max(80)).max(30).optional(),instagram:z.string().max(255).nullable().optional(),phoneNumber:z.string().max(32).nullable().optional()}).strict();
const eventFields=obj({title:string.max(160),type:string.max(80),description:z.string().max(5000).optional(),date:z.coerce.date(),city:string.max(100),address:z.string().max(250).optional(),budget:num.optional(),currency:z.enum(['AMD','USD','EUR','RUB']).optional(),expectedGuests:z.coerce.number().int().min(0).optional(),coverImage:z.string().max(500).optional(),status:z.enum(['planning','completed','cancelled']).optional()}).strict();
const taskFields=obj({title:string.max(200),completed:z.boolean().optional(),dueDate:z.string().date().nullable().optional()}).strict();
const expenseFields=obj({title:string.max(200),category:string.max(80),amount:num}).strict();
const guestFields=obj({name:string.max(120),status:z.enum(['invited','going','declined']).optional()}).strict();
const serviceFields=obj({title:string.max(160),category:string.max(80),description:z.string().max(5000).optional(),city:string.max(100),price:num,images:z.array(z.string().max(500)).max(12).optional(),active:z.boolean().optional()}).strict();
const invitationFields=obj({envelope:z.enum(['invitation1','invitation2','invitation3']).nullable().optional(),backgroundTemplate:z.enum(Array.from({length:12},(_,index)=>`f${index+1}`)).nullable().optional(),theme:z.enum(['classic','soft','dark']).optional(),template:z.enum(['romantic','classic','modern']).optional(),backgroundColor:z.enum(['cream','blush','white','burgundy','dustyRose']).optional(),textColor:z.enum(['burgundy','white','dustyRose','black']).optional(),headingStyle:z.enum(['serif','sans']).optional(),title:z.string().max(160).nullable().optional(),message:z.string().max(1500).nullable().optional(),published:z.boolean().optional(), backgroundImage: z.string().max(500).nullable().optional()
}).strict();
const reviewFields=obj({rating:z.number().int().min(1).max(5),comment:z.string().trim().max(1000).nullable().optional()}).strict();
const reviewPatchFields=obj({rating:z.number().int().min(1).max(5).optional(),comment:z.string().trim().max(1000).nullable().optional()}).strict();
const privateUser=u=>({...publicUser(u),...(u.role==='provider'?{instagram:u.instagram||null,phoneNumber:u.phoneNumber||null}:{})});
const normalizeInstagram=value=>{if(value==null||value.trim()==='')return null;const input=value.trim();if(input.startsWith('@')){const username=input.slice(1);if(!/^[A-Za-z0-9._]{1,30}$/.test(username))throw fail(400,'Invalid Instagram username');return `https://www.instagram.com/${username}/`;}let url;try{url=new URL(input);}catch{throw fail(400,'Enter a valid Instagram profile URL or @username');}if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname.toLowerCase()))throw fail(400,'Instagram URL must use https://www.instagram.com');const match=url.pathname.match(/^\/([A-Za-z0-9._]{1,30})\/?$/);if(!match)throw fail(400,'Enter a valid Instagram profile URL');return `https://www.instagram.com/${match[1]}/`;};
const validPhone=value=>{if(value==null||value.trim()==='')return null;const phone=value.trim();const digits=phone.replace(/\D/g,'');if(!/^\+?[0-9][0-9().\s-]*$/.test(phone)||digits.length<7||digits.length>15)throw fail(400,'Enter a valid international phone number');return phone;};
const eventOwned=require('../utils/eventOwned');
const serviceFilters=require('../utils/serviceFilters');
const serviceOwned=async(req)=>{const s=await Service.findByPk(id.parse(req.params.id));if(!s)throw fail(404,'Service not found');if(s.providerId!==req.user.id)throw fail(403,'Forbidden');return s;};
const childOwned=async(req,M)=>{await eventOwned(req);const item=await M.findOne({where:{id:id.parse(req.params.itemId),eventId:id.parse(req.params.eventId)}});if(!item)throw fail(404,'Item not found');return item;};
const paging=req=>({limit:Math.min(50,Math.max(1,Number(req.query.limit)||12)),offset:Math.max(0,Number(req.query.offset)||0)});
r.post('/auth/register',safe(async(req,res)=>{const data=check(obj({name:string.max(120),email:z.string().email(),password:z.string().min(8).max(128),role:z.enum(['organizer','provider'])}).strict(),req);const email=data.email.toLowerCase();if(await User.findOne({where:{email}}))throw fail(409,'Email already registered');const user=await User.create({name:data.name,email,role:data.role,passwordHash:await bcrypt.hash(data.password,12)});send(res,{user:publicUser(user)},201);}));
r.post('/auth/login',safe(async(req,res)=>{const data=check(obj({email:z.string().email(),password:z.string()}).strict(),req);const user=await User.findOne({where:{email:data.email.toLowerCase()}});if(!user||!await bcrypt.compare(data.password,user.passwordHash))throw fail(401,'Invalid credentials');send(res,{token:jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'7d',algorithm:'HS256'}),user:publicUser(user)});}));
r.get('/auth/me',auth,safe(async(req,res)=>send(res,privateUser(req.user))));
r.patch('/users/me',auth,safe(async(req,res)=>{const data=check(userFields,req);if(req.user.role!=='provider'&&(data.businessName!==undefined||data.workingCities!==undefined||data.instagram!==undefined||data.phoneNumber!==undefined))throw fail(403,'Provider fields only');if(req.user.role==='provider'){if(data.instagram!==undefined)data.instagram=normalizeInstagram(data.instagram);if(data.phoneNumber!==undefined)data.phoneNumber=validPhone(data.phoneNumber);}await req.user.update(data);send(res,privateUser(req.user));}));
r.patch('/users/me/password',auth,safe(async(req,res)=>{const d=check(obj({currentPassword:string,newPassword:z.string().min(8).max(128)}).strict(),req);if(!await bcrypt.compare(d.currentPassword,req.user.passwordHash))throw fail(400,'Incorrect current password');await req.user.update({passwordHash:await bcrypt.hash(d.newPassword,12)});send(res,{message:'Password changed'});}));
r.get('/events', auth, role('organizer'), safe(async (req, res) => {
  const include = req.query.analytics === 'true' ? [
    { model: Task, as: 'tasks', separate: true },
    { model: Expense, as: 'expenses', separate: true },
    { model: Guest, as: 'guests', separate: true },
  ] : [];
  send(res, await Event.findAll({
    where: { organizerId: req.user.id }, order: [['date', 'ASC']], include,
  }));
}));
r.post('/events',auth,role('organizer'),safe(async(req,res)=>{const d=check(eventFields,req);const e=await Event.create({...d,organizerId:req.user.id});const templates={birthday:['Choose venue','Create guest list','Order cake','Book photographer','Send invitations'],wedding:['Choose venue','Create guest list','Book photographer','Arrange decorations','Send invitations'],corporate:['Book venue','Prepare agenda','Invite attendees','Arrange catering']};await Task.bulkCreate((templates[d.type.toLowerCase()]||['Choose venue','Invite guests','Prepare event']).map(title=>({title,eventId:e.id})));send(res,e,201);}));
r.get('/events/:id',auth,role('organizer'),safe(async(req,res)=>{const e=await eventOwned(req);send(res,await Event.findByPk(e.id,{include:[{model:Task,as:'tasks'},{model:Expense,as:'expenses'},{model:Guest,as:'guests'},{model:Invitation,as:'invitation'}]}));}));
r.patch('/events/:id',auth,role('organizer'),safe(async(req,res)=>{const e=await eventOwned(req);await e.update(check(eventFields.partial(),req));send(res,e);}));
r.delete('/events/:id',auth,role('organizer'),safe(async(req,res)=>{await(await eventOwned(req)).destroy();res.status(204).end();}));
for(const [path,M,schema] of [['tasks',Task,taskFields],['expenses',Expense,expenseFields],['guests',Guest,guestFields]]){
 r.get(`/events/:eventId/${path}`,auth,role('organizer'),safe(async(req,res)=>{await eventOwned(req);send(res,await M.findAll({where:{eventId:id.parse(req.params.eventId)},order:[['createdAt','ASC']]}));}));
 r.post(`/events/:eventId/${path}`,auth,role('organizer'),safe(async(req,res)=>{await eventOwned(req);send(res,await M.create({...check(schema,req),eventId:id.parse(req.params.eventId)}),201);}));
 r.patch(`/events/:eventId/${path}/:itemId`,auth,role('organizer'),safe(async(req,res)=>{const item=await childOwned(req,M);await item.update(check(schema.partial(),req));send(res,item);}));
 r.delete(`/events/:eventId/${path}/:itemId`,auth,role('organizer'),safe(async(req,res)=>{await(await childOwned(req,M)).destroy();res.status(204).end();}));
}
r.put('/events/:eventId/invitation',auth,role('organizer'),safe(async(req,res)=>{await eventOwned(req);const data=check(invitationFields,req);let invitation=await Invitation.findOne({where:{eventId:id.parse(req.params.eventId)}});if(invitation)await invitation.update(data);else invitation=await Invitation.create({...data,eventId:id.parse(req.params.eventId)});send(res,invitation);}));
r.get('/invitations/:token',safe(async(req,res)=>{const inv=await Invitation.findOne({where:{token:req.params.token,published:true},include:[{model:Event,attributes:['title','type','description','date','city','address','coverImage']} ]});if(!inv)throw fail(404,'Invitation not found');send(res,inv);}));
r.post('/invitations/:token/rsvp',safe(async(req,res)=>{const d=check(obj({name:string.max(120),status:z.enum(['going','declined'])}).strict(),req);const inv=await Invitation.findOne({where:{token:req.params.token,published:true}});if(!inv)throw fail(404,'Invitation not found');const guest=await db.transaction(transaction=>Guest.create({...d,eventId:inv.eventId,responseToken:randomUUID()},{transaction,notifyRsvp:true}));send(res,{guestId:guest.id,responseToken:guest.responseToken,status:guest.status},201);}));
r.patch('/rsvp/:responseToken',safe(async(req,res)=>{const d=check(obj({status:z.enum(['going','declined'])}).strict(),req);const guest=await Guest.findOne({where:{responseToken:req.params.responseToken}});if(!guest)throw fail(404,'Response not found');await guest.update(d);send(res,{status:guest.status});}));
r.get('/services', safe(async (req, res) => {
  const where = serviceFilters(req.query);
  if (req.query.providerId !== undefined) where.providerId = id.parse(req.query.providerId);
  const order = req.query.sort === 'price_asc' ? [['price', 'ASC']]
    : req.query.sort === 'price_desc' ? [['price', 'DESC']] : [['createdAt', 'DESC']];
  send(res, await Service.findAndCountAll({
    where, order, ...paging(req),
    include: [{
      model: User, as: 'provider',
      attributes: ['id', 'name', 'avatar', 'businessName', 'bio', 'workingCities'],
    }],
  }));
}));
r.get('/services/mine',auth,role('provider'),safe(async(req,res)=>send(res,await Service.findAll({where:{providerId:req.user.id},order:[['createdAt','DESC']]}))));
r.get('/services/:id',safe(async(req,res)=>{const item=await Service.findByPk(id.parse(req.params.id),{include:[{model:User,as:'provider',attributes:['id','name','avatar','businessName','bio','workingCities']}]});if(!item||!item.active)throw fail(404,'Service not found');send(res,item);}));
r.post('/services',auth,role('provider'),safe(async(req,res)=>send(res,await Service.create({...check(serviceFields,req),providerId:req.user.id}),201)));
r.patch('/services/:id',auth,role('provider'),safe(async(req,res)=>{const item=await serviceOwned(req);await item.update(check(serviceFields.partial(),req));send(res,item);}));
r.delete('/services/:id',auth,role('provider'),safe(async(req,res)=>{await(await serviceOwned(req)).destroy();res.status(204).end();}));
r.get('/providers', safe(async (req, res) => {
  const search = String(req.query.search || '').trim().slice(0, 100);
  if (search.length < 2) return send(res, []);
  const { Op } = require('sequelize');
  const catalog = req.query.catalog === 'true';
  const providers = await User.findAll({
    where: {
      role: 'provider',
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { businessName: { [Op.iLike]: `%${search}%` } },
      ],
    },
    attributes: ['id', 'name', 'avatar', 'bio', 'businessName', 'workingCities'],
    include: catalog ? [{
      model: Service, attributes: [], required: true,
      where: serviceFilters(req.query, 'Services', false),
    }] : [],
    order: [['name', 'ASC']], limit: 10, subQuery: false,
    // Group before limiting so multiple matching services cannot hide other providers.
    group: catalog ? ['User.id'] : undefined,
  });
  send(res, providers);
}));
r.get('/providers/:id/reviews/mine',auth,role('organizer'),safe(async(req,res)=>{const providerId=id.parse(req.params.id);if(!await User.findOne({where:{id:providerId,role:'provider'},attributes:['id']}))throw fail(404,'Provider not found');send(res,await Review.findOne({where:{providerId,organizerId:req.user.id}}));}));
r.get('/providers/:id/reviews',safe(async(req,res)=>{const providerId=id.parse(req.params.id);if(!await User.findOne({where:{id:providerId,role:'provider'},attributes:['id']}))throw fail(404,'Provider not found');const where={providerId};const {fn,col}=require('sequelize');const [reviews,stats]=await Promise.all([Review.findAll({where,attributes:['id','rating','comment','createdAt','updatedAt'],include:[{model:User,as:'organizer',attributes:['name']}],order:[['createdAt','DESC']]}),Review.findOne({where,attributes:[[fn('AVG',col('rating')),'averageRating'],[fn('COUNT',col('id')),'reviewCount']],raw:true})]);send(res,{averageRating:Number(stats?.averageRating)||0,reviewCount:Number(stats?.reviewCount)||0,reviews});}));
r.post('/providers/:id/reviews',auth,role('organizer'),safe(async(req,res)=>{const providerId=id.parse(req.params.id);const provider=await User.findOne({where:{id:providerId,role:'provider'},attributes:['id']});if(!provider)throw fail(404,'Provider not found');if(provider.id===req.user.id)throw fail(403,'Providers cannot review themselves');const data=check(reviewFields,req);const values={rating:data.rating,comment:data.comment?.trim()||null};let review=await Review.findOne({where:{providerId,organizerId:req.user.id}});if(review){await review.update(values);return send(res,review);}review=await Review.create({...values,providerId,organizerId:req.user.id});send(res,review,201);}));
r.patch('/reviews/:id',auth,role('organizer'),safe(async(req,res)=>{const review=await Review.findByPk(id.parse(req.params.id));if(!review)throw fail(404,'Review not found');if(review.organizerId!==req.user.id)throw fail(403,'Forbidden');const data=check(reviewPatchFields,req);await review.update({...data,comment:data.comment===undefined?undefined:data.comment?.trim()||null});send(res,review);}));
r.delete('/reviews/:id',auth,role('organizer'),safe(async(req,res)=>{const review=await Review.findByPk(id.parse(req.params.id));if(!review)throw fail(404,'Review not found');if(review.organizerId!==req.user.id)throw fail(403,'Forbidden');await review.destroy();res.status(204).end();}));
r.get('/providers/:id',safe(async(req,res)=>{const provider=await User.findOne({where:{id:id.parse(req.params.id),role:'provider'},attributes:['id','name','avatar','bio','businessName','workingCities','instagram','phoneNumber'],include:[{model:Service,where:{active:true},required:false}]});if(!provider)throw fail(404,'Provider not found');send(res,provider);}));
r.get('/favorites',auth,role('organizer'),safe(async(req,res)=>send(res,await Favorite.findAll({where:{organizerId:req.user.id},include:[{model:Service,include:[{model:User,as:'provider',attributes:['id','name','businessName']}]}]}))));
r.post('/favorites/:serviceId',auth,role('organizer'),safe(async(req,res)=>{const service=await Service.findByPk(id.parse(req.params.serviceId));if(!service||!service.active)throw fail(404,'Service not found');const [item,created]=await Favorite.findOrCreate({where:{organizerId:req.user.id,serviceId:service.id}});send(res,item,created?201:200);}));
r.delete('/favorites/:serviceId',auth,role('organizer'),safe(async(req,res)=>{await Favorite.destroy({where:{organizerId:req.user.id,serviceId:id.parse(req.params.serviceId)}});res.status(204).end();}));
r.get('/conversations',auth,safe(async(req,res)=>{const where=req.user.role==='organizer'?{organizerId:req.user.id}:{providerId:req.user.id};send(res,await Conversation.findAll({where,include:[{model:User,as:'organizer',attributes:['id','name','avatar']},{model:User,as:'provider',attributes:['id','name','avatar','businessName']},{model:Message,as:'messages',attributes:['body','createdAt','senderId'],separate:true,limit:1,order:[['createdAt','DESC']]}],order:[['updatedAt','DESC']]}));}));
r.post('/conversations',auth,role('organizer'),safe(async(req,res)=>{const d=check(obj({providerId:id}).strict(),req);const provider=await User.findOne({where:{id:d.providerId,role:'provider'}});if(!provider)throw fail(404,'Provider not found');const [item,created]=await Conversation.findOrCreate({where:{organizerId:req.user.id,providerId:provider.id}});send(res,item,created?201:200);}));
module.exports=r;
