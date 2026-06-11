import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

// Componentes locales
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import TablaProductos from "../components/productos/TablaProductos";
import TarjetaProductos from "../components/productos/TarjetasProductos";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import NotificacionOperacion from "../components/NotificacionOperaciones";

const Productos = () => {
    
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: "",
        categoria_producto: "",
        precio_venta: "",
        descripcion_producto: "",
        imagenes_productos: "",
        archivo: null,
    });
    const [productoEditar, setProductoEditar] = useState(null);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [archivoActualizar, setArchivoActualizar] = useState(null);

    const [cargando, setCargando] = useState(false);
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

    useEffect(() => {
        cargarCategorias();
        cargarProductos();
    }, []);

    // Lógica del filtro de búsqueda
    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setProductosFiltrados(productos);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();
            const filtrados = productos.filter((prod) => {
                const nombre = prod.nombre_producto?.toLowerCase() || "";
                const descripcion = prod.descripcion_producto?.toLowerCase() || "";
                const precio = prod.precio_venta?.toString() || "";
                return (
                    nombre.includes(textoLower) ||
                    descripcion.includes(textoLower) ||
                    precio.includes(textoLower)
                );
            });
            setProductosFiltrados(filtrados);
        }
    }, [textoBusqueda, productos]);

    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    const cargarProductos = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("productos")
                .select("*")
                .order("id_producto", { ascending: true });

            if (error) throw error;
            setProductos(data || []);
            setProductosFiltrados(data || []);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            mostrarToast("Error al cargar productos", "error");
        } finally {
            setCargando(false);
        }
    };

    const agregarProducto = async () => {
        try {
            if (
                !nuevoProducto.nombre_producto.trim() ||
                !nuevoProducto.categoria_producto ||
                !nuevoProducto.precio_venta ||
                !nuevoProducto.archivo
            ) {
                mostrarToast("Completa los campos obligatorios", "advertencia");
                return;
            }

            setMostrarModal(false);

            const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
            const { error: uploadError } = await supabase.storage
                .from("imagenes_productos")
                .upload(nombreArchivo, nuevoProducto.archivo);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("imagenes_productos")
                .getPublicUrl(nombreArchivo);

            const { error } = await supabase.from("productos").insert([
                {
                    nombre_producto: nuevoProducto.nombre_producto,
                    categoria_producto: parseInt(nuevoProducto.categoria_producto),
                    precio_venta: parseFloat(nuevoProducto.precio_venta),
                    descripcion_producto: nuevoProducto.descripcion_producto || null,
                    imagenes_productos: urlData.publicUrl,
                }
            ]);

            if (error) throw error;

            
            setNuevoProducto({
                nombre_producto: "",
                categoria_producto: "",
                precio_venta: "",
                descripcion_producto: "",
                imagenes_productos: "",
                archivo: null,
            });

            mostrarToast("Producto registrado correctamente", "exito");
            await cargarProductos(); // <-- Solucionado: Ahora sí actualiza la lista al crear
        } catch (err) {
            console.error("Error al agregar producto:", err);
            mostrarToast("Error al registrar producto", "error");
        }
    };

    const actualizarProducto = async () => {
        try {
            let imagenFinal = productoEditar.imagenes_productos;

            if (archivoActualizar) {
                const nombreArchivo = `${Date.now()}_${archivoActualizar.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("imagenes_productos")
                    .upload(nombreArchivo, archivoActualizar);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("imagenes_productos")
                    .getPublicUrl(nombreArchivo);

                imagenFinal = data.publicUrl;
            }

            const { error } = await supabase
                .from("productos")
                .update({
                    nombre_producto: productoEditar.nombre_producto,
                    precio_venta: parseFloat(productoEditar.precio_venta),
                    categoria_producto: parseInt(productoEditar.categoria_producto),
                    descripcion_producto: productoEditar.descripcion_producto,
                    imagenes_productos: imagenFinal,
                })
                .eq("id_producto", productoEditar.id_producto);

            if (error) throw error;

            setMostrarModalEdicion(false);
            await cargarProductos();
            mostrarToast("Producto actualizado correctamente", "exito");
        } catch (err) {
            console.error("Error al actualizar producto:", err);
            mostrarToast("Error al actualizar producto", "error");
        }
    };

    const eliminarProducto = async () => {
        if (!productoAEliminar) return;
        try {
            setMostrarModalEliminacion(false);

            if (productoAEliminar.imagenes_productos) {
                const nombreArchivo = productoAEliminar.imagenes_productos
                    .split("/")
                    .pop()
                    .split("?")[0];

                await supabase.storage
                    .from("imagenes_productos")
                    .remove([nombreArchivo])
                    .catch(() => { });
            }

            const { error } = await supabase
                .from("productos")
                .delete()
                .eq("id_producto", productoAEliminar.id_producto);

            if (error) throw error;

            await cargarProductos();
            mostrarToast("Producto eliminado correctamente", "exito");
        } catch (err) {
            console.error("Error al eliminar:", err);
            mostrarToast("Error al eliminar producto", "error");
        }
    };

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setNuevoProducto((prev) => ({ ...prev, archivo }));
        } else {
            alert("Selecciona una imagen válida (JPG, PNG, etc.)");
        }
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setProductoEditar((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioArchivoActualizar = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setArchivoActualizar(archivo);
        }
    };

    const abrirModalEdicion = (producto) => {
        setProductoEditar(producto);
        setArchivoActualizar(null);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (producto) => {
        setProductoAEliminar(producto);
        setMostrarModalEliminacion(true);
    };

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
    };

    return (
        <Container className="mt-3">
            {/* Cabecera principal */}
            <Row className="align-items-center mb-3">
                <Col className="d-flex align-items-center">
                    <h3 className="mb-0">
                        <i className="bi-bag-heart-fill me-2"></i> Productos
                    </h3>
                </Col>
                <Col xs={5} sm={5} md={5} lg={5} className="text-end">
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {/* Buscador */}
            <Row className="mb-4">
                <Col md={6} lg={5}>
                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, descripción o precio ..."
                    />
                </Col>
            </Row>

            {/* Zona de contenido principal */}
            {cargando ? (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p>Cargando productos...</p>
                </div>
            ) : productosFiltrados.length > 0 ? (
                <>
                    {/* Vista Escritorio */}
                    <div className="d-none d-md-block">
                        <TablaProductos
                            productos={productosFiltrados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </div>

                    {/* Vista Mobile */}
                    <div className="d-block d-md-none">
                        <TarjetaProductos
                            productos={productosFiltrados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </div>
                </>
            ) : (
                <Alert variant="info">No hay productos registrados.</Alert>
            )}

            {/* Capa de Modales y Notificaciones */}
            <ModalRegistroProducto
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevoProducto={nuevoProducto}
                manejoCambioInput={manejoCambioInput}
                manejoCambioArchivo={manejoCambioArchivo}
                agregarProducto={agregarProducto}
                categorias={categorias}
            />

            <ModalEdicionProducto
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                productoEditar={productoEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
                actualizarProducto={actualizarProducto}
                categorias={categorias}
            />

            <ModalEliminacionProducto
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarProducto={eliminarProducto}
                producto={productoAEliminar}
            />

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast((prev) => ({ ...prev, mostrar: false }))}
            />
        </Container>
    );
};

export default Productos;