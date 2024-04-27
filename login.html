const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 10000 // 10 seconds
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

function validateAuthToken(req, res, next) {
    if (!req.session.company) {
        return res.redirect('/login');
    }
    next();
}

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

        req.session.company = company;
        req.session.save();
        req.session.createdAt = new Date().getTime(); // Set session creation time
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
    if (req.session.company) {
        const currentTime = new Date().getTime();
        const sessionTime = req.session.createdAt || currentTime;
        const sessionDuration = 10000; // 10 seconds in milliseconds

        if (currentTime - sessionTime > sessionDuration) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).send("Error destroying session");
                }
                console.log("Session automatically ended after 10 seconds");
                return res.redirect('/login'); // Redirect to login page after session is destroyed
            });
        } else {
            req.session.createdAt = currentTime; // Update session creation time
            return res.redirect("/postjob.html");
        }
    } else {
        return res.redirect('/login');
    }
});


app.get("/signup", (req, res) => {
    res.redirect('/signup.html');
});

app.get("/homepage",(req, res) => {
    res.sendFile(__dirname + '/homepage.html');
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
