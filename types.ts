import { OptionalId } from "mongodb";

export type RestaurantModel = OptionalId <{
    name: string,
    direction: string,
    city: string,
    phone: string,
}>;

//https://api.api-ninjas.com/v1/validatephone?number=+12065550100
export type APIPhone = {
    is_valid: boolean,
};


//https://api.api-ninjas.com/v1/worldtime?city=london
export type APITime = {
    datatime: string
}

//https://api.api-ninjas.com/v1/weather?city=london
export type APIWeather = {
    temp: string
}