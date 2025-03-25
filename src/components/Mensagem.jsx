import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import React, { useState } from "react";
import { Alert } from "react-bootstrap";

function Mensagem() {
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false); // Controla a exibição do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Armazena a mensagem do alerta
  const [alertVariant, setAlertVariant] = useState("success"); // Define o tipo de alerta (sucesso ou erro)
  const [isSubmitting, setIsSubmitting] = useState(false); // Para controlar o estado de envio (evitar múltiplos cliques)

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica se o campo de mensagem está vazio
    if (!message) {
      setAlertMessage("Por favor, digite algo na mensagem.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    // Desabilita o botão de envio para evitar múltiplos cliques
    setIsSubmitting(true);

    // URL para onde a mensagem será enviada via GET
    const url = `https://api.williamvieira.tech/push.php?message=${encodeURIComponent(message)}`;

    // Enviar a mensagem usando o método GET com fetch
    fetch(url, {
      method: "GET",
    })
      .then(response => response.text()) // Converte o corpo da resposta para texto
      .then(body => {
        //console.log("Resposta:", body);
        // Verifica se o corpo da resposta contém a string específica
        if (body.includes("name")) {
          setAlertMessage("Mensagem enviada com sucesso!"); // Mensagem de sucesso
          setAlertVariant("success"); // Tipo de alerta
        } else {
          setAlertMessage("Erro ao enviar a mensagem."); // Mensagem de erro
          setAlertVariant("danger"); // Tipo de alerta (erro)
        }
        setShowAlert(true); // Exibe o alerta
      })
      .catch(error => {
        console.error("Erro de rede ao tentar enviar a mensagem:", error);
        setAlertMessage("Erro de rede ao tentar enviar a mensagem."); // Mensagem de erro
        setAlertVariant("danger"); // Tipo de alerta (erro)
        setShowAlert(true); // Exibe o alerta
      })
      .finally(() => {
        // Reabilita o botão de envio após a resposta
        setIsSubmitting(false);
      });
  };

  return (
    <div id="layoutSidenav_content">
      <main>
        <div className="container-fluid px-4">
          <h1 className="mt-4">
            <img className="icone-title-serbom" src="https://williamvieira.tech/LogoVRi-sem-fundo.png" alt="" /> Mensagens
          </h1>

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

          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-body rounded">
              {/* Card Body com bordas arredondadas */}
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="message"
                    placeholder="Digite sua mensagem"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <label htmlFor="message">Mensagem</label>
                </div>
                <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isSubmitting} // Desabilita o botão durante o envio
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'} {/* Texto do botão muda para "Enviando..." enquanto estiver em progresso */}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Mensagem;
