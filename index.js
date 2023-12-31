const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const User = require('./models/userModel');
const Log = require('./models/logModel');

const mongodb = require('mongodb');
const mongoose = require('mongoose');
let db;

const dateFormat = (date) => {
  return date.toISOString().split('T')[0]
}

mongoose.connect(process.env.MONGO_URI).then(() => {
  db = mongoose.connection.db;
  return mongoose.connection.db.admin().listDatabases();
}).then((databases) => {
  console.log("List of databases", databases.databases);
}).catch((err) => {
  console.error(err);
})

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.ip} - ${req.method} ${req.path}`);
  next();
}, bodyParser.urlencoded({extended: false}))

app.post('/api/users', (req, res) => {
  try {
    // console.log(req.body);
    const username = req.body.username;
    const newUser = new User({
      username,
      _id: new mongodb.ObjectId()
    });
    const newLog = new Log({
      username,
      _id: newUser._id,
      log: [],
      count: 0
    });
    newUser.save();
    newLog.save();
    res.status(200).json(newUser);
  } catch(err) {
    console.error("Something went wrong", err);
    res.status(400).json({error: err.message()})
  }
})

app.get('/api/users', (req, res) => {
  try {
    User.find().then((data) => {
      res.status(200).send(data);
    })
  } catch(err) {
    console.error("Something went wrong", err);
    res.status(400).json({error: err.message()});
  }
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const duration = parseInt(req.body.duration), description = req.body.description;
  let date = new Date();
  if(req.body.date) 
    date = new Date(req.body.date);
  const dateString = date.toDateString();
  Log.findOne({_id}).then(data => {
    data.log.push({
      duration,
      date: dateFormat(date),
      description,
    });
    data.count++;
    data.save();
    res.status(200).json({
      _id,
      username: data.username,
      date: dateString,
      duration,
      description
    });
  }).catch(err => {
    console.error(err);
    res.status(400).json({error: err});
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const parsedQuery = req.query;
  console.log("Parsed query: ", parsedQuery);
  Log.findById(_id).then(data => {
    if(parsedQuery.from || parsedQuery.to || parsedQuery.limit) {
      const from = parsedQuery.from, 
      to = parsedQuery.to, limit = parsedQuery.limit;
      let dataToSend = {}
      if(from){
        data.log = data.log.filter((log) => (from <= log.date));
        dataToSend.from = new Date(from).toDateString();
      } 
      if(to) {
        data.log = data.log.filter((log) => (log.date <= to));
        dataToSend['to'] = new Date(to).toDateString();
      }
      if(limit) {
        data.log = data.log.slice(0, limit);
      }
      data.log.forEach(log => {
        log.date = new Date(log.date).toDateString();
      });
      dataToSend['count'] = data.log.length;
      dataToSend = {
        _id,
        username: data.username,
        log: data.log,
        ...dataToSend
      }
      console.log(dataToSend);
      res.status(200).json(dataToSend);
    } else {
      data.log.forEach(log => {
        log.date = new Date(log.date).toDateString();
      });
      res.status(200).json(data);
    }
  }).catch(err => {
    res.status(400).json({error: err});
    console.error(err);
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
