import React, { useState, useEffect, useMemo, useRef, useCallback  } from 'react';
import { Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSearch, faFilter, faCopy , faFileExcel, faPenToSquare , faFloppyDisk, faCheck, faEdit, faTrash, faXmark, faFileCsv  } from '@fortawesome/free-solid-svg-icons';
import DataTable from "react-data-table-component";
import logEvent from '../logEvent';
import debounce from 'lodash.debounce';
import { useLocation } from "react-router-dom";

const Cidades = () => {

  
  const locationLog = useLocation();
  
  const fullname = localStorage.getItem("fullname");
  const module = 'cidades';
  const module_id = "";
  const user_id = localStorage.getItem("id");
  const user_name = fullname;
  var event = 'view';
  var logText = 'visualizou a página ' + location.pathname;
  
  // Função para obter o horário atual formatado
  const getCurrentTime = () => new Date().toLocaleString();
  
  useEffect(() => {
    const lastLogTime = localStorage.getItem('lastLogTime');
    const currentTime = getCurrentTime();
  
    // Se o horário for diferente, registre o evento
    if (lastLogTime !== currentTime) {
      logEvent("view", module, "", user_id, user_name, fullname + " " + logText, "", null);
      localStorage.setItem('lastLogTime', currentTime); // Atualiza o horário registrado
    }
  }, []); // Array de dependências vazio para executar uma vez ao montar o componente

  const [formData, setFormData] = useState({ cidade: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState(null);
  const [showModalCopy, setShowModalCopy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleAdd, setIsVisibleAdd] = useState(false);
  const editRef = useRef(null); 
  
    

  useEffect(() => {
    reloadCidades();
  }, []);


  
  // Handle form submit to fetch data
const handleSubmitSearch = (e) => {

  e.preventDefault();
  setLoading(true);

  const searchParams = new URLSearchParams(formData);
  const url = `https://api.williamvieira.tech/cidade.php?${searchParams.toString()}`;
  
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCidades(data); // Update the DataTable with the fetched data
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
      setLoading(false);
    });
    
};


  const isTopParam = new URLSearchParams(location.search).get('top') === 'true';
  useEffect(() => {
    if (isTopParam) {
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTopParam]); // Re-run if the query parameter changes


const addIMovel = () => {

  setIsVisibleAdd(false);
  setIsEditing(false);
  reloadCidades();
  setFormData({
    cidade: "",
  });
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

};

 const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Chama a função debounced para pesquisar após digitar
    debouncedSearch(value);
  };

  const searchApi = async (searchValue) => {
    setLoading(true);

    const searchParams = new URLSearchParams({ search_value: searchValue });
    const url = `https://api.williamvieira.tech/cidade.php?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setCidades(data); // Atualiza os dados
    } catch (error) {
      console.error('Erro ao buscar dados: ', error);
    } finally {
      setLoading(false);
    }
  };

   // Criação do debounce para a função de busca
      const debouncedSearch = useCallback(
        debounce((searchValue) => {
          searchApi(searchValue); // Chama a função de busca com o valor
        }, 500), // Delay de 500ms
        []
      );
  
  

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if(isVisible == true) {
      reloadCidades();
      formData.search_value = "";
    }
};


const handleCopy = () => {

  if (cidades.length === 0) {
    alert("Nenhum dado disponível para copiar!");
    return;
  }

  // Função para remover "R$" e formatar valores
  const formatCurrency = (value) => {
    if (typeof value === "string") {
      return value.replace(/R\$\s?/g, "");
    }
    return value;
  };

  // Extrair o cabeçalho baseado no nome das colunas
  const header = columns
    .filter((col) => col.name) // Ignora colunas sem nome
    .map((col) => col.name)
    .join("\t"); // Junta os nomes das colunas com tabulação

  // Extrair os dados das linhas
  const tableData = cidades
    .map((row) => {
      return columns
        .filter((col) => col.name) // Ignora colunas sem nome
        .map((col) => {
          if (col.selector) {
            let value = col.selector(row);

            // Formatar valores das colunas específicas
            if (["Valor Compra Escritura", "Valor Compra Contrato"].includes(col.name)) {
              value = formatCurrency(value);
            }

            return value;
          }
          return "";
        })
        .join("\t"); // Junta os valores de cada linha com tabulação
    })
    .join("\n"); // Junta as linhas com uma nova linha

  // Combina cabeçalho e dados das linhas
  const fullData = `${header}\n${tableData}`;

  // Copiar para a área de transferência
  navigator.clipboard
    .writeText(fullData)
    .then(() => {
      setShowModalCopy(true); // Exibir modal de confirmação
    })
    .catch((err) => {
      console.error("Falha ao copiar os dados: ", err);
      alert("Falha ao copiar os dados para a área de transferência!");
    });
};


const handleExport = () => {
  try {
    if (!cidades || cidades.length === 0) {
      console.warn("Nenhum dado disponível para exportação.");
      return;
    }

    // Filtra colunas que não sejam ações (removendo aquelas que possuem 'cell')
    const exportColumns = columns.filter((col) => !col.cell);

    // Função para remover "R$" e formatar valores corretamente
    const formatCurrency = (value) => {
      if (typeof value === "string") {
        return value.replace(/R\$\s?/g, "").trim();
      }
      return value;
    };

    // Função para formatar números
    const formatNumber = (value) => {
      if (typeof value === "string") {
        const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
        return isNaN(numericValue) ? value : numericValue;
      }
      return value;
    };

    // Função para formatar datas
    const formatDate = (value) => {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return value;
    };

    // Função para aplicar a formatação adequada nos valores
    const formatValue = (value, columnName) => {
      if (typeof value === 'string' && (columnName.includes("Data") || columnName.includes("Data de"))) {
        return formatDate(value); // Formata como data
      } else if (!isNaN(value)) {
        return formatNumber(value); // Formata como número
      }
      return value; // Retorna o valor original se não for número nem data
    };

    // Mapeia os dados para corresponder aos nomes das colunas filtradas
    const exportData = cidades.map((row) => {
      return exportColumns.reduce((acc, col) => {
        if (col.name) {
          let value =
            typeof col.selector === "function"
              ? col.selector(row)
              : row[col.selector] || "";

          // Aplicar formatação para valores monetários e numéricos
          if (["Valor Compra Escritura", "Valor Compra Contrato"].includes(col.name)) {
            value = formatCurrency(value);
          } else {
            value = formatValue(value, col.name); // Formatar conforme tipo (número ou data)
          }

          acc[col.name] = value;
        }
        return acc;
      }, {});
    });

    // Cria a planilha com os dados processados
    const ws = XLSX.utils.json_to_sheet(exportData, { 
      header: exportColumns.map((col) => col.name) 
    });

    // Converte para CSV com BOM UTF-8 para manter acentos
    const csvOutput = "\uFEFF" + XLSX.utils.sheet_to_csv(ws, { FS: ";" });

    // Cria um blob para download do CSV
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Cria e dispara o download do arquivo CSV
    const a = document.createElement("a");
    a.href = url;
    a.download = "cidades.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Exportação CSV concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
  }
};


  const reloadCidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.williamvieira.tech/cidade.php');
      setCidades(response.data);
    } catch (error) {
      setAlertMessage("Erro ao carregar as cidades.");
      setAlertVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {

    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    e.preventDefault();

    if (!formData.cidade.trim()) {
      setAlertMessage("A cidade não pode estar vazia!");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(`https://api.williamvieira.tech/cidade.php?id=${formData.id}&cidade=${formData.cidade}`);
        setAlertMessage("Cidade atualizada com sucesso!");
      } else {
        await axios.post('https://api.williamvieira.tech/cidade.php?cidade=' + formData.cidade);
        setAlertMessage("Cidade cadastrada com sucesso!");
      }
      setAlertVariant("success");
      setShowAlert(true);
     
    } catch (error) {
      setAlertMessage("Erro ao salvar ou cidade já existe.");
      setAlertVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }

    const fullname = localStorage.getItem("fullname");
    const module = 'cidades';
    const module_id = "";
    const user_id = localStorage.getItem("id");
    const user_name = fullname;
    var event = 'add';
    var logText = 'adicionou a cidade ' + formData.cidade;
    if(isEditing) {
        var event = 'edit';
        var logText = 'editou a cidade ' + formData.cidade;
    } else {
      setIsEditing(false);
      setFormData({ cidade: '' });
    }

    reloadCidades();

    logEvent(event, module, module_id, user_id, user_name, fullname + " " + logText, formData.apelido, formData.matriculasSelecionadas);

  };

  const handleEdit = (cidade) => {
    setIsVisibleAdd(true);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsEditing(true);
    setFormData({ id: cidade.id, cidade: cidade.nome });
  };

  const handleDelete = async () => {
      try {

        await axios.delete(`https://api.williamvieira.tech/cidade.php?id=${deletingId}`);
        setAlertMessage("Cidade excluída com sucesso!");
        setAlertVariant("success");
        setShowDeleteModal(false);
        reloadCidades();

        const fullname = localStorage.getItem("fullname");
        const module = 'cidades';
        const module_id = "";
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        var event = 'delete';
        var logText = 'excluiu a cidade ' + deletingName;

        logEvent(event, module, module_id, user_id, user_name, fullname + " " + logText, formData.apelido, formData.matriculasSelecionadas);
        
      } catch (error) {

        setAlertMessage("Erro ao excluir a cidade.");
        setAlertVariant("danger");
        setShowDeleteModal(false);

      }
    
  };

  const columns = [
 {
      cell: (row) => (
        <div>
          <button className="btn btn-info btn-sm mr-15" onClick={() => handleEdit(row)}>
            <FontAwesomeIcon icon={faPenToSquare} /> Editar
          </button>
        </div>
      ),
      width: "125px" // Define a largura da primeira coluna
    },
    {
      name: "",
      cell: (row) => (
        <div>
          <button className="btn btn-danger btn-sm" onClick={() => { setDeletingId(row.id); setDeletingName(row.nome); setShowDeleteModal(true); }}> <FontAwesomeIcon icon={faTrash} /> Excluir</button>
        </div>
      ),
      width: "125px" // Define a largura da primeira coluna
    },
    { name: "Cidades", selector: (row) => row.nome, sortable: true }
  ];
  

  

  return (
    <div id="layoutSidenav_content">
        <div className="container-fluid px-4">
   
            <div className="col-md-6">
            <h1 ref={editRef} className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://williamvieira.tech/LogoVRi-sem-fundo.png" 
              alt="Ícone Grupo Serbom" 
            /> Cidades
          </h1>
            </div>
           
      

      {showAlert && (
        <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}

<div className="card shadow-lg border-0 rounded-lg ">
        <div className="card-body">

        {isVisible && (
        <div className="card card-search"  style={{ width: '100%' }}>
        <div className="card-body">
          <form onSubmit={handleSubmitSearch}>
            <div className="row">
              <div className="col-md-12" >
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
            
            <div className="btn btn-light btn-clear mt-3" onClick={toggleVisibility}>
               
               <FontAwesomeIcon icon={faXmark} /> Cancelar
           
            </div>
            {/* <button type="submit" className="btn btn-primary mt-3">
              <FontAwesomeIcon icon={faSearch} /> Buscar
            </button> */}
            </div>
            
          </form>
        </div>
      </div>
      )}

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>

            

             {cidades.length > 0 && (
                   <button className="btn btn-dark mb-3 btnExport" onClick={handleExport}> <FontAwesomeIcon icon={faFileCsv} /> CSV</button>
                   )}
                    {cidades.length > 0 && (
                  <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}>  <FontAwesomeIcon icon={faCopy} /> Copiar</button>
                 )}
             
             {cidades.length > 0 && !isVisible && (
                       <button className="btn btn-secondary mb-3 btn-info-grid" onClick={toggleVisibility}> <FontAwesomeIcon icon={faFilter} /> Filtrar </button>
                     )}
             <DataTable
      columns={columns}
      data={cidades}
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 50]}
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
        rowsPerPageText: 'Linhas por página',
        rangeSeparatorText: 'de',
        selectAllRowsItem: true,
        selectAllRowsItemText: 'Selecionar todos',
      }}
    />

          
            </>
          )}
        </div>
      </div>

      <div className="card shadow-lg border-0 rounded-lg mt-4">
        <div className="card-body">
     <div className="row">
                <div className="col-md-12">
                {isVisibleAdd && (
                            <button type="submit" onClick={addIMovel} className="btn btn-light btn-relative-default">
                                <FontAwesomeIcon icon={faClose} /> Cancelar
                              </button>
                          )}
                </div>
              </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 form-floating">
              <input
                type="text"
                className="form-control"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Digite a cidade"
                required
              />
              <label htmlFor="cidade">Cidade <span className="text-danger">*</span></label>
            </div>

            <div className="text-center">
              <Button variant="success" type="submit">
                {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faCheck} />} {isEditing ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </div>
      </div>

     
    </div>
      <footer className="py-4 bg-light mt-auto footerInterno">
                <div className="container-fluid px-4">
                    <div className="text-center">
                        <div className="text-muted text-center">© VRI - Todos os direitos reservados.</div>
                    </div>
                </div>
            </footer>
                 {/* Modal de Confirmação de Exclusão */}
                 {showDeleteModal && (
                            <div className="modal fade show" style={{ display: 'block', paddingRight: '17px' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                              <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title" id="deleteModalLabel">Confirmar Exclusão</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                                  </div>
                                  <div className="modal-body">
                                    Tem certeza de que deseja excluir?
                                  </div>
                                  <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}> <FontAwesomeIcon icon={faXmark} /> Cancelar</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}><FontAwesomeIcon icon={faCheck} /> Excluir</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Modal de Confirmação de Exclusão */}
                                                              {showModalCopy && (
                                                                  <div className="modal fade show" style={{ display: 'block', paddingRight: '17px' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                                                    <div className="modal-dialog modal-dialog-centered">
                                                                      <div className="modal-content">
                                                                        <div className="modal-header">
                                                        
                                                                          <button type="button" className="btn-close" onClick={() => setShowModalCopy(false)}></button>
                                                                        </div>
                                                                        <div className="modal-body">
                                                                          Dados copiados com sucesso.
                                                                        </div>
                                                                        <div className="modal-footer">
                                                                          <button type="button" className="btn btn-primary" onClick={() => setShowModalCopy(false)}> <FontAwesomeIcon icon={faCheck} /> OK</button>
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                )}
    </div>
  );
};

export default Cidades;
