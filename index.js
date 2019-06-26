const express = require('express');
const bodyParser = require('body-parser');
const ehp = require('express-handlebars')
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const fs = require('fs');
const del = require('del');
const multer = require('multer');
var config = JSON.parse(fs.readFileSync("config.json"));

app.engine('handlebars', ehp());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.static("public"));

var public = path.join(__dirname, '/public/');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, public + 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

var upload = multer({ storage: storage });

app.get('/',function(req,res){
     res.sendFile(public + '/index.html');
});

app.get('/contact', (req, res) => {
  res.render(public + '/contact.handlebars');
});

app.get('/apply', (req, res) => {
  res.render(public + '/apply.handlebars');
});

app.get('/schedule', (req, res) => {
  res.render(public + '/schedule.handlebars');
});

app.post('/send', (req, res) => {
  const output = `
    <h3>Contact Info</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone Number: ${req.body.phoneNumber}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.msg}</p>
  `;

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'gmpropertycontact@gmail.com', // generated ethereal user
            pass: config.password // generated ethereal password
        },
        tls:{
          rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Contact Form" <gmpropertycontact@gmail.com>', // sender address
        to: 'gmpropertyllc@gmail.com', // list of receivers
        subject: 'Contact  Form', // Subject line
        html: output // html body
    };
    res.render(public+'/contact.handlebars', {sentMSG:'Message has been sent'})
  });
});

app.post('/application', upload.single('fileSent'), (req, res) => {
  const output = `
    <h3>Contact Info</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone Number: ${req.body.phoneNumber}</li>
    </ul>
    <h3>Notes</h3>
    <p>${req.body.notes}</p>
  `;


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'gmpropertycontact@gmail.com', // generated ethereal user
            pass: config.password // generated ethereal password
        },
        tls:{
          rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Application Form" <gmpropertycontact@gmail.com>', // sender address
        to: 'gmpropertyllc@gmail.com', // list of receivers
        subject: 'Application  Form', // Subject line
        html: output,
        attachments:[{
          filename: 'application.pdf',
          encoding: 'base64',
          content: req.file
        }]
    };


    res.render(public+'/apply.handlebars', {sentMSG:'Application has been sent'})
  });
});

app.post('/scheduleSend', (req, res) => {
  const output = `
    <h3>Contact Info</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone Number: ${req.body.phoneNumber}</li>
    </ul>
    <h3>Notes</h3>
    <p>${req.body.note}</p>
  `;


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'gmpropertycontact@gmail.com', // generated ethereal user
            pass: config.password // generated ethereal password
        },
        tls:{
          rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Schedule Form" <gmpropertycontact@gmail.com>', // sender address
        to: 'gmpropertyllc@gmail.com', // list of receivers
        subject: 'Schedule  Form', // Subject line
        html: output,
    };

    res.render(public+'/schedule.handlebars', {scheduleSent:'Form has been sent'})
  });
});

app.listen(3000, () => console.log('Listening on port 3000'));
