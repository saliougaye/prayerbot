const userHelper = () => {

    const createUser = (userId, coordinates, city) => {

        return {
            id: userId,
            coordinates: coordinates,
            city: city
        }
    }

    return {
        createUser
    }
}


module.exports = userHelper();