import jwt from "jsonwebtoken";

const generarJWT = (id) => {
    //.sign metodo que nos permite generar un jwt
    //.sign(lo que va a colocar en el jwt, palabra secreta, obj con opciones)
    return jwt.sign( { id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

export default generarJWT;