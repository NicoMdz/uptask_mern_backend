import express from "express";
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

//Autenticación, Registro y Confirmación de Usuarios
router.post("/", registrar)
router.post("/login", autenticar)
router.get("/confirmar/:token", confirmar) //:token para routing dinámico
router.post("/olvide-password", olvidePassword)
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)
//^^Misma ruta, distintos verbos. Para la ruta tal, si el verbo es get --> fct, si es post --> nuevoPassword
router.get("/perfil", checkAuth, perfil)














{//Explicación
// Solo la "/" se refiere a la misma url definida en index ("api/usuarios")
// router.get("/", usuarios) 
// router.post("/", crearUsuario) 

// router.get("/confirmar", (req, res) => {
//     res.json({msg: "CONFIRMANDO USUARIO"})
// }) // router.post("/", (req, res) => {
//     res.send("Desde - POST API/USUARIOS")
// }) // router.put("/", (req, res) => {
//     res.send("Desde - PUT API/USUARIOS")
// }) // router.delete("/", (req, res) => {
//     res.send("Desde - DELETE API/USUARIOS")
// }) 
}

export default router;