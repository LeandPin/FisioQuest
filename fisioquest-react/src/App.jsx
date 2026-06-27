import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SelecionarQuestionario from "./pages/SelecionarQuestionario";
import Cinesiofobia from "./pages/Cinesiofobia";
import PensamentoCatastrofico from "./pages/PensamentoCatastrofico";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/questionarios"
        element={<SelecionarQuestionario />}
      />

      <Route
        path="/cinesiofobia"
        element={<Cinesiofobia />}
      />

      <Route
        path="/pensamento-catastrofico"
        element={<PensamentoCatastrofico />}
      />
    </Routes>
  );
}

export default App;