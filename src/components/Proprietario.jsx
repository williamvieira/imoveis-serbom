import React, { useState, useEffect, useMemo, useRef, useCallback  } from 'react';
import { Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faClose , faSearch, faFilter, faCopy , faFileExcel, faPenToSquare , faFloppyDisk, faCheck, faEdit, faTrash, faXmark, faFileCsv  } from '@fortawesome/free-solid-svg-icons';
import DataTable from "react-data-table-component";
import InputMask from "react-input-mask";
import logEvent from '../logEvent';
import debounce from 'lodash.debounce';
import { useLocation } from "react-router-dom";

const Proprietario = () => {
 

  const locationLog = useLocation();

const fullname = localStorage.getItem("fullname");
const module = 'proprietarios';
const module_id = "";
const user_id = localStorage.getItem("id");
const user_name = fullname;
var event = 'add';
var logText = 'visualizou a página ' + location.pathname;

// Função para obter o horário atual formatado
const getCurrentTime = () => new Date().toLocaleString();

useEffect(() => {
  const lastLogTime = localStorage.getItem('lastLogTime');
  const currentTime = getCurrentTime();

  // Se o horário for diferente, registre o evento
  if (lastLogTime !== currentTime) {
    logEvent("view", "Proprietarios", "", user_id, user_name, fullname + " " + logText, "", null);
    localStorage.setItem('lastLogTime', currentTime); // Atualiza o horário registrado
  }
}, []); // Array de dependências vazio para executar uma vez ao montar o componente


  const [formData, setFormData] = useState({
    id: "",
    tipo_pessoa: "física",
    nome: "",
    nome_proprietario_grupo: "",
    cpf: '',
    cnpj: '',
    razao_social: ''
  });
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
      const editRef = useRef(null); 
        const [tipoPessoa, setTipoPessoa] = useState('física');
         const [isVisibleAdd, setIsVisibleAdd] = useState(false); 
       
          const [errorCPF, setErrorCPF] = useState('');
           const [errorCNPJ, setErrorCNPJ] = useState('');

           const handleBlurCNPJ = () => {
            const cnpj = formData.cnpj;
              if (!validaCNPJ(cnpj)) {
                setErrorCNPJ('CNPJ inválido');
                setFormData({ ...formData, cnpj: '' });
              } else {
                setErrorCNPJ('');
              }
          };
          function validaCNPJ (cnpj) {
            var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ]
            var c = String(cnpj).replace(/[^\d]/g, '')
            
            if(c.length !== 14)
                return false
        
            if(/0{14}/.test(c))
                return false
        
            for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
            if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
                return false
        
            for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
            if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
                return false
        
            return true
        }



          const isTopParam = new URLSearchParams(location.search).get('top') === 'true';
          useEffect(() => {
            if (isTopParam) {
              editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, [isTopParam]); // Re-run if the query parameter changes
        
const handleChange = (e) => {
  const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
};

const handleBlurCPF = () => {
  const cpf = formData.cpf;
    if (!validateCPF(cpf)) {
      setErrorCPF('CPF inválido');
      setFormData({ ...formData, cpf: '' });
    } else {
      setErrorCPF('');
    }
};

const validateCPF = (cpf) => {
  // Remove non-digit characters
  cpf = cpf.replace(/[^\d]+/g, "");

  // Check if CPF has 11 digits
  if (cpf.length !== 11) return false;

  // CPF cannot be all identical digits
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let firstCheckDigit = 11 - (sum % 11);
  if (firstCheckDigit === 10 || firstCheckDigit === 11) firstCheckDigit = 0;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let secondCheckDigit = 11 - (sum % 11);
  if (secondCheckDigit === 10 || secondCheckDigit === 11) secondCheckDigit = 0;

  // Compare calculated check digits with the ones in the CPF
  return firstCheckDigit === parseInt(cpf.charAt(9)) && secondCheckDigit === parseInt(cpf.charAt(10));
};

  useEffect(() => {
    reloadCidades();
  }, []);

  const handleTipoPessoaChange = (event) => {
    setTipoPessoa(event.target.value);
    formData.tipo_pessoa = event.target.value;
  };

  
  // Handle form submit to fetch data
const handleSubmitSearch = (e) => {

  e.preventDefault();
  setLoading(true);

  const searchParams = new URLSearchParams(formData);
  const url = `https://api.williamvieira.tech/proprietario.php?${searchParams.toString()}`;
  
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
    const url = `https://api.williamvieira.tech/cartorio.php?${searchParams.toString()}`;

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
    a.download = "proprietarios.csv";
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
      const response = await axios.get('https://api.williamvieira.tech/proprietario.php');
      setCidades(response.data);
    } catch (error) {
      setAlertMessage("Erro ao carregar as proprietários.");
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

  const addIMovel = () => {

    setIsVisibleAdd(false);
    setIsEditing(false);
    reloadCidades();
    setFormData({
      tipo_pessoa: "física",
      nome: "",
      nome_proprietario_grupo: "",
      cpf: '',
      cnpj: '',
      razao_social: ''
    });
    setTipoPessoa('física');
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);



    try {
      
     

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `https://api.williamvieira.tech/proprietario.php?id=${formData.id}` : 'https://api.williamvieira.tech/proprietario.php';
  


  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    setAlertMessage(data.message); // Mensagem de sucesso
    setAlertVariant("success"); // Tipo de alerta
    setShowAlert(true);
    if (isEditing) { 
      setAlertMessage("Proprietário atualizada com sucesso!");
    } else {
      setAlertMessage("Proprietário cadastrado com sucesso!");
      setFormData({
        tipo_pessoa: "física",
        nome: "",
        nome_proprietario_grupo: "",
        cpf: '',
        cnpj: '',
        razao_social: ''
      });
    }
    const fullname = localStorage.getItem("fullname");
    const module = 'proprietarios';
    const module_id = "";
    const user_id = localStorage.getItem("id");
    const user_name = fullname;
    var event = 'add';
    var logText = 'adicionou o proprietário ' + formData.nome;
    if(isEditing) {
        var event = 'edit';
        var logText = 'editou o proprietário ' + formData.nome;
    } else {
      setIsEditing(false);
      setFormData({
        tipo_pessoa: "física",
        nome: "",
        nome_proprietario_grupo: "",
        cpf: '',
        cnpj: '',
        razao_social: ''
      });
    }
    logEvent(event, module, module_id, user_id, user_name, fullname + " " + logText, formData.apelido, formData.matriculasSelecionadas);
    reloadCidades();
  })
  .catch((error) => {
    const teste = JSON.stringify(formData)
    console.log(teste);
    setAlertMessage('Erro ao salvar ou proprietário já existe'); // Mensagem de sucesso
    setAlertVariant("danger"); // Tipo de alerta
    setShowAlert(true);
  });

    
    } catch (error) {
      setAlertMessage("Erro ao salvar ou Proprietário já existe.");
      setAlertVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    reloadCidades();
  };

  const handleEdit = (cidade) => {
    setIsVisibleAdd(true);
    setIsEditing(true);
    setFormData(cidade);
    setTipoPessoa(cidade.tipo_pessoa);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDelete = async () => {
      try {
        await axios.delete(`https://api.williamvieira.tech/proprietario.php?id=${deletingId}`);
        setShowAlert(true);
        setAlertMessage("Proprietário excluído com sucesso!");
        setAlertVariant("success");
        setShowDeleteModal(false);
        reloadCidades();
        
      } catch (error) {
        setShowAlert(true);
        setAlertMessage("Erro ao excluir o Proprietário.");
        setAlertVariant("danger");
        setShowDeleteModal(false);
      }

      const fullname = localStorage.getItem("fullname");
      const module = 'proprietarios';
      const module_id = "";
      const user_id = localStorage.getItem("id");
      const user_name = fullname;
      var event = 'delete';
      var logText = 'excluiu o proprietário ' + deletingName;
      logEvent(event, module, module_id, user_id, user_name, fullname + " " + logText, formData.apelido, formData.matriculasSelecionadas);
    
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
    { name: "Proprietários", selector: (row) => row.nome, sortable: true },
    { name: "Grupos", selector: (row) => row.nome_proprietario_grupo, sortable: true },
    { name: "Tipo", selector: (row) => row.tipo_pessoa, sortable: true },
    { name: "CPF", selector: (row) => row.cpf, sortable: true },
    { name: "CNPJ", selector: (row) => row.cnpj, sortable: true },
    { name: "Razão Social", selector: (row) => row.razao_social, sortable: true }
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
            /> Proprietários
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

                  <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}> <FontAwesomeIcon icon={faCopy} /> Copiar</button>
                
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
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome"
                required
              />
              <label htmlFor="nome">Nome Proprietário <span className="text-danger">*</span></label>
            </div>
            <div className="mb-3 form-floating">
              <input
                type="text"
                className="form-control"
                id="nome_proprietario_grupo"
                name="nome_proprietario_grupo"
                value={formData.nome_proprietario_grupo}
                onChange={handleInputChange}
                placeholder="Digite o Grupo"
                required
              />
              <label htmlFor="nome_proprietario_grupo">Grupo Proprietário <span className="text-danger">*</span></label>
            </div>

            <div className="row">
                      <label className="labelCheck"><b>Pessoa</b> <span className="text-danger">*</span></label>
                        <div className="col-md-12 mb-3">
                          
            <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="fisica"
                        name="tipoPessoa"
                        value="física"
                        checked={tipoPessoa === 'física'}
                        onChange={handleTipoPessoaChange}
                      />
                      <label className="form-check-label" htmlFor="fisica">Física</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="juridica"
                        name="tipoPessoa"
                        value="jurídica"
                        checked={tipoPessoa === 'jurídica'}
                        onChange={handleTipoPessoaChange}
                        
                      />
                      <label className="form-check-label" htmlFor="juridica">Jurídica</label>
                    </div>
                        </div>
                      </div>
                      
            
                     
            
                    {/* Campo CPF com Floating Label - Visível apenas para Pessoa Física */}
                    {tipoPessoa === 'física' && (
                      <div className="form-floating mb-3">
                        <InputMask
                          mask="999.999.999-99" // Máscara de CPF
                          className={`form-control ${errorCPF ? 'is-invalid' : ''}`}
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleChange}
                          onBlur={handleBlurCPF}
                          placeholder=""
                          required
                        />
                        <label htmlFor="cpf">Informe o CPF do proprietário</label>
                        {errorCPF && <div className="invalid-feedback">CPF inválido!</div>}
                      </div>
                    )}
            
                    {/* Campo CNPJ com Floating Label - Visível apenas para Pessoa Jurídica */}
                    {tipoPessoa === 'jurídica' && (
                      <div className="form-floating mb-3">
                        <InputMask
                          mask="99.999.999/9999-99" // Máscara de CNPJ
                          className={`form-control ${errorCNPJ ? 'is-invalid' : ''}`}
                          id="cnpj"
                          name="cnpj"
                          value={formData.cnpj}
                          onChange={handleChange}
                          onBlur={handleBlurCNPJ}
                          placeholder=" "
                          required
                        />
                        <label htmlFor="cnpj">Informe o CNPJ do proprietário</label>
                        {errorCNPJ && <div className="invalid-feedback">CNPJ inválido!</div>}
                      </div>
                    )}
            
                    {/* Campo Razão Social - Visível apenas para Pessoa Jurídica */}
                    {tipoPessoa === 'jurídica' && (
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="razao_social"
                          name="razao_social"
                          value={formData.razao_social}
                          onChange={handleChange}
                          placeholder=" "
                          required
                        />
                        <label htmlFor="razao_social">Razão Social</label>
                      </div>
                    )}

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

export default Proprietario;
