// importing multer so that we can access files from request.file
import multer from 'multer'

//initializes the memory engine so that we can store file in the memory  
const storage = multer.memoryStorage()

// specifying that multer can store only a single file 
const singleUpload = multer({ storage }).single("file");

// .exporting it to use it as a middleware
export default singleUpload;