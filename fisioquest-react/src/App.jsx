import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SelecionarQuestionario from "./pages/SelecionarQuestionario";
import Cinesiofobia from "./pages/Cinesiofobia";
import PensamentoCatastrofico from "./pages/PensamentoCatastrofico";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";

import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/questionarios" element={<SelecionarQuestionario />} />
      <Route path="/cinesiofobia" element={<Cinesiofobia />} />
      <Route path="/pensamento-catastrofico" element={<PensamentoCatastrofico />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
