import React, { useState, useEffect, useRef, errorRef, editRef  } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faPlus, faPenToSquare, faTrash, faCheck, faFileExcel, faFilter, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Alert } from "react-bootstrap";
import { CurrencyInput } from 'react-currency-mask';
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara

const initialData = [];

const UrbanoRural = () => {
  const [formData, setFormData] = useState({
    tipoRelatorio: "urbano", // Valor inicial de tipoRelatorio
    codigoCadastro: "",
    apelido: "",
    inscricaoMunicipal: "",
    setor: "",
    lote: "",
    quadra: "",
    nomeProprietario: "",
    nomeProprietarioGrupo: "",
    cpfCnpjProprietario: "",
    areaTerreno: "",
    geometriaRegular: "",
    metrosFrente: "",
    metrosFundo: "",
    metrosLadoDireito: "",
    metrosLadoEsquerdo: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    observacoes: "",
  });


    const [errors, setErrors] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isVisibleAdd, setIsVisibleAdd] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [alertVariant, setAlertVariant] = useState("success"); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
      const [editingId, setEditingId] = useState(null);
        const errorRef = useRef(null); // Ref para o erro
        const editRef = useRef(null); // Ref para o erro

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const columns = [];

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      tipoRelatorio: value,
    });
  };
  const handleSubmit = (e) => {

    //console.log(formData);
      
    e.preventDefault();
  
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `https://api.williamvieira.tech/urbanorural.php?id=${editingId}` : 'https://api.williamvieira.tech/urbanorural.php';
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      setAlertMessage(data.message); // Mensagem de sucesso
      setAlertVariant("success"); // Tipo de alerta
      setShowAlert(true);
      reloadGrid();
    })
    .catch((error) => {
      //console.log(error);
      setAlertMessage('Erro ao salvar o imóvel'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (method === 'POST') {
    setFormData({
      tipoRelatorio: "urbano", // Valor inicial de tipoRelatorio
      codigoCadastro: "",
      apelido: "",
      inscricaoMunicipal: "",
      setor: "",
      lote: "",
      quadra: "",
      nomeProprietario: "",
      nomeProprietarioGrupo: "",
      cpfCnpjProprietario: "",
      areaTerreno: "",
      geometriaRegular: "",
      metrosFrente: "",
      metrosFundo: "",
      metrosLadoDireito: "",
      metrosLadoEsquerdo: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      observacoes: ""
    });
    reloadForm();
    setIsEditing(false);
  } else {
    setIsEditing(true);
  }

  const reloadGrid = async () => {
    setLoading(true);
    try {
      // Aqui você pode substituir pela sua própria API
      const response = await axios.get('https://api.williamvieira.tech/urbanorural.php');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
    } finally {
      setLoading(false);
    }
  };
   
  
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
                  /> Urbano / Rural
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
      
       <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
       <div className="card-body">
      <form onSubmit={handleSubmit}>
        <div className="form-check ">
          <input
            type="radio"
            className="form-check-input"
            id="tipoRelatorioUrbano"
            name="tipoRelatorio"
            value="urbano"
            checked={formData.tipoRelatorio === "urbano"}
            onChange={handleRadioChange}
          />
          <label className="form-check-label" htmlFor="tipoRelatorioUrbano">
            Urbano
          </label>
        </div>

        <div className="form-check mb-3">
          <input
            type="radio"
            className="form-check-input"
            id="tipoRelatorioRural"
            name="tipoRelatorio"
            value="rural"
            checked={formData.tipoRelatorio === "rural"}
            onChange={handleRadioChange}
          />
          <label className="form-check-label" htmlFor="tipoRelatorioRural">
            Rural
          </label>
        </div>

        {formData.tipoRelatorio && (
          <>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="codigoCadastro"
                name="codigoCadastro"
                value={formData.codigoCadastro}
                onChange={handleInputChange}
                placeholder="Código Cadastro Matrícula"
              />
              <label htmlFor="codigoCadastro">Código Cadastro Matrícula</label>
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
                id="inscricaoMunicipal"
                name="inscricaoMunicipal"
                value={formData.inscricaoMunicipal}
                onChange={handleInputChange}
                placeholder="Inscrição Municipal"
              />
              <label htmlFor="inscricaoMunicipal">Inscrição Municipal</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleInputChange}
                placeholder="Setor"
              />
              <label htmlFor="setor">Setor</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="lote"
                name="lote"
                value={formData.lote}
                onChange={handleInputChange}
                placeholder="Lote"
              />
              <label htmlFor="lote">Lote</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="quadra"
                name="quadra"
                value={formData.quadra}
                onChange={handleInputChange}
                placeholder="Quadra"
              />
              <label htmlFor="quadra">Quadra</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="nomeProprietario"
                name="nomeProprietario"
                value={formData.nomeProprietario}
                onChange={handleInputChange}
                placeholder="Nome Proprietário"
              />
              <label htmlFor="nomeProprietario">Nome Proprietário</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="nomeProprietarioGrupo"
                name="nomeProprietarioGrupo"
                value={formData.nomeProprietarioGrupo}
                onChange={handleInputChange}
                placeholder="Nome Proprietário Grupo"
              />
              <label htmlFor="nomeProprietarioGrupo">Nome Proprietário Grupo</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="cpfCnpjProprietario"
                name="cpfCnpjProprietario"
                value={formData.cpfCnpjProprietario}
                onChange={handleInputChange}
                placeholder="CPF/CNPJ Proprietário"
              />
              <label htmlFor="cpfCnpjProprietario">CPF/CNPJ Proprietário</label>
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
              <select
                className="form-select"
                id="geometriaRegular"
                name="geometriaRegular"
                value={formData.geometriaRegular}
                onChange={handleInputChange}
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              <label htmlFor="geometriaRegular">Geometria Regular?</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                id="metrosFrente"
                name="metrosFrente"
                value={formData.metrosFrente}
                onChange={handleInputChange}
                placeholder="Metros de Frente"
              />
              <label htmlFor="metrosFrente">Metros de Frente</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                id="metrosFundo"
                name="metrosFundo"
                value={formData.metrosFundo}
                onChange={handleInputChange}
                placeholder="Metros de Fundo"
              />
              <label htmlFor="metrosFundo">Metros de Fundo</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                id="metrosLadoDireito"
                name="metrosLadoDireito"
                value={formData.metrosLadoDireito}
                onChange={handleInputChange}
                placeholder="Metros Lado Direito"
              />
              <label htmlFor="metrosLadoDireito">Metros Lado Direito</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                id="metrosLadoEsquerdo"
                name="metrosLadoEsquerdo"
                value={formData.metrosLadoEsquerdo}
                onChange={handleInputChange}
                placeholder="Metros Lado Esquerdo"
              />
              <label htmlFor="metrosLadoEsquerdo">Metros Lado Esquerdo</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                placeholder="CEP"
              />
              <label htmlFor="cep">CEP</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                placeholder="Endereço"
              />
              <label htmlFor="endereco">Endereço</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Número"
              />
              <label htmlFor="numero">Número</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                placeholder="Complemento"
              />
              <label htmlFor="complemento">Complemento</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                placeholder="Bairro"
              />
              <label htmlFor="bairro">Bairro</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Cidade"
              />
              <label htmlFor="cidade">Cidade</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="uf"
                name="uf"
                value={formData.uf}
                onChange={handleInputChange}
                placeholder="UF"
              />
              <label htmlFor="uf">UF</label>
            </div>

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
          </>
        )}

    <div className="text-center">
                              <button type="submit" className="btn btn-success mt-3 mb-3">
                                {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faCheck} />} {isEditing ? "Salvar" : "Cadastrar" }
                              </button>
                         
              
                            </div>
      </form>
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

export default UrbanoRural;
