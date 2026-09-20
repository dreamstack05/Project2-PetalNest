const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================= MongoDB =================
mongoose.connect("mongodb://127.0.0.1:27017/petalnest", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("MongoDB connected ✅"))
.catch(err=> console.log(err));

// ================= Order Schema =================
const orderSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    mobile: String,
    address: String,
    payment: String,
    items: Array,
    total: Number,
    status: String,
    time: String
});

const Order = mongoose.model("Order", orderSchema);

// ================= Place Order Route =================
app.post("/place-order", async (req,res)=>{
    try{
        let orderData = req.body;
        orderData.status = "Ordered";
        let order = new Order(orderData);
        await order.save();

        // ================= Send Email =================
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: "priyakavin2425@gmail.com",
                pass: "pqnw supr qmkg axgy" // app password
            }
        });

        let mailOptions = {
            from: "priyakavin2425@gmail.com",
            to: order.email,
            subject: "PetalNest - Order Placed Successfully 🪻",
            html: `<h2>Thanks for ordering from PetalNest 💌</h2>
                   <p>Order ID: ${order.id}</p>
                   <p>Total: ₹${order.total}</p>
                   <p>We will deliver your bouquet soon. Do order again!</p>`
        };

        transporter.sendMail(mailOptions, (err, info)=>{
            if(err) console.log("Email error:", err);
            else console.log("Email sent:", info.response);
        });

        res.json({success:true, msg:"Order placed"});
    }catch(err){
        console.log(err);
        res.json({success:false, msg:"Error placing order"});
    }
});

// ================= Server Start =================
app.listen(5000, ()=> console.log("Server running on port 5000"));