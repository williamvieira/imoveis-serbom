import React, { useState } from 'react';
import { Link, useLocation, useNavigate  } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faUsers, faMoneyBill, faCity, faLocationDot, faLightbulb, faWater, faClock, faTachometerAlt, faMessage, faCheck, faRoadBarrier, faList, faRightFromBracket, faHouse, faGlassWater } from '@fortawesome/free-solid-svg-icons';
<FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />

function MenuDashboard() {

  const location = useLocation();
  const navigate = useNavigate(); 

    // State to track if the subitem is visible
    const [isSubitemVisible, setSubitemVisible] = useState(false);

    // Toggle visibility of the subitem
    const toggleSubitem = () => {
        setSubitemVisible(!isSubitemVisible);
    };

  const isActive = (path) => location.pathname === path;
  
    // Função para logout
    const handleLogout = () => {

        // Remover o item de autenticação do localStorage
        localStorage.removeItem('authToken');  // Ajuste o nome da chave conforme necessário
    
        // Redirecionar para a página de login
        navigate('/login');

      };
  
  return (
    <div id="layoutSidenav_nav">
        <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
                <div className="nav">
                    <div className="sb-sidenav-menu-heading">Menu</div>
                    {/* <Link to="/dashboard" className={isActive('/dashboard') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faTachometerAlt} />
                        </div>
                        Dashboard
                    </Link> */}
                      
                    <Link  onClick={toggleSubitem} to="/matriculas-de-imoveis?top=true" className={isActive('/matriculas-de-imoveis') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faHouse} />
                        </div>
                        Matrículas de Imóveis
                        <FontAwesomeIcon 
                    icon={isSubitemVisible ? faChevronUp : faChevronDown}  // Toggle between up and down
                    className="arrow-icon"
                />
                    </Link>
                    <div className={`subitem ${isSubitemVisible ? 'show' : 'hide'}`}
                style={{ display: isSubitemVisible ? 'block' : 'none' }}>
                    {/* <Link to="/relogios-energia?top=true" className={isActive('/relogios-energia') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faLightbulb} />
                        </div>
                        Relógios de Energia
                    </Link>
                    <Link to="/relogios-agua?top=true" className={isActive('/relogios-agua') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faGlassWater} />
                        </div>
                        Relógios de Água
                    </Link> */}
                    <Link to="/locatorio?top=true" className={isActive('/locatorio') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                        Locatário
                    </Link>
                    <Link to="/cidades?top=true" className={isActive('/cidades') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                        Cidades
                    </Link>
                    {/* <Link to="/iptu-itr" className={isActive('/iptu-itr') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faMoneyBill} />
                        </div>
                        IPTU / ITR 
                    </Link> */}
             
                    </div>
                    <Link to="/usuarios" className={isActive('/usuarios') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        Usuários
                    </Link>
                    {/* <Link to="/urbano-rural" className={isActive('/urbano-rural') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faRoadBarrier} />
                        </div>
                        Urbano / Rural
                    </Link>
                    <Link to="/locatorio-imoveis" className={isActive('/locatorio-rural') ? 'active nav-link' : 'nav-link'}>
                        <div className="sb-nav-link-icon">
                            <FontAwesomeIcon icon={faRoadBarrier} />
                        </div>
                        Locatório Imóveis
                    </Link> */}
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
  );
}

export default MenuDashboard;
