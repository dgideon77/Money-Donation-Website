const express = require("express");
const app = express();
var passwordHash=require("password-hash");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static("public"));

app.set("view engine", "ejs");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Filter } = require("firebase-admin/firestore");

var serviceAccount = require("./keey.json");

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(firebaseApp);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/" + "main.html");
});


app.post("/signupsubmit",function(req, res) {
  console.log(req.body);

  db.collection("data")
  .where(
    Filter.or(
    Filter.where("email","==",req.body.email),
    Filter.where("password","==",req.body.password)
    )
  )
  .get()
  .then((docs) => {
    if(docs.size > 0){
      res.send("account already exist with email");
    }
       else{
          db.collection("users")
          .add({
            username: req.body.username,
            email: req.body.email,
            password: passwordHash.generate(req.body.password),
          })
          .then(() => {
            res.sendFile(__dirname + "/public/" + "account.html");
          })
          .catch(() => {
            res.send("something went wrong");
          });
        }
  });
});


app.post("/loginsubmit",function(req, res) {
    db.collection("users")
    .where("username","==",req.body.username)
    .get()
    .then((docs) => {
        let verified = false;
        docs.forEach(doc => {
        verified = passwordHash.verify(req.body.password,doc.data().password);
        console.log(doc.id, '=>', doc.data());
      });
     if(verified){
      res.sendFile(__dirname + "/public/" + "donation.html");
     }
     else{
      res.send("fail");
     }
    });
});


app.post("/payment",function(req, res) {
  console.log(req.body);

  db.collection("Payment Details")
  .add({
    name: req.body.name,
    number: req.body.number,
    email: req.body.email,
    amount: req.body.amount,
  })
  .then(() => {
    res.sendFile(__dirname + "/public/" + "payment.html");
  })
});



app.post("/contact",function(req, res) {
  console.log(req.body);

  db.collection("feedback")
  .add({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  })
  .then(() => {
    res.sendFile(__dirname + "/public/" + "main.html");
  })
});


app.post("/card",function(req, res) {
  console.log(req.body);

  db.collection("hello")
  .add({
    card: req.body.card,
    expiry: req.body.expiry,
    cvv: req.body.cvv,
  })
  .then(() => {
    res.sendFile(__dirname + "/views/" + "index.html");
  })
});
app.listen(1909, () => {
  console.log('Server is running on port 1909');
});

