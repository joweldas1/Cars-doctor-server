require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// app.use(cors({
//   origin:['http://localhost:5174'],
//   credentials:true
// }))
app.use(
  cors({
    origin: ["http://localhost:5173", "https://cars-doctor-511a6.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mwwnz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb://localhost:27017`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middle wire
const logger = async (req, res, next) => {
  console.log(req.host, req.originalURL);
  next();
};

// const verifyToken = async (req,res,next)=>{
// const token = req.cookies?.token
// console.log(" Token", token);

// if(!token){res.status(401).send({message:"Authorization fail"})}

// jwt.verify(token,process.env.ACCESS_TOKEN_SECREATE,(err,decoded)=>{
//   if(err){
//     console.log(err);
//     return res.status(401).send({message:'unauthorized'})
//   }
//   console.log('value',decoded);
// })
// next()

// }

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECREATE, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    const services = client.db("CarsDoctor").collection("services");
    const bookingCollection = client.db("CarsDoctor").collection("booking");

    //auth related api

    // app.post('/jwt', async(req,res)=>{
    //   const user = req.body;
    //   const result = jwt.sign(user,process.env.ACCESS_TOKEN_SECREATE,{ expiresIn:"1h" })

    //   res
    //   .cookie('token',result,{
    //     httpOnly:true,
    //     secure:false,
    //     sameSite:"none"
    //   })
    //   .send(result)
    // })

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const result = jwt.sign(user, process.env.ACCESS_TOKEN_SECREATE, {
        expiresIn: "1h",
      });
      console.log(result);
      res
        .cookie("token", result, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send(result);
    });

    //get operation-----------------------------------------
    app.get("/services", async (req, res) => {
      console.log("token", req.cookies.token);
      const cursor = services.find();
      const data = await cursor.toArray();
      res.send(data);
    });

    app.get(`/services/:id`, async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const options = { title: 1, price: 1, service_id: 1, img: 1 };
      const data = await services.findOne(query, options);
      res.send(data);
    });

    //post operation to take data from client and same data get operation to get data from server to client  and delete  and update------------------------
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const data = await bookingCollection.insertOne(booking);
      res.send(data);
    });

    app.get("/booking", verifyToken, async (req, res) => {
      console.log("hello");
      console.log("token", req.cookies.token);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/booking/:id", async (req, res) => {
      const id = { _id: new ObjectId(req.params.id) };
      const result = await bookingCollection.deleteOne(id);
      res.send(result);
    });

    app.patch("/booking/:id", async (req, res) => {
      const id = { _id: new ObjectId(req.params.id) };
      const data = req.body;
      const updateDoc = {
        $set: {
          status: data.status,
        },
      };

      const result = await bookingCollection.updateOne(id, updateDoc);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("data coming");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
