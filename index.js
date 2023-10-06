const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware start
app.use(cors());
app.use(express.json());//body ar moddo teka data pauar jonno...
// middleware end


//MongoDb Start


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdalevr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


//Find {Document DB Data} start
const serviceCollection = client.db('carservices').collection('services')
// new collection 
const bookingCollection = client.db('carservices').collection('bookings')
//Find {Document DB Data} start
  //DB Data Read Start
    app.get('/services',async(req,res)=>{
    const cursor = serviceCollection.find();
    const result = await cursor.toArray();
    res.send(result)
})
//DB Data Read End

//Spacific A Data Read with {id} Start
app.get('/services/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    // DB Data r bitorar Jasob Data gula lagb ta options a patai dibo.....
    const options = {
      // Include only the `title` and `imdb` fields in the returned document
      projection: { price: 1, title: 1, service_id: 1,img:1 },
    };
    const result = await serviceCollection.findOne(query,options);
    res.send(result);
}) 
//Spacific Data Read with {id} End 

//booking Start
app.post('/bookings',async(req,res)=>{
 const booking =req.body;
 console.log(booking)
   const result = await bookingCollection.insertOne(booking);
   res.send(result)
});
//booking End
// DB BookingData pick
app.get('/bookings',async(req,res)=>{
  console.log(req.query.email);
  let query = {};
  if (req.query?.email)// req ar query ar bitora email ta ka kuja
  {
    query = {email:req.query.email}
  }
  const result = await bookingCollection.find(query).toArray();
  res.send(result);
})


//DB Booking Data Delete start
app.delete('/bookings/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bookingCollection.deleteOne(query);
  res.send(result);
})
//DB Booking Data Delete End


//DB Booking Data Update start
app.patch('/bookings/:id',async(req,res)=>{
  const id =req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updatedBooking = req.body;
  console.log(updatedBooking)
  const updateDoc = {
    $set: {
      status:updatedBooking.status
    },
  };
  const result = await bookingCollection.updateOne(filter,updateDoc)
  res.send(result);
})
//DB Booking Data Update End

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//MongoDb End


app.get('/',(req,res)=>{
 res.send('ai bata')
});




app.listen(port,()=>{
    console.log(`Ami kisu pari na ${port}`)
})
