import { Collection, ObjectId } from "mongodb";
import { APIPhone, APITime, APIWeather, RestaurantModel } from "./types.ts";
import { GraphQLError } from "graphql";

type Context = {
  RestaurantsCollection : Collection<RestaurantModel>,
};

type GetRestaurantQueryArgs = {
  id: string
};

type GetRestaurantsQueryArgs = {
  city: string
}

type DeleteRestaurantMutationArgs = {
  id: string
}

type AddRestaurantMutationArgs = {
  name: string,
  direction: string,
  city: string,
  phone: string  
}

export const resolvers = {

  
  Query: {
    getRestaurant: async (
      _: unknown,
      args: GetRestaurantQueryArgs,
      ctx: Context
    ) : Promise<RestaurantModel | null> =>{
      return await ctx.RestaurantsCollection.findOne({_id: new ObjectId(args.id),});
    },

    getRestaurants: async (
      _: unknown,
      args: GetRestaurantsQueryArgs,
      ctx: Context
    ): Promise<RestaurantModel[]> => {
      return await ctx.RestaurantsCollection.find({city:args.city}).toArray();
    },
  },

  Mutation: {

    deleteRestaurant: async(
      _:unknown,
      args: DeleteRestaurantMutationArgs,
      ctx: Context
    ) : Promise<boolean> => {
      const {deletedCount} = await ctx.RestaurantsCollection.deleteOne({_id: new ObjectId(args.id)});
      return deletedCount === 1;
    },

    addRestaurant: async( 
      _: unknown,
      args: AddRestaurantMutationArgs,
      ctx:Context
    ): Promise<RestaurantModel> => {
      const API_KEY = Deno.env.get("API_KEY");
      if(!API_KEY) throw new GraphQLError("You need a ApiKey Ninja");

      const {name, direction,city, phone} = args; 
      if(!name || !direction || !city || !phone) throw new GraphQLError("Faltan campos necesarios");

      const phoneExists = await ctx.RestaurantsCollection.countDocuments({phone});
      if(phoneExists > 0) throw new GraphQLError("El telefono ya esta registrado");

      const url = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;
      const data = await fetch(url,
        {headers:{"X-Api-Key": API_KEY} } 
      );
      if(data.status !== 200) throw new GraphQLError("Api Ninja Error");
      
      const response: APIPhone = await data.json();
      if(!response.is_valid) throw new GraphQLError("El formato del telefono no es valido");

      const {insertedId} = await ctx.RestaurantsCollection.insertOne({
        name,
        phone,
        city,
        direction,
      });

      return {
        _id: insertedId,
        name,
        direction,
        city,
        phone,
      }

    }

  },

  Restaurant: {
    id: (parent: RestaurantModel): string => parent._id!.toString(),

    time:async (parent:APIPhone): Promise<string> =>{
      const API_KEY = Deno.env.get("API_KEY");
      if(!API_KEY) throw new GraphQLError("You need a ApiKey Ninja");
      const timezone = parent.timezones[0];
      const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${timezone}`;
      
      const data = await fetch(url,
        {headers:{"X-Api-Key": API_KEY} } 
      );

      const response: APITime = await data.json();
      console.log(response);
      if(data.status !== 200) throw new GraphQLError("Api Ninja Error");
      
      
      return response.datatime;
    },

    temperature: async(parent:RestaurantModel): Promise<string> =>{
      const API_KEY = Deno.env.get("API_KEY");
      if(!API_KEY) throw new GraphQLError("You need a ApiKey Ninja");
      const city = parent.city;
      const url = `https://api.api-ninjas.com/v1/weather?city=${city}`;
      const data = await fetch(url,
        {headers:{"X-Api-Key": API_KEY} } 
      );
      if(data.status !== 200) throw new GraphQLError("Api Ninja Error");
      
      const response: APIWeather = await data.json();

      return response.temp;

    }

  }
  
}