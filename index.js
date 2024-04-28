const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000 // 1 hour
    }
}));


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://innovationx:innovationx@cluster0.mdiegzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in connecting to database'));
db.once('open', () => console.log("Connected to database"));


app.post("/signup", async (req, res) => {
    const { companyname, companycontact, companyemail, companypassword, companylocation } = req.body;

    const existingCompany = await db.collection('company').findOne({ companyemail: companyemail });
    if (existingCompany) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const data = {
        companyname,
        companycontact,
        companyemail,
        companypassword,
        companylocation
    };

    try {
        await db.collection('company').insertOne(data);
        console.log("Record Inserted Successfully");
        return res.redirect('/login');
    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).send("Error in signup");
    }
});

app.post("/postjob", async (req, res) => {
    const { position, cname, location, category, tags, min, max, desc, url, gmail, caddress, linkedin, number } = req.body;

    const data1 = {
        position,
        cname,
        location,
        category,
        tags,
        min,
        max,
        desc,
        url,
        gmail,
        caddress,
        linkedin,
        number
    };

    try {
        await db.collection('jobdetail').insertOne(data1);
        console.log("Record Inserted Successfully");
        res.send('<script>alert("Job posted successfully!"); window.location="/postjob";</script>');
    } catch (error) {
        console.error("Error in posting job:", error);
        return res.status(500).send("Error in posting job");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { companyemail, companypassword } = req.body;
        const company = await db.collection('company').findOne({ companyemail: companyemail });
        if (!company || company.companypassword !== companypassword) {
            return res.status(401).send('<script>alert("Invalid email or password!"); window.location="/login";</script>');
        }

        // Extract companyname from the retrieved company data
        const companyname = company.companyname;

        // Generate a JWT token with companyname
        const token = jwt.sign({ companyname: companyname }, 'your_secret_key', { expiresIn: '1h' });

        // Store the token in the session or as a cookie
        req.session.token = token;
        req.session.save();

        console.log("Session started for:", companyemail);
        return res.status(201).redirect('/postjob');
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Error in logging out");
        }
        console.log("Session ended");
        return res.redirect('/landing.html');
    });
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('/landing.html');
});

app.get("/login", (req, res) => {
    res.redirect("/login.html");
});

app.get("/postjob", validateAuthToken, (req, res) => {
            return res.redirect("/postjob.html");
});

app.get("/update", validateAuthToken, (req, res) => {
            return res.redirect("/update.html");
});

app.get("/signup", (req, res) => {
    res.redirect('/signup.html');
});

app.get("/homepage",(req, res) => {
    res.sendFile(__dirname + '/homepage.html');
});

app.get('/company-name', validateAuthToken, (req, res) => {
    if (req.session.company) {
      const companyname = req.session.company.companyname;
      res.json({ companyname });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  app.get('/jobs', async (req, res) => {
    try {
      const jobDetails = await db.collection('jobdetail').find({}).toArray();
      res.json(jobDetails);
    } catch (error) {
      console.error('Error fetching job details:', error);
      res.status(500).send('Error fetching job details');
    }
  });
// Server-side code
app.post("/update-email", validateAuthToken, async (req, res) => {
    try {
        const { currentEmail, newEmail, password } = req.body;
        const companyname = req.companyname; // Access companyname from the decoded token

        // Verify current email and password
        const company = await db.collection('company').findOne({ companyname: companyname, companyemail: currentEmail, companypassword: password });
        if (!company) {
            return res.status(400).json({ error: "Invalid current email or password." });
        }

        // Check if req.session.company exists and initialize if not
        if (!req.session.company) {
            req.session.company = {};
        }

        // Update the email address
        await db.collection('company').updateOne(
            { companyname: companyname },
            { $set: { companyemail: newEmail } }
        );

        // Set the companyemail property in req.session.company
        req.session.company.companyemail = newEmail;
        await req.session.save();

        return res.status(200).json({ message: "Email updated successfully." });
    } catch (error) {
        console.error("Error updating email:", error);
        return res.status(500).json({ error: "Error updating email." });
    }
});

function validateAuthToken(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        req.companyname = decoded.companyname;
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(401).send('Unauthorized');
    }
}

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
