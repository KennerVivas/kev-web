import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Pagina404 = () => {

    return (
        <Container className="mt-3">
            <Row className="align-ttems-center">
                <Col>
                    <h2><i className="bi-house-fill me-2"></i> Esta ruta no existe.</h2>
                </Col>
            </Row>
        </Container>
    );
}
export default Pagina404;