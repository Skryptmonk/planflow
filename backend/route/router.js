const express = require('express');
const router = express.Router();
const app = express()

const multer = require('multer');
const xlsx = require('xlsx');
const bodyParser = require('body-parser')
const routePlannerController = require('../controller/routePlannerController');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage });
  const uploads = multer().single('jsonFile');
router.get('/welcome',routePlannerController.welcome);
router.post('/getRoutePath',routePlannerController.getRoutePath);
router.post('/getRoutePathJson', uploads,routePlannerController.getRoutePathJson);
app.use(bodyParser.json());
module.exports = router;