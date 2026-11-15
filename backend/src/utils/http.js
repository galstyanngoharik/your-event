const { ZodError } = require('zod');
const wrap = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const fail = (status,message)=>Object.assign(new Error(message),{status});
const parse = (schema,value)=>schema.parse(value);
const publicUser = u => {const v=u.toJSON?u.toJSON():{...u};delete v.passwordHash;delete v.instagram;delete v.phoneNumber;return v;};
const errors=(err,req,res,next)=>{if(err instanceof ZodError)return res.status(400).json({message:'Validation failed',errors:err.flatten()});if(err.name==='SequelizeUniqueConstraintError')return res.status(409).json({message:'Already exists'});if(err.name==='SequelizeForeignKeyConstraintError')return res.status(400).json({message:'Invalid reference'});if(err.name==='SequelizeValidationError')return res.status(400).json({message:err.message});if(err.name==='MulterError')return res.status(400).json({message:err.message});if(err.name==='JsonWebTokenError'||err.name==='TokenExpiredError')return res.status(401).json({message:'Invalid or expired token'});if(!err.status||err.status>=500)console.error(err);res.status(err.status||500).json({message:err.status?err.message:'Internal server error'});};
module.exports={wrap,fail,parse,publicUser,errors};
