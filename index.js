const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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

//JWT Working Start
app.post('/jwt',(req,res)=>{
  const user = req.body;
  // console.log(user);
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h'}); 
  // console.log({token});
  res.send({token});
})

// verifyJWT function Start
const verifyJWT = (req,res,next)=>{
  console.log('hitting verify JWT')
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization
  if(!authorization){
   return res.status(401).send({error:true,message:'unauthorized access'})
  }
  const token = authorization.split(' ')[1]; //ai line ta hole token ar last ar {signature} part ta nisa .
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
    if(error){
      return res.status(403).send({error: true,message:'unauthorized access'})
    }
    req.decoded= decoded;
    next();
  })
}
// verifyJWT function End

//JWT Working End


//Find {Document DB Data} start
const serviceCollection = client.db('carservices').collection('services')
// new collection 
const bookingCollection = client.db('carservices').collection('bookings')
//Find {Document DB Data} start
  //DB Data Read Start
    app.get('/services',async(req,res)=>{
      //High to lower : lower to higher start : and check {price Numbering} Product
    const sort = req.query.sort;  
    const search = req.query.search;
    console.log(search);
    const query = {title: {$regex:search,$options:'i'}};
    // i dara casesensitive ta hota dai na..
        const options = {
      sort: { 
        "price": sort === 'asc' ? 1 : -1 
        // akna 1 dara higer and -1 dara lower bujanu hoisa...
      }
    };  

    const cursor = serviceCollection.find(query,options);
        //High to lower : lower to higher end...
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
app.get('/bookings',verifyJWT,async(req,res)=>{

  console.log(req.query.email);

  //jwt
    const decoded = req.decoded;
  console.log(decoded)
if(decoded.email !== req.query.email) // user email and Req Email Same Kina Ta check Korba
{
  return res.status(403).send({error:1,message:'forbidden access'})
}

//jwt end


  let query = {};
  if (req.query?.email)// req ar query ar bitora email ta ka kuja
  {
    query = {email:req.query.email}
  }
  const result = await bookingCollection.find(query).toArray();
  res.send(result);
})
// DB BookingData pick end

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
  // console.log(updatedBooking)
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
 res.send('Server is Canected')
});




app.listen(port,()=>{
    console.log(`Ami kisu pari na ${port}`)
})




