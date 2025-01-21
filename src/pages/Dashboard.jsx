import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from "react-router-dom";  // Importando useNavigate
import MenuDashboard from "../components/MenuDashboard";
import MainDashobard from "../components/MainDashboard";
import Mensagem from "../components/Mensagem";
import MatriculaImoveis from "../components/MatriculaImoveis";
import UrbanoRural from "../components/UrbanoRural";
import LocatorioSaida from "../components/LocatorioImoveis";
import RelogiosEnergia from "../components/RelogiosEnergia";
import RelogiosAgua from "../components/RelogiosAgua";
import LocatorioImoveis from "../components/LocatorioImoveis";
import IptuItr from "../components/IptuITR";
import Usuarios from "../components/Usuarios";
import Cidades from "../components/Cidades";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();  // Hook para redirecionar
  const [topPosition, setTopPosition] = useState(null);

  const isActiveComponent = (path) => location.pathname === path;

  const [isActive, setIsActive] = useState(false);


  const handleClick = () => {
    setIsActive((prev) => !prev);
  };

  // Função para logout
  const handleLogout = () => {
    // Remover o item de autenticação do localStorage
    localStorage.removeItem('authToken');  // Ajuste o nome da chave conforme necessário

    // Redirecionar para a página de login
    navigate('/login');
  };


  // Efeito para verificar o localStorage e redirecionar se não encontrar o item esperado
  useEffect(() => {
    // Verifique se o item de autenticação (exemplo: 'authToken') existe no localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Se não existir, redireciona para o login
    if (!authToken) {
      navigate('/login'); // Redireciona para a página de login
    }
  }, [navigate]);  // O efeito será disparado sempre que o componente for montado

  return (
    <div className={isActive ? "sb-nav-fixed sb-sidenav-toggled" : "sb-nav-fixed"}>
      <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <a className="navbar-brand ps-3">   <img 
              className="menu-icone" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
              alt="Ícone Grupo Serbom" 
            />  Grupo Serbom</a>
        <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" 
                id="sidebarToggle" 
                onClick={handleClick} 
                href="#!">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div  onClick={handleLogout} className="nav-link link-nav">
          <div className="sb-nav-link-icon">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </div>
          Sair
        </div>
      </nav>
      <div id="layoutSidenav">
        <MenuDashboard />
        {isActiveComponent('/dashboard') ? <MainDashobard /> : ""}
        {isActiveComponent('/matriculas-de-imoveis') ? <MatriculaImoveis /> : ""}
        {isActiveComponent('/relogios-energia') ? <RelogiosEnergia /> : ""}
        {isActiveComponent('/relogios-agua') ? <RelogiosAgua /> : ""}
        {isActiveComponent('/locatorio') ? <LocatorioImoveis /> : ""}
        {isActiveComponent('/urbano-rural') ? <UrbanoRural /> : ""}
        {isActiveComponent('/iptu-itr') ? <IptuItr /> : ""}
        {isActiveComponent('/usuarios') ? <Usuarios /> : ""}
        {isActiveComponent('/cidades') ? <Cidades /> : ""}
      </div>
    </div>
  );
}

export default Dashboard;
