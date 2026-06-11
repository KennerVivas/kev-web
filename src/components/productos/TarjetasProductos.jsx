import React, { useState } from "react";
import { Card, Row, Col, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ImagenProducto = ({ src }) => {
  if (src) {
    return (
      <Image
        src={src}
        rounded
        fluid
        style={{ height: "70px", width: "70px", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className="bg-light rounded d-flex align-items-center justify-content-center"
      style={{ height: "70px", width: "70px" }}
    >
      <i className="bi bi-image fs-3 text-muted"></i>
    </div>
  );
};

const TarjetaProducto = ({
  producto,
  activa,
  alAlternar,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {

  const handleEditar = (e) => {
    e.stopPropagation();
    abrirModalEdicion(producto);
  };

  const handleEliminar = (e) => {
    e.stopPropagation();
    abrirModalEliminacion(producto);
  };

  return (
    <Card
      className="mb-3 border-0 rounded-3 shadow-sm w-100"
      onClick={() => alAlternar(producto.id_producto)}
      style={{ cursor: "pointer" }}
    >
      <Card.Body className="p-2">
        <Row className="align-items-center">
          <Col xs={3}>
            <ImagenProducto src={producto.imagenes_productos} />
          </Col>

          <Col xs={6}>
            <div className="fw-semibold text-truncate">
              {producto.nombre_producto}
            </div>
            <div className="small text-muted text-truncate">
              {producto.descripcion_producto}
            </div>
          </Col>

          <Col xs={3} className="text-end">
            <div className="fw-bold">C$ {producto.precio_venta}</div>
          </Col>
        </Row>

        {activa && (
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline-warning" size="sm" onClick={handleEditar}>
              <i className="bi bi-pencil"></i>
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleEliminar}>
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const TarjetasProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion }) => {
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const alternarTarjeta = (id) => {
    setIdTarjetaActiva(idTarjetaActiva === id ? null : id);
  };

  return (
    <div>
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto.id_producto}
          producto={producto}
          activa={idTarjetaActiva === producto.id_producto}
          alAlternar={alternarTarjeta}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
        />
      ))}
    </div>
  );
};

export default TarjetasProductos;