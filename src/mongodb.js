const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
.then(()=>
{
    console.log("mongo connected");
})
.catch(()=>
{
    console.log("Failed to connect");
})

const LogInSchema = new mongoose.Schema(
    {
        name:{type:String,
            required:true
        },
        password:{type:String,
            required:true
        }  
 })

 const collection = new mongoose.model("login",LogInSchema)

 module.exports=collection