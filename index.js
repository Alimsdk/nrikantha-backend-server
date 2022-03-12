const express=require('express');
const app=express();
const cors=require('cors');
require('dotenv').config()
const port=process.env.PORT || 8080;
const { MongoClient, ServerApiVersion } = require('mongodb');
const fileUpload=require('express-fileupload');

// nrikanthaAdmin
// WKiPKO9BXdLpBtmB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofdnr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.use(cors())
app.use(express.json())
app.use(fileUpload());

async function run() {
  try {
    await client.connect();
    const database = client.db("nrikantha");
    const featureCollection = database.collection("feature_products");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const paymentCollection = database.collection("order_payment");
    const usersCollection=database.collection("users");
    const imageCollection=database.collection("images");

    app.get('/products',async(req,res)=>{
        const cursor=productsCollection.find({});
        const result=await cursor.toArray();
        res.send(result);
    })

    
    app.get('/products/:id',async(req,res)=>{
      const keys=req.params.id;
      const productKey=keys.toString();
      
      const query={key:productKey}
        const cursor=await productsCollection.findOne(query);
       res.send(cursor);
  })

    app.get('/feature',async(req,res)=>{
        const cursor=featureCollection.find({});
        const result=await cursor.toArray();
        res.send(result);
    })




    app.post('/orders',async(req,res)=>{
        const order= req.body;
        const result=await ordersCollection.insertOne(order);
        res.json(result)
    })

    app.post('/orderconfirm',async(req,res)=>{
        const order= req.body;
        const result=await paymentCollection.insertOne(order);
        res.json(result)
    })

    app.get('/orderconfirm',async(req,res)=>{
      const email=req.query.email;
      console.log(email);
      const query={orderUserEmail:email};
      const cursor=paymentCollection.find(query);
      const result=await cursor.toArray();
      res.json(result);
    })

    app.post('/users',async(req,res)=>{
      const user=req.body;
      const result=await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

   app.get('/users/:email',async(req,res)=>{
     const email=req.params.email;
     const query={email:email};
     const user=await usersCollection.findOne(query);
     let isAdmin=false;
     if(user?.role==='admin'){
       isAdmin=true;
     }
     res.json({admin:isAdmin});
   });

   app.get('/all_orders',async(req,res)=>{
    const cursor=ordersCollection.find({});
    const result=await cursor.toArray();
    res.send(result);
   })

   app.get('/paid_orders',async(req,res)=>{
    const cursor=paymentCollection.find({});
    const result=await cursor.toArray();
    res.send(result);
   })

   app.post('/images',async(req,res)=>{
     const info=req.body;
      const pic=req.files.image;
      const picData=pic.data;
      const encodedPic=picData.toString('base64');
      const imageBuffer=Buffer.from(encodedPic,'base64');
      const image={image:imageBuffer,info}
      const result=await imageCollection.insertOne(image);
      
      res.json(result);
   })

   app.get('/images',async(req,res)=>{
    const cursor=imageCollection.find({});
    const result=await cursor.toArray();
    res.json(result);
   })


    
    
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send("Hey I am working on Nrikantha");
})



app.listen(port,()=>{
    console.log(`listening to port , ${port}`);
})