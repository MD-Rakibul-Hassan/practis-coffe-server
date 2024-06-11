const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3py8lp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

        const database = client.db('coffe-store');
		const coffeCollection = database.collection('coffe')
		const userCollection = database.collection('user')

		app.post("/coffe", async (req, res) => {
			const coffe = req.body;
            const result = await coffeCollection.insertOne(coffe)
            res.send(result)
		});

		app.get('/', async (req, res) => {
			const allCoffes = coffeCollection.find();
			const result = await allCoffes.toArray()
			res.send(result)
		})

		app.get('/coffe/:id', async (req, res) => {
			const id = req.params.id;
			console.log(id)
			const quary = { _id: new ObjectId(id) }
			const result = await coffeCollection.findOne(quary)
			res.send(result)
		})

		app.put('/coffe/:id', async (req, res) => {
			const id = req.params.id;
			const newCoffe = req.body;
			const updatedDoc = {
				$set: {
					name: newCoffe.name,
					price: newCoffe.price,
					quentity: newCoffe.quen,
					photo:newCoffe.photo
				}
			}
			
			const filter = {_id : new ObjectId(id)}
			const options = { upsert: true };
			const result = await coffeCollection.updateOne(filter,updatedDoc,options)
			res.send(result);
		})

		app.delete('/coffe/:id', async (req, res) => {
			const id = req.params.id;
			const quiry = { _id: new ObjectId(id) };
			const result = await coffeCollection.deleteOne(quiry)
			res.send(result)
		})

		app.post('/user', async (req, res) => {
			const user = req.body;
			console.log(user)
			const result = await userCollection.insertOne(user)
			res.send(result)
		})

		app.get('/user', async (req, res) => {
			const findAllUser = userCollection.find()
			const result = await findAllUser.toArray()
			res.send(result)
		})

		app.delete('/user/:id', async (req, res) => {
			const id = req.params.id;
			const quary = { _id: new ObjectId(id) }
			const result = await userCollection.deleteOne(quary)
			res.send(result)
		})

		app.patch('/user', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updatedDoc = {
				$set: {
					lastSignInTime: user.lastLogAt
				},
			};
			const result = await userCollection.updateOne(filter, updatedDoc)
			res.send(result)
		})

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);



app.listen(port, () => console.log(`The server is running in port: ${port}`));
