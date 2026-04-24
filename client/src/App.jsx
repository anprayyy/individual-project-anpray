import { Route, Routes } from "react-router";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CVDetail from "./pages/CVDetail";
import CVForm from "./pages/CVForm";

function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* MAIN */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cvs/:id" element={<CVDetail />} />
        <Route path="/create" element={<CVForm />} />
        <Route path="/edit/:id" element={<CVForm />} />
      </Route>
    </Routes>
  );
}

export default App;
