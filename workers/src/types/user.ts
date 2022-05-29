export type User = {
    id: number,
    coordinates: Coordinates,
    city: string
}

export type Coordinates = {
    latitude: number,
    longitude: number,
}



export default User;