import {MongoClient} from "mongodb"
import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import {schema} from "./schema.ts"
import {resolvers} from "./resolvers.ts"
import { RestaurantModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  throw new Error("You need a mongo url");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const db = mongoClient.db("Restaurantes");

const RestaurantsCollection = db.collection<RestaurantModel>("restaurante");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
});

const {url} = await startStandaloneServer(server,
  {context: async() => ({RestaurantsCollection}),}
);

console.info(`Server ready at ${url}`);
