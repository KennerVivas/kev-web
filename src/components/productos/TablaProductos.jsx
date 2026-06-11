import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ImagenTabla = ({ src }) => {
  if (src) {
    return (
      <Image
        src={src}
        width="50"
        height="50"
        rounded
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <i className="bi bi-image fs-3 text-muted"></i>;
};

const FilaProducto = ({ producto, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <tr>
      <td>{producto.id_producto}</td>

      <td>
        <ImagenTabla src={producto.imagenes_productos} />
      </td>

      <td>{producto.nombre_producto}</td>

      <td className="d-none d-md-table-cell">
        {producto.descripcion_producto}
      </td>

      <td>C$ {producto.precio_venta}</td>


      <td className="text-center">
        <Button
          variant="outline-warning"
          size="sm"
          className="m-1"
          onClick={() => abrirModalEdicion(producto)}
        >
          <i className="bi bi-pencil"></i>
        </Button>

        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => abrirModalEliminacion(producto)}
        >
          <i className="bi bi-trash"></i>
        </Button>
      </td>
    </tr>
  );
};

const TablaProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Producto</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th>Precio</th>

          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {productos.map((producto) => (
          <FilaProducto
            key={producto.id_producto}
            producto={producto}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;