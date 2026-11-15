const jwt=require('jsonwebtoken');const {User}=require('../models');const {wrap,fail}=require('../utils/http');
const auth=wrap(async(req,res,next)=>{const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)throw fail(401,'Authentication required');const data=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});const user=await User.findByPk(data.id);if(!user)throw fail(401,'Account not found');req.user=user;next();});
const role=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():next(fail(403,'Forbidden'));
module.exports={auth,role};
