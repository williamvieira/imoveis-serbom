import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser, faCheck } from "@fortawesome/free-solid-svg-icons";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = searchParams.get("hash"); // Pegar o token da URL

    if (!token) {
      setAlertMessage("Token de redefinição inválido ou ausente.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("As senhas não coincidem. Tente novamente.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    if (password.length < 8) {
      setAlertMessage("A senha deve ter pelo menos 8 caracteres.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
        
      const response = await fetch("https://api.williamvieira.tech/api-email.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      //console.log(result);

      if (result.success) {

        setAlertMessage(result.message);
        setAlertVariant("success");
        setShowAlert(true);

        // Redirecionar após 3 segundos
        setTimeout(() => navigate("/login"), 1000);

      } else {

        setAlertMessage(result.message || "Erro ao redefinir a senha.");
        setAlertVariant("danger");
        setShowAlert(true);

      }
    } catch (error) {

      setAlertMessage("Erro de rede. Tente novamente mais tarde.");
      setAlertVariant("danger");
      setShowAlert(true);

    } finally {

      setIsLoading(false);

    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center vh-100 d-flex align-items-center">
        <div className="col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="card-header text-center">
              <img src="https://williamvieira.tech/LogoVRi-sem-fundo.png" alt="Logo" className="img-file" />
            </div>
            <div className="card-body">
              {/* Exibição de Alerta */}
              {showAlert && (
                <Alert
                  variant={alertVariant}
                  onClose={() => setShowAlert(false)}
                  dismissible
                  className="rounded"
                >
                  {alertMessage}
                </Alert>
              )}
              <h3 className="text-left font-weight-light">Redefinir Senha</h3>

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    id="inputPassword"
                    className="form-control"
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="inputPassword">Nova Senha</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    id="inputConfirmPassword"
                    className="form-control"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="inputConfirmPassword">Confirmar Nova Senha</label>
                </div>
                <div className="d-flex justify-content-between mt-4 mb-0">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}{" "}
                    Redefinir Senha
                  </button>
                </div>
              </form>
              <div className="mt-3 mtb-2rem text-center">
                <Link to="/login" className="small">
                  <FontAwesomeIcon icon={faUser} /> Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
