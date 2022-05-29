export type Prayers = {
    [city : string] : {
        city: string,
        date: string,
        today: {
            [prayer: string]: string
        },
        tomorrow: {
            [prayer: string]: string
        }
    }

}