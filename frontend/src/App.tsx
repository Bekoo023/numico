import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Layout from "./components/layout";
import Register from "./pages/register";
import Dashboard, { DashboardAccount, DashboardAdministration, DashboardAssistant } from "./pages/dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import Login from "./pages/login";

const App: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<section className="section container page-heading"><span className="eyebrow">404 · PAGINA NIET GEVONDEN</span><h1>Even de weg kwijt?</h1><p>Deze pagina bestaat niet. Vanaf de homepage helpen we je weer op weg.</p><Link to="/" className="button">Terug naar de homepage</Link></section>} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardAdministration view="overview" />} />
              <Route path="upload" element={<DashboardAdministration view="upload" />} />
              <Route path="bonnetjes" element={<DashboardAdministration view="receipts" />} />
              <Route path="assistent" element={<DashboardAssistant />} />
              <Route path="account" element={<DashboardAccount />} />
              <Route path="*" element={<section className="dash-card dash-page"><h2>Pagina niet gevonden</h2><Link to="/dashboard" className="dash-button">Naar overzicht</Link></section>} />
            </Route>
          </Route>
        </Routes>
      </Router>
  );
};

export default App;
