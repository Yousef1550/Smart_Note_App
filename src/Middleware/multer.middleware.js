import multer from "multer";
import fs from 'fs'



export const MulterLocal = (allowedExtentions = []) => {
    // creating the folder if not exists
    const destinationFolder = 'Uploads'
    if(!fs.existsSync(destinationFolder)){
        fs.mkdirSync(destinationFolder) 
    }

    // diskStroage or memoryStorage
    const storage = multer.diskStorage({
        // destination
        destination: function(req, file, cb) {          
            cb(null, destinationFolder)
        },

        // filename
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + '__' + file.originalname)                
        }
    })

    
    const fileFilter = (req, file, cb) => {
        if(allowedExtentions.includes(file.mimetype)){
            cb(null, true)
        } else {
            cb(new Error('Invalid file type'), false)
        }
    }
    
    const upload = multer({fileFilter, storage})

    return upload       
}


