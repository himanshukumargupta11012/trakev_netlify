const mongoose=require("mongoose")
mongoose.connect("mongodb://localhost:27017/EV_login_info",{
}).then(()=>
    console.log("connection successful")
).catch((err)=>console.log("404 page not found")

)