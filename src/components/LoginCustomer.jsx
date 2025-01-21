import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";

function LoginCustomer() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false); // Controla a exibição do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Armazena a mensagem do alerta
  const [alertVariant, setAlertVariant] = useState("success"); // Define o tipo de alerta (sucesso ou erro)
  const [isLoading, setIsLoading] = useState(false);

    // Efeito para verificar o localStorage e redirecionar se não encontrar o item esperado
    useEffect(() => {
      // Verifique se o item de autenticação (exemplo: 'authToken') existe no localStorage
      const authToken = localStorage.getItem('authToken');
      
      // Se não existir, redireciona para o login
      if (authToken) {
        navigate('/matriculas-de-imoveis'); // Redireciona para a página de login
      }
    }, [navigate]);  // O efeito será disparado sempre que o componente for montado

  const handleSubmit = (e) => {
    
    e.preventDefault();

    // Validar campos de entrada
    if (!email || !password) {
      setAlertMessage('Por favor, preencha todos os campos.'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      // Simulação de uma requisição real de login (substituir com a lógica da sua API)
      axios.post("https://api.williamvieira.tech/login.php", { email, password })
      .then((response) => {
        if (response.data.success) {
          // Armazenar token no localStorage ou sessionStorage
          localStorage.setItem("authToken", response.data);
          localStorage.setItem("fullname", response.data.fullname);
          setTimeout(() => navigate("/matriculas-de-imoveis"), 1000);
        } else {
          setAlertMessage('Credenciais inválidas.'); // Mensagem de sucesso
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

  return (
    <div id="layoutAuthentication">
      <div id="layoutAuthentication_content">
        <main>
          <div className="container">
            <div className="row vh-100 d-flex justify-content-center align-items-center">
              <div className="col-lg-5">
                <div className="card shadow-lg border-0 rounded-lg mt-5">
                  <div className="card-header padding-15 text-center">
                    <img src="https://gruposerbom.com.br/wp-content/uploads/elementor/thumbs/Logo-Grupo-Serbom-per6qbsxueuf8h0iiocnzd70s31osvp3jd4u2p5se8.webp" alt="Logo" />
                  </div>
                  <div className="card-body">
                    <h3 className="text-left font-weight-light">Login</h3>
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
                      <div className="form-floating mb-3">
                        <input
                          className="form-control"
                          id="inputPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <label htmlFor="inputPassword">Digite sua Senha</label>
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
                      <FontAwesomeIcon icon={faRightToBracket} />
                    )}{" "}
                    Entrar
                  </button>
                      </div>
                    </form>
                    <div className="mt-3 text-center mtb-2rem">
                      <Link to="/forgot-password" className="small"><FontAwesomeIcon icon={faEnvelope} /> Redefinir senha</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}

export default LoginCustomer;
