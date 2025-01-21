import React, { useState, useEffect, errorRef, editRef   } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
//import CurrencyInput from 'react-currency-input-field';
import InputMask from 'react-input-mask';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faEdit, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

const initialData = [];

const IptuITR = () => {
  const [formData, setFormData] = useState({
    tipoImposto: "iptu", // Valor inicial de tipoImposto
    codigoCadastro: "",
    apelido: "",
    ano: "",
    codLancamento: "",
    areaTerreno: "",
    areaConstruida: "",
    enquadramento: "",
    aliquotaIPTU: "",
    valorVenalTerreno: "",
    valorVenalTerrenoM2: "",
    valorVenalConstrucao: "",
    valorVenalConstrucaoM2: "",
    valorVenalImovel: "",
    impostoPredial: "",
    txColetaLixo: "",
    txLimpezaPublica: "",
    outrasAdicoes: "",
    descontoIPTUVerde: "",
    outrosDescontos: "",
    valorIPTUAno: "",
    valorIPTUAnoAVista: "",
    descontoPgtoAVista: "",
    numeroParcelas: "",
    valorIPTUMes: "",
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [isVisibleAdd, setIsVisibleAdd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState([]);

  const columns = [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      tipoImposto: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Lógica de envio dos dados
    setLoading(false);
    setShowAlert(true);
    setAlertMessage("Dados enviados com sucesso!");
    setAlertVariant("success");
  };

  return (
    <div id="layoutSidenav_content">

<div className="container-fluid px-4">
          <div className="row">
            <div className="col-md-6" ref={errorRef}>
            <h1 ref={editRef}  className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
              alt="Ícone Grupo Serbom" 
            /> IPTU / ITR
          </h1>
            </div>
            <div className="col-md-6">
            {isVisibleAdd && (
              <button type="submit" onClick={addIMovel} className="btn btn-primary btn-relative">
                  <FontAwesomeIcon icon={faPlus} /> Adicionar Imóvel
                </button>
            )}
            </div>
          </div>
        </div>
        <div className="mt-20">
          <div className="mt-30">
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
          </div>
          
        </div>

      <div className="">

        <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Selecione o tipo de imposto (IPTU ou ITR) */}
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="tipoImpostoIPTU"
                  name="tipoImposto"
                  value="iptu"
                  checked={formData.tipoImposto === "iptu"}
                  onChange={handleRadioChange}
                />
                <label className="form-check-label" htmlFor="tipoImpostoIPTU">
                  IPTU
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  type="radio"
                  className="form-check-input"
                  id="tipoImpostoITR"
                  name="tipoImposto"
                  value="itr"
                  checked={formData.tipoImposto === "itr"}
                  onChange={handleRadioChange}
                />
                <label className="form-check-label" htmlFor="tipoImpostoITR">
                  ITR
                </label>
              </div>

              {/* Campos do Formulário */}
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="codigoCadastro"
                  name="codigoCadastro"
                  value={formData.codigoCadastro}
                  onChange={handleInputChange}
                  placeholder="Código Cadastro"
                />
                <label htmlFor="codigoCadastro">Código Cadastro</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="apelido"
                  name="apelido"
                  value={formData.apelido}
                  onChange={handleInputChange}
                  placeholder="Apelido"
                />
                <label htmlFor="apelido">Apelido</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="ano"
                  name="ano"
                  value={formData.ano}
                  onChange={handleInputChange}
                  placeholder="Ano"
                />
                <label htmlFor="ano">Ano</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="codLancamento"
                  name="codLancamento"
                  value={formData.codLancamento}
                  onChange={handleInputChange}
                  placeholder="Código Lançamento"
                />
                <label htmlFor="codLancamento">Código Lançamento</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="areaTerreno"
                  name="areaTerreno"
                  value={formData.areaTerreno}
                  onChange={handleInputChange}
                  placeholder="Área Terreno (m²)"
                />
                <label htmlFor="areaTerreno">Área Terreno (m²)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="areaConstruida"
                  name="areaConstruida"
                  value={formData.areaConstruida}
                  onChange={handleInputChange}
                  placeholder="Área Construída (m²)"
                />
                <label htmlFor="areaConstruida">Área Construída (m²)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="enquadramento"
                  name="enquadramento"
                  value={formData.enquadramento}
                  onChange={handleInputChange}
                  placeholder="Enquadramento"
                />
                <label htmlFor="enquadramento">Enquadramento</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="aliquotaIPTU"
                  name="aliquotaIPTU"
                  value={formData.aliquotaIPTU}
                  onChange={handleInputChange}
                  placeholder="Alíquota IPTU"
                />
                <label htmlFor="aliquotaIPTU">Alíquota IPTU</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="valorVenalTerreno"
                  name="valorVenalTerreno"
                  value={formData.valorVenalTerreno}
                  onChange={handleInputChange}
                  placeholder="Valor Venal Terreno"
                />
                <label htmlFor="valorVenalTerreno">Valor Venal Terreno</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="valorVenalTerrenoM2"
                  name="valorVenalTerrenoM2"
                  value={formData.valorVenalTerrenoM2}
                  onChange={handleInputChange}
                  placeholder="Valor Venal Terreno (R$/m²)"
                />
                <label htmlFor="valorVenalTerrenoM2">Valor Venal Terreno (R$/m²)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="valorVenalConstrucao"
                  name="valorVenalConstrucao"
                  value={formData.valorVenalConstrucao}
                  onChange={handleInputChange}
                  placeholder="Valor Venal Construção"
                />
                <label htmlFor="valorVenalConstrucao">Valor Venal Construção</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="valorVenalConstrucaoM2"
                  name="valorVenalConstrucaoM2"
                  value={formData.valorVenalConstrucaoM2}
                  onChange={handleInputChange}
                  placeholder="Valor Venal Construção (R$/m²)"
                />
                <label htmlFor="valorVenalConstrucaoM2">Valor Venal Construção (R$/m²)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="valorVenalImovel"
                  name="valorVenalImovel"
                  value={formData.valorVenalImovel}
                  onChange={handleInputChange}
                  placeholder="Valor Venal Imóvel"
                />
                <label htmlFor="valorVenalImovel">Valor Venal Imóvel</label>
              </div>

              {/* Campos adicionais... */}
              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="impostoPredial"
                  name="impostoPredial"
                  value={formData.impostoPredial}
                  onChange={handleInputChange}
                  placeholder="Imposto Predial"
                />
                <label htmlFor="impostoPredial">Imposto Predial</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="txColetaLixo"
                  name="txColetaLixo"
                  value={formData.txColetaLixo}
                  onChange={handleInputChange}
                  placeholder="Tx. Coleta de Lixo"
                />
                <label htmlFor="txColetaLixo">Tx. Coleta de Lixo</label>
              </div>

              {/* Continuar com outros campos... */}

              <div className="form-floating mb-3">
                <textarea
                  className="form-control"
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações"
                ></textarea>
                <label htmlFor="observacoes">Observações</label>
              </div>       

              {/* Botões de ação */}
              <div className="text-center">
                <button type="submit" className="btn btn-success mt-3 mb-3">
                  {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faCheck} />} {isEditing ? "Salvar" : "Cadastrar" }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
          <div className="card-body">

          

          
        {isVisible && (
        <div className="card card-search">
        <div className="card-body">
          <form onSubmit={handleSubmitSearch}>
            <div className="row">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  name="search_value"
                  value={formData.search_value}
                  onChange={handleChangeForm}
                  placeholder="Pesquisar"
                />
              </div>

            </div>
            <div className="text-left">
            
            <div className="btn btn-secondary btn-clear mt-3" onClick={toggleVisibility}>
               
               <FontAwesomeIcon icon={faXmark} /> Limpar
           
            </div>
            <button type="submit" className="btn btn-info mt-3">
              <FontAwesomeIcon icon={faSearch} /> Buscar
            </button>
            </div>
            
          </form>
        </div>
      </div>
      )}

      {loading && <p className="pleft">Carregando dados...</p>}

      {data.length > 0 && (
      <button className="btn btn-dark mb-3 btnExport" onClick={handleExport}> <FontAwesomeIcon icon={faFileExcel} /> Excel</button>
      )}

  {data.length > 0 && (
          <button className="btn btn-secondary mb-3 btn-info-grid" onClick={toggleVisibility}> <FontAwesomeIcon icon={faFilter} /> Filtrar </button>
        )}
     

        <div id="datatable-container">
        <DataTable
      columns={columns}
      data={data}
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 50, 100]}
      paginationText="Exibindo registros de"
      noDataComponent="Não há registros para exibir"
      customStyles={{
        table: {
          style: {
            fontSize: '16px',  // Set font size for the entire table
          },
        },
        headCells: {
          style: {
            fontSize: '16px',  // Set font size for header cells
          },
        },
        cells: {
          style: {
            fontSize: '16px',  // Set font size for data cells
          },
        },
        pagination: {
          style: {
            fontSize: '16px',  // Set font size for pagination controls
          },
        },
      }}
      paginationComponentOptions={{
        rowsPerPageText: 'Linhas de página',  // Change the "Rows per page" text to "Linhas de página"
      }}
    />
            </div>
          </div>
        </div>
      <footer className="py-4 bg-light mt-auto footerInterno">
            <div className="container-fluid px-4">
                <div className="text-center">
                    <div className="text-muted text-center">© 2024 - Grupo Serbom. Todos os direitos reservados.</div>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default IptuITR;
