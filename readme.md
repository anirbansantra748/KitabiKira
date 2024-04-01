# passport log in log out -

1. user.js
   . in models folder/file (require moongoose , require passport local mng)
   . const schema = mongoose.Schema();
   . const UserSchema = new Schema({email:{}})
   . userSchema.plugin(passportLocalmng)
   . make a user model export it

2. app.js
   . require the user schema , session ,
   . define session opt = { secret: , resave , save and uninitilize}
   . app.use(session(sesopt))
   . app.use(passport.initilize())
   . app.use(passport.session())
   . app.use(new localstatergy(User.authenticate()))
   . passport.serializeUser(User.serialize())
   . passport.deserializeUser(User.deserialize())

3. routes
   . /demo rout
   . let fakeUser = new User({email:,username:})
   . let newuser = await user.register(fakeuser,"1234")

4. routes/signup.ejs
   . signup - serve a form collect data from
   . /signup - let {username,password,email} = req.body;
   . const newuser = new User(email,username);
   . await user.register(newuser,password)

5. router.post("/login", passport.authenticate("local", {
   successRedirect: '/home',
   failureRedirect: '/login',
   failureFlash: true }));

# Initilize the user and also the user owner

1. made bookSchema add a owner that ref the user schema
   . owner : {
   type: Schema.Type.ObjectId,
   ref:User
   }

2. add samle data in init/data.js
   . const books = [{data}]
   . module.exports{data:books}

3) index.js for initilize the data 
   . const initData = ()=>{
     await store.deleteMany({});
     data.data = data.data.map((obj) => ({
     ...obj,
     owner: "65ddbb23342f3555b1c43b90",
   }));
   await store.insertMany(data.data);
   console.log("data was initialized");
   }

