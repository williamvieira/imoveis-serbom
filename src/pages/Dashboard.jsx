import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faUsers , faChevronDown, faHouse , faBars, faRightFromBracket, faList, faHistory } from '@fortawesome/free-solid-svg-icons';
import {  Link, useLocation, useNavigate } from "react-router-dom";  // Importando useNavigate
import MenuDashboard from "../components/MenuDashboard";
import MainDashobard from "../components/MainDashboard";
import Mensagem from "../components/Mensagem";
import MatriculaImoveis from "../components/MatriculaImoveis";
import LocatorioSaida from "../components/LocatorioImoveis";
import RelogiosEnergia from "../components/RelogiosEnergia";
import RelogiosAgua from "../components/RelogiosAgua";
import LocatorioImoveis from "../components/LocatorioImoveis";
import Usuarios from "../components/Usuarios";
import Cidades from "../components/Cidades";
import Cartorios from "../components/Cartorios";
import Local from "../components/Local";
import Proprietario from "../components/Proprietario";
import logEvent from '../logEvent';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [topPosition, setTopPosition] = useState(null);

  const isActiveComponent = (path) => location.pathname === path;

      // State to track if the subitem is visible
      const [isSubitemVisible, setSubitemVisible] = useState(false);


  const [isActive, setIsActive] = useState(false);

     // Toggle visibility of the subitem
     const toggleSubitem = () => {
      setSubitemVisible(!isSubitemVisible);
  };

  const isActiveMenu = (path) => location.pathname === path;

  const editRef = useRef(null); 

    const isTopParam = new URLSearchParams(location.search).get('top') === 'true';


  const handleClick = () => {
    setIsActive((prev) => !prev);
  };

  // Função para logout
  const handleLogout = () => {
    const fullname = localStorage.getItem("fullname");
  const module = 'logout';
  const module_id = "";
  const user_id = localStorage.getItem("id");
  const user_name = fullname;
  var event = 'login';
  var logText = 'efetuou o logout';
  logEvent("logout", "logout", "", user_id, user_name, fullname + " " + logText, "", null);
    // Remover o item de autenticação do localStorage
    localStorage.removeItem('authToken');  // Ajuste o nome da chave conforme necessário
    // Redirecionar para a página de login
    navigate('/login');
  };

  const permissoesMatricula = () => {
    const permissoesMatricula = localStorage.getItem('permissoesMatricula');
    if(permissoesMatricula == '1') {
      return true;
    } else {
      return false;
    }
  };


  const perfil = localStorage.getItem('perfil');

  // Efeito para verificar o localStorage e redirecionar se não encontrar o item esperado
  useEffect(() => {
    // Verifique se o item de autenticação (exemplo: 'authToken') existe no localStorage
    const authToken = localStorage.getItem('authToken');

    const perfil = localStorage.getItem('perfil');

    if(isActiveComponent('/usuarios')) {
      if(perfil != "adm") {
        navigate('/dashboard');
      }
    }

    

    if(isActiveComponent('/matriculas-de-imoveis')) {
      if(permissoesMatricula() || perfil == 'adm') {
      
      } else {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/relogios-agua')) {
      if(permissoesMatricula() || perfil == 'adm') {
        
      } else {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/locatorio')) {
      if(permissoesMatricula() || perfil == 'adm') {
       
      } else {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/relogios-energia')) {
      if(permissoesMatricula() || perfil == 'adm') {
      
      } else {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/cidades')) {
      if(perfil != "adm") {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/cartorios')) {
      if(perfil != "adm") {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/proprietario')) {
      if(perfil != "adm") {
        navigate('/dashboard');
      }
    }
    if(isActiveComponent('/local')) {
      if(perfil != "adm") {
        navigate('/dashboard');
      }
    }
    
    
    // Se não existir, redireciona para o login
    if (!authToken) {
      navigate('/login'); // Redireciona para a página de login
    }
    if (isTopParam) {
      setIsActive(false);  
   }
  }, [navigate]);  // O efeito será disparado sempre que o componente for montado

  return (
    <div className={isActive ? "sb-nav-fixed sb-sidenav-toggled" : "sb-nav-fixed"}>
      <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <a className="navbar-brand ps-3">   

          <div className="div-logo">
          <img 
              className="menu-icone" 
              src="https://williamvieira.tech/LogoVRi-sem-fundo.png" 
            /> 
          </div>
        
            
        </a>
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
      <div id="layoutSidenav_nav">
        <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
                <div className="nav">
                    <div className="sb-sidenav-menu-heading">Menu</div>
                

                    {(permissoesMatricula() || perfil == 'adm') ? (
                    <Link onClick={toggleSubitem} className={(isActiveMenu('/locatorio') || isActiveMenu('/matriculas-de-imoveis') || isActiveMenu('/relogios-agua') || isActiveMenu('/relogios-energia') || isActiveMenu('/cidades') || isActiveMenu('/cartorios') || isActiveMenu('/local') || isActiveMenu('/proprietario') ) ? 'active nav-link' : ' nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faHouse} />
                        </div>
                        Gestão Imóveis
                        <FontAwesomeIcon 
                    icon={isSubitemVisible ? faChevronUp : faChevronDown}  // Toggle between up and down
                    className="arrow-icon"
                />
                   
                    </Link>
                     ) : ''}
                     
                    <div className={`subitem ${isSubitemVisible ? 'show' : 'hide'}`}
                style={{ display: isSubitemVisible ? 'block' : 'none' }}>
                    {(permissoesMatricula() || perfil == 'adm') ? (
                      <Link to="/matriculas-de-imoveis?top=true"  className={isActiveMenu('/matriculas-de-imoveis') ? 'active nav-link' : 'nav-link'}>
                        Matrículas
                    </Link>
                        ) : ''}
                    {(permissoesMatricula() || perfil == 'adm') ? (
                      <Link to="/locatorio?top=true" className={isActiveMenu('/locatorio') ? 'active nav-link' : 'nav-link'}>
                        Locatários
                    </Link>
                        ) : ''}
                          {(permissoesMatricula() || perfil == 'adm') ? (
                     <Link to="/relogios-agua?top=true" className={isActiveMenu('/relogios-agua') ? 'active nav-link' : 'nav-link'}>
                        Relógios de Água
                    </Link> 
   ) : ''}
      {(permissoesMatricula() || perfil == 'adm') ? (
                    <Link to="/relogios-energia?top=true" className={isActiveMenu('/relogios-energia') ? 'active nav-link' : 'nav-link'}>
                        Relógios de Energia
                    </Link>
                     ) : ''}
              
              {(perfil == 'adm') ? (
                    <Link to="/cidades?top=true" className={isActiveMenu('/cidades') ? 'active nav-link' : 'nav-link'}>
                     
                        Cidades
                    </Link>
                          ) : ''}
                    {(perfil == 'adm') ? (
                    <Link to="/cartorios?top=true" className={isActiveMenu('/cartorios') ? 'active nav-link' : 'nav-link'}>
                      
                        Cartórios
                    </Link>
                          ) : ''}
                    {(perfil == 'adm') ? (
                    <Link to="/local?top=true" className={isActiveMenu('/local') ? 'active nav-link' : 'nav-link'}>
                     
                        Local
                    </Link>
                          ) : ''}
                    {(perfil == 'adm') ? (
                    <Link to="/proprietario?top=true" className={isActiveMenu('/proprietario') ? 'active nav-link' : 'nav-link'}>
                     Proprietários
                 </Link>
                       ) : ''}
                    </div>
                     


{(perfil == 'adm') ? (
                    <Link to="/usuarios?top=true" className={isActiveMenu('/usuarios') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        Usuários
                    </Link>
                       ) : ''}

                    <Link to="/dashboard?top=true" className={isActiveMenu('/dashboard') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faHistory} />
                        </div>
                        Logs - Atividades
                    </Link>

                    <div onClick={handleLogout} className="nav-link" id="exit">
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </div>
                        Sair
                    </div>
                </div>
            </div>
        </nav>
    </div>
        {isActiveComponent('/dashboard') ? <MainDashobard /> : ""}
        {isActiveComponent('/matriculas-de-imoveis') ? <MatriculaImoveis /> : ""}
        {isActiveComponent('/relogios-energia') ? <RelogiosEnergia /> : ""}
        {isActiveComponent('/relogios-agua') ? <RelogiosAgua /> : ""}
        {isActiveComponent('/locatorio') ? <LocatorioImoveis /> : ""}
        {isActiveComponent('/usuarios') ? <Usuarios /> : ""}
        {isActiveComponent('/cidades') ? <Cidades /> : ""}
        {isActiveComponent('/cartorios') ? <Cartorios /> : ""}
        {isActiveComponent('/local') ? <Local /> : ""}
        {isActiveComponent('/proprietario') ? <Proprietario /> : ""}
      </div>
    </div>
  );
}

export default Dashboard;
