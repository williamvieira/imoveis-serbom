import React, { useState, useEffect, useRef, errorRef, editRef  } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faClose, faFloppyDisk, faPlus, faPenToSquare, faTrash, faCheck, faFileExcel, faFilter, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Alert } from "react-bootstrap";
import { CurrencyInput } from 'react-currency-mask';
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara


const initialData = [];


const Usuarios = () => {
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
    // Copiar todos os dados da tabela
    const tableData = data.map(row => {
      return Object.values(row).join('\t');
    }).join('\n');
  
    // Copiar para a área de transferência
    navigator.clipboard.writeText(tableData).then(() => {
      setShowModalCopy(true);
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
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Imóveis");
            XLSX.writeFile(wb, "imoveis.xlsx");
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
  setFormData({
    ...formData,
    [name]: value,
  });
};
      

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
      //console.log(data.sql);
      setAlertMessage(data.message); // Mensagem de sucesso
      setAlertVariant("success"); // Tipo de alerta
      setShowAlert(true);
      reloadGrid();
      //console.log(formData);
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
            <h1   className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
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
            <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}>  <FontAwesomeIcon icon={faCopy} /> Copiar</button>
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

     
       
       
                    <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
                      
                    <div className="card-body">
                    {isVisibleAdd && (
              <button type="submit" onClick={addIMovel} className="btn btn-light btn-relative-default">
                  <FontAwesomeIcon icon={faClose} /> Limpar
                </button>
            )}
                  
      {/* Formulário de Adição de Usuário com Floating Labels */}
      <form onSubmit={handleSubmit} className="form-float">
      <div className="mb-3 form-floating" ref={editRef}>
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
                  checked={formData.permissoesMatricula}
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
                    <div className="text-muted text-center">© 2024 - Grupo Serbom. Todos os direitos reservados.</div>
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
                          <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}> <FontAwesomeIcon icon={faXmark} /> Cancelar</button>
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
