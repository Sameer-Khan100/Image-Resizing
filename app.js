const express = require("express");
const multer = require("multer");
const fs = require("fs")
const path = require("path")
const sharp = require('sharp');


const app = express();

const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
      },
      filename: function (req, file, cb) {
        const originalname = file.originalname
        const [name, ext] = originalname.split(".");
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${name}-${uniqueSuffix}.${ext}`);
      }
})

const upload = multer({ storage })

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

if (!fs.existsSync('resized')) {
    fs.mkdirSync('resized');
  }

const resizeImage = async (imagePath)=>{
    const outputDir = 'resized'
    const resolutions =[22000, 1080, 720, 512, 256]

    const resizePromises = resolutions.map((size) => {
        const outputImagePath = path.join(outputDir, `${path.basename(imagePath, path.extname(imagePath))}_${size}px${path.extname(imagePath)}`);
        return sharp(imagePath)
          .resize(size)
          .toFile(outputImagePath)
          .then(() => {
            console.log(`Image resized to ${size}px and saved to ${outputImagePath}`);
          })
          .catch((err) => {
            console.error(`Error resizing image to ${size}px:`, err);
          });
      });
      await Promise.all(resizePromises);
}


app.post("/upload", upload.single("image"),(req,res)=>{
    res.send("Image Uplaoded Successfully")

    const imagePath = req.file.path;
    resizeImage(imagePath);
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });





  