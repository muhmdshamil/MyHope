if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require('events').EventEmitter.defaultMaxListeners = 20;
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodoverride = require('method-override');
const Register = require('./userModel/register');
const contactCollection = require('./userModel/contact');
const BloodRequest = require('./userModel/bloodRequest');  // Import the BloodRequest model
const LightRequest = require('./userModel/light');
const ClothRequest = require('./userModel/cloth');
const FoodRequest =require('./userModel/food')
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')
const cors = require("cors")


// Register eq helper for Handlebars
hbs.registerHelper('eq', function(a, b) {
    return a===b  // If a == b, render the block conten
});

// Ensure passport is configured
require('./passport-config'); // Import passport configuration
hbs.registerPartials(__dirname + '/views/partials');

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("Error: MONGO_URI is not defined in the environment variables.");
  process.exit(1); // Exit the application
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'));

 // Ensure your .html files are in the "views" folder
  

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || "defaultSecret", // Use a default if SESSION_SECRET is not set
  resave: false,
  saveUninitialized: false,
  cookie :{secure:false}
}));
app.use(cors())
app.use(passport.initialize());
app.use(passport.session());
app.use(methodoverride("_method"));

// Routes

app.get('/',checkAuthenticated,(req,res)=>{
  res.render('home');
})



app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
});

app.get('/contact', checkAuthenticated, (req, res) => {
  res.render('contact');
});

app.get('/medical', checkAuthenticated, (req, res) => {
  res.render('medical', { user: req.user }); // If you have a logged-in user object
});


// POST route for handling blood donation and request submissions
app.post('/medical', async (req, res) => {
    try {
        const { name, address, phone, blood_group, action, message } = req.body;

        // Validate required fields
        if (!name || !address || !phone || !blood_group || !action) {
            return res.status(400).send('All required fields must be filled!');
        }

        // Create a new BloodRequest document
        const newRequest = new BloodRequest({
            name,
            address,
            phone,
            blood_group,
            action,
            message
        });

        // Save the document to the database
        await newRequest.save();

        // If the action is "request", find available donors
        if (action === 'request') {
            const availableDonors = await BloodRequest.find({
                blood_group: blood_group,
                action: 'donate'  // Only those who are donating blood
            });

            if (availableDonors.length > 0) {
                return res.json({
                    success: true,
                    message: 'Product request saved successfully!',
                    donors: availableDonors.map(donor => ({
                        name: donor.name,
                        phone: donor.phone,
                        message: donor.message || 'No additional message',
                        address: donor.address,
                    })),
                    bloodGroup: blood_group
                });
            } else {
                return res.json({
                    success: false,
                    message: 'No donors available for this blood type.',
                });
            }
        }

        // If action is "donate"
        return res.json({
            success: true,
            message: 'Thank you for donating blood!',
        });
    } catch (error) {
        console.error('Error saving request:', error);
        res.status(500).json({ success: false, message: 'Error saving request: ' + error.message });
    }
});



app.get('/light',(req,res)=>{
  res.render('light')
});

app.post('/light', async (req, res) => {
  try {
      const { fname,name, quantity, email, phone, action, message } = req.body;

      // Validate required fields
      if (fname||!name || !quantity || !email || !phone || !action) {
          return res.json({ success: false, message: 'All required fields must be filled!' });
      }

      // Create a new LightRequest document
      const newRequest = new LightRequest({
         fname,
          name,
          quantity,
          email,
          phone,
          action,
          message
      });

      // Save the document to the database
      await newRequest.save();

      // If action is "request", find available donors
      if (action === 'request') {
          // Find donors for the requested product
          const donors = await LightRequest.find({
              name: name,
              action: 'donate' // Only show those who are donating the same product
          });

          if (donors.length > 0) {
              return res.json({
                  success: true,
                  message: 'Product request saved successfully!',
                  donors: donors.map(donor => ({
                     fname:donor.fname,
                      name: donor.name,
                      quantity: donor.quantity,
                      email: donor.email,
                      phone: donor.phone
                  })),
                  product: name
              });
          } else {
              return res.json({
                  success: false,
                  message: 'No donors available for the requested product.'
              });
          }
      }

      // If action is "donate"
      return res.json({
          success: true,
          message: 'Product donation request saved successfully!'
      });
  } catch (error) {
      console.error('Error saving request:', error);
      res.status(500).json({ success: false, message: 'Error saving request: ' + error.message });
  }
});


app.get('/cloth',(req,res)=>{
  res.render('cloth')
})

app.post('/cloth', async (req, res) => {
  try {
      const { fname ,name, quantity, email, phone, action, message } = req.body;

      // Validate required fields
      if (!fname || !name || !quantity || !email || !phone || !action) {
          return res.json({ success: false, message: 'All required fields must be filled!' });
      }

      // Create a new LightRequest document
      const newRequest = new ClothRequest({
          fname,
          name,
          quantity,
          email,
          phone,
          action,
          message
      });

      // Save the document to the database
      await newRequest.save();

      // Handle "request" action (find available donors)
      if (action === 'request') {
          // Find donors for the requested product
          const donors = await ClothRequest.find({
              name: name,
              action: 'donate' // Only show those who are donating
          });

          if (donors.length > 0) {
              return res.json({
                  success: true,
                  message: 'Product request saved successfully!',
                  donors: donors.map(donor => ({
                      fname:donor.fname,
                      name: donor.name,
                      quantity: donor.quantity, // Include the quantity donated
                      email: donor.email,
                      phone: donor.phone
                  })),
                  product: name
              });
          } else {
              return res.json({
                  success: false,
                  message: 'No donors available for the requested product.'
              });
          }
      }

      // Handle "donate" action (acknowledge donation)
      return res.json({
          success: true,
          message: 'Product donation request saved successfully!'
      });
  } catch (error) {
      console.error('Error saving request:', error);
      res.status(500).json({ success: false, message: 'Error saving request: ' + error.message });
  }
});


app.get('/food',(req,res)=>{
  res.render('food')
});

app.post('/food', async (req, res) => {
  try {
      const {fname ,name, quantity, email, phone, action, message } = req.body;

      // Validate required fields
      if (!fname ||!name || !quantity || !email || !phone || !action) {
          return res.json({ success: false, message: 'All required fields must be filled!' });
      }

      // Save the request/donation to the database
      const newRequest = new FoodRequest({fname ,name, quantity, email, phone, action, message });
      await newRequest.save();

      // Handle "request" action
      if (action === 'request') {
          const donors = await FoodRequest.find({
              name,
              action: 'donate',
          });

          if (donors.length > 0) {
              // Send donor list to the client
              return res.json({
                  success: true,
                  message: 'Request saved successfully!',
                  donors: donors.map(donor => ({
                      fname:donor.fname,
                      name: donor.name,
                      quantity: donor.quantity,
                      email: donor.email,
                      phone: donor.phone,
                      message: donor.message || 'No additional message',
                  })),
              });
          } else {
              // No donors available
              return res.json({
                  success: false,
                  message: 'No donors available for this product.',
              });
          }
      }

      // Acknowledge the donation
      res.json({
          success: true,
          message: 'Thank you for donating!',
      });
  } catch (error) {
      console.error('Error handling food request:', error);
      res.status(500).json({
          success: false,
          message: 'Internal server error.',
      });
  }
});


// POST route to handle form submission




app.post('/contact', checkAuthenticated, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    await contactCollection.insertMany({ name, email, phone, message });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving contact data.");
  }
});



// Register POST route
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    // Check if passwords match
    if (password !== confirmpassword) {
      return res.send("Passwords do not match");
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

        // Check if the email already exists
        const existingUser = await Register.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).send("Email already registered");
        }

    // Create a new user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Don't save `confirmpassword`, only save the hashed password
    const registerEmployee = new Register({
      name: name,
      email: normalizedEmail,
      password: hashedPassword, // Store the hashed password
      role: 'user',
    });

    await registerEmployee.save();
    res.redirect('/login');
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(400).send("Registration failed.");
  }
});


app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

//Admin Routers

app.get('/admin/login', (req, res) => {
   res.render('admin/login')
});

app.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.CAMP_ADMIN_EMAIL && password === process.env.CAMP_ADMIN_PASSWORD) {
      req.session.isAdminAuthenticated = true;
      return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { message: 'Invalid email or password' });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).send('Internal server error');
  }
});


app.get('/admin/dashboard',isAdminAuthenticated,(req, res) => {
  res.render('admin/dashboard')
});

// Admin View All Users
// Admin View All Users Route
app.get('/admin/users', isAdminAuthenticated,async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Register.find();
    
    // Render the 'admin/users' view, passing the users data
    res.render('admin/users', { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

// Admin Delete User Route
app.get('/admin/delete/:id', async (req, res) => {
  try {
    // Delete the user with the given id
    await Register.findByIdAndDelete(req.params.id);
    
    // Redirect back to the users page
    res.redirect('/admin/users');
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

// Route to view all blood requests
// Route to view all blood requests
app.get('/admin/blood-requests',async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    // Fetch all blood requests from the database
    const bloodRequests = await BloodRequest.find({});
    res.render('admin/blood-requests', { bloodRequests });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error retrieving blood requests');
  }
});

// Approve Blood Request
app.get('/admin/approve-blood-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'approved'
    const bloodRequest = await BloodRequest.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

    if (!bloodRequest) {
      return res.status(404).send('Blood request not found');
    }

    res.redirect('/admin/blood-requests');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error approving blood request');
  }
});

// Reject Blood Request
app.get('/admin/reject-blood-request/:id', async (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'rejected'
    const bloodRequest = await BloodRequest.findByIdAndUpdate(requestId, { status: 'rejected' }, { new: true });

    if (!bloodRequest) {
      return res.status(404).send('Blood request not found');
    }

    res.redirect('/admin/blood-requests');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rejecting blood request');
  }
});

// Route to handle deleting a blood request
app.get('/admin/delete-blood-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;
    
    // Find the blood request by ID and delete it
    const bloodRequest = await BloodRequest.findByIdAndDelete(requestId);

    if (!bloodRequest) {
      return res.status(404).send('Blood request not found');
    }

    // Redirect back to the blood requests page
    res.redirect('/admin/blood-requests');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error deleting the blood request');
  }
});

app.get('/admin/cloth-bedd', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    // Fetch all blood requests from the database
    const clothRequests = await ClothRequest.find({});
    res.render('admin/cloth-bedd', { clothRequests });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error retrieving blood requests');
  }
});

app.get('/admin/approve-cloth-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'approved'
    const clothRequest = await ClothRequest.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

    if (!clothRequest) {
      return res.status(404).send('Blood request not found');
    }

    res.redirect('/admin/cloth-bedd');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error approving cloth request');
  }
});

// Reject Blood Request
app.get('/admin/reject-cloth-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'rejected'
    const clothRequest = await ClothRequest.findByIdAndUpdate(requestId, { status: 'rejected' }, { new: true });

    if (!clothRequest) {
      return res.status(404).send('Blood request not found');
    }

    res.redirect('/admin/cloth-bedd');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rejecting cloth request');
  }
});

app.get('/admin/food-req',async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    // Fetch all blood requests from the database
    const foodWaterreq = await FoodRequest.find({});
    res.render('admin/food-req', { foodWaterreq });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error retrieving cloth requests');
  }
});

app.get('/admin/approve-food-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'approved'
    const FoodRequest = await FoodRequest.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

    if (!FoodRequest) {
      return res.status(404).send('Food request not found');
    }

    res.redirect('/admin/food-req');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error approving Food request');
  }
});

app.get('/admin/reject-food-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'rejected'
    const FoodRequests = await FoodRequest.findByIdAndUpdate(requestId, { status: 'rejected' }, { new: true });

    if (!FoodRequests) {
      return res.status(404).send('Blood request not found');
    }

    res.redirect('/admin/food-req');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rejecting food request');
  }
});

app.get('/admin/light-req',async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    // Fetch all blood requests from the database
    const Lightrequests = await LightRequest.find({});
    res.render('admin/light-req', { Lightrequests });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error retrieving cloth requests');
  }
});

app.get('/admin/approve-light-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'approved'
    const Lightrequest = await LightRequest.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

    if (!Lightrequest) {
      return res.status(404).send('Light request not found');
    }

    res.redirect('/admin/light-req');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error approving Light request');
  }
});


app.get('/admin/reject-light-request/:id', async (req, res) => {
  if (!req.session.isAdminAuthenticated) {
    return res.redirect('/admin/login');
  }

  try {
    const requestId = req.params.id;

    // Find the blood request by ID and update its status to 'rejected'
    const FoodRequest = await FoodRequest.findByIdAndUpdate(requestId, { status: 'rejected' }, { new: true });

    if (!FoodRequest) {
      return res.status(404).send('Food request not found');
    }

    res.redirect('/admin/light-req');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rejecting food request');
  }
});

app.get('/admin/mainadmin/login',(req,res)=>{
  res.render('admin/mainadmin/login');
});

app.post('/admin/mainadmin/login',(req,res)=>{
    const {email,password} = req.body;
})


// Admin Logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send('Could not log out. Please try again.');
    }
    res.redirect('/admin/login'); // Redirect to login page after logout
  });
});



// Camp Manager Registration Route

// Camp Manager Login Route

app.get('/admin/mainadmin/dashboard',(req,res)=>{
    res.render('admin/mainadmin/dashboard')
})




// Camp Manager Dashboard Route
app.get('/admin/mainadmin/dashboard', checkCampManagerAuthenticated, (req, res) => {
  if (!req.session.campManager) {
    return res.redirect('/admin/mainadmin/login');
  }
  res.render('admin/camp-manager/dashboard');
});

// Check if camp manager is authenticated
function checkCampManagerAuthenticated(req, res, next) {
  if (req.session.campManager) {
    return next();
  }
  res.redirect('/admin/mainadmin/login');
}



// Middleware for route protection
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// Middleware to check if admin is authenticated
function isAdminAuthenticated(req, res, next) {
  if (req.session.isAdminAuthenticated) {
    return next(); // Proceed if authenticated
  }
  res.redirect('/admin/login'); // Redirect to login if not authenticated
}

module.exports = isAdminAuthenticated;


////////////////////////////////////////////////////////
// CAMP MANAGER///
 // Import the campManager model

// Camp Manager Login Routes


// Middleware to check if camp manager is authenticated

console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

const Port = process.env.PORT

app.listen(Port, () => {
  console.log('Server is running on Port 3000');
});
