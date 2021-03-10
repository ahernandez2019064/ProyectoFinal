'use Strict'

var Categoria = require('../modelos/categoriaModel');
var Producto = require('../modelos/productoModel');

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

function listarCategorias(req, res) {
    if(req.user.rol === 'ROL_ADMIN'){
        Categoria.find((err, categoriasEncontradas)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
            if(!categoriasEncontradas) return res.status(500).send({ mensaje: 'No se ha podido encontrar la categorias' })

            return res.status(200).send({ categoriasEncontradas });
        })
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' })
    }
    
}

function listarCategoriasClientes(req, res) {
    if(req.user.rol === 'ROL_CLIENTE'){
        Categoria.find((err, categoriasEncontradas)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
            if(!categoriasEncontradas) return res.status(500).send({ mensaje: 'No se ha podido encontrar la categorias' })

            return res.status(200).send({ categoriasEncontradas });
        })
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' })
    }
    
}

function categoriaDefault(req, res) {
    var nombreCategoria = 'Default';
    var categorias = new Categoria();

    categorias.nombreCategoria = nombreCategoria;

    Categoria.find({nombreCategoria: categorias.nombreCategoria}).exec((err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la petición de agregar' });
        if(categoriaEncontrada && categoriaEncontrada.length >= 1){
            console.log('La categoria Default ya existe' )
        }else{
            categorias.save((err, categoriaGuardada)=>{
                if(err) console.log('Error al guardar la categoria')
                if(categoriaGuardada){
                    console.log({ categoriaGuardada })
                }else{
                    console.log('No se ha podido agregar la categoría')
                }
            })
        }
    })
    
}

function eliminarCategoria(req, res) {
    if(req.user.rol === 'ROL_ADMIN'){
        categoriaDefault();
        var idCategoria = req.params.id;

        Categoria.findOne({nombreCategoria: "Default"}, (err, defaultEncontrado)=>{
            Categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminada)=>{
                if(err) return res.status(500).send({ mensaje: 'Error al eliminar la categoria' });
                Producto.find({ categoria: idCategoria }).exec((err, productoEncontrado)=>{
                    productoEncontrado.forEach((nuevaCategoria)=>{
                        Producto.findByIdAndUpdate(nuevaCategoria._id, {categoria: defaultEncontrado}, (err, trasladar)=>{
                            return res.status(200).send({ categoriaEliminada });
                        })
                    })
                })
            })
        })

    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' })
    }

}



module.exports = {
    agregarCategoria,
    editarCategoria,
    listarCategorias,
    eliminarCategoria,
    listarCategoriasClientes
}