import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faPlus, faPenToSquare, faTrash, faCheck, faFileExcel, faFilter, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Alert } from "react-bootstrap";
import { CurrencyInput } from 'react-currency-mask';
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara
import Select from 'react-select';
import axios from "axios";

const initialData = [];

function RelogiosEnergia() {

  const [formData, setFormData] = useState({
    cod_matricula: "",
    apelido: "",
    local: "",
    numero_relogio: "",
    sub_numero_relogio: "",
    categoria_consumo: "",
    nome_proprietario: "",
    cpf_cnpj_proprietario: "",
    mesmo_proprietario_matricula: "",
    nome_titular_consumidor: "",
    cpf_cnpj_titular_consumidor: "",
    mesmo_titular_usuario: "",
    status: "",
    debitos_aberto: "",
    valor_debitos_aberto: "",
    mes_ultimo_competencia: "",
    cadastro_atualizado: "",
    observacoes: "",
    search_value: ""
  });

  const [errors, setErrors] = useState({
    codRelogioEnergia: '',
    cod_matricula: '',
    cpf_cnpj_proprietario: '',
    cpf_cnpj_titular_consumidor: ''
  });

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
      reloadGrid();
      formData.search_value = "";
    }
};



  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(false);
  const errorRef = useRef(null); // Ref para o erro
  const editRef = useRef(null); // Ref para o erro
  const [isVisibleAdd, setIsVisibleAdd] = useState(false);
  const [showAlert, setShowAlert] = useState(false); 
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertVariant, setAlertVariant] = useState("success"); 
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModalCod, setShowModalCod] = useState(false);
  const [optionsSelect, setOptionsSelect] = useState([]); 
  const [options, setOptions] = useState([]); 
  const [inputValue, setInputValue] = useState(''); // Valor digitado pelo usuário
  

  useEffect(() => {
    reloadGrid();
    fetchOptions('');
  }, []);

    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Imóveis");
      XLSX.writeFile(wb, "imoveis.xlsx");
    };

  const reloadGrid = () => {
    setLoading(true);
    fetch("https://api.williamvieira.tech/matriculas.php")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Erro ao carregar dados:', error));
    setLoading(false);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

 // Handle the change of selected option
 const handleChangeSelect = (selectedOption) => {
  setFormData((prevFormData) => ({
    ...prevFormData,
    cod_matricula: selectedOption ? selectedOption.value : "", // Updating cod_matricula
  }));
  handleSearch1(selectedOption.value);
};

const handleInputChange = (newInputValue) => {
  fetchOptions(newInputValue);
  setInputValue(newInputValue); // Atualiza o valor enquanto o usuário digita
};


 // Função que busca as opções da API
 const fetchOptions = async (searchQuery) => {
  // if (!searchQuery) {
  //   setOptions([]);
  //   return;
  // }
  
  setLoadingSelect(true);
  try {
    // Supondo que a API seja algo como: /api/matriculas?q=searchQuery
    const response = await axios.get(`https://api.williamvieira.tech/options.php?q=${searchQuery}`);
    setOptions(response.data); // Ajuste conforme a estrutura da sua resposta da API
  } catch (error) {
    console.error('Erro ao buscar opções:', error);
  } finally {
    setLoadingSelect(false);
  }
};

// Handle form submit to fetch data
const handleSubmitSearch = (e) => {
  e.preventDefault();
  setLoading(true);

  const searchParams = new URLSearchParams(formData);
  const url = `https://api.williamvieira.tech/matriculas.php?${searchParams.toString()}`;
  
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



const handleSearch1 = async (value) => {
  try {
    const response = await fetch(`https://api.williamvieira.tech/codmatricula.php?cod_matricula=${value}`);
    const data = await response.json();

    //console.log(data);

    // Se a consulta foi bem-sucedida, atualiza o estado com os dados retornados
    if (data.cod_matricula) {
      setFormData({
        ...formData,
        apelido: data.apelido
      });
    } else {
      setShowModalCod(true);
      setFormData({
        ...formData,
        cod_matricula: '',
        apelido : ''
      });
    }
  } catch (error) {
    console.error("Erro ao consultar API:", error);
    alert("Erro ao buscar dados.");
  }
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
  const url = isEditing ? `https://api.williamvieira.tech/matriculas.php?id=${editingId}` : 'https://api.williamvieira.tech/matriculas.php';
 // teste = JSON.stringify(formData);
  //console.log(formData);
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
    cod_matricula: "",
    apelido: "",
    local: "",
    numero_relogio: "",
    sub_numero_relogio: "",
    categoria_consumo: "",
    nome_proprietario: "",
    cpf_cnpj_proprietario: "",
    mesmo_proprietario_matricula: "",
    nome_titular_consumidor: "",
    cpf_cnpj_titular_consumidor: "",
    mesmo_titular_usuario: "",
    status: "",
    debitos_aberto: "",
    valor_debitos_aberto: "",
    mes_ultimo_competencia: "",
    cadastro_atualizado: "",
    observacoes: ""
  });


  //reloadForm();
  setIsEditing(false);
} else {
  setIsEditing(true);
}
 

};


const mascara = formData.cpf_cnpj_proprietario.length === 11 
? "999.999.999-99" // CPF
: "99.999.999/9999-99"; // CNPJ

const mascaraTitular = formData.cpf_cnpj_titular_consumidor.length === 11 
? "999.999.999-99" // CPF
: "99.999.999/9999-99"; // CNPJ
const handleDelete = () => {
  fetch(`https://api.williamvieira.tech/matriculas.php?id=${deletingId}`, { method: 'DELETE' })
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
    cod_matricula: "",
    apelido: "",
    local: "",
    numero_relogio: "",
    sub_numero_relogio: "",
    categoria_consumo: "",
    nome_proprietario: "",
    cpf_cnpj_proprietario: "",
    mesmo_proprietario_matricula: "",
    nome_titular_consumidor: "",
    cpf_cnpj_titular_consumidor: "",
    mesmo_titular_usuario: "",
    status: "",
    debitos_aberto: "",
    valor_debitos_aberto: "",
    mes_ultimo_competencia: "",
    cadastro_atualizado: "",
    observacoes: ""
  });
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

};

const reloadForm = () => {

}

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
    { name: "Cód do Relógio Energia", selector: (row) => row.cod, sortable: true },
    { name: "Cód da Matrícula", selector: (row) => row.cod_matricula, sortable: true },
    { name: "Apelido", selector: (row) => row.apelido, sortable: true },
    { name: "Local", selector: (row) => row.local, sortable: true },
    { name: "Nº Relógio / Hidrômetro", selector: (row) => row.numero_relogio, sortable: true },
    { name: "Sub Nº Relógio", selector: (row) => row.sub_numero_relogio, sortable: true },
    { name: "Categoria Consumo", selector: (row) => row.categoria_consumo, sortable: true },
    { name: "Nome Proprietário", selector: (row) => row.nome_proprietario, sortable: true },
    { name: "CPF/CNPJ Proprietário", selector: (row) => row.cpf_cnpj_proprietario, sortable: true },
    { name: "Proprietário igual ao Proprietário Matrícula?", selector: (row) => row.mesmo_proprietario_matricula, sortable: true },
    { name: "Nome Titular/Consumidor", selector: (row) => row.nome_titular_consumidor, sortable: true },
    { name: "CPF/CNPJ Titular/Consumidor", selector: (row) => row.cpf_cnpj_titular_consumidor, sortable: true },
    { name: "Titular/Consumidor é o mesmo do Usuário/Locatário?", selector: (row) => row.mesmo_titular_usuario, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
    { name: "Débitos em Aberto?", selector: (row) => row.debitos_aberto, sortable: true },
    { name: "Valor Débitos em Aberto", selector: (row) => row.valor_debitos_aberto, sortable: true },
    { name: "Mês do Último Mês Competência", selector: (row) => row.mes_ultimo_competencia, sortable: true },
    { name: "Cadastro Atualizado?", selector: (row) => row.cadastro_atualizado, sortable: true },
    { name: "Observações", selector: (row) => row.observacoes, sortable: true },
  ];

  return (
    <div id="layoutSidenav_content">
       <div className="container-fluid px-4">
          <div className="row" ref={editRef}>
           
            <div className="col-md-6" ref={errorRef}>
            <h1   className="mt-4">
            <img 
              className="icone-title-serbom" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
              alt="Ícone Grupo Serbom" 
            /> Relógios de Energia
          </h1>
            </div>
            <div className="col-md-6">
            {isVisibleAdd && (
              <button type="submit" onClick={addIMovel} className="btn btn-primary btn-relative">
                  <FontAwesomeIcon icon={faPlus} /> Adicionar Relógio de Energia
                </button>
            )}
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
            <button type="submit" className="btn btn-primary mt-3">
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


        
      <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
          <div className="card-body">

             {/* Exibe a mensagem de erro caso exista */}
      {errors.apelido && (
        <div className="alert alert-danger mt-3">
          {errors.apelido}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4">
            <div className="form-floating select-complete">
            <Select
        onInputChange={handleInputChange} // Atualiza o valor enquanto o usuário digita
        onChange={handleChangeSelect} // Atualiza o estado com a opção selecionada
        options={options} // Passa as opções para o select
        isLoading={loadingSelect} // Exibe o indicador de carregamento
        placeholder="Digite o código de energia"
        noOptionsMessage={() => "Nenhuma opção encontrada"}
        isSearchable // Permite a busca
        getOptionLabel={(e) => `${e.label}`} // Personaliza o label exibido
        getOptionValue={(e) => e.value} // Personaliza o valor utilizado internamente
        className="form-control"
        loadingMessage={() => "Carregando..."} 
      />
      <label htmlFor="cod_matricula">Cód do Relógio de Energia </label>
      <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
        </div>
        <hr className="my-4"></hr>
        <div className="row">
      
          <div className="col-md-4">
<div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="apelido"
            name="apelido"
            value={formData.apelido}
            onChange={handleChange}
            placeholder="Apelido"
            required
          />
          <label htmlFor="apelido">Apelido <span className="red">*</span></label>
        </div>
</div>
<div className="col-md-4">
<div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="local"
            name="local"
            value={formData.local}
            onChange={handleChange}
            placeholder="Local"
            
          />
          <label htmlFor="local">Local</label>
        </div>
</div>
<div className="col-md-4">
<div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="numero_relogio"
            name="numero_relogio"
            value={formData.numero_relogio}
            onChange={handleChange}
            placeholder="Nº Relógio / Hidrômetro"
            
          />
          <label htmlFor="numero_relogio">Nº Relógio / Hidrômetro</label>
        </div>
</div>
<div className="col-md-4">
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="sub_numero_relogio"
            name="sub_numero_relogio"
            value={formData.sub_numero_relogio}
            onChange={handleChange}
            placeholder="Sub Nº Relógio"
            
          />
          <label htmlFor="sub_numero_relogio">Sub Nº Relógio</label>
        </div>
        </div>
        <div className="col-md-4">

<div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="categoria_consumo"
            name="categoria_consumo"
            value={formData.categoria_consumo}
            onChange={handleChange}
            placeholder="Categoria Consumo"
            
          />
          <label htmlFor="categoria_consumo">Categoria Consumo</label>
        </div>
</div>
       
        </div>
       


       

       <div className="row">
        <div className="col-md-4">
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="nome_proprietario"
            name="nome_proprietario"
            value={formData.nome_proprietario}
            onChange={handleChange}
            placeholder="Nome Proprietário"
            
          />
          <label htmlFor="nome_proprietario">Nome Proprietário</label>
        </div>
        </div>
        <div className="col-md-4">
<div className="form-floating mb-3">
        <InputMask
        mask={mascara}
        maskChar={null}
        value={formData.cpf_cnpj_proprietario}
        onChange={handleChange}
        name="cpf_cnpj_proprietario"
        placeholder="CPF/CNPJ Proprietário"
        className="form-control"
        
      />
      
      <label htmlFor="cpf_cnpj_proprietario">CPF/CNPJ Proprietário</label>
        </div>
  </div>      
  <div className="col-md-4">
        <div className="form-floating mb-3">
          <select
            className="form-select"
            id="mesmo_proprietario_matricula"
            name="mesmo_proprietario_matricula"
            value={formData.mesmo_proprietario_matricula}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <label htmlFor="mesmo_proprietario_matricula">Proprietário igual ao Proprietário Matrícula?</label>
        </div>
        </div>
   
       </div>




        

        
<div className="row">
  <div className="col-md-4">
  <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="nome_titular_consumidor"
            name="nome_titular_consumidor"
            value={formData.nome_titular_consumidor}
            onChange={handleChange}
            placeholder="Nome Titular/Consumidor"
            
          />
          <label htmlFor="nome_titular_consumidor">Nome Titular/Consumidor</label>
        </div>
  </div>
  <div className="col-md-4">
<div className="form-floating mb-3">
           <InputMask
        mask={mascara}
        maskChar={null}
        value={formData.cpf_cnpj_titular_consumidor}
        onChange={handleChange}
        name="cpf_cnpj_titular_consumidor"
   placeholder="CPF/CNPJ Titular/Consumidor"
        className="form-control"
        
      />
          <label htmlFor="cpf_cnpj_titular_consumidor">CPF/CNPJ Titular/Consumidor</label>
        </div>
</div>
<div className="col-md-4">
<div className="form-floating mb-3">
          <select
            className="form-select"
            id="mesmo_titular_usuario"
            name="mesmo_titular_usuario"
            value={formData.mesmo_titular_usuario}
            onChange={handleChange}
            
          >
            <option value="">Selecione</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <label htmlFor="mesmo_titular_usuario">Titular/Consumidor é o mesmo do Usuário/Locatário?</label>
        </div>

</div>
</div>
       


       
        <div className="row">
        <div className="col-md-4">
  <div className="form-floating mb-3">
          <select
           className="form-select"
           id="status"
           name="status"
           value={formData.status}
           placeholder="Status"
           
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Suspenso">Suspenso</option>
          </select>
          <label htmlFor="status">Status</label>
        </div>
  </div>
  <div className="col-md-4">
        <div className="form-floating mb-3">
          <select
            className="form-select"
            id="debitos_aberto"
            name="debitos_aberto"
            value={formData.debitos_aberto}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          <label htmlFor="debitos_aberto">Débitos em Aberto?</label>
        </div>
</div>
<div className="col-md-4">
    <div className="form-floating mb-3">
      <CurrencyInput
        className="form-control"
        value={formData.valor_debitos_aberto}
        onChangeValue={handleChange}
        placeholder=""
        id="valor_debitos_aberto"
        name="valor_debitos_aberto"
        
      />
      <label htmlFor="valor_debitos_aberto">Valor Débitos em Aberto</label>
    </div>
  </div>
        </div>
  
 
  

        

        <div className="row">
  

  <div className="col-md-4">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="mes_ultimo_competencia"
        name="mes_ultimo_competencia"
        value={formData.mes_ultimo_competencia}
        onChange={handleChange}
        placeholder="Mês do Último Mês Competência"
        
      />
      <label htmlFor="mes_ultimo_competencia">Mês do Último Mês Competência</label>
    </div>
  </div>

  <div className="col-md-4">
    <div className="form-floating mb-3">
      <select
        className="form-select"
        id="cadastro_atualizado"
        name="cadastro_atualizado"
        value={formData.cadastro_atualizado}
        onChange={handleChange}
        
      >
        <option value="">Selecione</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
      <label htmlFor="cadastro_atualizado">Cadastro Atualizado?</label>
    </div>
  </div>

  <div className="col-md-4">
    <div className="form-floating mb-3">
      <textarea
        className="form-control"
        id="observacoes"
        name="observacoes"
        value={formData.observacoes}
        onChange={handleChange}
        placeholder="Observações"
      />
      <label htmlFor="observacoes">Observações</label>
    </div>
  </div>
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

          
                  {showModalCod && (
                      <div className="modal fade show" style={{ display: 'block', paddingRight: '17px' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
            
                              <button type="button" className="btn-close" onClick={() => setShowModalCod(false)}></button>
                            </div>
                            <div className="modal-body">
                            Cód da Matrícula não encontrado
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" onClick={() => setShowModalCod(false)}> <FontAwesomeIcon icon={faCheck} /> OK</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

    </div>
    
  );
}

export default RelogiosEnergia;
