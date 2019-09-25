var LocalStrategy = require("passport-local").Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
 
  passport.serializeUser(function(user, done){
    //console.log("Very import info:",user);
    done(null, user.id);
 });

 passport.deserializeUser(function(id, done){
  //console.log("ID:",id);
  connection.query("SELECT * FROM users WHERE p_id = ? ", [id],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'local-signup',
  new LocalStrategy({
    usernameField : 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done){
    console.log(req.body);
    connection.query("SELECT * FROM users WHERE p_email = ? ", 
    [username], 
    function(err, rows){
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'That is already taken'));
    }
    else if(!password.length)
    {

      return done(null, false, req.flash('signupMessage', 'Password field is empty'));
    }
    else if(!username.length)
    {
      return done(null, false, req.flash('signupMessage', 'Ussername field is empty'));
    }
    else if(req.body.password != req.body.password2)
    {
      return done(null, false, req.flash('signupMessage', 'Passwords does not match'));
    }
    else
    {
     var newUserMysql = {
      username: username,
      password: password
     };

     var insertQuery = "INSERT INTO users (p_fname,p_lname,p_email, p_password) values (?,?,?, ?)";
     //console.log(newUserMysql.username, newUserMysql.password);
     connection.query(insertQuery, [req.body.first_name,req.body.last_name,newUserMysql.username, newUserMysql.password],
      function(err, rows)
      {
        newUserMysql.id = rows.insertId;
        return done(null, newUserMysql);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, username, password, done){

   connection.query("SELECT * FROM users WHERE p_fname = ? ", [username],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(password != rows[0].p_password)
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));
    //console.log("Login:",rows[0]);
    var newUserMysql = {
      id:rows[0].p_id,
      username: rows[0].p_fname,
      password: rows[0].p_password
     };
    return done(null, newUserMysql);
   });
  })
 );
};