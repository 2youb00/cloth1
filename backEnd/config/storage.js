const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { cloudinary } = require("./cloudinary")

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cloth", 
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
})

const upload = multer({ storage })

module.exports = upload
