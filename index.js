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

    db.collection('company').insertOne(data, (err, collection) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error in signup");
        }
        console.log("Record Inserted Successfully");
        return res.redirect('/login');
    });
});

app.post("/login", async (req, res) => {
    try {
        const { companyemail, companypassword } = req.body;

        const company = await db.collection('company').findOne({ companyemail: companyemail });
        if (!company || company.companypassword !== companypassword) {
            return res.status(401).send('Invalid email or password');
        }

        req.session.company = company;
        console.log("Session started for:", companyemail);
        return res.status(201).redirect('/postjob');
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
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

app.get("/postjob", (req, res) => {
    res.redirect("/postjob.html");
});

app.get("/signup", (req, res) => {
    res.redirect('/signup.html');
});

app.get("/homepage", validateAuthToken, (req, res) => {
    res.sendFile(__dirname + '/homepage.html');
});


app.use((req, res, next) => {
    if (!req.session.company) {
        console.log("Session ended");
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
            }
        });
    }
    next();
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});