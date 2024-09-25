const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay")
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');



const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.post('/orders', async(req, res) => {
    const razorpay = new Razorpay({
        key_id: "rzp_test_YWob3NoKy2p5h6",
        key_secret: "nj2K7ZzB4urofNjyb81FbqMr"
    })

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: "receipt#1",
        payment_capture: 1
    }

    try {
        const response = await razorpay.orders.create(options)

        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

app.get("/payment/:paymentId", async(req, res) => {
    const {paymentId} = req.params;

    const razorpay = new Razorpay({
        key_id: "rzp_test_YWob3NoKy2p5h6",
        key_secret: "nj2K7ZzB4urofNjyb81FbqMr"
    })
    
    try {
        const payment = await razorpay.payments.fetch(paymentId)

        if (!payment){
            return res.status(500).json("Error at razorpay loading")
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch(error) {
        res.status(500).json("failed to fetch")
    }
})




app.post('/generate-pdf', async (req, res) => {
    const { paymentId } = req.body;
    const razorpay = new Razorpay({
        key_id: "rzp_test_YWob3NoKy2p5h6",
        key_secret: "nj2K7ZzB4urofNjyb81FbqMr"
    })
  
   
      // Fetch payment details from Razorpay
      try {
        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(paymentId);
    
        // Generate PDF in memory using PDFKit
        const doc = new PDFDocument();
        
        // Set response headers to indicate file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
    
        // Pipe the PDF directly to the response
        doc.pipe(res);
    
        // Add content to the PDF
        doc.fontSize(20).text('Payment Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Payment ID: ${payment.id}`);
        doc.text(`Order ID: ${payment.order_id}`);
        doc.text(`Amount: ₹${payment.amount / 100}`); // Razorpay stores amount in paise
        doc.text(`Status: ${payment.status}`);
        doc.text(`Method: ${payment.method}`);
        doc.text(`Email: ${payment.email}`);
        doc.text(`Contact: ${payment.contact}`);
    
        // Finalize the PDF and end the stream
        doc.end();
      } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).send('Error fetching payment details');
      }
    });
      
    

  app.listen(port, () => {
    console.log(`server is running on ${port}`);
})