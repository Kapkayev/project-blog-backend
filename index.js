import express from 'express';
import mongoose from 'mongoose';
import multer  from "multer";
import cors from 'cors';
import fs from 'fs';
import { PostController, UserController } from './controllers/index.js';
import { loginValidation, registrationValidation, postCreateValidation } from './validations/validations.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';

mongoose
    .connect('mongodb+srv://admin:fyebc1999@cluster0.uoyg1sp.mongodb.net/blog?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then( () => console.log('DB connected'))
    .catch( (err) => console.log('DB not connected', err) )

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if(!fs.existsSync('uploads')){
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage  });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation , handleValidationErrors, UserController.login);
app.post('/auth/registration', registrationValidation, handleValidationErrors, UserController.registration);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/uploads', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads${req.file.originalname}`,
    })
});

app.get('/tags', PostController.getLastTags);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post(
    '/posts', 
    checkAuth, 
    postCreateValidation, 
    handleValidationErrors, 
    PostController.create
);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
    '/posts/:id', 
    checkAuth, 
    postCreateValidation, 
    handleValidationErrors, 
    PostController.update
);

const PORT = process.env.PORT || 4444;

app.listen(PORT, (err) => {
    if(err){
        return console.log(err);
    }

    console.log('Server started');
})