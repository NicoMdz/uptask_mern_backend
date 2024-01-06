import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarid.js";
import generarJWT from "../helpers/generarjwt.js";
import { emailRegistro,emailOlvidePassword } from "../helpers/emails.js";

const registrar = async (req,res) => {
    //Req.body es todo lo que pasamos en raw body en postman
    //console.log(req.body)

    //Evitar Registros Duplicados (Msj)
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({email}); //findOne encuentra el primero que coincida con email de req boy, en este caso.Devuelve true si encuentra y null si no

    if(existeUsuario) {
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg:error.message})
    }
    //Registra Usuario (Si no hay nada en bloque anterior)
    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()

        //Enviar email de confirmación
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Usuario Creado Correctamente, revisa tu email para confirmar tu cuenta"})
    } catch (error) {
        console.log(error)
    }
};

const autenticar = async (req,res) => {

    const { email, password } = req.body;

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email})
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }
    
    //Si ya existe, Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message})
    }

    //Comprobar  su password
    if (await usuario.comprobarPassword(password)) {
        res.json({ //Nurestro propio objeto al hacer el login
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error("El Password es Incorrecto");
        return res.status(403).json({msg: error.message})
    }
};

const confirmar = async (req,res) => {
    //Así como req.body es lo que mandamos o llegue por medio de req > body > json
    //req.params hace referencia a la url, en este caso a lo que coloques como nombre de routing dinamico (token) y crea una variable 
    // console.log(req.params.token) 
    const { token } = req.params
    //Busca un usuario con ese token.
    const usuarioConfirmar = await Usuario.findOne({token})
    //Si no Existe
    if (!usuarioConfirmar) {
        const error = new Error("Token no válido");
        return res.status(403).json({msg: error.message})
    }
    //Si existe
    try {
        usuarioConfirmar.confirmado = true //Cambiamos confirmado a true
        usuarioConfirmar.token = "" //Eliminamos token pq es de 1 solo uso
        await usuarioConfirmar.save() //Actualizamos en BD
        res.json({msg: "Usuario Confirmado Correctamente"})
        console.log(usuarioConfirmar)
    } catch (error) {
        console.log(error)
    }

    console.log(usuarioConfirmar)
}

const olvidePassword = async (req,res) => {
    
    const { email } = req.body;
    const usuario = await Usuario.findOne({email})
    if (!usuario) {
        const error = new Error("No existe cuenta vinculada a este correo")
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId()
        await usuario.save()

        //Enviar el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Hemos enviado un email con las instrucciones"})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req,res) => {
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({token})

    if (tokenValido) {
        res.json({msg: "Token válido, el usuario exsite"})
    } else {
        const error = new Error("Token no válido");
        return res.status(403).json({msg: error.message})
    }
}


const nuevoPassword = async (req,res) => {
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({token})

    if (usuario) {
        usuario.password = password
        usuario.token = ""
        try {
            await usuario.save()
            res.json({msg: "Password Modificado Correctamente"}) 
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error("Token no válido");
        return res.status(403).json({msg: error.message})
    }
}

const perfil = async (req,res) => {
    const { usuario } = req

    res.json(usuario)
}

export { registrar,autenticar,confirmar,olvidePassword,comprobarToken, nuevoPassword,perfil }























//Explicación
// const usuarios =  (req, res) => {
//     res.json({msg: "Desde API/USUARIOS"});
// };

// const crearUsuario =  (req, res) => {
//     res.json({msg: "Creando usuario"});
// };


// export { usuarios, crearUsuario };