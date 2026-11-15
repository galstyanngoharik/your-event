const { DataTypes: D } = require('sequelize');
const db = require('../config/db');
const User = db.define('User', { id:{type:D.INTEGER,primaryKey:true,autoIncrement:true}, name:{type:D.STRING,allowNull:false}, email:{type:D.STRING,allowNull:false,unique:true,validate:{isEmail:true}}, passwordHash:{type:D.STRING,allowNull:false}, role:{type:D.ENUM('organizer','provider'),allowNull:false}, avatar:D.STRING, bio:D.TEXT, businessName:D.STRING, workingCities:{type:D.ARRAY(D.STRING),defaultValue:[]}, instagram:D.STRING(255), phoneNumber:D.STRING(32) });
const Event = db.define('Event',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},title:{type:D.STRING,allowNull:false},type:{type:D.STRING,allowNull:false},description:D.TEXT,date:{type:D.DATE,allowNull:false},city:{type:D.STRING,allowNull:false},address:D.STRING,budget:{type:D.DECIMAL(12,2),defaultValue:0},expectedGuests:{type:D.INTEGER,defaultValue:0},coverImage:D.STRING,status:{type:D.ENUM('planning','completed','cancelled'),defaultValue:'planning'}});
const Task = db.define('Task',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},title:{type:D.STRING,allowNull:false},completed:{type:D.BOOLEAN,defaultValue:false},dueDate:D.DATEONLY});
const Expense = db.define('Expense',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},title:{type:D.STRING,allowNull:false},category:{type:D.STRING,allowNull:false},amount:{type:D.DECIMAL(12,2),allowNull:false}});
const Guest = db.define('Guest',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},name:{type:D.STRING,allowNull:false},status:{type:D.ENUM('invited','going','declined'),defaultValue:'invited'},responseToken:{type:D.UUID,defaultValue:D.UUIDV4,unique:true}});
const Invitation = db.define('Invitation',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},token:{type:D.UUID,defaultValue:D.UUIDV4,unique:true},theme:{type:D.ENUM('classic','soft','dark'),defaultValue:'classic'},title:D.STRING,message:D.TEXT,backgroundImage: {
    type: D.STRING,
    allowNull: true,
    defaultValue: null
  },published:{type:D.BOOLEAN,defaultValue:false},template:{type:D.STRING(16),allowNull:false,defaultValue:'classic',validate:{isIn:[['romantic','classic','modern']]}},backgroundColor:{type:D.STRING(16),allowNull:false,defaultValue:'cream',validate:{isIn:[['cream','blush','white','burgundy']]}},textColor:{type:D.STRING(16),allowNull:false,defaultValue:'burgundy',validate:{isIn:[['burgundy','white','dustyRose']]}},headingStyle:{type:D.STRING(8),allowNull:false,defaultValue:'serif',validate:{isIn:[['serif','sans']]}}});
const Service = db.define('Service',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},title:{type:D.STRING,allowNull:false},category:{type:D.STRING,allowNull:false},description:D.TEXT,city:{type:D.STRING,allowNull:false},price:{type:D.DECIMAL(12,2),allowNull:false},images:{type:D.ARRAY(D.STRING),defaultValue:[]},active:{type:D.BOOLEAN,defaultValue:true}});
const Favorite = db.define('Favorite',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true}},{indexes:[{unique:true,fields:['organizerId','serviceId']}]});
const Conversation = db.define('Conversation',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true}},{indexes:[{unique:true,fields:['organizerId','providerId']}]});
const Message = db.define('Message',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},body:{type:D.TEXT,allowNull:false},readAt:D.DATE});
const Review = db.define('Review',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},rating:{type:D.INTEGER,allowNull:false,validate:{min:1,max:5,isInt:true}},comment:{type:D.STRING(1000),allowNull:true}},{indexes:[{unique:true,fields:['organizerId','providerId']}]});
const PortfolioItem = db.define('PortfolioItem',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},mediaUrl:{type:D.STRING(500),allowNull:false},mediaType:{type:D.ENUM('image','video'),allowNull:false},caption:{type:D.STRING(250),allowNull:true},position:{type:D.INTEGER,allowNull:false,defaultValue:0}});
const MoodboardItem = db.define('MoodboardItem',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},imageUrl:{type:D.STRING(500),allowNull:false},caption:{type:D.STRING(250),allowNull:true},position:{type:D.INTEGER,allowNull:false,defaultValue:0}});
const MoodboardPalette = db.define('MoodboardPalette',{id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},colors:{type:D.JSONB,allowNull:false,defaultValue:[]}},{indexes:[{unique:true,fields:['eventId']}]});
User.hasMany(Event,{foreignKey:'organizerId',onDelete:'CASCADE'}); Event.belongsTo(User,{as:'organizer',foreignKey:'organizerId'});
for(const [M,alias] of [[Task,'tasks'],[Expense,'expenses'],[Guest,'guests']]) { Event.hasMany(M,{as:alias,foreignKey:'eventId',onDelete:'CASCADE'});M.belongsTo(Event,{foreignKey:'eventId'}); }
Event.hasOne(Invitation,{as:'invitation',foreignKey:'eventId',onDelete:'CASCADE'});Invitation.belongsTo(Event,{foreignKey:'eventId'});
User.hasMany(Service,{foreignKey:'providerId',onDelete:'CASCADE'});Service.belongsTo(User,{as:'provider',foreignKey:'providerId'});
User.hasMany(Favorite,{foreignKey:'organizerId',onDelete:'CASCADE'});Favorite.belongsTo(User,{foreignKey:'organizerId'});Service.hasMany(Favorite,{foreignKey:'serviceId',onDelete:'CASCADE'});Favorite.belongsTo(Service,{foreignKey:'serviceId'});

User.hasMany(Conversation,{as:'organizerConversations',foreignKey:'organizerId'});Conversation.belongsTo(User,{as:'organizer',foreignKey:'organizerId'});
User.hasMany(Conversation,{as:'providerConversations',foreignKey:'providerId'});Conversation.belongsTo(User,{as:'provider',foreignKey:'providerId'});
Conversation.hasMany(Message,{as:'messages',foreignKey:'conversationId',onDelete:'CASCADE'});Message.belongsTo(Conversation,{foreignKey:'conversationId'});Message.belongsTo(User,{as:'sender',foreignKey:'senderId'});
User.hasMany(Review,{as:'providerReviews',foreignKey:'providerId',onDelete:'CASCADE'});Review.belongsTo(User,{as:'provider',foreignKey:'providerId'});
User.hasMany(Review,{as:'organizerReviews',foreignKey:'organizerId',onDelete:'CASCADE'});Review.belongsTo(User,{as:'organizer',foreignKey:'organizerId'});
User.hasMany(PortfolioItem,{as:'portfolio',foreignKey:'providerId',onDelete:'CASCADE'});PortfolioItem.belongsTo(User,{as:'provider',foreignKey:'providerId'});
Event.hasMany(MoodboardItem,{as:'moodboardItems',foreignKey:'eventId',onDelete:'CASCADE'});MoodboardItem.belongsTo(Event,{foreignKey:'eventId'});
Event.hasOne(MoodboardPalette,{as:'moodboardPalette',foreignKey:'eventId',onDelete:'CASCADE'});MoodboardPalette.belongsTo(Event,{foreignKey:'eventId'});
module.exports={db,User,Event,Task,Expense,Guest,Invitation,Service,Favorite,Conversation,Message,Review,PortfolioItem,MoodboardItem,MoodboardPalette};
