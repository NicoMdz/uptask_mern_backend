import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req,res) => {
    //-- MEDIDAS DE SEGURIDAD --
    const { proyecto } = req.body

    if (proyecto.length !== 24) {
        const error = new Error("No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    const existeProyecto = await Proyecto.findById(proyecto)

    if (!existeProyecto) {
        const error = new Error("El Proyecto no existe")
        return res.status(404).json({msg: error.message})
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para añadir tareas")
        return res.status(404).json({msg: error.message})
    }
    //-- ACCION --
    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        //Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

};

const obtenerTarea = async (req,res) => {
    //-- MEDIDAS DE SEGURIDAD --
    const { id } = req.params

    if (id.length !== 24) {
        const error = new Error("Tarea No Existente");
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto") //populate añade dentro de la consulta de la tarea la info del Proyecto al que pertenece

    if (!tarea) {
        const error = new Error("Tarea No Encontrada")
        return res.status(404).json({msg: error.message})   
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})        
    }
    //-- ACCION --
    res.json(tarea)
};

const actualizarTarea = async (req,res) => {
    //-- MEDIDAS DE SEGURIDAD --
    const { id } = req.params

    if (id.length !== 24) {
        const error = new Error("Tarea No Existente");
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto") //populate añade dentro de la consulta de la tarea la info del Proyecto al que pertenece

    if (!tarea) {
        const error = new Error("Tarea No Encontrada")
        return res.status(404).json({msg: error.message})   
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})        
    }
    //-- ACCIÓN -- 
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console(error)
    }
};

const eliminarTarea = async (req,res) => {
    //-- MEDIDAS DE SEGURIDAD --
    const { id } = req.params

    if (id.length !== 24) {
        const error = new Error("Tarea No Existente");
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto") 

    if (!tarea) {
        const error = new Error("Tarea No Encontrada")
        return res.status(404).json({msg: error.message})   
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})        
    }
    //-- ACCIÓN --
    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({msg: "Tarea Eliminada"})
    } catch (error) {
        console.log(error)
    }
};

const cambiarEstado = async (req,res) => {
    const { id } = req.params

    if (id.length !== 24) {
        const error = new Error("Tarea No Existente");
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate("proyecto") 

    if (!tarea) {
        const error = new Error("Tarea No Encontrada")
        return res.status(404).json({msg: error.message})   
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})        
    }
    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id)
        .populate("proyecto")
        .populate("completado")
    res.json(tareaAlmacenada)
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}


