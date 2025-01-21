import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCopy , faFileExcel, faPenToSquare , faFloppyDisk, faCheck, faEdit, faTrash, faXmark  } from '@fortawesome/free-solid-svg-icons';
import DataTable from "react-data-table-component";
const Cidades = () => {
  const [formData, setFormData] = useState({ cidade: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
    const [showModalCopy, setShowModalCopy] = useState(false);
      const [isVisible, setIsVisible] = useState(false);
    

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

const handleChangeForm = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value,
  });
};


  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if(isVisible == true) {
      reloadCidades();
      formData.search_value = "";
    }
};


  const handleCopy = () => {
    // Copiar todos os dados da tabela
    const tableData = cidades.map(row => {
      return Object.values(row).join('\t');
    }).join('\n');
  
    // Copiar para a área de transferência
    navigator.clipboard.writeText(tableData).then(() => {
      setShowModalCopy(true);
    });
  };

      const handleExport = () => {
          const ws = XLSX.utils.json_to_sheet(cidades);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Imóveis");
          XLSX.writeFile(wb, "imoveis.xlsx");
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
      reloadCidades();
      setIsEditing(false);
      setFormData({ cidade: '' });
    } catch (error) {
      setAlertMessage("Erro ao salvar ou cidade já existe.");
      setAlertVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cidade) => {
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
          <button className="btn btn-danger btn-sm" onClick={() => { setDeletingId(row.id); setShowDeleteModal(true); }}> <FontAwesomeIcon icon={faTrash} /> Excluir</button>
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
            <h1  className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
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
        <div className="card card-search">
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
               
               <FontAwesomeIcon icon={faXmark} /> Limpar
           
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              <FontAwesomeIcon icon={faSearch} /> Buscar
            </button>
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
                   <button className="btn btn-dark mb-3 btnExport" onClick={handleExport}> <FontAwesomeIcon icon={faFileExcel} /> Excel</button>
                   )}
                    {cidades.length > 0 && (
                  <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}>  <FontAwesomeIcon icon={faCopy} /> Copiar</button>
                 )}
             
             {cidades.length > 0 && (
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
