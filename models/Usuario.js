import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true //Elimina blanks antes y despues del String
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,// crea 2 cols mas, una de creado y otra de actualizado
});

//Middleware de mongoose que ejecutara este codigo antes de que se guarde el registro. Por el this no usamos arrow function
usuarioSchema.pre("save", async function (next) {
    //Hasheo. Si el nuevo password no está modificado(hasheado) entonces lo hashea. Si ya está hasheado, entonces lo ignora
  if (!this.isModified("password")) {
    next(); //Te manda hacia el siguiente middleware
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password) //Compara string normal con uno hasheado
}

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario