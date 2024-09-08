const express = require('express')
const Razorpay = require('razorpay')
const crypto = require('crypto')

const router = new express.Router()

router.post('/orders',async(req,res)=>{
    
        const razorpay = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET
        })
        const options = {
            amount: req.body.amount,
            currency: "INR",
            receipt: "receipt1",
            payment_capture :1
        }
        try{
        const response = await razorpay.orders.create(options)
            res.status(200).json({data:order})
    }catch(err){
        console.log(err);
         res.status(500).json({message:'Internal Server Error'})

    }
})

router.get('/payment/:paymentId',async(req,res)=>{
    
})


// router.post('/verify',async(req,res)=>{
//     try{
//         const{
//             razorpay_order_id,razorpay_payment_id,razorpay_signature
//         } = req.body
//         const sign = razorpay_order_id + "|" + razorpay_payment_id
//         const expectedSign = crypto.createHmac("sha256",process.env.KEY_SECRET).update(sign.toString()).digest("hex")

//         if(razorpay_signature === expectedSign){
//             return res.status(200).json({message:"Payment verified successfully"})
//         }else{
//             return res.status(400).json({message: 'Invalid signature sent'})
//         }

//     }catch(err){
//         console.log(err);
//          res.status(500).json({message:'Internal Server Error'})
//     }
// })
module.exports = router