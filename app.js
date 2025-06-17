const express=require('express')
const path=require('path')
const multer=require('multer')
const fs=require('fs')
const app=express()
const uploadDir=path.join(__dirname,'public/images/uploads')
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
}
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.static('public',{
    setHeaders:function(res,path){
      if(path.endsWith('.css')){
        res.set('Content-Type','text/css');
      }
    }
})) 
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images/uploads')  
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})
const upload=multer({storage:storage})
app.get("/",(req,res)=>{
    fs.readdir(uploadDir,(err,files)=>{
        if(err) return res.send(500).send('Error reading files')
        const visibleFiles=files.filter(file=>!file.startsWith('.'))
        res.render("index",{files:visibleFiles})
    })
})
app.post("/upload",upload.single('uploadfile'),function(req,res){     
    res.redirect("/")
})  
app.post("/delete",(req,res)=>{
    const filename=req.body.deletefile
    if(!filename) return res.redirect("/")
    const filePath=path.join(uploadDir,path.basename(filename))
    fs.unlink(filePath,(err)=>{
        if(err) console.log(err.message)
        else console.log("file deleted successfully")
    })
    res.redirect("/")
})
app.get("/view",(req,res)=>{
    const uploadDirectory=path.join(__dirname,"/public/images/uploads")
    fs.readdir(uploadDirectory,(err,files)=>{
        if(err) res.status(500)
        else res.json({files})
    })
})
app.listen(3000)