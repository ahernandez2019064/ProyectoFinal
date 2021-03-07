'use Strict'

var Categoria = require('../modelos/categoriaModel');

function agregarCategoria(req, res) {
    var params = req.body;
    var categorias = new Categoria();

    if(req.user.rol === 'ROL_ADMIN'){
        if(params.nombreCategoria && params.descripcion){
            categorias.nombreCategoria = params.nombreCategoria;
            categorias.descripcion = params.descripcion;
    
            Categoria.find({nombreCategoria: categorias.nombreCategoria}).exec((err, categoriaEncontrada)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la petición de agregar' });
                if(categoriaEncontrada && categoriaEncontrada.length >= 1){
                    return res.status(500).send({ mensaje: 'La categoria '+params.nombreCategoria+' ya existe' })
                }else{
                    categorias.save((err, categoriaGuardada)=>{
                        if(err) return res.status(500).send({ mensaje: 'Error al guardar la categoria' })
                        if(categoriaGuardada){
                            return res.status(200).send({ categoriaGuardada })
                        }else{
                            return res.status(500).send({ mensaje: 'No se ha podido agregar la categoría' })
                        }
                    })
                }
            })
        }
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para agregar una categoria' });
    }
}

function editarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body

    if(req.user.rol === 'ROL_ADMIN'){

        Categoria.findOneAndUpdate(idCategoria, params, {new: true}, (err, categoriaEditada)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de editar' });
            if(!categoriaEditada) return res.status(500).send({ mensaje: 'No se pudo editar la categoria' })

            return res.status(200).send({ categoriaEditada })
        })
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' });
    }
}

function eliminarCategoria(req, res) {

}

module.exports = {
    agregarCategoria,
    editarCategoria
}