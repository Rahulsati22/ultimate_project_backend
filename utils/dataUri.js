import DataURIParser from "datauri/parser.js";
import path from 'path'

// here file is an object which contains fieldname, originalname, encoding, mimetype, buffer
const getDataUri = (file) => {
    // new instance of DataUriParser is created helps to create data uri from file
    const parser = new DataURIParser();

    // it will find the type of file like jpg in this case and then converting it to string for consistency
    const extName = path.extname(file.originalname).toString()

    // method converts the file data into datauri based on the extension

    // buffer holds the actual content of the file.this is a way to store raw binary data in memory.here buffer contains the data of the jpg file 
    return parser.format(extName, file.buffer)
}

export default getDataUri;


/*
*data uri is a way to encode data such as files images audio etc. into a url
*the encoded string we are creating can be used directly into html, css and js 


!question->why we are converting a file into data uri?
*ans->1) by doing this you can direct embedd your data into some code
      *2) helps us to style images and files
*/ 