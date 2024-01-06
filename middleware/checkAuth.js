import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

const checkAuth = async (req,res,next) => { //En req.headers es donde usualmente vamos a pasar los jwt ya que se pasan primero
   
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET) //La misma variable de entorno que se usó para firmarlo se usa para verificarlo
            // console.log(decoded) devuelve el id del usuario al que corresponde
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v")

            // console.log(req.usuario)
            return next()
        } catch (error) {
            return res.status(404).json({msg: "Hubo un error"})
        }
    }
    //En caso de que no se mande un token
    if (!token) {
        const error = new Error("Token no válido")
        return res.status(401).json({msg: error.message})
    }
    next()
}

export default checkAuth