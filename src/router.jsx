import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import ForgotPassword from "./pages/ForgotPassword";
import Forgot from "./pages/Forgot";
import GED from "./components/GED";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
        <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="user-select" element={<UserSelect />} /> */}
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="matriculas-de-imoveis" element={<Dashboard />} />
        <Route path="locatorio" element={<Dashboard />} />
        <Route path="mensagens" element={<Dashboard />} />
        {/* <Route path="protected" element={<Protected />} /> */}
        <Route path="relogios-energia" element={<Dashboard />} />
        <Route path="relogios-agua" element={<Dashboard />} />
        <Route path="locatorio-imoveis" element={<Dashboard />} />
        <Route path="iptu-itr" element={<Dashboard />} />
        <Route path="usuarios" element={<Dashboard />} />
        <Route path="cidades" element={<Dashboard />} />
        <Route path="cartorios" element={<Dashboard />} />
        <Route path="local" element={<Dashboard />} />
        <Route path="proprietario" element={<Dashboard />} />
        <Route path="ged" element={<GED />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </>
  ),
  { basename: "/" }
);

export default router;
