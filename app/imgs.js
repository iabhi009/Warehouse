var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var multer = require('multer');
var path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/profile_pictures');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    }
  });
router.post('/profile', upload.single('image'), function (req, res) 
{
try
  {
  if(req.isAuthenticated())
  {
    //console.log("+++++++++++++++++++++==very nice");
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
 
  console.log("Debug req.file: ",req.file);
  console.log("Debug body:",req.body);
  //console.log("File Path:",req.file.path);
  var filename;
  if(req.file == null)
  {
  filename=req.user.p_profilePicture;
  }
  else
  {
  filename="profile_pictures/"+req.file.filename;
  }
  console.log(filename);
  //console.log("Debug Adhar no: ",req.body.adhar);
  con.connect(function(err) {
    if (err) throw err;
    var query="UPDATE users SET users.p_adhar=?, users.p_phone=?,users.p_address=?,users.p_profilePicture=? WHERE p_id=?";
    con.query(query,[req.body.adhar,req.body.phone_number,req.body.address,filename,req.user.p_id],
     function (err, result, fields)
      {
        if (err) throw err;
        return res.redirect('/pro');
      });
    });
   
  }
  else
  {
    res.redirect('/loginp');
  }
  }
  catch (err) {
    throw err;
  } 
});
//Save warehouse
const storage_warehouse = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/warehouses');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload_warehouse = multer({
    storage: storage_warehouse,
    limits: {
      fileSize: 1024 * 1024 * 5
    }
  });

router.post('/warehouse', upload_warehouse.single('image'), function (req, res) 
{
try
  {
  if(req.isAuthenticated())
  {
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
 
  console.log("Debug req.file: ",req.file);
  console.log("Debug body:",req.body);
  //console.log("File Path:",req.file.path);
  var filename;
  con.connect(function(err) {
    if (err) throw err;
    var query="SELECT warehouse.w_image FROM warehouse WHERE w_id = ? ";
    con.query(query,[req.query.id],
      function (err, result, fields)
      {
          console.log("Result:",result);
            if(err) throw err;
            if(req.file == null)
            {
              filename=result[0].w_image;
            }
            else
            {
                filename="warehouses/"+req.file.filename;
            }
            console.log("filename: ",filename);
        
    
  console.log("Is this working:",filename);
  var query="UPDATE warehouse SET warehouse.w_image=?,warehouse.w_propertyTitle = ? , warehouse.w_propertyDescription=? ,warehouse.w_address= ? , warehouse.w_phone=? , warehouse.w_rent = ? WHERE warehouse.w_id = ?";
        
      con.query(query,[filename,req.body.warehouse_title,req.body.warehouse_description,req.body.warehouse_address,req.body.warehouse_phone,req.body.warehouse_rent,req.query.id],
       function (err, result, fields)
        {
          if (err) throw err;
          var str='/view?id='+req.query.id;
          res.redirect(str);
        });
    });
    });
    }
    else
    {
        res.redirect('/warehouse');
    }
    }
    catch
    {
        throw err;
    }
    
  });
  
module.exports = router;