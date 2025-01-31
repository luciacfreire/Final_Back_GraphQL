export const schema = `#graphql
  type Restaurant {
    id:ID!
    name: String!
    direction: String!
    city: String!
    phone: String!
    time: String!
    temperature:String!
  }

  type Query {
    getRestaurant(id:ID!):Restaurant
    getRestaurants(city:String!):[Restaurant!]!
  }

  type Mutation {
    addRestaurant(name:String!,direction:String!,city:String!,phone:String!):Restaurant!
    deleteRestaurant(id:ID!):Boolean!
  }
`