const jwt = require('jsonwebtoken')
const jwtAuthMiddleware = (req,res,next)=>{
// checking if token is present in the request header
const authorization= req.headers.authorization
if (!authorization ){
    return res.status(401).json({error :"token not found"})
}
const token = req.headers.authorization.split(' ')[1]
if (!token){
    return res.status(401).json({error :"unauthorized"})
}
// verifying jwt token
try {
    const decoded= jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded
    next()
}
catch(err){
   console.log(err)
   res.status(401).json({error:"invalid token"})
}
}
// generating token
const generate_token=(userdata)=>{
 return jwt.sign({userdata}, process.env.JWT_SECRET,{expiresIn: 3000})

}
 
    module.exports={jwtAuthMiddleware,generate_token}