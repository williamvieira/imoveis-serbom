import React, { useState, useEffect, useRef, errorRef, editRef, useCallback  } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faClose, faFloppyDisk, faPlus, faPenToSquare, faTrash, faCheck, faFileExcel, faFilter, faXmark, faSearch, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { Alert } from "react-bootstrap";
import { CurrencyInput } from 'react-currency-mask';
import InputMask from "react-input-mask";  
import logEvent from '../logEvent';
import debounce from 'lodash.debounce';
import { useLocation } from "react-router-dom";


const initialData = [];

const Usuarios = () => {


  const locationLog = useLocation();
  
  const fullname = localStorage.getItem("fullname");
  const module = 'usuarios';
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

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    perfil : "",
    permissoesMatricula: false
  });

  const validEmail1 = (e) => {
    const { name, value } = e.target;
    const validation = validarEmail(value);
    if (!validation.isValid) {
      setError1(validation.message);
      setFormData({ ...formData, emailContato1: '' });
    } else {
      setError1("");
    }
  };

  const handleCopy = () => {
    if (data.length === 0) {
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
    const tableData = data
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

  
  

  
  // Função para validar o e-mail
function validarEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email.trim()) {
    return { isValid: false, message: 'O e-mail não pode estar vazio.' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Por favor, insira um e-mail válido.' };
  }

  return { isValid: true, message: 'E-mail válido.' };
}
  


      const [data, setData] = useState(initialData);
      const [errors, setErrors] = useState({});
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
        const [errorEmail1, setError1] = useState('');
         const [showModalCopy, setShowModalCopy] = useState(false);


    useEffect(() => {
      reloadGrid();
    }, []);

  const handleExport = () => {

    try {
  
      if (!data || data.length === 0) {
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
  
      // Função para converter datas de DD/MM/YYYY para YYYY-MM-DD (formato do Excel)
      const formatDateForCSV = (value) => {
        if (typeof value === "string" && value.includes("/")) {
          const parts = value.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }
        return value;
      };
  
      // Mapeia os dados para corresponder aos nomes das colunas filtradas
      const exportData = data.map((row) => {
        return exportColumns.reduce((acc, col) => {
          if (col.name) {
            let value =
              typeof col.selector === "function"
                ? col.selector(row)
                : row[col.selector] || "";
  
            // Aplicar formatação para valores monetários e datas
            if (["Valor"].includes(col.name)) {
              value = formatCurrency(value);
            } else if (["Data"].includes(col.name)) {
              value = formatDateForCSV(value);
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
      a.download = `usuarios.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      console.log("Exportação CSV concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
    }
  
  };
   

          const toggleVisibility = () => {
            setIsVisible(!isVisible);
            if(isVisible == true) {
              reloadGrid();
              formData.search_value = "";
            }
        };

  // Manipulando as mudanças nos campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  

  const reloadGrid = async () => {
    setLoading(true);
    try {
      // Aqui você pode substituir pela sua própria API
      const response = await axios.get('https://api.williamvieira.tech/users.php');
      setData(response.data);
      //console.log(response.data);
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setIsVisibleAdd(true);
    setFormData(row);
    setIsEditing(true);
    setEditingId(row.id);
    // setErrorCPF(false);
    // setErrorCEP(false);
    // setErrorCNPJ(false);
    // setErrorData(false);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const addIMovel = () => {

    setIsVisibleAdd(false);
    setIsEditing(false);
    reloadForm();
    setFormData({
      email: "",
      password: "",
      fullname: "",
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
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
          width: "125px" // Define a largura da coluna
        },
        {
          name: "",
          cell: (row) => (
            <div>
              <button className="btn btn-danger btn-sm" onClick={() => { setDeletingId(row.id); setShowDeleteModal(true); }}>
                <FontAwesomeIcon icon={faTrash} /> Excluir
              </button>
            </div>
          ),
          width: "125px" // Define a largura da coluna
        },
        // Nova coluna para o Nome Completo
        { name: "Nome", selector: (row) => row.fullname, sortable: true },
        
        // Nova coluna para o Email
        { name: "Email", selector: (row) => row.email, sortable: true },
      ];

        // Handle form submit to fetch data
const handleSubmitSearch = (e) => {
  e.preventDefault();
  setLoading(true);

  const searchParams = new URLSearchParams(formData);
  const url = `https://api.williamvieira.tech/users.php?${searchParams.toString()}`;
  
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setData(data); // Update the DataTable with the fetched data
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
      setLoading(false);
    });
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
    const url = `https://api.williamvieira.tech/users.php?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setData(data); // Atualiza os dados
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
  
      

const isTopParam = new URLSearchParams(location.search).get('top') === 'true';
useEffect(() => {
  if (isTopParam) {
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, [isTopParam]); // Re-run if the query parameter changes


  const handleSubmit = (e) => {

  
      
    e.preventDefault();
  
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `https://api.williamvieira.tech/users.php?id=${editingId}` : 'https://api.williamvieira.tech/users.php';
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.success) {
        setAlertMessage(data.message); // Mensagem de sucesso
        setAlertVariant("success"); // Tipo de alerta
        setShowAlert(true);
        reloadGrid();
      } else {
        setAlertMessage(data.message); // Mensagem de sucesso
        setAlertVariant("danger"); // Tipo de alerta
        setShowAlert(true);
        reloadGrid();
      }
      //console.log(data.sql);
     
      //console.log(formData);
    })
    .catch((error) => {
      //console.log(error);
      setAlertMessage('Erro ao salvar o usuário'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (method === 'POST') {
    setFormData({
      email: "",
      password: "",
      fullname: "",
    });
    reloadForm();
    setIsEditing(false);
  } else {
    setIsEditing(true);
  }
   
  
  };

  
  const reloadForm = () => {

  }


  const handleDelete = () => {
    fetch(`https://api.williamvieira.tech/users.php?id=${deletingId}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        reloadGrid();
        setAlertMessage(data.message); // Mensagem de sucesso
        setAlertVariant("success"); // Tipo de alerta
        setShowAlert(true);
        setShowDeleteModal(false);
        editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  };





  return (
    
    <div id="layoutSidenav_content" className="flowRoot">


   <div className="container-fluid px-4">
          <div className="row">
            <div className="col-md-6" ref={errorRef}>
            <h1  ref={editRef}   className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://williamvieira.tech/LogoVRi-sem-fundo.png" 
              alt="Ícone Grupo Serbom" 
            /> Usuários
          </h1>
            </div>
        
          </div>
        </div>
        
          {showAlert && (
            <div className="mt-20">
          <div className="mt-30">
            <Alert
              variant={alertVariant}
              onClose={() => setShowAlert(false)}
              dismissible
              className="rounded"
            >
              {alertMessage}
            </Alert>
            </div>
          
        </div>

          )}
          
        <div className="card shadow-lg border-0 rounded-lg mt-20">
          <div className="card-body">


          

          
        {isVisible && (
        <div className="card card-search"  style={{ width: '100%' }}>
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

      {loading && <p className="pleft">Carregando dados...</p>}

      {data.length > 0 && (
      <button className="btn btn-dark mb-3 btnExport" onClick={handleExport}> <FontAwesomeIcon icon={faFileCsv} /> CSV</button>
      )}

       {data.length > 0 && (
            <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}>  <FontAwesomeIcon icon={faCopy} /> Copiar</button>
           )}

  {data.length > 0 && !isVisible && (
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

     
       
       
                    <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
                      
                    <div className="card-body">
                    {isVisibleAdd && (
              <button type="submit" onClick={addIMovel} className="btn btn-light btn-relative-default">
                  <FontAwesomeIcon icon={faClose} /> Cancelar
                </button>
            )}
                  
      {/* Formulário de Adição de Usuário com Floating Labels */}
      <form onSubmit={handleSubmit} className="form-float">
      <div className="mb-3 form-floating">
        <input
            type="text"
            className="form-control"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            placeholder=""
            required
          />
          <label htmlFor="fullname">Nome <span className="red">*</span></label>
        </div>
        <div className="mb-3 form-floating">
          <input
            type="email"
            className={`form-control ${errorEmail1 ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={validEmail1}
            required
            placeholder=""
          />
          <label htmlFor="email">E-mail <span className="red">*</span></label>
          {errorEmail1 && <p style={{ color: 'red' }}>{errorEmail1}</p>}
        </div>
        <div className="mb-3 form-floating">
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required={isEditing ? false : true}
            placeholder=""
            minLength={8}
          />
          <label htmlFor="password">Senha</label>
       
        </div>
        <div className="mb-3 form-floating">
                <select
                  className="form-select"
                  id="perfil"
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">Usuário</option>
                  <option value="adm">Administrador</option>
                </select>
                <label htmlFor="perfil">Perfil</label>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="permissoesMatricula"
                     name="permissoesMatricula"
                  value={formData.permissoesMatricula}
                  checked={(formData.permissoesMatricula == '1') ? true : false}
                 onChange={(e) => setFormData({ ...formData, permissoesMatricula: e.target.checked })}
                  
                />
                <label className="form-check-label" htmlFor="permissoesMatricula">
                  Permissão para Matrículas de Imóveis
                </label>
              </div>

              
     
      
       <div className="text-center">
                                   <button type="submit" className="btn btn-success mt-3 mb-3">
                                     {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faCheck} />} {isEditing ? "Salvar" : "Cadastrar" }
                                   </button>
                              
                   
                                 </div>
      </form>
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
                          Tem certeza de que deseja excluir este imóvel?
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}> <FontAwesomeIcon icon={faXmark} /> Cancelar</button>
                          <button type="button" className="btn btn-danger" onClick={handleDelete}><FontAwesomeIcon icon={faCheck} /> Excluir</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

export default Usuarios;
