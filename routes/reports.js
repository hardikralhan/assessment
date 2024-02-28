const express = require("express")
const {getTransactions} = require('../services/reportServices')
const router = express.Router()
const {validateAPIKey} = require("../middlewares/auth")

router.get("/report",validateAPIKey, async(req,res)=>{
    try {
        let transactions = await getTransactions()
        return res.status(200).json({result: transactions})
    } catch (error) {
        console.log(error);
    }
})

module.exports = router