var ENVCALURL = "";
// var ENVCALURL = "https://dev.calendaree.com:55000"
const https = require('https');
var busboy = require('connect-busboy');
const http = require('http');
const mysql = require('mysql');
const express = require('express');//manage servers and routes
var bodyParser = require('body-parser');
const crypto = require ("crypto");
const session = require('express-session');
const { Console, info, error } = require('console');
const { query } = require('express');
const app=express();
// app.use(bodyParser.json());
var up = bodyParser.urlencoded({ extended: false });
const oneDay = 1000 * 60 * 60 * 24;
const {v4 : uuidv4, validate} = require('uuid');
const multer = require("multer");
const fs = require('fs');
const QRCode = require('qrcode');
const base64ToImage = require('base64-to-image');
const base64ToFile = require('base64-to-file');
const { func } = require('assert-plus');
const { resolve } = require('path');
const { execFileSync } = require('child_process');
const { bashCompletionSpecFromOptions } = require('dashdash');
app.use("/static", express.static("static"));
//app.use(fileUpload());
const port = 55000;
const host = 'localhost';
var stats = ""
app.set('views', './views');
app.set('view engine', 'pug');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const csvtojson = require('csvtojson');

// export const isAuthenticated = async (req, res, next) => {
//     res.set('isAuth', true);
//     next();
// }


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneDay}
  }))

  app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true 
}));

//   secret - a random unique string key used to authenticate a session. It is stored in an environment variable and can’t be exposed to the public. The key is usually long and randomly generated in a production environment.

// resave - takes a Boolean value. It enables the session to be stored back to the session store, even if the session was never modified during the request. This can result in a race situation in case a client makes two parallel requests to the server. Thus modification made on the session of the first request may be overwritten when the second request ends. The default value is true. However, this may change at some point. false is a better alternative.

// saveUninitialized - this allows any uninitialized session to be sent to the store. When a session is created but not modified, it is referred to as uninitialized.

// cookie: { maxAge: oneDay } - this sets the cookie expiry time. The browser will delete the cookie after the set duration elapses. The cookie will not be attached to any of the requests in the future. In this case, we’ve set the maxAge to a single day as computed by the following arithmetic.

app.get("/1/login",function(req, res){
    req.session.destroy();
    res.render("login.pug")
})
const tempdocstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./userdata/tempfiles");
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    },    
    filename: (req, file, cb) => {
        const fileExtension = file.originalname
        req.session.filename = fileExtension
        // console.log(req.session.sessionid+ ' file upload ' + req.session.userid)
        cb(null, req.session.userid+"."+fileExtension.split(".").pop());
    },
})
const uploadtemp = multer({
    storage: tempdocstorage,
    limits: { fileSize: 209715200000}
})

app.get('/getattendanceuser/:filename', (req, res) => {
    fname = "./userdata/download/"+ req.params.filename
    //console.log(fname +" Address")

    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
 });
app.post("/1/fileoperations",uploadtemp.single('image'), async (req,res)=>{

//   app.post("/1/fileoperations",uploadtemp.single('video'), async (req,res)=>{
    if(!req.session.userid){
        res.send("sessionexpired")
    }else if(req.body.action == 'savefile'){
        console.log("save file -")
        res.send("ok")
    }else if(req.body.action == 'retriveimage'){
        console.log("retriv file -")
        retrivefile(req,res)
    }else if(req.body.action == 'replacefile'){
        console.log("replacefile file -")
        replacefile(req,res)
    }else if(req.body.action == 'deletefile'){
        console.log("delete file -")
        deletefile(req,res)
    }
    else{
        console.log("Wrong Choice")
    }
})

//image trtriv
function retrivefile(req,res,fileid1,path1,orgid,successfun){
    var fileid = fileid1
    console.log(path1 +" path1")
    var nameoftempfol = path1
    let sql = "select * from uploadfile where orgid like'"+orgid+"' and fileid like'"+fileid+"'"
    fcon.query(sql,function(err,result){
        console.log(sql + " retrive query 123")
        //console.log(result)
        if(err) console.log(err)
        else if(result.length>0){
            if (fs.existsSync("./userdata1/" + nameoftempfol)){
                
            }else{
                fs.mkdir("./userdata1/"+nameoftempfol,{ recursive: true }, function(err){
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("New directory successfully created.")
                    }
                })
            }
            try {
                let path = "./userdata1/" + nameoftempfol+"/"
                console.log(path+" retrivefile path")
                let filename1 = result[0].filename
                console.log(filename1 +"122")
                let filename = filename1.split(".")
                //  console.log(filename[0])
                //  console.log(filename[1] )
                var optionalObj = {'fileName': filename[0], 'type': filename[1]};
                base64ToImage(result[0].file,path,optionalObj);
                successfun(filename1)
                console.log(filename1)     
            } catch (error){
                successfun("error")
            }
        }else{
            successfun("No Image")
        }
    })
}
//retrivefile1

function retrivefile1(req,res,fileid1,path1,orgid,successfun){
    var fileid = fileid1
    // console.log(path1 +" path1")
    var nameoftempfol = path1
    let sql = "select * from uploadfile where orgid like'"+orgid+"' and fileid like'"+fileid+"'"
    fcon.query(sql,function(err,result){
        if(err){
            console.log(err)
        }else if(result.length>0){
            var arr=[];
        arr.push(result[0].filename)
        arr.push(result[0].file)
        arr.push(result[0].file.length)
        successfun(arr);
        }else{
            console.log("file not found")
            successfun("File not Found")
        }
    })
}
// video retriv
// function retrivefile(req,res,fileid1,path1,orgid,successfun){
//     //console.log("123456")
//     var fileid = fileid1
//    // console.log(fileid +"  fileid")
//     var nameoftempfol = path1
//     //console.log(nameoftempfol +" nameoftempfol")
//     let sql = "select * from uploadfile where orgid like'"+orgid+"' and fileid like'"+fileid+"'"
//     fcon.query(sql,function(err,result){
//        // console.log(sql)
//         //console.log(result)
//         if(err) console.log(err)
//         else if(result.length>0){
//             if (fs.existsSync("./userdata/" + nameoftempfol)){
                
//             }else{
//                 fs.mkdir("./userdata/"+nameoftempfol,{ recursive: true }, function(err){
//                     if (err) {
//                         console.log(err)
//                     } else {
//                         console.log("New directory successfully created.")
//                     }
//                 })
//             }
//             try {
//                 let path = "./userdata/" + nameoftempfol+"/"
//                 // console.log(path+" retrivefile path")
//                 let filename1 = result[0].filename
//                 let filename = filename1.split(".")
//                 //console.log(filename[0] +"")
//                 //console.log(filename[1] +"3333")
//                 var optionalObj = {'fileName': filename[0], 'type': filename[1]};
//                 //console.log(optionalObj.fileName + " " + optionalObj.type +" optionalObj")
//                 // base64ToImage(result[0].file,path,optionalObj);
//                 let obj1 = result[0].file.replace(/^data:(.*?);base64,/, ""); // <--- make it any type
//                 obj1 = obj1.replace(/ /g, '+'); // <--- this is important
//                 fs.writeFile(path+filename1, obj1, 'base64', function(err) {
//                    // console.log(err);
//                 });
//                 //  base64ToFile(result[0].file, path, optionalObj);
//                 // base64ToVideo(result[0].file,path,optionalObj);
//                 successfun(filename1)
//                 //console.log(filename1 +"   *filename1")     
//             } catch (error){
//                 console.log(error)
//                 successfun("error")
//             }
//         }else{
//             successfun("No Image")
//         }
//     })
// }

//---------------------------Update Quote Savefiledb, replace file,deletefile,retrivefile---------------------------
function savefiledb(req,res,orgid,successfun){
    let fileid = uuidv4(); 
    console.log(fileid +" --fileid")
    let success = fileid
    // console.log( success +" succ....")
    // console.log(req.session.filename +"  ..filename")
    if(req.session.filename == undefined || req.session.filename == 'undefined')
    {
        return successfun("error while uploading");
    }
    let fileExtension = req.session.filename.split(".").pop()
   console.log( fileExtension +" ...fileExtension")
    const file = "./userdata/tempfiles/"+req.session.userid+"."+fileExtension
    // console.log(file + " - file ***")
    if (fs.existsSync(file)){
        var bitmap = fs.readFileSync(file);
        // console.log(" - bitmap ***")
        let png = "data:image/"+fileExtension+";base64,"
        // console.log(png + " - png ***")
        var fileurl = Buffer.from(bitmap).toString('base64');
        png = png + fileurl
    //    console.log(file +"file -" + png+ +"-png")
        if (!file){
            console.log(" - !file ***")
           return successfun("Please upload a file.");
        }
        var sql = "insert into uploadfile(orgid,fileid,filename,file,date)values('"+orgid+"','"+fileid+"','"+req.session.filename+"','"+png+"',now())"
        try{
            fcon.query(sql,function(err,result){
                // console.log(  "......"+sql +" .. fcon  1234567890")
                if(err) console.log(err)
                else if(result.affectedRows>0){
                  return successfun(success);
                }else{
                    return successfun("error while uploading");
                }
            }) 
        } catch (error) {
            return successfun("error while uploading");
        }       
    } 
    else{
       return successfun("error while uploading")
    }
}

function savefiledb1(filename,filecontent, orgid, successfun) {
    let fileid = uuidv4();
    console.log(fileid + " --fileid");
    
    let fileExtension = filename.split(".").pop();
    console.log(fileExtension + " ...fileExtension");

    // Convert file content to base64
    let fileBase64 = filecontent.toString('base64');
    let fileurl = "data:image/" + fileExtension + ";base64," + fileBase64;
    // let fileurl = "data:image/" + fileExtension + ";base64,"; 
    var sql = "insert into uploadfile(orgid,fileid,filename,file,date)values('"+orgid+"','"+fileid+"', '"+filename+"', '"+fileurl+"', now())";
    try {
      fcon.query(sql,function (err, result) {
        // console.log("......" + sql + " .. fcon");
        if (err) {
          console.log(err);
          return successfun("error while uploading");
        } else if (result.affectedRows > 0) {
          return successfun(fileid); 
        } else {
          return successfun("error while uploading");
        }
      });
    } catch (error) {
      return successfun("error while uploading");
    }
}


function replacefile(req,res,orgid,fileid,successfun){
    if(req.session.filename == undefined || req.session.filename == 'undefined')
    {
        return successfun("error");
    }    
    let fileExtension = req.session.filename.split(".").pop()
    const file = "./userdata/tempfiles/"+req.session.userid+"."+fileExtension
    if (fs.existsSync(file)){
        var bitmap = fs.readFileSync(file);
        let png = "data:image/"+fileExtension+";base64,"
        var fileurl = Buffer.from(bitmap).toString('base64');
        png = png + fileurl
        if (!file) {
           successfun("Please upload a file.");
        }
        var sql = "update uploadfile set filename='"+req.session.filename+"', file='"+png+"', date=now() where fileid like'"+fileid+"' and orgid like'"+orgid+"'";
        fcon.query(sql,function(err,result){
            //console.log(sql)
            //console.log(result)
            if(err) console.log(err)
            else if(result.affectedRows>0){
                successfun("Updated")
            }else{
                successfun("error")
            }
        })            
    } 
    else{
        successfun("error")
    }
}

function deletefile(req,res,fileid,orgid,successfun){
    if(fileid == null || fileid == undefined || fileid == '' || fileid === 'undefined' || fileid === 'null'){
        successfun("Please send fileid")
    }else{
        var sql ="delete from uploadfile where orgid like'"+orgid+"' and fileid like '"+fileid+"'";
        fcon.query(sql,function(err,result){
            console.log(sql +" file db delet function")
            if(err) {
                console.log(err)
                successfun("err")
            }else if(result.affectedRows>0){
                successfun("file Deleted")
            }else{
                successfun("File Not Existed")
            }
        })
    }
}

app.post("/1/login",up,(req,res)=>{
    if(req.body.action==="loginbutton"){ 
        // console.log("hello")
        var mobileno=req.body.mobileno;
        var password =req.body.password;
        var sql = "select * from usermaster_t.users where mobile like '"+mobileno+"' and password like '"+password+"'"
        //   console.log(sql)
        mcon.query(sql,function(error, results){
        // console.log(sql+"............")     
        st1 = [];
              if (error) {
                console.log(error)
            } else if (results.length > 0) {
                st1.push(results.name)
                //  console.log(st1)
                req.session.userid = results[0].userid;
                //  console.log(req.session.userid +" userid")
                req.session.username = results[0].name;
                req.session.mobileno = results[0].mobileno;
                req.session.password = results[0].password;
                req.session.email = results[0].email;
                req.session.save();
                res.send("yes")
                // console.log(req.session.userid)
                // console.log(req.session.mobileno +"  mobile n")
                // console.log("save")
            }  else {
                 res.send("Invalid username or password.")
             }
        })
    }else if(req.body.action==="saveregister"){
        var username=req.body.username;
        var mobileno=req.body.mobileno;
        var email=req.body.email;
        var password=req.body.password;
        // var compassword=req.body.compassword;
        var userid=uuidv4();
        var sql = "select * from usermaster_t.users where mobile = '"+mobileno+"'";
        var sql1 = "insert into usermaster_t.users(userid,name,password,mobile,email) values('"+userid+"','"+username+"','"+password+"','"+mobileno+"','"+email+"')"
        mcon.query(sql,function(err,result1){
            //   console.log(sql+"register")
            if(err)console.log(err)
            else if(result1.length>0){
                //console.log(res)
                res.send("User Already Exist")
            }
             else{
                mcon.query(sql1,function(err,result){
                    if(err)console.log(err)
                    else if(result.length>0){
                        //  console.log("not")
                        res.send("error")
                    }else{
                        res.send("save")
                         }
                })
            }
        }) 
    }
})
// app.get("/1/menu", (req, res) => {
//     // console.log("here menu page.....")
//     if(!req.session.userid){
//         // confirm.log("asmi")
//         res.redirect("/1/login")
//     }else if(req.session.userid) {
//         username = req.session.username
//         email = req.session.email
//         mobileno = req.session.mobileno
//         console.log(req.session.mobileno + " - req.session.mobileno")
//         // console.log("showing menu for "+username+" "+email+" "+mobileno+"")
//         //mcon.query("select * from modules where is visible like 'yes'")
//         console.log("menu.pug",{user: req.session.userid, username: username,mobileno:mobileno});
//         res.render("menu.pug",{user: req.session.userid, username: username,mobileno:mobileno});
//     }
// });
app.get("/1/menu", (req, res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }
    if(req.session.userid) {
        username = req.session.username
        email = req.session.email
        mobile = req.session.mobile
        // console.log("showing menu for "+username+" "+email+" "+mobile)
        mcon.query("select * from modules where isvisible like 'yes'")
        res.render("menu.pug",{user: req.session.userid, username: username});
    }
});
app.get("/1/Calendareemainpage",function(req, res){
    req.session.destroy();
    res.render("Calendareemainpage.pug")
})
app.post("/1/Calendareemainpage",up,async (req,res)=>{
    // if(!req.session.userid){
    //     res.send("sessionexpired")
    //     //res.redirect("/1/login")
    // }
})

//--------------------------------My New Project------------------------------------

//task register
const ucon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pranalimu$24',
    database: 'user',
    port: 3306
 });

 const fcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'filesdb_t',
    port: 45203
});

const trcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'taskregister_t',
    port: 45203
})
const ncon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'noticeboard_t',
    port: 45203
})
const vcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'videoplayer_t',
    port: 45203
})
const nmcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'mlm_t',
    port: 45203
})
const gymcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'gymmanagement_t',
    port: 45203
})
const dtcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'drawer_t',
    port: 45203
})
const mcon = mysql.createConnection({
    host: '103.235.106.223',
    user: 'caltest',
    password: 'NjUDLN3edH',
    database: 'usermaster_t',
    port: 45203
});
///get speparate lihichi start.js madhe
app.get("/getpictureslogo/:filename", (req, res) => {  
    fname = "./userdata/tempfiles/"+req.session.orgid+"/"+ req.params.filename
   // console.log(fname +"  Addres")
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
});
app.get('/getservicelogo/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    fname = "./userdata/tempfiles/"+ req.params.filename
    //console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
 });
 app.get('/gettaskreg/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    fname = "./userdata/taskreglogo/"+req.session.orgid+"/"+ req.params.filename
    //console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
 });
 app.get('/gettaskregister/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    // fname = "./userdata/taskregisterdb/"+req.session.orgid+"/"+req.params.filename
    // //console.log(fname)
    // if (fs.existsSync(fname)){
    //    var readStream = fs.createReadStream(fname);
    //     // We replaced all the event handlers with a simpleh call to readStream.pipe()
    //     readStream.pipe(res); 
    // }

    var x=req.params.filename;
    var x2= x.split(".");
    var path="";
    var fileid = x2[0];
    retrivefile1(req, res, fileid, path, req.session.orgid, (successfun) => {
        if (!successfun) {
            res.send('File not found');
            return;
        }   
        var x1=successfun[0];
        var x3= x1.split(".");
        var fileidm = x3[1];
        // console.log(fileidm + " fileid x2----")
        const base64 = successfun[1].split(';base64,').pop();
        const base641 = Buffer.from(base64, 'base64');
        if(fileidm=='jpeg' || fileidm === 'jpg'){
        res.setHeader('Content-Type', 'image/jpeg');
        // console.log(" - img ****")
        }else{
            
            res.setHeader('Content-Type', 'application/pdf'); 
            // console.log(" - pdf ****")
        }
        res.setHeader('Content-Length', base641.length);

        res.end(base641);
    });
 });
app.get('/getvideoplayer/:filename', (req, res) => {
    fname = "./userdata/videoplay/"+req.session.orgid+"/"+req.params.filename
    //console.log(fname +"  fname")
    if (fs.existsSync(fname)){
        var readStream = fs.createReadStream(fname);
        readStream.pipe(res);
    } else {
        res.status(404).send("File not found");
    }
});
app.get('/getmlmlogo/:filename', (req, res) => {
    fname = "./userdata/mlmlogo/"+req.session.orgid+"/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        readStream.pipe(res); 
    }
 });
 app.get('/getgymlogo/:filename', (req, res) => {
    fname = "./userdata/gymlogo/"+req.session.orgid+"/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
       readStream.pipe(res); 
    }
 });

 app.get('/getmlmprofilepic/:filename', (req, res) => {
    fname = "./userdata/mlmprofilepic/"+req.session.orgid+"/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
       readStream.pipe(res); 
    }
 });

 app.get('/getnoticelogo/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    fname = "./userdata/noticeboardlogo/"+req.session.orgid+"/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
 });
 app.get('/getnoticefiles/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    // fname = "./userdata/noticeboardfiles/"+req.session.orgid+"/"+req.params.filename
    //console.log(fname)
    // if (fs.existsSync(fname)){
    //    var readStream = fs.createReadStream(fname);
    //     // We replaced all the event handlers with a simpleh call to readStream.pipe()
    //     readStream.pipe(res); 
    // }

    var x=req.params.filename;
    var x2= x.split(".");
    var path="";
    var fileid = x2[0];
    retrivefile1(req, res, fileid, path, req.session.orgid, (successfun) => {
        if (!successfun) {
            res.send('File not found');
            return;
        }   
        var x1=successfun[0];
        var x3= x1.split(".");
        var fileidm = x3[1];
        // console.log(fileidm + " fileid x2----")
        const base64 = successfun[1].split(';base64,').pop();
        const base641 = Buffer.from(base64, 'base64');
        if(fileidm=='jpeg' || fileidm === 'jpg'){
        res.setHeader('Content-Type', 'image/jpeg');
        // console.log(" - img ****")
        }else{
            
            res.setHeader('Content-Type', 'application/pdf'); 
            // console.log(" - pdf ****")
        }
        res.setHeader('Content-Length', base641.length);

        res.end(base641);
    });
 });
 app.get('/getnoticefilesQR/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    //fname = "./userdata/noticeboardfilesQR/"+req.params.filename
    //console.log(fname)
    // if (fs.existsSync(fname)){
    //    var readStream = fs.createReadStream(fname);
    //     // We replaced all the event handlers with a simpleh call to readStream.pipe()
    //     readStream.pipe(res); 
    // }

    var x=req.params.filename;
    const orgid = req.query.orgid;
    console.log(orgid + " QR orgid")
    var x2= x.split(".");
    var path="";
    var fileid = x2[0];
    retrivefile1(req, res, fileid, path, orgid, (successfun) => {
        if (!successfun) {
            res.send('File not found');
            return;
        }   
        var x1=successfun[0];
        var x3= x1.split(".");
        var fileidm = x3[1];
        // console.log(fileidm + " fileid x2----")
        const base64 = successfun[1].split(';base64,').pop();
        const base641 = Buffer.from(base64, 'base64');
        if(fileidm=='jpeg' || fileidm === 'jpg'){
        res.setHeader('Content-Type', 'image/jpeg');
        // console.log(" - img ****")
        }else{
            
            res.setHeader('Content-Type', 'application/pdf'); 
            // console.log(" - pdf ****")
        }
        res.setHeader('Content-Length', base641.length);

        res.end(base641);
    });

 });
//noticeboard QRCode get
 
app.get('/getnoticeboardqrcode/:filename', (req, res) => {
    fname = "./userdata/noticeboard/QRCode/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
     }  
});

//gym upload file 
app.get('/getgymprofilepic/:filename', (req, res) => {
    // filename="9841827e-f5c6-4343-bf4b-b1c024ae496206a8e5c4-802e-454e-8c0b-2f5a4ae3cd1a.pdf"
    fname = "./userdata/gymprofilepic/"+req.session.orgid+"/"+ req.params.filename
    //console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res); 
    }
 });
//drawer
app.get('/getdrawerfile/:filename', (req, res) => {
    var x=req.params.filename;
    console.log("x" + x)
    var x2= x.split(".");
    var path="";
    var fileid = x2[0];
    retrivefile1(req, res, fileid, path, req.session.orgid, (successfun) => {
        if (!successfun) {
            res.send('File not found');
            return;
        }   
        var x1=successfun[0];
        var x3= x1.split(".");
        var fileidm = x3[1];
        console.log(fileidm + " fileid x2----")
        const base64 = successfun[1].split(';base64,').pop();
        const base641 = Buffer.from(base64, 'base64');
        //if(fileidm=='jpeg' || fileidm === 'jpg'){
        // res.setHeader('Content-Type', 'image/jpeg');
        // // console.log(" - img ****")
        // }else{ 
            
        //     res.setHeader('Content-Type', 'application/pdf'); 
        //     // console.log(" - pdf ****")
        // }
        // var fullFileName = successfun[0];
        // var fileContent = Buffer.from(successfun[1], 'base64');
        var fileExtension = x1.split('.').pop().toLowerCase();
        let contentType;
                switch (fileExtension) {
                    case 'jpeg':
                    case 'jpg':
                contentType = 'image/jpeg';
                break;
                case 'png':
                    contentType = 'image/png';
                    break;
                case 'pdf':
                    contentType = 'application/pdf';
                    break;
                case 'txt':
                    console.log('txt file ')
                    contentType = 'text/plain';
                    break; 
                case 'xls':
                    contentType = 'application/vnd.ms-excel';
                    break; 
                case 'xlsx':
                    console.log("xlsx")
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'doc':
                    contentType = 'application/msword';
                    break;
                case 'docx':
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
                case 'zip':
                    contentType = 'application/zip';
                    break;
                case 'gz':
                    contentType = 'application/gzip';
                    break;        
                default:
                    res.send('Unsupported file type');
                    return;      
            }  
        res.setHeader('Content-Type', contentType);      
        res.setHeader('Content-Length', base641.length);
        // res.send(filedata);
        res.end(base641);
    });
 });

 app.get('/getuserfiles/:filename', (req, res) => {
    fname = "./userdata/drawerusersfiles/"+req.session.userid+"/"+ req.params.filename
    console.log(fname)
    if (fs.existsSync(fname)){
       var readStream = fs.createReadStream(fname);
       readStream.pipe(res); 
    }
 });

 // size null then use this

//  function gettotalsize2(subid, orgid, successfun) {
//     let sql = "SELECT orgid, sum(LENGTH(file)) / 1024 / 1024 as 'Size' FROM uploadfile WHERE orgid = '" + orgid + "';";
    
//     fcon.query(sql, function(err, result) {
//         if (err) {
//             console.log(err);
//         } else {
//             // Check if result[0] exists and has a Size property
//             let filesize = (result[0] && result[0].Size !== null && result[0].Size !== undefined) ? parseFloat(result[0].Size).toFixed(2) : '0.00';
            
//             console.log(filesize + " filesize");
            
//             var sql1 = "UPDATE subscriptions SET usedquota=" + filesize + " WHERE subscriptionid = '" + subid + "'";
            
//             mcon.query(sql1, function(err, result) {
//                 console.log(sql1 + "   mcon update ");
//                 if (err) {
//                     console.log(err);
//                 } else if (result.affectedRows > 0) {
//                     successfun("Successful");
//                 } else {
//                     successfun("Failed");
//                 }
//             });
//         }
//     });
// }

 function gettotalsize2(subid,orgid,successfun){
    let sql ="SELECT orgid, sum(LENGTH(file)) / 1024 / 1024 as 'Size' FROM uploadfile where orgid = '"+orgid+"';"
    fcon.query(sql,function(err,result){
        // console.log(sql +"  gettotalsizee2")
        if(err) console.log(err)
        else{
            let filesize= parseFloat(result[0].Size).toFixed(2);
            // console.log(filesize +" filesize")
            var sql1 ="update subscriptions set usedquota="+filesize+" where subscriptionid like'"+subid+"'";
            mcon.query(sql1, function(err,result){
                console.log(sql1 +"   mcon update ")
                if(err) console.log(err)
                else if(result.affectedRows>0){
                    successfun("Successful")                  
                }else{
                    successfun("Failed")
                }
            })
        }
    })
}
// task register get
app.get("/1/taskregister",async(req, res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }else{
            var admin = 0;
            var started = 0;
            var contributor = 0;
            var projectmanager = 0;
            var readonly = 0;
            var substatus = 0;
            var orgcolor="";
            var sqla="select * from usermaster_t.subscriptions where userid='"+req.session.userid+"' and moduleid='19'";
            // console.log("sqla     "+sqla)
            mcon.query(sqla,(err,result)=>{
            if(err) console.log(err)
                else if(result.length>0){
                    admin = 1;
                    req.session.admin = admin
                    req.session.subid = result[0].subscriptionid;
                    console.log( req.session.subid  +"- req.session.subid ")
                }else{
                    admin= 0;
                }
                    var sql="select * from taskregister_t.orginfo where subscriptionid='"+req.session.subid+"' ";
                   // console.log("sql......."+sql)
                    trcon.query(sql, (err, result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        //console.log("one")
                        started = 1;                     
                        req.session.orgid = result[0].orgid;
                        console.log(req.session.orgid  )
                    } else {
                        started = 0;
                       // console.log("two")
                    }
                        var sql1="select taskregister_t.orgusers.orgid,taskregister_t.orginfo.orgname from taskregister_t.orgusers join taskregister_t.orginfo on taskregister_t.orgusers.orgid = taskregister_t.orginfo.orgid where taskregister_t.orgusers.userid ='"+req.session.userid+"' and position = 'Contributor'";
                        //console.log(sql1)
                        trcon.query(sql1, (err, result)=>{
                        if(err) console.log(err)
                        else if (result.length>0) {
                            //  console.log("one")
                            contributor = 1;
                            req.session.contributor = contributor;                     
                            req.session.orgid = result[0].orgid;
                            req.session.subid = result[0].subid;
                            req.session.orgname = result[0].orgname;
                            //  console.log(req.session.contributor + "contributor")
                        } else {
                            contributor = 0;
                            //   console.log("two")
                        }
                            var sql2="select taskregister_t.orgusers.orgid,taskregister_t.orginfo.orgname from taskregister_t.orgusers join taskregister_t.orginfo on taskregister_t.orgusers.orgid = taskregister_t.orginfo.orgid where taskregister_t.orgusers.userid ='"+req.session.userid+"' and position = 'Project Manager'";
                            //  console.log(sql2)
                            trcon.query(sql2, (err,result)=>{
                            if(err) console.log(err)
                            else if (result.length>0) {
                                console.log("one")
                                projectmanager = 1;
                                req.session.projectmanager = projectmanager;                     
                                req.session.orgid = result[0].orgid;
                                req.session.orgname = result[0].orgname;
                                //  console.log(req.session.projectmanager + "projectm")
                            } else {
                                projectmanager = 0;
                                // console.log("two")
                            }
                                var sql3="select taskregister_t.orgusers.orgid,taskregister_t.orginfo.orgname from taskregister_t.orgusers join taskregister_t.orginfo on taskregister_t.orgusers.orgid = taskregister_t.orginfo.orgid where taskregister_t.orgusers.userid ='"+req.session.userid+"' and position = 'Read Only'";
                                //console.log(sql3)
                                trcon.query(sql3, (err,result)=>{
                                if(err) console.log(err)
                                else if (result.length>0) {
                                    readonly = 1;
                                    req.session.readonly = readonly;                     
                                    req.session.orgid = result[0].orgid;
                                    req.session.orgname = result[0].orgname;
                                      console.log(req.session.readonly + "readonly")
                                } else {
                                    readonly = 0;
                                }
                                    mcon.query("select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in(select orginfo.subscriptionid from taskregister_t.orginfo where orgid like '"+req.session.orgid+"')",function(err,result){
                                    if(err)console.log(err)
                                    else if(result.length>0){
                                        var enddate = result[0].enddate
                                        let date1 = new Date()
                                        const diffTime = enddate.getTime() - date1.getTime();
                                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                        if(diffDays>0){
                                                substatus = 1;
                                        }else{
                                                substatus = 0;    
                                        } 
                                    }
                                    var sql="select * from taskregister_t.orginfo where orgid='"+req.session.orgid+"' ";
                                    console.log("sql......."+sql)
                                    trcon.query(sql, (err, result)=>{
                                        if(err) console.log(err)
                                        else if (result.length>0) {
                                            //console.log("one")
                                            req.session.orgcolor = result[0].csscolor;                   
                                            orgcolor=req.session.orgcolor;
                                            if(orgcolor == 'undefined' || orgcolor == null || orgcolor == 'null' || orgcolor == undefined || orgcolor == 'NaN-aN-aN'){
                                                orgcolor='style'
                                            }
                                            //console.log(req.session.orgid +"orgid")
                                        } else {
                                            orgcolor = 0;
                                            //console.log("two")
                                        }        
                                        res.render("taskregister.pug",{userid: req.session.userid,username: req.session.username,admin:admin,started:started,projectmanager:projectmanager,contributor:contributor,readonly:readonly,substatus:substatus,orgcolor:orgcolor});
                                        console.log("taskregister.pug",{userid:req.session.userid,username: req.session.username,admin:admin,started:started,projectmanager:projectmanager,contributor:contributor,readonly:readonly,substatus:substatus,orgcolor:orgcolor});
                                    })
                                    
                                })            
                        })
                    })
                })
            })
        })
    }
});

app.post("/1/taskregister",up,async (req,res)=>{
    if(!req.session.userid){
        res.send("sessionexpired")
        //res.redirect("/1/login")
    }
    else if(req.body.action==="subscribe"){
        var startdate = new Date();
        var subscribeidnew = uuidv4();
        var currentdate = startdate.getFullYear()+'-'+("0" + (startdate.getMonth() + 1)).slice(-2)+'-'+("0" + startdate.getDate()).slice(-2) +" "+startdate.getHours()+':'+startdate.getMinutes()+':'+startdate.getSeconds();
        var days =3;
        let newDate = new Date(Date.now()+days*24*60*60*1000);
        let ndate = ("0" + newDate.getDate()).slice(-2);
        let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
        let nyear = newDate.getFullYear();   
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        let seconds = newDate.getSeconds();       
        let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds 
        mcon.query("select * from subscriptions where userid='"+req.session.userid+"' and moduleid=19", function(err, result){
            if(err) console.log(err);
            else if(result.length > 0){
                res.send("used")
            }else{
                var sql2 = "insert into subscriptions(userid, subscriptionid, moduleid, startdate, enddate,isprimary ) values('"+req.session.userid+"','"+subscribeidnew+"',19,'"+currentdate+"','"+nextdate+"','yes')"
                    mcon.query(sql2, function(err, data){
                    if (err) throw err;
                    res.send("Saved")
                    });   
                }
            })
        }
    else if(req.body.action==="saveorginfo"){
        var orgid = uuidv4();
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var orgaddress = req.body.orgaddress
        var orgaddress2 = req.body.orgaddress2
        var orgcity = req.body.orgcity
        var orgstate = req.body.orgstate
        var orgemail = req.body.orgemail
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        var sql = "insert into orginfo (subscriptionid, orgid,orgname, phoneno,address1,address2,city,state,email,modifiedby,modifieddate,cardstatus) values('"+req.session.subid+"','"+orgid+"','"+nameorg+"', '"+phoneno+"','"+orgaddress+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"','"+req.session.userid+"','"+currentdate+"','Active')"
        trcon.query(sql,function(err,result1){
            // console.log(sql    +"  000")
            if(err)console.log(err)
                else if (result1.affectedrows>0)
                {
                    res.send("Information saved successfully")
                }else{
                    res.send("Information saved successfully")
                }   
        })
    }
    else if(req.body.action==="retriveorginfo"){
        var sql="select * from orginfo where subscriptionid='"+req.session.subid+"'";
      
        trcon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].orgname)
                arr.push(result[0].phoneno)
                arr.push(result[0].address1)
                arr.push(result[0].address2)
                arr.push(result[0].city)
                arr.push(result[0].state)
                arr.push(result[0].email)
                res.send(arr)
            }else{
                console.log("error")
            }
        })
    }
    else if(req.body.action==="updateorg"){
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var uaddress = req.body.uaddress
        var uaddress2 = req.body.uaddress2
        var ucity = req.body.ucity
        var ustate = req.body.ustate
        var uemail = req.body.uemail
        var sql = "update orginfo set orgname='"+nameorg+"',phoneno='"+phoneno+"',address1='"+uaddress+"',address2='"+uaddress2+"',city='"+ucity+"',state='"+ustate+"',email='"+uemail+"'  where subscriptionid='"+req.session.subid+"'";
        trcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("error")
            }
        })
    }

    else if(req.body.action==="orgcolortaskregister"){
        var csscolor = req.body.csscolor
        var sql = "update taskregister_t.orginfo set csscolor='"+csscolor+"'  where subscriptionid='"+req.session.subid+"'";
        trcon.query(sql,function(err,result){
        //    console.log(sql  +  ">>>>")
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("orginfo error")
            }
        })
    }
    // else if(req.body.action==="retrivorgcolortr"){
    //     var sql="select * from taskregister_t.orginfo where orgid='"+req.session.orgid+"';"
    //         trcon.query(sql,function (err,result){
    //         // console.log(sql)
    //         if(err)console.log(err)
    //             else if(result.length>0){
    //                 var arr=[];
    //                 arr.push(result[0].csscolor)
    //             res.send(arr)
    //         }else{
    //             res.send(" ")
    //         }
    //     })
    // }
    else if (req.body.action === "savedialogbox") {
        var projectname = req.body.projectname;
        var projectdescription = req.body.projectdescription;
        var checkExistenceQuery = "SELECT COUNT(*) AS count FROM projects WHERE orgid='"+req.session.orgid+"' and projectname = '" + projectname + "'";
        trcon.query(checkExistenceQuery, function (checkErr, checkResult) {
            console.log(checkExistenceQuery +" -  checkExistenceQuery")
            if (checkErr) {
               
                res.send("error");
            } else {
                var projectCount = checkResult[0].count;
    
                if (projectCount > 0) {
                    res.send("Project name already exists. Please choose a different name.");
                } else {
                    var projectid = uuidv4();
                    var insertQuery = "INSERT INTO projects (orgid, projectid, projectname, projectdescription) VALUES('" + req.session.orgid + "','" + projectid + "','" + projectname + "', '" + projectdescription + "')";
                    trcon.query(insertQuery, function (insertErr, insertResult) {
                        console.log(insertQuery +"- insertQuery")
                        if (insertErr) {
                         
                            res.send("error");
                        } else if (insertResult.affectedRows > 0) {
                            res.send("Information saved successfully")
                        } else {
                            res.send("something went wrong please try after sometime.....");
                        }
                    });
                }
            }
        });
    
    }
    else if (req.body.action === 'retriveprojectname') {
        var sql;

        if (req.session.admin) {
            // Admin query
            sql = "SELECT * FROM projects WHERE orgid = '" + req.session.orgid + "'";
        } else {
            // Regular user query
            var sql = "SELECT p.projectname, p.projectid FROM projects p JOIN orgusers o ON p.projectid = o.projectid WHERE o.orgid = '" + req.session.orgid + "' AND o.userid = '" +req.session.userid+ "'";

        }
        trcon.query(sql, function(err, result) {
            console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"projectname":"' + result[i].projectname + '","projectid":"' + result[i].projectid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if (req.body.action === "saveaddtask") {
        var addtaskname = req.body.addtaskname;
        var addtaskdescription = req.body.addtaskdescription;
        var startdate = req.body.startdate;
        var enddate = req.body.enddate;
        var addtaskstatus = req.body.addtaskstatus;
        var projectid = req.body.projectid;
        if (!addtaskname || !addtaskdescription || !startdate || !enddate || !addtaskstatus || addtaskstatus === 'Status') {
            var missingField;
            if (!addtaskname) missingField = "Task Name";
            else if (!addtaskdescription) missingField = "Description";
            else if (!startdate) missingField = "Start Date";
            else if (!enddate) missingField = "Finish Date";
            else if (!addtaskstatus) missingField = "Status";
            else if (addtaskstatus) missingField = "Status";
            res.send("Please fill the " + missingField + " field.");
            return; 
        }else {
            var taskid = uuidv4();
            var sql = "INSERT INTO tasks (orgid, projectid, taskid, taskname, taskdescription, startdate, enddate, taskstatus) VALUES ('" + req.session.orgid + "','" + projectid + "','" + taskid + "','" + addtaskname + "','" + addtaskdescription + "','" + startdate + "','" + enddate + "','" + addtaskstatus + "') ";
            trcon.query(sql, function (err, result) {
                if (err) console.log(err);
                else if (result.affectedRows > 0) {
                    res.send("Information saved successfully");
                } else {
                    res.send("Insert failed");
                }
            });
        }
    }  
    else if(req.body.action==="showproject"){
        var projectid = req.body.projectid
        var tbltext = ""
        // var sql="select * from taskregister_t.tasks where projectid='"+projectid+"' and parenttaskid is null";
        var sql ="select * from taskregister_t.tasks where projectid='"+projectid+"' and parenttaskid is null  ;"
        trcon.query(sql,async function (err,result){
            if(err)console.log(err)
            else if(result.length>0){ 
                var arr=[];
                var theader = "<table id='report'style='width: 100%; cursor: default; height: 100%;'><tr ><th style='width:50%; cursor: default;' vertical-align='top'>Task Name</th><th vertical-align='top' style='width:20px; cursor: default;'>Start</th><th vertical-align='top' style='width:20px; cursor: default;'>Finish</th><th vertical-align='top' style='width:0px; cursor: default;'>Status</th></tr>"
                var ttext = ""
                for(var i=0;i<result.length;i++){
                        var startdate = new Date(result[i].startdate);
                        var startdate1 = startdate.getDate() + '-' + ('0' + (startdate.getMonth() + 1)).slice(-2) + '-' + ('0' + startdate.getFullYear()).slice(-2)+" "+startdate.getHours()+":"+startdate.getMinutes();
                        if(startdate1 == 'undefined' || startdate1 == null || startdate1 == 'null' || startdate1 == undefined || startdate1 == 'NaN-aN-aN'){
                            startdate1=''
                        }
                        var enddate = new Date(result[i].enddate);
                        var enddate1 = enddate.getDate() + '-' + ('0' + (enddate.getMonth() + 1)).slice(-2) + '-' + ('0' + enddate.getFullYear()).slice(-2)+" "+enddate.getHours()+":"+enddate.getMinutes();
                        if(enddate1 == 'undefined' || enddate1 == null || enddate1 == 'null' || enddate1 == undefined || enddate1 == 'NaN-aN-aN'){
                            enddate1=''
                        }
                        var taskname = result[i].taskname;
                        if(taskname == 'undefined' || taskname == undefined || taskname == 'null' || taskname == null){
                            taskname = ''
                        }
                        var taskstatus = result[i].taskstatus;
                        if(taskstatus == 'undefined' || taskstatus == undefined || taskname == 'null' || taskname == null){
                            taskname = ''
                        }
                        var orgstatus = result[i].orgstatus;
                        if(orgstatus == 'undefined' || orgstatus == undefined || orgstatus == 'null' || orgstatus == null){
                            orgstatus = ''
                        }
                        var taskid = result[i].taskid
                        var status= "  ( " + orgstatus + " )";
                        if(status == 'undefined' || status == undefined || status == 'null' || status == null){
                            status = ''
                        }
                        var currentDate = new Date(); 
                        if ((startdate < currentDate && !["Started", "In Progress", "On Hold", "Cancelled", "Completed"].includes(result[i].orgstatus)) ){
                            tbltext=tbltext+"<tr style='background-color:#fcd4cf;'><td style='text-align: left;'  id='tasknametd' onclick=calllog('"+taskid+"');setTaskId('"+taskid +"');>"+taskname+"</td><td style='font-size: 11px; width:20px; cursor: default;'>"+startdate1+"</td><td style='font-size: 11px; width:20px; cursor: default;'>"+enddate1+"</td><td style='cursor:default; font-size: 13px; '>"+taskstatus+"</td></tr>" 
                        }else if (enddate < currentDate ) {
                            tbltext = tbltext + "<tr style='background-color: #fcd4cf;'><td style='text-align: left;' id='tasknametd' onclick=calllog('" + taskid + "');setTaskId('" + taskid + "');>" + taskname + "</td><td style='font-size: 11px; cursor: default;  width:20px;'>" + startdate1 + "</td><td style='font-size: 11px; cursor: default;  width:20px;'>" + enddate1 + "</td><td style='cursor:default; font-size: 13px; '>" + taskstatus + status + "</td></tr>";
                        }else
                            tbltext=tbltext+"<tr><td style='text-align: left;' id='tasknametd' onclick=calllog('"+taskid+"');setTaskId('"+taskid +"');>"+taskname+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+startdate1+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+enddate1+"</td><td style='cursor:default; font-size: 13px; '>"+taskstatus+status+"</td></tr>" 
                        
                            var tbl1 = await getchildtask(tbltext,taskid,req.session.admin,req.session.projectmanager,req.session.contributor,"&nbsp;&nbsp;&nbsp;&nbsp;");
                            tbltext=tbl1       
                    }
                    tbltext=theader+tbltext+"</table>"
                   
                    res.send(tbltext)
                }else{
                    res.send("No Task")
                }
        })
    }
    else if (req.body.action === "showkanbanboard") {
    var projectid = req.body.projectid;
    var sql="SELECT a.statusname,b.taskid, b.projectid, a.orgid, COUNT(b.orgid) AS count, IFNULL(b.taskname, '') AS Taskname FROM taskstatus a LEFT OUTER JOIN tasks b ON a.statusname = b.taskstatus and a.orgid=b.orgid and projectid='"+projectid+"' where a.orgid = '"+req.session.orgid+"' GROUP BY a.statusname, b.taskname,b.taskid, b.projectid ORDER BY a.statusname DESC;"
   console.log(sql + " - kanban sql")
    trcon.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else if (result.length > 0) {
            var tbltext = "<table  class='kntb'><tr>"
            var ttask = ""
            var firstt = 0
            for (var i = 0; i < result.length; i++) {
                var taskname = result[i].Taskname;
                var taskid =result[i].taskid;
                var taskstatus = result[i].statusname;
                // var colorarr=['#b3d9ff','#ffb3b3','#c1d1f0','#ccccff','#b3daff','#e6e600','#f2ccff','#ccffcc','#ffccff','#d9d9d9','#cceeff','#ff9999','#adebad','#c2c2a3','#b3ffb3'];
                 var colorarr=['#a2cdf9','#f69b9b','#b0c9fb','#f388d5','#9fd0fe','#e6e600','#e19ff7','#aaf9aa','#7d7773','#4d8146','#48acdf','#ea2626','#adebad','#f6f6ab','#92f692'];
                var colorvalue = Math.floor(Math.random() * 15);
                var rotationvalue = Math.floor(Math.random() * 41) - 20;
                if (taskstatus != ttask) {
                    if(firstt == 0){
                        firstt=1
                        tbltext = tbltext + "<td><table style='height: 100%; border-bottom: #000; margin-top: 0%; background-color:#bee4ef;'><tr style='height: 100%; '><th  style='width: 50px;margin-top: 0%; padding-top: 0%; vertical-align: top; background-color:#bee4ef; font-size: 14px; color: rgb(3, 102, 135);' >" + taskstatus + "</th></tr>";
                    }else{
                        tbltext = tbltext + "</table></td><td><table style='height: 100%; border-bottom: #000; margin-top: 0%; background-color:#bee4ef;'><tr style='height: 100%; vertical-align: top; background-color:#bee4ef; font-size: 14px; '><th style='width: 50px; color: rgb(3, 102, 135);'>" + taskstatus + "</th></tr>";
                    }
                    //console.log("result[i].taskid"+result[i].taskid)
                } else {
                    //  tbltext = tbltext + "<tr><td button onclick=calllog('"+taskid+"');setTaskId('"+taskid+"'); class='kanbantd' style='transform: rotate(" + rotationvalue + "deg); transition: transform 0.5s ease; background-color:"+colorarr[colorvalue]+"; margin-bottom: 10%; padding-bottom: 10%;height:50px;width:60px;'>" + taskname + "</td></tr>";
                }
                if(taskname != "")
                tbltext = tbltext + "<tr><td  button onclick=calllog('"+taskid+"');setTaskId('"+taskid+"'); class='kanbantd' style='transform: rotate(" + rotationvalue + "deg); transition: transform 0.5s ease; background-color:"+colorarr[colorvalue]+"; margin-bottom: 10%; padding-bottom: 10%;width:50px;height:60px;'>" + taskname + "</td></tr>";
                ttask = taskstatus;
            }    
            tbltext = tbltext + "</table></td></tr></table>";
           
            res.send(tbltext);
            }else{
                res.send("No Task")
            }
        });
    }
    else if(req.body.action==="calllog"){
        var taskid=req.body.taskid; 
        var logid=uuidv4();
        var cdate=new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
        var sql = "SELECT * FROM tasklog where orgid='"+req.session.orgid+"' and taskid='"+taskid+"' ORDER BY createddate DESC LIMIT 7;";
        trcon.query(sql,function(err,result1){
            if(err) console.log(err)
            else{
                res.send("Log Show")
            }    
        })
    }       
    else if(req.body.action === 'updateinfo'){
        var taskid = req.body.taskid;
        var addtaskname = req.body.addtaskname;
        var taskstatus = req.body.taskstatus;
        var status = req.body.status;
        var projectid = req.body.projectid;
        var cdate = new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + ('0' + cdate.getSeconds()).slice(-2);
        var addtaskdescription = req.body.addtaskdescription;
        // Update task information
        var updateTaskQuery = "UPDATE tasks SET taskname='" + addtaskname + "', taskdescription='" + addtaskdescription + "' ,orgstatus='"+status+"'  WHERE taskid='" + taskid + "'";
        trcon.query(updateTaskQuery, function (err, result) {
            //console.log(updateTaskQuery + " - Update task ");
            if (err) {
                console.log(err);
            } else {
                // Fetch previous status
                var checkPrevStatusQuery = "SELECT orgstatus FROM orgstatuses WHERE taskid = '" + taskid + "'  ORDER BY currentdate DESC LIMIT 1;";
                trcon.query(checkPrevStatusQuery, function (err, prevStatusResult) {
                    if (err) console.log(err);
                    else {
                        var prevStatus = prevStatusResult.length > 0 ? prevStatusResult[0].orgstatus : '';
                        // Fetch additional information
                        var sql1 = "SELECT * FROM taskregister_t.tasks WHERE taskid='" + taskid + "'";
                        trcon.query(sql1, function (err, result1) {
                            //console.log(sql1);
                            if (err) console.log(err);
                            else if (result1.length > 0) {
                                var startdate = result1[0].startdate.toISOString().replace('T', ' ').slice(0, 19);
                                var enddate = result1[0].enddate.toISOString().replace('T', ' ').slice(0, 19);
                                var sql2 = "INSERT INTO orgstatuses (orgid, projectid, taskid, taskname, currentdate, userid, starteddate, enddate, taskstatus, orgstatus) VALUES ('" + req.session.orgid + "','" + projectid + "','" + taskid + "','" + addtaskname + "','" + cdate + "','" + req.session.userid + "','" + startdate + "','" + enddate + "','" + taskstatus + "','" + status + "')";
                                trcon.query(sql2, function (err, result2) {
                                // console.log(sql2 + " - Insert into orgstatuses ");
                                    if (err) console.log(err);
                                    else {
                                        var statusdescription = "Status  "+prevStatus + " Change To " + status;
                                        var orglogid = uuidv4();
                                        var sql3 = "INSERT INTO orglog (orgid, projectid, taskid, orglogid, logdescription, createddate, userid, username) VALUES ('" + req.session.orgid + "','" + projectid + "','" + taskid + "','" + orglogid + "','" + statusdescription + "','" + cdate + "','" + req.session.userid + "','" + req.session.username + "')";
                                        trcon.query(sql3, function (err, result3) {
                                        // console.log(sql3 + " - Insert into orglog ");
                                            if (err) console.log(err);
                                            else {
                                                res.send("updated successfully");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else if(req.body.action==="retrivorgstatus"){
        var taskid=req.body.taskid;
        var sql="select * from orgstatuses where taskid='"+taskid+"' ORDER BY currentdate DESC LIMIT 1;"
            trcon.query(sql,function (err,result){
            // console.log(sql)
            if(err)console.log(err)
                else if(result.length>0){
                    var arr=[];
                    arr.push(result[0].orgstatus)
                res.send(arr)
            }else{
                res.send(" ")
            }
        })
    }
    else if (req.body.action === 'retrivebgstylecolortr') {
        var sql = "select * from usermaster_t.bgstyle ";
        mcon.query(sql, function(err, result) {
            console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"name":"' + result[i].name + '","filename":"' + result[i].filename + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action === 'updatelogadd'){
        var taskid=req.body.taskid;
        var logid=uuidv4();
        var cdate=new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
        var sql = "insert into tasklog(taskid,logid,logtype,logtext,createddate,userid,username,orgid) values('"+taskid+"','"+logid+"','text','task updated','"+cdate+"','"+req.session.userid+"','"+req.session.username+"','"+req.session.orgid+"')";
        trcon.query(sql,function(err,result){
            console.log(sql)
                if(err) console.log(err)
                else{
                    res.send("Update")
                }    
        })
    } 
    else if(req.body.action==="retriveupdatetask"){
        var taskid=req.body.taskid;
          var sql="select * from tasks where taskid='"+taskid+"';"
        trcon.query(sql,function (err,result){
            
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].taskname)
                arr.push(result[0].taskdescription)
                arr.push(result[0].taskstatus)
                res.send(arr)
            }else{
                console.log("Retrive Update error")
            }
        })
    }
    else if (req.body.action === "saveaddtaski") {
        var addtaskname = req.body.addtaskname;
        var addtaskdescription = req.body.addtaskdescription;
        var startdate = req.body.startdate;
        var enddate = req.body.enddate;
        var addtaskstatus = req.body.addtaskstatus;
        var projectid = req.body.projectid;
        var parenttaskid = req.body.parenttaskid;
        var taskid = uuidv4();
        // Check if any field is blank
        if (!addtaskname || !addtaskdescription || !startdate || !enddate || !addtaskstatus || addtaskstatus === 'Status' || addtaskstatus==='null') {
            var missingField;
            if (!addtaskname) missingField = "Task Name";
            else if (!addtaskdescription) missingField = "Description";
            else if (!startdate) missingField = "Start Date";
            else if (!enddate) missingField = "Finish Date";
            else if (!addtaskstatus) missingField = "Status";
            else if (addtaskstatus) missingField = "Status";
        

            res.send("Please fill the " + missingField + " field.");
            } else {
            // All fields are filled, proceed with insertion
            var sql = "insert into tasks (orgid,projectid, taskid, taskname, taskdescription,parenttaskid, startdate, enddate, taskstatus) values('" + req.session.orgid + "','" + projectid + "','" + taskid + "','" + addtaskname + "','" + addtaskdescription + "','" + parenttaskid + "','" + startdate + "','" + enddate + "','" + addtaskstatus + "')";
                trcon.query(sql, function (err, result) {
                    if (err) console.log(err);
                    else if (result.affectedRows > 0) {
                        var logid=uuidv4();
                        var cdate=new Date();
                        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
                        var sql = "insert into tasklog(taskid,logid,logtype,logtext,createddate,userid,username,orgid) values('"+parenttaskid+"','"+logid+"','text','Inserted Task Log ','"+cdate+"','"+req.session.userid+"','"+req.session.username+"','"+req.session.orgid+"')";
                        trcon.query(sql,function(err,result1){
                            if(err) console.log(err)
                            else{
                                res.send("Data inserted")
                            }    
                        }) 
                    } else {
                        res.send("Insert failed");
                    }
                });
            }
    }       
    else if(req.body.action==="saveloginfo"){
        var addlogtext = req.body.addlogtext
        var addtaskdescription = req.body.addtaskdescription
        var date_ob = new Date();
        var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
        // var fdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) // Formats the date as 'YYYY-MM-DD'
        var taskid = req.body.taskid
        var logid = uuidv4();
            if (!addlogtext) {
                var missingField;
            if (!addlogtext) missingField = "Log Text";
            res.send("Please fill the " + missingField + " field.");
            return; 
            } else {
                var sql = "insert into tasklog (taskid,logid,logtype, logtext, createddate ,userid,username,orgid) values('"+taskid+"','"+logid+"','text','"+addlogtext+"','"+currentdate+"','"+req.session.userid+"','"+req.session.username+"','"+req.session.orgid+"')"
                trcon.query(sql,function(err,result){
                
                    if(err)console.log(err)
                    else if (result.affectedRows>0)
                        {res.send("data insert")}
                    else{
                        res.send("insert")
                    }    
                }) 
            } 
    }
    else if (req.body.action === "savepositioninformation") {
        var projectid = req.body.projectid;
        var addposition = req.body.addposition;
        var username = req.body.username;
        var useremail = req.body.useremail;
        var contactno = req.body.usermobilenumber;

        if (!username || !useremail || !contactno || addposition === 'select' || addposition === 'null' || !addposition) {
            var missingField;

            if (!contactno) missingField = "Mobile number";
            else if (!username) missingField = "User Name";
            else if (!useremail) missingField = "User Email";
            else if (!addposition) missingField = "Position";
            else if (addposition) missingField = "Position";

            res.send("Please fill the " + missingField + " field.");
            return;
        } else {
            mcon.query("SELECT * FROM users WHERE mobile = '" + contactno + "'", function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result.length > 0) {
                    var userid = result[0].userid;
                    var sql4="SELECT * FROM subscriptions WHERE userid='" + userid + "' AND moduleid=19";
                        mcon.query(sql4, function (err, results2) {
                            console.log(sql4 +" - sql4")
                            if (err) {
                                console.log(err);
                            } else if (results2.length > 0) {
                                res.send("User Has Subscription For This Module");
                            } else {
                                var sql5="SELECT * FROM orgusers WHERE orgid='" + req.session.orgid + "' AND userid='"+userid+"' and position='"+addposition+"' and projectid='"+projectid+"'";
                                 trcon.query(sql5, function (err, results2) {
                                console.log(sql5 +" - sql4")
                                if (err) {
                                    console.log(err);
                                } else if (results2.length > 0) {
                                    res.send("User already add this project");
                                } else {
                                var sqlc="SELECT * FROM orgusers WHERE userid='" + userid + "'";
                                trcon.query(sqlc, function (err, result) {
                                    console.log(sqlc +" - sqlc")
                                    if(err){
                                        console.log(err)
                                    }else if(result.length > 0){
                                        var orgid1=result[0].orgid;
                                        console.log(" orgid1 +"  - orgid1)
                                        var orgid2=req.session.orgid;
                                        console.log(" orgid2 +"  - orgid2)
                                        if(orgid1==orgid2){
                                        var sql1 = "SELECT * FROM usermaster_t.users WHERE mobile='" + req.body.usermobilenumber + "'";
                                        mcon.query(sql1, function (err, result1) {
                                            if (err) {
                                                console.log(err);
                                            } else if (result1.length > 0) {
                                                var userid = result1[0].userid;
                                                var userProjectsQuery = "SELECT projectid, position FROM orgusers WHERE  orgid='"+req.session.orgid+"' and userid = '" + userid + "' ";
                                                trcon.query(userProjectsQuery, function (err, userProjectsResult) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        var userAlreadyAdded = false;
                                                        for (var i = 0; i < userProjectsResult.length; i++) {
                                                            var existingProjectId = userProjectsResult[i].projectid;
                                                            var existingPosition = userProjectsResult[i].position;
        
                                                            if (existingProjectId != projectid && existingPosition != addposition) {
                                                                // User is already added to a different project with a different position
                                                                userAlreadyAdded = true;
                                                                break;
                                                            }
                                                        }
                                                        if (userAlreadyAdded) {
                                                            res.send("User already assigned to another project with a different position");
                                                        } else {
                                                            var sql = "INSERT INTO orgusers (orgid,userid, position,name ,email,contactno,projectid) VALUES('" + req.session.orgid + "','" + userid + "','" + addposition + "','" + username + "','" + useremail + "','" + contactno + "','" + projectid + "')";
                                                            trcon.query(sql, function (err, result) {
                                                                //console.log(sql);
                                                                if (err) {
                                                                    console.log(err);
                                                                } else if (result.affectedRows > 0) {
                                                                    res.send("Assign staff");
                                                                } else {
                                                                    res.send("Assign staff");
                                                                }
                                                            });
                                                        }
                                                        }
                                                    });
                                                } else {
                                                    res.send("user is already added with a different position");
                                                }
                                            });
                                        }else{
                                            res.send("User Already exit another Organization")
                                        }
                                }else{
                                    var sql = "INSERT INTO orgusers (orgid,userid, position,name ,email,contactno,projectid) VALUES('" + req.session.orgid + "','" + userid + "','" + addposition + "','" + username + "','" + useremail + "','" + contactno + "','" + projectid + "')";
                                    trcon.query(sql, function (err, result) {
                                        console.log(sql);
                                        if (err) {
                                            console.log(err);
                                        } else if (result.affectedRows > 0) {
                                            res.send("Assign staff");
                                        } else {
                                            res.send("Assign staff");
                                        }
                                    });
                                }
                            });
                            }    
                        })
                        }
                    })
                    // Check if the user is already in orgusers for a different orgid
                // trcon.query("SELECT * FROM orgusers WHERE userid='" + userid + "' AND orgid='" + req.session.orgid + "'", function (err, existingUserResult) {
                //     if (err) {
                //         console.log(err);
                //     } else if (existingUserResult.length > 0) {
                //         res.send("User already exists in another organization");
                //     } else {
                        
                //     }
                // });
            } else {
                res.send("Number is not registered in calendaree.com");
            }
         });
        }
    }
    else if(req.body.action==="showorglog"){
        var taskid = req.body.taskid
        sql ="SELECT * FROM orglog where orgid='"+req.session.orgid+"' and taskid='"+taskid+"' ORDER BY createddate DESC LIMIT 7;"
        trcon.query(sql,function (err,result){
            if(err)console.log(err)
                else if(result.length>0){
                        var arr=[];
                        var tbltext = "<table id='report' style='width: 330px; cursor:default !important ;' ><tr style='cursor:default !important ;'><tr style='display: none;'><th></th><th></th><tr style='display: none;'><th colspan='2'></th></tr>"
                        for(i=0;i<result.length;i++){
                            var username =result[i].username;
                            if(username == 'username' || username == undefined || username == 'null' || username == null){
                                username = ''
                            }
                            var createddate = result[i].createddate;
                            if(createddate == 'undefined' || createddate == null || createddate == 'null' || createddate == undefined || createddate == 'NaN-aN-aN'){
                                createddate=''
                            }else{
                                createddate = createddate.getFullYear()+'-'+("0" + (createddate.getMonth() + 1)).slice(-2)+'-'+("0" + createddate.getDate()).slice(-2) +" "+createddate.getHours()+':'+createddate.getMinutes()+':'+createddate.getSeconds();     
                            }
                            var logdescription = result[i].logdescription;
                            if(logdescription == 'undefined' || logdescription == undefined || logdescription == 'null' || logdescription == null){
                                logdescription = ''
                            }
                            tbltext=tbltext+"<tr style='border:rgb(211, 231, 251); cursor:default !important ; height: 5px;!importent'><td style='width:100px; cursor:default !important ; height: 10px; color: #2f8927; text-align: left;font-family:Calibri ; font-size: 19px; ' >"+username+"</td><td colspan='3' style='width:210px; cursor:default !important ; height: 10px; font-size: 10px; text-align: right; color:#1a1a1a; font-family:Calibri ;'>"+createddate+"</td><tr style='height: 10px; !importent cursor:default !important ;'><td aligin='center' style='width:300px; cursor:default !important ; text-align: left; font-size: 12px; color:#595959; font-family:Calibri ;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+logdescription+"</td><td style='width: 70px; cursor:default;'></td><td style='width: 70px; cursor:default;'></td></tr></tr>"
                            
                        }
                        tbltext=tbltext+"</table>"
                        res.send(tbltext)
                    }else{
                        res.send("No Logs")
                    }
            })    
    }
    else if(req.body.action==="showlog"){
        var taskid = req.body.taskid
        var admin=req.session.admin;
        var contributor=req.session.contributor;
        var projectmanager=req.session.projectmanager;
        var readonly =req.session.readonly
        sql ="SELECT * FROM tasklog where orgid='"+req.session.orgid+"' and taskid='"+taskid+"' ORDER BY createddate DESC LIMIT 7;"
        trcon.query(sql,function (err,result){
        //console.log(sql)
            if(err)console.log(err)
                else if(result.length>0){
                        var arr=[];
                        var tbltext = "<table id='report' style='width: 330px; cursor:default !important ;' >"
                        +"<tr style='cursor:default !important ;'>"
                        +"<tr style='display: none;'><th></th><th></th>"
                        +"<tr style='display: none;'><th colspan='2'></th></tr>"
                        for(i=0;i<result.length;i++){
                            var username =result[i].username;
                            if(username == 'username' || username == undefined || username == 'null' || username == null){
                                username = ''
                            }
                            var createddate = result[i].createddate;
                            if(createddate == 'undefined' || createddate == null || createddate == 'null' || createddate == undefined || createddate == 'NaN-aN-aN'){
                                createddate=''
                            }else{
                                createddate = createddate.getFullYear()+'-'+("0" + (createddate.getMonth() + 1)).slice(-2)+'-'+("0" + createddate.getDate()).slice(-2) +" "+createddate.getHours()+':'+createddate.getMinutes()+':'+createddate.getSeconds();     
                            }
                            var logtype = result[i].logtype;
                            if(logtype == 'undefined' || logtype == undefined || logtype == 'null' || logtype == null){
                                logtype = ''
                            }
                            var logtext = result[i].logtext;
                            if(logtext == 'undefined' || logtext == undefined || logtext == 'null' || logtext == null){
                                logtext = ''
                            }
                        var logid = result[i].logid;
                        var logtext = result[i].logtext;
                        var logtype=result[i].logtype;
                        if(admin==1 || projectmanager==1 || contributor==1 ){
                            if (logtype === 'file') {
                                var fileId = logtext.split('||')[0]; // Extracting file ID
                                //console.log(fileId +" - fileId")
                                var fileName = logtext.split('||')[1]; // Extracting file name
                            // console.log(fileId +"fileid")
                            // console.log(fileName +"filename")
                            tbltext += `
                            <tr style='border: rgb(211, 231, 251); cursor: default !important; height: 10px;'>
                                <td style='width: 100px; height: 10px; color: rgb(3, 102, 135); text-align: left; font-family: Calibri; font-size: 19px;'>${username}</td>
                                <td colspan='4' style='width: 210px; height: 10px; font-size: 10px; text-align: right; color: #1a1a1a; font-family: Calibri;'>${createddate}</td>
                            </tr>
                            <tr style='cursor: default !important; height: 10px;'>
                                <td align='center' style='width: 300px; color: #1a1a1a; text-align: left; font-size: 12px; font-family: Calibri;'>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${fileName}
                                </td>
                                <td style='text-align: right; cursor: default !important;'>
                                   
                                        <img src='/static/image/downloadfile.png'  onclick="dfile('${fileId}');" style='height: 17px; width: 17px;'/>
                                
                                </td>
                                <td title='Delete Logs' style='text-align: right; cursor: default !important;'>
                                        <img src='/static/image/trash.png' onclick="deleteuploadfile1('${fileId}', '${logtext}');" style='height: 15px; width: 15px;'/>
                                    
                                </td>
                            </tr>
                        `;
                        
                                        // <button class='deletsl' onclick="deleteuploadfile1('${fileId}', '${logtext}');">
                            //  tbltext=tbltext+"<tr style='border:rgb(211, 231, 251); cursor:default !important ; height: 10px;!importent'>"+
                            // "<td style='width:100px; cursor:default !important ; height: 10px; color: #2f8927; text-align: left; font-family:Calibri ; font-size: 19px; ' >"+username+"</td>"+
                            // "<td style='width:210px; cursor:default !important ; height: 10px; font-size: 10px; text-align: right; color:#1a1a1a; font-family:Calibri ;' colspan='4'>"+createddate+"</td>"+
                            // "<tr style='height: 10px; !importent cursor:default !important ;'>"+
                            // "<td aligin='center' style='width:300px; color:#595959; cursor:default !important ; text-align: left; font-size: 12px; font-family:Calibri ;'>"+
                            // "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+logtext+"</td>"+
                            // "<td style='width: 70px; cursor:default;'></td>"+
                            // "<td style='width: 70px; cursor:default;'></td>"+
                            // "<td></td></tr></tr>"
                            } else 
                            tbltext=tbltext+"<tr style='border:rgb(211, 231, 251); cursor:default !important ; height: 10px;!importent'>"+
                            "<td style='width:100px; cursor:default !important ; height: 10px; color: rgb(3, 102, 135); text-align: left;font-family:Calibri ; font-size: 19px; ' >"+username+"</td>"+
                            "<td colspan='4' style='width:210px; cursor:default !important ; height: 10px; font-size: 10px; text-align: right; color:#1a1a1a; font-family:Calibri ;'>"+createddate+"</td>"+
                            "<tr style='height: 10px; !importent cursor:default !important ;'>"+
                            "<td aligin='center' style='width:300px; cursor:default !important ; text-align: left; font-size: 12px; color:#595959; font-family:Calibri ;'>"+
                            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+logtext+"</td>"+
                            "<td style='width: 70px; cursor:default;'></td><td title='Delete Logs' style='text-align: right; cursor:default;'>"+
                            "<button class='deletsl' onclick=deletselectedlog('"+result[i].logid+"')><img src='/static/image/trash.png' style='height:15px; width:15px;'/></td>"+
                            "<td style='width: 70px; cursor:default;'></td></tr></tr>"
                        }else{
                            if (logtype === 'file') {
                            var fileId = logtext.split('||')[0]; // Extracting file ID
                                var fileName = logtext.split('||')[1]; // Extracting file name
                            
                                tbltext += `
                                <tr style='border: rgb(211, 231, 251); cursor: default !important; height: 10px;'>
                                    <td style='width: 100px; height: 10px; color: #2f8927; text-align: left; font-size: 19px; font-family: Calibri;'>${username}</td>
                                    <td colspan='4' style='width: 210px; height: 10px; font-size: 10px; text-align: right; color: #1a1a1a; font-family: Calibri;'>${createddate}</td>
                                
                                <tr style='cursor: default !important; height: 10px;'>
                                    <td style='width: 30px; text-align: left; color: #1a1a1a; font-size: 12px; font-family: Calibri;'>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${fileName}
                                    </td>
                                    <td style='text-align: right; cursor: default !important;'>
                                        <button class='deletsl' onclick="dfile('${fileId}');">
                                            <img src='/static/image/downloadfile.png' style='height: 17px; width: 17px;'/>
                                        </button>
                                    </td>
                                    <td style='width: 70px; cursor:default;'></td>
                                </tr></tr>
                            `;
                           

                            } else 
                        tbltext=tbltext+"<tr style='border:rgb(211, 231, 251); cursor:default !important ; height: 10px;!importent'><td style='width:100px; cursor:default !important ; height: 10px; color: #2f8927; text-align: left; font-family:Calibri ; font-size: 19px; ' >"+username+"</td><td style='width:210px; cursor:default !important ; height: 10px; font-size: 10px; text-align: right; color:#1a1a1a;; font-family:Calibri ;' colspan='4'>"+createddate+"</td><tr style='height: 10px; !importent cursor:default !important ;'><td aligin='center' style='width:300px; color:#595959; cursor:default !important ; text-align: left; font-size: 12px; font-family:Calibri ;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+logtext+"</td><td style='width: 70px; cursor:default;'></td><td style='width: 70px; cursor:default;'></td><td></td></tr></tr>"
                        }
                    }
                    tbltext=tbltext+"</table>"
                    res.send(tbltext)
                }else{
                    res.send("No Logs")
                }
            })
                
        }
    else if (req.body.action==="uploadprofile1"){
        var taskid=req.body.taskid;
        var filename=req.body.filename; 
        var logid=uuidv4();
        var size=req.body.size;
        var cdate=new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
        var sql = "select subscriptions.quota, subscriptions.usedquota from subscriptions where subscriptionid like '" + req.session.subid + "'";
        mcon.query(sql, function (err, result) {
            // console.log(sql + "   .....")
            if (err) console.log(err)
                else if (result.length > 0) {
                    let quota = 0, usedquota = 0;
                        if (result[0].quota == null || result[0].quota == undefined || result[0].quota == "") {
                            quota = 0
                            console.log(quota + "  111111 quota")
                        } else {
                            quota = result[0].quota;
                        }
                        if (result[0].usedquota == null || result[0].usedquota == undefined || result[0].usedquota == "") {
                            usedquota = 0
                        } else {
                        usedquota = result[0].usedquota;
                        }
                        if (usedquota > quota) {
                            res.send("You have reached the maximum limit of file upload")
                    } else {
                        return new Promise((resolve, reject) => {
                            savefiledb(req,res,req.session.orgid,(successfun)=>{
                                resolve(successfun)
                            })
                            }).then((data)=>{
                                var sql3 ="insert into tasklog(taskid, logid, logtype, logtext, createddate,userid,username,orgid ) values('"+taskid+"','"+logid+"','file','"+data+'||'+filename+"','"+cdate+"','"+req.session.userid+"','"+req.session.username+"','"+req.session.orgid+"')";
                                trcon.query(sql3,function(err,result){
                                //console.log(sql3)
                                    if(err) console.log(err)
                                    else if(result.affectedRows>0){
                                        return new Promise((resolve, reject) => {
                                            gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
                                                resolve(successfun)
                                            });
                                        }).then((data) => {
                                            res.send("File Upload")
                                    })
                                }else{
                                    res.send("error")
                                }
                            })     
                        })         
                    }
                }
            })
    }
    else if(req.body.action === 'downloadfile1'){
        var taskid = req.body.taskid;
        var trfileid=req.body.data;
        let path ="taskregisterdb"+"/"+req.session.orgid
        sql="select * from tasklog where taskid = '"+taskid+"' and logtext like '%"+trfileid+"%' and orgid like '"+req.session.orgid+"'"
        // trcon.query("select * from tasklog where orgid like '"+req.session.orgid+"'", function(err,result){
        trcon.query(sql, function(err,result){
            console.log(sql)
            if(err) console.log(err,req)
            else if(result.length>0){
                var fileid1=result[0].logtext;
                var fileid = fileid1.split('||')[0]; 
                // return new Promise((resolve, reject) => {
                //     retrivefile2(req,res,req.body.data,path,req.session.orgid,(successfun) => {
                //     resolve(successfun);
                //     });
                // }).then((data)=>{
                    res.send(fileid)
                // })
            }else{
                res.send(fileid)
            }
        })
    }
    else if(req.body.action === 'deleteuploadfile1'){
        var fileid=req.body.fileId; 
        var logtext=req.body.logtext;
        var sql1="delete from tasklog where logtext='"+logtext+"' and orgid='"+req.session.orgid+"';"
        trcon.query(sql1,function(err,result1){
        console.log(sql1 +" delete file")
            if(err) console.log(err)
            else{
                return new Promise((resolve, reject) => {
                    deletefile(req,res,fileid,req.session.orgid,(successfun)=>{
                    resolve(successfun);

                    });
                    res.send("Delete file")
                })
            }
        })
    }
    else if(req.body.action==="searchmn"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if(req.body.action==='savefileidservice'){
        return new Promise((resolve, reject) => {
            savefiledb(req,res,req.session.orgid,(successfun) => {
                resolve(successfun);
            });
        }).then((data)=>{
            trcon.query("UPDATE orginfo SET logoid ='"+data+"' where orgid='"+req.session.orgid+"'" , function(err,result){
                if(err) console.log(err);
                else if(result.affectedRows>0){
                    res.send('successful')
                }else{
                    console.log("something went wrong please try after sometime.....")
                }
            })
        })   
    }
    else if(req.body.action === 'getlogoimageservice'){
        let path ="taskreglogo"+"/"+req.session.orgid
        trcon.query("select logoid from orginfo where orgid like'"+req.session.orgid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let fileid = result[0].logoid
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                })

            }else{
                res.send("no file")
            }
        })    
    }
    else if(req.body.action==='retriveteamname'){
         var sql="SELECT * FROM taskregister_t.teams where orgid = '"+req.session.orgid+"'";
            trcon.query(sql,function(err,result){
                if(err)console.log(err,req)
                else if(result.length>0){
                    r = []
                    for(i=0;i<result.length;i++){
                        r.push('{"teamname":"'+result[i].teamname+'","teamid":"'+result[i].teamid+'"}')
                    }
                    res.send(r)
                }else{
                    res.send(" ")
                }
            })
    }  
    else if(req.body.action==="showdescription"){
        var taskid = req.body.taskid
        var sql="select * from taskregister_t.tasks WHERE taskid = '"+taskid+"'";
        trcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){ 
                for(i=0;i<result.length;i++){
                    var taskname = result[i].taskname;
                            if(taskname == 'undefined' || taskname == undefined || taskname == 'null' || taskname == null){
                                taskname = ''
                            } 
                        var tbltext = "<table id='report'  class='mar' style='width: 330px; cursor: default; '><tr style='cursor: default;'><th style='width:400px'>"+taskname+"</th></tr>"
                            var taskdescription = result[i].taskdescription;
                            if(taskdescription == 'undefined' || taskdescription == undefined || taskdescription == 'null' || taskdescription == null){
                                taskdescription = ''
                            } 
                        tbltext=tbltext+"<tr style='cursor: default;'><td id='tasknametd' class='descrip'>"+taskdescription+"</td></tr>"   
                    }
                    tbltext=tbltext+"</table>"
                    res.send(tbltext)  
            }
        })
    }
    else if (req.body.action === 'savestatus') {
        var allstatus = req.body.newstatus;
        if (!allstatus || allstatus.trim() === '') {
          res.send("Status name cannot be null or empty.");
          return;
        }
        var checkDuplicateSql = "SELECT COUNT(*) AS status_count FROM taskstatus WHERE orgid = '" + req.session.orgid + "' AND statusname = '" + allstatus + "'";
        trcon.query(checkDuplicateSql, function (err, result) {
            if (err) {
                console.log(err);
                res.send("An error occurred.");
            }else {
                if (result[0].status_count > 0) {
                res.send("Duplicate status name. Status already exists.");
                    } else {
                    var insertSql = "INSERT INTO taskstatus(orgid, statusname, seq) VALUES('" + req.session.orgid + "', '" + allstatus + "', '1000')";
                    trcon.query(insertSql, function (err, result) {
                        if (err) {
                        console.log(err);
                        res.send("An error occurred while inserting the status.");
                            } else if (result.affectedRows > 0) {
                            res.send("Data inserted.");
                            } else {
                            res.send("Insert failed.");
                        }
                    })
                }
            }
        })
    }
    else if(req.body.action==='retrivestatus'){
        var sql="select * from taskstatus where orgid = '"+req.session.orgid+"' ORDER BY seq;"
        trcon.query(sql,function(err,result){
            //console.log(sql + )
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"statusname":"'+result[i].statusname+'","orgid":"'+result[i].orgid+'"}')
                }
                res.send(r)
            }else{
                res.send("retrive status error")
            }
        })
    }
    else if(req.body.action==='retriveallstatus'){
        var sql="select * from statuses ";
        trcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"statusname":"'+result[i].statusname+'"}')
                }
                res.send(r)
            }else{
                res.send("retrive all status error")
            }
        })
    }
    else if (req.body.action === 'addstatus1') {
        var allstatus = req.body.allstatus;
        if (!allstatus || allstatus.trim() === '') {
          res.send("Status name cannot be null or empty.");
          return;
        } 
            var checkDuplicateSql = "SELECT COUNT(*) AS status_count FROM taskstatus WHERE orgid = '" + req.session.orgid + "' AND statusname = '" + allstatus + "'";
            trcon.query(checkDuplicateSql, function (err, result) {
                if (err) {
                console.log(err);
                res.send("An error occurred.");
                } else {
                    if (result[0].status_count > 0) {
                        res.send("Duplicate status name. Status already exists.");
                    }else {
                        var insertSql = "INSERT INTO taskstatus(orgid, statusname, seq) VALUES('" + req.session.orgid + "', '" + allstatus + "', '1000')";
                        trcon.query(insertSql, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("An error occurred while inserting the status.");
                        } else if (result.affectedRows > 0) {
                            res.send("Data inserted.");
                        } else {
                            res.send("Insert failed.");
                        }
                    })
                }
            }
        })
    }
    else if(req.body.action === 'statusshortup'){
        var statusname=req.body.statusname;
        var sql="update taskstatus set seq=seq-1 where orgid = '"+req.session.orgid+"'and statusname like '"+statusname+"'";             
        trcon.query(sql,function(err,result){
            if(err)console.log(err)
                else if (result.affectedRows>0)
                {res.send("Update")}
            else{
                res.send("up error")
            }    
        })
    }
    else if(req.body.action === 'statusshortdown'){
        var statusname=req.body.statusname;
        var sql="update taskstatus set seq=seq+1 where orgid = '"+req.session.orgid+"'and statusname like '"+statusname+"'";             
        trcon.query(sql,function(err,result){
            if(err)console.log(err)
                else if (result.affectedRows>0)
                {res.send("Update")}
            else{
                res.send("down error")
            }    
        })
    }
    else if(req.body.action==='retrivetaskstatus'){
        var sql="select * from taskstatus where orgid = '"+req.session.orgid+"' ORDER BY seq ;"
        trcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"statusname":"'+result[i].statusname+'","orgid":"'+result[i].orgid+'"}')
                }
                res.send(r)
            }else{
                res.send("retriv status error")
            }
        })
    } 
    else if(req.body.action==='retrivetaskstatus1'){
        var sql="select * from taskstatus where orgid = '"+req.session.orgid+"' ORDER BY seq ;"
        trcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"statusname":"'+result[i].statusname+'","orgid":"'+result[i].orgid+'"}')
                }
                res.send(r)
            }else{
                res.send("retriv status 1error")
            }
        })
    }
    else if(req.body.action === 'assignstatuscolor'){
        var statusname=req.body.statusname;
        var color=req.body.color;
        var sql="update taskstatus set statuscolor='"+color+"'  where orgid = '"+req.session.orgid+"'and statusname like '"+statusname+"'";             
        trcon.query(sql,function(err,result){
            //console.log(sql)
            if(err)console.log(err)
                else if (result.affectedRows>0)
                {res.send("Update")}
            else{
                res.send("error")
            }    
        })
    } 
    else if(req.body.action==="deleteprojectinfo"){
        var projectid=req.body.projectid; 
        var sql = "delete from taskregister_t.projects where  projectid='"+projectid+"' and orgid='"+req.session.orgid+"'";
        trcon.query(sql,function(err,result){
            //console.log(sql)
            if(err) console.log(err)
            else{
              var sql1="delete from tasks where projectid='"+projectid+"' and orgid='"+req.session.orgid+"';"
              trcon.query(sql1,function(err,result1){
                //console.log(sql1)
                if(err) console.log(err)
                    else{
                    res.send("Delete project name")
                    }
                })
               
            }    
        })
    }   
    else if (req.body.action === "deletestatus") {
        var statusname = req.body.statusname;
        // Delete from taskstatus table
        var sqlDeleteStatus = "DELETE FROM taskregister_t.taskstatus WHERE orgid='" + req.session.orgid + "' AND statusname='" + statusname + "'";
        trcon.query(sqlDeleteStatus, function (err, resultStatus) {
            if (err) {
                console.log(err);
            } else {
                // Delete from tasks table based on taskstatus
                var sqlDeleteTasks = "DELETE FROM taskregister_t.tasks WHERE orgid='" + req.session.orgid + "' AND taskstatus='" + statusname + "'";   
                trcon.query(sqlDeleteTasks, function (err, resultTasks) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send("Delete status name and associated tasks");
                    }
                });
            }
        });
    }
    else if(req.body.action==='retrivprojectnameshow'){
        var projectid = req.body.projectid
        var sql="select * from projects where orgid = '"+req.session.orgid+"'";
        trcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"projectname":"'+result[i].projectname+'","orgid":"'+result[i].orgid+'"}')
                }
                res.send(r)
            }else{
                res.send("error")
            }
        })
    } 
    else if (req.body.action === "deletetaskinfo1") {
        var taskid = req.body.taskid;
        var sql = "SELECT * FROM tasks WHERE orgid='"+req.session.orgid+"' And parenttaskid ='"+taskid+"'";
        trcon.query(sql, [taskid], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.length > 0) {
                    res.send("Task has a parent, cannot be deleted");
                } else {
                    var sql1 = "DELETE FROM tasks WHERE taskid ='"+taskid+"' and orgid='"+req.session.orgid+"'";
                    trcon.query(sql1, [taskid], function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("Error deleting task");
                        } else {
                            var sql2 ="delete from tasklog where taskid='"+taskid+"' and orgid='"+req.session.orgi+"'"
                            trcon.query(sql2,function(err,result1){
                                //console.log(sql2)
                                if(err){
                                    console.log(err)
                                    res.send("error ")
                                }else{
                                    res.send("Task Deleted"); 
                                }
                            })
                            
                        }
                    });
                }
            }
        });
    }  
    else if(req.body.action==="deletechildtask"){
     var taskid = req.body.taskid;
     var sql = "delete from taskregister_t.tasks where orgid='"+req.session.orgid+"' and taskid='"+taskid+"'";
     trcon.query(sql,function(err,result1){
            if(err) console.log(err)
            else{
                    res.send("task deleted")
            }
        })    
    }   
    else if(req.body.action==="showstaffreport"){
        var projectid = req.body.projectid
        var tbltext = ""
        var sql="select * from taskregister_t.orgusers where orgid='"+req.session.orgid+"' and projectid='"+projectid+"'";
        trcon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){ 
                 tbltext = "<table id='report'><tr><th style='width:150px'>Name</th><th style='width:150px'>Contact No</th><th style='width:150px'>Position</th><th>Delete Staff</th></tr>"
                for(var i=0;i<result.length;i++){
                    var name =result[i].name;
                    var contactno = result[i].contactno;
                    var position = result[i].position;
                    tbltext=tbltext+"<tr><td>"+name+"</td><td>"+contactno+"</td><td>"+position+"</td><td button  onclick=deletestaffinfo('"+result[i].userid+"');><img src='/static/image/trash.png' style='width:22px;'/></button></td></tr>"
                }
                tbltext=tbltext+"</table>"
                
                res.send(tbltext)
                }else{
                    res.send("No Record")
                }
        })
    }  
    else if(req.body.action==="deletestaffinfo"){
        var userid = req.body.userid;
        var projectid = req.body.projectid
        var sql = "DELETE FROM orgusers WHERE userid ='"+userid+"' and projectid='"+projectid+"' and orgid='"+req.session.orgid+"';"
        trcon.query(sql,function(err,result1){
            //console.log(sql)
               if(err) console.log(err)
               else{
                       res.send("Staff Deleted")
               }
           })    
    }     
    else if(req.body.action==="deletselectedlog"){
        var logid = req.body.logid;
        var logtext = req.body.logtext;
        var sql = "DELETE FROM tasklog WHERE logid ='"+logid+"' and orgid='"+req.session.orgid+"';"
        trcon.query(sql,function(err,result){
            //console.log(sql)
               if(err) console.log(err)
               else{
                res.send("Delete file")
                }
            }) 
    } 
    //chat board
    else if(req.body.action==="subjectnamesave"){
        var projectid =req.body.projectid;
        var subjectname = req.body.subjectname;
        var subjectid=uuidv4();
        var sql1 = "SELECT COUNT(*) AS subject_count FROM chatsubject WHERE subjectname ='"+subjectname+"' and projectid='"+projectid+"' and orgid='"+req.session.orgid+"'";
        trcon.query(sql1,function (err, result1) {
            if (err) {
              console.log(err);
            }else {
                if (result1[0].subject_count > 0) {
                  res.send("Duplicate Subject name. Subject name already exists.");
                } else {
                    var sql = "insert into chatsubject (orgid, projectid, subjectname,subjectid) values('"+req.session.orgid+"','"+projectid+"','"+subjectname+"','"+subjectid+"')"
                    trcon.query(sql,function(err,result){
                        //console.log(sql)
                        if(err)console.log(err) 
                        else if (result.affectedRows>0){
                            res.send("Saved")
                        }else{
                            res.send("not")
                        }
                    })
                }
            }
        })
    } 
    else if(req.body.action==="retrivsubjectname"){
        var projectid=req.body.projectid
        var sql="select * from chatsubject where projectid='"+projectid+"' And orgid='"+req.session.orgid+"'"
        trcon.query(sql,function (err,result){
            //console.log(sql)
            if(err)console.log(err)
            else if(result.length>0){
            r = [];
            for(i=0;i<result.length;i++){
                r.push('{"subjectname":"'+result[i].subjectname+'","subjectid":"'+result[i].subjectid+'"}')
            }
                res.send(r)
            }else{
                res.send(" ")
                //console.log("error")
            }
        })
    } 
    else if(req.body.action==="retrivemember"){
        var projectid=req.body.projectid;
        var sql="select * from orgusers where orgid='"+req.session.orgid+"' and projectid='"+projectid+"'";
        trcon.query(sql,function (err,result){
            //console.log(sql +"   retriv ")
            if(err)console.log(err)
            else if(result.length>0){
                r = [];
                for(i=0;i<result.length;i++){
                    r.push('{"name":"'+result[i].name+'","userid":"'+result[i].userid+'"}')
                }
                //console.log(r)
                res.send(r)
            }else{
                console.log("error")
                res.send("")
                //res.send("error")
            }
        })
    }  
    else if (req.body.action === 'savegroup') {
        var projectid = req.body.projectid;
        var groupmember = req.body.groupmember;
        var subjectid = req.body.subjectid;
        var sql = "SELECT * FROM groupmember WHERE subjectid = '" + subjectid + "' AND member='"+groupmember+ "'";
        trcon.query(sql, function (err, result) {
            console.log(sql)
            if (err) {
                console.log(err);
                res.send("error");
            } else {
                if (result.length > 0) {
                    res.send("User already added");
                } else {
                    var cdate = new Date();
                    cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + +('0' + cdate.getSeconds()).slice(-2);
                    var sql1 = "INSERT INTO groupmember(orgid, projectid, subjectid,createdby, createddate,member) VALUES('" + req.session.orgid + "','" + projectid + "','" + subjectid + "','" + req.session.userid + "','" + cdate + "','"+groupmember+"')";
                    trcon.query(sql1, function (err, result1) {
                        //console.log(sql1);
                        if (err) {
                            console.log(err);
                            //res.send("error");
                        } else {
                            //console.log(result1);
                            res.send("Users Added successfully");
                        }
                    });
                }
            }
        });
    }   
    else if (req.body.action === "groupreport") {
        var projectid = req.body.projectid;
        var subjectid = req.body.subjectid;
        var tbltext = "";
        var sql = "SELECT DISTINCT gu.name, gu.userid,gu.contactno, gu.position FROM groupmember gm JOIN orgusers gu ON (gm.member = gu.userid) WHERE gm.orgid = '" + req.session.orgid + "' AND gm.projectid = '" + projectid + "' AND gm.subjectid = '" + subjectid + "'";
        trcon.query(sql, function (err, result) {
            //console.log(sql + " report");
            if (err) console.log(err);
            else if (result.length > 0) {
                tbltext = "<table id='report'><tr><th style='width:150px'>Name</th><th style='width:150px'>Contact No</th><th style='width:150px'>Position</th><th>Remove</th></tr>";
                for (var i = 0; i < result.length; i++) {
                    var name = result[i].name;
                    var contactno = result[i].contactno;
                    if(contactno == 'undefined' || contactno == undefined || contactno == 'null' || contactno == null){
                        contactno = ''
                    }
                    var position = result[i].position;
                    if(position == 'undefined' || position == undefined || position == 'null' || position == null){
                        position = ''
                    }
                    tbltext = tbltext + "<tr ><td>" + name + "</td><td>" + contactno + "</td><td>" + position + "</td><td button onclick=leftgroup('"+result[i].userid+"');><img src='/static/image/trash.png' style='height:20px; width:22px;'/></td></tr>";
                }
                tbltext = tbltext + "</table>";

                res.send(tbltext);
            } else {
                res.send("NO Record ");
            }
        });
    }
    else if(req.body.action==="leftgroup"){
        var userid = req.body.userid;
        var projectid = req.body.projectid
        var subjectid = req.body.subjectid
        var sql = "DELETE FROM taskregister_t.groupmember WHERE member ='"+userid+"' and projectid='"+projectid+"' and orgid='"+req.session.orgid+"' and subjectid='"+subjectid+"';"
        trcon.query(sql,function(err,result1){
            console.log(sql)
            if(err) console.log(err)
            else{
                    res.send("Remove")
            }
        })    
   }     
   else if (req.body.action === 'groupnamelist1') {
        var projectid = req.body.projectid;
        var tbltext = "<table id='report'>";

        if (req.session.admin) {
            var sql = "SELECT * FROM taskregister_t.chatsubject WHERE projectid = '" + projectid + "' AND orgid = '" + req.session.orgid + "'";
        } else {
            var sql = "SELECT a.subjectname, a.subjectid FROM chatsubject a JOIN groupmember b ON a.subjectid = b.subjectid WHERE b.orgid = '" + req.session.orgid + "' AND b.member = '" + req.session.userid + "' AND b.projectid='" + projectid + "'";
        }
        trcon.query(sql, function (err, result) {
            if(err)console.log(err);
            else if(result.length>0){
                for (var i = 0; i < result.length; i++) {
                    var subjectname = result[i].subjectname || '';
                    var subjectid = result[i].subjectid || '';

                    tbltext += "<tr ><td button onclick=showchatsubject('" + subjectid + "');showchatting('" + subjectid + "');passsubid('" + subjectid + "'); style='width: 300px; cursor: pointer; text-align: left;'>" + subjectname + "</td>";
                }
                tbltext += "</table>";
                res.send(tbltext);
            } else {
                res.send("No Groups");
            }
        });
    }
    else if (req.body.action === "showchatting") {
        var subjectid =req.body.subjectid;
        var projectid=req.body.projectid;
        var lastchattime = req.body.lastchattime; 
        var sql="select * from chatconversation  WHERE projectid = '"+projectid+"' AND orgid = '"+req.session.orgid+"' AND subjectid = '"+subjectid+"' and conversationdate > '"+lastchattime+"';"
        trcon.query(sql,function(err,result){
        // console.log(sql+ "-start")
        if(err)console.log(err);
            else if(result.length>0){
                var tbltext = "<table id='report' style='cursor: default; background-color: #cfeef6;'>";
                for (var i = 0; i < result.length; i++) {
                    var conversationtext = result[i].conversationtext;
                    if(conversationtext == 'undefined' || conversationtext == undefined || conversationtext == 'null' || conversationtext == null){
                        conversationtext = ''
                    }
                    var username = result[i].username;
                    if(username == 'undefined' || username == undefined || username == 'null' || username == null){
                        username = ''
                    }
                    var conversationdate = result[i].conversationdate;
                    if(conversationdate == 'undefined' || conversationdate == null || conversationdate == 'null' || conversationdate == undefined || conversationdate == 'NaN-aN-aN'){
                        conversationdate=''
                    }else{
                        conversationdate = conversationdate.getFullYear()+'-'+("0" + (conversationdate.getMonth() + 1)).slice(-2)+'-'+("0" + conversationdate.getDate()).slice(-2) +"  "+conversationdate.getHours()+':'+conversationdate.getMinutes()+':'+conversationdate.getSeconds();     
                    }
                    tbltext+="<tr style='width: 340px; cursor: default; color: rgb(232, 12, 27); font-family: Calibri;'><td style='text-align: left; width: 260px;'>"+username+"</td><td style='text-align: center; cursor: default; font-size: 11px; color: #969696;'>"+conversationdate+"</td>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </tr>"
                    tbltext+="<tr style='width: 340px; cursor: default;' class='cttttttt'><td colspan='3' class='chattingbox' style='background-color:#fcfcfc; cursor: pointer; text-align: left; cursor: default; width: 200px;'>" + conversationtext + "</td></tr>";
                }
                tbltext=tbltext+"</table>";
                res.send(tbltext)
            }
        else{
            res.send("NORECENTCHAT")
        //console.log("no data")
            }
        })
    }
    else if (req.body.action === "showchatsubject") {
        var subjectid = req.body.subjectid;
        var projectid = req.body.projectid;
        var tbltext = "<table id='report2' style='cursor: default;'>";
        // var sql = "SELECT DISTINCT a.subjectid, b.subjectname, pm.name as projectmanager_name, c.name as contributor_name, ro.name as readonly_name FROM taskregister_t.groupmember a JOIN taskregister_t.chatsubject b ON a.projectid = b.projectid AND a.subjectid = b.subjectid LEFT JOIN taskregister_t.orgusers pm ON a.projectmanager = pm.userid AND a.orgid = pm.orgid LEFT JOIN taskregister_t.orgusers c ON a.contributor = c.userid AND a.orgid = c.orgid LEFT JOIN taskregister_t.orgusers ro ON a.readonly = ro.userid AND a.orgid = ro.orgid WHERE a.projectid = '" + projectid + "' AND a.orgid = '" + req.session.orgid + "' AND a.subjectid = '" + subjectid + "';";
        var sql ="SELECT DISTINCT a.subjectid, b.subjectname FROM taskregister_t.groupmember a JOIN taskregister_t.chatsubject b ON a.projectid = b.projectid AND a.subjectid = b.subjectid WHERE a.projectid = '"+projectid+"' AND a.orgid = '"+req.session.orgid+"' AND a.subjectid = '"+subjectid+"';" 
        trcon.query(sql, function (err, result) {
        // console.log(sql)
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var addedSubjectIds = []; // Keep track of added subject IDs
                for (var i = 0; i < result.length; i++) {
                    var subjectname = result[i].subjectname;
                    if(subjectname == 'undefined' || subjectname == undefined || subjectname == 'null' || subjectname == null){
                        subjectname = ''
                    }
                    var currentSubjectId = result[i].subjectid;
                    if(currentSubjectId == 'undefined' || currentSubjectId == undefined || currentSubjectId == 'null' || currentSubjectId == null){
                        currentSubjectId = ''
                    }
                    // Check if the subject ID has already been added
                    if (!addedSubjectIds.includes(currentSubjectId)) {
                        tbltext += "<tr class='groupnamed' style='cursor: default;'><td style='cursor: default; align-items: center;font-size: 20px; width: 340px;'>" + subjectname + "</td><td></tr>";
                        addedSubjectIds.push(currentSubjectId); // Add the current subject ID to the list
                    }
                }
                tbltext += "</table>";
                res.send(tbltext);
            }else{
                res.send("No Groups")
            }
        });
    }

    else if (req.body.action === "showusers") {
        var subjectid = req.body.subjectid;
        var projectid = req.body.projectid;
        var tbltext = "<table id='report' style='width: 250px;' class='stafuser2'><tr><th style='cursor:default;'>Users List</th><tr>";
        var sql = "SELECT DISTINCT a.subjectid,b.name FROM taskregister_t.groupmember a JOIN  taskregister_t.orgusers b ON a.member = b.userid AND a.orgid = b.orgid WHERE a.projectid = '"+projectid+"' AND a.orgid = '"+req.session.orgid+"' AND a.subjectid = '"+subjectid+"';"
        trcon.query(sql, function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    var name = result[i].name ;
                    if(name == 'undefined' || name == undefined || name == 'null' || name == null){
                        name = ''
                    }
                    tbltext += "<tr class='susers'><td>" + name + "</td></tr>";
                }
                tbltext += "</table>";
                res.send(tbltext);
            }else{
                res.send("No Record")
            }
        })
    }
    else if (req.body.action === 'savechat') {
        var projectid = req.body.projectid;
        var subjectid = req.body.subjectid;
        var chatinfo = req.body.chatinfo;
        console.log(chatinfo +"  - chatinfo" + subjectid+ " - subjectid  " + projectid +" - projectid" )
        if (!chatinfo) {
            var missingField = "First Write A Message ";
            res.send(missingField);
            return;
        } else if (!subjectid){
                res.send("Select Group first")
        }else{
            var chatconversationid = uuidv4();
            var cdate = new Date();
            cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + ('0' + cdate.getSeconds()).slice(-2);
            var sql1 = "insert into chatconversation(chatconversationid,projectid,conversationtype,conversationtext,conversationdate,userid,username,orgid,subjectid) values('" + chatconversationid + "','" + projectid + "','text','" + chatinfo + "','" + cdate + "','" + req.session.userid + "','" + req.session.username + "','" + req.session.orgid + "','" + subjectid + "')";
            trcon.query(sql1, function (err, result1) {
                console.log(sql1 +" - chat save");
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                } else if(result1.affectedRows>0){
                    res.send("Message Sent");
                }else{
                    res.send("Message Sent");
                }
            });
        }
    }
    else if(req.body.action === "getaccountdetails"){
        mcon.query("select * from subscriptions where userid='" + req.session.userid + "' and moduleid=19", function(err, results){
            if(err) console.log(err)  
            else{
                var date_ob = new Date();
                let acc=[];
                let date = new Date(results[0].enddate)
                var diff = date.getTime() - date_ob.getTime()  
                var daydiff = diff / (1000 * 60 * 60 * 24)
                if(daydiff>0){
                    acc.push("Active")
                    let days = Math.round(daydiff)
                    acc.push(days)
                }
                else{
                    acc.push("deactive")
                    let days = 0
                    acc.push(days)
                }
                acc.push(results[0].startdate);
                acc.push(results[0].enddate);
                acc.push(results[0].usedquota);
                acc.push(results[0].quota)
                res.send(acc);
            }       
        })
    }
})     
async function getchildtask(tbltext1,taskid1,admin,projectmanager,contributor,cspace1){
    var admin = admin;
    var projectmanager = projectmanager;
    var contributor = contributor;
    return new Promise ((resolve,reject)=>{
        var taskid = taskid1;
        var tbltext = tbltext1;
        var cspace = cspace1;
        var sql="select * from taskregister_t.tasks where parenttaskid='"+taskid+"'";
        //var sql =""
        trcon.query(sql,async function(err,result){
            if(err){
                console.log(err)
                resolve(tbltext)
            }else if(result.length>0){   
                for(var i=0;i<result.length;i++){
                        let ctaskid=result[i].taskid;
                        var startdate = new Date(result[i].startdate);
                        var startdate1 = startdate.getDate() + '-' + ('0' + (startdate.getMonth() + 1)).slice(-2) + '-' + ('0' + startdate.getFullYear()).slice(-2)+" "+startdate.getHours()+":"+startdate.getMinutes();
                        if(startdate1 == 'undefined' || startdate1 == null || startdate1 == 'null' || startdate1 == undefined || startdate1 == 'NaN-aN-aN'){
                            startdate1=''
                        }
                        var enddate = new Date(result[i].enddate);
                        var enddate1 = enddate.getDate() + '-' + ('0' + (enddate.getMonth() + 1)).slice(-2) + '-' + ('0' + enddate.getFullYear()).slice(-2)+" "+enddate.getHours()+":"+enddate.getMinutes();
                        if(enddate1 == 'undefined' || enddate1 == null || enddate1 == 'null' || enddate1 == undefined || enddate1 == 'NaN-aN-aN'){
                            enddate1=''
                        }
                        var taskname = result[i].taskname;
                        if(taskname == 'undefined' || taskname == undefined || taskname == 'null' || taskname == null){
                            taskname = ''
                        }
                        var taskstatus = result[i].taskstatus;
                        if(taskstatus == 'undefined' || taskstatus == undefined || taskname == 'null' || taskname == null){
                            taskname = ''
                        }
                        var orgstatus = result[i].orgstatus;
                        if(orgstatus == 'undefined' || orgstatus == undefined || orgstatus == 'null' || orgstatus == null){
                            orgstatus = ''
                        }
                        
                        var status= "  ( " + orgstatus + " )";
                        if(status == 'undefined' || status == undefined || status == 'null' || status == null){
                            status = ''
                        }
                        var taskid = result[i].taskid;
                        var currentDate = new Date(); 
                        if ((startdate < currentDate && !["Started", "In Progress", "On Hold", "Cancelled", "Completed"].includes(result[i].orgstatus)) ){
                        tbltext=tbltext+"<tr style='background-color:#fcd4cf;'><td style='text-align: left;'  id='tasknametd' onclick=calllog('"+taskid+"');setTaskId('"+taskid +"');showdescription('"+taskid+"');>"+cspace     +   taskname+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+startdate1+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+enddate1+"</td><td style='cursor:default; font-size: 13px; '>"+taskstatus+"</td></tr>"                 

                        }else if(enddate < currentDate){
                            tbltext=tbltext+"<tr style='background-color: #fcd4cf;'><td style='text-align: left;'  id='tasknametd' onclick=calllog('"+taskid+"');setTaskId('"+taskid +"');showdescription('"+taskid+"');>"+cspace     +   taskname+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+startdate1+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+enddate1+"</td><td style='cursor:default; font-size: 13px; '>"+taskstatus+status+"</td></tr>"                   
                        }else
                        tbltext=tbltext+"<tr><td style='text-align: left;' id='tasknametd' onclick=calllog('"+taskid+"');setTaskId('"+taskid +"');showdescription('"+taskid+"');>"+cspace     +   taskname+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+startdate1+"</td><td style='font-size: 11px; cursor: default;  width:20px;'>"+enddate1+"</td><td style='cursor:default; font-size: 13px; '>"+taskstatus+status+"</td></tr>"                 
                        var tbl1 = await getchildtask(tbltext,ctaskid,admin,projectmanager,contributor,cspace+"&nbsp;&nbsp;&nbsp;&nbsp;");
                        tbltext=tbl1;            
                    }
                    resolve(tbltext)      
                }else{
                    resolve(tbltext)
                }
                 
           })
          
    })
}

/////////////////        Notice Board Project   /////////////////////////
app.get("/1/noticeboard",async(req, res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }else{
        var admin = 0;
        var started = 0;
        var User = 0;
        var substatus= 0;
        var orgcolor="";
        var sqla="select * from usermaster_t.subscriptions where userid='"+req.session.userid+"' and moduleid='3'";
        // console.log("sqla     "+sqla)
        mcon.query(sqla,(err,result)=>{
        if(err) console.log(err)
            else if(result.length>0){
                admin = 1;
                req.session.admin = admin
                req.session.subid = result[0].subscriptionid;
            }else{
                admin= 0;
            }
            var sql="select * from noticeboard_t.organization where subsid='"+req.session.subid+"' ";
                //console.log("sql......."+sql)
                ncon.query(sql, (err, result)=>{
                if(err) console.log(err)
                else if (result.length>0) {
                    //console.log("one")
                    started = 1;                     
                    req.session.orgid = result[0].orgid;
                    //console.log(req.session.orgid +"orgid")
                } else {
                    started = 0;
                    //console.log("two")
                }
                    var sql3="select noticeboard_t.userinfo.orgid,noticeboard_t.organization.orgname from noticeboard_t.userinfo join noticeboard_t.organization on noticeboard_t.userinfo.orgid =  noticeboard_t.organization.orgid where  noticeboard_t.userinfo.userid ='"+req.session.userid+"' and staffposition = 'User'";
                    // console.log(sql3)
                    ncon.query(sql3, (err,result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        User = 1;
                        req.session.User = User;                     
                        req.session.orgid = result[0].orgid;
                        req.session.orgname = result[0].orgname;
                        console.log(req.session.User + "Player")
                    } else {
                        User = 0;
                    }
                        ncon.query("select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in(select organization.subsid from noticeboard_t.organization where orgid like '"+req.session.orgid+"')",function(err,result){
                            if(err)console.log(err)
                            else if(result.length>0){
                                var enddate = result[0].enddate
                                let date1 = new Date()
                                const diffTime = enddate.getTime() - date1.getTime();
                                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                if(diffDays>0){
                                        substatus = 1;
                                }else{
                                        substatus = 0;    
                                } 
                            }
                            var sql="select * from noticeboard_t.organization where orgid='"+req.session.orgid+"' ";
                            // console.log("sql......."+sql)
                            ncon.query(sql, (err, result)=>{
                                if(err) console.log(err)
                                else if (result.length>0) {
                                    //console.log("one")
                                    req.session.orgcolor = result[0].csscolor;                   
                                    orgcolor=req.session.orgcolor;
                                    if(orgcolor == 'undefined' || orgcolor == null || orgcolor == 'null' || orgcolor == undefined || orgcolor == 'NaN-aN-aN'){
                                        orgcolor='style'
                                    }
                                    //console.log(req.session.orgid +"orgid")
                                } else {
                                    orgcolor = 0;
                                    //console.log("two")
                                }        

                            res.render("noticeboard.pug",{userid: req.session.userid,username: req.session.username,admin:admin,started:started,User:User,substatus:substatus,orgcolor:orgcolor});
                            console.log("noticeboard.pug",{userid:req.session.userid,username: req.session.username,admin:admin,started:started,User:User,substatus:substatus,orgcolor:orgcolor});
                            })    
                        })
                 })
            })
        })
    }
});

app.post("/1/noticeboard",up,async (req,res)=>{
    //console.log(req.get('origin') +" .....")
    if(!req.session.userid){
        res.send("sessionexpired")
    }else if(req.body.action==="subscriben"){
        var startdate = new Date();
        var subscribeidnew = uuidv4();
        var currentdate = startdate.getFullYear()+'-'+("0" + (startdate.getMonth() + 1)).slice(-2)+'-'+("0" + startdate.getDate()).slice(-2) +" "+startdate.getHours()+':'+startdate.getMinutes()+':'+startdate.getSeconds();
        let days =3;
        let newDate = new Date(Date.now()+days*24*60*60*1000);
        let ndate = ("0" + newDate.getDate()).slice(-2);
        let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
        let nyear = newDate.getFullYear();   
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        let seconds = newDate.getSeconds();       
        let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds 
        var sql1="select * from subscriptions where userid='"+req.session.userid+"' and moduleid=3 ";
        // console.log(sql1 +" -subscription")
        mcon.query (sql1, function(err, result){
        // console.log(result)
            if(err) console.log(err)
            else if(result.length>0){
                res.send("used")
            }else{
                var sql2 = "insert into subscriptions (userid, subscriptionid, moduleid, startdate, enddate,isprimary ) values('"+req.session.userid+"','"+subscribeidnew+"',3,'"+currentdate+"','"+nextdate+"','yes')"
                mcon.query(sql2, function(err, data){
                    if (err) throw err;
                    res.send("Saved")
                    });   
                }
        })
    }
else if(req.body.action==="saveorginfo"){
    var orgid = uuidv4();
    var nameorg = req.body.nameorg
    var phoneno = req.body.phoneno
    var orgaddress = req.body.orgaddress
    var orgaddress2 = req.body.orgaddress2
    var orgcity = req.body.orgcity
    var orgstate = req.body.orgstate
    var orgemail = req.body.orgemail
    var sql = "insert into organization (subsid, orgid,orgname, phoneno,address1,address2,city,state,email) values('"+req.session.subid+"','"+orgid+"','"+nameorg+"', '"+phoneno+"','"+orgaddress+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"')"
    ncon.query(sql,function(err,result1){
        if(err)console.log(err)
            else if (result1.affectedrows>0)
            {
                res.send("Information saved successfully")
            }else{
                res.send("Information saved successfully")
            }
           
    })
}
else if(req.body.action==="retriveorginfo"){
    var sql="select * from organization where subsid='"+req.session.subid+"'";
    //console.log(sql)
    ncon.query(sql,function (err,result){
        if(err)console.log(err)
        else if(result.length>0){
            var arr=[];
            arr.push(result[0].orgname)
            arr.push(result[0].phoneno)
            arr.push(result[0].address1)
            arr.push(result[0].address2)
            arr.push(result[0].city)
            arr.push(result[0].state)
            arr.push(result[0].email)
            res.send(arr)
        }else{
            console.log("Orginfo error")
        }
    })
}
else if(req.body.action==="orgcolornoticeboard"){
    var csscolor = req.body.csscolor
    var sql = "update organization set csscolor='"+csscolor+"'  where subsid='"+req.session.subid+"'";
    ncon.query(sql,function(err,result){
       console.log(sql  +  ">>>>")
        if(err)console.log(err)
        else if(result.affectedRows>0){
           res.send("updated successfully")
        }else{
            res.send("orginfo error")
        }
    })
}
else if (req.body.action === 'retrivebgstylecolornb') {
    var sql = "select * from usermaster_t.bgstyle ";
    mcon.query(sql, function(err, result) {
        // console.log(sql +"   retrivprojectname")
        if (err) console.log(err, req);
        else if (result.length > 0) {
            r = [];
            for (i = 0; i < result.length; i++) {
                r.push('{"name":"' + result[i].name + '","filename":"' + result[i].filename + '"}');
            }
            res.send(r);
        } else {
            res.send("error");
        }
    })
}

else if(req.body.action==="updateorg"){
    var nameorg = req.body.nameorg
    var phoneno = req.body.phoneno
    var uaddress = req.body.uaddress
    var uaddress2 = req.body.uaddress2
    var ucity = req.body.ucity
    var ustate = req.body.ustate
    var uemail = req.body.uemail
    var sql = "update organization set orgname='"+nameorg+"',phoneno='"+phoneno+"',address1='"+uaddress+"',address2='"+uaddress2+"',city='"+ucity+"',state='"+ustate+"',email='"+uemail+"'  where subsid='"+req.session.subid+"'";
    ncon.query(sql,function(err,result){
       // console.log(sql  +  ">>>>")
        if(err)console.log(err)
        else if(result.affectedRows>0){
           res.send("updated successfully")
        }else{
            res.send("orginfo error")
        }
    })
}

else if(req.body.action==='noticeblogo'){
    return new Promise((resolve, reject) => {
        savefiledb(req,res,req.session.orgid,(successfun) => {
            resolve(successfun);
        });
    }).then((data)=>{
        ncon.query("UPDATE organization SET logoid ='"+data+"' where orgid='"+req.session.orgid+"'" , function(err,result){
            if(err) console.log(err);
            else if(result.affectedRows>0){
                res.send('successful')
            }else{
                console.log("something went wrong please try after sometime.....")
            }
        })
    })   
}
else if(req.body.action === 'getlogonoticeb'){
    let path ="noticeboardlogo"+"/"+req.session.orgid
    ncon.query("select logoid from organization where orgid like'"+req.session.orgid+"'",function(err,result){
        if(err) console.log(err)
        else if(result.length>0){
            let fileid = result[0].logoid
            return new Promise((resolve, reject) => {
                retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
                    resolve(successfun);
                });
            }).then((data)=>{
                res.send(data)
            })

        }else{
            res.send("no file")
        }
    })    
}
else if (req.body.action === 'savestatus') {
    var allstatus = req.body.newstatus;
    if (!allstatus || allstatus.trim() === '') {
      res.send("Status name cannot be null or empty.");
      return;
    }
    var checkDuplicateSql = "SELECT COUNT(*) AS status_count FROM orgstatuses WHERE orgid = '" + req.session.orgid + "' AND statusname = '" + allstatus + "'";
    ncon.query(checkDuplicateSql, function (err, result) {
        //console.log(checkDuplicateSql)
      if (err) {
        console.log(err);
        res.send("An error occurred.");
      } else {
        if (result[0].status_count > 0) {
          res.send("Duplicate status name. Status already exists.");
        } else {
          var insertSql = "INSERT INTO orgstatuses(orgid, statusname, seq) VALUES('" + req.session.orgid + "', '" + allstatus + "', '1000')";
          ncon.query(insertSql, function (err, result) {
           // console.log(insertSql)
            if (err) {
              console.log(err);
              res.send("An error occurred while inserting the status.");
            } else if (result.affectedRows > 0) {
              res.send("Information saved successfully");
            } else {
              res.send("Insert failed.");
            }
          })
        }
      }
    })
}
else if(req.body.action==='retrivestatus'){
    var sql="select * from orgstatuses where orgid = '"+req.session.orgid+"' ORDER BY seq;"
    ncon.query(sql,function(err,result){
        if(err)console.log(err,req)
        else if(result.length>0){
            r = []
            for(i=0;i<result.length;i++){
                r.push('{"statusname":"'+result[i].statusname+'","orgid":"'+result[i].orgid+'"}')
            }
            res.send(r)
        }else{
            res.send("retrive status error")
        }
    })
}
else if (req.body.action === "deletestatus") {
    var statusname = req.body.statusname;
    // Delete from taskstatus table
    var sqlDeleteStatus = "DELETE FROM noticeboard_t.orgstatuses WHERE orgid='" + req.session.orgid + "' AND statusname='" + statusname + "'";
    ncon.query(sqlDeleteStatus, function (err, resultStatus) {
        if (err) {
            console.log(err);
        } else {
                    res.send("Delete");
                }
        })
    }
    else if(req.body.action==='retriveallstatus'){
        var sql="select * from statuses ";
        ncon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"statusname":"'+result[i].statusname+'"}')
                }
                res.send(r)
            }else{
                res.send("retrive all status error")
            }
        })
    }
    else if (req.body.action === 'addorgstatus') {
        var orgstatus = req.body.orgstatus;
        if (!orgstatus || orgstatus.trim() === '') {
          res.send("Status name cannot be null or empty.");
          return;
        }
        var checkDuplicateSql = "SELECT COUNT(*) AS status_count FROM orgstatuses WHERE orgid = '" + req.session.orgid + "' AND statusname = '" + orgstatus + "'";
        ncon.query(checkDuplicateSql, function (err, result) {
            // console.log(checkDuplicateSql)
          if (err) {
            console.log(err);
            res.send("An error occurred.");
          } else {
            if (result[0].status_count > 0) {
              res.send("Duplicate status name. Status already exists.");
            } else {
              var insertSql = "INSERT INTO orgstatuses(orgid, statusname, seq) VALUES('" + req.session.orgid + "', '" + orgstatus + "', '1000')";
              ncon.query(insertSql, function (err, result) {
            //  console.log(insertSql +" - org status")
                if (err) {
                  console.log(err);
                  res.send("An error occurred while inserting the status.");
                } else if (result.affectedRows > 0) {
                  res.send("Data inserted.");
                } else {
                  res.send("Insert failed.");
                }
              })
            }
          }
        })
    }
    //notice board
    else if (req.body.action === "creatnewnoticeboard") {
        var noticeboardtitle = req.body.noticeboardtitle;
        var noticeboarddescription = req.body.noticeboarddescription;
        var sql = "SELECT COUNT(*) AS count FROM noticeboard_t.noticeboard WHERE orgid='"+req.session.orgid+"' and noticeboardtitle = '" + noticeboardtitle + "'";
        ncon.query(sql, function (err, checkResult) {
            // console.log(sql +" -  checkExistenceQuery")
            if (err) {
                res.send("error");
            } else {
                var noticecount = checkResult[0].count;
    
                if (noticecount > 0) {
                    res.send("Notice Board  Name already exists. Please choose a different name.");
                } else {
                    var noticeboardid = uuidv4();
                    var sql1 = "INSERT INTO noticeboard_t.noticeboard (orgid, noticeboardid, noticeboardtitle, description,createdby) VALUES('" + req.session.orgid + "','" + noticeboardid + "','" + noticeboardtitle + "', '" + noticeboarddescription + "','"+req.session.userid+"')";
                    ncon.query(sql1, function (err, insertResult) {
                        // console.log(sql1 +"- insertQuery")
                        if (err) {
                            res.send("error");
                        } else if (insertResult.affectedRows > 0) {
                            res.send("data insert");
                        } else {
                            res.send("something went wrong please try after sometime.....");
                        }
                    });
                }
            }
        });
    
    }
    else if (req.body.action === 'retrivenoticeboardname') {
        var sql = "SELECT * FROM noticeboard WHERE orgid = '" + req.session.orgid + "'";
        ncon.query(sql, function(err, result) {
           // console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"noticeboardtitle":"' + result[i].noticeboardtitle + '","noticeboardid":"' + result[i].noticeboardid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action==="retrivnoticeinfo"){
        var noticeid=req.body.noticeid;
        var shownoticeboards=req.body.shownoticeboards
          var sql="select * from notices where orgid='"+req.session.orgid+"'and noticeboardid='"+shownoticeboards+"' and noticeid='"+noticeid+"';"
            ncon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].noticetitle)
                arr.push(result[0].noticetext)
                arr.push(result[0].fromdate)
                arr.push(result[0].todate)
                arr.push(result[0].noticeid)
                res.send(arr)
            }else{
                console.log("Retrive Update error")
            }
        })
    }
    else if(req.body.action==="updatenoticeinformation"){
        var noticetitle1 = req.body.noticetitle1
        var noticedescription1 = req.body.noticedescription1
        var noticestartdate1 = req.body.noticestartdate1
        var noticenddate1 = req.body.noticenddate1
        var noticeid = req.body.noticeid
        var shownoticeboards = req.body.shownoticeboards
        var sql = "update notices set noticetitle='"+noticetitle1+"',noticetext='"+noticedescription1+"',fromdate='"+noticestartdate1+"',todate='"+noticenddate1+"'  where orgid='"+req.session.orgid+"' and noticeboardid='"+shownoticeboards+"' and noticeid='"+noticeid+"'";
        ncon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("error")
            }
        })
    }
    else if (req.body.action === "creatnewnotice") {
        var noticeboardid= req.body.noticeboardid;
        var noticetitle = req.body.noticetitle;
        var noticedescription = req.body.noticedescription;
        var noticestartdate = req.body.noticestartdate;
        var noticenddate = req.body.noticenddate;
        var cdate = new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + ('0' + cdate.getSeconds()).slice(-2);
        var noticeid = uuidv4();
        var sql1 = "INSERT INTO noticeboard_t.notices (orgid, noticeboardid, noticeid, noticetitle,noticetext,fromdate,todate,createddate,createdby) VALUES('" + req.session.orgid + "','" + noticeboardid + "','" + noticeid + "', '" + noticetitle + "','"+noticedescription+"','"+noticestartdate+"','"+noticenddate+"','"+cdate+"','"+req.session.userid+"')";
                ncon.query(sql1, function (err, insertResult) {
                    //console.log(sql1 +"- insertQuery")
                    if (err) {
                        res.send("error");
                    } else if (insertResult.affectedRows > 0) {
                        res.send("data insert");
                    } else {
                        res.send("something went wrong please try after sometime.....");
                    }
                });
            }
    else if (req.body.action === "shownoticeboard") {
    var noticeboardid = req.body.noticeboardid;
    var shownoticedata = req.body.shownoticedata;
        var sql = "SELECT noticetitle, noticeboardid, noticeid, fromdate, todate, createddate, noticetext FROM noticeboard_t.notices WHERE orgid = '" + req.session.orgid + "' AND noticeboardid = '" + noticeboardid + "' AND ('" + shownoticedata + "' BETWEEN fromdate AND todate OR '" + shownoticedata + "' = DATE(fromdate) OR '" + shownoticedata + "' = DATE(todate));";           
        //  console.log(sql + " - show notice board sql");
        ncon.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            if (result.length === 0) {
                res.send("No Data");
                return;
            }

            // var colors = ['#a2cdf9', '#f69b9b', '#b0c9fb', '#f388d5', '#9fd0fe', '#e6e600', '#e19ff7', '#aaf9aa', '#7d7773', '#4d8146', '#48acdf', '#ea2626', '#adebad', '#f6f6ab', '#92f692'];
            var colors =['#b3e7e7','#c2c2eb','#efc6da','#96e8e8','#ecc7e3','#eacdf4','#f3d2d2','#d3e7cd','#d0d0f3','#f6daf6','#cecef0','#e1ebd7','#dcc3f4','#bff3e8','#bcccec','#83dcdc'];

            var tbltext = "<div class='notice-container' style='width: 100%; height: 100%; border-color: coral !important;box-shadow:rgba(191, 195, 221, 0.2) 0 -25px 18px -14px inset,rgba(175, 199, 226, 0.15) 0 1px 2px,rgba(179, 191, 215, 0.15) 0 2px 4px,rgba(136, 161, 168, 0.15) 0 4px 8px,rgba(139, 173, 190, 0.15) 0 8px 16px,rgba(164, 169, 192, 0.15) 0 16px 32px; border-style: ridge !important; border-width: 25px !important; border-color: coral !important; background-color:#dbf0fa'>";

            result.forEach(function (notice, index) {
                var colorIndex = Math.floor(Math.random() * colors.length);
                var color = colors[colorIndex];
                // var rotationValue = Math.floor(Math.random() * 11) - 5; // Random rotation between -5 to 5 degrees
                if(req.session.admin){
                tbltext += "<div class='notice-item' style='background-color: " + color + "; box-shadow: 6px 5px 4px #c1c1c1;'>";
                tbltext += "<div class='notice-title'>" + notice.noticetitle + "</div>";
                tbltext += "<div class='notice-actions'>";
                tbltext +="<img onclick=fileupload(\""+notice.noticeid+"\"); src='/static/image/fileupload.png'  style='width:30px; cursor: pointer;' title='File Upload''/>"
                tbltext += "<img onclick='onclick=noticeinfo1(\""+notice.noticeid+"\");' src='/static/image/information.png' style='width:30px; cursor: pointer;' title='Notice Information' />";
                tbltext += "<img onclick='onclick=editenoticeinfo(\""+notice.noticeid+"\");' src='/static/image/editnotice.png' style='width:30px; cursor: pointer;' title='Notice Edite' />";
                tbltext += "<img onclick='onclick=noticedelete(\""+notice.noticeid+"\");' src='/static/image/trash.png' style='width:25px; cursor: pointer;' title='Notice Delete' />";
                tbltext += "</div></div>";
                }else{
                    tbltext += "<div class='notice-item' style='background-color: " + color + "; box-shadow: 6px 5px 4px #c1c1c1;'>";
                    tbltext += "<div class='notice-title'>" + notice.noticetitle + "</div>";
                    tbltext += "<div class='notice-actions'>";
                    tbltext += "<img onclick='onclick=noticeinfo1(\""+notice.noticeid+"\");' src='/static/image/information.png' style='width:30px; cursor: pointer;' title='Notice Information' />";
                    tbltext += "</div></div>";
                }
            });

            tbltext += "</div>";
            res.send(tbltext);
            
        });
    }
    else if (req.body.action === "shownoticeinfo2") {
        var noticeid = req.body.noticeid;
       var sql = "SELECT nf.*, n.* FROM noticefiles nf JOIN notices n ON nf.orgid = n.orgid AND nf.noticeid = n.noticeid WHERE nf.noticeid='" + noticeid + "' AND nf.orgid='" + req.session.orgid + "';";
        ncon.query(sql, function (err, result) {
            //console.log(sql);
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                if(req.session.admin){
                var tbltext = "<table id='report' style='width: 100%;'><tr><th colspan='3'>Notice Information</th></tr>";
                var noticeTitle = result[0].noticetitle;
                var noticeText = result[0].noticetext;
                var fromDate = result[0].fromdate ? result[0].fromdate.toLocaleString() : ''; // Convert date to string
                var toDate = result[0].todate ? result[0].todate.toLocaleString() : ''; // Convert date to string
                tbltext += "<tr><td colspan='3'><strong>Notice Title:</strong> " + noticeTitle + "</td></tr>";
                tbltext += "<tr><td colspan='3'><strong>Notice Text:</strong> " + noticeText + "</td></tr>";
                // Display Start and End Date
                tbltext += "<tr><td colspan='2'><strong>Start Date:</strong> " + fromDate + "</td><td><strong>End Date:</strong> " + toDate + "</td></tr>";
                // Display Files if available
                //if (result.some(entry => entry.fileid)) { // Check if any file exists
                
                tbltext += "<tr><th>File Name</th><th colspan='2'>Action</th></tr>";

                for (var i = 0; i < result.length; i++) {
                    var fileid= result[i].fileid;
                    var fileid1 = fileid.split('||')[0]; 
                    var fileName = fileid.split('||')[1];
                // console.log(fileid + " /// fileid")
                    // tbltext += "<tr><td>" + fileName + "</td><td colspan='2'><button class='butonbg' onclick=downloadfilen1('" + fileid1 + "');><img src='/static/image/downloadfile.png' style='width:22px;'/></button> <button class='butonbg' onclick=deletenoticefile('" + fileid + "');><img src='/static/image/trash.png' style='width:22px;'/></button></td></tr>";
                    tbltext += "<tr><td>" + fileName + "</td><td colspan='2'><button class='butonbg' onclick=\"downloadfilen1('" + fileid1 + "');\"><img src='/static/image/downloadfile.png' style='width:22px;'/></button> <button class='butonbg' onclick=\"deletenoticefile('" + encodeURIComponent(fileid) + "');\"><img src='/static/image/trash.png' style='width:22px;'/></button></td></tr>";

                }  
                // } else {
                //     tbltext += "<tr><td colspan='2'>No Files</td></tr>";
                // }
                }else{
                    var tbltext = "<table id='report' style='width: 100%;'><tr><th colspan='2'>Notice Information</th></tr>";
                var noticeTitle = result[0].noticetitle;
                var noticeText = result[0].noticetext;
                var fromDate = result[0].fromdate ? result[0].fromdate.toLocaleString() : ''; // Convert date to string
                var toDate = result[0].todate ? result[0].todate.toLocaleString() : ''; // Convert date to string
                tbltext += "<tr><td colspan='2'><strong>Notice Title:</strong> " + noticeTitle + "</td></tr>";
                tbltext += "<tr><td colspan='2'><strong>Notice Text:</strong> " + noticeText + "</td></tr>";
                // Display Start and End Date
                tbltext += "<tr><td><strong>Start Date:</strong> " + fromDate + "</td><td><strong>End Date:</strong> " + toDate + "</td></tr>";
                // Display Files if available
                //if (result.some(entry => entry.fileid)) { // Check if any file exists
                
                tbltext += "<tr><th>File Name</th><th>Action</th></tr>";
                
                    for (var i = 0; i < result.length; i++) {
                        var fileid= result[i].fileid;
                        var fileid1 = fileid.split('||')[0]; 
                        var fileName = fileid.split('||')[1];
                        // if (logtype === 'file') {
                        //     var fileName = result[i].logtext.split('||')[1]; // Extracting file name
                        //     var fileId = result[i].logtext.split('||')[0]; // Extracting file ID
                       
                            tbltext += "<tr><td>" + fileName + "</td><td><button onclick=downloadfilen1('" + fileid1 + "');><img src='/static/image/downloadfile.png' style='height:22px; width:22px;'/></button></td></tr>";  
                        }
                    }
                
                tbltext += "</table>";
                res.send(tbltext);
            } else {
                // If no files are associated with the notice, fetch notice information from the notices table
                var sql1 ="SELECT * FROM notices WHERE noticeid='" + noticeid + "' AND orgid='" + req.session.orgid + "';";
                ncon.query(sql1, function (err, result) {
                    //console.log(sql1);
                    if (err) {
                        console.log(err);
                        res.send("Error occurred while fetching notice information.");
                    } else if (result.length > 0) {
                        var tbltext = "<table id='report' style='width: 100%;'><tr><th colspan='2'>Notice Information</th></tr>";
                        var noticeTitle = result[0].noticetitle;
                        var noticeText = result[0].noticetext;
                        var fromDate = result[0].fromdate ? result[0].fromdate.toLocaleString() : ''; // Convert date to string
                        var toDate = result[0].todate ? result[0].todate.toLocaleString() : ''; // Convert date to string
                        
                        // Display Notice Title
                        tbltext += "<tr><td colspan='2'><strong>Notice Title:</strong> " + noticeTitle + "</td></tr>";
                    
                        // Display Notice Text
                        tbltext += "<tr><td colspan='2'><strong>Notice Text:</strong> " + noticeText + "</td></tr>";
                    
                        // Display Start and End Date
                        tbltext += "<tr><td><strong>Start Date:</strong> " + fromDate + "</td><td><strong>End Date:</strong> " + toDate + "</td></tr>";
                    
                        tbltext += "</table>";
                        res.send(tbltext);
                    } else {
                        res.send("No Notice Found.");
                    }
                });
            }
        });
    }
    else if(req.body.action === 'downloadfilen1'){
        var noticeid = req.body.noticeid;
        var noticefileid=req.body.data;
        // let path ="noticeboardfiles"+"/"+ req.session.orgid
        sql="select * from noticefiles where noticeid = '"+noticeid+"' and fileid like '%"+noticefileid+"%' and orgid like '"+req.session.orgid+"'"
        ncon.query(sql, function(err,result){
         console.log(sql)
            if(err) console.log(err,req)
            else if(result.length>0){
                var fileid1=result[0].fileid;
                var fileid = fileid1.split('||')[0]; 
                // return new Promise((resolve, reject) => {
                //     retrivefile(req,res,req.body.data,path,req.session.orgid,(successfun) => {
                //     resolve(successfun);
                //     });
                // }).then((data)=>{
                    res.send(fileid)
                // })
            }else{
                res.send("no file")
            }
        })
    }
    else if(req.body.action === 'deletenoticefile'){
        var fileid1=req.body.fileidinfo; 
        var fileida=req.body.fileida;
        var noticeid=req.body.noticeid;
        var fileid = fileid1.split('%7C%7C')[0]; // Extracting fileid from encoded string
        // console.log(fileid);
        var sql1="delete from noticefiles where orgid='"+req.session.orgid+"' And noticeid='"+noticeid+"' And fileid='"+fileida+"';"
        ncon.query(sql1,function(err,result1){
        console.log(sql1 +" delete file")
            if(err) console.log(err)
            else{
                return new Promise((resolve, reject) => {
                    deletefile(req,res,fileid,req.session.orgid,(successfun)=>{
                    resolve(successfun);

                    });
                    res.send("Delete file")
                })
            }
        })
    }
   else if(req.body.action === 'downloadqrcode'){
    let noticeboardId = req.body.data; // Assuming this is the ID of the notice board
    var data=noticeboardId+".png"
    res.send(data)
       
}

    //show notice board QRCode
    else if (req.body.action === 'retrivenoticeboard') {
        var sql = "SELECT * FROM noticeboard WHERE orgid = '" + req.session.orgid + "'";
        ncon.query(sql, function(err, result) {
            // console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"noticeboardtitle":"' + result[i].noticeboardtitle + '","noticeboardid":"' + result[i].noticeboardid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action === 'shownoticeboardqrcode') {
        let noticeid = req.body.noticeboardid;
        data = [];
        //data.push("http://localhost:55000/1/noticeboardQR/" + noticeid);
        var ENVCALURL1=req.get('origin');
        ENVCALURL=ENVCALURL1;
        data.push(ENVCALURL+"/1/noticeboardQR/"+noticeid)

        QRCode.toFile('./userdata/noticeboard/QRCode/' + noticeid + '.png', data, {
            dark: '#208698',
            light: '#FFF',
            margin: 2,
            height: 400,
            width: 400
        }, function (err) {
            if (err) {
                console.log(err);
                res.status(500).send("Error generating QR code");
            } else {
                if (fs.existsSync("./userdata/noticeboard/QRCode/" + noticeid + '.png')) {
                    data = [];
                    data.push(noticeid);
                    res.send(data);
                } else {
                    res.status(500).send("QR code file not found");
                }
            }
        });
    }
    //file upload
    else if (req.body.action==="saveuploadefile"){
        var filepurposen=req.body.filepurposen;
        var filename=req.body.filename; 
        var noticeid=req.body.noticeid; 
        var size=req.body.size;
        var cdate=new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
        var sql = "select subscriptions.quota, subscriptions.usedquota from subscriptions where subscriptionid like '" + req.session.subid + "'";
        mcon.query(sql, function (err, result) {
            // console.log(sql + "   .....")
            if (err) console.log(err)
                else if (result.length > 0) {
                    let quota = 0, usedquota = 0;
                        if (result[0].quota == null || result[0].quota == undefined || result[0].quota == "") {
                            quota = 0
                            console.log(quota + "  111111 quota")
                        } else {
                            quota = result[0].quota;
                        }
                        if (result[0].usedquota == null || result[0].usedquota == undefined || result[0].usedquota == "") {
                            usedquota = 0
                        } else {
                        usedquota = result[0].usedquota;
                        }
                        if (usedquota > quota) {
                            res.send("You have reached the maximum limit of file upload")
                    } else {
                     return new Promise((resolve, reject) => {
                            savefiledb(req,res,req.session.orgid,(successfun)=>{
                                resolve(successfun)
                            })
                    }).then((data)=>{
                        var sql3 ="insert into noticefiles(orgid, noticeid, fileid,filepurpose, createddate,createdby) values('"+req.session.orgid+"','"+noticeid+"','"+data+'||'+filename+"','"+filepurposen+"','"+cdate+"','"+req.session.userid+"')";
                        ncon.query(sql3,function(err,result){
                        // console.log(sql3)
                            if(err) console.log(err)
                            else if(result.affectedRows>0){
                                return new Promise((resolve, reject) => {
                                    gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
                                        resolve(successfun)
                                    });
                                }).then((data) => {
                                    res.send("File Upload successfully")
                            })
                        }else{
                            res.send("error")
                        }
                    })     
                })         
           }
        }
        })
    }
    else if(req.body.action === "getaccountdetailsn"){
        mcon.query("select * from subscriptions where userid='" + req.session.userid + "' and moduleid=3", function(err, results){
            if(err) console.log(err)  
            else{
                var date_ob = new Date();
                let acc=[];
                let date = new Date(results[0].enddate)
                var diff = date.getTime() - date_ob.getTime()  
                var daydiff = diff / (1000 * 60 * 60 * 24)
                if(daydiff>0){
                    acc.push("Active")
                    let days = Math.round(daydiff)
                    acc.push(days)
                }
                else{
                    acc.push("deactive")
                    let days = 0
                    acc.push(days)
                }
                acc.push(results[0].startdate);
                acc.push(results[0].enddate);
                acc.push(results[0].usedquota);
                acc.push(results[0].quota)
                res.send(acc);
            }       
        })
    } 
    else if(req.body.action==="showeq"){
        var shownoticeboards = req.body.shownoticeboards
        var tbltext ="";
        var sql ="SELECT * FROM noticeboard_t.enquiry WHERE orgid='"+req.session.orgid+"' AND noticeboardid='"+shownoticeboards+"'  ;"
        //    var sql ="SELECT * FROM mlm_t.member a, plan b, plandetails c WHERE a.planid=b.planid and b.planid=c.planid AND memberid='"+refrenceid+"' and c.levels = '1';" 
        ncon.query(sql,async  function (err,result){
            // console.log(sql +" 111..........")
            if(err)console.log(err)
            else if(result.length>0){ 
                var tbltext = "<table id='report' class='eqrtable'><tr><th style='width:180px'>Name</th><th style='width:150px'>Contact No</th><th>Enquiry Date</th><th>Question</th></tr>"
               
                for(var i=0;i<result.length;i++){
                        var contactno =result[i].contactno;
                        if(contactno == 'undefined' || contactno == undefined || contactno == 'null' || contactno == null){
                            contactno = ''
                        }
                        var name = result[i].name;
                        if(name == 'undefined' || name == undefined || name == 'null' || name == null){
                            name = ''
                        }
                        var enquirytext =result[i].enquirytext;
                        if(enquirytext == 'undefined' || enquirytext == undefined || enquirytext == 'null' || enquirytext == null){
                            enquirytext = ''
                        }
                        var currentdate = result[i].currentdate;
                            if(currentdate == 'undefined' || currentdate == null || currentdate == 'null' || currentdate == undefined || currentdate == 'NaN-aN-aN'){
                                currentdate=''
                            }else{
                                currentdate = currentdate.getFullYear()+'-'+("0" + (currentdate.getMonth() + 1)).slice(-2)+'-'+("0" + currentdate.getDate()).slice(-2);     
                            }
                         var row="<tr><td  style='text-align: left;'>"+name+"</td><td>"+contactno+"</td><td>"+currentdate+"</td><td>"+enquirytext+"</td></tr>"
                    tbltext += row;
                       
                    }
                    tbltext +="</table>";  
                    res.send(tbltext);
                    //res.send("Data update.");
                   
                }else{
                    res.send("No Record")
                }
        })
    }
    else if (req.body.action === "assignstaff") {
        var addposition = req.body.addposition;
        var username = req.body.username;
        var useremail = req.body.useremail;
        var contactno = req.body.usermobilenumber;
    
        if (!username || !useremail || !contactno || addposition === 'select' || addposition === 'null' || !addposition) {
            var missingField;
    
            if (!contactno) missingField = "Mobile number";
            else if (!username) missingField = "User Name";
            else if (!useremail) missingField = "User Email";
            else if (!addposition) missingField = "Position";
            else if (addposition) missingField = "Position";
    
            res.send("Please fill the " + missingField + " field.");
            return;
        } else {
            mcon.query("SELECT * FROM users WHERE mobile = '" + contactno + "'", function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result.length > 0) {
                    var userid = result[0].userid;
                    ncon.query("SELECT * FROM userinfo WHERE userid='" + userid + "' AND orgid <> '" + req.session.orgid + "'", function (err, existingUserResult) {
                        if (err) {
                            console.log(err);
                        } else if (existingUserResult.length > 0) {
                            res.send("User already exists in another organization");
                        } else {
                            mcon.query("SELECT * FROM subscriptions WHERE userid='" + userid + "' AND moduleid=3", function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else if (results.length > 0) {
                                    res.send("User Has Subscription For This Module");
                                } else {
                                    var sql1 = "SELECT * FROM usermaster_t.users WHERE mobile='" + req.body.usermobilenumber + "'";
                                    mcon.query(sql1, function (err, result1) {
                                        if (err) {
                                            console.log(err);
                                        } else if (result1.length > 0) {
                                            var userid = result1[0].userid;
                                            //var userProjectsQuery = "SELECT projectid, position FROM orgusers WHERE userid = '" + userid + "'";
                                            //trcon.query(userProjectsQuery, function (err, userProjectsResult) {
                                                // if (err) {
                                                //     console.log(err);
                                                // } else {
                                                //     var userAlreadyAdded = false;
                                                //     for (var i = 0; i < userProjectsResult.length; i++) {
                                                //         var existingProjectId = userProjectsResult[i].projectid;
                                                //         var existingPosition = userProjectsResult[i].position;
    
                                                //         if (existingProjectId != projectid && existingPosition != addposition) {
                                                //             // User is already added to a different project with a different position
                                                //             userAlreadyAdded = true;
                                                //             break;
                                                //         }
                                                //     }
                                                    // if (userAlreadyAdded) {
                                                    //     res.send("User already assigned to another project with a different position");
                                                    // } else {
                                                        ncon.query("SELECT * FROM userinfo WHERE userid='" + userid + "' AND orgid = '" + req.session.orgid + "' AND staffposition = '" + addposition + "'", function (err, duplicateCheckResult) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else if (duplicateCheckResult.length > 0) {
                                                                res.send("User is already assigned to this position in the organization");
                                                            } else {
                                                                // Proceed with the insertion since no duplicate is found
                                                                var sql = "INSERT INTO userinfo (orgid,userid, staffcontactno,staffname ,staffemail,staffposition) VALUES('" + req.session.orgid + "','" + userid + "','" + contactno + "','" + username + "','" + useremail + "','" + addposition + "')";
                                                                ncon.query(sql, function (err, result) {
                                                                    // console.log(sql);
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else if (result.affectedRows > 0) {
                                                                        res.send("Assign staff");
                                                                    } else {
                                                                        res.send("Assign staff");
                                                                    }
                                                                });
                                                            }
                                                        });
                                                        
                                                   // }
                                               // }
                                          //  });
                                        } else {
                                            res.send("user is already added with a different position");
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    res.send("Number is not registered in calendaree.com");
                }
            });
        }
    }
    else if(req.body.action==="searchstaff"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if(req.body.action==="showstaffreportn"){
        var tbltext = ""
        var sql="select * from noticeboard_t.userinfo where orgid='"+req.session.orgid+"'";
        ncon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){ 
                 tbltext = "<table id='report'><tr><th style='width:150px'>Name</th><th style='width:150px'>Contact No</th><th>Email</th><th style='width:150px'>Position</th><th>Delete Staff</th></tr>"
                for(var i=0;i<result.length;i++){
                    var staffname =result[i].staffname;
                    var staffemail = result[i].staffemail;
                    var staffcontactno = result[i].staffcontactno;
                    var staffposition = result[i].staffposition;
                    tbltext=tbltext+"<tr><td>"+staffname+"</td><td>"+staffcontactno+"</td><td>"+staffemail+"</td><td>"+staffposition+"</td><td button  onclick=deletestaffinfo('"+result[i].userid+"');><img src='/static/image/trash.png' style='width:22px;'/></button></td></tr>"
                }
                tbltext=tbltext+"</table>"
                
                res.send(tbltext)
                }else{
                    res.send("No Record")
                }
        })
    }
    else if(req.body.action==="deletestaff"){
        var userid = req.body.userid;
        var sql = "DELETE FROM userinfo WHERE userid ='"+userid+"' and orgid='"+req.session.orgid+"';"
        ncon.query(sql,function(err,result1){
            // console.log(sql +"////")
               if(err) console.log(err)
               else{
                       res.send("Staff Deleted")
               }
           })    
    }
    //notice deleted  
    else if (req.body.action === "noticedelete") {
        var noticeid = req.body.noticeid;
        var orgid = req.session.orgid;
        var enquiry=req.body.enquiry;
        var sql = "SELECT * FROM notices WHERE orgid='"+orgid+"' AND noticeid='"+noticeid+"'";
        ncon.query(sql, function (err, noticeResults) {
            console.log(sql + " -sql")
            if (err) {
                console.log(err);
            } else if (noticeResults.length > 0) {
                var noticeid1 = noticeResults[0].noticeid;
                var sql2 = "DELETE FROM notices WHERE orgid='"+orgid+"' AND noticeid='"+noticeid1+"'";
                ncon.query(sql2, function (err, result1) {
                    console.log(sql2 + " -sql2")
                    if (err) {
                        console.log(err)
                    } else {
                        var sql1 = "SELECT * FROM noticefiles WHERE orgid='"+orgid+"' AND noticeid='"+noticeid+"'";
                        ncon.query(sql1,function (err, fileResults) {
                            console.log(sql1 + " -sql1")
                            if (err) {
                                console.log(err);
                            } else if (fileResults.length > 0) {
                                var promises = fileResults.map(file => {
                                    var fileid1 = file.fileid;
                                    var sql3 = "DELETE FROM noticefiles WHERE orgid='"+orgid+"' AND noticeid='"+noticeid+"' AND fileid='"+fileid1+"'";
                                    return new Promise((resolve, reject) => {
                                        ncon.query(sql3, function (err, result) {
                                            console.log(sql3 + " -sql3")
                                            if (err) {
                                                console.log(err)
                                                reject(err);
                                            } else {
                                                var fileid = fileid1.split('||')[0];
                                                deletefile(req, res, fileid, orgid, (successfun) => {
                                                    resolve(successfun);
                                                });
                                            }
                                        });
                                    });
                                });
                                Promise.all(promises)
                                    .then(() => {
                                        if(enquiry==='true'){
                                        var sql5="delete from enquiry where orgid='"+orgid+"' And noticeid='"+noticeid+"'";
                                        ncon.query(sql5,function(err,result){
                                            console.log(sql5 +" enquiry")
                                            if (err) {
                                                console.log(err);
                                            } else{
                                                res.send(" notice Deleted  ");
                                            }
                                        })
                                     }else{
                                        res.send(" notice Deleted  ");
                                     }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.send("Error occurred while deleting files.");
                                    });
                            } else {
                                if(enquiry==='true'){
                                    var sql5="delete from enquiry where orgid='"+orgid+"' And noticeid='"+noticeid+"'";
                                    ncon.query(sql5,function(err,result){
                                        console.log(sql5 +" enquiry")
                                        if (err) {
                                            console.log(err);
                                        } else{
                                            res.send(" notice Deleted  ");
                                        }
                                    })
                                 }else{
                                    res.send(" notice Deleted  ");
                                 }
                                
                            }
                        });
                    }
                });
            } else {
                res.send("Notice not found");
            }
        });
    }
       
});

app.get("/1/noticeboardQR/:noticeid",async(req,res) =>{
    req.session.noticeid=req.params.noticeid
    console.log("get " + req.session.noticeid)
    res.render('noticeboardQR.pug')
    // var showsearch=yes;
    
})
app.post('/1/noticeboardQR',up, (req, res) => {
    if(!req.session.noticeid){
        res.redirect("/1/login")
    }
    else if (req.body.action === "noticeboardshow") {
        var noticeboardid = req.body.noticeboardid;
        var shownoticedata = req.body.shownoticedata;
        var sql1 = "SELECT orgid FROM noticeboard_t.noticeboard WHERE noticeboardid='" + noticeboardid + "'";
        
        ncon.query(sql1, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            if (result.length === 0) {
                res.send("No Data");
                return;
            }
            var orgid1 = result[0].orgid;
            // console.log(orgid1 + " - orgid");
    
            var sql = "SELECT noticetitle, noticeid, orgid FROM noticeboard_t.notices WHERE orgid='" + orgid1 + "' AND noticeboardid = '" + noticeboardid + "' AND ('" + shownoticedata + "' BETWEEN fromdate AND todate OR '" + shownoticedata + "' = DATE(fromdate) OR '" + shownoticedata + "' = DATE(todate));";
            // console.log(sql + " - show notice board sql");
            ncon.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
    
                if (result.length === 0) {
                    res.send("No Data");
                    return;
                }
    
                var colors =['#b3e7e7','#c2c2eb','#efc6da','#96e8e8','#ecc7e3','#eacdf4','#f3d2d2','#d3e7cd','#d0d0f3','#f6daf6','#cecef0','#dcc3f4','#bff3e8','#bcccec','#83dcdc'];
    
                var tbltext = "<div class='notice-container' style='width: 100%; height: 100%; border-color: coral !important;box-shadow:rgba(191, 195, 221, 0.2) 0 -25px 18px -14px inset,rgba(175, 199, 226, 0.15) 0 1px 2px,rgba(179, 191, 215, 0.15) 0 2px 4px,rgba(136, 161, 168, 0.15) 0 4px 8px,rgba(139, 173, 190, 0.15) 0 8px 16px,rgba(164, 169, 192, 0.15) 0 16px 32px; border-style: ridge !important; border-width: 25px !important; border-color: coral !important; background-color:#dbf0fa'>";
    
                result.forEach(function (notice, index) {
                    var colorIndex = Math.floor(Math.random() * colors.length);
                    var color = colors[colorIndex];
                    // var rotationValue = Math.floor(Math.random() * 11) - 5; // Random rotation between -5 to 5 degrees
    
                    tbltext += "<div class='notice-item' style='background-color: " + color + ";'>";
                    tbltext += "<div class='notice-title'>" + notice.noticetitle + "</div>";
                    tbltext += "<div class='notice-actions'>";
                    tbltext += "<img onclick='noticeinfo(\"" + notice.noticeid + "\",\"" + notice.orgid + "\")' src='/static/image/information.png' style='width:30px; cursor: pointer;' title='Notice Information' />";
                    tbltext += "<img onclick='handleEnquiryClick(\"" + notice.noticeid + "\",\"" + notice.orgid + "\")' src='/static/image/enquiry.png' style='width:25px; cursor: pointer;' title='Enquiry' />";
                    tbltext += "</div></div>";
                });
    
                tbltext += "</div>";
                res.send(tbltext);
            });
        });
    }
    else if (req.body.action === "searchnotices") {
    var searchnoticetext = req.body.searchnoticetext;
    var sql = "SELECT noticeboardtitle, noticeboardid FROM noticeboard_t.noticeboard where noticeboardtitle like '%" + searchnoticetext + "%';";
     console.log(sql);
    ncon.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            return;
        } else if (result.length > 0) {
            var tbltext = "<table id='report' class='searchtable' style='width:100%;'><th>Notice Boards</th><th>Notice Board Open</th><tr>";
            for (var i = 0; i < result.length; i++) {
                var noticeboardid = result[i].noticeboardid;
                var noticeboardtitle = result[i].noticeboardtitle;
                var ENVCALURL1=req.get('origin');
                ENVCALURL=ENVCALURL1;
                tbltext += "<tr><td style='width:300px;'><div>" + noticeboardtitle + "</div></td><td style='width:100px;'><a href="+ENVCALURL+"/1/noticeboardQR/" + noticeboardid + " style='color:rgb(96, 136, 224);'>Open</a></td></tr>";                // tbltext += "<td ><div>" + noticeboardtitle + "</div></td><td><a href='http://dev.calendaree.com:55000/1/noticeboardQR/" + noticeboardid + "'> open </a></td>";
            }
            tbltext += "</tr></table>";
            res.send(tbltext);
        }
    });
}
 else if (req.body.action === "shownoticeinfo1") {
        var noticeid = req.body.noticeid;
        var orgid = req.body.orgid;
        
      var sql = "SELECT nf.*, n.* FROM noticefiles nf JOIN notices n ON nf.orgid = n.orgid AND nf.noticeid = n.noticeid WHERE nf.noticeid='" + noticeid + "' AND nf.orgid='" + orgid + "';";
        
        ncon.query(sql, function (err, result) {
            //console.log(sql);
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var tbltext = "<table id='report' style='width: 100%;'><tr><th colspan='2'>Notice Information</th></tr>";
                var noticeTitle = result[0].noticetitle;
                var noticeText = result[0].noticetext;
                var fromDate = result[0].fromdate ? result[0].fromdate.toLocaleString() : ''; // Convert date to string
                var toDate = result[0].todate ? result[0].todate.toLocaleString() : ''; // Convert date to string
               // var fileid1= result[0].fileid;
                // Display Notice Title
                tbltext += "<tr><td colspan='2'><strong>Notice Title:</strong> " + noticeTitle + "</td></tr>";
            
                // Display Notice Text
                tbltext += "<tr><td colspan='2'><strong>Notice Text:</strong> " + noticeText + "</td></tr>";
            
                // Display Start and End Date
                tbltext += "<tr><td><strong>Start Date:</strong> " + fromDate + "</td><td><strong>End Date:</strong> " + toDate + "</td></tr>";
            
                // Display Files if available
                //if (result.some(entry => entry.fileid)) { // Check if any file exists
                    tbltext += "<tr><th>File Name</th><th>Action</th></tr>";
                    for (var i = 0; i < result.length; i++) {
                        var fileid= result[i].fileid;
                        var fileid1 = fileid.split('||')[0]; 
                        var fileName = fileid.split('||')[1];
                        // if (logtype === 'file') {
                        //     var fileName = result[i].logtext.split('||')[1]; // Extracting file name
                        //     var fileId = result[i].logtext.split('||')[0]; // Extracting file ID
                            tbltext += "<tr><td>" + fileName + "</td><td><button onclick=downloadfilen('" + fileid1 + "');><img src='/static/image/downloadfile.png' style='height:22px; width:22px;'/></button></td></tr>";
                       // }
                    }
                // } else {
                //     tbltext += "<tr><td colspan='2'>No Files</td></tr>";
                // }
                
                tbltext += "</table>";
                res.send(tbltext);
            } else {
                // If no files are associated with the notice, fetch notice information from the notices table
                var sql1 ="SELECT * FROM notices WHERE noticeid='" + noticeid + "' AND orgid='" + orgid + "';";
                ncon.query(sql1, function (err, result) {
                    //console.log(sql1);
                    if (err) {
                        console.log(err);
                        res.send("Error occurred while fetching notice information.");
                    } else if (result.length > 0) {
                        var tbltext = "<table id='report' style='width: 100%;'><tr><th colspan='2'>Notice Information</th></tr>";
                        var noticeTitle = result[0].noticetitle;
                        var noticeText = result[0].noticetext;
                        var fromDate = result[0].fromdate ? result[0].fromdate.toLocaleString() : ''; // Convert date to string
                        var toDate = result[0].todate ? result[0].todate.toLocaleString() : ''; // Convert date to string
                        
                        // Display Notice Title
                        tbltext += "<tr><td colspan='2'><strong>Notice Title:</strong> " + noticeTitle + "</td></tr>";
                    
                        // Display Notice Text
                        tbltext += "<tr><td colspan='2'><strong>Notice Text:</strong> " + noticeText + "</td></tr>";
                    
                        // Display Start and End Date
                        tbltext += "<tr><td><strong>Start Date:</strong> " + fromDate + "</td><td><strong>End Date:</strong> " + toDate + "</td></tr>";
                    
                        tbltext += "</table>";
                        res.send(tbltext);
                    } else {
                        res.send("No Notice Found.");
                    }
                });
            }
        });
    }
    else if(req.body.action === 'downloadfilen'){
        var noticeid = req.body.noticeid;
        var orgid=req.body.orgid;
        var fileid =req.body.data;
        // var noticeid = req.body.noticeid;
        let path ="noticeboardfilesQR"
        //sql="select * from tasklog where taskid = '"+taskid+"' and orgid like '"+req.session.orgid+"'"
            sql="select * from noticefiles where noticeid = '"+noticeid+"' and fileid like '%"+fileid+"%' and orgid='"+orgid+"'"

        ncon.query(sql, function(err,result){
         console.log(result)
            if(err) logerror(err,req)
            else if(result.length>0){
                var fileid1=result[0].fileid;
                var fileid = fileid1.split('||')[0]; 
                // return new Promise((resolve, reject) => {
                //     retrivefile(req,res,req.body.data,path,orgid,(successfun) => {
                //     resolve(successfun);
                //     });
                // }).then((data)=>{
                    // res.send(fileid)
                    res.send({ fileid, orgid });
                // })
            }else{
                res.send("no file")
            }
        })
    }
    else if(req.body.action==="enquiryseve"){
        var noticeid = req.body.noticeid;
        var orgid2=req.body.orgid2;
        var ename = req.body.ename;
        var contactno = req.body.econtactno;
        var enqtext = req.body.enqtext;
        var noticebid=req.body.noticeboardid;
        var currentdate = new Date();
        var currentdate = currentdate.getFullYear()+'-'+("0" + (currentdate.getMonth() + 1)).slice(-2)+'-'+("0" + currentdate.getDate()).slice(-2) +" "+currentdate.getHours()+':'+currentdate.getMinutes()+':'+currentdate.getSeconds();
        var sql = "insert into enquiry(orgid,contactno,name, currentdate,noticeid,enquirytext,noticeboardid) values('"+orgid2+"','"+contactno+"','"+ename+"', '"+currentdate+"','"+noticeid+"','"+enqtext+"','"+noticebid+"')"
        ncon.query(sql,function(err,result1){
            console.log(sql)
            if(err)console.log(err)
                else if (result1.affectedrows>0)
                {
                    res.send("Enquity Send, Thank You...!")
                }else{
                    res.send("Enquity Send, Thank You...!")
                }  
        })
    }
    else if (req.body.action === "retriveorgname") {
        var noticeboardid = req.body.noticeboardid;
        var sql = "SELECT orgid, noticeboardtitle FROM noticeboard WHERE noticeboardid = '" + noticeboardid + "'";
        ncon.query(sql, function (err, result) {
            // console.log(sql + " show orgid")
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else if (result.length > 0) {
                var orgid = result[0].orgid;
                var arr = [];
                arr.push(result[0].noticeboardtitle);
                var orgSql = "SELECT orgname, address1, phoneno FROM organization WHERE orgid ='" + orgid + "'";
                ncon.query(orgSql, function (err, orgResult) {
                    console.log(orgSql + " orgsql")
                    if (err) {
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    } else if (orgResult.length > 0) {
                        arr.push(orgResult[0].orgname);
                        arr.push(orgResult[0].address1);
                        arr.push(orgResult[0].phoneno);
                        res.send(arr);
                    } else {
                        res.send("Organization not found");
                    }
                });
            } else {
                res.send("Noticeboard not found");
            }
        });
    } else {
        res.status(400).send("Bad Request");
    }
    
});  

///////////////////// video palyer project  //////////////////////
app.get("/1/videoplayer",async(req, res) => {
    if(!req.session.userid){
         res.redirect("/1/login")
    }else{
        var admin = 0;
        var started = 0;
        var Player = 0;
        var substatus = 0;
        var orgcolor="";
        var sqla="select * from usermaster_t.subscriptions where userid='"+req.session.userid+"' and moduleid='20'";
        // console.log("sqla     "+sqla)
        mcon.query(sqla,(err,result)=>{
        if(err) console.log(err)
            else if(result.length>0){
                admin = 1;
                req.session.admin = admin
                req.session.subid = result[0].subscriptionid;
            }else{
                admin= 0;
            }
                var sql="select * from videoplayer_t.orginfo where subscriptionid='"+req.session.subid+"' ";
                //console.log("sql......."+sql)
                ncon.query(sql, (err, result)=>{
                if(err) console.log(err)
                else if (result.length>0) {
                    //console.log("one")
                    started = 1;                     
                    req.session.orgid = result[0].orgid;
                    //console.log(req.session.orgid +"orgid")
                } else {
                    started = 0;
                    //console.log("two")
                }
                    var sql3="select videoplayer_t.staff.orgid,videoplayer_t.orginfo.orgname from videoplayer_t.staff join videoplayer_t.orginfo on videoplayer_t.staff.orgid =  videoplayer_t.orginfo.orgid where  videoplayer_t.staff.userid ='"+req.session.userid+"' and position = 'Player'";
                    //console.log(sql3)
                    vcon.query(sql3, (err,result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        Player = 1;
                        req.session.Player = Player;                     
                        req.session.orgid = result[0].orgid;
                        req.session.orgname = result[0].orgname;
                        console.log(req.session.Player + "Player")
                    } else {
                        Player = 0;
                    }
                    mcon.query("select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in(select orginfo.subscriptionid from videoplayer_t.orginfo where orgid like '"+req.session.orgid+"')",function(err,result){
                        if(err)console.log(err)
                        else if(result.length>0){
                            var enddate = result[0].enddate
                            let date1 = new Date()
                            const diffTime = enddate.getTime() - date1.getTime();
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            if(diffDays>0){
                                    substatus = 1;
                            }else{
                                    substatus = 0;    
                                } 
                            }  
                            var sql="select * from videoplayer_t.orginfo where orgid='"+req.session.orgid+"' ";
                                    //console.log("sql......."+sql)
                                    vcon.query(sql, (err, result)=>{
                                        if(err) console.log(err)
                                        else if (result.length>0) {
                                            //console.log("one")
                                            req.session.orgcolor = result[0].csscolor;;                     
                                            orgcolor=req.session.orgcolor;
                                            //console.log(req.session.orgid +"orgid")
                                        } else {
                                            orgcolor = 0;
                                            //console.log("two")
                                        } 
                                res.render("videoplayer.pug",{userid: req.session.userid,username: req.session.username,admin:admin,started:started,substatus:substatus,Player:Player,orgcolor:orgcolor});
                                console.log("videoplayer.pug",{userid:req.session.userid,username: req.session.username,admin:admin,started:started,substatus:substatus,Player:Player,orgcolor:orgcolor});
                            })            
                        })
                    })
                }) 
            })
        }
    });
app.post("/1/videoplayer",up,async (req,res)=>{
    if(!req.session.userid){
        res.send("sessionexpired")
        // res.redirect("/1/login")
    }else if(req.body.action==="subscribe"){
        var startdate = new Date();
        var subscribeidnew = uuidv4();
        var currentdate = startdate.getFullYear()+'-'+("0" + (startdate.getMonth() + 1)).slice(-2)+'-'+("0" + startdate.getDate()).slice(-2) +" "+startdate.getHours()+':'+startdate.getMinutes()+':'+startdate.getSeconds();
        let days =3;
        let newDate = new Date(Date.now()+days*24*60*60*1000);
        let ndate = ("0" + newDate.getDate()).slice(-2);
        let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
        let nyear = newDate.getFullYear();   
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        let seconds = newDate.getSeconds();       
        let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds 
        var sql1="select * from subscriptions where userid='"+req.session.userid+"' and moduleid=20 ";
        // console.log(sql1)
        mcon.query (sql1, function(err, result){
        //console.log(result +"  result")
            if(err) console.log(err)
            else if(result.length>0){
                res.send("used")
            }else{
                var sql2 = "insert into subscriptions(userid, subscriptionid, moduleid, startdate, enddate,isprimary ) values('"+req.session.userid+"','"+subscribeidnew+"',20,'"+currentdate+"','"+nextdate+"','yes')"
                    mcon.query(sql2, function(err, data){
                        if (err) throw err;
                        res.send("Saved")
                });  
            }
        })
    }
    else if(req.body.action==="saveorginfo"){
        var orgid = uuidv4();
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var orgaddress = req.body.orgaddress
        var orgaddress2 = req.body.orgaddress2
        var orgcity = req.body.orgcity
        var orgstate = req.body.orgstate
        var orgemail = req.body.orgemail
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        var sql = "insert into videoplayer_t.orginfo(orgid, subscriptionid,orgname, mobileno,address1,address2,city,state,email,modifiedby,modifieddate,cardstatus) values('"+orgid+"','"+req.session.subid+"','"+nameorg+"', '"+phoneno+"','"+orgaddress+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"','"+req.session.userid+"','"+currentdate+"','Active')"
        vcon.query(sql,function(err,result1){
            //  console.log(sql)
            if(err)console.log(err)
                else if (result1.affectedrows>0)
                {
                    res.send("Information saved successfully")
                }else{
                    res.send("Information saved successfully")
                }  
        })
    }
    else if(req.body.action==="retriveorginfo"){
        var sql="select * from orginfo where subscriptionid='"+req.session.subid+"'";
        // console.log(sql)
        vcon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].orgname)
                arr.push(result[0].mobileno)
                arr.push(result[0].address1)
                arr.push(result[0].address2)
                arr.push(result[0].city)
                arr.push(result[0].state)
                arr.push(result[0].email)
                res.send(arr)
            }else{
                console.log("Orginfo error")
            }
        })
    }
    else if(req.body.action==="updateorg"){
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var uaddress = req.body.uaddress
        var uaddress2 = req.body.uaddress2
        var ucity = req.body.ucity
        var ustate = req.body.ustate
        var uemail = req.body.uemail
        var sql = "update orginfo set orgname='"+nameorg+"',mobileno='"+phoneno+"',address1='"+uaddress+"',address2='"+uaddress2+"',city='"+ucity+"',state='"+ustate+"',email='"+uemail+"'  where subscriptionid='"+req.session.subid+"'";
        vcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("error")
            }
        })
    }
    else if(req.body.action==="orgcolorvideoplayer"){
        var csscolor = req.body.csscolor
        var sql = "update videoplayer_t.orginfo set csscolor='"+csscolor+"'  where subscriptionid='"+req.session.subid+"'";
        vcon.query(sql,function(err,result){
        //    console.log(sql  +  ">>>>")
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("orginfo error")
            }
        })
    }
    else if (req.body.action === 'videoupload') {
        var size = req.body.size;
        var sql = "select subscriptions.quota, subscriptions.usedquota from subscriptions where subscriptionid like '" + req.session.subid + "'";
        mcon.query(sql, function (err, result) {
            //console.log(sql + "   .....")
            if (err) console.log(err)
            else if (result.length > 0) {
                let quota = 0, usedquota = 0;
                if (result[0].quota == null || result[0].quota == undefined || result[0].quota == "") {
                    quota = 0
                    console.log(quota + "  111111 quota")
                } else {
                    quota = result[0].quota;
                }
                if (result[0].usedquota == null || result[0].usedquota == undefined || result[0].usedquota == "") {
                    usedquota = 0
                } else {
                    usedquota = result[0].usedquota;
                }
                if (usedquota > quota) {
                    //console.log(usedquota >= quota + "  111 usedquota")
                    res.send("You have reached the maximum limit of file upload")
                } else if (size > quota) {
                    res.send("File size exceeds the allowed quota. Max size: " + quota)
                } else {
                    return new Promise((resolve, reject) => {
                        savefiledb(req,res,req.session.orgid,(successfun) => {
                            resolve(successfun);
                        });
                    }).then((data) => {
                        var videoname = req.body.videoname;
                        var playvideol = req.body.playvideol;
                        var duration = req.body.duration;
                        var formattedDuration = formatDuration(duration);
                        var currentDate = new Date();
                        currentDate = currentDate.getFullYear() + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentDate.getDate()).slice(-2)
                        var sql = "INSERT INTO programs(orgid, videoid, createdby, timecount, creatdate, videoname, seq,playlistid,playloop) VALUES('" + req.session.orgid + "','" + data + "','" + req.session.userid + "','" + formattedDuration + "','" + currentDate + "','" + videoname + "','1000','" + playvideol + "','1');";
                        vcon.query(sql, function (err, result) {
                            console.log(sql +" file upload")
                            if (err) console.log(err);
                            else if (result.affectedRows > 0) {
                                return new Promise((resolve, reject) => {
                                    gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
                                        resolve(successfun)
                                    });
                                }).then((data) => {
                                    res.send('Video uploaded Successfully')
                                })
                            } else {
                                console.log("something went wrong, please try after sometime.....");
                            }
                        });
                    });
                }
            }
        })
    }
    else if(req.body.action === 'retrivvideoplayer'){
        var videoid=req.body.videoid
        let path ="videoplay/"+req.session.orgid+"/"+videoid
        var sql="select videoid from programs where orgid like'"+req.session.orgid+"' and videoid='"+videoid+"' ";
        vcon.query(sql,function(err,result){
            console.log(sql +"  retriv video")
            if(err) console.log(err)
            else if(result.length>0){
                let fileid = result[0].videoid
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,result[0].videoid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                  //  console.log(data +" data123")
                    res.send(data)
                })
    
            }else{
                res.send("no file")
            }
        })    
    }
    else if (req.body.action === 'playVideo') {
        var videoid = req.body.videoid;
        var playlistid=req.body.playlistid;
        console.log(playlistid +" playlistid")
        let path = "videoplay/" + req.session.orgid;
        var sql = "select * from programs where orgid like'" + req.session.orgid + "' and videoid='" + videoid + "' and playlistid='"+playlistid+"'";
        vcon.query(sql, function (err, result) {
            console.log(sql +"playvideo")
            if (err) {
                console.log(err);
                res.send('error');
            } else if (result.length > 0) {
                // Check if video file exists in the specified path
                let videoFilePath = path + "/" + result[0].videoid;
                fs.access(videoFilePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        // Video file doesn't exist, retrieve it
                        return new Promise((resolve, reject) => {
                            retrivefile(req, res, result[0].videoid, path, req.session.orgid, (successfun) => {
                                resolve(successfun);
                            });
                        }).then((data) => {
                            res.send(data);
                        });
                    } else {
                        // Video file exists, directly play it
                        res.send('Video already exists, playing...');
                    }
                });
            } else {
                res.send('No Video');
            }
        });
    }
    else if (req.body.action === 'getvideolist'){
        var tbltext = '';
        var sql = "select videoid,videoname from programs where orgid like'" + req.session.orgid + "'";
        vcon.query(sql, function (err, result) {
            console.log(sql +" getvideolist")
            if (err) console.log(err)
            else if (result.length > 0){
                tbltext = "<table><tr><th>Video Name</th><th>Action</th></tr>";
                for (var i = 0; i < result.length; i++) {
                    var videoid = result[i].videoid;
                    var videoname=result[i].videoname;
                    tbltext = tbltext + "<tr><td>" + videoname + "</td><td><button onclick='retrivvideoplayer(\"" + videoid + "\");'>Retriv</button> <button onclick='playVideo(\"" + videoid + "\");'>Play</button></td></tr>";
                }
                tbltext += "</table>";
                res.send(tbltext);
            } else {
                res.send("no file");
            }
        });
    }
    else if (req.body.action === 'videolist'){
        var playlistid = req.body.playlistid;
        var tbltext = '';
        var sql = "SELECT videoid,playloop, videoname, seq FROM programs WHERE orgid LIKE '" + req.session.orgid + "' and playlistid='"+playlistid+"' ORDER BY seq DESC;"
        vcon.query(sql, function (err, result) {
        console.log(sql +"list")
            if (err) console.log(err)
            else if (result.length > 0){
                tbltext = "<table id='report' ><tr><th>Video Name</th><th>Loop</th><th colspan='5'>Action</th></tr>";
                for (var i = 0; i < result.length; i++){
                    var videoid = result[i].videoid;
                    var videoname=result[i].videoname;
                    var playloop=result[i].playloop;
                    tbltext = tbltext + "<tr><td>" + videoname + "</td><td>"+playloop+"</td><td><button title='play Video'  class='videolistbutton' onclick='playVideo(\"" + videoid + "\");'><img src='/static/image/playvideo.png' style='height:20px; width:20px;'/></button><button title='Change Video Position Up Side' class='videolistbutton' onclick='videouparrow(\"" + videoid + "\");'><img src='/static/image/uparrow.png' style='height:20px; width:20px;'/></button><button title='Change Video Position Down Side' class='videolistbutton' onclick='downarrow(\"" + videoid + "\");'><img src='/static/image/downarrow.png' style='height:20px; width:20px;'/></button><button title='Update Video Loop Value' class='videolistbutton' onclick=\"updatevideoinfo('" + videoid + "'); setVideoId('" + videoid + "');\"><img src='/static/image/updatev.png' style='height:20px; width:20px;'/></button><input type='hidden' id='videoidHidden' value='" + videoid + "'></td></tr>";
                }
                tbltext += "</table>";
                res.send(tbltext);
            } else {
                res.send("no file");
            }
        });
    }
    else if (req.body.action ==='videouparrow'){
        var videoid=req.body.videoid
        var sql="update programs set seq=seq+1 where orgid = '"+req.session.orgid+"'and videoid='"+videoid+"'";             
        vcon.query(sql, function (err, result) {
        console.log(sql +" -update up row")
            if (err) console.log(err)
            if(err)console.log(err)
                else if (result.affectedRows>0)
                {
                    res.send("Update Successfully")
                }else{
                    res.send("down error")
                }    
        })   
    }
    else if (req.body.action ==='downarrow'){
        var videoid=req.body.videoid
        var sql="update programs set seq=seq-1 where orgid = '"+req.session.orgid+"'and videoid='"+videoid+"'";             
        vcon.query(sql, function (err, result) {
            console.log(sql +"-update down row")
            if (err) console.log(err)
            if(err)console.log(err)
            else if (result.affectedRows>0)
            {
                res.send("Update Successfully")
            }else{
                res.send("down error")
            }    
        })   
    }
    else if (req.body.action === "playallvideo"){
        var playlistid = req.body.playlistid;
        var sql = "SELECT * FROM programs WHERE orgid='" + req.session.orgid + "' and playlistid='" + playlistid + "' ORDER BY seq DESC ";
        vcon.query(sql, function (err, result) {
            //console.log(sql + "   play ");
            if (err) console.log(err);
            else if (result.length > 0) {
                var videosToPlay = [];
                // Iterate through the result array
                result.forEach(video => {
                    // Get the loop count for each video
                    var loopCount = video.playloop;
                    var timecount=result[0].timecount;
                    // Add the video to the playlist array based on its loop count
                    for (var i = 0; i < loopCount; i++) {
                        videosToPlay.push(video.videoid);
                    }
                });
                res.send({ videos: videosToPlay, orgid: req.session.orgid ,});
            } else {
                console.log("error");
                res.send("");
            }
        });
    }
    else if(req.body.action ==="videoduration") {
        var videoid=req.body.videoid;
        var sql = "select * from programs where orgid='" + req.session.orgid + "' and videoid='"+videoid+"'";
        vcon.query(sql, function (err, result) {
            console.log(sql + "   play ");
            if (err) console.log(err);
            else if (result.length > 0) {
                    var timecount=result[0].timecount
                    //console.log(valuestyle)
                    //console.log(playloop)
                    //console.log(timecount)
                res.send(timecount);
            } else {
                console.log("error");
                res.send("");
            }
        });
    }
   else if(req.body.action === "playvideoloop") {
        var videoid = req.body.videoid;
        let path = "videoplay/"+req.session.orgid;
        var sql = "select * from programs where orgid like'" + req.session.orgid + "' and videoid='" + videoid + "'";
        vcon.query(sql, function (err, result) {
           // console.log(sql +"sql")
            if (err) {
                console.log(err);
                res.send('error');
            } else if (result.length > 0) {
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,result[0].videoid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                })
            } else {
                res.send('No Video');
            }
        });
    }
    else if(req.body.action==="searchstaff"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if (req.body.action === "assignstaff") {
        var addposition = req.body.addposition;
        var username = req.body.username;
        var useremail = req.body.useremail;
        var contactno = req.body.usermobilenumber;
    
        if (!username || !useremail || !contactno || addposition === 'select' || addposition === 'null' || !addposition) {
            var missingField;
    
            if (!contactno) missingField = "Mobile number";
            else if (!username) missingField = "User Name";
            else if (!useremail) missingField = "User Email";
            else if (!addposition) missingField = "Position";
            else if (addposition) missingField = "Position";
    
            res.send("Please fill the " + missingField + " field.");
            return;
        } else {
            mcon.query("SELECT * FROM users WHERE mobile = '" + contactno + "'", function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result.length > 0) {
                    var userid = result[0].userid;
                    vcon.query("SELECT * FROM staff WHERE userid='" + userid + "' AND orgid <> '" + req.session.orgid + "'", function (err, existingUserResult) {
                        if (err) {
                            console.log(err);
                        } else if (existingUserResult.length > 0) {
                            res.send("User already exists in another organization");
                        } else {
                            mcon.query("SELECT * FROM subscriptions WHERE userid='" + userid + "' AND moduleid=20", function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else if (results.length > 0) {
                                    res.send("User Has Subscription For This Module");
                                } else {
                                    var sql1 = "SELECT * FROM usermaster_t.users WHERE mobile='" + req.body.usermobilenumber + "'";
                                    mcon.query(sql1, function (err, result1) {
                                        if (err) {
                                            console.log(err);
                                        } else if (result1.length > 0) {
                                            var userid = result1[0].userid;
                                            //var userProjectsQuery = "SELECT projectid, position FROM orgusers WHERE userid = '" + userid + "'";
                                            //trcon.query(userProjectsQuery, function (err, userProjectsResult) {
                                                // if (err) {
                                                //     console.log(err);
                                                // } else {
                                                //     var userAlreadyAdded = false;
                                                //     for (var i = 0; i < userProjectsResult.length; i++) {
                                                //         var existingProjectId = userProjectsResult[i].projectid;
                                                //         var existingPosition = userProjectsResult[i].position;
    
                                                //         if (existingProjectId != projectid && existingPosition != addposition) {
                                                //             // User is already added to a different project with a different position
                                                //             userAlreadyAdded = true;
                                                //             break;
                                                //         }
                                                //     }
                                                    // if (userAlreadyAdded) {
                                                    //     res.send("User already assigned to another project with a different position");
                                                    // } else {
                                                        vcon.query("SELECT * FROM staff WHERE userid='" + userid + "' AND orgid = '" + req.session.orgid + "' AND position = '" + addposition + "'", function (err, duplicateCheckResult) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else if (duplicateCheckResult.length > 0) {
                                                                res.send("User is already assigned to this position in the organization");
                                                            } else {
                                                                // Proceed with the insertion since no duplicate is found
                                                                var sql = "INSERT INTO staff (orgid,userid, position,uname ,uemail,ucontactno) VALUES('" + req.session.orgid + "','" + userid + "','" + addposition + "','" + username + "','" + useremail + "','" + contactno + "')";
                                                                vcon.query(sql, function (err, result) {
                                                                    //console.log(sql);
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else if (result.affectedRows > 0) {
                                                                        res.send("Assign staff");
                                                                    } else {
                                                                        res.send("Assign staff");
                                                                    }
                                                                });
                                                            }
                                                        });
                                                        
                                                   // }
                                               // }
                                          //  });
                                        } else {
                                            res.send("user is already added with a different position");
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    res.send("Number is not registered in calendaree.com");
                }
            });
        }
    }
    else if(req.body.action==="showstaffreportv"){
        var tbltext = ""
        var sql="select * from videoplayer_t.staff where orgid='"+req.session.orgid+"'";
        vcon.query(sql,function (err,result){
            //console.log(sql)
            if(err)console.log(err)
            else if(result.length>0){ 
                 tbltext = "<table id='report'><tr><th style='width:150px'>Name</th><th style='width:150px'>Contact No</th><th style='width:150px'>Position</th><th>Delete Staff</th></tr>"
                for(var i=0;i<result.length;i++){
                        var name =result[i].uname;
                        var contactno = result[i].ucontactno;
                        var position = result[i].position;
                        tbltext=tbltext+"<tr><td>"+name+"</td><td>"+contactno+"</td><td>"+position+"</td><td button class='qbt' onclick=deletestaffinfo('"+result[i].userid+"');><img src='/static/image/trash.png' style='width:22px;'/></button></td></tr>"
                    }
                    tbltext=tbltext+"</table>"
                    
                    res.send(tbltext)
                }else{
                    res.send("No Record")
                }
        })

    } 
    else if(req.body.action==="deletestaffinfo"){
        var userid = req.body.userid;
        var sql = "DELETE FROM videoplayer_t.staff WHERE userid ='"+userid+"' and orgid='"+req.session.orgid+"';"
        vcon.query(sql,function(err,result1){
            //console.log(sql)
               if(err) console.log(err)
               else{
                       res.send("Staff Deleted")
               }
           })    
       }  
    else if(req.body.action==="retrivloopvalue"){
        var videoid=req.body.videoid;
        var sql="select * from programs where videoid='"+videoid+"';"
        vcon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].playloop)
                //console.log(arr)
                res.send(arr)
            }
        })
    }    
    else if(req.body.action==="showvideotime"){
        var videoid = req.body.videoid
        var sql="select * from videoplayer_t.programs where videoid='"+videoid+"'";
        vcon.query(sql,function(err,result){
            //console.log(sql)
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].timecount)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if (req.body.action === "playvideoontime") {
        var videoid = req.body.videoid;
        var setPlaytime = req.body.setPlaytime;
        let path = "videoplay/" + req.session.orgid;
        var sql = "SELECT * FROM videoplayer_t.programs WHERE videoid='" + videoid + "'";
        vcon.query(sql, function (err, result) {
            if (err) {
            console.log(err);
            res.send('error');
            }else if (result.length > 0) {
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,result[0].videoid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                    //console.log(data +"mmm")
                })
            } else {
            res.send('No Video');
            }
        });
    }
 // video setting 
    else if (req.body.action === 'playlistadd') {
        var playlistname = req.body.playlistname;
        var playlistid = uuidv4();
        if (!playlistname || playlistname.trim() === '') {
            res.send("Play List name cannot be null or empty.");
            return;
        }
        var checkDuplicateSql = "SELECT COUNT(*) AS playlistname_count FROM playlist WHERE orgid = '" + req.session.orgid + "' AND playlistname = '" + playlistname + "'";
        vcon.query(checkDuplicateSql, function (err, result) {
            //console.log(checkDuplicateSql)
            if (err) {
            console.log(err);
            res.send("An error occurred.");
            } else {
            if (result[0].playlistname_count > 0) {
                res.send("Duplicate playlist name. playlist name already exists.");
                }else {
                    var insertSql = "INSERT INTO playlist(playlistid,orgid, playlistname) VALUES('" +playlistid+ "','"+req.session.orgid+"', '" + playlistname + "')";
                    vcon.query(insertSql, function (err, result) {
                    //console.log(insertSql)
                    if (err) {
                        console.log(err);
                        res.send("An error occurred while inserting the status.");
                        } else if (result.affectedRows > 0) {
                            res.send("Play List Added");
                        } else {
                            res.send("Insert failed.");
                        }
                    })
                }
            }
        })
    }
    else if(req.body.action==='retriveplaylist'){
        var sql="select * from playlist where orgid = '"+req.session.orgid+"';"
        vcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"playlistname":"'+result[i].playlistname+'","playlistid":"'+result[i].playlistid+'"}')
                }
            // console.log(r)
                res.send(r)
            }else{
                res.send("retrive status error")
            }
        })
    }
    else if (req.body.action === 'retrivevideol') {
        var sql = "SELECT * FROM playlist WHERE orgid = '" + req.session.orgid + "'";
        vcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
            else if (result.length > 0){
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"playlistname":"' + result[i].playlistname + '","playlistid":"' + result[i].playlistid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if (req.body.action ==='updatevideoinformation'){
        var videoid=req.body.videoid;
        var playloopnumber =req.body.playloopnumber;
        var playvideotime =req.body.playvideotime;
        var sql="update programs set playloop='"+playloopnumber+"',playtime='"+playvideotime+"' where orgid = '"+req.session.orgid+"'and videoid='"+videoid+"'";             
        vcon.query(sql, function (err, result) {
        // console.log(sql)
            if (err) console.log(err)
            if(err)console.log(err)
                else if (result.affectedRows>0)
                {
                    res.send("Update Successfully")
                }else{
                    res.send("down error")
                }    
        })   
    }
    // account status video player
    else if(req.body.action === "getaccountdetailsvideo"){
        var sql ="select * from subscriptions where userid='" + req.session.userid + "' and moduleid=20";
        console.log(sql +" -Account status ") 
        mcon.query(sql, function(err, results){
            if(err) console.log(err) 
            
            else{
                var date_ob = new Date();
                let acc=[];
                let date = new Date(results[0].enddate)
                var diff = date.getTime() - date_ob.getTime()  
                var daydiff = diff / (1000 * 60 * 60 * 24)
                if(daydiff>0){
                    acc.push("Active")
                    let days = Math.round(daydiff)
                    acc.push(days)
                }
                else{
                    acc.push("deactive")
                    let days = 0
                    acc.push(days)
                }
                acc.push(results[0].startdate);
                acc.push(results[0].enddate);
                acc.push(results[0].usedquota);
                acc.push(results[0].quota)
                res.send(acc);
            }       
        })
    }
// delete 
    else if (req.body.action === "deleteplaylist") {
    console.log( "hello ")
        var playlistid = req.body.showplaylistname;
        var sql = "DELETE FROM videoplayer_t.playlist WHERE orgid='" + req.session.orgid + "' AND playlistid='" + playlistid + "'";
        vcon.query(sql, function (err, resultStatus) {
            console.log(sql +" - delete")
            if (err) {
                console.log(err);
            } else {
                res.send(" Play List Deleted")
            }
        });
    }
});
function convertTimeToSeconds(timeString) {
    var [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}
function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = Math.round(seconds % 60);
    return (
        (hours < 10 ? '0' : '') + hours +
        ':' +
        (minutes < 10 ? '0' : '') + minutes +
        ':' +
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds
    );
}
//////// M.L.M module ////////////////
app.get("/1/mlm",async(req, res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }else{
            var admin = 0;
            var started = 0;
            var substatus = 0;
             var orgcolor=" ";
            var sqla="select * from usermaster_t.subscriptions where userid='"+req.session.userid+"' and moduleid='21'";
             console.log("sqla     "+sqla)
            mcon.query(sqla,(err,result)=>{
            if(err) console.log(err)
                else if(result.length>0){
                    admin = 1;
                    req.session.admin = admin
                    req.session.subid = result[0].subscriptionid;
                }else{
                    admin= 0;
                }
                    var sql="select * from mlm_t.orginfo where subscriptionid='"+req.session.subid+"' ";
                   console.log("sql......."+sql)
                    nmcon.query(sql, (err, result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        console.log("one")
                        started = 1;                     
                        req.session.orgid = result[0].orgid;
                        console.log(req.session.orgid  )
                    } else {
                        started = 0;
                       // console.log("two")
                    }
                    nmcon.query("select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in (select orginfo.subscriptionid  from mlm_t.orginfo  where orgid like '"+req.session.orgid+"')",function(err,result){
                    if(err)console.log(err)
                    else if(result.length>0){
                        var enddate = result[0].enddate
                        let date1 = new Date()
                        const diffTime = enddate.getTime() - date1.getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        if(diffDays>0){
                                substatus = 1;
                        }else{
                                substatus = 0;    
                        } 
                    } 
                    var sql="select * from mlm_t.orginfo where orgid='"+req.session.orgid+"' ";
                        console.log("sql......."+sql)
                        nmcon.query(sql, (err, result)=>{
                            if(err) console.log(err)
                            else if (result.length>0) {
                                //console.log("one")
                                req.session.orgcolor = result[0].csscolor;                   
                                orgcolor=req.session.orgcolor;
                                if(orgcolor == 'undefined' || orgcolor == null || orgcolor == 'null' || orgcolor == undefined || orgcolor == 'NaN-aN-aN'){
                                    orgcolor='style'
                                }
                                //console.log(req.session.orgid +"orgid")
                            } else {
                                orgcolor = 0;
                                //console.log("two")
                            }                         
                            res.render("mlm.pug",{userid: req.session.userid,username: req.session.username,admin:admin,started:started,substatus:substatus,orgcolor});
                            console.log("mlm.pug",{userid:req.session.userid,username: req.session.username,admin:admin,started:started,substatus:substatus,orgcolor});           
                    })        
                }) 
            })
        })
    }
});
const mlmmulter = multer.diskStorage({
    destination: (req, file, cb) => {
        if (fs.existsSync("./userdata/mlmuploadcsv/"+req.session.userid)){
            console.log("exists")                
        }
        else{
            fs.mkdir("./userdata/mlmuploadcsv/"+req.session.userid, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("New directory successfully created.")
                }
            })
        }
        cb(null,"./userdata/mlmuploadcsv/"+req.session.userid);
     },
    filename: (req, file, cb) => {                              
        //const fileExtension = file.originalname;//name of file
        const fileExtension = req.session.userid+'.csv';//name of file
        // console.log(req.session.fileExtension+ ' file upload ' + req.session.userid)
        cb(null, fileExtension);
    },
    })
   const uploadcsv = multer({
    storage: mlmmulter,
    limits: { fileSize: 2097152 }
}).single('csv'); 
app.post("/uploadbankcsv", (req, res) => {
    var admin = 1;
    var started = 1;
    console.log(admin + "-admin " + started + " - started")
    uploadcsv(req, res, (err) => {
        if (err) {
            console.log(err)
            res.send('bigfile')
        } else {
            res.render("mlm.pug", { admin: admin, started: started, userid: req.session.userid });
        }
    });
});
app.post("/1/mlm",up,async (req,res)=>{
    if(!req.session.userid){
        res.send("sessionexpired")
        // res.redirect("/1/login")
    }else if(req.body.action==="subscribem"){
        var startdate = new Date();
        var subscribeidnew = uuidv4();
        var currentdate = startdate.getFullYear()+'-'+("0" + (startdate.getMonth() + 1)).slice(-2)+'-'+("0" + startdate.getDate()).slice(-2) +" "+startdate.getHours()+':'+startdate.getMinutes()+':'+startdate.getSeconds();
        var days =3;
        let newDate = new Date(Date.now()+days*24*60*60*1000);
        let ndate = ("0" + newDate.getDate()).slice(-2);
        let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
        let nyear = newDate.getFullYear();   
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        let seconds = newDate.getSeconds();       
        let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds 
        mcon.query("select * from subscriptions where userid='"+req.session.userid+"' and moduleid=21", function(err, result){
            if(err) console.log(err);
            else if(result.length > 0){
                res.send("used")
            }else{
            var sql2 = "insert into subscriptions(userid, subscriptionid, moduleid, startdate, enddate,isprimary ) values('"+req.session.userid+"','"+subscribeidnew+"',21,'"+currentdate+"','"+nextdate+"','yes')"
                    mcon.query(sql2, function(err, data){
                        //console.log(sql2)
                        if (err) throw err;
                        res.send("Saved")
                    });   
            }
        })
    }
    else if(req.body.action==="saveorginfom"){
        var orgid = uuidv4();
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var orgaddress = req.body.orgaddress
        var orgaddress2 = req.body.orgaddress2
        var orgcity = req.body.orgcity
        var orgstate = req.body.orgstate
        var orgemail = req.body.orgemail
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        var sql = "insert into orginfo (subscriptionid, orgid,orgname, orgmobileno,address,address1,city,state,email,modifiedby,modifieddate,cardstatus) values('"+req.session.subid+"','"+orgid+"','"+nameorg+"', '"+phoneno+"','"+orgaddress+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"','"+req.session.userid+"','"+currentdate+"','Active')"
        nmcon.query(sql,function(err,result1){
            //console.log(sql    +"  000")
            if(err)console.log(err)
            else if (result1.affectedrows>0)
            {
                res.send("data insert")
            }else{
                res.send("Information saved successfully")
            }   
        })
    }
    else if(req.body.action==="retriveorginfo"){
        var sql="select * from orginfo where subscriptionid='"+req.session.subid+"'";
        nmcon.query(sql,function (err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].orgname)
                arr.push(result[0].orgmobileno)
                arr.push(result[0].address)
                arr.push(result[0].address1)
                arr.push(result[0].city)
                arr.push(result[0].state)
                arr.push(result[0].email)
                res.send(arr)
            }else{
                console.log("error")
            }
        })
    }
    else if(req.body.action==="updateorg"){
        var nameorg = req.body.nameorg
        var phoneno = req.body.phoneno
        var uaddress = req.body.uaddress
        var uaddress1 = req.body.uaddress1
        var ucity = req.body.ucity
        var ustate = req.body.ustate
        var uemail = req.body.uemail
        var sql = "update orginfo set orgname='"+nameorg+"',orgmobileno='"+phoneno+"',address='"+uaddress+"',address1='"+uaddress1+"',city='"+ucity+"',state='"+ustate+"',email='"+uemail+"'  where subscriptionid='"+req.session.subid+"'";
        nmcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.affectedRows>0){
                res.send("updated successfully")
            }else{
                res.send("error")
            }
        })
    }
    //mlm orgcolor
    else if(req.body.action==="orgcolormlm"){
        var csscolor = req.body.csscolor
        var sql = "update mlm_t.orginfo  set csscolor='"+csscolor+"'  where subscriptionid='"+req.session.subid+"'";
        nmcon.query(sql,function(err,result){
           console.log(sql  +  ">>>>")
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("orginfo error")
            }
        })
    }
    else if (req.body.action === 'retrivebgstylecolormlm') {
        var sql = "select * from usermaster_t.bgstyle ";
        mcon.query(sql, function(err, result) {
            // console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"name":"' + result[i].name + '","filename":"' + result[i].filename + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    // else if(req.body.action==="retrivorgcolormlm"){
    //     var sql="select * from mlm_t.orginfo where orgid='"+req.session.orgid+"';"
    //         nmcon.query(sql,function (err,result){
    //         // console.log(sql)
    //         if(err)console.log(err)
    //             else if(result.length>0){
    //                 var arr=[];
    //                 arr.push(result[0].csscolor)
    //             res.send(arr)
    //         }else{
    //             res.send(" ")
    //         }
    //     })
    // }
    //mlm logo upload code 
    else if(req.body.action==='mlmlogou'){
        return new Promise((resolve, reject) => {
            savefiledb(req,res,req.session.orgid,(successfun) => {
                resolve(successfun);
            });
        }).then((data)=>{
            nmcon.query("UPDATE orginfo SET logoid ='"+data+"' where orgid='"+req.session.orgid+"'" , function(err,result){
                if(err) console.log(err);
                else if(result.affectedRows>0){
                    res.send('successful')
                }else{
                    console.log("something went wrong please try after sometime.....")
                }
            })
        })   
    }
    else if(req.body.action === 'getlogomlm'){
        let path ="mlmlogo"+"/"+req.session.orgid
        nmcon.query("select logoid from orginfo where orgid like'"+req.session.orgid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let fileid = result[0].logoid
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                })

            }else{
                res.send("no file")
            }
        })    
    }
    // mlm setting //
    else if(req.body.action==="saveplan"){
        var planid = uuidv4();
        var planname = req.body.newplanadd
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        var sql1 = "SELECT COUNT(*) AS count FROM plan WHERE orgid='"+req.session.orgid+"' and planname = '" + planname + "'";
        nmcon.query(sql1, function (checkErr, checkResult) {
            console.log(sql1 +"  show plans ")
            if (checkErr) {
            
                res.send("error");
            } else {
                var plannametCount = checkResult[0].count;

                if (plannametCount > 0) {
                    res.send("Plan name already exists. Please choose a different name.");
                } else {
                var sql = "insert into plan (orgid, planname,createddate, createdby,planid) values('"+req.session.orgid+"','"+planname+"','"+currentdate+"', '"+req.session.userid+"','"+planid+"')";
                nmcon.query(sql,function(err,result1){
                    //console.log(sql    +"  sql")
                    if(err)console.log(err)
                        else if (result1.affectedrows>0)
                        {
                            res.send("Information saved successfully")
                        }else{
                            res.send("Information saved successfully")
                        }   
                    })
                }
            }
        })
    }
    else if(req.body.action==='retrivplan'){
        var sql="select * from plan where orgid = '"+req.session.orgid+"';"
        nmcon.query(sql,function(err,result){
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"planname":"'+result[i].planname+'","planid":"'+result[i].planid+'"}')
                }
                res.send(r)
            }else{
                res.send("retrive status error")
            }
        })
    }
    else if (req.body.action === 'retriveplanname') {
        mobileno=req.body.mobileno;
        var sql = "select * from plan where orgid = '"+req.session.orgid+"';"
        nmcon.query(sql, function(err, result) {
            if (err) console.log(err,);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"planname":"' + result[i].planname + '","planid":"' + result[i].planid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if (req.body.action === 'retriveplanname1') {
        var sql = "select * from plan where orgid = '"+req.session.orgid+"';"
        nmcon.query(sql, function(err, result) {
            if (err) console.log(err,);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"planname":"' + result[i].planname + '","planid":"' + result[i].planid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if (req.body.action === 'retriveplanname2') { 
        var sql = "select * from plan where orgid = '"+req.session.orgid+"';"
        nmcon.query(sql, function(err, result) {
            if (err) console.log(err,);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"planname":"' + result[i].planname + '","planid":"' + result[i].planid + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action === "savelevelvalues") {
        var level = req.body.level;
        var share = req.body.share;
        var planid = req.body.planid;
        if (!level || !share || level === 'Select Level' || planid === 'Plan Name') {
            res.send("Please provide values for all required fields");
            return;
        }
        var sql1 = "SELECT * FROM plandetails WHERE planid ='"+planid+"' AND levels ='"+level+"' AND orgid ='"+req.session.orgid+"'";
        nmcon.query(sql1, function(err, results) {
            if (err) {
                console.error(err);
                res.send("Error occurred while checking existing values");
                return;
            }
            if (results.length > 0) {
                res.send("This Level Already Has Share Values");
            } else {
                var sql = "INSERT INTO plandetails (orgid, planid, levels, share) VALUES ('"+req.session.orgid+"','"+planid+"','"+level+"','"+share+"')";
                nmcon.query(sql,function(err, result) {
                    if (err) {
                        console.error(err);
                        res.send("Error occurred while inserting data");
                        return;
                    }
                    if (result.affectedRows > 0) {
                        res.send("Information saved successfully");
                    } else {
                        res.send("Failed to Insert Data");
                    }
                });
            }
        });
    }
    else if(req.body.action==="searchmember"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if (req.body.action === "savemember") {
        var refrenceid = req.body.userid2;
        var membername1 = req.body.membername1;
        var memberemail = req.body.memberemail;
        var bankname = req.body.bankname;
        var ifsccode = req.body.ifsccode;
        var bankaccountno = req.body.bankaccountno;
        var membernumber = req.body.membernumber;
        var showplan = req.body.showplan;
        var invoiceno = req.body.invoiceno;
        var refrencename = req.body.refrencename;
        var refrenceemail = req.body.refrenceemail;
        var refrenceno = req.body.refrenceno;
        var amount = req.body.amount;
        console.log(refrenceid+" refrenceid" + membername1+" membername1" +memberemail+" memberemail" + bankname+ " bankname" + ifsccode+ " ifsccode" +bankaccountno + " bankaccountno" + membernumber + " membernumber" + showplan + " showplan" +invoiceno + " invoiceno" + refrencename + " refrencename" + refrenceemail+" refrenceemail" + refrenceno + " refrenceno"+ amount+" amount")
        if (!refrenceid || !membername1 || !memberemail || !bankname || !ifsccode || !bankaccountno || !membernumber || !showplan ||  showplan === 'Plan Name' || !invoiceno || !refrencename || !refrenceemail || !refrenceno || !amount) {
            res.send("Please provide values for all required fields");
            return;
            }
            var cdate = new Date();
            cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + ('0' + cdate.getSeconds()).slice(-2);
            // Check if the reference ID is present in the memberid column
            var sql = "SELECT * FROM member WHERE orgid='"+req.session.orgid+"' and memberid = '" + refrenceid + "'";
            nmcon.query(sql, function (err, existingResult) {
                console.log( sql +" ..checkExistingSQL")
                if (err) {
                    console.log(err);
                } else if (existingResult.length > 0) {
                    // If reference ID is present, check if the user is registered
                    var sql1 = "SELECT * FROM users WHERE mobile = '" + membernumber + "'";
                    mcon.query(sql1, function (err, userResult) {
                    if (err) {
                        console.log(err);
                    } else if (userResult.length > 0) {
                        var userid = userResult[0].userid;
                        var sqlCheck = "SELECT * FROM mlm_t.member WHERE orgid=? AND memberid=?";
                        nmcon.query(sqlCheck, [req.session.orgid, userResult[0].userid], function(err, result) {
                            console.log(sqlCheck + " vvvvvvvvv");
                            if (err) {
                                console.log(err);
                                res.send("An error occurred");
                            } else {
                                if (result.length > 0) {
                                    res.send("User already exists in this organization");
                                } else {
                                    var sqlInsert = "INSERT INTO member (membername, memberid, orgid, membermobileno, referenceid, memberemailid, bankname, ifsccode, bankaccountno, planid, createddatetime, amount, invoicenumber, invoicedate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                    var values = [membername1, userResult[0].userid, req.session.orgid, membernumber, refrenceid, memberemail, bankname, ifsccode, bankaccountno, showplan, cdate, amount, invoiceno, cdate];
                                    nmcon.query(sqlInsert, values, function(err, result1) {
                                        console.log(sqlInsert + "  ....sql4444");
                                        if (err) {
                                            console.log(err);
                                            res.send("An error occurred");
                                        } else {
                                            res.send("Information saved successfully");
                                        }
                                    });
                                }
                            }
                        })
                       // If user is registered, insert into member table
                                                        
                    } else {
                        var userid3 = uuidv4();
                        var sql4 = "INSERT INTO users (userid, name, password, mobile, email) VALUES ('" + userid3 + "','" + membername1 + "','" + membernumber + "','" + membernumber + "','" + memberemail + "')";
                        mcon.query(sql4, function (err, result7) {
                            console.log(sql4 + "  000sql1");
                            if (err) {
                                console.log(err);
                            } else if (result7.affectedRows > 0) {
                                // Once user is registered, insert into member table
                                var userid = userid3;
                                var sql5 = "INSERT INTO member (membername, memberid, orgid, membermobileno, referenceid, memberemailid, bankname, ifsccode, bankaccountno, planid, createddatetime,amount, invoicenumber, invoicedate) VALUES ('" + membername1 + "','" + userid + "','" + req.session.orgid + "','" + membernumber + "','" + refrenceid + "','" + memberemail + "','" + bankname + "','" + ifsccode + "','" + bankaccountno + "','" + showplan + "','" + cdate + "','"+amount+"','" + invoiceno + "','" + cdate + "')";
                                nmcon.query(sql5, function (err, result8) {
                                    console.log(sql5 + "  8998sql");
                                    if (err) {
                                        console.log(err);
                                    } else if (result8.affectedRows > 0) {
                                        res.send("Information saved successfully");
                                    } else{
                                        res.send("Information saved successfully");
                                    } 
                                });
                            }
                        });
                    }
                });
            } else {
                console.log(req.session.userid + "admin")
                if(req.session.userid==refrenceid)
                {
                // If reference ID is not present, insert into member table and check if user is registered
                var sql6 = "INSERT INTO member (membername, memberid, orgid, membermobileno,memberemailid,createddatetime) VALUES ('" + refrencename + "','" + refrenceid + "','" + req.session.orgid + "','" + refrenceno + "','" + refrenceemail + "','" + cdate + "')";
                nmcon.query(sql6, function (err, result3) {
                    console.log(sql6 + "  ....sql3333");
                    if (err) {
                    console.log(err);
                    }else if (result3.affectedRows > 0) {
                        // Check if user is registered
                        var sql7 = "SELECT * FROM users WHERE mobile = '" + membernumber + "'";
                        mcon.query(sql7, function (err, userResult) {
                            if (err) {
                                console.log(err);
                            } else if (userResult.length > 0) {
                                var userid = userResult[0].userid;
                                // If user is registered and not in the current organization, insert into member table
                                var sql9 = "INSERT INTO member (membername, memberid, orgid, membermobileno, referenceid, memberemailid, bankname, ifsccode, bankaccountno, planid, createddatetime,amount, invoicenumber, invoicedate) VALUES ('" + membername1 + "','" + userResult[0].userid + "','" + req.session.orgid + "','" + membernumber + "','" + refrenceid + "','" + memberemail + "','" + bankname + "','" + ifsccode + "','" + bankaccountno + "','" + showplan + "','" + cdate + "','"+amount+"','" + invoiceno + "','" + cdate + "')";
                                nmcon.query(sql9, function (err, result1) {
                                    console.log(sql9 + "  ....sql4444");
                                    if (err) {
                                        console.log(err);
                                        res.send("Error inserting data");
                                    } else if (result1.affectedRows > 0) {
                                        res.send("Information saved successfully");
                                    }else{
                                        res.send("Information saved successfully");
                                    }  
                                });
                            } else {
                                // res.send("First User Register Please")
                                // If user is not registered, insert into users table first
                                var userid4 = uuidv4();
                                var sql10 = "INSERT INTO users (userid, name, password, mobile, email) VALUES ('" + userid4 + "','" + membername1 + "','" + membernumber + "','" + membernumber + "','" + memberemail + "')";
                                mcon.query(sql10, function (err, result7) {
                                    console.log(sql10 + "  000sql1");
                                    if (err) {
                                        console.log(err);
                                    } else if (result7.affectedRows > 0) {
                                        // Once user is registered, insert into member table
                                        var userid = userid4;
                                        var sql11 = "INSERT INTO member (membername, memberid, orgid, membermobileno, referenceid, memberemailid, bankname, ifsccode, bankaccountno, planid, createddatetime,amount, invoicenumber, invoicedate) VALUES ('" + membername1 + "','" + userid + "','" + req.session.orgid + "','" + membernumber + "','" + refrenceid + "','" + memberemail + "','" + bankname + "','" + ifsccode + "','" + bankaccountno + "','" + showplan + "','" + cdate + "','"+amount+"','" + invoiceno + "','" + cdate + "')";
                                        nmcon.query(sql11, function (err, result8) {
                                            console.log(sql11 + "  8998sql");
                                            if (err) {
                                                console.log(err);
                                            } else if (result8.affectedRows > 0) {
                                                res.send("Information saved successfully");
                                            }else{
                                                res.send("Information saved successfully");
                                            }  
                                        });
                                    }
                                });
                            }
                        });
                    }
                    
                });
            }else{
                res.send("Please Select Correct Refrance Number")
            }
            }
        });
    }
    //profilepic save mlm
    else if(req.body.action==='uploadprofilepic'){
        var userid3=req.body.userid3;
        return new Promise((resolve, reject) => {
            savefiledb(req,res,req.session.orgid,(successfun) => {
                resolve(successfun);
            });
        }).then((data)=>{
            var sql = "update member SET memberpicid ='"+data+"' where orgid='"+req.session.orgid+"' and memberid='"+userid3+"'";
            nmcon.query(sql , function(err,result){
                console.log(sql + " upload pic")
                if(err) console.log(err);
                else if(result.affectedRows>0){
                    res.send('successful')
                }else{
                    res.send("something went wrong please try after sometime.....")
                }
            })
        })   
    }

    else if(req.body.action === 'getprofilepicmlm'){
        var userid3= req.body.userid3;
        let path ="mlmprofilepic"+"/"+req.session.orgid
        nmcon.query("select memberpicid from member where orgid='"+req.session.orgid+"' and memberid='"+userid3+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let fileid = result[0].memberpicid
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                })
    
            }else{
                res.send("no file")
            }
        })    
    }

    else if(req.body.action==="searcrefrence"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            // console.log(sql + " -search refranse ")
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if(req.body.action==="showmemberreport"){
        var planid = req.body.planid
        var refrenceid =req.body.refrenceid;
        var tbltext ="";
        var sql ="SELECT * FROM mlm_t.member  WHERE  memberid='"+refrenceid+"' and orgid='"+req.session.orgid+"';"
        //    var sql ="SELECT * FROM mlm_t.member a, plan b, plandetails c WHERE a.planid=b.planid and b.planid=c.planid AND memberid='"+refrenceid+"' and c.levels = '1';" 
        nmcon.query(sql,async  function (err,result){
            console.log(sql +" 111..........")
            if(err)console.log(err)
            else if(result.length>0){ 
                var thread1 = "<table id='report' style='width:100%;  align-self: center;'><tr><th style='width:180px'>Name</th><th style='width:150px'>Contact No</th><th> Levels</th><th>Amount</th><th>share %</th><th>share</th></tr>"
                var totalAmount=0;
                for(var i=0;i<result.length;i++){
                        var membername =result[i].membername;
                        if(membername == 'undefined' || membername == undefined || membername == 'null' || membername == null){
                            membername = ''
                        }
                        var membermobileno = result[i].membermobileno;
                        if(membermobileno == 'undefined' || membermobileno == undefined || membermobileno == 'null' || membermobileno == null){
                            membermobileno = ''
                        }
                        var memberid = result[i].memberid;
                        
                        var planid=result[i].planid;
                        
                        var orgid=req.session.orgid;
                        var amount =result[i].amount;
                        if(amount == 'undefined' || amount == undefined || amount == 'null' || amount == null){
                            amount = ''
                        }
                        var totalIncome = 0;
                        var amt=0;
                        
                        tbltext="<tr><td  style='text-align: left;'>"+membername+"</td><td>"+membermobileno+"</td><td>Admin</td><td>"+amount+"</td><td></td><td></td></tr>"
                    // console.log(tbltext +"  @@@")
                    var { tbltext, amt: totalAmount } = await getchildlevel(tbltext, memberid, req.session.orgid, "&nbsp;&nbsp;&nbsp;&nbsp;", 1, totalIncome, amt);
                            
                    }
                    tbltext += "<tr><td colspan='4' style='text-align: right; font-size:17px;'>Total:</td><td  id='totalamountid'  colspan='2'>" + totalAmount + "</td><input type='hidden' id='refidHidden' value='" + refrenceid + "'></tr>";
                    var sql1="update member set totalshare='"+totalAmount+"' where memberid='"+refrenceid+"' and orgid='"+req.session.orgid+"'";
                    nmcon.query(sql1, function(err,result1){
                    // console.log(sql1 +" data update")
                    if(err)console.log(err)
                    else if (result1.affectedRows > 0) {
                        tbltext = thread1 + tbltext;
                        res.send(tbltext);
                        //res.send("Data update.");
                    }else{
                        res.send("Insert failed.");
                    }
                
                })
                }else{
                    res.send("No Record")
                }
        })
    }
    else if(req.body.action==="serchmember"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            console.log(sql +"  search member")
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if(req.body.action==="showplaninfo"){
        var planid = req.body.planid
        var tbltext = ""
        var sql="select * from mlm_t.plandetails where orgid='"+req.session.orgid+"' and planid='"+planid+"' ";
        nmcon.query(sql,async  function (err,result){
            console.log(sql + " show all plans ")
            if(err)console.log(err)
            else if(result.length>0){ 
                var tbltext = "<table id='report'><tr><th style='width:150px'>Levels</th><th style='width:150px'>share</th></tr>"
                for(var i=0;i<result.length;i++){
                        var share =result[i].share;
                        var levels = result[i].levels;
                        tbltext=tbltext+"<tr><td style='text-align: left;'>"+levels+"</td><td>"+share+"</td></tr>"
                    }
                    tbltext=tbltext+"</table>"
                    res.send(tbltext)
                }else{
                    res.send("No Record")
                }
            })
        }
    else if(req.body.action==="searchpayourm"){
        var membernumber = req.body.membernumber
        var sql="select * from mlm_t.member  where orgid='"+req.session.orgid+"' And membermobileno='"+membernumber+"'";
        nmcon.query(sql,function(err,result){
            console.log(sql  +"  search member")
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].memberid)
                arr.push(result[0].membername)
                arr.push(result[0].amount)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("Member is not registered") 
            }
        })
    }
    else if(req.body.action==="payoutbutton"){
        var refrenceid = req.body.refrenceid
        var sql="select * from mlm_t.member  where orgid='"+req.session.orgid+"' And memberid='"+refrenceid+"'";
        nmcon.query(sql,function(err,result){
            console.log(sql  +"  search member")
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].amount)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("Member is not registered") 
            }
        })
    }
    else if (req.body.action === 'savepayout') {
        var memberid = req.body.refrenceid;
        var currentdate1 = req.body.payoutdate;
        var totalshare = req.body.totalshare;
        var totalpayout = req.body.totalpayout;
        var balancePayout = req.body.balancePayout;
        var transactionid = uuidv4();
        var amount = req.body.amount;
        var cdate = new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + ('0' + cdate.getSeconds()).slice(-2);
        var ccdate = new Date();
        ccdate = ccdate.getFullYear() + '-' + ('0' + (ccdate.getMonth() + 1)).slice(-2) + '-' + ('0' + ccdate.getDate()).slice(-2);
        var sqlcheck = "SELECT * FROM payout WHERE memberid='" + memberid + "' AND orgid='" + req.session.orgid + "' AND DATE(currentdate) = DATE('" + ccdate + "')";
        //var sqlcheck = "SELECT * FROM payout WHERE memberid='" + memberid + "' AND orgid='" + req.session.orgid + "' AND currentdate='" + ccdate + "'";
        nmcon.query(sqlcheck, function (err, result1) {
            console.log(sqlcheck + " -check condition payout")
            if (err) {
                console.log(err);
            } else if (result1.length > 0) {
                res.send("This member has already been paid today.");
            } else {
                var sql = "INSERT INTO payout (orgid, memberid, transactiondate, amount, createdby, transactionid, currentdate) VALUES ('" + req.session.orgid + "','" + memberid + "','" + currentdate1 + "','" + amount + "','" + req.session.userid + "','" + transactionid + "','" + cdate + "')";
                nmcon.query(sql, function (err, result) {
                    console.log(sql + " -insert payout")
                    if (err) {
                        console.log(err);
                        res.send("An error occurred while inserting the status.");
                    } else if (result.affectedRows > 0) {
                        
                        var sql1 = "UPDATE member SET totalpayout='" + totalpayout + "', balancepayout='" + balancePayout + "'  WHERE memberid='" + memberid + "' AND orgid='" + req.session.orgid + "'";
                        nmcon.query(sql1, function (err, result1) {
                            console.log(sql1 + " -update Member")
                            if (err) {
                                console.log(err);
                            } else if (result1.affectedRows > 0) {
                                res.send("Data inserted.");
                            } else {
                                res.send("Insert failed.");
                            }
                        })
                    }
                })
            }
        })
    }
    // else if(req.body.action==="showpayoutreportinfo"){
    //     var refrenceid=req.body.refrenceid;
    //     var tbltext = ""
    //     var sql1="select * from member where orgid='"+req.session.orgid+"'";
    //     var sql="SELECT m.membername,m.membermobileno,p.amount,p.transactiondate  FROM member m JOIN payout p ON m.memberid = p.memberid  WHERE m.memberid = '"+refrenceid+"' and m.orgid='"+req.session.orgid+"';"
    //     nmcon.query(sql,function (err,result){
    //          console.log(sql)
    //         if(err)console.log(err)
    //         else if (result.length > 0) {
    //             tbltext = "<table id='report'><tr><th style='width:150px'>Member Name</th><th style='width:150px'>PayOut Date</th><th style='width:150px'>Amount</th></tr>";
    //             for (var i = 0; i < result.length; i++) {
    //                 var membername = result[i].membername;
    //                 var membermobileno = result[i].membermobileno;
    //                 var amount = result[i].amount;
    //                 var transactiondate = result[i].transactiondate; // Corrected this line
            
    //                 if (transactiondate == 'undefined' || transactiondate == null || transactiondate == 'null' || transactiondate == undefined || transactiondate == 'NaN-aN-aN') {
    //                     transactiondate = '';
    //                 } else {
    //                     var date = new Date(transactiondate); // Parse the transactiondate to Date object
    //                     transactiondate = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
    //                 }
    //                 tbltext = tbltext + "<tr><td>" + membername + "</td><td>" + transactiondate + "</td><td>" + amount + "</td></tr>";
    //             }
    //             tbltext = tbltext + "</table>";
    //             res.send(tbltext);
    //         } else {
    //             res.send("No Record");
    //         }
    //     })
    // } 
    else if(req.body.action === "showpayoutreportinfo") {
        var refrenceid = req.body.refrenceid;
        var tbltext = "";
    
        // Query to retrieve member data based on member id
        var sql1 = "SELECT * FROM member WHERE memberid = '" + refrenceid + "' AND orgid = '" + req.session.orgid + "'";
    
        // Query to retrieve payout data based on member id
        var sql2 = "SELECT amount, transactiondate FROM payout WHERE orgid = '" + req.session.orgid + "' and memberid = '" + refrenceid + "'";
    
        // Execute first query to retrieve member data
        nmcon.query(sql1, function (err, memberResult) {
            if (err) {
                console.log(err);
                res.send("Error occurred while fetching member data");
            } else if (memberResult.length > 0) {
                var membername = memberResult[0].membername;
                var membermobileno = memberResult[0].membermobileno;
    
                // Execute second query to retrieve payout data
                nmcon.query(sql2, function (err, payoutResult) {
                    console.log(sql2)
                    if (err) {
                        console.log(err);
                        res.send("Error occurred while fetching payout data");
                    } else {
                        if (payoutResult.length > 0) {
                            tbltext = "<table id='report'><tr><th style='width:150px'>Member Name</th><th style='width:150px'>Member Mobile No</th><th style='width:150px'>PayOut Date</th><th style='width:150px'>Amount</th></tr>";
                            for (var i = 0; i < payoutResult.length; i++) {
                                var amount = payoutResult[i].amount;
                                var transactiondate = payoutResult[i].transactiondate;
    
                                if (transactiondate == 'undefined' || transactiondate == null || transactiondate == 'null' || transactiondate == undefined || transactiondate == 'NaN-aN') {
                                    transactiondate = '';
                                } else {
                                    var date = new Date(transactiondate);
                                    transactiondate = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
                                }
                                tbltext += "<tr><td>" + membername + "</td><td>" + membermobileno + "</td><td>" + transactiondate + "</td><td>" + amount + "</td></tr>";
                            }
                            tbltext += "</table>";
                            res.send(tbltext);
                        } else {
                            res.send("No Data");
                        }
                    }
                });
            } else {
                res.send("No Record");
            }
        });
    }
    
    
    else if (req.body.action === 'payouttotalamount') {
        var refrenceid = req.body.refrenceid;
        var sql = "SELECT * FROM payout WHERE memberid='" + refrenceid + "' AND orgid = '" + req.session.orgid + "';";
        nmcon.query(sql, function(err, result) {
            console.log(sql)
            if (err) {
                console.log(err);
                res.send("error");
            } else if (result.length > 0) {
                var payoutamount = 0;

                for (var i = 0; i < result.length; i++) {
                    payoutamount += result[i].amount;
                }

                res.send({ payoutamount: payoutamount });
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action === "memberreportsearch") {
        var membernumber = req.body.membernumber;
        var fromdatereport = req.body.fromdatereport;
        var todatereport = req.body.todatereport;
        var tbltext = "";
        var sql = "SELECT m.orgid,m.membername, m.memberid, m.membermobileno, p.transactiondate, p.amount,m.bankname,m.ifsccode,m.bankaccountno FROM  member m JOIN  payout p ON m.memberid = p.memberid AND m.orgid = p.orgid WHERE  m.orgid = '"+req.session.orgid+"' and 1=1"; 
        if (membernumber) {
            sql += " AND m.membermobileno = '" + membernumber + "'";
        }
        if (fromdatereport) {
            sql += " AND p.transactiondate >= '" + fromdatereport + "'";
        }
        if (todatereport) {
            sql += " AND p.transactiondate <= '" + todatereport + "'";
        }
        nmcon.query(sql, function (err, result) {
            console.log(sql + " ********")
            if (err) {
                console.log(err);
            } else if (result.length > 0) { 
                tbltext = "<table id='report'style='width:100%' ><tr><th style='width:150px'>Member Name</th><th>Contact No</th><th style='width:150px'>PayOut Date</th><th style='width:150px'>Amount</th><th>Bank Name</th><th>Bank Account no</th><th>ifsccode</th></tr>";
                for (var i = 0; i < result.length; i++) {
                    var membername = result[i].membername;
                    var bankaccountno=result[i].bankaccountno;
                    var ifsccode =result[i].ifsccode;
                    var bankname = result[i].bankname;
                    var membermobileno = result[i].membermobileno;
                    var amount = result[i].amount;
                    var startdate = new Date();
                    var crdate = result[i].transactiondate;
                    if(crdate == 'undefined' || crdate == null || crdate == 'null' || crdate == undefined || crdate == 'NaN-aN-aN'){
                        crdate=''
                    }else{
                        crdate = crdate.getFullYear()+'-'+("0" + (crdate.getMonth() + 1)).slice(-2)+'-'+("0" + crdate.getDate()).slice(-2);     
                    }
                    tbltext = tbltext + "<tr><td>" + membername + "</td><td>"+membermobileno+"</td><td>" + crdate + "</td><td>" + amount + "</td><td>" + bankname + "</td><td>" + bankaccountno + "</td><td>" + ifsccode + "</td></tr>";
            
                }
                tbltext = tbltext + "</table>";
                
                res.send(tbltext);
            } else {
                res.send("No Record");
            }
        });
    }
    else if(req.body.action === "currontpayoitreport") {
        var membernumber = req.body.membernumber;
        var tbltext = "";
        var sql = "SELECT *  "+
                " FROM member " +
                " WHERE orgid='"+req.session.orgid+"' and 1=1 "; 
        if (membernumber) {
            sql += " AND membermobileno = '" + membernumber + "'";
        }
        sql += " AND referenceid IS NOT NULL AND referenceid <> ''";
    // sql +=" And memberid is not refranseid";
        nmcon.query(sql, function (err, result) {
            console.log(sql + " ********")
            if (err) {
                console.log(err);
            } else if (result.length > 0) { 
                tbltext = "<table id='report' style='width:100%'><tr><th style='width:150px'>Name</th><th> contactno </th><th>TotalEarning</th><th>PayoutDone</th><th>PendingPayOut</th><th>Bank Name</th><th>BankAccountno</th><th>ifsccode</th><th>Action</th></tr>";
                for (var i = 0; i < result.length; i++) {
                    var membername = result[i].membername;
                    if(membername == 'undefined' || membername == undefined || membername == 'null' || membername == null){
                        membername = ''
                    }
                    var bankaccountno=result[i].bankaccountno;
                    if(bankaccountno == 'undefined' || bankaccountno == undefined || bankaccountno == 'null' || bankaccountno == null){
                        bankaccountno = ''
                    }
                    var ifsccode =result[i].ifsccode;
                    if(ifsccode == 'undefined' || ifsccode == undefined || ifsccode == 'null' || ifsccode == null){
                        ifsccode = ''
                    }
                    var bankname = result[i].bankname;
                    if(bankname == 'undefined' || bankname == undefined || bankname == 'null' || bankname == null){
                        bankname = ''
                    }
                    var balancepayout =result[i].balancepayout;
                    if(balancepayout == 'undefined' || balancepayout == undefined || balancepayout == 'null' || balancepayout == null){
                        balancepayout = ''
                    }
                    var memberid=result[i].memberid;
                    var totalpayout =result[i].totalpayout;
                    if(totalpayout == 'undefined' || totalpayout == undefined || totalpayout == 'null' || totalpayout == null){
                        totalpayout = ''
                    }
                    var totalshare =result[i].totalshare;
                    if(totalshare == 'undefined' || totalshare == undefined || totalshare == 'null' || totalshare == null){
                        totalshare = ''
                    }
                    var membermobileno = result[i].membermobileno;
                    if(membermobileno == 'undefined' || membermobileno == undefined || membermobileno == 'null' || membermobileno == null){
                        membermobileno = ''
                    }
                    tbltext = tbltext + "<tr><td>" + membername + "</td><td>"+membermobileno+"</td><td>" + totalshare + "</td><td>" + totalpayout + "</td><td>" + balancepayout + "</td><td>" + bankname + "</td><td>" + bankaccountno + "</td><td>" + ifsccode + "</td><td> <button onclick=payonpendingpayOut('"+memberid+"');setmemberid('"+memberid +"');>Pay</button></td></tr>";
            
                }
                tbltext = tbltext + "</table>";
                
                res.send(tbltext);
            } else {
                res.send("No Record");
            }
        });
    }
    // else if(req.body.action==="retrivpayout"){
    //     var memberid = req.body.memberid
    //     var sql="select * from mlm_t.member where memberid='"+memberid+"' And orgid='"+req.session.orgid+"'";
    //     nmcon.query(sql,function(err,result){
    //         if(err)console.log(err)
    //         else if(result.length>0){
    //             var arr=[];
    //             arr.push(result[0].balancepayout)
    //             arr.push(result[0].totalshare)
    //             arr.push(result[0].totalpayout)
    //             arr.push(result[0].balancepayout)
    //             res.send(arr)
    //             console.log(arr)
    //         }else{
    //             //res.send(arr)
    //         res.send("User is not registered") 
    //         }
    //     })
    // }
    else if(req.body.action === "retrivpayout") {
        var memberid = req.body.memberid;
        var orgid = req.session.orgid;
        var sql1="select * from mlm_t.member where memberid='"+memberid+"' and orgid='"+req.session.orgid+"';"
        nmcon.query(sql1,function(err,result){
            console.log(sql1 + " - member payout")
            if(err){
                console.log(err)
            }
            else if(result.length > 0){
                var totalshare=result[0].totalshare;
                var sql= "select amount,COALESCE(amount, 0) from  payout where memberid='"+memberid+"' and orgid='"+req.session.orgid+"';"
                nmcon.query(sql,function(err,result){
                    console.log(sql + " -payout")
                    if (err) {
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    } else if (result.length > 0) {
                        var totalAmount = 0;
                        for (var i = 0; i < result.length; i++) {
                            totalAmount += result[i].amount;
                        }
                        console.log( totalshare +" -totalShare" + totalAmount + "- totalAmount")
                        res.send({ totalshare: totalshare, totalAmount: totalAmount });
                        
                    } else {
                        res.send({ totalshare: totalshare, totalAmount: totalAmount })
                        // res.status(404).send("User is not registered");
                    }   
                })
            }
        })
        // var sql ="SELECT m.totalshare, COALESCE(p.amount, 0) AS amount FROM mlm_t.member m  LEFT JOIN mlm_t.payout p ON m.memberid = p.memberid  AND p.orgid = '"+req.session.orgid+"' WHERE m.memberid = '"+memberid+"'; ";
        // nmcon.query(sql, function(err, result) {
        //     console.log(sql +" retriv")
        //     if (err) {
        //         console.log(err);
        //         res.status(500).send("Internal Server Error");
        //     } else if (result.length > 0) {
        //         var totalShare = result[0].totalshare;
        //         var totalAmount = 0;
        //         for (var i = 0; i < result.length; i++) {
        //             totalAmount += result[i].amount;
        //         }
        //         console.log( totalShare +" -totalShare" + totalAmount + "- totalAmount")
        //         res.send({ totalShare: totalShare, totalAmount: totalAmount });
                
        //     } else {
        //         res.status(404).send("User is not registered");
        //     }
        // });
    }
    
    // Server-side code
else if (req.body.action === "uploadbcsv") {
    let foldadd = "./userdata/mlmuploadcsv/" + req.session.userid + "/";
    let filename = req.session.userid + '.csv';
    let fn = foldadd + filename;
    csvtojson().fromFile(fn).then(async source => {
        for (let i = 0; i < source.length; i++) {
            let transactionno = source[i].transactionno.trim();
            let contactno = source[i].contactno;
            if (!transactionno) {
                console.log("Skipping row with blank transactionno");
                continue;
            }

            let sqlUpdate = "UPDATE member SET transactionno = '" + transactionno + "' WHERE orgid = '" + req.session.orgid + "' and membermobileno ='" + contactno + "' AND referenceid IS NOT NULL AND referenceid <> '' ";
            try {
                await new Promise((resolve, reject) => {
                    nmcon.query(sqlUpdate, function (err, result) {
                        console.log(sqlUpdate + ".- -- sqlUpdate");
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(`Updated transactionno for members with orgid ${req.session.orgid}`);
                            resolve(result);
                        }
                    });
                });
            } catch (error) {
                console.error("Error updating transactionno:", error);
                res.send("error");
                return; // Ensure the function stops execution upon error
            }
        }
        res.send("success"); // Send success response after all updates are done
    }).catch(error => {
        console.error("Error processing CSV file:", error);
        res.send("error");
    });
}

    //mlm account status
    else if(req.body.action === "getaccountdetailsmlm"){
        mcon.query("select * from subscriptions where userid='" + req.session.userid + "' and moduleid=21", function(err, results){
            if(err) console.log(err)  
            else{
                var date_ob = new Date();
                let acc=[];
                let date = new Date(results[0].enddate)
                var diff = date.getTime() - date_ob.getTime()  
                var daydiff = diff / (1000 * 60 * 60 * 24)
                if(daydiff>0){
                    acc.push("Active")
                    let days = Math.round(daydiff)
                    acc.push(days)
                }
                else{
                    acc.push("deactive")
                    let days = 0
                    acc.push(days)
                }
                acc.push(results[0].startdate);
                acc.push(results[0].enddate);
                res.send(acc);
            }       
        })
    }
    //tree diagram
    // else if(req.body.action === "showansmemberlevel") {
    //     var searchmemberlevel = req.body.searchmemberlevel;
    //     var tbltext = "";
    
    //     var chwcksql = "SELECT * FROM mlm_t.member WHERE membermobileno = '"+searchmemberlevel+"' AND orgid ='"+req.session.orgid+"'";
    //     nmcon.query(chwcksql,function(err, result) {
    //         console.log(chwcksql +" chwcksql")
    //         if(err) {
    //             console.log(err);
    //             return res.status(500).send('Internal Server Error');
    //         }
    //         if(result.length > 0) { 
    //             var refrenceid = result[0].memberid;
    //             var sql = "SELECT * FROM mlm_t.member WHERE memberid = ? AND orgid = ?";
    //             nmcon.query(sql, [refrenceid, req.session.orgid], async function(err, result) {
    //                 if(err) {
    //                     console.log(err);
    //                     return res.status(500).send('Internal Server Error');
    //                 }
    //                 if(result.length > 0) { 
                       
    //                     var thread1 = "<table id='report' style='width:100%;  align-self: center;'><tr><th style='width:180px'>Name</th><th style='width:150px'>Contact No</th><th> Levels</th><th>Amount</th><th>share %</th><th>share</th></tr>";
    //                     var totalAmount = 0;
    
    //                     for(var i = 0; i < result.length; i++) {
    //                         var membername = result[i].membername || '';
    //                         var membermobileno = result[i].membermobileno || '';
    //                         var memberid = result[i].memberid;
    //                         var planid = result[i].planid;
    //                         var orgid = req.session.orgid;
    //                         var amount = result[i].amount || '';
    
    //                         var { tbltext: updatedTblText, amt: updatedTotalAmount } = await getchildlevel1(tbltext, memberid, orgid, "&nbsp;&nbsp;&nbsp;&nbsp;", 1, 0, 0);
    //                         tbltext = updatedTblText;
    //                         totalAmount += updatedTotalAmount;
    //                     }
    
    //                     tbltext += "<tr><td colspan='4' style='text-align: right; font-size:17px;'>Total:</td><td id='totalamountid' colspan='2'>" + totalAmount + "</td><input type='hidden' id='refidHidden' value='" + refrenceid + "'></tr>";
    //                     var sql1 = "UPDATE member SET totalshare = ? WHERE memberid = ? AND orgid = ?";
    //                     nmcon.query(sql1, [totalAmount, refrenceid, req.session.orgid], function(err, result1) {
    //                         if(err) {
    //                             console.log(err);
    //                             return res.status(500).send('Internal Server Error');
    //                         }
    //                         if(result1.affectedRows > 0) {
    //                             tbltext = thread1 + tbltext;
    //                             res.send(tbltext);
    //                         } else {
    //                             res.send("Insert failed.");
    //                         }
    //                     });
    //                 } else {
    //                     res.send("No Record");
    //                 }
    //             });
    //         } else {
    //             res.send("No Record");
    //         }
    //     });
    // }

    else if (req.body.action === "showansmemberlevel") {
        var searchmemberlevel = req.body.searchmemberlevel;
        
        var chwcksql = "SELECT * FROM mlm_t.member WHERE membermobileno = '" + searchmemberlevel + "' AND orgid ='" + req.session.orgid + "'";
        nmcon.query(chwcksql, async function (err, result) {
            if (err) {
                console.log(err);
                res.send("Error occurred.");
            } else if (result.length > 0) {
                var treeHtml = "<div class='tree' ><ul>";
                for (var i = 0; i < result.length; i++) {
                    var member = result[i];
                    var memberName = member.membername || '';
                    var memberMobileNo = member.membermobileno || '';
                    var memberId = member.memberid;
    
                    // Generate HTML for current member
                    treeHtml += "<li>" + memberName + " <br> " + memberMobileNo;
    
                    // Recursively call getChildLevels for each child
                    var childTreeHtml = await getChildLevels1(treeHtml,memberId, req.session.orgid);
                    
                    // Append child tree HTML
                    treeHtml += childTreeHtml;
    
                    treeHtml += "</li>";
                }
                treeHtml += "</ul>";
    
                // Send the complete tree HTML
                res.send(treeHtml);
            } else {
                res.send("No Records.");
            }
        });
    }
    
}); 

// async function getChildLevels1(treeHtml,parentId, orgId) {
//     return new Promise((resolve, reject) => {
//         var sql = "SELECT * FROM mlm_t.member WHERE referenceid='" + parentId + "' and orgid='" + orgId + "'";
//         nmcon.query(sql, async function (err, result) {
//             if (err) {
//                 console.log(err);
//                 resolve("");
//             } else if (result.length > 0) {
//                 var childTreeHtml = "<ul>";
//                 for (var i = 0; i < result.length; i++) {
//                     var member = result[i];
//                     var memberName = member.membername || '';
//                     var memberMobileNo = member.membermobileno || '';
//                     var memberId = member.memberid;
//                     var memberpicid =member.memberpicid 

//                     // Generate HTML for current member
//                     childTreeHtml += "<li><div class='treediv'><a href='#'><img src='/static/image/membertree.png' class='treeimg'><span class='bgcolorli'>" + memberName + " <br> " + memberMobileNo +"</span></div>";

//                     // Recursively call getChildLevels for each child
//                     var subChildTreeHtml = await getChildLevels1(treeHtml,memberId, orgId);
                    
//                     // Append sub-child tree HTML
//                     childTreeHtml += subChildTreeHtml;

//                      childTreeHtml += "</li>";
//                 }
//                 childTreeHtml +="</ul>";
//                 resolve(childTreeHtml);
//             } else {
//                 resolve("");
//             }
//         });
//     });
// }

async function getChildLevels1(treeHtml, parentId, orgId) {
    return new Promise(async (resolve, reject) => {
    var sql = "SELECT * FROM mlm_t.member WHERE referenceid='"+parentId+"' AND orgid='"+orgId+"'";
    console.log(sql + " ;;;;;;;;;;;;;;")
            nmcon.query(sql, async function (err, result){
            if (result.length > 0) {
                let childTreeHtml = "<ul>";
                for (let i = 0; i < result.length; i++) {
                    const member = result[i];
                    const memberName = member.membername || '';
                    const memberMobileNo = member.membermobileno || '';
                    const memberId = member.memberid;
                    const memberpicid = member.memberpicid;

                    // Get the filename for the member's image
                    const filename = await getFilename(orgId, memberpicid);
                    const imgTag = filename ? `<img src='/getmlmprofilepic/${filename}' class='treeimg'>` : "<img src='/static/image/membertree.png' class='treeimg'>";
                    console.log(imgTag +" ////////////")
                    // Generate HTML for current member
                    childTreeHtml += `<li><div class='treediv'><a href='#'>${imgTag}<span class='bgcolorli'>${memberName}<br>${memberMobileNo}</span></div>`;
                    // Recursively call getChildLevels for each child
                    const subChildTreeHtml = await getChildLevels1(treeHtml, memberId, orgId);

                    // Append sub-child tree HTML
                    childTreeHtml += subChildTreeHtml;
                    childTreeHtml += "</li>";
                }
                childTreeHtml += "</ul>";
                resolve(childTreeHtml);
            } else {
                // If no members are found, resolve with an empty string
                resolve("");
            }
        
        })
    });
}

async function getFilename(orgId, fileid) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT filename FROM uploadfile WHERE orgid='" + orgId + "' AND fileid='" + fileid + "'";
        console.log(sql + " ............");
        fcon.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                reject(err);
            } else if (result.length > 0) {
                resolve(result[0].filename);
                console.log(result[0].filename + " result[0].filename")
            } else {
                console.log("No filename found for fileid:", fileid);
                resolve('');
            }
        });
    });
}

session.totalIncome=0; 
//console.log(session.totalIncome +"  session.totalIncome")
async function getchildlevel(tbltext1, memberid1, orgid1, cspace1, level = 1, totalCal1, cal, amt1 = 0) {
    return new Promise(async (resolve, reject) => {
        var memberid = memberid1;
        var orgid=orgid1;
        session.totalIncome = +totalCal1;
        var sessioncal = session.totalIncome
        var tbltext = tbltext1;
        var cspace = cspace1;
        //var planid1 = planid;
        var amt = amt1;
        var sql = "SELECT * FROM mlm_t.member a, plan b, plandetails c WHERE a.planid=b.planid and b.planid=c.planid and a.orgid='"+orgid+"' and  referenceid='" + memberid + "' and c.levels ='" + level + "'";
        nmcon.query(sql, async function (err, result) {
            console.log(sql +"  sql getchild")
            if (err) {
                console.log(err);
                resolve({ tbltext, amt });
            } else if (result.length > 0) {
                var abc = session.totalIncome;
                var arr = [];
                for (var i = 0; i < result.length; i++) {
                    var cmemberid = result[i].memberid;
                    var membername = result[i].membername;
                    if(membermobileno == 'undefined' || membermobileno == undefined || membermobileno == 'null' || membermobileno == null){
                        membermobileno = ''
                    }
                    var membermobileno = result[i].membermobileno;
                    if(membermobileno == 'undefined' || membermobileno == undefined || membermobileno == 'null' || membermobileno == null){
                        membermobileno = ''
                    }
                    var amount = result[i].amount;
                    if(amount == 'undefined' || amount == undefined || amount == 'null' || amount == null){
                        amount = ''
                    }
                    var cplanid = result[i].planid;
                    var share = result[i].share;
                    if(share == 'undefined' || share == undefined || share == 'null' || share == null){
                        share = ''
                    }
                    var cal = ((amount / 100) * share).toFixed(2);;

                    tbltext += "<tr><td style='text-align: left;'>" + cspace + membername + "</td><td>" + membermobileno + "</td><td>" + level + "</td><td>" + amount + "</td><td>" + share + "</td><td>" + cal + "</td></tr>";
                    amt = parseFloat(amt) + parseFloat(cal);
                    var { tbltext: tbl1, amt: subamt } = await getchildlevel(tbltext, cmemberid, orgid, cspace + "&nbsp;&nbsp;&nbsp;&nbsp;", level + 1, cal, amt);

                    
                    if (tbl1 != 'undefined' && tbl1 != undefined && tbl1 != null && tbl1 != 'null') {
                        tbltext = tbl1;
                    }
                    amt =amt+ subamt;
                }
                resolve({ tbltext, amt });
            } else {
                resolve({ tbltext, amt });
            }
        });
    });
}

//GYM Module

app.get('/getworkoutcard/:filename', (req, res) => {
    console.log(req.params.filename)
    gymcon.query("select subscriptionid,cardlink from membercard where memberid in(select memberid2 from gymmembers where mobileno like'"+req.params.filename+"') order by assigneddate desc",function(err,result){
        if(err) console.log(err)
        else if(result.length>0){
            fname = "./userdata/gymdata/"+result[0].subscriptionid+"/gymworkoutcard/"+result[0].cardlink+".png"
            console.log(fname + "here")
            if (fs.existsSync(fname)){
                console.log("exists") 
                var readStream = fs.createReadStream(fname);
                readStream.pipe(res);               
            } 
            else{
                res.send("first save this card")
            }
        }
    })
});
//pic upload gym
const storagegym = multer.diskStorage({
    destination: (req, file, cb) => {
        // const pathe="./userdata/gymdata/"+req.session.subsid;
        if (fs.existsSync("./userdata/gymdata/"+req.session.subsid)){
            console.log("exists") 
            // cb(null, pathe)               
       }
       else{
           fs.mkdir("./userdata/gymdata/"+req.session.subsid, function(err) {
               if (err) {
                 console.log(err)
                //  cb(err);
               } else {
                 console.log("New directory successfully created.")
                //  cb(null, pathe);
               }
           })
       }
        cb(null,"./userdata/gymdata/"+req.session.subsid);
    },
    filename: (req, file, cb) => {
        const fileExtension = req.session.memberid+".png";
        console.log( req.session.memberid + " - req.session.memberid")
        console.log(fileExtension+ ' file upload ' + req.session.userid)
        cb(null, fileExtension);
    },
})
const uploadprofilepic = multer({
    storage: storagegym,
    limits: { fileSize: 2097152 }
}).single('png');

app.post("/uploadprofilepic",(req,res)=>{
    uploadprofilepic(req, res, (err) => {
        if (err) {
            console.log(err)
            res.send('bigfile')
        } else {
            let showgymmenu = 'yes'
            res.render("gymmanagement.pug",{owner: showgymmenu})
        }
    });
})
app.get('/getprofilepicgym/:filename', (req, res) => {
    fname = "./userdata/gymdata/"+req.session.subsid+"/"+req.params.filename
    console.log(fname + "here")
    if (fs.existsSync(fname)){
        console.log("exists") 
        var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res);               
    } 
    else{
        console.log("no")
    }
});

//logo upload gym
const storagegymlogo = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Subsid:", req.session.subsid);
        // const fspath = "./userdata/gymdata/" + req.session.subsid + "/gympictures/";
        if (fs.existsSync("./userdata/gymdata/"+req.session.subsid)){
            console.log("exists")                
       }else{
            // console.log("hello")
           fs.mkdir("./userdata/gymdata/"+req.session.subsid, function(err) {
            // console.log("hello 1")
               if (err) {
                 console.log(err +" error on logo")
               } else {
                 console.log("New directory successfully created.")
               }
           })
       }
        cb(null,"./userdata/gymdata/"+req.session.subsid);
    },
    filename: (req, file, cb) => {
        const fileExtension = req.session.subsid+".png";
        console.log(fileExtension + " - fileExtension")
        console.log(req.session.fileExtension+ ' file upload  gym logo' + req.session.userid)
        cb(null, fileExtension);
    },
})
const uploadgymlogo = multer({
    storage: storagegymlogo,
    limits: { fileSize: 2097152 }
}).single('png');

app.post("/uploadgymlogo",(req,res)=>{
    uploadgymlogo(req, res, (err) => {
        if (err) {
            console.log(err)
            res.send('bigfile')
        } else {
            let showgymmenu = 'yes'
            console.log(showgymmenu +" - showgymmenu")
            res.render("gymmanagement.pug",{owner: showgymmenu})
        }
    });
})

// app.get('/getlogogym/:filename', (req, res) => {
//     fname = "./userdata/gymdata/"+req.session.subsid+"/"+req.session.subsid+".png"
//     console.log(fname + "here")
//     if (fs.existsSync(fname)){
//         console.log("exists") 
//         var readStream = fs.createReadStream(fname);
//         // We replaced all the event handlers with a simpleh call to readStream.pipe()
//         readStream.pipe(res);               
//     } 
//     else{
//         console.log("no")
//     }
// });
app.get('/getlogogym/:filename', (req, res) => {
    fname = "./userdata/gymdata/"+req.session.subsid+"/"+req.params.filename
    // console.log(fname + "here 123")
    if (fs.existsSync(fname)){
        console.log("exists") 
        var readStream = fs.createReadStream(fname);
        // We replaced all the event handlers with a simpleh call to readStream.pipe()
        readStream.pipe(res);               
    } 
    else{
        console.log("no")
    }
});
// upload file gym

const storagememberdetails = multer.diskStorage({
    destination: (req, file, cb) => {
        if (fs.existsSync("./userdata/gymdata/" + req.session.subsid +"/gymfiles")){
            console.log("exists")                
       }
       else{
           fs.mkdir("./userdata/gymdata/" + req.session.subsid, function(err) {
               if (err) {
                 console.log(err)
               } else {
                 console.log("New directory successfully created.")
               }
           })
           fs.mkdir("./userdata/gymdata/" +req.session.subsid+"/gymfiles", function(err) {
            if (err) {
              console.log(err)
            } else {
              console.log("New directory successfully created.")
            }
        })
        fs.mkdir("./userdata/gymdata/" +req.session.subsid+"/gympictures", function(err) {
            if (err) {
            console.log(err)
            } else {
            console.log("New directory successfully created.")
            }
        })
       }
       console.log("########################")
        cb(null, "./userdata/gymdata/"+req.session.subsid+"/gymfiles");
    },
    filename: (req, file, cb) => {
        const fileExtension = req.session.userid+".csv";
        console.log(fileExtension+ ' file upload ' + req.session.userid)
        cb(null, fileExtension);
    },
})

const uploadmemberdetails = multer({
    storage: storagememberdetails,
    limits: { fileSize: 2097152 }
}).single('csv');


app.post("/uploadmemberdetails",(req, res)=>{
    uploadmemberdetails(req, res, (err) => {
        if (err) {
            console.log(err)
            res.send('bigfile')
        } else {
            showgymmenu = "yes"
            res.render("gymmanagement.pug",{user: showgymmenu})
        }
    });
})

app.get("/1/gymmanagement", (req,res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }else{
        let admin2nd = 0;
        let gymmenber = 0;
        let showgymmenu = '';
        var started=0;
        var orgcolor="";
        var substatus=0;
        var sql ="select * from subscriptions where userid like '"+req.session.userid+"' and moduleid=8 and isprimary like 'yes'";
        mcon.query(sql, function(err,result) {
            console.log(sql + " gym sql")
        if(err) {
            console.log(err)
        } else if(result.length > 0) {
                showgymmenu = "yes"
                req.session.subsid = result[0].subscriptionid
            } else{
                showgymmenu = "no"
            }
            gymcon.query("select * from gymadmins where userid like '"+req.session.userid+"'", function(err,results2){
            if(err) console.log(err)
            else if(results2.length>0){
               admin2nd = 1;
                req.session.subsid = results2[0].subscriptionid;
            }else{
                admin2nd = 0;
            }
            var sql1 = "select * from gymmanagement_t.gymmembers where memberid='"+req.session.userid+"'";
            gymcon.query(sql1,function(err, results){
                console.log(sql1 + " -gymmenber")
                if(err) console.log(err)
                else if(results.length>0){
                    gymmenber = 1
                }else{
                    gymmenber = 0
                }
                var sql="select * from gymmanagement_t.orgdetails where subscriptionid='"+req.session.subsid+"' ";
                   // console.log("sql......."+sql)
                    gymcon.query(sql, (err, result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        console.log("one")
                        started = 1;                     
                        req.session.orgid = result[0].orgid;
                        console.log(req.session.orgid  )
                    } else {
                        started = 0;
                       console.log("two")
                    }
                    var sql="select * from gymmanagement_t.orgdetails where subscriptionid='"+req.session.subsid+"'";
                        console.log("sql......."+sql)
                        gymcon.query(sql, (err, result)=>{
                            if(err) console.log(err)
                            else if (result.length>0) {
                                //console.log("one")
                                req.session.orgcolor = result[0].csscolor;                   
                                orgcolor=req.session.orgcolor;
                                if(orgcolor == 'undefined' || orgcolor == null || orgcolor == 'null' || orgcolor == undefined || orgcolor == 'NaN-aN-aN'){
                                    orgcolor='style'
                                }
                                //console.log(req.session.orgid +"orgid")
                            } else {
                                orgcolor = 0;
                                //console.log("two")
                            }   
                            var sqlsubstatus = "select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in (select orgdetails.subscriptionid  from gymmanagement_t.orgdetails where orgid like '"+req.session.orgid+"')";
                            mcon.query(sqlsubstatus,function(err,result){
                                console.log(sqlsubstatus + " - sqlsubstatus")
                                if(err)console.log(err)
                                else if(result.length>0){
                                    var enddate = result[0].enddate
                                    let date1 = new Date()
                                    const diffTime = enddate.getTime() - date1.getTime();
                                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                    if(diffDays>0){
                                            substatus = 1;
                                    }else{
                                            substatus = 0;    
                                    } 
                                }     
                                res.render("gymmanagement.pug",{owner: showgymmenu, admin2nd: admin2nd,gymmenber:gymmenber, user: req.session.userid, username: req.session.username,subsid:req.session.subsid,started:started,orgcolor:orgcolor,substatus:substatus})
                                console.log("gymmanagement.pug",{owner: showgymmenu, admin2nd: admin2nd,gymmenber:gymmenber, user: req.session.userid, username: req.session.username,subsid:req.session.subsid,started:req.session.orgid,orgcolor:orgcolor,substatus:substatus})
                            })
                        })            
                    })
                })
            })
        })
    }
})


app.post("/1/gymmanagement",up,async (req,res)=> {
    if(!req.session.userid){
        res.send("sessionexpired")
    }
    else if(req.body.action === "subscribegymmanagement") {
        console.log("hello")
            var date_ob = new Date();
            var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            var days = 3;
            let newDate = new Date(Date.now()+days*24*60*60*1000);
            let ndate = ("0" + newDate.getDate()).slice(-2);
            let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
            let hours = newDate.getHours();
            let minutes = newDate.getMinutes();
            let seconds = newDate.getSeconds();           
            let nyear = newDate.getFullYear();    
            let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds  
            var subid = uuidv4();
            // var dt = dateTime.create();
            // var subdt = dt.format('Y-m-d H:M:S');
            var query = "insert into subscriptions(subscriptionid, userid,startdate,enddate,moduleid,isprimary) values('"+subid+"','"+req.session.userid+"','"+currentdate+"', '"+nextdate+"',8,'yes')"
            mcon.query(query)
            mcon.query("commit")
            // var query = "insert into subscriptions(subscriptionid, userid,startdate,enddate,moduleid,isprimary) values('"+subid+"','"+req.session.userid+"','"+currentdate+"', '"+nextdate+"',9,'no')"
            // mcon.query(query)
            // mcon.query("commit")  
            // gymcon.query("insert into orgdetails(subscriptionid) values('"+subid+"')", function(err, result) {
                // if(err) console.log(err)
            // })
            res.send("subscribed");  
    }
    else if (req.body.action === "saveorginfo") {
        var orgid=uuidv4();
        orgname =  req.body.orgname
        orgaddress =  req.body.orgaddress
        orgcity =  req.body.orgcity
        orgstate =  req.body.orgstate
        orgcontact =  req.body.orgcontact
        orgemailid =  req.body.orgemailid
        var sql=" "
        // gymcon.query("update orgdetails set orgname='"+orgname+"', orgaddress='"+orgaddress+"', orgcity='"+orgcity+"', orgstate='"+orgstate+"', orgpin='"+orgpin+"', orgcontact='"+orgcontact+"', orgemailid='"+orgemailid+"', orggst='"+orggst+"', orgpan='"+orgpan+"', orgbankname='"+orgbankname+"', orgbankaccountname='"+orgbankaccountname+"', orgbankaccountnumber='"+orgbankaccountnumber+"', orgifsccode='"+orgifsccode+"' where subscriptionid like '"+req.session.subsid+"'")
        gymcon.query("insert into orgdetails (subscriptionid,orgname, orgaddress,orgcity,orgstate,orgcontact,orgemailid,orgid)values('"+req.session.subsid+"','"+orgname+"', '"+orgaddress+"','"+orgcity+"','"+orgstate+"','"+orgcontact+"','"+orgemailid+"','"+orgid+"') ")
        // gymcon.query(sql,function(err,result1){
        gymcon.query("commit")
        res.send("Saved")
    }  
    else if (req.body.action === "saveorgprofile") {
            var orgid=uuidv4();
            orgname =  req.body.orgname
            orgaddress =  req.body.orgaddress
            orgcity =  req.body.orgcity
            orgstate =  req.body.orgstate
            orgpin =  req.body.orgpin
            orgcontact =  req.body.orgcontact
            orgemailid =  req.body.orgemailid
            orggst =  req.body.orggst
            orgpan =  req.body.orgpan
            orgbankname =  req.body.orgbankname
            orgbankaccountname =  req.body.orgbankaccountname
            orgbankaccountnumber =  req.body.orgbankaccountnumber
            orgifsccode =  req.body.orgifsccode
            var sql=" "
            gymcon.query("update orgdetails set orgname='"+orgname+"', orgaddress='"+orgaddress+"', orgcity='"+orgcity+"', orgstate='"+orgstate+"', orgpin='"+orgpin+"', orgcontact='"+orgcontact+"', orgemailid='"+orgemailid+"', orggst='"+orggst+"', orgpan='"+orgpan+"', orgbankname='"+orgbankname+"', orgbankaccountname='"+orgbankaccountname+"', orgbankaccountnumber='"+orgbankaccountnumber+"', orgifsccode='"+orgifsccode+"' where subscriptionid like '"+req.session.subsid+"'")
            gymcon.query("commit")
            res.send("Saved")
        } 
        //gymlogo
        // else if(req.body.action==='uploadgymlogo'){
        //     return new Promise((resolve, reject) => {
        //         savefiledb(req,res,req.session.orgid,(successfun) => {
        //             resolve(successfun);
        //         });
        //     }).then((data)=>{
        //         gymcon.query("UPDATE orgdetails SET logoid ='"+data+"' where orgid='"+req.session.orgid+"'" , function(err,result){
        //             if(err) console.log(err);
        //             else if(result.affectedRows>0){
        //                 res.send('successful')
        //             }else{
        //                 console.log("something went wrong please try after sometime.....")
        //             }
        //         })
        //     })   
        // }
        // else if(req.body.action === 'getgymlogo'){
        //     let path ="gymlogo/"+req.session.orgid
        //     gymcon.query("select logoid from orgdetails where orgid='"+req.session.orgid+"'",function(err,result){
        //         if(err) console.log(err)
        //         else if(result.length>0){
        //             let fileid = result[0].logoid;
        //             return new Promise((resolve, reject) => {
        //                 retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
        //                     resolve(successfun);
        //                 });
        //             }).then((data)=>{
        //                 res.send(data)
        //             })
    
        //         }else{
        //             res.send("no file")
        //         }
        //     })    
        // }
        else if (req.body.action === "getorgprofile") {
        console.log(req.session.subsid+ " org info")
        gymcon.query("select * from orgdetails where subscriptionid like '"+req.session.subsid+"'", function(err,result) {
            if(result.length<1) {
                res.send("notfound")
            } else {
                orgname =  result[0].orgname
                orgaddress =  result[0].orgaddress
                orgcity =  result[0].orgcity
                orgstate =  result[0].orgstate
                orgpin =  result[0].orgpin
                orgcontact =  result[0].orgcontact
                orgemailid =  result[0].orgemailid
                orggst =  result[0].orggst
                orgpan =  result[0].orgpan
                orgbankname =  result[0].orgbankname
                orgbankaccountname =  result[0].orgbankaccountname
                orgbankaccountnumber =  result[0].orgbankaccountnumber
                orgifsccode =  result[0].orgifsccode
                arr = '["orginfo","'+result[0].orgname+'","'+result[0].orgaddress+'","'+result[0].orgcity+'","'+result[0].orgstate+'","'+result[0].orgpin+'","'+result[0].orgcontact+'","'+result[0].orgemailid+'","'+result[0].orggst+'","'+result[0].orgpan+'","'+result[0].orgbankname+'","'+result[0].orgbankaccountname+'","'+result[0].orgbankaccountnumber+'","'+result[0].orgifsccode+'"]'
                res.send(arr)
            }
        })
    } else if(req.body.action === "searchuser") {
            mcon.query("select * from users where mobile like '"+req.body.mobilenumber+"'", function(err,result) {
                if(err) {
                    console.log(err)
                } else {
                    if(result.length>0) {
                        res.send(result[0].name)
                    } else {
                        res.send("notfound")
                    }
                }
            })
    }
    //  else if (req.body.action === "addgymadmin") {
    //     mcon.query("select * from usermaster_t.users where mobile like '"+req.body.mobilenumber+"'", function(err,result) {
    //         if(err) {
    //             console.log(err)
    //         } else {
    //             if(result.length>0) {
    //                 gymcon.query("insert into gymadmins values('"+req.session.subsid+"','"+result[0].userid+"')")
    //                 gymcon.query("commit")
    //                 res.send("added")
    //             } else {
    //                 res.send("notfound")
    //             }
    //         }
    //     })
    // } 
    else if (req.body.action === "addgymadmin") {
        mcon.query("SELECT * FROM usermaster_t.users WHERE mobile='"+req.body.mobilenumber+"'", function(err, result) {
            if(err) {
                console.log(err);
            } else {
                if(result.length > 0) {
                    var userId = result[0].userid;
                    var sql ="select *from gymmanagement_t.orgdetails where orgcontact='"+req.body.mobilenumber+"'";
                    gymcon.query(sql,function(err,result){
                    if(err){
                        console.log(err)
                    }else 
                    if(result.length>0){
                        res.send("User Already Subscribe on this Module")
                    }else{
                        var sql1="select * FROM gymmanagement_t.gymadmins WHERE userid='"+userId+"' AND subscriptionid <>'"+req.session.subsid+"'";
                        gymcon.query(sql1,function(err,result){
                            console.log(sql1 + " check")
                            if(err){
                                console.log(err)
                            }else {
                                if(result.length > 0) {
                                    // Combination already exists
                                    res.send("User already exists in another organization");
                                } else {
                                    gymcon.query("SELECT * FROM gymadmins WHERE subscriptionid = ? AND userid = ?", [req.session.subsid, userId], function(err, existingResult) {
                                        if(err) {
                                            console.log(err);
                                        } else {
                                            if(existingResult.length > 0) {
                                                // Combination already exists
                                                res.send("alreadyExists");
                                            } else {
                                                // Combination doesn't exist, proceed with insertion
                                                gymcon.query("INSERT INTO gymadmins VALUES (?, ?)", [req.session.subsid, userId], function(err) {
                                                    if(err) {
                                                        console.log(err);
                                                        res.send("error");
                                                    } else {
                                                        gymcon.query("COMMIT");
                                                        res.send("Gym Admin Added Successfully");
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            })
                       
                    }
                })
                    
                    // Check if the combination exists in gymadmins table
                    
                } else {
                    res.send("notfound");
                }
            }
        });
    }
    
    else if (req.body.action === "getgymadmin") {
        gymcon.query("select * from gymmanagement_t.gymadmins a, usermaster_t.users b where a.userid=b.userid and a.subscriptionid='"+req.session.subsid+"'", function(err,result) {
            if(err) {
                console.log(err)
            } else {
                if(result.length>0) {
                    var rs = "<table id='report'><tr><th>Name</th><th>Mobile</th><th>Action</th></tr>"
                    for(i=0;i<result.length;i++)
                    {
                        rs = rs + "<tr><td>"+result[i].name+"</td><td>"+result[i].mobile+"</td><td><button onclick=removeadmin('"+result[i].userid+"')>Remove Admin</button></td></tr>"
                    }
                    rs = rs + "</table>"
                } else {
                    rs = "No admin assgined."
                }
                res.send(rs)
            }
        })
    }else if(req.body.action==='membermenu'){
        req.session.subsid = req.body.name;
        res.send("Okay")

    }else if(req.body.action==='getallsubscriptions'){
        var sql1 = "select subscriptionid as id, orgname as name from orgdetails where subscriptionid in(select subscriptionid from gymmembers where memberid like'"+req.session.userid+"')";
        gymcon.query(sql1,function(error, results){
            console.log(sql1 + " &&&&&&&&&&&&&&&&")
            if(error) console.log(error)
            else if(results.length>0){
                var rs = []
                for(i=0;i<results.length;i++)
                {
                    rs.push(results[i])
                }
                res.send(rs)
            }else{
                res.send("No Data")
            }
        })
    }else if(req.body.action==='removeplans'){
        gymcon.query("Delete from gymplans where planname like'"+req.body.planname+"' and subscriptionid like'"+req.session.subsid+"'",function(err, results){
            if(err) console.log(err)
            else{
                res.send("Plan Is Removed")
            }
        })
    }else if(req.body.action === 'getmemberprofile'){
        gymcon.query("select gymmembers.name,gymmembers.mobileno,gymmembers.Address1,gymmembers.city,gymmembers.pin,gymmembers.email,gymmembers.memberid2,gymmembers.anniversarydate,gymmembers.birthdate from gymmembers where gymmembers.subscriptionid like'"+req.session.subsid+"' and gymmembers.memberid like'"+req.session.userid+"'",function(err,result){
            console.log(result)
            if(err) console.log(err)
            else if(result.length>0){
                let info = []
                if(result[0].name == null || result[0].name == undefined || result[0].name==''){
                    info.push(" ")
                }else{
                    info.push(result[0].name)
                }
                if(result[0].mobileno == null || result[0].mobileno == undefined || result[0].mobileno==''){
                    info.push(" ")
                }else{
                    info.push(result[0].mobileno)
                }
                if(result[0].email == null || result[0].email == undefined || result[0].email==''){
                    info.push(" ")
                }else{
                    info.push(result[0].email)
                }
                if(result[0].Address1 == null || result[0].Address1 == undefined || result[0].Address1==''){
                    info.push(" ")
                }else{
                    info.push(result[0].Address1)
                }
                if(result[0].city == null || result[0].city == undefined || result[0].city==''){
                    info.push(" ")
                }else{
                    info.push(result[0].city)
                }
                
                if(result[0].pin == null || result[0].pin == undefined || result[0].pin==''){
                    info.push(" ")
                }else{
                    info.push(result[0].pin)
                }
                if(result[0].memberid2 == null || result[0].memberid2 == undefined || result[0].memberid2==''){
                    info.push(" ")
                }else{
                    info.push(result[0].memberid2)
                }
                if(result[0].anniversarydate == null || result[0].anniversarydate == undefined || result[0].anniversarydate==''){
                    info.push(" ")
                }else{
                    info.push(result[0].anniversarydate)
                }
                if(result[0].birthdate == null || result[0].birthdate == undefined || result[0].birthdate==''){
                    info.push(" ")
                }else{
                    info.push(result[0].birthdate)
                }
                res.send(info)
            }else{
                res.send("No Details")
            }
        })
    }
    else if(req.body.action==='removeadmin'){
        gymcon.query("delete from gymadmins where userid like'"+req.body.gymadmin+"'", function(err, result){
            if(err) console.log(err)
            else{
                res.send("Admin Removed Successfully")
            }
        })
    }else if(req.body.action == "getmobile"){
        var memberid = req.body.memberid
        gymcon.query("select mobileno from gymmembers where subscriptionid like'"+req.session.subsid+"' and memberid2 like'"+memberid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let number = []
                number.push(result[0].mobileno)
                res.send(number)
            }else{
                res.send("no data")
            }
        })
    } 
    else if (req.body.action === "getgymplans") {
        gymcon.query("select * from gymplans where subscriptionid like '"+req.session.subsid+"'", function(err,result) {
            if(err) {
                console.log(err)
            } else {
                if(result.length>0) {
                    var rs = []
                    for(i=0;i<result.length;i++)
                    {
                        rs.push(result[i].planname)
                    }
                    res.send(rs)
                }
            }
        })
    } else if (req.body.action === "savegymplan") {
        gymcon.query("select * from gymplans where subscriptionid like '"+req.session.subsid+"' and planname like '"+req.body.planname+"'", function(err,result) {
            if(err) {
                console.log(err)
            } else {
                if(result.length>0) {
                    query = "update gymplans set duration="+req.body.duration+", fee="+req.body.fee+" where subscriptionid like '"+req.session.subsid+"' and planname like '"+req.body.planname+"'"
                    res.send("Updated")
                } else {
                    var planid = uuidv4()
                    gymcon.query("insert into gymplans values('"+req.session.subsid+"','"+planid+"','"+req.body.planname+"',"+req.body.duration+","+req.body.fee+")")
                    res.send("Saved")
                }
            }
        })
    }else if(req.body.action === "mamberreport"){
        var startdate = req.body.startdate;
        var enddate = req.body.enddate;
        var onname = req.body.onname;
        var numberofrows =req.body.numberofrows;
        var pagenumber=req.body.pagenumber;
        var reporttype = req.body.reporttype
        var startrow = 0
        if(pagenumber <= 0 || pagenumber === 1|| pagenumber === null || pagenumber === '' || pagenumber === undefined || pagenumber === NaN || pagenumber=='NaN'){
            pagenumber=0;
            startrow = 0
        }
        else{
            startrow=(pagenumber*numberofrows)-numberofrows;
        }
       
        if(onname === null || onname === undefined){
            onname='';
        }
        var onnumber = req.body.onnumber;
        if(onnumber=== null || onnumber === undefined){
            onnumber='';
        }
        if(reporttype == 'Anniversary'){
            var sql ="select  gymmembers.name,gymmembers.mobileno,gymmembers.Address1,gymmembers.Address2,gymmembers.city,gymmembers.pin,gymmembers.email,gymmembers.memberid2,memberplans.startdate,memberplans.enddate,memberplans.fee,memberplans.discount,memberplans.amount,memberplans.status,gymplans.planname,gymplans.planname,gymplans.duration,gymmembers.birthdate,gymmembers.anniversarydate from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' AND gymmembers.subscriptionid = gymplans.subscriptionid and gymmembers.subscriptionid like'"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' AND gymmembers.anniversarydate between '"+startdate+"' AND '"+enddate+"' order by memberplans.startdate desc";
        }else if(reporttype=='Birth Date'){
            var sql ="select gymmembers.name,gymmembers.mobileno,gymmembers.Address1,gymmembers.Address2,gymmembers.city,gymmembers.pin,gymmembers.email,gymmembers.memberid2,memberplans.startdate,memberplans.enddate,memberplans.fee,memberplans.discount,memberplans.amount,memberplans.status,gymplans.planname,gymplans.planname,gymplans.duration,gymmembers.birthdate,gymmembers.anniversarydate from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' AND gymmembers.subscriptionid = gymplans.subscriptionid and gymmembers.subscriptionid like'"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' AND gymmembers.birthdate between '"+startdate+"' AND '"+enddate+"' order by memberplans.startdate desc";
        }else{
            var sql ="select gymmembers.name,gymmembers.mobileno,gymmembers.Address1,gymmembers.Address2,gymmembers.city,gymmembers.pin,gymmembers.email,gymmembers.memberid2,memberplans.startdate,memberplans.enddate,memberplans.fee,memberplans.discount,memberplans.amount,memberplans.status,gymplans.planname,gymplans.planname,gymplans.duration,gymmembers.birthdate,gymmembers.anniversarydate from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' AND gymmembers.subscriptionid = gymplans.subscriptionid and gymmembers.subscriptionid='"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' order by memberplans.startdate desc";
        }
        gymcon.query(sql,function(err,result){
            console.log(sql + " --------memeber report")
            if(err)console.log(err)
            else if(result.length>0){
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>mobileno</th><th>Address1</th><th>city</th><th>Email</th><th>Plan Name</th><th>Duration</th><th>Start Date</th><th>End Date</th><th>Total Fees</th><th>Status</th><th>Birth Date</th><th>Anniversary Date</th><th>Action</th></tr>"
                for(i=0;i<result.length;i++)
                {
                    var birthdate
                    var anniversarydate
                    let sdate = new Date(result[i].startdate);
                    sdate = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2)
                    if(sdate === null || sdate === undefined){   
                        sdate = ''
                    }
                    let edate = new Date(result[i].enddate);
                    edate = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2)
                    if(edate === null || edate === undefined){
                        edate = ''
                    }
                    if(result[i].birthdate == null || result[i].birthdate == undefined || result[i].birthdate == ""){
                        birthdate = ''
                    }else{
                        birthdate = new Date(result[i].birthdate);
                        birthdate = birthdate.getFullYear() + '-' + ('0' + (birthdate.getMonth() + 1)).slice(-2) + '-' + ('0' + birthdate.getDate()).slice(-2)
                        if(birthdate === null || birthdate === undefined){
                            birthdate = ''
                        }
                    }
                    if(result[i].anniversarydate == '' || result[i].anniversarydate == null || result[i].anniversarydate == undefined){
                        anniversarydate = ''
                    }else{
                        anniversarydate = new Date(result[i].anniversarydate);
                        anniversarydate = anniversarydate.getFullYear() + '-' + ('0' + (anniversarydate.getMonth() + 1)).slice(-2) + '-' + ('0' + anniversarydate.getDate()).slice(-2)
                        if(anniversarydate === null || anniversarydate === undefined){
                            anniversarydate = ''
                        }
                    }
                    out = out + "<tr><td>" +result[i].memberid2+ "</td><td>" + result[i].name+ "</td><td>"+ result[i].mobileno+ "</td><td>"+result[i].Address1 + "</td><td>" + result[i].city + "</td><td>"+result[i].email + "</td><td>" + result[i].planname + "</td><td>" + result[i].duration+ "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].amount + "</td><td>"+result[i].status+"</td><td>"+birthdate+"</td><td>"+anniversarydate+"</td><td><button onclick=sendesssage('"+result[i].mobileno+"')><i class='fa fa-whatsapp' style='font-size:24px;'></button></td></tr>"
                }
                out = out + "</table>"
                res.send(out)    
            }else{
                res.send("No Records")
            }
        })
    }else if(req.body.action === 'seepaymentmem'){
        var sdate1 = req.body.sdate
        var edate = req.body.edate
        sdate1=sdate1+" 00:00:00"
        edate = edate+" 23:59:59"
        var sql ="SELECT gymmembers.name,gymmembers.mobileno,gymmembers.memberid2,memberpayments.paymentdate,memberpayments.paymentid,memberpayments.amount,memberpayments.balance,memberpayments.balancedate from gymmembers join memberpayments on gymmembers.memberid=memberpayments.memberid and gymmembers.subscriptionid = memberpayments.subscriptionid where gymmembers.subscriptionid like'"+req.session.subsid+"' and gymmembers.memberid like'"+req.session.userid+"' and memberpayments.paymentdate between '"+sdate1+"' and '"+edate+"' order by memberpayments.paymentdate desc";
        gymcon.query(sql, function(err, results){
            if(err) console.log(err)
            else if(results.length>0){
                let balance;
                let tbalance = 0,tpaymentl = 0;
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Contact No.</th><th>Payment Date</th><th>Paid Fees</th><th>Due Date</th><th>Balance</th></tr>"
                    for(let i=0;i<results.length;i++){
                        balance = results[i].balance
                        if(balance == ''|| balance==null || balance == undefined || balance=='NaN-aN-aN'){
                            balance=''
                        }else{
                            tbalance += balance
                        }
                        tpaymentl += results[i].amount
                        var sdate= new Date(results[i].paymentdate)
                        var edate = new Date(results[i].balancedate)
                        sdate = sdate.getFullYear()+'-'+("0" + (sdate.getMonth() + 1)).slice(-2)+'-'+("0" + sdate.getDate()).slice(-2)
                        if(sdate == ''|| sdate==null || sdate == 'NaN-aN-aN'){
                            sdate = ''
                        }
                        edate = edate.getFullYear()+'-'+("0" + (edate.getMonth() + 1)).slice(-2)+'-'+("0" + edate.getDate()).slice(-2)
                        if(edate == ''|| edate==null || edate == 'NaN-aN-aN'){
                            edate = ''
                        }                  
                        out = out + "<tr><td onclick=popmemberreport2('"+results[i].mobileno+"')>" + results[i].memberid2 + "</td><td>" + results[i].name+ "</td><td>" + results[i].mobileno + "</td><td>" + sdate + "</td><td>" + results[i].amount + "</td><td>" + edate + "</td><td>" + balance + "</td></tr>"  
                    }
                    out = out + "<tr><td>Total</td><td></td><td></td><td>Total Fees Paid</td><td>"+tpaymentl+"</td><td></td><td></td><td></td></tr></table>"
                    res.send(out)
            }
            else
                res.send("No Data")
           
        })
    }
    else if(req.body.action==='seepaymentreport'){
        var sdate1 = req.body.sdate
        var edate = req.body.edate
        var onname = req.body.onname;
        var numberofrows =req.body.numberofrows;
        var pagenumber=req.body.pagenumber;
        sdate1=sdate1+" 00:00:00"
        edate = edate+" 23:59:59"
        if(onname === null || onname === undefined){
            onname='';
        }
         var onnumber = req.body.onnumber;
        if(onnumber=== null || onnumber === undefined){
           onnumber='';
        }
        var sql ="SELECT gymmembers.name,gymmembers.mobileno,gymmembers.memberid2,memberpayments.paymentdate,memberpayments.paymentid,memberpayments.amount,memberpayments.balance,memberpayments.balancedate from gymmembers join memberpayments on gymmembers.memberid=memberpayments.memberid and gymmembers.subscriptionid = memberpayments.subscriptionid where gymmembers.subscriptionid like'"+req.session.subsid+"' and gymmembers.name like'%"+onname+"%' and gymmembers.mobileno like'%"+onnumber+"%' and memberpayments.paymentdate between '"+sdate1+"' and '"+edate+"' order by memberpayments.paymentdate desc";
        gymcon.query(sql, function(err, results){
            if(err) console.log(err)
            else if(results.length>0){
                let balance;
                let tbalance = 0,tpaymentl = 0;
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Contact No.</th><th>Payment Date</th><th>Paid Fees</th><th>Due Date</th><th>Balance</th><th>Action</th></tr>"
                    for(let i=0;i<results.length;i++){
                        balance = results[i].balance
                        if(balance == ''|| balance==null || balance == undefined || balance=='NaN-aN-aN'){
                            balance=''
                        }else{
                            tbalance += balance
                        }
                        tpaymentl += results[i].amount
                        var sdate= new Date(results[i].paymentdate)
                        var edate = new Date(results[i].balancedate)
                        sdate = sdate.getFullYear()+'-'+("0" + (sdate.getMonth() + 1)).slice(-2)+'-'+("0" + sdate.getDate()).slice(-2)
                        if(sdate == ''|| sdate==null || sdate == 'NaN-aN-aN'){
                            sdate = ''
                        }
                        edate = edate.getFullYear()+'-'+("0" + (edate.getMonth() + 1)).slice(-2)+'-'+("0" + edate.getDate()).slice(-2)
                        if(edate == ''|| edate==null || edate == 'NaN-aN-aN'){
                            edate = ''
                        }                  
                        out = out + "<tr><td onclick=popmemberreport2('"+results[i].mobileno+"')>" + results[i].memberid2 + "</td><td>" + results[i].name+ "</td><td>" + results[i].mobileno + "</td><td>" + sdate + "</td><td>" + results[i].amount + "</td><td>" + edate + "</td><td>" + balance + "</td><td><button onclick=sendesssage2('"+results[i].paymentid+"')><i class='fa fa-whatsapp' style='font-size:24px;'></button></td></tr>"  
                    }
                    out = out + "<tr><td>Total</td><td></td><td></td><td>Total Fees Paid</td><td>"+tpaymentl+"</td><td>Total Balance</td><td>"+tbalance+"</td><td></td></tr></table>"
                    res.send(out)
            }
            else
                res.send("No Data")
           
        })
    }else if(req.body.action == 'receipt'){
        var rtext
        gymcon.query("select * from orgdetails where subscriptionid like'"+req.session.subsid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                rtext=""+"*"+result[0].orgname+"* %0a"
            }
        })
        gymcon.query("select memberpayments.paymentdate,memberpayments.amount,memberpayments.balance,memberpayments.balancedate,memberpayments.memberid,gymmembers.memberid2,gymmembers.name,gymmembers.mobileno from memberpayments join gymmembers on memberpayments.memberid = gymmembers.memberid and gymmembers.subscriptionid = memberpayments.subscriptionid where memberpayments.paymentid like'"+req.body.pid+"'",function(err,results){
            if(err) console.log(err)
            else if(results.length>0){
                var sdate= new Date(results[0].paymentdate)
                var edate = new Date(results[0].balancedate)
                sdate = sdate.getFullYear()+'-'+("0" + (sdate.getMonth() + 1)).slice(-2)+'-'+("0" + sdate.getDate()).slice(-2)
                if(sdate == ''|| sdate==null || sdate == 'NaN-aN-aN'){
                    sdate = ''
                }
                edate = edate.getFullYear()+'-'+("0" + (edate.getMonth() + 1)).slice(-2)+'-'+("0" + edate.getDate()).slice(-2)
                if(edate == ''|| edate==null || edate == 'NaN-aN-aN'){
                    edate = ''
                } 
                rtext = rtext+"Dear, "+results[0].name+"%0a"
                rtext = rtext+"Your payment is done successfully for your gym subscription on "+sdate+"%0a"
                rtext = rtext+"Payment Details are as follows %0a"
                rtext = rtext+ "*Member* *ID* *:* "+ results[0].memberid2+"%0a"
                rtext = rtext+"*Payment* *Amount* *:* "+results[0].amount+"%0a"
                rtext = rtext+"*Remaining* *Amount* *:* "+results[0].balance+"%0a"
                rtext = rtext+"*Next* *Due* : "+edate+"%0a"
                rtext = rtext+""
                rtext = "https://wa.me/91" + results[0].mobileno +"?text="+rtext
            }
            res.send(rtext)
        })

    }
    else if(req.body.action==='maxrecords'){
        var onname = req.body.onname;
        var numberofrows =req.body.numberofrows;
        var pagenumber=req.body.pagenumber;
        var startdate = req.body.startdate;
        var enddate = req.body.enddate;
        var reporttype = req.body.reporttype
        if(onname === null || onname === undefined){
            onname='';
        }
         var onnumber = req.body.onnumber;
        if(onnumber=== null || onnumber === undefined){
           onnumber='';
        }
        if(reporttype == 'Anniversary'){
            var sql ="select count(*) as maxrows from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' and gymmembers.subscriptionid like'"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' AND gymmembers.anniversarydate between '"+startdate+"' AND '"+enddate+"' order by memberplans.startdate desc";
        }else if(reporttype=='Birth Date'){
            var sql ="select count(*) as maxrows from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' and gymmembers.subscriptionid like'"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' AND gymmembers.birthdate between '"+startdate+"' AND '"+enddate+"' order by memberplans.startdate desc";
        }else{
            var sql ="select count(*) as maxrows from gymmembers join memberplans on gymmembers.memberid=memberplans.memberid join gymplans on memberplans.planid = gymplans.planid where memberplans.status='Active' and gymmembers.subscriptionid like'"+req.session.subsid+"' and  gymmembers.name like '%"+onname+"%' and gymmembers.mobileno like '%"+onnumber+"%' order by memberplans.startdate desc";
        }
         gymcon.query(sql, function(err, results){
            console.log(sql + " member report ")
            if(err) console.log(err)
            else if(results.length>0){
                var maxrows = results[0].maxrows; 
                res.send("r"+maxrows)
            }
            else
                res.send("No Data")
           
        })
    }else if(req.body.action === 'getnames'){
        var sql ="SELECT name FROM gymmembers WHERE subscriptionid like'"+req.session.subsid+"' order by name desc";
        gymcon.query(sql, function(err, results){
           if(err) console.log(err)
           else if(results.length>0){
               var rs = []
               for(i=0;i<results.length;i++)
               {
                   rs.push(results[i].name)
               }
               res.send(rs)
           }
           else{
                res.send("No Data") 
           }
       })  
    }else if(req.body.action === "addcards"){
        let cardname = req.body.cardname
        let newid = uuidv4()
        gymcon.query("select cardname from gymcards where subscriptionid like'"+req.session.subsid+"' and cardname like '"+cardname+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                res.send("dublicate")
            }else{
                gymcon.query("insert into gymcards(subscriptionid,cardid,cardname)values('"+req.session.subsid+"','"+newid+"', '"+cardname+"')", function(err,result){
                    if(err)console.log(err)
                    else if(result.affectedRows>0){
                        res.send("successful")
                    }else{
                        res.send("unsuccessful")
                    }
                })
            }
        })
    }else if(req.body.action==='getcardnames'){
        gymcon.query("select cardname from gymcards where subscriptionid like'"+req.session.subsid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let rsp = []
               for(i=0;i<result.length;i++)
               {
                
                   rsp.push(result[i].cardname)
               }
               res.send(rsp)
            }else{
                res.send("no")
            }
        })
    }
    else if(req.body.action === 'getexercise'){
        gymcon.query("select exercisesname from gymexercises ORDER BY exercisesname ASC ",function(error,result){
            if(error) console.log(error)
            else if(result.length>0){
                let info = []
                for(i=0;i<result.length;i++)
                {
                    info.push(result[i].exercisesname)
                }
                res.send(info)
            }else{
                res.send("no data")
            }
        })
    }else if(req.body.action === 'addexercise'){
        var sql ="insert into gymcarddetails(cardid,sequence,excerciseid,repetition,weight,times,day)values((select cardid from gymcards where subscriptionid like'"+req.session.subsid+"' and cardname like'"+req.body.cardname+"'), '"+req.body.seq+"',(select exerciseid from gymexercises where exercisesname like'"+req.body.exercisename+"'),'"+req.body.rep+"','"+req.body.weight+"','"+req.body.times+"','"+req.body.exerday+"')";
        gymcon.query(sql,function(err, results){
            console.log(sql + "  - gymcarddetails")
            if(err) console.log(err)
            else if(results.affectedRows>0){
                res.send("successful")
            }else{
                res.send("Unsuccessful")
            }
        })
    }else if(req.body.action == "workoutmember"){
        var tbltext=""
       gymcon.query("select orgname from orgdetails where subscriptionid like'"+req.session.subsid+"'", function(err,results){
           if(err) console.log(err);
           else{
                orgname = results[0].orgname
           }
            gymcon.query("Select gymmembers.name,gymbmireport.bmr,gymmembers.mobileno,gymbmireport.age,gymbmireport.fat,gymbmireport.weight,gymbmireport.height,gymbmireport.bmi,membercard.programmer,membercard.assigneddate,membercard.cardid from gymmembers join gymbmireport on gymmembers.subscriptionid=gymbmireport.subscriptionid and gymmembers.memberid2=gymbmireport.memberid2 join membercard on gymmembers.subscriptionid=membercard.subscriptionid and gymmembers.memberid2=membercard.memberid where gymmembers.subscriptionid like'"+req.session.subsid+"' and gymmembers.memberid like'"+req.session.userid+"' and membercard.assigneddate in(select max(membercard.assigneddate) from membercard where membercard.subscriptionid like '"+req.session.subsid+"' and membercard.memberid in(select memberid2 from gymmembers where subscriptionid like'"+req.session.subsid+"' and memberid like'"+req.session.userid+"')) order by gymbmireport.date desc",function(err,result){
                if(err) console.log(err)
                else if(result.length>0){
                    console.log(result[0].assigneddate)
                    let dassign = new Date(result[0].assigneddate)
                    dassign = dassign.getFullYear() + '-' + ('0' + (dassign.getMonth() + 1)).slice(-2) + '-' + ('0' + dassign.getDate()).slice(-2);
                    tbltext = "<table id='gymcard23' style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0' align='center'><tr><td></td></tr>"    
                    tbltext = tbltext + "<tr height='100px'><td style='text-align:left;'><img src='/getlogogym/"+req.session.subsid+".png' style='height:80px; width:80px;' onerror=this.style.display=none></td><td colspan='5'align='center' style='text-align:center; padding-right:50px'><h2 style='color:black; font-size:20px;'>"+orgname+"</h2></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Name:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+result[0].name+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI Report</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Contact:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+result[0].mobileno+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>AGE:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].age+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Issue Date:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+dassign+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>HEIGHT:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].height+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Programmer:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+result[0].programmer+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Weight:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].weight+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>FAT:</b></td></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].fat+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMR:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].bmr+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].bmi+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE Day 1</b></td></tr>"
                    tbltext = tbltext + "<tr  style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Categories</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>exercisesname</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Sequence</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Repetition</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>times</b></td></tr>"                
                    let sql2="select gymcards.cardname,gymcarddetails.sequence,gymcarddetails.excerciseid,gymcarddetails.repetition,gymcarddetails.weight,gymcarddetails.times,gymcarddetails.day,gymexercises.exercisesname,gymexercises.exercisesdescription,gymexercises.categories from gymcards join gymcarddetails on gymcards.cardid = gymcarddetails.cardid join gymexercises on gymcarddetails.excerciseid=gymexercises.exerciseid where gymcards.subscriptionid like'"+req.session.subsid+"' and gymcards.cardname='"+result[0].cardid+"' order by gymcarddetails.day,gymcarddetails.sequence"
                    gymcon.query(sql2,function(err,results){
                        console.log(sql2)
                        if(err) console.log(err)
                        else{
                            if(results.length>0){
                                //out = "<table id='report'> <caption style='text-align:center; font-weight: bold; font-size:15px;'>"+results[0].cardname+"</caption><tr><th>Day</th><th>categories</th><th>Exercise Name</th><th>Sequence</th><th>Repetition</th><th>Times</th></tr>"
                                var day = "Day 1"
                                for(i=0;i<results.length;i++)
                                {             
                                    if(results[i].day == day){
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                                    }else{
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE "+results[i].day+"</b></td></tr>"
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                                        day = results[i].day
                                    }
                                }
                                tbltext=tbltext+"</table>"
                                res.send(tbltext)
                            }else{
                                res.send("No Data")
                            }
                        }
                    })
                }else{
                    res.send("Member ID Not Found")
                }
                
            })
       })
    }else if(req.body.action == "preassignedcard"){
       let programmer = req.body.programmer    
       let memberid = req.body.memberid
       let cardname = req.body.cardname
       var today = new Date();
       var orgname = ''
       today = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
       var tbltext=""
       gymcon.query("select orgname,logoid from orgdetails where subscriptionid like'"+req.session.subsid+"'", function(err,results){
           if(err) console.log(err);
           else{
                orgname = results[0].orgname
           }
           var sql ="Select gymmembers.name,gymbmireport.bmr,gymmembers.mobileno,gymbmireport.age,gymbmireport.fat,gymbmireport.weight,gymbmireport.height,gymbmireport.bmi from gymmembers join gymbmireport on gymmembers.subscriptionid=gymbmireport.subscriptionid and gymmembers.memberid2=gymbmireport.memberid2 where gymmembers.subscriptionid like'"+req.session.subsid+"' and gymmembers.memberid2 like'"+memberid+"' order by gymbmireport.date desc";
            gymcon.query(sql,function(err,result){
                console.log(sql + " - preassignedcard")
                if(err) console.log(err)
                else if(result.length>0){
                    tbltext = "<table id='gymcard23' style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0' align='center'><tr><td></td></tr>"    
                    tbltext = tbltext + "<tr height='100px'><td style='text-align:left;'><img src='/getlogogym/"+req.session.subsid+".png' style='height:80px; width:80px;' onerror=this.style.display=none></td><td colspan='5'align='center' style='text-align:center; padding-right:50px'><h2 style='color:black; font-size:20px;'>"+orgname+"</h2></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Name:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+result[0].name+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI Report</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Contact:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+result[0].mobileno+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>AGE:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].age+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Issue Date:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+today+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>HEIGHT:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].height+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Programmer:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>"+programmer+"</b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Weight:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].weight+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>FAT:</b></td></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].fat+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMR:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].bmr+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b>"+result[0].bmi+"</b></td></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                    tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE Day 1</b></td></tr>"
                    tbltext = tbltext + "<tr  style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Categories</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>exercisesname</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Sequence</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Repetition</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>times</b></td></tr>"                
                    gymcon.query("select gymcards.cardname,gymcarddetails.sequence,gymcarddetails.excerciseid,gymcarddetails.repetition,gymcarddetails.weight,gymcarddetails.times,gymcarddetails.day,gymexercises.exercisesname,gymexercises.exercisesdescription,gymexercises.categories from gymcards join gymcarddetails on gymcards.cardid = gymcarddetails.cardid join gymexercises on gymcarddetails.excerciseid=gymexercises.exerciseid where subscriptionid like'"+req.session.subsid+"' and cardname='"+cardname+"' order by gymcarddetails.day,gymcarddetails.sequence",function(err,results){
                        if(err) console.log(err)
                        else{
                            if(results.length>0){
                                //out = "<table id='report'> <caption style='text-align:center; font-weight: bold; font-size:15px;'>"+results[0].cardname+"</caption><tr><th>Day</th><th>categories</th><th>Exercise Name</th><th>Sequence</th><th>Repetition</th><th>Times</th></tr>"
                                var day = "Day 1"
                                for(i=0;i<results.length;i++)
                                {             
                                    if(results[i].day == day){
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                                    }else{
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE "+results[i].day+"</b></td></tr>"
                                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                                        day = results[i].day
                                    }
                                }
                                tbltext=tbltext+"</table>"
                                res.send(tbltext)
                            }else{
                                res.send("No Data");
                            }
                        }
                    })
                }else{
                    res.send("FIrst Add This Member BMI");
                }
                
            })
       })
    }
    else if(req.body.action === 'previewcard'){
        gymcon.query("select gymcards.cardid,gymcards.cardname,gymcarddetails.sequence,gymcarddetails.excerciseid,gymcarddetails.repetition,gymcarddetails.weight,gymcarddetails.times,gymcarddetails.day,gymexercises.exercisesname,gymexercises.exercisesdescription,gymexercises.categories from gymcards join gymcarddetails on gymcards.cardid = gymcarddetails.cardid join gymexercises on gymcarddetails.excerciseid=gymexercises.exerciseid where subscriptionid like'"+req.session.subsid+"' and cardname='"+req.body.cardname+"' order by gymcarddetails.day,gymcarddetails.sequence",function(err,results){
            if(err) console.log(err)
            else{
                if(results.length>0){
                    tbltext=""
                    tbltext = "<table id='gymcard23' style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0' align='center'><tr><td></td></tr>"    
                        tbltext = tbltext + "<tr height='100px'><td style='text-align:left;'><img src='/getlogogym/"+req.session.subsid+".png' style='height:80px; width:80px;' onerror=this.style.display=none></td><td colspan='5'align='center' style='text-align:center; padding-right:50px'><h2 style='color:black; font-size:20px;'>GOLD'S GYM</h2></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Name:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI Report</b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Contact:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>AGE:</b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Issue Date:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>HEIGHT:</b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Programmer:</b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Weight:</b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>FAT:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td align='right' style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMR:</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black;; border-collapse: collapse;' ><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td colspan='2' align='right' style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>BMI</b></td><td style='text-align:left; font-size:15px; border:none; border-collapse: collapse;'><b></b></td></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;' cellspacing='0' cellpadding='0'></tr>"
                        tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE Day 1</b></td></tr>"
                        tbltext = tbltext + "<tr  style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Action</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Categories</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>exercisesname</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Sequence</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>Repetition</b></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><b>times</b></td></tr>"              
                    //out = "<table id='report'> <caption style='text-align:center; font-weight: bold; font-size:15px;'>"+results[0].cardname+"</caption><tr><th>Day</th><th>categories</th><th>Exercise Name</th><th>Sequence</th><th>Repetition</th><th>Times</th></tr>"
                    var day = "Day 1"
                    for(i=0;i<results.length;i++)
                    {             
                        if(results[i].day == day){
                            var days2 = results[i].day
                            days2 = days2.replace(/\s/g, '')
                            tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><button onclick=removeexercises('"+results[i].excerciseid+"','"+results[i].cardid+"','"+days2+"')>X</button></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                        }else{
                            var days2 = results[i].day
                            days = days2.replace(/\s/g, '')
                            tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse; text-align:center;'><td align='center' style='text-align:center; font-size:15px;'><b>EXERCISE "+results[i].day+"</b></td></tr>"
            
                            tbltext = tbltext + "<tr style='border:1px solid black; border-collapse: collapse;'><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'><button onclick=removeexercises('"+results[i].excerciseid+"','"+results[i].cardid+"','"+days+"')>X</button></td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].categories+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].exercisesname+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].sequence+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].repetition+"</td><td style='text-align:left; font-size:15px; border:1px solid black; border-collapse: collapse;'>"+results[i].times+"</td></tr>"
                            day = results[i].day
                        }
                    }
                    tbltext=tbltext+"</table>"
                    res.send(tbltext)
                }else{
                    res.send("No Data")
                }
            }
        })
    }else if(req.body.action==="removeexercises"){
        var txt1=req.body.day
        var txt2 = txt1.slice(0, 3) + " " + txt1.slice(3);
        console.log(txt2)
            gymcon.query("delete from gymcarddetails where cardid like'"+req.body.cardid+"' and excerciseid like'"+req.body.execiesseid+"' and day like'"+txt2+"'",function(error,result){
            if(error) console.log(error)
            else if(result.affectedRows>0){
                res.send("Exercise Removed Successfully")
            }else{
                res.send("Error Happend")
            }
        })
    }else if(req.body.action == "assignworkoutcard"){
        var newid = uuidv4()
        let path = "./userdata/gymdata/"+req.session.subsid+"/gymworkoutcard/" 
        let cardname = req.body.cardname
        let memberid = req.body.memberid
        let programmer = req.body.programmer
        let pdate2 = new Date()
        let pdate = pdate2.getFullYear()+'-'+("0" + (pdate2.getMonth() + 1)).slice(-2)+'-'+("0" + pdate2.getDate()).slice(-2) +" "+pdate2.getHours()+':'+pdate2.getMinutes()+':'+pdate2.getSeconds();
        let image = req.body.image
        gymcon.query("select memberid2 from gymmembers where subscriptionid like'"+req.session.subsid+"' and memberid2 like'"+memberid+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                if(image === ''|| image == null || image == undefined){
                    res.send("Please Create Card First")
                }else{
                    if (fs.existsSync("./userdata/gymdata/" + req.session.subsid)){
                }
                else{
                    fs.mkdir("./userdata/gymdata/" + req.session.subsid, function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                        }
                    })
                    }
                    if (fs.existsSync("./userdata/gymdata/"+req.session.subsid+"/gymworkoutcard")){
                    }
                    else{
                    fs.mkdir("./userdata/gymdata/"+req.session.subsid+"/gymworkoutcard", function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                        }
                    })
                    }
                    var optionalObj = {'fileName': newid, 'type':'png'};
                    base64ToImage(image,path,optionalObj);
                    gymcon.query("insert into membercard(subscriptionid,cardid,memberid,programmer,cardlink,assigneddate)values('"+req.session.subsid+"','"+cardname+"','"+memberid+"','"+programmer+"','"+newid+"','"+pdate+"')",function(err,result){
                        if(err) console.log(err)
                        else if(result.affectedRows>0){
                            res.send("Successful")
                        }else{
                            res.send("Unsucessful")
                        }    
                    })
                }
            }else{
                res.send("Please Enter Valid ID")
            }
        })
       
    }else if(req.body.action==='removeexercise'){
        gymcon.query("delete from gymcarddetails where excerciseid like'"+req.body.id+"' and cardid in(select cardid from gymcards where subscriptionid like'"+req.session.subsid+"' and cardname like'"+req.body.cardname+"')",function(err,result){
            if(err) console.log(err)
            else if(result.affectedRows>0){
                res.send("Successful")
            }else{
                res.send("Uncessful")
            }    
        })
    }
    else if(req.body.action === 'opengymaccount'){
        mcon.query("select * from subscriptions where subscriptionid='" + req.session.subsid + "' and moduleid=8", function(err, results){
            console.log(results)
            if(err) console.log(err)  
            else{
                if(results.length>0){
                    acc = [];
                    var date_ob = new Date();
                    let date = new Date(results[0].enddate)
                    var diff = date.getTime() - date_ob.getTime()  
                    var daydiff = diff / (1000 * 60 * 60 * 24)
                    console.log(daydiff)
                    if(daydiff>0){
                        acc.push("Active")
                        let days = Math.round(daydiff)
                        acc.push(days)
                    }
                    else{
                        acc.push("dective")
                        let days = 0
                        acc.push(days)
                    }
                    acc.push(results[0].startdate);
                    acc.push(results[0].enddate);
                    acc.push(results[0].usedquota);
                    acc.push(results[0].quota)
                    res.send(acc);
                }
                else{
                    res.send("error")
                }
            }       
        })
    }
    else if(req.body.action === "showmyplans"){
        gymcon.query("select memberplans.planid,memberplans.startdate,memberplans.enddate,memberplans.fee,memberplans.discount,memberplans.amount,memberplans.status,gymplans.planname,gymplans.duration from memberplans join gymplans on memberplans.planid = gymplans.planid where memberplans.subscriptionid like'"+req.session.subsid+"' and memberplans.memberid in(select memberid from gymmembers where mobileno like '"+req.body.membermobile+"' and subscriptionid like '"+req.session.subsid+"') order by startdate desc", function(err, results){
            if(err){
                console.log(err)
            }
            else if(results.length>0){
                var rs = []
                    for(i=0;i<results.length;i++)
                    {
                        rs.push(results[i])
                    }
                    res.send(rs)
            }
            else{
                res.send("No Data")
            }
        })
    }
    else if(req.body.action === 'saveimage'){
        let memberid = req.body.memberid
        //var km = req.body.mimage.replace(/^data:image\/png;base64,/, "");
        //res.sendFile(__dirname + "/userdata/gymdata/" + km +'.png')
        if(memberid != '' && memberid === undefined){
            res.send("Please search member first")
        }
        else{
            var path ='./userdata/gymdata/'+req.session.subsid+"/gympictures/";
            if (fs.existsSync("./userdata/gymdata/" + req.session.subsid)){
       }
       else{
           fs.mkdir("./userdata/gymdata/" + req.session.subsid, function(err) {
               if (err) {
                 console.log(err)
               } else {
               }
           })
           fs.mkdir("./userdata/gymdata/" +req.session.subsid+"/gymfiles", function(err) {
            if (err) {
              console.log(err)
            } else {
            }
        })
        fs.mkdir("./userdata/gymdata/" +req.session.subsid+"/gympictures", function(err) {
            if (err) {
              console.log(err)
            } else {
            }
        })
       }
            var optionalObj = {'fileName': memberid, 'type':'png'};
            base64ToImage(req.body.mimage,path,optionalObj);
            res.send("Profile photo saved")
        }
        
        /*
        fs.sendFile("./userdata/gymdata/out.png", base64Data, 'base64', function(err) {
            console.log(err);
        });*/
    }
    else if(req.body.action === "savebmi"){
        console.log("far away")
        var bmiid = uuidv4()
        var date_ob = new Date();
        var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
        gymcon.query("select memberid2 from gymmembers where subscriptionid like'"+req.session.subsid+"' and memberid2 like'"+req.body.mid2+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                gymcon.query("insert into gymbmireport(memberid2,subscriptionid,age,fat,weight,height,bmi,date,bmiid,bmr) values('"+req.body.mid2+"', '"+req.session.subsid+"', '"+req.body.mage+"', '"+req.body.mfat+"', '"+req.body.mheight+"', '"+req.body.mweight+"', '"+req.body.mbmi+"', '"+currentdate+"', '"+bmiid+"','"+req.body.mbmr+"')", function(err, result){
                    if(err){
                        console.log(err)
                        res.send("Error occured please check id")
                    } 
                    else{
                        res.send("BMI report is added")
                    }
                })
            }else{
                res.send("Please Check Member ID")
            }          
        }) 
    } 
    else if(req.body.action === "insertmemberdetails"){
        console.log("Here")
        var date_ob = new Date();
        var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2);
        console.log(currentdate)
        let foldadd = "./userdata/gymdata/"+req.session.subsid+"/gymfiles/"+req.session.userid+".csv"
        let filename = ''
        setTimeout(() => {
            let fn = foldadd+filename
            console.log(fn)
            let count = 0;
            let dcount = 0;
            csvtojson().fromFile(fn).then(source =>{
                for (var i = 0; i < source.length; i++){
                    let contactno = source[i].ContactNumber; 
                    let name = source[i].Name;
                    let email = source[i].Email || '' ;                  ;
                    let memberid2 = source[i].MemberID;
                    console.log(memberid2 + " %%%%%%")
                    let address1 = source[i].Address1 || '';
                    let address2 = source[i].Address2 || ''; 
                    let pin = source[i].Pin || ''; 
                    let city = source[i].City || ''; 
                   // var newId = uuidv4();
                    console.log(contactno + " "+name)   
                    if(contactno != "" && name != ""){                  
                        gymcon.query("select * from gymmembers where subscriptionid like'"+req.session.subsid+"' and memberid2 like'"+memberid2+"'", function(err, results){
                           if(err) {
                               console.log(err)
                           }else if(results.length > 0){
                            console.log("memberid already exit ")
                            dcount +=1;
                            // var sql2 ="update gymmembers set name='"+name+"', Address1='"+address1+"', Address2='"+address2+"', city='"+city+"', pin='"+pin+"', email='"+email+"' where subscriptionid like'"+req.session.subsid+"' and memberid2 like'"+memberid2+"'";
                            // console.log(sql2 + " update upload file ")    
                            // gymcon.query(sql2, function(err, results1){
                            //         if(err) console.log(err)
                            //         else{
                            //             dcount +=1;
                            //         }
                            //     })
                            }
                            else{
                                var sql = " select * from usermaster_t.users where mobile='"+contactno+"'";
                                mcon.query(sql,function(err,result){
                                    console.log(sql + " mcon check user ")
                                    if(err){
                                        console.log(err)
                                    }else if(result.length>0){
                                        let userid = result[0].userid;                                        
                                        // var newId = uuidv4();
                                        var sql3="INSERT INTO gymmembers(subscriptionid,memberid,name,mobileno,Address1,Address2,city,pin,email,memberid2)VALUES('"+req.session.subsid+"', '"+userid+"', '"+name+"', '"+contactno+"', '"+address1+"', '"+address2+"', '"+city+"', '"+pin+"', '"+email+"','"+memberid2+"')";
                                        gymcon.query(sql3, function(err, results2){
                                        console.log(sql3 + " - insert upload file")
                                        if(err) console.log(err)
                                        else
                                            count +=1;
                                    }) 
                                    }else{
                                        var userid3 = uuidv4();
                                        var sql6 = "Insert Into usermaster_t.users(userid,name,password,mobile,email) values('"+userid3+"','"+name+"','"+contactno+"','"+contactno+"','"+email+"') ";
                                        mcon.query(sql6,function(err,result1){
                                            console.log(sql6 + " sql6 0000000000000")
                                            if(err){
                                                console.log(err)
                                            }else{
                                                // var newId = uuidv4();
                                                var sql3="INSERT INTO gymmembers(subscriptionid,memberid,name,mobileno,Address1,Address2,city,pin,email,memberid2)VALUES('"+req.session.subsid+"', '"+userid3+"', '"+name+"', '"+contactno+"', '"+address1+"', '"+address2+"', '"+city+"', '"+pin+"', '"+email+"','"+memberid2+"')";
                                                gymcon.query(sql3, function(err, results2){
                                                console.log(sql3 + " - insert upload file")
                                                if(err) console.log(err)
                                                else
                                                    count +=1;
                                            }) 
                                            count +=1;
                                            }
                                        })
                                    }
                                })
                                
                            }
                        })
                    }                       
                }
                setTimeout(() => {
                    res.send("Total members are "+ count +" Existed Members are "+dcount) 
                }, 3000);
            }) 
        }, 4000);
    }
    else if(req.body.action === 'insertmemberdetails2'){
        let count = 0;
        let dcount = 0;
        let foldadd = "./userdata/gymdata/"+req.session.subsid+"/gymfiles/"+req.session.userid+".csv"
        let filename = '';
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        const myPromise = new Promise((resolve, reject) => {
            let fn = foldadd
            console.log(fn)
            csvtojson().fromFile(fn).then(source => {
                for (var i = 0; i < source.length; i++) {
                    var newId = uuidv4();
                    let MemberID = source[i].MemberID 
                    let PaymentDate = source[i].PaymentDate || '';
                    let Balancedate = source[i].NextDueDate || '';  
                    let paid = source[i].PaidAmount || '';
                    let balance = source[i].RemainingAmount || '';
                    let pdate2 = new Date(PaymentDate)
                    let pdate = pdate2.getFullYear()+'-'+("0" + (pdate2.getMonth() + 1)).slice(-2)+'-'+("0" + pdate2.getDate()).slice(-2);

                    console.log(pdate + " - sdata")
                        if(pdate.match(regex)){
                            pdate = pdate
                        }else{
                            res.send("Incorrect date formate, Date formate must be yyyy-mm-dd")
                            return;
                        }

                    let bdate2 = new Date(Balancedate);
                    let bdate = bdate2.getFullYear()+'-'+("0" + (bdate2.getMonth() + 1)).slice(-2)+'-'+("0" + bdate2.getDate()).slice(-2);
                    console.log(bdate + " - sdata")
                    if(bdate.match(regex)){
                        bdate = bdate
                    }else{
                        res.send("Incorrect date formate, Date formate must be yyyy-mm-dd")
                        return;
                    }

                    if((MemberID != null || MemberID != '' || MemberID != undefined || MemberID != 'undefined')  && (pdate !='null' || pdate !=null || pdate !='undefined' || pdate !=undefined || bdate !='null' || bdate !=null || bdate !='undefined' || bdate !=undefined))
                    {                    
                       
                        gymcon.query("select memberid2 from gymmembers where memberid2 like'"+MemberID+"' and subscriptionid like '"+req.session.subsid+"'",function(err, data){
                            if(err) console.log(err)
                            else if(data.length>0){
                        var sql ="insert into memberpayments(subscriptionid,memberid,paymentdate,amount,balance,balancedate,paymentid)values('"+req.session.subsid+"',(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like'"+req.session.subsid+"'), '"+pdate+"', '"+paid+"', '"+balance+"', '"+bdate+"', '"+newId+"')";
                                gymcon.query(sql, function(err, result){
                                    console.log(sql +" balance $$$")
                                    if(err){
                                        console.log(err)
                                        dcount +=1;
                                    } 
                                    else{
                                        count +=1;
                                    } 
                                })
                            }else{
                                dcount +=1;
                            }
                        })
                    }else{
                        console.log(" file upload data , id error")
                        dcount +=1;
                    }
                }
            })
        }).then(()=>{
            res.send("Total payment records are "+ count +" Member not exists "+dcount) 
        })
    }
    else if(req.body.action === "insertmemberdetails3"){
        let num = 0;
        let count = 0;
        let dcount = 0;
        let pcount = 0;
        let foldadd = "./userdata/gymdata/"+req.session.subsid+"/gymfiles/"+req.session.userid+".csv"
        let filename = ''
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        const myPromise = new Promise(async function(resolve, reject) {
            let fn = foldadd
            console.log(fn + " -fn")
            try {
                await csvtojson().fromFile(fn).then(source => {
                    console.log(source.length+" ---")
                    for (var i = 0; i < source.length; i++) {
                        console.log(i +"  ****")
                        num +=1;
                        var newId = uuidv4();
                        let MemberID = source[i].MemberID;
                        let PlanName = source[i].PlanName;
                        let Fees = source[i].Fees || '';
                        let Discount = source[i].Discount || '';
                        let Amount = source[i].TotalAmount || '';
                        let Status = source[i].Status || '';
                        let pdate2 = new Date(source[i].StartDate) || '';
                        console.log(MemberID + " -MemberID -" + " " + PlanName + " planname" + " " + Fees + " Fees" + " " + Discount + " " + Amount + " " + Status + " " + pdate2)

                        let sdate = pdate2.getFullYear()+'-'+("0" + (pdate2.getMonth() + 1)).slice(-2)+'-'+("0" + pdate2.getDate()).slice(-2) ;
                        if (!isNaN(pdate2.getTime())) {
                            // Construct the valid date string for insertion into the database
                            sdate = pdate2.getFullYear() + '-' + ("0" + (pdate2.getMonth() + 1)).slice(-2) + '-' + ("0" + pdate2.getDate()).slice(-2) ;
                        }
                        if(sdate==''||sdate==null||sdate==undefined || sdate=='NaN-aN-aN'|| sdate=='NaN-aN-aN NaN:NaN:NaN'){
                            sdate = ''
                        }
                        console.log(sdate + " - sdata")
                        if(sdate.match(regex)){
                            sdate = sdate
                        }else{
                            res.send("Incorrect date formate, Date formate must be yyyy-mm-dd")
                            return;
                        }
                
                        let bdate2 = new Date(source[i].EndDate) || '';
                        let edate = bdate2.getFullYear()+'-'+("0" + (bdate2.getMonth() + 1)).slice(-2)+'-'+("0" + bdate2.getDate()).slice(-2) ;
                        if(edate==''||edate==null||edate==undefined || edate=='NaN-aN-aN'|| edate=='NaN-aN-aN NaN:NaN:NaN'){
                            edate = ''
                        }
                        console.log(edate + " - edata")
                        if(edate.match(regex)){
                            edate = edate
                        }else{
                            res.send("Incorrect date formate , Date formate must be yyyy-mm-dd")
                            return;
                        }
            

                        if((MemberID != null || MemberID != '' || MemberID != undefined || MemberID != 'undefined') && (sdate !='null' || sdate !=null || sdate !='undefined' || sdate !=undefined || edate !='null' || edate !=null || edate !='undefined' || edate !=undefined)){           
                            console.log(MemberID + " .... " + sdate + " " + edate)

                            gymcon.query("select memberid2 from gymmembers where memberid2 like'"+MemberID+"' and subscriptionid like '"+req.session.subsid+"'",function(err, data){
                                if(err) console.log(err)
                                else if(data.length>0){
                                    gymcon.query("(select planid from gymplans where planname like '"+PlanName+"' and subscriptionid like '"+req.session.subsid+"')",function(err,result12){
                                        if(err) console.log(err)
                                        else if(result12.length>0){
                                    console.log(MemberID + " member id in query--------")
                                    var sql56 = "select * from memberplans where memberid in(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like '"+req.session.subsid+"') and planid in(select planid from gymplans where planname like '"+PlanName+"' and subscriptionid like '"+req.session.subsid+"')";
                                            gymcon.query(sql56, function(err, results){
                                                console.log(sql56 + " sql 56 select query ____________________________")
                                                if(err) console.log(err)
                                                else if(results.length > 0)
                                                {
                                                    // var sql="update memberplans set status='Deactivate' where memberid in(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like '"+req.session.subsid+"') and status like 'Active' and subscriptionid like'"+req.session.subsid+"'";
                                                    // console.log(sql + " update query first part")
                                                    // gymcon.query(sql, function(err, results1){
                                                    //     if(err) console.log(err)
                                                    //     else{
                                                    //         var sql="update memberplans set startdate='"+sdate+"', enddate='"+edate+"', fee='"+Fees+"', discount='"+Discount+"', amount='"+Amount+"', status='Active' where  memberid in(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like '"+req.session.subsid+"') and planid in(select planid from gymplans where planname like '"+PlanName+"' and subscriptionid like '"+req.session.subsid+"') and subscriptionid like'"+req.session.subsid+"'";
                                                    //         console.log(sql + " update query first part inside else")
                                                    //         gymcon.query(sql, function(err, results2){
                                                    //             if(err) console.log(err)
                                                    //             else{
                                                    //                 console.log(" already exit same member one plan");
                                                    //                 count += 1;
                                                    //                 // console.log(results2)
                                                    //                 // count += 1;
                                                    //             }
                                                    //         })
                                                    //     }
                                                    // })
                                                    console.log("already exist*************")
                                                    
                                                }
                                                else{
                                                    // var sql="update memberplans set status='Deactivate' where memberid in(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like '"+req.session.subsid+"') and status like 'Active' and subscriptionid like'"+req.session.subsid+"'";
                                                    // console.log(sql +" update query in else part")

                                                    // gymcon.query(sql, function(err, results3){
                                                    //     if(err) console.log(err)
                                                    //     else{
                                                            // console.log(results3)
                                                            var sql ="insert into memberplans(subscriptionid,memberid,planid,startdate,enddate,fee,discount,amount,memberid2,status) values('"+req.session.subsid+"',(select memberid from gymmembers where memberid2 like '"+MemberID+"' and subscriptionid like '"+req.session.subsid+"'), (select planid from gymplans where planname like '"+PlanName+"' and subscriptionid like '"+req.session.subsid+"'), '"+sdate+"', '"+edate+"', '"+Fees+"', '"+Discount+"', '"+Amount+"','"+MemberID+"', '"+Status+"')";
                                                            gymcon.query(sql, function(err, result){
                                                                console.log(sql + " insert query in else part")
                                                                if(err) console.log(err)
                                                                else{
                                                                    count += 1;
                                                                }
                                                            })
                                                    //     }
                                                    // })
                                                }
                                            })                                 
                                        }else{
                                            pcount +=1
                                        }
                                    })
                                }else{
                                    console.log(" plan not exist...")
                                    dcount +=1;
                                }              
                            })         
                        }else{
                            console.log(" error on file upload $$$$$")
                            dcount +=1;
                        }
                    }
                    resolve();
                })
            } catch (error) {
                console.log(error)
            }
        })
        myPromise.then(()=>{
            res.send("Records Saved") 
        }).catch(function(err) {
            // Run this when promise was rejected via reject()
            console.log(err)
        })
    }
    else if (req.body.action === "searchgymplan") {
        gymcon.query("select * from gymplans where subscriptionid like '"+req.session.subsid+"' and planname like '"+req.body.planname+"'", function(err,result) {
            if(err) {
                console.log(err)
            } else {
                if(result.length>0) {
                    res.send("["+result[0].duration+","+result[0].fee+"]")
                }
            }
        })
    }else if(req.body.action === "renewplan"){
            let membermobilesearch = req.body.membermobile; 
            let planid = req.body.planid;
            var date_ob = new Date();
            var date = ("0" + date_ob.getDate()).slice(-2);
            var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            var year = date_ob.getFullYear();  
            let hours = date_ob.getHours();
            let minutes = date_ob.getMinutes();
            let seconds = date_ob.getSeconds();
            var currentdate = year+'-'+month+'-'+date +" "+hours+':'+minutes+':'+seconds
            console.log(currentdate + " - currentdate")
            var nextdate = year+'-'+month+'-'+date;
            console.log(nextdate + " -  nextdate")
            var result = new Date(nextdate);
            console.log(result + " 2222result")
            let days = parseInt(req.body.duration)
            console.log(days + " - days ")
            result.setDate(result.getDate() + days);

            let enddate = result.getFullYear()+'-'+("0" + (result.getMonth() + 1)).slice(-2)+'-'+("0" + result.getDate()).slice(-2)+' 00:00:00';
            console.log(enddate + " - enddate")
            gymcon.query("select * from memberplans where memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and status like 'Active'",function(err,results){
                if(err) console.log(err)
                else if(results.length>0){
                    var date_ob = new Date();
                    let date = new Date(results[0].enddate)
                    var diff = date.getTime() - date_ob.getTime()  
                    var daydiff = diff / (1000 * 60 * 60 * 24)
                    if(daydiff>0){
                        let days2 = Math.round(daydiff)
                        days2 += days
                        var result2 = new Date(nextdate);
                        result2.setDate(result2.getDate() + days2);
                        let enddate2 = result2.getFullYear()+'-'+("0" + (result2.getMonth() + 1)).slice(-2)+'-'+("0" + result2.getDate()).slice(-2)+' 00:00:00';
                        console.log(enddate2 + " - enddate2")
                        var sql = "update memberplans set status='Deactivate' where memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and status like 'Active'";
                        gymcon.query(sql, function(err, results1){
                            console.log(sql + " update Active plan ")
                            if(err) console.log(err)
                            else{
                        var sql1 = "update memberplans set startdate='"+currentdate+"', enddate='"+enddate+"', status='Active' where memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and planid like '"+planid+"'";
                                gymcon.query(sql1, function(err, results2){
                                    console.log(sql1 + " - update Active 11111")
                                    if(err) console.log(err)
                                    else{
                                        res.send("Plan is renewed")
                                    }
                                })
                            }
                        })
            
                    }
                    else{
                        var sql3 = "update memberplans set status='Deactivate' where memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and status like 'Active'";
                        gymcon.query(sql3, function(err, results1){
                            console.log(sql3 + " **sql 3")
                            if(err) console.log(err)
                            else{
                                var sql4= "update memberplans set startdate='"+currentdate+"', enddate='"+enddate+"', status='Active' where memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and planid like '"+planid+"'";
                                gymcon.query(sql4, function(err, results2){
                                    console.log(sql4 + " **sql4")
                                    if(err) console.log(err)
                                    else{
                                        res.send("Plan is renewed")
                                    }
                                })
                            }
                        })
            
                    }
                }
            })
        }
        else if(req.body.action === "savepayments"){
            var date_ob = new Date();
            var newId = uuidv4();
            var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            let pdate2 = req.body.pdate;
            let paid = req.body.paid 
            let balance = req.body.balance; 
            let balancedate1 = req.body.balancedate;
            let bdate = new Date(balancedate1);
            let balancedate = bdate.getFullYear()+'-'+("0" + (bdate.getMonth() + 1)).slice(-2)+'-'+("0" + bdate.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            let mobileno = req.body.mobileno;
            let pdate3 = new Date(pdate2);
            let pdate = pdate3.getFullYear()+'-'+("0" + (pdate3.getMonth() + 1)).slice(-2)+'-'+("0" + pdate3.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            gymcon.query("insert into memberpayments(subscriptionid,memberid,paymentdate,amount,balance,balancedate,paymentid)values('"+req.session.subsid+"',(select memberid from gymmembers where mobileno like '"+mobileno+"' and subscriptionid like'"+req.session.subsid+"'), '"+pdate+"', '"+paid+"', '"+balance+"', '"+balancedate+"', '"+newId+"')", function(err, result){
                if(err){
                    console.log(err)
                    res.send("Something went wrong")
                } 
                else 
                    res.send("Payment Successful")
            })
        }
        else if (req.body.action === "showdetails") {
            gymcon.query("select * from gymplans where subscriptionid like '"+req.session.subsid+"' and planid like '"+req.body.planname+"'", function(err,result) {
                if(err) {
                    console.log(err)
                } else {
                    if(result.length>0) {
                        information = []
                        information.push(result[0])
                    res.send(information)
                    }
                }
            })
        }
        else if(req.body.action === "usergymplan"){
            console.log("search GYM")
            gymcon.query("select planid as id, planname as name from gymplans where subscriptionid like '"+req.session.subsid+"'", function(err, result){
                if(err) {
                    console.log(err)
                } else if(result.length>0){
                    planname=[]
                    for(let i=0;i<result.length;i++){
                        planname.push(result[i])
                    }
                    res.send(planname)   
                }
                else{
                    res.send("no")
                }
            })
        }
        else if(req.body.action === "savememberplan"){
            let membermobilesearch = req.body.membermobilesearch;
            let planname = req.body.planname;
            let duration = req.body.duration;
            let startdate = req.body.startdate;
            let enddate = req.body.enddate;
            let discount = req.body.discount;
            let amount2 = req.body.amount2;
            let memberid2 = req.session.memberid;
            let memberid3 = req.body.memberid;
            console.log(memberid2 + " memberid2")
            console.log(memberid3 + " memberid3")
            let fee = req.body.fee;
            var sqlcheck = "select * from gymmanagement_t.memberplans where subscriptionid='"+req.session.subsid+"' and memberid='"+memberid2+"' And status='Active'";
            console.log(sqlcheck + " - sql check")
            gymcon.query(sqlcheck, function(err, result9){
                if(err){
                console.log(err)
                }else if(result9.length>0){
                    res.send("This Member Already Active plan")
                }else{
                    let sql ="select * from gymmembers where subscriptionid like '"+req.session.subsid+"' and mobileno like '"+membermobilesearch+"'";
                    gymcon.query(sql, function(err, data){
                        console.log(sql + " !!! sql ")
                        if(err) console.log(err)
                        else if(data.length>0){
                            var sql1 ="select * from memberplans where subscriptionid like'"+req.session.subsid+"' and  memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"' and subscriptionid like '"+req.session.subsid+"') and planid like'"+planname+"'";
                            
                            gymcon.query(sql1, function(err, results){
                                console.log(sql1 + " - !!! sql1")
                                if(err) console.log(err)
                                else if(results.length > 0){
                                var sql3= "update memberplans set status='Deactivate' where subscriptionid like '"+req.session.subsid+"' and memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"' and subscriptionid like '"+req.session.subsid+"') and status like 'Active'";
                                    gymcon.query(sql3, function(err, results1){
                                        console.log(sql3 + " - !!!! sql3")
                                        if(err) console.log(err)
                                        else{
                                            var sql4 = "update memberplans set startdate='"+startdate+"', enddate='"+enddate+"', fee='"+fee+"', discount='"+discount+"', amount='"+amount2+"', status='Active' where  subscriptionid like'"+req.session.subsid+"' and  memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"') and planid in(select planid from gymplans where planname like '"+planname+"' and subscriptionid like '"+req.session.subsid+"')"; 
                                            gymcon.query(sql4, function(err, results2){
                                                console.log(sql4 + " !!! sql4")
                                                if(err) console.log(err)
                                                else{
                                                    res.send("Plan is Changed")
                                                }
                                            })
                                        }
                                    })
                            
                                }
                                else {
                                    var sql5 = "UPDATE memberplans SET status ='Deactive' WHERE subscriptionid LIKE '" + req.session.subsid + "' AND memberid IN (SELECT memberid FROM gymmembers WHERE mobileno LIKE '" + membermobilesearch + "' AND subscriptionid LIKE '" + req.session.subsid + "') AND status LIKE 'Active'";
                                    gymcon.query(sql5, function(err, results3) {
                                        console.log(sql5 + " - !!!! sql5 ")
                                        if (err) {
                                            console.log(err);
                                            res.send("Error updating existing plan");
                                        } else {
                                            var enddate1 = new Date(enddate);
                                            var currentDate = new Date();
                                            console.log(currentDate + " currentDate");
                                            console.log(enddate1 + " - enddate");
                                            var status = (currentDate > enddate1) ? 'Deactive' : 'Active';
                                
                                            var sql = "INSERT INTO memberplans(subscriptionid, memberid, planid, startdate, enddate, fee, discount, amount, memberid2, status) " +
                                                "VALUES ('" + req.session.subsid + "', " +
                                                "(SELECT memberid FROM gymmembers WHERE mobileno LIKE '" + membermobilesearch + "' AND subscriptionid LIKE '" + req.session.subsid + "'), " +
                                                "'" + planname + "', '" + startdate + "', '" + enddate + "', '" + fee + "', '" + discount + "', '" + amount2 + "', '" + memberid3 + "', '" + status + "')";
                                
                                            // Execute the SQL query
                                            gymcon.query(sql, function(err, result) {
                                                console.log(sql + " status active or deactive ")
                                                if (err) {
                                                    console.log("Error executing SQL query:", err);
                                                    res.send("Error saving plan");
                                                } else {
                                                    if (status === 'Deactive') {
                                                        res.send("Plan is Saved as Deactive");
                                                    } else {
                                                        res.send("Plan is Saved as Active");
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                                
                                // else{
                                //     var sql5 = "update memberplans set status ='Deactivate' where subscriptionid like'"+req.session.subsid+"' and memberid in(select memberid from gymmembers where mobileno like '"+membermobilesearch+"' and subscriptionid like '"+req.session.subsid+"') and status like 'Active'";
                                //     gymcon.query(sql5, function(err, results3){
                                //         console.log(sql5 + " - !!!! sql5 ")
                                //         if(err) console.log(err)
                                //         else{
                                //             var currentDate = new Date();
                                //             console.log(currentDate + " currentDate")
                                //             console.log(enddate + " - enddate")
                                //             // if(currentDate > enddate){
                                //                 if (currentDate > enddate) {
                                //                     var status = 'Deactive';
                                //                 } else {
                                //                     var status = 'Active';
                                //                 }
                                //                 var sql = "INSERT INTO memberplans(subscriptionid, memberid, planid, startdate, enddate, fee, discount, amount, memberid2, status) " +
                                //                     "VALUES ('" + req.session.subsid + "', " +
                                //                     "(SELECT memberid FROM gymmembers WHERE mobileno LIKE '" + membermobilesearch + "' AND subscriptionid LIKE '" + req.session.subsid + "'), " +
                                //                     "'" + planname + "', '" + startdate + "', '" + enddate + "', '" + fee + "', '" + discount + "', '" + amount2 + "', '" + memberid3 + "', '" + status + "')";

                                //             // Execute the SQL query
                                //             gymcon.query(sql, function(err, result) {
                                //                 if (err) {
                                //                     console.log("Error executing SQL query:", err);
                                //                     res.send("Error saving plan");
                                //                 } else {
                                //                     if (status === 'Deactive') {
                                //                         res.send("Plan is Saved as Deactive");
                                //                     } else {
                                //                         res.send("Plan is Saved as Active");
                                //                     }
                                //                 }
                                //             });
                                //         }
                                //     })
                                // }
                            })
                        }
                        else{
                            res.send("Please Check the number or try search operation")
                        }
                    
                    })
                }
                })
            }

        else if(req.body.action === "bmisearchmember"){
            gymcon.query("select * from gymbmireport where memberid2 in(select memberid2 from gymmembers where memberid like'"+req.session.userid+"' and subscriptionid like'"+req.session.subsid+"') and subscriptionid like '"+req.session.subsid+"' order by date desc", function(err, results){
                if(err){
                    console.log(err)
                }
                else if(results.length>0){
                    out = "<table id='report'><tr><th>Date</th><th>Age</th><th>Fat</th><th>Weight</th><th>Height</th><th>BMI</th><th>BMR</th></tr>"
                        for(i = 0; i < results.length; i++){
                            let age = results[i].age;
                            let height = results[i].height;
                            let weight = results[i].weight;
                            let fat = results[i].fat;
                            let bmi = results[i].bmi;
                            let bmr = results[i].bmr;
                            let date = new Date(results[i].date);
                            if(date == '' || date == null || date==undefined){
                                date = ''
                            }else{
                                date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                            }
                            if(age === null || age === undefined){
                                age = '';
                            }
                            if(height === null || height === undefined){
                                height = '';
                            }
                            if(weight === null || weight === undefined){
                                weight = '';
                            }
                            if(fat === null || fat === undefined){
                                fat = '';
                            }
                            if(bmi === null || bmi === undefined){
                                bmi = '';
                            } 
                            if(bmr === null || bmr === undefined){
                                bmr = '';
                            }  
                            out = out + "<tr><td>"+date+"</td><td>" + age + "</td><td>" + fat+ "</td><td>" + weight + "</td><td>" + height + "</td><td>" + bmi + "</td><td>" + bmr + "</td></tr>"
                        }
                        out = out + "</table>"
                        res.send(out)
                }
                else{
                    res.send("Not found")
                }
            })
        }
        else if(req.body.action === "searchbmi"){
            let memberid = req.body.memberid
            gymcon.query("select * from gymbmireport where memberid2 like '"+ memberid+"' and subscriptionid like '"+req.session.subsid+"' order by date desc", function(err, results){
                if(err){
                    console.log(err)
                    console.log(results)
                }
                else if(results.length>0){
                    info1=[]
                        for(let i=0;i<results.length;i++){
                            info1.push(results[i])
                        }
                    res.send(info1)
                }
                else{
                    res.send("not found")
                }
            })
        }
        else if(req.body.action === "searchregmember"){
            let memberid =req.body.memberid
            gymcon.query("select * from gymmembers where memberid2 like '"+ memberid+"' and subscriptionid like '"+req.session.subsid+"'", function(err, results){
                if(err) console.log(err)
                else if(results.length>0){
                    information = []
                    information.push(results[0].memberid)
                    information.push(results[0].name)
                    information.push(results[0].mobileno)
                    gymcon.query("select * from memberplans where memberid like '"+ results[0].memberid+"' and subscriptionid like '"+req.session.subsid+"'", function(err, result){
                        if(err) console.log(err)
                        else if(result.length>0){
                            information.push(result[0].startdate)
                            information.push(result[0].enddate)
                        }
                        gymcon.query("select * from gymbmireport where memberid2 like '"+ memberid+"' and subscriptionid like '"+req.session.subsid+"' order by date desc", function(err, results){
                            if(err){
                                console.log(err)
                            }
                            else if(results.length>0){
                                information.push(results[0].age)
                                information.push(results[0].fat)
                                information.push(results[0].weight)
                                information.push(results[0].height)
                                information.push(results[0].bmi)
                                information.push(results[0].date)

                                res.send(information)
                            }
                            else{
                                res.send(information)
                            }
                        })                        
                        
                    })
                }
            })
        }
        else if(req.body.action === 'markattendancegym'){
            var date_ob = new Date();
            var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            var fdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
            fdate = fdate + " 00:00:00"
            var sdate =  date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
            sdate = sdate + " 23:59:59"
            let memberid= req.body.memberid;
            let sql2 = "select * from gymmanagement_t.gymmembers where subscriptionid='"+req.session.subsid+"' and memberid2='"+memberid+"'";
            gymcon.query(sql2, function(err, result) {
                console.log(sql2 + " ..................")
            if (err) {
                console.log(err);
                res.send('Error occurred while checking balancepayment table.');
            } else if(result.length>0) {
                var memberid6=result[0].memberid;
                let sql3 = "select * from gymmanagement_t.memberpayments where subscriptionid='"+req.session.subsid+"' and memberid='"+memberid6+"'";
                gymcon.query(sql3, function(err, result1) {
                    console.log(sql3 + " ..................")
                    if(err){
                        console.log(err)
                    }else if(result1.length>0){
                    var sql1 = "select * from mattendance where subid like '"+req.session.subsid+"' and memberid2 like '"+memberid+"' and indate between '"+fdate+"' and '"+sdate+"'";
                    gymcon.query(sql1, function(err, result){
                        console.log(sql1 + "sql 1 att 1")
                        if(err) console.log(err)
                        else if(result.length>0){
                            res.send(" Attendance Already Marked")
                        }
                        else{
                            gymcon.query("select * from gymmembers where subscriptionid like '"+req.session.subsid+"' and memberid2 like '"+memberid+"'",function(err, result4){
                                if(err) console.log(err)
                                else if(result4.length>0){
                                    var sql2 = "insert into mattendance(subid,memberid2,indate) values('"+req.session.subsid+"', '"+memberid+"','"+currentdate+"')";
                                    gymcon.query(sql2, function(err, result){
                                        console.log(sql2 + " sql2 att")
                                        if(err) console.log(err)
                                        else
                                            res.send("Attendance is Marked")
                                    })
                                }
                                else{
                                    res.send("Invalid Member ID")
                                }
                                
                            })
                        }
                    })
                } else {
                    res.send("Please first Pay On Your Fee")

                            }
                })
            }
            })
        }
        else if(req.body.action === 'attendacesearch'){
            var date_ob = new Date();
            var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2) +" "+date_ob.getHours()+':'+date_ob.getMinutes()+':'+date_ob.getSeconds();
            var fdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
            fdate = fdate + " 00:00:00"
            var sdate =  date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
            sdate = sdate + " 23:59:50"    
            //  let sql1 = "select mattendance.memberid2, mattendance.indate, gymmembers.name, gymmembers.mobileno, memberplans.startdate, memberplans.enddate, memberpayments.balancedate, max(memberpayments.paymentdate), memberpayments.balance from mattendance join gymmembers on mattendance.subid = gymmembers.subscriptionid and mattendance.memberid2 = gymmembers.memberid2 join memberplans on mattendance.memberid2 = memberplans.memberid2 join memberpayments on memberplans.memberid = memberpayments.memberid where mattendance.subid like '"+req.session.subsid+"' and mattendance.indate between '"+fdate+"' and '"+sdate+"' and memberplans.status='Active' group by memberpayments.memberid order by mattendance.indate desc";
                let sql1 ="SELECT DISTINCT mattendance.memberid2, mattendance.indate, mattendance.subid, gymmembers.name, gymmembers.mobileno, memberplans.startdate, memberplans.enddate, memberpayments.balancedate AS t1, memberpayments.balance FROM mattendance  JOIN gymmembers ON mattendance.subid = gymmembers.subscriptionid AND mattendance.memberid2 = gymmembers.memberid2  JOIN memberplans ON gymmembers.memberid = memberplans.memberid and gymmembers.subscriptionid = memberplans.subscriptionid JOIN memberpayments ON memberplans.memberid = memberpayments.memberid and memberplans.subscriptionid = memberpayments.subscriptionid WHERE mattendance.subid LIKE '"+req.session.subsid+"'  AND mattendance.indate BETWEEN '"+fdate+"' AND '"+sdate+"'  AND memberplans.status = 'Active'  AND memberpayments.paymentdate IN (SELECT MAX(memberpayments.paymentdate) FROM memberpayments WHERE memberplans.memberid = memberpayments.memberid)  ORDER BY mattendance.indate DESC;"
                // let sql1 = "select DISTINCT mattendance.memberid2,mattendance.indate,gymmembers.name,gymmembers.mobileno,memberplans.startdate,memberplans.enddate, memberpayments.balancedate as t1,memberpayments.balance from mattendance join gymmembers on mattendance.subid=gymmembers.subscriptionid and mattendance.memberid2=gymmembers.memberid2 join memberplans on gymmembers.memberid=memberplans.memberid join memberpayments on memberplans.memberid=memberpayments.memberid where mattendance.subid like '"+req.session.subsid+"' and mattendance.indate between '"+fdate+"' and '"+sdate+"' and memberplans.status='Active' and memberpayments.paymentdate in(select MAX(memberpayments.paymentdate) from memberpayments where memberplans.memberid=memberpayments.memberid) order by mattendance.indate desc"
                gymcon.query(sql1, function(err, result){
                console.log(sql1 + " 123 att report")
                if(err) console.log(err)
                else if(result.length>0){
                    var date_ob = new Date();
                    var currentdate = date_ob.getFullYear()+'-'+("0" + (date_ob.getMonth() + 1)).slice(-2)+'-'+("0" + date_ob.getDate()).slice(-2)
                    out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Time</th><th>Start Date</th><th>End Date</th><th>Balance</th><th>Balance Date</th></tr>"
                    for(let i=0;i<result.length;i++){
                        var time = new Date(result[i].indate)
                        if(time == ''|| time==null){
                            time = ''
                        }
                        else{
                            time = time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
                        }
                        var sdate= new Date(result[i].startdate)
                        var edate = new Date(result[i].enddate)
                        let d1 = new Date();
                        var bdate1 = new Date(result[i].t1)
                        bdate = bdate1.getFullYear()+'-'+("0" + (bdate1.getMonth() + 1)).slice(-2)+'-'+("0" + bdate1.getDate()).slice(-2)
                        if(bdate==='NaN-aN-aN' || bdate==='' || bdate === null){
                            bdate = ''
                        }else{
                            var diff1 = bdate1.getTime() - d1.getTime();   
                            var daydiff1 = diff1 / (1000 * 60 * 60 * 24);      
                        }
                        // sdate = sdate.getFullYear()+'-'+("0" + (sdate.getMonth() + 1)).slice(-2)+'-'+("0" + sdate.getDate()).slice(-2)
                        // if(sdate === '0000-00-00 00:00:00' || sdate == ''|| sdate==null){
                        //     sdate = ''
                        // }
                        if (!isNaN(sdate) && sdate !== null && sdate !== '') {
                            sdate = sdate.getFullYear() + '-' + ("0" + (sdate.getMonth() + 1)).slice(-2) + '-' + ("0" + sdate.getDate()).slice(-2);
                        } else {
                            sdate = ''; // Set to blank if NaN or null
                        }
                        // edate = edate.getFullYear()+'-'+("0" + (edate.getMonth() + 1)).slice(-2)+'-'+("0" + edate.getDate()).slice(-2)
                        // if( edate === '0000-00-00 00:00:00'  || edate == ''|| edate==null){
                        //     edate = ''
                        // }  
                        if (!isNaN(edate) && edate !== null && edate !== '') {
                            edate = edate.getFullYear() + '-' + ("0" + (edate.getMonth() + 1)).slice(-2) + '-' + ("0" + edate.getDate()).slice(-2);
                        } else {
                            edate = ''; // Set to blank if NaN or null
                        }             
                        if(currentdate >= edate){
                            out = out + "<tr style='background: #FA8072;'><td>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + time + "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].balance + "</td><td>" + bdate + "</td></tr>"         
                        }
                        else if(bdate==''){
                            out = out + "<tr><td style='background: white'>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + time + "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].balance + "</td><td>" + bdate + "</td></tr>"
                        }
                        else if(daydiff1 <=0 ){
                            out = out + "<tr style='background: #B0E0E6;'><td>" + result[i].memberid2 + "</td><td style='border: 1px solid black;'>" + result[i].name+ "</td><td>" + time + "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].balance + "</td><td>" + bdate + "</td></tr>"
                        }
                        else if(daydiff1 >= 1 && daydiff1 <= 5){
                            out = out + "<tr style='background: #fff782;'><td>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + time + "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].balance + "</td><td>" + bdate + "</td></tr>"            
                        }else{
                            out = out + "<tr><td style='background: white'>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + time + "</td><td>" + sdate + "</td><td>" + edate + "</td><td>" + result[i].balance + "</td><td>" + bdate + "</td></tr>"  
                        }
                    }
                    out = out + "</table>"
                    res.send(out)
                }else{
                    res.send('No Data')
                }
            })
        }
     else if(req.body.action === "searchmember") {
        let mobileno = req.body.membermobile;
        let name = req.body.membername;
        let mid2 = req.body.memberid2;
        let memberid = '';
        let sdate = '';
        let info = []
        let sql ="select * from gymmembers where subscriptionid='"+req.session.subsid+"' and mobileno like '%"+mobileno+"%' and memberid2 like '%"+mid2+"%' and name like '%"+name+"%'"
        console.log(sql +" - search member")
        gymcon.query(sql, function(err,result) {
            if(err) {
                console.log(err)
            } 
            else if(result.length>0){
                info.push(result[0].memberid)
                info.push(result[0].name)
                info.push(result[0].mobileno)
                info.push(result[0].Address1)
                info.push(result[0].Address2)
                info.push(result[0].city)
                info.push(result[0].pin)
                info.push(result[0].email)
                info.push(result[0].memberid2)
                info.push(result[0].anniversarydate)
                info.push(result[0].birthdate)
                memberid = result[0].memberid
                req.session.memberid = result[0].memberid;
                gymcon.query("select * from gymplans where planid in(select planid from memberplans where memberid like '"+memberid+"' and status like 'Active') and subscriptionid like '"+req.session.subsid+"'", function(err, result2){
                    if(err) console.log(err)
                    else if(result2.length > 0){
                        info.push(result2[0].planname)
                        info.push(result2[0].duration)
                        info.push(result2[0].fee)
                        gymcon.query("select * from memberplans where memberid like '"+memberid+"' and subscriptionid like'"+req.session.subsid+"' and status like 'Active'", function(err, result3){
                            if(err) console.log(err)
                            else if(result3.length>0){
                                info.push(result3[0].planid)
                                info.push(result3[0].startdate)
                                info.push(result3[0].enddate)
                                info.push(result3[0].fee)
                                info.push(result3[0].amount)
                                info.push(result3[0].discount)
                                sdate = result3[0].startdate

                                var currentDate = new Date();
                                var endDate = new Date(result3[0].enddate);
                                if(currentDate > endDate) {
                                    // If current date is past the end date, update the status to 'Deactive'
                                    gymcon.query("UPDATE memberplans SET status = 'Deactive' WHERE memberid = ? AND subscriptionid = ? AND status = 'Active'", [memberid, req.session.subsid], function(updateErr, updateResults) {
                                        if(updateErr) {
                                            console.log(updateErr);
                                        } else {
                                            console.log("Status updated to 'Deactive'");
                                        }
                                    });
                                }
                        

                                gymcon.query("select * from memberpayments where memberid like '"+memberid+"' and subscriptionid like'"+req.session.subsid+"' order by paymentdate desc limit 1",function(err, result8){
                                    if(err) console.log(err)
                                    else if(result8.length>0){
                                        info.push(result8[0].balance)
                                        info.push(result8[0].paymentdate)
                                        res.send(info);
                                    }
                                    else{
                                        res.send(info);
                                    }
                                })       
                            }
                            else{
                                res.send(info);
                            }                                                                         
                        })
                    }
                    else{
                        res.send(info);
                    }           
                })
            }
            else{
                res.send("User Not Found")
            }
        })
    }else if(req.body.action === "newmember"){
        var newId = uuidv4();
        let name = req.body.membername;
        let membermobile = req.body.membermobile
        let password = (Math.random() + 1).toString(36).substring(7);
        mcon.query("select userid from users where mobile like'"+membermobile+"'",function(err,result12){
            if(err) console.log(err)
            else if(result12.length>0){
                let userid = result12[0].userid
                gymcon.query("select * from gymmembers where memberid like '"+userid+"' and subscriptionid like'"+req.session.subsid+"'", function(err, result){
                    if(err) console.log(err)
                    else if(result.length > 0){
                        res.send("Metch")
                    }
                    else{
                        gymcon.query("select max(memberid2) as maxid from gymmembers where subscriptionid like '"+req.session.subsid+"'", function(err, results){
                            if(err) console.log(err)
                            else if(results.length>0){
                                let maxid = results[0].maxid;
                                var arr = [];
                                arr.push(maxid + 1);
                                maxid = maxid + 1;
                                
                                gymcon.query("insert into gymmembers(subscriptionid,memberid,name,mobileno,memberid2)values('"+req.session.subsid+"', '"+userid+"', '"+name+"', '"+membermobile+"', '"+maxid+"')", function(err, result){
                                    if(err) console.log(err)
                                    res.send({ message: "New Member created", maxid: arr }); 
                                    // res.send("New Member created "+ maxid)
                                })
                            }
                        })
                    }
                })
            }else{
                var date_ob = new Date();
                var date = ("0" + date_ob.getDate()).slice(-2);
                var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                var year = date_ob.getFullYear();  
                let hours = date_ob.getHours();
                let minutes = date_ob.getMinutes();
                let seconds = date_ob.getSeconds();
                var currentdate = year+'-'+month+'-'+date +" "+hours+':'+minutes+':'+seconds
                mcon.query("insert into users(userid,name,password,mobile,createddate)values('"+newId+"','"+name+"','"+password+"','"+membermobile+"','"+currentdate+"')",function(err,result){
                    if(err) console.log(err)
                    gymcon.query("select * from gymmembers where memberid like '"+newId+"' and subscriptionid like'"+req.session.subsid+"'", function(err, result){
                        if(err) console.log(err)
                        else if(result.length > 0){
                            res.send("Metch")
                        }
                        else{
                            gymcon.query("select max(memberid2) as maxid from gymmembers where subscriptionid like '"+req.session.subsid+"'", function(err, results){
                                if(err) console.log(err)
                                else if(results.length>0){
                                    let maxid = results[0].maxid;
                                    var arr = [];
                                    arr.push(maxid + 1);
                                    maxid = maxid + 1;
                                    gymcon.query("insert into gymmembers(subscriptionid,memberid,name,mobileno,memberid2)values('"+req.session.subsid+"', '"+newId+"', '"+name+"', '"+membermobile+"', '"+maxid+"')", function(err, result){
                                        if(err) console.log(err)
                                        res.send({ message: "New Member created", maxid: arr }); 
                                        // res.send("New Member created Password : "+password)
                                    })
                                }
                            })
                        }
                    })
                })    
            }
        })
    } 
    else if(req.body.action === "paymenthistory"){
        let mobileno = req.body.mobileno;
        var sql ="select memberpayments.paymentid, memberpayments.paymentdate, memberpayments.amount, memberpayments.balance, memberpayments.balancedate, gymmembers.name, gymmembers.mobileno, gymmembers.memberid2 from memberpayments join gymmembers on memberpayments.memberid = gymmembers.memberid and memberpayments.subscriptionid = gymmembers.subscriptionid where memberpayments.memberid in(select memberid from gymmembers where mobileno like '"+mobileno+"') and gymmembers.subscriptionid like '"+req.session.subsid+"' order by paymentdate desc";
        gymcon.query(sql, function(err, result){
            console.log(sql + " lllllllllllllllll")
            if(err) console.log(err)
            else if(result.length>0){
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Mobile No.</th><th>Remaining Amount</th><th>Last Payment</th><th>Payment Date</th><th>Balance Date</th><th>Action</th></tr>"
                for(let i=0;i<result.length;i++){
                    var sdate=new Date(result[i].paymentdate)
                    var bdate=new Date(result[i].balancedate)
                    bdate = bdate.getFullYear() + '-' + ('0' + (bdate.getMonth() + 1)).slice(-2) + '-' + ('0' + bdate.getDate()).slice(-2);
                    if(bdate==='NaN-aN-aN' || bdate==='' || bdate === null){
                        bdate = ''
                    }
          //          bdate = bdate.getFullYear() + '-' + ('0' + (bdate.getMonth() + 1)).slice(-2) + '-' + ('0' + bdate.getDate()).slice(-2);
                    sdate = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
                    out = out + "<tr><td>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + result[i].mobileno + "</td><td>" + result[i].balance + "</td><td>" + result[i].amount + "</td><td>" + sdate + "</td><td>" + bdate + "</td><td><button onclick=deletepayment('"+result[i].paymentid+"')>Delete</button></td></tr>" 
                }
                out = out + "</table>"
                res.send(out)
            }else{
                res.send("No Data")
            }
        })
    }
    else if(req.body.action === "deletepayment"){
        let paymentid = req.body.paymentid;
        gymcon.query("delete from memberpayments where paymentid like '"+paymentid+"'", function(err, result){
            if(err){
                console.log(err)
                res.send("Something went wrong")
            }
            else{
                res.send("Successful")
            }
        })
    }
    else if(req.body.action === "paymenthistory2"){
        let mobileno = req.body.mobileno
        gymcon.query("select memberpayments.paymentid,memberpayments.paymentdate, memberpayments.amount, memberpayments.balance, memberpayments.balancedate, gymmembers.name, gymmembers.mobileno, gymmembers.memberid2 from memberpayments join gymmembers on memberpayments.memberid = gymmembers.memberid and memberpayments.subscriptionid = gymmembers.subscriptionid where memberpayments.subscriptionid like '"+req.session.subsid+"'  order by paymentdate desc", function(err, result){
            if(err) console.log(err)
            else if(result.length>0){
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Mobile No.</th><th>Remaining Amount</th><th>Last Payment</th><th>Payment Date</th><th>Balance Date</th><th>Action</th></tr>"
                for(let i=0;i<result.length;i++){
                    var sdate=new Date(result[i].paymentdate)
                    var bdate=new Date(result[i].balancedate)
                    bdate = bdate.getFullYear() + '-' + ('0' + (bdate.getMonth() + 1)).slice(-2) + '-' + ('0' + bdate.getDate()).slice(-2);
                    if(bdate==='NaN-aN-aN' || bdate==='' || bdate === null){
                        bdate = ''
                    }
                    sdate = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
                    out = out + "<tr><td>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + result[i].mobileno + "</td><td>" + result[i].balance + "</td><td>" + result[i].amount + "</td><td>" + sdate + "</td><td>" + bdate + "</td><td><button onclick=deletepayment('"+result[i].paymentid+"')>Delete</button></td></tr>" 
                }
                out = out + "</table>"
                res.send(out)
            }else{
                res.send("No Data")
            }
        })
    }
    else if (req.body.action==="uploadpic"){
        var memberid2=req.body.memberid2;
        
        console.log(memberid2 + " memberid2")
        // var filename=req.body.filename; 
        var profilephotoid=uuidv4();
        var size=req.body.size;
        var cdate=new Date();
        cdate = cdate.getFullYear() + '-' + ('0' + (cdate.getMonth() + 1)).slice(-2) + '-' + ('0' + cdate.getDate()).slice(-2) + ' ' + ('0' + cdate.getHours()).slice(-2) + ':' + ('0' + cdate.getMinutes()).slice(-2) + ':' + + ('0' + cdate.getSeconds()).slice(-2)
        var sql = "select subscriptions.quota, subscriptions.usedquota from usermaster_t.subscriptions where subscriptionid like '" + req.session.subsid + "'";
        mcon.query(sql, function (err, result) {
            // console.log(sql + "   .....")
            if (err) console.log(err)
                else if (result.length > 0) {
                    let quota = 0, usedquota = 0;
                        if (result[0].quota == null || result[0].quota == undefined || result[0].quota == "") {
                            quota = 0
                            console.log(quota + "  111111 quota")
                        } else {
                            quota = result[0].quota;
                        }
                        if (result[0].usedquota == null || result[0].usedquota == undefined || result[0].usedquota == "") {
                            usedquota = 0
                        } else {
                        usedquota = result[0].usedquota;
                        }
                        if (usedquota > quota) {
                            res.send("You have reached the maximum limit of file upload")
                    } else {
                        return new Promise((resolve, reject) => {
                            savefiledb(req,res,req.session.orgid,(successfun)=>{
                                resolve(successfun)
                            })
                    }).then((data)=>{
                        var sql3 ="update gymmanagement_t.gymmembers set profilephotoid='"+data+"' where subscriptionid='"+req.session.subsid+"' And memberid='"+memberid2+"'";
                        gymcon.query(sql3,function(err,result){
                        console.log(sql3 +" ,,,,,,")
                            if(err) console.log(err)
                            else if(result.affectedRows>0){
                                return new Promise((resolve, reject) => {
                                    gettotalsize2(req.session.subsid, req.session.orgid, (successfun) => {
                                        resolve(successfun)
                                    });
                                }).then((data) => {
                                    res.send("File Upload")
                            })
                        }else{
                            res.send("error")
                        }
                    })     
                })         
            }
        }
        })
    }
    
    else if(req.body.action === 'getprofilepic'){
        var memberid2 = req.body.memberid2;
        let path ="gymdata/profilepic/"+req.session.orgid;
        gymcon.query("select * from gymmembers where subscriptionid='"+req.session.subsid+"' and memberid='"+memberid2+"'",function(err,result){
            if(err) console.log(err)
            else if(result.length>0){
                let fileid = result[0].profilephotoid
                return new Promise((resolve, reject) => {
                    retrivefile(req,res,fileid,path,req.session.orgid,(successfun) => {
                        resolve(successfun);
                    });
                }).then((data)=>{
                    res.send(data)
                    // console.log(data + " data")
                })

            }else{
                res.send("no file")
            }
        })    
    }
    else if(req.body.action === "savemember"){
        console.log("here")
       let membername = req.body.membername;
        let memberaddress1= req.body.memberaddress1;
        let memberaddress2= req.body.memberaddress2;
        let memberemail= req.body.memberemail;
        let membermobile= req.body.membermobile;
        let memberpincode= req.body.memberpincode;
        let membercity= req.body.membercity;
        let memberid2 = req.body.memberid2;
        let bdate = req.body.bdate;
        let anniversarydate = req.body.aniivesarydate;
        console.log(bdate, anniversarydate)
        gymcon.query("select memberid from gymmembers where mobileno like '"+membermobile+"' and subscriptionid like'"+req.session.subsid+"'", function(err, result){
            if(err) console.log(err)
            else if(result.length>0){
        // var sql ="select memberid from gymmembers where memberid2='"+memberid2+"' and subscriptionid like'"+req.session.subsid+"'";
        //         gymcon.query(sql,function(err,result){
        //             if(err) console.log(err)
        //                 else if(result.length>0){
        //                     res.send("Thos")  
        //                 } 
        //         })
         
        let sql2 ="update gymmembers set subscriptionid='"+req.session.subsid+"', name='"+membername+"', mobileno='"+membermobile+"', Address1='"+memberaddress1+"', Address2='"+memberaddress2+"', city='"+membercity+"', pin='"+memberpincode+"', email='"+memberemail+"', memberid2='"+memberid2+"'";
        if (bdate) {
            sql2 += ", birthdate='" + bdate + "'";
        }
        if (anniversarydate) {
            sql2 += ", anniversarydate='" + anniversarydate + "'";
        }
        sql2 += " where memberid='" + result[0].memberid + "' and subscriptionid like'" + req.session.subsid + "'";
              
        gymcon.query(sql2, function(err,result){
                    console.log(sql2 + " ------ ********")
                    if(err){
                        console.log(err)
                        res.send("error")
                    } 
                    else{
                        res.send("Profile saved")
                    }
                })
            }
            else{
                res.send("Please complete registration")
            }
        })   
    }
    
    //csscolor
    else if (req.body.action === 'retrivebgstylecolorgym') {
        var sql = "select * from usermaster_t.bgstyle ";
        mcon.query(sql, function(err, result) {
            console.log(sql +"   retrivprojectname")
            if (err) console.log(err, req);
            else if (result.length > 0) {
                r = [];
                for (i = 0; i < result.length; i++) {
                    r.push('{"name":"' + result[i].name + '","filename":"' + result[i].filename + '"}');
                }
                res.send(r);
            } else {
                res.send("error");
            }
        });
    }
    else if(req.body.action==="orgcolorgym"){
        var csscolor = req.body.csscolor
        var sql = "update gymmanagement_t.orgdetails set csscolor='"+csscolor+"'  where subscriptionid='"+req.session.subsid+"'";
        gymcon.query(sql,function(err,result){
        //    console.log(sql  +  ">>>>")
            if(err)console.log(err)
            else if(result.affectedRows>0){
               res.send("updated successfully")
            }else{
                res.send("orginfo error")
            }
        })
    }
//dashboard
    // else if(req.body.action == "showdashboardactdact"){
    //     // Get today's date in the format 'YYYY-MM-DD'
    //     let today = new Date();
    //     let todayStr = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    
    //     // SQL query to select records only from today's date
    //     var sql="SELECT * FROM gymmanagement_t.memberplans where subscriptionid='7ce9ab9b-89ec-4e4f-84de-606be3bdfeab';"
    //     // let sql = "SELECT * FROM gymmanagement_t.mattendance WHERE DATE(indate) ='"+todayStr+"'";
    //     gymcon.query(sql, function(err, result){
    //         console.log(sql + " - 8989")
    //         if(err) console.log(err)
    //         else if(result.length > 0){
    //             var count=0;
    //             var count1=0;
    //             let out = "<table id='report'><tr><th>Active</th><th>Deactive</th></tr>";
    //             for(let i = 0; i < result.length; i++){
    //                 var status=result[i].status;
                    
    //                 if(status=='Active'){
    //                     var c=0
    //                     count++;
    //                     console.log(c + " - c")
    //                 }else
    //                 {
    //                  count1++;
    //                 }
    //                 // var sdate = new Date(result[i].indate);
    //                 var memberid2 = result[i].memberid2;
    //                 var rotationvalue = Math.floor(Math.random() * 41) - 20;
    //                 // sdate = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
    //             }
    //             console.log(count + "- count")
    //             out = out + "<tr><td style='transform:(" + rotationvalue + "); transition: transform 0.5s ease; background-color:red;'>" + count + "</td><td>"+count1+"</td></tr>";
    //             out = out + "</table>";
    //             res.send(out);
    //         } else {
    //             res.send("No Data");
    //         }
    //     });
    // }

    // else if (req.body.action == "showdashboardactdact") {
    //     // Get today's date in the format 'YYYY-MM-DD'
    //     let today = new Date();
    //     let todayStr = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    
    //     // SQL query to join memberplans and gymmembers tables
    //     let sql = "SELECT mp.*, gm.name, gm.mobileno, gm.Address1, gm.Address2, gm.city, gm.pin, gm.email, gm.anniversarydate, gm.birthdate, gm.profilephotoid FROM gymmanagement_t.memberplans mp LEFT JOIN gymmanagement_t.gymmembers gm ON mp.subscriptionid = gm.subscriptionid AND mp.memberid = gm.memberid WHERE mp.subscriptionid='" + req.session.subsid + "'";
    
    //     // Execute the SQL query to get details from both tables
    //     gymcon.query(sql, function (err, result) {
    //         console.log(sql + " - 8989");
    //         if (err) console.log(err);
    //         else if (result.length > 0) {
    //             let countActive = 0;
    //             let countInactive = 0;
    //             let rotationvalue = Math.floor(Math.random() * 41) - 20;
                
    //             // Calculate active and inactive members from the joined result
    //             for (let i = 0; i < result.length; i++) {
    //                 let status = result[i].status;
    //                 if (status == 'Active') {
    //                     countActive++;
    //                 } else {
    //                     countInactive++;
    //                 }
    //             }
    //             let totalplanmember =countActive+countInactive;
    
    //             // Second query to count total members from gymmembers for the given subscription ID
    //             let totalMembersSql = "SELECT COUNT(*) as totalMembers FROM gymmanagement_t.gymmembers WHERE subscriptionid='" + req.session.subsid + "'";
    //             gymcon.query(totalMembersSql, function (err, totalResult) {
    //                 if (err) {
    //                     console.log(err);
    //                     res.send("Error calculating total members");
    //                 } else {
    //                     let totalMembers = totalResult[0].totalMembers;
    //                     console.log(totalMembers + " - totalMembers");
    
    //                     // Create HTML output
    //                     let out = "<table id='report'><tr><th>Total Members</th><th>total Member In plan </th><th>Active Member Plan</th><th>Deactive Member Plan</th></tr>";
    //                     out += "<tr><td>" + totalMembers + "</td><td>" +totalplanmember +"</td><td>" + countActive + "</td>";
    //                     out += "<td>" + countInactive + "</td>";
    //                     out +="</tr>";
    //                     out += "</table>";
    
    //                     res.send(out);
    //                 }
    //             });
    //         } else {
    //             res.send("No Data");
    //         }
    //     });
    // }
    
    else if (req.body.action == "showdashboardactdact") {
        let today = new Date();
        let todayStr = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    
        // Subquery to select the latest record for each member
        let sql = `SELECT mp.memberid2,gm.name,gm.mobileno,gm.Address1,gm.Address2,gm.city,gm.pin,gm.email,gm.anniversarydate,gm.birthdate,gm.profilephotoid,mp.status,mp.enddate
            FROM (SELECT * FROM gymmanagement_t.memberplans WHERE (memberid2, startdate) IN (SELECT memberid2, MAX(startdate) AS max_startdate FROM gymmanagement_t.memberplans  WHERE subscriptionid = '${req.session.subsid}' GROUP BY memberid2)) mp
            LEFT JOIN  gymmanagement_t.gymmembers gm  ON  mp.subscriptionid = gm.subscriptionid  AND mp.memberid = gm.memberid WHERE  mp.subscriptionid = '${req.session.subsid}'
        `;
    
        gymcon.query(sql, function (err, result) {
            console.log(sql + " - 8989");
            if (err) {
                console.log(err);
                res.send("Error fetching data");
                return;
            } 
    
            if (result.length > 0) {
                let uniqueMembers = {};
    
                // Calculate active and inactive members from the joined result
                for (let i = 0; i < result.length; i++) {
                    let memberId2 = result[i].memberid2;
                    let status = result[i].status;
                    let endDate = new Date(result[i].enddate);
                    let isActive = endDate >= today && status === 'Active';
    
                    if (!uniqueMembers[memberId2] || isActive) {
                        uniqueMembers[memberId2] = {
                            isActive: isActive,
                            member: result[i]
                        };
                    }
                }
    
                let countActive = 0;
                let countInactive = 0;
    
                for (let memberId in uniqueMembers) {
                    if (uniqueMembers[memberId].isActive) {
                        countActive++;
                    } else {
                        countInactive++;
                    }
                }
    
                let totalplanmember = countActive + countInactive;
    
                // Second query to count total members from gymmembers for the given subscription ID
                let totalMembersSql = `
                    SELECT COUNT(DISTINCT memberid2) as totalMembers 
                    FROM gymmanagement_t.gymmembers 
                    WHERE subscriptionid='${req.session.subsid}'
                `;
                gymcon.query(totalMembersSql, function (err, totalResult) {
                    if (err) {
                        console.log(err);
                        res.send("Error calculating total members");
                        return;
                    } 
    
                    let totalMembers = totalResult[0].totalMembers;
                    console.log(totalMembers + " - totalMembers");
    
                    // Create HTML output
                    let out = "<table id='report'><tr><th>Total Members</th><th>Total Members in Plan</th><th>Active Member Plan</th><th>Deactive Member Plan</th></tr>";
                    out += `<tr><td onclick=showtotalmember();>${totalMembers}</td><td onclick=showtotalplanmember();>${totalplanmember}</td><td>${countActive}</td><td>${countInactive}</td></tr>`;
                    out += "</table>";
    
                    res.send(out);
                });
            } else {
                res.send("No Data");
            }
        });
    }
    
    //*** */
   
    else if (req.body.action == "showdashboardattendance") {
        let today = new Date();
        let todayStr = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
        let subscriptionidFilter = req.session.subsid;
    
        let sqlPlans = `SELECT COUNT(DISTINCT mp.memberid2) AS total_members,COUNT(DISTINCT CASE WHEN ma.memberid2 IS NOT NULL THEN mp.memberid2 END) AS marked_attendance,COUNT(DISTINCT CASE WHEN ma.memberid2 IS NULL THEN mp.memberid2 END) AS not_marked_attendance
            FROM (SELECT * FROM gymmanagement_t.memberplans WHERE (memberid2, startdate) IN (SELECT memberid2, MAX(startdate) AS max_startdate FROM gymmanagement_t.memberplans WHERE subscriptionid = '${subscriptionidFilter}' GROUP BY memberid2)) mp
            LEFT JOIN gymmanagement_t.mattendance ma ON  mp.memberid2 = ma.memberid2 AND  DATE(ma.indate) = '${todayStr}' WHERE mp.subscriptionid ='${subscriptionidFilter}'`;
    
        gymcon.query(sqlPlans, function(err, result) {
            console.log(sqlPlans + " &&&&&&&")
            if (err) {
                console.log(err);
                res.send("Error fetching data");
                return;
            }
    
            let totalMembers = result[0].total_members;
            let markedAttendance = result[0].marked_attendance;
            let notMarkedAttendance = result[0].not_marked_attendance;
    
            let out = "<table id='report'><tr><th>Total Members Add On Plan</th><th>Marked Attendance</th><th>Not Marked Attendance</th></tr>";
            out += `<tr>
                        <td>${totalMembers}</td>
                        <td>${markedAttendance}</td>
                        <td>${notMarkedAttendance}</td>
                    </tr>`;
            out += "</table>";
    
            res.send(out);
        });
    }
    
    
    else if(req.body.action == "seebalencereport"){
        let sdate = req.body.sdate
        let edate = req.body.edate
        sdate = sdate + " 00:00:00"
        edate = edate+" 23:59:59"
        let onname = req.body.onname
        let onnumber = req.body.onnumber
        let totalbalance = 0;
        let sql = "select gymmembers.memberid2,gymmembers.name,gymmembers.mobileno,memberplans.amount,memberplans.startdate,memberplans.enddate, memberpayments.balancedate as t1,memberpayments.balance from gymmembers join memberpayments on gymmembers.subscriptionid=memberpayments.subscriptionid and gymmembers.memberid=memberpayments.memberid join memberplans on gymmembers.memberid=memberplans.memberid and gymmembers.subscriptionid=memberplans.subscriptionid where gymmembers.subscriptionid like '"+req.session.subsid+"' and gymmembers.name like'%"+onname+"%' and gymmembers.mobileno like'%"+onnumber+"%' and memberpayments.balancedate between '"+sdate+"' and '"+edate+"' and memberplans.status='Active' and memberpayments.paymentdate in(select MAX(memberpayments.paymentdate) from memberpayments where memberplans.memberid=memberpayments.memberid and memberpayments.subscriptionid like'"+req.session.subsid+"') order by memberpayments.paymentdate desc" 
        gymcon.query(sql,function(err, result){
            console.log(sql + " - 8989")
            if(err) console.log(err)
            else if(result.length>0){
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Mobile No.</th><th>Remaining Fees</th><th>Due Date</th><th>Total Fees</th><th>Action</th></tr>"
                for(let i=0;i<result.length;i++){
                    var sdate=new Date(result[i].startdate)
                    var edate=new Date(result[i].enddate)
                    var pdate=new Date(result[i].t1)
                    var balance = result[i].balance
                    if(balance==null || balance=='' || balance == undefined){
                        balance
                    }else{
                        totalbalance += balance
                    } 
                    edate = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
                    if(edate==='NaN-aN-aN' || edate==='' || edate === null){
                        edate = ''
                    }
                    pdate = pdate.getFullYear() + '-' + ('0' + (pdate.getMonth() + 1)).slice(-2) + '-' + ('0' + pdate.getDate()).slice(-2);
                    if(pdate==='NaN-aN-aN' || pdate==='' || pdate === null){
                        pdate = ''
                    }
                    sdate = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);                
                    out = out + "<tr><td onclick=popmemberreport2('"+result[i].mobileno+"')>" + result[i].memberid2 + "</td><td>" + result[i].name+ "</td><td>" + result[i].mobileno + "</td><td>" + balance + "</td><td>" +pdate+ "</td><td>"+result[i].amount+"</td><td><button onclick=sendesssage('"+result[i].mobileno+"')><i class='fa fa-whatsapp' style='font-size:24px;'></button></td></tr>" 
                }
                out = out + "<tr><td></td><td></td><td>Total Remainig Fees</td><td>"+totalbalance+"</td><td></td><td></td><td></td></table>"
                res.send(out)
            }else{
                res.send("No Data")
            }
        })
    }
    //gym report
    else if(req.body.action == "showtotalmember"){
        let sql = "select * from  gymmembers  where subscriptionid='"+req.session.subsid+"' " 
        gymcon.query(sql,function(err, result){
            console.log(sql + " - 8989")
            if(err) console.log(err)
            else if(result.length>0){
                let birthdate ;
                let anniversarydate;
                out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Mobile No.</th><th>Address1</th><th>email</th><th>city</th><th>pin</th><th>anniversarydate</th><th>birthdate</th></tr>"
                for(let i=0;i<result.length;i++){
                    let name=result[i].name;
                    if(name == 'undefined' || name == undefined || name == 'null' || name == null){
                        name = ''
                    }
                    let mobileno=result[i].mobileno;
                    if(mobileno == 'undefined' || mobileno == undefined || mobileno == 'null' || mobileno == null){
                        mobileno = ''
                    }
                    let Address1=result[i].Address1;
                    if(Address1 == 'undefined' || Address1 == undefined || Address1 == 'null' || Address1 == null){
                        Address1 = ''
                    }
                    let city=result[i].city;
                    if(city == 'undefined' || city == undefined || city == 'null' || city == null){
                        city = ''
                    }
                    let email= result[i].email;
                    if(email == 'undefined' || email == undefined || email == 'null' || email == null){
                        email = ''
                    }
                    let memberid2=result[i].memberid2;
                    if(memberid2 == 'undefined' || memberid2 == undefined || memberid2 == 'null' || memberid2 == null){
                        memberid2 = ''
                    }
                    // let anniversarydate = result[i].anniversarydate;
                   
                    let anniversarydate = new Date(result[i].anniversarydate);
                    if(result[i].anniversarydate == null || result[i].anniversarydate == undefined || result[i].anniversarydate == ""){
                        anniversarydate = ''
                    }else{
                        anniversarydate = new Date(result[i].anniversarydate);
                        anniversarydate = anniversarydate.getFullYear() + '-' + ('0' + (anniversarydate.getMonth() + 1)).slice(-2) + '-' + ('0' + anniversarydate.getDate()).slice(-2)
                        if(anniversarydate === null || anniversarydate === undefined){
                            anniversarydate = ''
                        }
                    }
                    let birthdate = new Date(result[i].birthdate);
                    if(result[i].birthdate == null || result[i].birthdate == undefined || result[i].birthdate == ""){
                        birthdate = ''
                    }else{
                        birthdate = new Date(result[i].birthdate);
                        birthdate = birthdate.getFullYear() + '-' + ('0' + (birthdate.getMonth() + 1)).slice(-2) + '-' + ('0' + birthdate.getDate()).slice(-2)
                        if(birthdate === null || birthdate === undefined){
                            birthdate = ''
                        }
                    }
                    // var birthdate1 = birthdate.getDate() + '-' + ('0' + (birthdate.getMonth() + 1)).slice(-2) + '-' + birthdate.getFullYear();
                    // if(birthdate1 == 'undefined' || birthdate1 == null || birthdate1 == 'null' || birthdate1 == undefined || birthdate1 == 'NaN-aN-aN'){
                    //     birthdate1=''
                    // }
                    let pin=result[i].pin;
                    if(pin == 'undefined' || pin == undefined || pin == 'null' || pin == null){
                        pin = ''
                    }

                    out = out + "<tr><td>" +memberid2 + "</td><td>" +name+ "</td><td>" +mobileno + "</td><td>" + Address1 + "</td><td>" +email+ "</td><td>"+city+"</td><td>"+pin+"</td><td>"+anniversarydate+"</td><td>"+birthdate+"</td></tr>" 
                }
                res.send(out)
            }else{
                res.send("No Data")
            }
        })
    }
    else if(req.body.action == "showtotalplanmember"){
        // let sql = "SELECT gm.memberid2, gm.name, gm.mobileno, gm.Address1, gm.city, gm.pin, gm.email, mp.planid, mp.startdate, mp.enddate, mp.fee, mp.discount, mp.amount, mp.status FROM gymmembers gm LEFT JOIN memberplans mp ON gm.memberid2 = mp.memberid2 WHERE gm.subscriptionid='" + req.session.subsid + "'";
        let sql="SELECT gm.memberid2, gm.name, gm.mobileno, gm.Address1, gm.city, gm.pin, gm.email, mp.planid, mp.startdate, mp.enddate, mp.fee, mp.discount, mp.amount, mp.status FROM gymmembers gm LEFT JOIN (SELECT *  FROM memberplans  WHERE (memberid2, startdate) IN (SELECT memberid2, MAX(startdate) AS max_startdate FROM memberplans  GROUP BY memberid2)) mp ON gm.memberid2 = mp.memberid2  WHERE gm.subscriptionid = '"+req.session.subsid+"';"
        gymcon.query(sql, function(err, result) {
            console.log(sql + " - 8989")
            if (err) {
                console.log(err);
                res.send("Error fetching data");
                return;
            } else if (result.length > 0) {
                let out = "<table id='report'><tr><th>Member ID</th><th>Name</th><th>Mobile No.</th><th>Address1</th><th>City</th><th>Pin</th><th>Email</th><th>Plan Name</th><th>Start Date</th><th>End Date</th><th>Fee</th><th>Discount</th><th>Amount</th><th>Status</th></tr>";
                for (let i = 0; i < result.length; i++) {
                    let memberid2 = result[i].memberid2 || '';
                    let name = result[i].name || '';
                    let mobileno = result[i].mobileno || '';
                    let Address1 = result[i].Address1 || '';
                    let city = result[i].city || '';
                    let pin = result[i].pin || '';
                    let email = result[i].email || '';
                    let planid = result[i].planid || '';
                    let startdate = result[i].startdate || '';
                    let enddate = result[i].enddate || '';
                    let fee = result[i].fee || '';
                    let discount = result[i].discount || '';
                    let amount = result[i].amount || '';
                    let status = result[i].status || '';
    
                    // Convert startdate and enddate to YYYY-MM-DD format
                    startdate = startdate ? new Date(startdate).toISOString().split('T')[0] : '';
                    // enddate = enddate ? new Date(enddate).toISOString().split('T')[0] : '';
    
                    out += "<tr><td>" + memberid2 + "</td><td>" + name + "</td><td>" + mobileno + "</td><td>" + Address1 + "</td><td>" + city + "</td><td>" + pin + "</td><td>" + email + "</td><td>" + planid + "</td><td>" + startdate + "</td><td>" + enddate + "</td><td>" + fee + "</td><td>" + discount + "</td><td>" + amount + "</td><td>" + status + "</td></tr>";
                }
                out += "</table>";
                res.send(out);
            } else {
                res.send("No Data");
            }
        });
    }
    
    
    else {
        console.log("unknown action")
    }
    
})

//drawer module
app.get("/1/drawer",async(req, res) => {
    if(!req.session.userid){
        res.redirect("/1/login")
    }else{
            var admin = 0;
            var started = 0;
            var user = 0;
            var user1 = 0;
            var orgcolor="";
            var substatus=0;
            var sqla="select * from usermaster_t.subscriptions where userid='"+req.session.userid+"' and moduleid='15'";
            // console.log("sqla     "+sqla)
            mcon.query(sqla,(err,result)=>{
            if(err) console.log(err)
                else if(result.length>0){
                    admin = 1;
                    req.session.admin = admin
                    req.session.subid = result[0].subscriptionid;
                    console.log( req.session.subid  +"- req.session.subid ")
                }else{
                    admin= 0;
                }
                    var sql="select * from drawer_t.orgdetails where subid='"+req.session.subid+"' ";
                //    console.log("sql......."+sql)
                    dtcon.query(sql, (err, result)=>{
                    if(err) console.log(err)
                    else if (result.length>0) {
                        //console.log("one")
                        started = 1;                     
                        req.session.orgid = result[0].orgid;
                        console.log(req.session.orgid  + " orgid")
                    } else {
                        started = 0;
                       // console.log("two")
                    }
                    // var sql1="select drawer_t.sharedocs.orgid,drawer_t.orgdetails.orgname from drawer_t.sharedocs join drawer_t.orgdetails on drawer_t.sharedocs.orgid = drawer_t.orgdetails.orgid where drawer_t.sharedocs.userid ='"+req.session.userid+"'";
                    //     console.log(sql1 + " 0000")
                    //     dtcon.query(sql1, (err, result)=>{
                    //     if(err) console.log(err)
                    //     else if (result.length>0) {
                    //         //  console.log("one")
                    //         user = 1;
                    //         req.session.user = user;                     
                    //         req.session.orgid = result[0].orgid;
                    //         req.session.subid = result[0].subid;
                    //         req.session.orgname = result[0].orgname;
                    //         //  console.log(req.session.contributor + "contributor")
                    //     } else {
                    //         user = 0;
                    //         //   console.log("two")
                    //     }
                        var sql1="select drawer_t.shaerdrawer.orgid,drawer_t.orgdetails.orgname from drawer_t.shaerdrawer join drawer_t.orgdetails on drawer_t.shaerdrawer.orgid = drawer_t.orgdetails.orgid where drawer_t.shaerdrawer.userid ='"+req.session.userid+"'";
                        // console.log(sql1 + " 0000")
                        dtcon.query(sql1, (err, result)=>{
                        if(err) console.log(err)
                        else if (result.length>0) {
                            //  console.log("one")
                            user1 = 1;
                            req.session.user = user;                     
                            req.session.orgid = result[0].orgid;
                            req.session.subid = result[0].subid;
                            req.session.orgname = result[0].orgname;
                            //  console.log(req.session.contributor + "contributor")
                        } else {
                            user1 = 0;
                            //   console.log("two")
                        }
                        dtcon.query("select enddate,subscriptionid from usermaster_t.subscriptions where subscriptionid in (select orgdetails.subid  from orgdetails  where orgid like '"+req.session.orgid+"')",function(err,result){
                            if(err)console.log(err)
                            else if(result.length>0){
                                var enddate = result[0].enddate
                                let date1 = new Date()
                                const diffTime = enddate.getTime() - date1.getTime();
                                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                if(diffDays>0){
                                        substatus = 1;
                                }else{
                                        substatus = 0;    
                                } 
                            } 
                        res.render("drawer.pug",{userid: req.session.userid,username: req.session.username,admin:admin,started:started,user:user,user1:user1,substatus:substatus});
                        console.log("drawer.pug",{userid:req.session.userid,username: req.session.username,admin:admin,started:started,user:user,user1:user1,substatus:substatus});
                                    
                        
                        })
                    })
                    })
                // })
        })
    }
});

app.post("/1/drawer",up,async (req,res)=>{
    // console.log(req.busboy + " busboy ")
    if(!req.session.userid){

        res.send("sessionexpired")
        //res.redirect("/1/login")
    }
    else if(req.body.action==="subscribe"){
        var startdate = new Date();
        var subscribeidnew = uuidv4();
        var currentdate = startdate.getFullYear()+'-'+("0" + (startdate.getMonth() + 1)).slice(-2)+'-'+("0" + startdate.getDate()).slice(-2) +" "+startdate.getHours()+':'+startdate.getMinutes()+':'+startdate.getSeconds();
        var days =3;
        let newDate = new Date(Date.now()+days*24*60*60*1000);
        let ndate = ("0" + newDate.getDate()).slice(-2);
        let nmonth = ("0" + (newDate.getMonth() + 1)).slice(-2);
        let nyear = newDate.getFullYear();   
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        let seconds = newDate.getSeconds();       
        let nextdate = nyear+'-'+nmonth+'-'+ndate +" "+hours+':'+minutes+':'+seconds 
        mcon.query("select * from subscriptions where userid='"+req.session.userid+"' and moduleid=15", function(err, result){
            if(err) console.log(err);
            else if(result.length > 0){
                res.send("used")
            }else{
                var sql2 = "insert into subscriptions(userid, subscriptionid, moduleid, startdate, enddate,isprimary ) values('"+req.session.userid+"','"+subscribeidnew+"',15,'"+currentdate+"','"+nextdate+"','yes')"
                    mcon.query(sql2, function(err, data){
                    if (err) throw err;
                    res.send("Saved")
                    });   
                }
            })
        }
        else if(req.body.action==="saveorginfod"){
            var orgid = uuidv4();
            var nameorg = req.body.nameorg
            var phoneno = req.body.phoneno
            var orgaddress1 = req.body.orgaddress1
            var orgaddress2 = req.body.orgaddress2
            var orgcity = req.body.orgcity
            var orgstate = req.body.orgstate
            var orgemail = req.body.orgemail
            var currentdate = new Date();
            currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
            var sql ="insert into orgdetails (subid, orgid,orgname, address1,address2,city,state,email,contactno,createdby,createddate,modifieddate,modifyby) values('"+req.session.subid+"','"+orgid+"','"+nameorg+"', '"+orgaddress1+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"','"+phoneno+"','"+req.session.userid+"','"+currentdate+"','"+currentdate+"','"+req.session.userid+"')";

            // var sql = "insert into drawer_t.orgdetails (subid, orgid,orgname, address1,address2,city,state,email,contactno,createdby,createddate,modifieddate,modifyby) values('"+req.session.subid+"','"+orgid+"','"+nameorg+"', '"+orgaddress1+"','"+orgaddress2+"','"+orgcity+"','"+orgstate+"','"+orgemail+"','"+phoneno+"','"+req.session.userid+"','"+currentdate+"','"+currentdate+"','"+req.session.userid+"')"
            dtcon.query(sql,function(err,result1){
                console.log(sql    +"  000")
                if(err)console.log(err)
                    else if (result1.affectedrows>0)
                    {
                        res.send("Information saved successfully")
                    }else{
                        res.send("Information saved successfully")
                    }   
            })
        }
        else if(req.body.action==="retriveorginfo"){
            var sql="select * from orgdetails where subid='"+req.session.subid+"'";
          
            dtcon.query(sql,function (err,result){
                if(err)console.log(err)
                else if(result.length>0){
                    var arr=[];
                    arr.push(result[0].orgname)
                    arr.push(result[0].contactno)
                    arr.push(result[0].address1)
                    arr.push(result[0].address2)
                    arr.push(result[0].city)
                    arr.push(result[0].state)
                    arr.push(result[0].email)
                    res.send(arr)
                }else{
                    console.log("error")
                }
            })
        }
        else if(req.body.action==="updateorg"){
            var nameorg = req.body.nameorg
            var phoneno = req.body.phoneno
            var uaddress = req.body.uaddress
            var uaddress2 = req.body.uaddress2
            var ucity = req.body.ucity
            var ustate = req.body.ustate
            var uemail = req.body.uemail
            var sql = "update orgdetails set orgname='"+nameorg+"',contactno='"+phoneno+"',address1='"+uaddress+"',address2='"+uaddress2+"',city='"+ucity+"',state='"+ustate+"',email='"+uemail+"'  where subid='"+req.session.subid+"'";
            dtcon.query(sql,function(err,result){
                if(err)console.log(err)
                else if(result.affectedRows>0){
                   res.send("updated successfully")
                }else{
                    res.send("error")
                }
            })
        }
    //upload file but this code not usefull
    // else if(req.body.action==='drawerimgupload1'){
    //     var drawerid=req.body.drawerid;
    //     var fileext = req.body.fileext;
    //     var sql = "select subscriptions.quota, subscriptions.usedquota from subscriptions where subscriptionid like '" + req.session.subid + "'";
    //     mcon.query(sql, function (err, result) {
    //         // console.log(sql + "   .....")
    //         if (err) console.log(err)
    //             else if (result.length > 0) {
    //                 let quota = 0, usedquota = 0;
    //                 if (result[0].quota == null || result[0].quota == undefined || result[0].quota == "") {
    //                     quota = 0
    //                     console.log(quota + "  111111 quota")
    //                 } else {
    //                     quota = result[0].quota;
    //                 }
    //                 if (result[0].usedquota == null || result[0].usedquota == undefined || result[0].usedquota == "") {
    //                     usedquota = 0
    //                 } else {
    //                 usedquota = result[0].usedquota;
    //                 }
    //                 if (usedquota > quota) {
    //                     res.send("You have reached the maximum limit of file upload")
    //             } else {
                    
    //                 return new Promise((resolve, reject) => {
    //                     savefiledb(req,res,req.session.orgid,(successfun) => {
    //                         resolve(successfun);
    //                     });
    //                 }).then((data)=>{
    //                     var currentdate = new Date();
    //                     currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
    //                     var sql = "insert into drawerdetails(orgid,drawerfileid,drawerid,createddate,filetype) values('"+req.session.orgid+"','"+data+"','"+drawerid+"','"+currentdate+"','"+fileext+"')";
    //                     // var sql = "update fileupload SET fileid ='"+data+"' where orgid='"+req.session.orgid+"' ";
    //                     dtcon.query(sql , function(err,result){
    //                         // console.log(sql + " upload pic")
    //                         if(err) console.log(err);
    //                         else if(result.affectedRows>0){
    //                             return new Promise((resolve, reject) => {
    //                                 gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
    //                                     resolve(successfun)
    //                                 });
    //                             }).then((data) => {
    //                                 res.send("File Upload")
    //                         })
    //                             // res.send('successful')
    //                         }else{
    //                             res.send("something went wrong please try after sometime.....")
    //                         }
    //                     })
    //                 })  

    //             }
    //             }
    //         })
         
    // }
    else if (req.body.action === 'getdrawerimg') {
        var drawerfileid = req.body.drawerfileid;
        let path = "drawerfile/" + req.session.orgid;
    
        dtcon.query("SELECT * FROM drawerdetails WHERE orgid = ? AND drawerfileid = ?", [req.session.orgid, drawerfileid], function(err, result) {
            if (err) {
                console.error(err);
                res.send("error");
            } else if (result.length > 0) {
                let fileid = result[0].drawerfileid;
                let filetype = result[0].filetype;
                let arr=[];
                arr.push(filetype);
                arr.push(fileid);
                res.send(arr);
                // let filePath = path + "/" + fileid;
                // fs.access(filePath, fs.constants.F_OK, (err) => {
                //     if (err) {
                //         res.send("No Image");
                //     } else {
                //         // File exists, send back the file details
                //         res.json({ fileid: fileid, filetype: filetype });
                //     }
                // });
            } else {
                res.send("No Image");
            }
        });
    }
    else if (req.body.action === 'adddrawername') {
        var newdrawer = req.body.newdrawer;
        if (!newdrawer || newdrawer.trim() === '') {
          res.send("Drawer name cannot be null or empty.");
          return;
        }
    var checkDuplicateSql = "SELECT COUNT(*) AS drawername_count FROM drawername WHERE orgid = '" + req.session.orgid + "' AND drawername = '" + newdrawer + "'";
        dtcon.query(checkDuplicateSql, function (err, result) {
            if (err) {
                console.log(err);
                res.send("An error occurred.");
            }else {
                if (result[0].drawername_count > 0) {
                res.send("Duplicate Drawer name. Drawer already exists.");
                    } else {
                        var drawerid = uuidv4();
                        var tableid = uuidv4();
                        var currentdate = new Date();
                        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
                    var insertSql = "INSERT INTO drawername(orgid,drawerid, drawername, createddate,tableid) VALUES('" + req.session.orgid + "', '" + drawerid + "', '"+newdrawer+"','"+currentdate+"','"+tableid+"')";
                    dtcon.query(insertSql, function (err, result) {
                        if (err) {
                        console.log(err);
                        // res.send("An error occurred while inserting the status.");
                            } else if (result.affectedRows > 0) {
                            res.send("Data inserted.");
                            } else {
                            res.send("Insert failed.");
                        }
                    })
                }
            }
        })
    }
    else if(req.body.action==='retrivdrawername'){
        var sql="select * from drawername where orgid = '"+req.session.orgid+"' and subdrawerid is null;"
        dtcon.query(sql,function(err,result){
            // console.log(sql + "nnnnnnnnnn")
            if(err)console.log(err,req)
            else if(result.length>0){
                r = []
                for(i=0;i<result.length;i++){
                    r.push('{"drawername":"'+result[i].drawername+'","drawerid":"'+result[i].drawerid+'"}')
                }
                res.send(r)
            }else{
                res.send("retrive status error")
            }
        })
    }
    
    else if (req.body.action === 'savesubfolder') {
        var drawersubfoldername = req.body.drawersubfoldername;
        var subdrawerid = req.body.drawerid;
        if (!drawersubfoldername || drawersubfoldername.trim() === '') {
          res.send("Please Add First Drawer name .");
          return;
        }
        var sql ="select tableid from drawername WHERE orgid = '" + req.session.orgid + "' AND drawerid = '" + subdrawerid + "'"
        dtcon.query(sql,function(err,result){
            // console.log(sql + "n888888")
            if (err) {
                console.log(err);
                res.send("An error occurred.");
            }else if(result.length>0){
                var tableid=result[0].tableid;
                console.log(tableid + " - tableid")
                var checkDuplicateSql = "SELECT COUNT(*) AS drawername_count FROM drawername WHERE orgid = '" + req.session.orgid + "' AND drawername = '" + drawersubfoldername + "'";
                dtcon.query(checkDuplicateSql, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("An error occurred.");
                    }else {
                        if (result[0].drawername_count > 0) {
                        res.send("Duplicate Drawer name. Drawer already exists.");
                            } else {
                                var drawerid = uuidv4();
                                var currentdate = new Date();
                                currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
                            var insertSql = "INSERT INTO drawername(orgid,drawerid, drawername, createddate,subdrawerid,tableid) VALUES('" + req.session.orgid + "', '" + drawerid + "', '"+drawersubfoldername+"','"+currentdate+"','"+subdrawerid+"','"+tableid+"')";
                            dtcon.query(insertSql, function (err, result) {
                                // console.log(insertSql + " - insertSql******")
                                if (err) {
                                console.log(err);
                                // res.send("An error occurred while inserting the status.");
                                    } else if (result.affectedRows > 0) {
                                    res.send("Data inserted.");
                                    } else {
                                    res.send("Insert failed.");
                                }
                            })
                        }
                    }
                })
            }else{
                res.send("Please Try Again")
            }
        })
       
    }
      
    else if (req.body.action === 'shardoc') {
        var susername = req.body.susername;
        var smobileno = req.body.smobileno;
        var sharfileid=req.body.sharfileid;
        var semail = req.body.semail;
        var drawerid2=req.body.drawerid2;
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        mcon.query("SELECT * FROM users WHERE mobile = '" + smobileno + "'", function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var userid = result[0].userid;
                var insertSql = "INSERT INTO sharedocs(orgid,docsid, username, mobileno,currentdate,userid,useremail,drawerid) VALUES('" + req.session.orgid + "', '" + sharfileid + "', '"+susername+"','"+smobileno+"','"+currentdate+"','"+userid+"','"+semail+"','"+drawerid2+"')";
                dtcon.query(insertSql, function (err, result) {
                    if (err) {
                    console.log(err);
                    // res.send("An error occurred while inserting the status.");
                        } else if (result.affectedRows > 0) {
                        res.send("Data inserted.");
                        } else {
                        res.send("Insert failed.");
                    }
                })  
            }else{
                req.send("Please User Register First")
            }

        })
        
    }
    else if(req.body.action==="searchuser"){
        var mobileno = req.body.mobileno
        var sql="select * from usermaster_t.users where mobile='"+mobileno+"'";
        mcon.query(sql,function(err,result){
            if(err)console.log(err)
            else if(result.length>0){
                var arr=[];
                arr.push(result[0].mobileno)
                arr.push(result[0].name)
                arr.push(result[0].email)
                arr.push(result[0].userid)
                res.send(arr)
            }else{
                //res.send(arr)
            res.send("User is not registered") 
            }
        })
    }
    else if (req.body.action === 'sharedocsshow') {
        var sql = "SELECT docsid,username,mobileno,currentdate,orgid,drawerid from sharedocs WHERE userid='"+req.session.userid+"'";
        dtcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
                else if(result.length>0){ 
                    var arr=[];
                    var theader = "<table id='report' width='280px' ><tr><th>Name</th><th>Contact No</th><th>Date</th><th>Action</th></tr>"
                    var ttext = ""
                    for(var i=0;i<result.length;i++){
                            var username = result[i].username;
                            if(username == 'undefined' || username == undefined || username == 'null' || username == null){
                                username = ''
                            }
                            var mobileno = result[i].mobileno;
                            if(mobileno == 'undefined' || mobileno == undefined || mobileno == 'null' || mobileno == null){
                                mobileno = ''
                            }
                            var currentdate = new Date(result[i].currentdate);
                            var currentdate1 = currentdate.getDate() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getFullYear()).slice(-2);
                            if(currentdate1 == 'undefined' || currentdate1 == null || currentdate1 == 'null' || currentdate1 == undefined || currentdate1 == 'NaN-aN-aN'){
                                currentdate1=''
                            }
                            var drawerid=result[i].drawerid;
                            
                            var docsid= result[i].docsid;

                            ttext=ttext+"<tr><td>"+username+"</td><td>"+mobileno+"</td><td>"+currentdate1+"</td><td onclick='showshareimg(\"" + docsid + "\", \"" + drawerid + "\");'>open</td></tr>" 
                        }
                        ttext=theader+ttext+"</table>"
                       
                        res.send(ttext)
                    }else{
                        res.send("No Task")
                    }
        });
    }
    else if (req.body.action === 'showshareimg') {
        var drawerfileid = req.body.drawerfileid;
        var drawerid = req.body.drawerid;
        let path = "drawerusersfiles" + "/" + req.session.userid;
        dtcon.query("SELECT * FROM sharedocs WHERE userid= '"+req.session.userid+"' and docsid='"+drawerfileid+"'", function(err, result) {
            
            if (err) {
                console.log(err);
                res.send("error");
            } else if (result.length > 0) {
                var orgid=result[0].orgid;
                let promises = [];
                result.forEach(row => {
                    let fileid = row.docsid;
                    let promise = new Promise((resolve, reject) => {
                        let filePath = path + "/" + fileid;
                        fs.access(filePath, fs.constants.F_OK, (err) => {
                            if (err) {
                                // File doesn't exist, retrieve it
                                retrivefile(req, res, fileid, path, orgid, (successfun) => {
                                    resolve(successfun);
                                });
                            } else {
                                // File exists, resolve with the fileid
                                resolve(fileid);
                            }
                        });
                    });
                    promises.push(promise);
                });
    
                Promise.all(promises)
                    .then((fileIds) => {
                        // Send back the file IDs or paths
                        res.send(fileIds.join(','));
                    })
                    .catch(err => {
                        console.error(err);
                        res.send("error");
                    });
            } else {
                res.send("No Image");
            }
        });
    }
    else if (req.body.action === 'sharecompletefolder') {
        var folderpassword=req.body.folderpassword;
        if(folderpassword == 'undefined' || folderpassword == null || folderpassword == 'null' || folderpassword == undefined || folderpassword == 'NaN-aN-aN' || folderpassword==''){
            folderpassword=(Math.random() + 1).toString(36).substring(2,10);
        }
        var susername = req.body.susername;
        var smobileno = req.body.smobileno;
        var drawerid3=req.body.drawerid3;
        var semail = req.body.semail;
        var currentdate = new Date();
        currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2)
        var sql1="select * from shaerdrawer where orgid='"+req.session.orgid+"' and usercontactno='"+smobileno+"' and drawerid='"+drawerid3+"'";
        dtcon.query(sql1,function(err,result){
            if(err){
                console.log(err)
            }else if(result.length > 0){
                res.send("This Drawer Already Share This User")
            }else{
                mcon.query("SELECT * FROM users WHERE mobile = '" + smobileno + "'", function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length > 0) {
                        var userid = result[0].userid;
                        var insertSql = "INSERT INTO shaerdrawer(orgid,drawerid, userid, username,useremail,currentdate,usercontactno,password) VALUES('" + req.session.orgid + "', '" + drawerid3 + "', '"+userid+"','"+susername+"','"+semail+"','"+currentdate+"','"+smobileno+"','"+folderpassword+"')";
                        dtcon.query(insertSql, function (err, result) {
                            if (err) {
                            console.log(err);
                            // res.send("An error occurred while inserting the status.");
                                }else if (result.affectedRows > 0) {
                                res.send("Data inserted.");
                                }else {
                                res.send("Insert failed.");
                            }
                        })  
                    }else{
                        res.send("Please User Register First")
                    }
                })
            }
        })  
    }
    else if (req.body.action === 'sharedrawershow') {
        var sql = "SELECT * from shaerdrawer WHERE  userid='"+req.session.userid+"'";
        dtcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
                else if(result.length>0){ 
                    var arr=[];
                    var theader = "<table id='report' width='280px' ><tr><th>Name</th><th>Contact No</th><th>Date</th><th>Action</th></tr>"
                    var ttext = ""
                    for(var i=0;i<result.length;i++){
                            var username = result[i].username;
                            if(username == 'undefined' || username == undefined || username == 'null' || username == null){
                                username = ''
                            }
                            var mobileno = result[i].usercontactno;
                            if(mobileno == 'undefined' || mobileno == undefined || mobileno == 'null' || mobileno == null){
                                mobileno = ''
                            }
                            var currentdate = new Date(result[i].currentdate);
                            var currentdate1 = currentdate.getDate() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getFullYear()).slice(-2);
                            if(currentdate1 == 'undefined' || currentdate1 == null || currentdate1 == 'null' || currentdate1 == undefined || currentdate1 == 'NaN-aN-aN'){
                                currentdate1=''
                            }
                            var drawerid= result[i].drawerid;
                            ttext=ttext+"<tr><td>"+username+"</td><td>"+mobileno+"</td><td>"+currentdate1+"</td><td style='cursor:pointer;' onclick='showsharedrawers(\"" + drawerid + "\");'><img src='/static/image/open-folder.png' style='height:35px; width:35px;'/></td></tr>" 
                        }
                        ttext=theader+ttext+"</table>"
                       
                        res.send(ttext)
                    }else{
                        res.send("No Task")
                    }
        });
    }
    else if (req.body.action === 'showsharedrawers') {
        var drawerid1 = req.body.drawerid;
        var theader="<table width='280px'> <tr></tr>"
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE drawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                 // Renamed to avoid conflicts
                 var ttext="";
                for(var j=0;j<result.length; j++){
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    // theader = theader + "<tr><td style='cursor:pointer;' onclick=draweridpass('"+drawerid +"');>"+drawername+"</td><td style='cursor:pointer;' onclick=showsubchilddrawer1(\"" + drawerid + "\");><img src='/static/image/open-folder.png' style='height:35px; width:35px;'/></td></tr>";
                    ttext = ttext + 
                    "<tr>" +
                                "<td>" +
                                    "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" >" +
                                        "<div class='drawer-options'>" +
                                            "<div class='drawer-options-row'>" +
                                                // "<img src='/static/image/edit1.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                                "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder1('" + drawerid + "');\" title='Files' />" +
                                            "</div>" +
                                        "</div>" +
                                        "<div class='drawer-name'>" + drawername + "</div>" +
                                    "</div>" +
                                "</td>" +
                            "</tr>";
                }
                ttext = theader + ttext + "</table>";
                res.send(ttext);
                // var sql = "SELECT * FROM drawer_t.drawerdetails WHERE drawerid = '"+drawerid1+"'";
                // dtcon.query(sql, async function(err, result) {
                //     if (err) {
                //         console.log(err);
                //     } else if (result.length > 0) {
                //         var drawerid2=result[0].drawerid;
                //         var arr = [];
                        
                //         var ttext = "";
                //         for (var i = 0; i < result.length; i++) {
                //             var filename = result[i].filetype;
                //             if (!filename) continue;
                //             var getFileExtension = filename.split('.').pop().toLowerCase();
                //             var docsid = result[i].drawerfileid;
                //             var filetype=result[i].filetype;
                //             var iconHtml = "";
                //             if (getFileExtension === "pdf") {
                //                 ttext += `<tr><td>`+filetype+`</td><td style='cursor:pointer;' onclick='showshareimg1("${docsid}");'> <img src='/static/image/pdf.png' alt='PDF Icon'></td></tr>`;
                //             } else if (getFileExtension === "pug" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                //                 ttext += `<tr><td>`+filetype+`</td><td style='cursor:pointer;' onclick='showshareimg1("${docsid}");'> <img src='/static/image/photo.png' alt='PDF Icon'></td></tr>`;
                //             } else {
                //                 ttext += `<tr><td>`+filetype+`</td><td style='cursor:pointer;' onclick='showshareimg1("${docsid}");'> <img src='/static/image/photo.png' alt='PDF Icon'></td></tr>`;
                //             }
                //         }

                //         ttext = theader + ttext + "</table>";
                //         res.send(ttext);
                //     } else {
                //         res.send(theader);
                //     }
                // });
            }else{
                res.send("no data")
                // var sql = "SELECT * FROM drawer_t.drawerdetails WHERE orgid ='"+req.session.orgid+"' AND drawerid = '"+drawerid1+"'";
                // dtcon.query(sql, function(err, result) {
                //     if (err) {
                //         console.log(err);
                //     } else if (result.length > 0) {
                //         var drawerid2=result[0].drawerid;
                //         var arr = [];
                        
                //         var ttext = "";
                //         for (var i = 0; i < result.length; i++) {
                //             var filename = result[i].filetype;
                //             if (!filename) continue;
                //             var getFileExtension = filename.split('.').pop().toLowerCase();
                //             var docsid = result[i].drawerfileid;
                //             var iconHtml = "";
                //             var filetype= result[i].filetype;
                //             if (getFileExtension === "pdf") {
                //                 ttext += `<tr><td>`+filetype+`</td><td onclick='showshareimg1("${docsid}");'> <img src='/static/image/pdf.png' alt='PDF Icon'></td></tr>`;
                //             } else if (getFileExtension === "pug" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                //                 ttext += `<tr><td>`+filetype+`</td><td onclick='showshareimg1("${docsid}");'> <img src='/static/image/photo.png' alt='PDF Icon'></td></tr>`;
                //             } else {
                //                 ttext += `<tr><td>`+filetype+`</td><td  onclick='showshareimg1("${docsid}");'> <img src='/static/image/photo.png' alt='PDF Icon'></td></tr>`;
                //             }
                //         }
                //         ttext = theader + ttext + "</table>";
                //         res.send(ttext);
                //     } else {
                //         res.send(theader);
                //     }
                // });
            }
        });
    }
    else if(req.body.action == "userpassword"){
        var userpassword=req.body.userpassword;
        var drawerid=req.body.drawerid;
        var sql ="Select  password from shaerdrawer where userid='"+req.session.userid+"' and drawerid='"+drawerid+"'";
        dtcon.query(sql,function(err,result){
            if(err){
                console.log(err);
            }else if(result.length>0){
                var userpassword1=result[0].password;
                if(userpassword==userpassword1){
                    res.send("Password is correct");
                }else{
                    res.send("pass is incorrect")
                }
            }
        })
    }
    else if(req.body.action == "userpassword1"){
        var userpassword=req.body.userpassword;
        var drawerid = req.body.drawerid;
        var sql ="Select  password from shaerdrawer where userid='"+req.session.userid+"' and drawerid='"+drawerid+"'";
        dtcon.query(sql,function(err,result){
            console.log(sql + " pass")
            if(err){
                console.log(err);
            }else if(result.length>0){
                var userpassword1=result[0].password;
                if(userpassword==userpassword1){
                    res.send("Password is correct");
                }else{
                    res.send("pass is incorrect")
                }
            }
        })
    }
    else if (req.body.action === 'showshareimg1') {
        var drawerfileid = req.body.drawerfileid;
        var drawerid=req.body.drawerid;
        let path = "drawerusersfiles" + "/" + req.session.userid;
        dtcon.query("SELECT * FROM drawerdetails WHERE drawerid= '"+drawerid+"' and drawerfileid='"+drawerfileid+"'", function(err, result) {
            if (err) {
                console.log(err);
                res.send("error");
            } else if (result.length > 0) {
                var orgid=result[0].orgid;
                let promises = [];
                result.forEach(row => {
                    let fileid = row.drawerfileid;
                    let promise = new Promise((resolve, reject) => {
                        let filePath = path + "/" + fileid;
                        fs.access(filePath, fs.constants.F_OK, (err) => {
                            if (err) {
                                // File doesn't exist, retrieve it
                                retrivefile(req, res, fileid, path, orgid, (successfun) => {
                                    resolve(successfun);
                                });
                            } else {
                                // File exists, resolve with the fileid
                                resolve(fileid);
                            }
                        });
                    });
                    promises.push(promise);
                });
    
                Promise.all(promises)
                    .then((fileIds) => {
                        // Send back the file IDs or paths
                        res.send(fileIds.join(','));
                    })
                    .catch(err => {
                        console.error(err);
                        res.send("error");
                    });
            } else {
                res.send("No Image");
            }
        });
    }

    else if (req.body.action === 'retrivedrawers') {
        var sql = "SELECT drawerid,drawername FROM drawername WHERE orgid = '" + req.session.orgid + "' And  subdrawerid is null";
        dtcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
                else if(result.length>0){ 
                    var arr=[];
                    var theader = "<table width='260px' class='drawerbg'><tr ><th colspan='3'></th></tr>"
                    var ttext = ""
                    for(var i=0;i<result.length;i++){
                            var drawername = result[i].drawername;
                            if(drawername == 'undefined' || drawername == undefined || drawername == 'null' || drawername == null){
                                drawername = ''
                            }
                            var drawerid=result[i].drawerid;
                            ttext = ttext + 
                            
                            "<tr>" +
                                "<td>" +
                                    "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showfilesdata('"+ drawerid +"');showinfoondrawer('" + drawerid + "', '"+ drawername +"');\">" +
                                        "<div class='drawer-options'>" +
                                            "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                                "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                            // "</div>" +
                                            // "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                                "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                                "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deleteretrivmaindrawer('" + drawerid + "', '"+ drawername +"');\" title='New Folder' />" +

                                                "</div>" +
                                        "</div>" +
                                        "<div class='drawer-name'>" + drawername + "</div>" +
                                    "</div>" +
                                "</td>" +
                            "</tr>";
                        }
                        ttext=theader+ttext+"</table>"
                       
                        res.send(ttext)
                    }else{
                        res.send("No data")
                    }
            });
        }
    else if (req.body.action === 'showfilesdata') {
        var drawerid1 = req.body.drawerid;
        var theader="<table width='260px' class='drawerbg'> <tr></tr>"
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE orgid ='"+req.session.orgid+"' AND subdrawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                ttext="";
                 // Renamed to avoid conflicts
                for(var j=0;j<result.length; j++){
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    ttext = ttext + 
                    "<tr>" +
                                "<td>" +
                                    "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showsubchilddrawer('"+ drawerid +"');showinfoondrawer('" + drawerid + "', '"+ drawername +"');\">" +
                                        "<div class='drawer-options'>" +
                                            "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                                "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                            // "</div>" +
                                            // "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                                "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                                "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deletefulldrawershowsubchilddrawer('" + drawerid + "' , '"+ drawername +"');\" title='Delete Drawer' />" +                                           
                                                "</div>" +
                                        "</div>" +
                                        "<div class='drawer-name'>" + drawername + "</div>" +
                                    "</div>" +
                                "</td>" +
                            "</tr>";
                }
                ttext=theader+ttext+"</table>"
                res.send(ttext);
            }else{
                res.send("no data")
            }
        });
    }
    else if (req.body.action === 'showinfoondrawer') {
        var drawerid1 = req.body.drawerid;
        var theader="<table id='report' width='260px'> <tr colspan ='2'></tr>"

        var sql= "SELECT * FROM drawername WHERE orgid ='"+req.session.orgid+"' AND drawerid = '"+drawerid1+"'";
        dtcon.query(sql,function(err,result1){
            if(err){
                console.log(err)
            }else if(result1.length>0){
                var drawername=result1[0].drawername;
                theader=theader+"<tr><th style='font-size: 18px;' colspan='2'>"+drawername+"</th></tr>"
                var sql = "SELECT * FROM drawerdetails WHERE orgid ='"+req.session.orgid+"' AND drawerid = '"+drawerid1+"'";
        dtcon.query(sql, async function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var drawerid2=result[0].drawerid;
                var arr = [];
                
                var ttext = "";
                for (var i = 0; i < result.length; i++) {
                    var filename = result[i].filetype;
                    var drawerid=result[i].drawerid;
                    if (!filename) continue;
                    var getFileExtension = filename.split('.').pop().toLowerCase();
                    var drawerfileid = result[i].drawerfileid;
                    var filetype =result[i].filetype;
                    var iconHtml = "";
                    if (getFileExtension === "pdf") {
                        ttext += `<tr><td><img src='/static/image/pdf.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    } else if (getFileExtension === "png" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                        ttext += `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "txt"){
                        ttext += `<tr><td><img src='/static/image/txt.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "xls"){
                        ttext += `<tr><td><img src='/static/image/xls.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "xlsx"){
                        ttext += `<tr><td><img src='/static/image/xlsx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "docx"){
                        ttext += `<tr><td><img src='/static/image/docx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "doc"){
                        ttext += `<tr><td><img src='/static/image/doc.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "zip"){
                        ttext += `<tr><td><img src='/static/image/zip.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }else if(getFileExtension === "gz"){
                        ttext += `<tr><td><img src='/static/image/gz.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }
                     else {
                        ttext += `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;'  onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                    }
                }

                ttext = theader + ttext + "</table>";
                        res.send(ttext);
            }else{
                res.send(theader)
            }
                    });

            }else{
                res.send("No Data")
            }
        })
       
        
    }
    else if (req.body.action === 'showfilesdata1') {
        var drawerid1 = req.body.drawerid;
        var theader="<table width='260px'class='drawerbg'> <tr></tr>"
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE orgid ='"+req.session.orgid+"' AND subdrawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                ttext="";
                for(var j=0;j<result.length; j++){
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    ttext = ttext + 
                    "<tr>" +
                                "<td>" +
                                    "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showsubchilddrawer('"+ drawerid +"', '"+ drawername +"');\">" +
                                        "<div class='drawer-options'>" +
                                            "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                                "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                            // "</div>" +
                                            // "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                                "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                            "</div>" +
                                        "</div>" +
                                        "<div class='drawer-name'>" + drawername + "</div>" +
                                    "</div>" +
                                "</td>" +
                            "</tr>";
                    // theader = theader + "<tr><td colspan='2' style='cursor: pointer;'  ><img src='/static/image/drawer1.png'  onclick=showsubchilddrawer(\"" + drawerid + "\"); style='height:40px; width:40px;'/><img src='/static/image/share.png' style='height:30px; width:30px; margin-left: 10px;' onclick='sharedrawerfolder(\"" + drawerid + "\");' /><br>"+drawername+"</td></tr>";
                }
                ttext=theader+ttext+"</table>"
                        res.send(ttext);
                    // } else {
                    //     res.send(theader);
                    // }
                // });
            }else{
                res.send("no data")
            }
        });
    }
    else if(req.body.action ==='showfilesinfolderunder'){
        var drawerid1=req.body.drawerid;
        var theader="<table id='report' width='300px'><tr><th colspan='3'>Files</th></tr>"
        var sql = "SELECT * FROM drawer_t.drawerdetails WHERE orgid ='"+req.session.orgid+"' AND drawerid = '"+drawerid1+"'";
                dtcon.query(sql, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length > 0) {
                        var drawerid2=result[0].drawerid;
                        var arr = [];
                        
                        var ttext = "";
                        for (var i = 0; i < result.length; i++) {
                            var filename = result[i].filetype;
                            if (!filename) continue;
                            var getFileExtension = filename.split('.').pop().toLowerCase();
                            var drawerfileid = result[i].drawerfileid;
                            var drawerid=result[i].drawerid;
                            var iconHtml = "";
                            var filetype=result[i].filetype;
                            if (getFileExtension === "pdf") {
                                ttext += `<tr><td><img src='/static/image/pdf.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            } else if (getFileExtension === "pug" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                                ttext += `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            } else if(getFileExtension === "txt"){
                                ttext += `<tr><td><img src='/static/image/txt.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "xls"){
                                ttext += `<tr><td><img src='/static/image/xls.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "xlsx"){
                                ttext += `<tr><td><img src='/static/image/xlsx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "docx"){
                                ttext += `<tr><td><img src='/static/image/docx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "doc"){
                                ttext += `<tr><td><img src='/static/image/doc.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "zip"){
                                ttext += `<tr><td><img src='/static/image/zip.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }else if(getFileExtension === "gz"){
                                ttext += `<tr><td><img src='/static/image/gz.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;
                            }
                            else{
                                ttext += `<tr><td><img src='/static/image/txt.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td><td><img src='/static/image/trash.png' onclick='deleteimg("${drawerfileid}","${drawerid}");' style='height:25px; width:25px;'/></td></tr>`;  
                            }
                        }
                        ttext = theader + ttext + "</table>";
                        res.send(ttext);
                    } else {
                        res.send("No Data");
                    }
                });
    } 
    else if(req.body.action ==='showfilesinfolderunder1'){
        var drawerid1=req.body.drawerid;
        var theader="<table id='report' width='280px'><tr><th colspan='2'>Files</th></tr>"
        var sql = "SELECT * FROM drawer_t.drawerdetails WHERE orgid ='"+req.session.orgid+"' AND drawerid = '"+drawerid1+"'";
                dtcon.query(sql, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length > 0) {
                        var drawerid2=result[0].drawerid;
                        var arr = [];
                        
                        var ttext = "";
                        for (var i = 0; i < result.length; i++) {
                            var filename = result[i].filetype;
                            if (!filename) continue;
                            var getFileExtension = filename.split('.').pop().toLowerCase();
                            var drawerfileid = result[i].drawerfileid;
                            var drawerid=result[i].drawerid;
                            var iconHtml = "";
                            var filetype=result[i].filetype;
                            if (getFileExtension === "pdf") {
                                ttext += `<tr><td><img src='/static/image/pdf.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style=' text-align: left;'>`+filetype+`</tr>`;
                            } else if (getFileExtension === "pug" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                                ttext += `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style=' text-align: left;'>`+filetype+`</tr>`;
                            }else if(getFileExtension === "txt"){
                                ttext += `<tr><td><img src='/static/image/txt.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "xls"){
                                ttext += `<tr><td><img src='/static/image/xls.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "xlsx"){
                                ttext += `<tr><td><img src='/static/image/xlsx.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "docx"){
                                ttext += `<tr><td><img src='/static/image/docx.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "doc"){
                                ttext += `<tr><td><img src='/static/image/doc.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "zip"){
                                ttext += `<tr><td><img src='/static/image/zip.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }else if(getFileExtension === "gz"){
                                ttext += `<tr><td><img src='/static/image/gz.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style='text-align: left;'>`+filetype+`</td></tr>`;
                            }
                             else {
                                ttext += `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;' onclick='getdrawerimg1("${drawerfileid}");'></td><td style=' text-align: left;'>`+filetype+`</tr>`;
                            }
                        }
                        ttext = theader + ttext + "</table>";
                        res.send(ttext);
                    } else {
                        res.send("No Data");
                    }
                });
    } 

    else if (req.body.action === 'showsubchilddrawer') {
        var drawerid1 = req.body.subchilddrawerid;
        var theader = `<table width='260px' class='drawerbg'>
                        <tr>
                            
                        </tr>`;
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE orgid ='"+req.session.orgid+"' AND subdrawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var ttext="";
                for (var j = 0; j < result.length; j++) {
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    ttext = ttext + 
                    "<tr>" +
                    "<td>" +
                        "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showsubchilddrawerlevel('" + drawerid + "');showinfoondrawer('" + drawerid + "', '"+ drawername +"');\">" +
                            "<div class='drawer-options'>" +
                                "<div class='drawer-options-row'>" +
                                    "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                    "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                // "</div>" +
                                // "<div class='drawer-options-row'>" +
                                    "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                    "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                    "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deletefulldrawersubchilddrawerlevel('" + drawerid + "' , '"+ drawername +"');\" title='Delete Drawer' />" +
                                    "</div>" +
                            "</div>" +
                            "<div class='drawer-name'>" + drawername + "</div>" +
                        "</div>" +
                    "</td>" +
                "</tr>";
                }
                ttext=theader+ttext+"</table>"
                res.send(ttext);
            } else {
                res.send("no data")
            }
        });
    }
   
    else if (req.body.action === 'showsubchilddrawerlevel') {
        var drawerid1 = req.body.subchilddrawerid;
        var theader = `<table width='260px' class='drawerbg'>
                        <tr>
                        </tr>`;
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE orgid ='"+req.session.orgid+"' AND subdrawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var ttext="";
                for (var j = 0; j < result.length; j++) {
                    
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    ttext = ttext + 
                    // theader = theader + "<tr><td colspan='2' onclick=draweridpass('"+drawerid+"');>"+drawername+"</td><td style='cursor: pointer;' onclick=showsubchilddrawerlevelsecond(\"" + drawerid + "\");><img src='/static/image/open-folder.png' style='height:30px; width:30px;'/></td><td style='cursor: pointer;' onclick='sharedrawerfolder(\"" + drawerid + "\");'><img src='/static/image/share.png' style='height:30px; width:30px;'/></td></tr>";
                    "<tr>" +
                    "<td>" +
                        "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showsubchilddrawerlevelsecond('" + drawerid + "');showinfoondrawer('" + drawerid + "', '"+ drawername +"');\">" +
                            "<div class='drawer-options'>" +
                                "<div class='drawer-options-row'>" +
                                    "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                    "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                // "</div>" +
                                // "<div class='drawer-options-row'>" +
                                    "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                    "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                    "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deletefulldrawerchilddrawerlevelsecond('" + drawerid + "' , '"+ drawername +"');\" title='Delete Drawer' />" +
                                    "</div>" +
                            "</div>" +
                            "<div class='drawer-name'>" + drawername + "</div>" +
                        "</div>" +
                    "</td>" +
                "</tr>";
                }
                ttext=theader+ttext+"</table>"
                res.send(ttext);
            } else {
                res.send("no data");
            }
        });
    }

    else if (req.body.action === 'showsubchilddrawerlevelsecond') {
        var drawerid1 = req.body.subchilddrawerid;
        var theader = `<table width='260px' class='drawerbg'>
                        
                        </tr>`;
        var sql1 = "SELECT * FROM drawer_t.drawername WHERE orgid ='"+req.session.orgid+"' AND subdrawerid ='"+drawerid1+"'";
        dtcon.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                var ttext="";
                for (var j = 0; j < result.length; j++) {
                    
                    var drawername = result[j].drawername;
                    var drawerid = result[j].drawerid;
                    ttext = ttext + 
                    // theader = theader + "<tr><td colspan='2' onclick=draweridpass('"+drawerid+"');>"+drawername+"</td><td style='cursor: pointer;' onclick=showsubchilddrawerlevelthird(\"" + drawerid + "\");><img src='/static/image/open-folder.png' style='height:30px; width:30px;'/></td><td style='cursor: pointer;' onclick='sharedrawerfolder(\"" + drawerid + "\");'><img src='/static/image/share.png' style='height:30px; width:30px;'/></td></tr>";
                    "<tr>" +
                    "<td>" +
                        "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\" onclick=\"showsubchilddrawerlevelthird('" + drawerid + "');showinfoondrawer('" + drawerid + "', '"+ drawername +"');\">" +
                            "<div class='drawer-options'>" +
                                "<div class='drawer-options-row'>" +
                                    "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                    "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                // "</div>" +
                                // "<div class='drawer-options-row'>" +
                                    // "<img src='/static/image/edit1.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                    "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                    "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deletefulldrawer('" + drawerid + "');\" title='Delete Drawer' />" +

                                    "</div>" +
                            "</div>" +
                            "<div class='drawer-name'>" + drawername + "</div>" +
                        "</div>" +
                    "</td>" +
                "</tr>";
                }
                ttext=theader+ttext+"</table>"
                res.send(ttext);
            } else {
                res.send("no data");
            }
        });
    }
    else if(req.body.action === 'deleteimg'){
        var fileid=req.body.fileId; 
        var drawerid=req.body.drawerid;
        var sql1="delete from drawerdetails where drawerid='"+drawerid+"' and orgid='"+req.session.orgid+"' and drawerfileid='"+fileid+"';"
        dtcon.query(sql1,function(err,result1){
            if(err) console.log(err)
            else{
                return new Promise((resolve, reject) => {
                    deletefile(req,res,fileid,req.session.orgid,(successfun)=>{
                    resolve(successfun);

                    });
                    res.send("Delete file")
                })
            }
        })
    }
    else if (req.body.action === 'deletefulldrawer') {
        var drawerid = req.body.drawerid;
        var sql = "select * from drawerdetails where drawerid='" + drawerid + "' And orgid='" + req.session.orgid + "'";
        dtcon.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send("Error retrieving drawer details");
            } 
            if (result.length > 0) {
                let deletePromises = result.map(item => {
                    return new Promise((resolve, reject) => {
                        var fileid = item.drawerfileid;
                        deletefile(req, res, fileid, req.session.orgid, (successfun) => {
                            if (successfun) {
                                resolve();
                            } else {
                                reject(`Failed to delete file with ID ${fileid}`);
                            }
                        });
                    });
                });
    
                Promise.all(deletePromises)
                    .then(() => {
                        var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                        dtcon.query(sql1, function(err, result) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send("Error deleting drawer");
                            }
    
                            if (result.affectedRows > 0) {
                                var sql2 ="delete FROM drawerdetails where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';"
                                dtcon.query(sql2, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send("Error deleting drawer");
                                    }if (result.affectedRows > 0){
                                        res.send("Drawer deleted successfully along with all files");
                                    }
                                })  
                            } else {
                                res.status(404).send("Drawer not found");
                            }
                        });
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).send("Error deleting some files");
                    });
            } else {
                var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                dtcon.query(sql1, function(err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error deleting drawer");
                    }else if (result.affectedRows > 0) {
                        res.send("No files found in the This drawer");
                    }
                })
                
            }
        });
    }
    else if (req.body.action === 'deletefulldrawerchilddrawerlevelsecond') {
        var drawerid = req.body.drawerid;
        var sql4="select * from drawername where  orgid='" + req.session.orgid + "' And  subdrawerid='" + drawerid + "'";
        dtcon.query(sql4,function(err,result){
           if(err){
            console.log(err)
           }else if(result.length > 0){
            res.send("First Delete This Sub-Drawer")
           }else{
            var sql = "select * from drawerdetails where drawerid='" + drawerid + "' And orgid='" + req.session.orgid + "'";
            dtcon.query(sql, function(err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error retrieving drawer details");
                } 
                if (result.length > 0) {
                    let deletePromises = result.map(item => {
                        return new Promise((resolve, reject) => {
                            var fileid = item.drawerfileid;
                            deletefile(req, res, fileid, req.session.orgid, (successfun) => {
                                if (successfun) {
                                    resolve();
                                } else {
                                    reject(`Failed to delete file with ID ${fileid}`);
                                }
                            });
                        });
                    });
        
                    Promise.all(deletePromises)
                        .then(() => {
                            var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                            dtcon.query(sql1, function(err, result) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send("Error deleting drawer");
                                }
        
                                if (result.affectedRows > 0) {
                                    var sql2 ="delete FROM drawerdetails where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';"
                                    dtcon.query(sql2, function(err, result) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send("Error deleting drawer");
                                        }if (result.affectedRows > 0){
                                            res.send("Drawer deleted successfully along with all files");
                                        }
                                    })  
                                } else {
                                    res.status(404).send("Drawer not found");
                                }
                            });
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(500).send("Error deleting some files");
                        });
                } else {
                    var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                    dtcon.query(sql1, function(err, result) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send("Error deleting drawer");
                        }else if (result.affectedRows > 0) {
                            res.send("No files found in the This drawer");
                        }
                    })
                    
                }
            });
           }
            
        })
    }
    else if (req.body.action === 'deletesearchdrawer') {
        var drawerid = req.body.drawerid;
        var sql4="select * from drawername where  orgid='" + req.session.orgid + "' And  subdrawerid='" + drawerid + "'";
        dtcon.query(sql4,function(err,result){
           if(err){
            console.log(err)
           }else if(result.length > 0){
            res.send("First Delete This Sub-Drawer")
           }else{
            var sql = "select * from drawerdetails where drawerid='" + drawerid + "' And orgid='" + req.session.orgid + "'";
            dtcon.query(sql, function(err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error retrieving drawer details");
                } 
                if (result.length > 0) {
                    let deletePromises = result.map(item => {
                        return new Promise((resolve, reject) => {
                            var fileid = item.drawerfileid;
                            deletefile(req, res, fileid, req.session.orgid, (successfun) => {
                                if (successfun) {
                                    resolve();
                                } else {
                                    reject(`Failed to delete file with ID ${fileid}`);
                                }
                            });
                        });
                    });
        
                    Promise.all(deletePromises)
                        .then(() => {
                            var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                            dtcon.query(sql1, function(err, result) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send("Error deleting drawer");
                                }
        
                                if (result.affectedRows > 0) {
                                    var sql2 ="delete FROM drawerdetails where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';"
                                    dtcon.query(sql2, function(err, result) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send("Error deleting drawer");
                                        }if (result.affectedRows > 0){
                                            res.send("Delete file");
                                        }
                                    })  
                                } else {
                                    res.status(404).send("Drawer not found");
                                }
                            });
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(500).send("Error deleting some files");
                        });
                } else {
                    var sql1 = "delete FROM drawername where orgid='" + req.session.orgid + "' And drawerid='" + drawerid + "';";
                    dtcon.query(sql1, function(err, result) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send("Error deleting drawer");
                        }else if (result.affectedRows > 0) {
                            res.send("Delete file");
                        }
                    })
                    
                }
            });
           }
            
        })
    }
    // else if(req.body.action === 'deletefulldrawer'){
    //     var drawerid=req.body.drawerid;
    //     var sql="select * from drawerdetails where drawerid='"+drawerid+"' And orgid='"+req.session.orgid+"'";
    //     dtcon.query(sql,function(err,result){
    //         if(err){
    //             console.log(err)
    //         }else if(result.length>0){
    //             for(i=0;i<result.length;i++){
    //                 var fileid=result[i].drawerfileid;
    //                 return new Promise((resolve, reject) => {
    //                     deletefile(req,res,fileid,req.session.orgid,(successfun)=>{
    //                     resolve(successfun);
    //                     });
    //                 })
    //             }
    //             res.send("Delete file")
    //         }
    //     })
        // var sql1="delete from drawerdetails where drawerid='"+drawerid+"' and orgid='"+req.session.orgid+"' and drawerfileid='"+fileid+"';"
        // dtcon.query(sql1,function(err,result1){
        //     if(err) console.log(err)
        //     else{
        //         return new Promise((resolve, reject) => {
        //             deletefile(req,res,fileid,req.session.orgid,(successfun)=>{
        //             resolve(successfun);

        //             });
        //             res.send("Delete file")
        //         })
        //     }
        // })
    // }
    else if(req.body.action === "getaccountdetails"){
        mcon.query("select * from subscriptions where userid='" + req.session.userid + "' and moduleid=15", function(err, results){
            if(err) console.log(err)  
            else{
                var date_ob = new Date();
                let acc=[];
                let date = new Date(results[0].enddate)
                var diff = date.getTime() - date_ob.getTime()  
                var daydiff = diff / (1000 * 60 * 60 * 24)
                if(daydiff>0){
                    acc.push("Active")
                    let days = Math.round(daydiff)
                    acc.push(days)
                }
                else{
                    acc.push("deactive")
                    let days = 0
                    acc.push(days)
                }
                acc.push(results[0].startdate);
                acc.push(results[0].enddate);
                acc.push(results[0].usedquota);
                acc.push(results[0].quota)
                res.send(acc);
            }       
        })
    }
    else if (req.body.action === 'showshareinfo') {
        var drawerid=req.body.drawerid;
        var sql = "SELECT * FROM shaerdrawer WHERE orgid = '" + req.session.orgid + "' And  drawerid='"+drawerid+"'";
        dtcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
                else if(result.length>0){ 
                    var arr=[];
                    var theader = "<table id='report' width='280px' ><tr><th>Name</th><th>Contact No</th><th>Date</th><th>Password</th></tr>"
                    var ttext = ""
                    for(var i=0;i<result.length;i++){
                            var username = result[i].username;
                            if(username == 'undefined' || username == undefined || username == 'null' || username == null){
                                username = ''
                            }
                            var usercontactno = result[i].usercontactno;
                            if(usercontactno == 'undefined' || usercontactno == undefined || usercontactno == 'null' || usercontactno == null){
                                usercontactno = ''
                            }
                            var startdate = new Date(result[i].currentdate);
                            var startdate1 = startdate.getDate() + '-' + ('0' + (startdate.getMonth() + 1)).slice(-2) + '-' + startdate.getFullYear();
                            if(startdate1 == 'undefined' || startdate1 == null || startdate1 == 'null' || startdate1 == undefined || startdate1 == 'NaN-aN-aN'){
                                startdate1=''
                            }
                            var password = result[i].password;
                            if(password == 'undefined' || password == undefined || password == 'null' || password == null){
                                password = ''
                            }
                            ttext=ttext+"<tr><td>"+username+"</td><td>"+usercontactno+"</td><td>"+startdate1+"</td><td>"+password+"</td></tr>" 
                        }
                        ttext=theader+ttext+"</table>"
                       
                        res.send(ttext)
                    }else{
                        res.send("No Data")
                    }
        });
    }
    else if (req.body.action === 'showsearchdrawer') {
        var searchdrawersname=req.body.searchdrawersname;
        var sql = "SELECT drawerid,drawername FROM drawername WHERE orgid = '" + req.session.orgid + "' And  drawername like '%"+searchdrawersname+"%'";
        dtcon.query(sql, function(err, result) {
            if (err) console.log(err, req);
                else if(result.length>0){ 
                    var arr=[];
                    var theader = "<table width='260px' class='drawerbg'><tr ><th colspan='3'></th></tr>"
                    var ttext = ""
                    for(var i=0;i<result.length;i++){
                        var drawername = result[i].drawername;
                        if(drawername == 'undefined' || drawername == undefined || drawername == 'null' || drawername == null){
                            drawername = ''
                        }
                        var drawerid=result[i].drawerid;
                            ttext = ttext + 
                            
                            "<tr>" +
                                "<td>" +
                                    "<div class='drawer' style=\"background-image: url('/static/image/drawer2.jpeg');\">" +
                                        "<div class='drawer-options'>" +
                                            "<div class='drawer-options-row'>" +
                                                "<img src='/static/image/share.png' onclick=\"event.stopPropagation(); sharedrawerfolder('" + drawerid + "');\" title='Share'/>" +
                                                "<img src='/static/image/information.png' onclick=\"event.stopPropagation(); showshareinfo('" + drawerid + "');\" title='Information' />" +
                                            // "</div>" +
                                            // "<div class='drawer-options-row'>" +
                                                // "<img src='/static/image/new-folder.png' onclick=\"event.stopPropagation(); creatsubdrawerfolder('" + drawerid + "');\" title='New Folder' />" +
                                                "<img src='/static/image/folders.png' onclick=\"event.stopPropagation(); showfilesinfolderunder('" + drawerid + "');\" title='Files' />" +
                                                "<img src='/static/image/trash.png' onclick=\"event.stopPropagation(); deletesearchdrawer('" + drawerid + "', '"+ drawername +"');\" title='New Folder' />" +

                                                "</div>" +
                                        "</div>" +
                                        "<div class='drawer-name'>" + drawername + "</div>" +
                                    "</div>" +
                                "</td>" +
                            "</tr>";
                        }
                        ttext=theader+ttext+"</table>"
                       
                        res.send(ttext)
                    }else{
                        res.send("No data")
                    }
            });
        }
        
        else if (req.body.action === 'searchfile') {
            var searchfile = req.body.searchfile;
            var theader = "<table id='report' width='260px'>";
        
            // Modified SQL query to join drawername and drawerdetails tables
            var sql = `
                SELECT d.drawername, dd.drawerid, dd.drawerfileid, dd.filetype 
                FROM drawername d 
                INNER JOIN drawerdetails dd ON d.drawerid = dd.drawerid 
                WHERE d.orgid = '${req.session.orgid}' 
                AND dd.filetype LIKE '%${searchfile}%'
            `;
        
            dtcon.query(sql, function(err, results) {
                if (err) {
                    console.log(err);
                    res.send("Error occurred");
                } else if (results.length > 0) {
                    var drawers = {}; // Object to hold drawers and their files
        
                    results.forEach(result => {
                        var drawername = result.drawername;
                        if (!drawers[drawername]) {
                            drawers[drawername] = [];
                        }
                        drawers[drawername].push(result);
                    });
        
                    var ttext = "";
        
                    for (var drawername in drawers) {
                        ttext += `<tr><th style='font-size: 18px;' colspan='2'>${drawername}</th></tr>`;
                        drawers[drawername].forEach(file => {
                            var filename = file.filetype;
                            var drawerfileid = file.drawerfileid;
                            var getFileExtension = filename.split('.').pop().toLowerCase();
                            var iconHtml = "";
                            
                            if (getFileExtension === "pdf") {
                                iconHtml = `<tr><td><img src='/static/image/pdf.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>${filename}</td></tr>`;
                            } else if (getFileExtension === "png" || getFileExtension === "jpg" || getFileExtension === "jpeg") {
                                iconHtml = `<tr><td><img src='/static/image/photo.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>${filename}</td></tr>`;
                            }else if(getFileExtension === "txt"){
                                ttext += `<tr><td><img src='/static/image/txt.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "xls"){
                                ttext += `<tr><td><img src='/static/image/xls.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "xlsx"){
                                ttext += `<tr><td><img src='/static/image/xlsx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "docx"){
                                ttext += `<tr><td><img src='/static/image/docx.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "doc"){
                                ttext += `<tr><td><img src='/static/image/doc.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "zip"){
                                ttext += `<tr><td><img src='/static/image/zip.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }else if(getFileExtension === "gz"){
                                ttext += `<tr><td><img src='/static/image/gz.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>`+filename+`</td></tr>`;
                            }
                             else {
                                iconHtml = `<tr><td><img src='/static/image/pdf.png' style='height:35px; width:35px;' onclick='getdrawerimg("${drawerfileid}");'></td><td style='text-align: left;'>${filename}</td></tr>`;
                            }
                            
                            ttext += iconHtml;
                        });
                    }
        
                    ttext = theader + ttext + "</table>";
                    res.send(ttext);
                } else {
                    res.send("No Data");
                }
            });
        }
        
}) 


app.use(busboy());
app.post('/1/drawerfileupload', function(req, res) {
    if (req.busboy) {
        let fileBuffer = [];
        let action, drawerid, filename, fileext;
        const allowedExtensions = ['txt','xls', 'xlsx', 'doc', 'docx', 'zip', 'gz','jpeg','jpg','pdf','png'];
        req.busboy.on('field', function(fieldName, value) {
            if (fieldName === 'action') action = value;
            if (fieldName === 'drawerid') drawerid = value;
        });
        req.busboy.on('file', function(fieldName, fileStream, file) {
            filename = file.filename;
            fileext = filename.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileext)) {
                return res.status(400).send('File type not allowed: ' + fileext);
            }

            fileStream.on('data', (data) => {
                fileBuffer.push(data);
            });
            fileStream.on('end', () => {
                console.log('File upload complete:', filename);
                // Optionally, save the file somewhere on the server here
            });
        });
        req.busboy.on('finish', function() {
            if (fileBuffer.length === 0) {
                return res.status(400).send('No files were uploaded.');
            }
            if (action === 'drawerimgupload1') {
                var sql = "SELECT subscriptions.quota, subscriptions.usedquota FROM subscriptions WHERE subscriptionid LIKE '" + req.session.subid + "'";
                mcon.query(sql, function(err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Database error');
                    }
                    if (result.length > 0) {
                        let quota = result[0].quota || 0;
                        let usedquota = result[0].usedquota || 0;
                        if (usedquota > quota) {
                            return res.send("You have reached the maximum limit of file upload");
                        } else {
                            let filecontent = Buffer.concat(fileBuffer);
                            savefiledb1(filename, filecontent, req.session.orgid, (successfun) => {
                                var currentdate = new Date();
                                currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2);
                                var sql = "INSERT INTO drawerdetails(orgid,drawerfileid,drawerid,createddate,filetype) VALUES('" + req.session.orgid + "','" + successfun + "','" + drawerid + "','" + currentdate + "','" + filename + "')";
                                dtcon.query(sql, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send('Database error');
                                    }
                                    if (result.affectedRows > 0) {
                                        gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
                                            return res.send("File Upload");
                                        });
                                    } else {
                                        return res.send("Something went wrong, please try after sometime.");
                                    }
                                });
                            });
                        }
                    }
                });
            } else {
                res.send('Upload succeeded!');
            }
        });

        req.pipe(req.busboy);
    } else {
        res.status(400).send('Busboy is not initialized.');
    }
});


//google drive file upload 

// const stream = require("stream");
// const path = require("path");
// const { google } = require("googleapis");
// const upload = multer();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.sendFile(`${__dirname}/drawer.pug`);
// });

// const KEYFILEPATH = path.join(__dirname, "cred.json");
// const SCOPE = ["https://www.googleapis.com/auth/drive.file"];

// const auth = new google.auth.GoogleAuth({
//     keyFile: KEYFILEPATH,
//     scopes: SCOPE,
// });

// app.post("/upload", upload.any(), async (req, res) => {
//     try {
//         const { files } = req;
//         for (let file of files) {
//             await uploadFile(file);
//         }
//         res.status(200).send("Form submitted");
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// const uploadFile = async (fileObject) => {
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(fileObject.buffer);
//     const drive = google.drive({ version: "v3", auth });
//     const { data } = await drive.files.create({
//         media: {
//             mimeType: fileObject.mimetype,
//             body: bufferStream,
//         },
//         requestBody: {
//             name: fileObject.originalname,
//             parents: ["18qqtAOYjN0xWb2QqtaYreJGHJaJR3Y41"],  // Replace with your folder ID
//         },
//         fields: "id,name",
//     });
//     console.log(`File uploaded: ${data.name} (${data.id})`);
// };

const stream = require("stream");
const path = require("path");
const { google } = require("googleapis");
const upload = multer();
const { private_key, client_email, project_id } = require("./cred.json"); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.sendFile(`${__dirname}/drawer.pug`);
// });

const auth = new google.auth.GoogleAuth({
    credentials: {
        private_key,
        client_email,
        project_id,
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// app.post("/upload", upload.any(), async (req, res) => {
//     try {
//         const { files } = req;
//         for (let file of files) {
//             await uploadFile(file);
//         }
//         res.status(200).send("Form submitted");
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });
// app.post('/upload', upload.any(), async(req, res) =>{
//     if (req.busboy) {
//         console.log("hello")
//         let fileBuffer = [];
//         let action, drawerid, filename, fileext;
//         const allowedExtensions = ['txt','xls', 'xlsx', 'doc', 'docx', 'zip', 'gz','jpeg','jpg','pdf','png'];
//         req.busboy.on('field', function(fieldName, value) {
//             if (fieldName === 'action') action = value;
//             if (fieldName === 'drawerid') drawerid = value;
//         });
//         req.busboy.on('file', function(fieldName, fileStream, file) {
//             filename = file.filename;
//             fileext = filename.split('.').pop().toLowerCase();
           

//             if (!allowedExtensions.includes(fileext)) {
//                 return res.status(400).send('File type not allowed: ' + fileext);
//             }

//             fileStream.on('data', (data) => {
//                 fileBuffer.push(data);
//             });
//             fileStream.on('end', () => {
//                 console.log('File upload complete:', filename);
//                 // Optionally, save the file somewhere on the server here
//             });
//         });
//         try {
//             const { files } = req;
//             for (let file of files) {
//                 await uploadFile(file);
//             }
//             res.status(200).send("Form submitted");
//         } catch (error) {
//             res.status(500).send(error.message);
//         }
//         req.busboy.on('finish', function() {
//             if (fileBuffer.length === 0) {
//                 return res.status(400).send('No files were uploaded.');
//             }
//             if (action === 'drawerimgupload1') {
//                 var sql = "SELECT subscriptions.quota, subscriptions.usedquota FROM subscriptions WHERE subscriptionid LIKE '" + req.session.subid + "'";
//                 mcon.query(sql, function(err, result) {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).send('Database error');
//                     }
//                     if (result.length > 0) {
//                         let quota = result[0].quota || 0;
//                         let usedquota = result[0].usedquota || 0;
//                         if (usedquota > quota) {
//                             return res.send("You have reached the maximum limit of file upload");
//                         } else {
//                             let filecontent = Buffer.concat(fileBuffer);
//                             savefiledb1(filename, filecontent, req.session.orgid, (successfun) => {
//                                 var currentdate = new Date();
//                                 currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2);
//                                 var sql = "INSERT INTO drawerdetails(orgid,drawerfileid,drawerid,createddate,filetype) VALUES('" + req.session.orgid + "','" + successfun + "','" + drawerid + "','" + currentdate + "','" + filename + "')";
//                                 dtcon.query(sql, function(err, result) {
//                                     if (err) {
//                                         console.log(err);
//                                         return res.status(500).send('Database error');
//                                     }
//                                     if (result.affectedRows > 0) {
//                                         gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
//                                             return res.send("File Upload");
//                                         });
//                                     } else {
//                                         return res.send("Something went wrong, please try after sometime.");
//                                     }
//                                 });
//                             });
//                         }
//                     }
//                 });
//             } else {
//                 res.send('Upload succeeded!');
//             }
//         });

//         req.pipe(req.busboy);
//     } else {
//         res.status(400).send('Busboy is not initialized.');
//     }
// });
// const uploadFile = async (fileObject) => {
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(fileObject.buffer);
//     const drive = google.drive({ version: "v3", auth });
//     const { data } = await drive.files.create({
//         media: {
//             mimeType: fileObject.mimetype,
//             body: bufferStream,
//         },
//         requestBody: {
//             name: fileObject.originalname,
//             parents: ["18qqtAOYjN0xWb2QqtaYreJGHJaJR3Y41"],  
//         },
//         fields: "id,name",
//     });
//     console.log(`File uploaded: ${data.name} (${data.id})`);
// };

scopes: ["https://www.googleapis.com/auth/drive.file"],


app.post('/upload', (req, res) => {
    if (!req.busboy) {
        return res.status(400).send('Busboy is not initialized.');
    }

    req.busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        let fileBuffer = [];
        let fileext = filename.split('.').pop().toLowerCase();
        const allowedExtensions = ['txt', 'xls', 'xlsx', 'doc', 'docx', 'zip', 'gz', 'jpeg', 'jpg', 'pdf', 'png'];

        if (!allowedExtensions.includes(fileext)) {
            return res.status(400).send('File type not allowed: ' + fileext);
        }

        file.on('data', (data) => {
            fileBuffer.push(data);
        });

        file.on('end', async () => {
            console.log('File upload complete:', filename);

            const fileObject = {
                buffer: Buffer.concat(fileBuffer),
                mimetype: mimeType,
                originalname: filename
            };

            try {
                await uploadFile(fileObject);
                res.status(200).send("Form submitted");
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
    });

    req.busboy.on('field', (fieldName, value) => {
        req.body[fieldName] = value;
    });

    req.busboy.on('finish', async () => {
        if (req.body.action === 'drawerimgupload1') {
            const sql = `SELECT subscriptions.quota, subscriptions.usedquota FROM subscriptions WHERE subscriptionid LIKE '${req.session.subid}'`;
            mcon.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Database error');
                }
                if (result.length > 0) {
                    let quota = result[0].quota || 0;
                    let usedquota = result[0].usedquota || 0;
                    if (usedquota > quota) {
                        return res.send("You have reached the maximum limit of file upload");
                    } else {
                        let filecontent = Buffer.concat(req.body.fileBuffer);
                        savefiledb1(req.body.filename, filecontent, req.session.orgid, (successfun) => {
                            var currentdate = new Date();
                            currentdate = currentdate.getFullYear() + '-' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentdate.getDate()).slice(-2);
                            var sql = `INSERT INTO drawerdetails(orgid,drawerfileid,drawerid,createddate,filetype) VALUES('${req.session.orgid}','${successfun}','${req.body.drawerid}','${currentdate}','${req.body.filename}')`;
                            dtcon.query(sql, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send('Database error');
                                }
                                if (result.affectedRows > 0) {
                                    gettotalsize2(req.session.subid, req.session.orgid, (successfun) => {
                                        return res.send("File Upload");
                                    });
                                } else {
                                    return res.send("Something went wrong, please try after sometime.");
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.send('Upload succeeded!');
        }
    });

    req.pipe(req.busboy);
});

const uploadFile = async (fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    const drive = google.drive({ version: "v3", auth });
    const { data } = await drive.files.create({
        media: {
            mimeType: fileObject.mimetype,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: ["18qqtAOYjN0xWb2QqtaYreJGHJaJR3Y41"],
        },
        fields: "id,name",
    });
    console.log(`File uploaded: ${data.name} (${data.id})`);
};





app.listen(port,()=>{
    console.log('Server started at  port ${port}')
})


// const optionsssl = {
//     key: fs.readFileSync("/home/cal100/certs/25feb23/cal25feb23.pem"),
//     cert: fs.readFileSync("/home/cal100/certs/25feb23/hostgator.crt"),
// };
// app.listen(55556, () => {
//      console.log(`Server started at  port ${55000}`);
// })
// https.createServer(optionsssl, app).listen(port);





