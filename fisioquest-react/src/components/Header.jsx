import {
  Navbar,
  Container,
  Nav,
  Button
} from "react-bootstrap";
import { Link } from "react-router-dom";

import logo from "../assets/images/fisioquestbranco.png";

function Header() {
  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="navbar-custom py-1"
    >
      <Container fluid>

        <Navbar.Brand href="/">
          <img
            src={logo}
            alt="Logo"
            height="55"
          />
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>

          <Nav className="ms-auto align-items-center">

            <Nav.Link href="#sobre-o-projeto">
              Sobre o Projeto
            </Nav.Link>

            <Nav.Link href="#nossa-equipe">
              Quem Somos?
            </Nav.Link>

            <Nav.Link as={Link} to="/questionarios">
              Questionários
            </Nav.Link>

            <Nav.Link href="#localizacao">
              Localização
            </Nav.Link>

          </Nav>

          <Button
            href="https://wa.me/558391876157"
            className="cta-button"
          >
            Agende sua Avaliação
          </Button>

        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default Header;