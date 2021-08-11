require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5500"
}))
app.use(express.static('public'));



const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
    [1, { priceInCent: 10000, name: "Learn React js" }],
    [2, { priceInCent: 20000, name: "Learn CSS" }]
])

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map((item) => {
                console.log("====tem ==", item);
                const storeItem = storeItems.get(item.id)
                console.log("====storeItem ==", storeItem);
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCent
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`,
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ erorr: e.message })
    }

})

app.listen(3000)

