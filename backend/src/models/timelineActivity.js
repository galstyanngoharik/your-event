module.exports=(db,D)=>db.define('TimelineActivity',{
  id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},
  title:{type:D.STRING(160),allowNull:false},
  startTime:{type:D.STRING(5),allowNull:false,validate:{is:/^(?:[01]\d|2[0-3]):[0-5]\d$/}},
  endTime:{type:D.STRING(5),allowNull:true,validate:{is:/^(?:[01]\d|2[0-3]):[0-5]\d$/}},
  description:{type:D.STRING(1500),allowNull:true},
  location:{type:D.STRING(250),allowNull:true},
},{indexes:[{fields:['eventId','startTime','id']}]});
