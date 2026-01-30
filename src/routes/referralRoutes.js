const express = require("express");
const router = express.Router();

const { applyReferralCode, getMyReferral, generateReferralCode } = require("../controllers/referralController");


const auth = require("../middlewares/auth");

router.post("/apply", auth, applyReferralCode);
router.get("/me", auth, getMyReferral);


router.post("/generate", auth, generateReferralCode);


module.exports = router;
