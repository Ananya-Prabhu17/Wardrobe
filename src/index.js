const express = require("express")
const multer = require("multer")
const path = require("path")
const hbs = require("hbs")
const mongoose = require("mongoose")
const exphbs = require("express-handlebars")

const app = express()


//Connecting to mongodb database
mongoose.connect("mongodb://127.0.0.1:27017/wardrobe",{
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(()=>
{
    console.log("Mongo connected");
})
.catch(()=>
{
    console.log("Failed to connect");
})

//This is the path for all the hbs files
const templatePath = path.join(__dirname,'../templates')

app.use(express.json())
app.use(express.static('public'))
app.use(express.static(__dirname+"./public/"))

app.set("view engine","hbs")
app.set("views",templatePath)
app.use(express.urlencoded({extended:false}))

//storage and filename settings
var Storage = multer.diskStorage({
    destination: "./public/images/",
    filename : (req, file, cb)=>{
     // cb(null, Date.now(+file+originalname))
      cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

var upload = multer({
    storage: Storage
}).single('photo')//photo because we have given name='photo' in upload form


//Schema for login collection
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

var uploadSchema = new mongoose.Schema({
  imagename: String,

})

var uploadModel = mongoose.model('uploadimage', uploadSchema)

var conn = mongoose.Collection

//These are the ROUTES
app.get("/",(req,res)=>{
  res.render("start")
})

app.get("/sl",(req,res)=>{
  res.render("sl")
})

app.get("/contact",(req,res)=>{
  res.render("contact")
})

app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/signup",(req,res)=>{
  res.render("signup")
})

app.get("/home",(req,res)=>{
  res.render("home")
})

app.get("/tup",(req,res)=>{
  res.render("tup")
})

app.get("/upload",(req,res)=>{
  res.render("upload")
})

app.get("/vw",(req,res)=>{
  res.render("vw")
})

// app.get("/college",(req,res)=>{
//   res.render("college")
// })

//This is to post the new users details into login collection
app.post("/signup",async(req,res)=>{
  const data = {
    name:req.body.name,
    password:req.body.password
  }
  await collection.insertMany([data])

  res.render("home")
})

//This is to validate the password for "already a user"
app.post("/login",async(req,res)=>{
    try{
        const check = await collection.findOne({name:req.body.name})
            if(check.password === req.body.password)
            {
                res.render("home")
            }
            else{
                res.send("Wrong password!")
            }
    }
    catch{
        res.send("Wrong details")
    }
  })

//image

// const multer = require('multer');
const uploads = multer({ dest: '/public/images' }); // Replace 'uploads/' with the desired destination folder for your uploaded files


app.get('/upload', (req, res) => {
  // imageData.exec(function(err,doc){
  //   if(err) throw err
  // })
  res.render('upload', { title: 'Upload file', records:data, success: '' });
})

// app.post('/upload',upload,function(req, res, next)
// {
//   var success = req.file.filename+ "Uploaded succesfully"
//   res.render("upload",{ title: 'Upload file', success:success})
// })

app.post('/upload', upload, async (req, res, next) => {

  
  var imageFile = req.file.filename
  if (!req.file) {
    return res.render('upload', { title: 'Upload file', success: 'No image file uploaded.' });
  }

  const successMessage = req.file.filename + ' uploaded successfully.'

  var imageDetails = new uploadModel({
    imagename: imageFile
  })

  try {
    const doc = await imageDetails.save();
    const successMessage = req.file.filename + ' uploaded successfully.'
    res.render('upload', { title: 'Upload file', success: successMessage })
  } catch (err) {
    throw err;
  }
  
  })

  app.get("/college", async (req, res) => {
    try {
      const imageData = await uploadModel.find({});
      const imageRecords = imageData.map((record) => {
        return { imagename: record.imagename, imageUrl: `./public/images/${record.imagename}` }
      })
      res.render("college", { title: "college", records: imageRecords, success: "" });
    } catch (err) {
      throw err;
    }
  });
  

  //To fetch the image in college.hbs
//  var imageData = uploadModel.find({})

//  imageData.exec(function(err,doc){
//    if(err) throw err
//    res.render('collge', {title: 'college' , records: data, success: successMessage })
//  })

//Server
app.listen(1999,()=>{
  console.log("Port connected")
})