import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Image } from "react-bootstrap";

// 1. Subcomponente: Formulario de Edición
const FormularioEdicionProducto = ({
  formId,
  productoEditar,
  categorias,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  alEnviar,
}) => {
  return (
    <Form id={formId} onSubmit={alEnviar}>
      <Row>
        {/* Categoría - Corregido con .toString() para evitar conflictos de tipo */}
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <Form.Select
              name="categoria_producto"
              value={productoEditar?.categoria_producto?.toString() || ""}
              onChange={manejoCambioInputEdicion}
              required
            >
              <option value="">Seleccione ...</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Nombre */}
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre_producto"
              value={productoEditar?.nombre_producto || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Nombre del producto"
              required
            />
          </Form.Group>
        </Col>

        {/* Precio de venta - Corregido: apuntando a 'precio_venta' */}
        <Col xs={12}>
          <Form.Group className="mb-3">
            <Form.Label>Precio *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="precio_venta"
              value={productoEditar?.precio_venta || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Precio de venta"
              required
            />
          </Form.Group>
        </Col>

        {/* ⚠️ Nota: El campo de Stock ha sido eliminado por completo */}

        {/* Visualización de la Imagen Actual */}
        <Col xs={12} className="text-center my-2">
          <Form.Label className="d-block fw-bold">Imagen actual</Form.Label>
          {productoEditar?.imagenes_productos ? (
            <Image
              src={productoEditar.imagenes_productos}
              width="100"
              height="100"
              rounded
              thumbnail
              style={{ objectFit: "cover" }}
              alt="Producto actual"
            />
          ) : (
            <span className="text-muted d-block" style={{ fontSize: "0.9rem" }}>
              Sin imagen
            </span>
          )}
        </Col>

        {/* Input para nueva imagen */}
        <Col xs={12}>
          <Form.Group className="mb-3">
            <Form.Label>Nueva imagen opcional</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={manejoCambioArchivoActualizar}
            />
          </Form.Group>
        </Col>

        {/* Descripción */}
        <Col xs={12}>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="descripcion_producto"
              value={productoEditar?.descripcion_producto || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Descripción del producto"
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

// 2. Componente Principal
const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarProducto,
  categorias,
}) => {
  const [guardando, setGuardando] = useState(false);
  const FORM_EDIT_ID = "edicion-producto-form";

  const handleCerrar = () => setMostrarModalEdicion(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardando) return;

    setGuardando(true);
    try {
      await actualizarProducto();
    } catch (error) {
      console.error("Error al actualizar desde el modal:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={handleCerrar}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <FormularioEdicionProducto
          formId={FORM_EDIT_ID}
          productoEditar={productoEditar}
          categorias={categorias}
          manejoCambioInputEdicion={manejoCambioInputEdicion}
          manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
          alEnviar={handleSubmit}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrar}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          form={FORM_EDIT_ID}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;