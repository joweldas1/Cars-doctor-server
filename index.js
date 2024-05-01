require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express()
const port=process.env.PORT||6600;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mwwnz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

console.log(uri);



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("data coming")
})
app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})