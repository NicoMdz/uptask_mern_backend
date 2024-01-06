//Va al node modules, busca paquete express y lo asigna a la variable (Sintaxis Commonjs)
// const express = require("express");
//Sintaxis de Imports gracias al type module en package.json
import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();
app.use(express.json())

dotenv.config();

conectarDB();

//Configurar CORS
const whitelist = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function(origin,callback) {
        if (whitelist.includes(origin)) {
            //Puede consultar la API
            callback(null, true)
        } else {
            //No está permitido
            callback(new Error("Error de Cors"))
        }
    }
}

app.use(cors(corsOptions))

//Routing
//app.verbo("/endopoint",callback
// app.use("/", (req,res) => {
//     res.send("Hola Mundo")
// })
app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Socket.io
import { Server } from "socket.io"

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on("connection", (socket) => {
    console.log("Conectado a socket.io")
    
    //Definir los eventos de socket.io
    socket.on("abrir proyecto", (proyecto) => {
        socket.join(proyecto) //Cada que el usuario visite un proyecto, es como si entrara a un room diferente por proyecto  
    })
    
    socket.on("nueva tarea", (tarea) => {
        socket.to(tarea.proyecto).emit("tarea agregada", tarea)
    })

    socket.on("eliminar tarea", (tareaEliminada) => {
        const proyecto = tareaEliminada.proyecto
        socket.to(proyecto).emit("tarea eliminada", tareaEliminada)
    })

    socket.on("actualizar tarea", tareaActualizada => {
        const proyecto = tareaActualizada.proyecto._id
        socket.to(proyecto).emit("tarea actualizada", tareaActualizada)
    })

    socket.on("cambiar estado", tarea => {
        console.log(tarea)
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit("estado actualizado", tarea)
    })
})