module.exports = function(app, passport) {
  var mysql = require('mysql');
  var nodemailer = require('nodemailer');
  var schedule = require('node-schedule');

  /* HOME PAGE */
  app.get('/', function(req, res){
    
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "wms"
    });
    
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT users.p_fname,feedback.f_title,feedback.f_description,feedback.f_stars,users.p_profilePicture FROM users,feedback WHERE users.p_id = feedback.p_id AND feedback.f_stars >0",
       function (err, result, fields)
        {
        if (err) throw err;
        if(req.isAuthenticated())
          {
            res.render('home.ejs',{user:req.user,result});
            //res.render('login_gallery.ejs',{user:req.user});    
          }
        else
          {
              //res.render('gallery.ejs');
              res.render('index.ejs',{result});
          }
      });
    });
});
//send mail
app.get('/mail',function(req,res)
{
  console.log(req.query.mail);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
           user: 'iabhi009@gmail.com',
           pass: 'ieatpizza'
       }
   });
   const mailOptions = {
    from: 'iabhi009@gmail.com', // sender address
    to: req.query.mail, // list of receivers
    subject: 'Test Subject', // Subject line
    text: 'Hello World!!'
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
 });
 res.redirect('/');
});

// Day Subtractor
var j = schedule.scheduleJob('*/1 * * * *', function(){  // this for one hour
  console.log("Subtracting no of days left for subsciption , sending mail to all the ");
  //UPDATE currentbooking SET cb_days = cb_days-1 WHERE cb_days >1
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  }); 
  
  con.connect(function(err) {
    if (err) throw err;
    con.query("UPDATE currentbooking SET cb_days = cb_days-1 WHERE cb_days >1",
     function (err, result, fields)
      {
      if (err) throw err;
          con.query("UPDATE warehouse SET warehouse.w_statusOfBooking=0 WHERE warehouse.w_id IN (SELECT currentbooking.w_id FROM currentbooking WHERE currentbooking.cb_days =1)",
          function (err, result, fields)
          {
          if (err) throw err;
            con.query("DELETE FROM currentbooking WHERE currentbooking.cb_days =1",
            function (err, result, fields)
              {
              if (err) throw err;
                
              });  
        }); 
        con.query("SELECT users.p_email FROM currentbooking,users WHERE currentbooking.cb_days = 13 and currentbooking.p_id=users.p_id",
            function (err, result, fields)
              {
              if (err) throw err;
              for(var i=0; i < result.length ; i++)
              {
                              
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: { 
                        user: 'iabhi009@gmail.com',
                        pass: 'ieatpizza'
                    }
                });
                const mailOptions = {
                  from: 'iabhi009@gmail.com', // sender address
                  to: result[i], // list of receivers
                  subject: 'Test Subject', // Subject line
                  text: 'Hello World!!'
                };
                transporter.sendMail(mailOptions, function (err, info) {
                  if(err)
                    console.log(err)
                  else
                    console.log(info);
              });
              }
              });
    });
  });

});

// View Warehouse
app.get('/view', function(req, res){
  //console.log("Warehouse id :",req.query.id);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  con.connect(function(err) {
    if (err) throw err;
    var query="SELECT users.p_id,users.p_fname,users.p_lname,warehouse.p_id,warehouse.w_id,warehouse.w_image,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_address,warehouse.w_phone,warehouse.w_rent,warehouse.w_statusOfBooking,warehouse.w_verified,warehouse.w_paymentType,DATEDIFF(CURRENT_TIMESTAMP,w_warehouseDate) AS days FROM warehouse,users WHERE w_id = ? AND warehouse.p_id=users.p_id";
    con.query(query,[req.query.id],
      function (err, result, fields)
      { //res.render('index.ejs',{result});
      console.log("Warehouse Details :",result);
      if(req.isAuthenticated())
        {
        res.render('login_view.ejs', {
          result,
          user:req.user
        });
        }
        else
        {
        res.render('view.ejs', {
          result
        });
        }
    });
  });
  
});

//Edit Warehouse
app.get('/editwh', function(req, res){
  if(req.isAuthenticated() )
          {
  //console.log("Warehouse id :",req.query.id);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  con.connect(function(err) {
    if (err) throw err;
    var query="SELECT users.p_id,users.p_fname,users.p_lname,warehouse.w_image,warehouse.p_id,warehouse.w_id,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_address,warehouse.w_phone,warehouse.w_rent,warehouse.w_statusOfBooking,warehouse.w_verified,warehouse.w_paymentType,DATEDIFF(CURRENT_TIMESTAMP,w_warehouseDate) AS days FROM warehouse,users WHERE w_id = ? AND warehouse.p_id=users.p_id";
    con.query(query,[req.query.id],
      function (err, result, fields)
      { //res.render('index.ejs',{result});
      console.log("Warehouse Details :",result);
      console.log("Warehouse OWner:",result.p_id);
      console.log("User trying to login:",req.user.p_id);
      console.log("Result:",Number(req.user.p_id) == Number(result[0].p_id));
      if(req.isAuthenticated() && Number(req.user.p_id) == Number(result[0].p_id) )
        {
        res.render('view_edit.ejs', {
          result,
          user:req.user
        });
        }
        else
        {
        res.redirect('/warehouse');
        }
    });
  });
}
else
{
  res.redirect('/warehouse');
}
});



//Book
app.get('/book', function(req, res)
{
  if(req.isAuthenticated())
  {
  //console.log("Warehouse id :",req.query.id);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  con.connect(function(err) {
      if (err) throw err;
      var query="INSERT INTO currentbooking (w_id,p_id,cb_days) VALUES (?,?,?)";
      console.log("Book Values ",req.query.id,req.user.p_id,28 );
      con.query(query,[req.query.id,req.user.p_id,28],
        function (err, result, fields)
        {
        con.query("UPDATE warehouse SET w_statusOfBooking = 1 WHERE w_id = ?",req.query.id,
          function(err,result,fields)
          {
            var str= '/view?id='+req.query.id;
            res.redirect(str);
          });
        });
    });
  }
  else
        {
        res.redirect('/loginp');
        }
});

//Profile
app.get('/pro', function(req, res){
  if(req.isAuthenticated())
  {
  console.log("Debug(To check user id):",req.user.p_id);
  //console.log("DEBUG(38): ",req.user);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });

  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT users.p_fname,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_phone,warehouse.w_rent,warehouse.w_paymentType,warehouse.w_verified,warehouse.w_statusOfBooking FROM users,warehouse WHERE users.p_id = warehouse.p_id",
    function (err, result, fields)
    {
      //console.log(result);
      if (err) throw err;
      res.render('user.ejs', {
            result,
            user:req.user
      });
     });
  });      
}
else
{
    //res.render('gallery.ejs');
    res.redirect('/loginp');
}
});
app.get('/editpro',function(req, res){
  
  if(req.isAuthenticated())
  {
  console.log("Debug(To check user id):",req.user.p_id);
  //console.log("DEBUG(38): ",req.user);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });

  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT users.p_fname,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_phone,warehouse.w_rent,warehouse.w_paymentType,warehouse.w_verified,warehouse.w_statusOfBooking FROM users,warehouse WHERE users.p_id = warehouse.p_id",
    function (err, result, fields)
    {
      //console.log(result);
      if (err) throw err;
      res.render('edit_user.ejs', {
            result,
            user:req.user
      });
     });
  });      
}
else
{
    //res.render('gallery.ejs');
    res.redirect('/loginp');
}
});
//Booked
app.get('/bookings', function(req, res)
{  
  if(req.isAuthenticated())
  {
    console.log("MY warhouse userid",req.user.p_id);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    var query="SELECT currentbooking.w_id,warehouse.w_image,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_phone,warehouse.w_rent,warehouse.w_paymentType,warehouse.w_verified,warehouse.w_statusOfBooking,cb_days AS days FROM currentbooking,warehouse WHERE currentbooking.p_id = ? AND currentbooking.w_id = warehouse.w_id";
    con.query(query,[req.user.p_id],
    function (err, result, fields)
    {
   //   console.log(result);
      if (err) throw err;
      res.render('user_booking.ejs', {
            result,
            user:req.user
      });
     });
  });      
}
else
{
    res.redirect('/loginp');
}

});

//profile_Warehouses
app.get('/userwarehouses', function(req, res)
{  
  if(req.isAuthenticated())
  {
    console.log("MY warhouse userid",req.user.p_id);
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    var query="SELECT users.p_fname,warehouse.w_id,warehouse.w_image,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_phone,warehouse.w_rent,warehouse.w_paymentType,warehouse.w_verified,warehouse.w_statusOfBooking FROM users,warehouse WHERE users.p_id = ? AND  warehouse.p_id = users.p_id";
    con.query(query,[req.user.p_id],
    function (err, result, fields)
    {
   //   console.log(result);
      if (err) throw err;
      res.render('user_warehouse.ejs', {
            result,
            user:req.user
      });
     });
  });      
}
else
{
    //res.render('gallery.ejs');
    res.redirect('/loginp');
}

});
/*
app.get('/profile',function(req,res)
{
  if(req.isAuthenticated())
  {
   res.render('user.ejs',{user:req.user});    
  }
  else
  {
    res.redirect('/loginp');
  }
});
*/

// Warehouses

 app.get('/addwarehouse',
 function(req,res)
 {
  if(req.isAuthenticated())
  {
   res.render('signup2.ejs',{user:req.user});    
  }
  else
  {
     res.redirect('/loginp');
  }
 }
 );

 
app.post('/addwarehouse',
function(req,res)
{
  if(!req.isAuthenticated())
  {
    res.redirect('/loginp');
  }
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log(">>>>>>>>>>",req.user.p_id);
    var insertQuery = "INSERT INTO warehouse (p_id,w_propertyTitle,w_propertyDescription,w_phone,w_rent) VALUE (?,?,?,?,?)";
    con.query(insertQuery, [req.user.p_id,req.body.warehouseTitle,req.body.warehouseDescription,req.body.warehousePhone,req.body.warehouseRent],//[req.user.p_id,req.body.warehouseTitle,req.body.warehouseDescription,req.body.warehousePhone,req.body.warehouseRent],
     function(err, rows)
     {
      if(err)
      {
      console.log(err);
      }   
      res.redirect('/');   
     });
  });
 //console.log(req.body);
  //res.redirect('/');
}
);
   
// Normal Page Redirects
app.get('/about', function(req, res){

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT users.p_fname,feedback.f_title,feedback.f_description,feedback.f_stars,users.p_profilePicture FROM users,feedback WHERE users.p_id = feedback.p_id AND feedback.f_stars >0",
     function (err, result, fields)
      {
      if (err) throw err;
      if(req.isAuthenticated())
        {
          res.render('about_login.ejs',{user:req.user,result});
        }
      else
        {
            res.render('about.ejs',{result});
        }
    });
  });
 });
 app.get('/contact', function(req, res){

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT users.p_fname,feedback.f_title,feedback.f_description,feedback.f_stars,users.p_profilePicture FROM users,feedback WHERE users.p_id = feedback.p_id AND feedback.f_stars >0",
     function (err, result, fields)
      {
      if (err) throw err;
      if(req.isAuthenticated())
        {
          res.render('contact_login.ejs',{user:req.user,result});
        }
      else
        {
            res.render('contact.ejs',{result});
        }
    });
  });
 });

 app.get('/service', function(req, res){

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT users.p_fname,feedback.f_title,feedback.f_description,feedback.f_stars,users.p_profilePicture FROM users,feedback WHERE users.p_id = feedback.p_id AND feedback.f_stars >0",
     function (err, result, fields)
      {
      if (err) throw err;
      if(req.isAuthenticated())
        {
          res.render('service_login.ejs',{user:req.user,result});
        }
      else
        {
            res.render('service.ejs',{result});
        }
    });
  });
 });


app.get('/warehouse',function(req,res)
{
  res.redirect('/properties');
});
app.get('/properties',function(req,res)
{
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "wms"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT warehouse.w_id,users.p_fname,warehouse.w_image,warehouse.w_propertyTitle,warehouse.w_propertyDescription,warehouse.w_address,warehouse.w_phone,warehouse.w_rent,warehouse.w_paymentType,warehouse.w_verified,warehouse.w_statusOfBooking,DATEDIFF(CURRENT_TIMESTAMP,w_warehouseDate) AS days FROM users,warehouse WHERE users.p_id = warehouse.p_id",
     function (err, result, fields)
      {
      if (err) throw err;
     // console.log(result);
        //res.render('index.ejs',{result});
        if(req.isAuthenticated())
        {
          res.render('login_properties.ejs',{user:req.user,result});
        }
        else
        {
          
     res.render('properties.ejs',{result});
        }
    });
  });
});

app.get('/home',
function(req,res)
{
  if(req.isAuthenticated())
   {
     res.redirect('/');
   }
   else
   {
     res.redirect('/loginp');
   }
}

);
 app.get('/gallery',function(req,res)
 {
   if(req.isAuthenticated())
   {
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "wms"
    });
    
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT users.p_fname,feedback.f_title,feedback.f_description,feedback.f_stars,users.p_profilePicture FROM users,feedback WHERE users.p_id = feedback.p_id AND feedback.f_stars >0",
       function (err, result, fields)
        {
        if (err) throw err;
       res.render('login_gallery.ejs',{user:req.user,result}); 
        });
      });   
   }
   else
   {
      res.render('gallery.ejs');
   }
});
// User Registration and Login
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/loginp',
  failureFlash: true
 }),
  function(req, res){
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 3;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/');
  });
 app.get('/signup', function(req, res){
  console.log("Going inside /signup");
  res.render('new_register_user.ejs', {message: req.flash('signupMessage')});
 
});

 app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/pro',
  failureRedirect: '/signup',
  failureFlash: true
 }));

 app.get('/register', function(req, res){
  res.render('new_register_user.ejs'); 
 });
 app.get('/login', function(req, res){
  res.render('login.ejs', {message:req.flash('loginMessage')}); 
 });

app.get('/loginp',function(req,res)
 {
  res.render('ware_login.ejs');
 });
 app.get('/registerp',function(req,res)
 {
   res.render('new_register_user.ejs');
 });

 app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
 })
};
// TO check session
function isLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();
 res.redirect('/');
}
function uploadImage(req,res,next)
{
  
}
