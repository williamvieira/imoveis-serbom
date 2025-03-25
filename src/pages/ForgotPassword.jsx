import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons';
import { Alert, Spinner } from "react-bootstrap";
import axios from "axios";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false); // Controla a exibição do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Armazena a mensagem do alerta
  const [alertVariant, setAlertVariant] = useState("success"); // Define o tipo de alerta (sucesso ou erro)
  const navigate = useNavigate();  // Hook para redirecionar
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsLoading(true);

    try {

      // Simulação de uma requisição real de login (substituir com a lógica da sua API)
    axios.post("https://api.williamvieira.tech/api-email.php", { 'email' : email })
    .then((response) => {
      //console.log(response.data);
      if (response.data.success) {
        setTimeout(() => {
          setAlertMessage(response.data.message); // Mensagem de sucesso
          setAlertVariant("success"); // Tipo de alerta
          setShowAlert(true);
          setEmail("");
          setIsLoading(false);
        }, 1000);
      } else {
        setAlertMessage(response.data.message); // Mensagem de sucesso
        setAlertVariant("danger"); // Tipo de alerta
        setShowAlert(true);
        setIsLoading(false);
      }
    })
    .catch((error) => {
      console.error("Erro ao autenticar", error);
      setAlertMessage('Erro ao autenticar, tente novamente mais tarde.'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
      setIsLoading(false);
    });
      
    } catch (error) {

      setAlertMessage("Erro de rede. Tente novamente mais tarde.");
      setAlertVariant("danger");
      setShowAlert(true);
      setIsLoading(false);
      
    }
   
    

};

      // Efeito para verificar o localStorage e redirecionar se não encontrar o item esperado
      useEffect(() => {
        // Verifique se o item de autenticação (exemplo: 'authToken') existe no localStorage
        const authToken = localStorage.getItem('authToken');
        
        // Se não existir, redireciona para o login
        if (authToken) {
          navigate('/matriculas-de-imoveis'); // Redireciona para a página de login
        }
      }, [navigate]);  // O efeito será disparado sempre que o componente for montado

  return (
    <div className="container">
      <div className="row justify-content-center vh-100 d-flex justify-content-center align-items-center">
        <div className="col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="card-header padding-15 text-center">
            <img src="https://williamvieira.tech/LogoVRi-sem-fundo.png" alt="Logo" className="img-file" />
            </div>
            <div className="card-body">

                             {/* Exibe o alerta com bordas arredondadas */}
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
            <h3 className="text-left font-weight-light">Recuperar Senha</h3>
            
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    className="form-control"
                    id="inputEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="inputEmail">E-mail</label>
                </div>
                <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
              <button
                                  type="submit"
                                  className="btn btn-primary btn-block"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <FontAwesomeIcon icon={faEnvelope} />
                                  )}{" "}
                                  Enviar Instruções
                                </button>
                </div>
              </form>
              <div className="mt-3 mtb-2rem text-center">
                <Link to="/login" className="small"><FontAwesomeIcon icon={faUser} /> Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
