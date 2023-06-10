const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs=require("fs");


const app = express();

// Connecting to MongoDB database
mongoose.connect("mongodb://127.0.0.1:27017/wardrobe", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

// This is the path for all the hbs files
const templatePath = path.join(__dirname, "../templates");

app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname + './public/'));

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// Setting up Multer storage for different upload options

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination directory based on the option value
    const { option } = req.body;
    let uploadPath = "";

    if (option === 'traditional') {
      uploadPath = './uploads/traditional';
    } else if (option === 'casual') {
      uploadPath = './uploads/casual';
    } else if (option === 'party') {
      uploadPath = './uploads/party';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Schema for login collection
const LogInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const collection = mongoose.model("login", LogInSchema);

const uploadSchema = new mongoose.Schema({
  option: String,
  imagePath: String,
});

const uploadModel = mongoose.model("uploadimage", uploadSchema);

// Static files and middleware
app.use(express.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => {
  res.render("start");
});

app.get("/sl", (req, res) => {
  res.render("sl");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/tup", (req, res) => {
  res.render("tup");
});

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.get("/vw", (req, res) => {
  res.render("vw");
});



// This is to post the new user's details into the login collection
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password
  };

  await collection.insertMany([data]);

  res.render("home");
});

// This is to validate the password for "already a user"
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      res.render("home");
    } else {
      res.send("Wrong password!");
    }
  } catch (error) {
    res.send("Wrong details");
  }
});

app.post('/upload', upload.fields([
  { name: 'traditional', maxCount: 1 },
  { name: 'casual', maxCount: 1 },
  { name: 'party', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const traditionalImages = req.files['traditional'];
    const casualImages = req.files['casual'];
    const partyImages = req.files['party'];

    if (traditionalImages && traditionalImages.length > 0) {
      // Process traditional images
      for (const file of traditionalImages) {
        const traditionalImagePath = `/uploads/traditional/${file.filename}`;
        const traditionalImageDetails = new uploadModel({
          option: 'traditional',
          imagePath: traditionalImagePath,
        });
        await traditionalImageDetails.save();
      }
    }

    if (casualImages && casualImages.length > 0) {
      // Process casual images
      for (const file of casualImages) {
        const casualImagePath = `/uploads/casual/${file.filename}`;
        const casualImageDetails = new uploadModel({
          option: 'casual',
          imagePath: casualImagePath,
        });
        await casualImageDetails.save();
      }
    }

    if (partyImages && partyImages.length > 0) {
      // Process party images
      for (const file of partyImages) {
        const partyImagePath = `/uploads/party/${file.filename}`;
        const partyImageDetails = new uploadModel({
          option: 'party',
          imagePath: partyImagePath,
        });
        await partyImageDetails.save();
      }
    }

    res.send('Images uploaded successfully');
  } catch (err) {
    console.error('Error uploading images:', err);
    res.status(500).send('Error uploading images');
  }
});

app.get("/t", async (req, res) => {
  try {
    const images = await uploadModel.find({ option: "traditional" }).lean();
    const absoluteImages = images.map((image) => ({
      ...image,
      imagePath: path.join(__dirname, "../public", image.imagePath),
    }));
    res.render("t", { images: absoluteImages });
  } catch (err) {
    console.error("Error fetching traditional images:", err);
    res.status(500).send("Error fetching images");
  }
});

app.get("/c", async (req, res) => {
  try {
    const images = await uploadModel.find({ option: "casual" }).lean();
    const absoluteImages = images.map((image) => ({
      ...image,
      imagePath: path.join(__dirname, "../public", image.imagePath),
    }));
    res.render("c", { images: absoluteImages });
  } catch (err) {
    console.error("Error fetching casual images:", err);
    res.status(500).send("Error fetching images");
  }
});

app.get("/p", async (req, res) => {
  try {
    const images = await uploadModel.find({ option: "party" }).lean();
    const absoluteImages = images.map((image) => ({
      ...image,
      imagePath: path.join(__dirname, "../public", image.imagePath),
    }));
    res.render("p", { images: absoluteImages });
  } catch (err) {
    console.error("Error fetching party images:", err);
    res.status(500).send("Error fetching images");
  }
});




// Start the server
app.listen(2008, () => {
  console.log("Server started on port 2000");
});
