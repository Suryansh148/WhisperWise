const express = require('express');
const {registerUser, authUser, allUsers} = require("../controllers/userControllers");
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();
const {body} = require('express-validator');

router.route('/').post(([
    body("name","Enter a valid name").isLength({min : 4}),
    body("email","Enter a valid email").isEmail(),
    body("password", "Password length should be atleast 5 characters").isLength({ min : 5}),
]),registerUser).get(protect,allUsers);
router.post('/login',authUser);

module.exports = router;
