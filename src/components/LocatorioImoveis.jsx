import React, { useState, useEffect, useRef, useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// Certifique-se de carregar o módulo de exportação
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select'; // Importando o react-select
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faCopy, faPrint, faFilePdf, faSearch, faPlus, faFilter, faRightToBracket, faEnvelope, faFileExcel, faCheck, faFloppyDisk, faTrash, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from "jspdf"; // Importa o jsPDF
import "jspdf-autotable"; // Importa o plugin autotable
import { Alert } from "react-bootstrap";
import MaskedInput from 'react-text-mask';
import axios from "axios";

const LocatorioImoveis = () => {
  const [formData, setFormData] = useState({
    nomeLocatario: '',
    cpfCnpjLocatario: '',
    apelidoLocatario: '',
    nomeContato1: '',
    celularContato1: '',
    telefoneContato1: '',
    emailContato1: '',
    nomeContato2: '',
    celularContato2: '',
    telefoneContato2: '',
    emailContato2: '',
    nomeContato3: '',
    celularContato3: '',
    telefoneContato3: '',
    emailContato3: '',
    dataInicio: '',
    dataFim: '',
    cod_matricula: '',
    cod_locatario: '',
    apelido: '',
    local: '',
    observacoes: '',
    cpf: "",
    cnpj: "",
    razao_social: "",
    tipo_pessoa: "",
    data_fim_string : "",
    data_inicio_string : "",
    matriculasSelecionadas: []
  });

   // Validate the date
   const validateDate = (date) => {
    const [day, month, year] = date.split('/').map(Number);

    // Check if the date is in dd/mm/yyyy format
    if (
      day < 1 || day > 31 ||
      month < 1 || month > 12 ||
      year < 1900
    ) {
      return false;
    }

    // Check for valid date using JavaScript Date object
    const validDate = new Date(year, month - 1, day);
    return validDate.getDate() === day && validDate.getMonth() === month - 1 && validDate.getFullYear() === year;
  };

  const handleBlurCNPJ = () => {
    const cnpj = formData.cnpj;
      if (!validaCNPJ(cnpj)) {
        setErrorCNPJ('CNPJ inválido');
        setFormData({ ...formData, cnpj: '' });
      } else {
        setErrorCNPJ('');
      }
  };

  const validarTelefone1 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorTelefone1(validation.message);
      setFormData({ ...formData, telefoneContato1: '' });
    } else {
      setErrorTelefone1("");
    }
  };

  const validarTelefone2 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorTelefone2(validation.message);
      setFormData({ ...formData, telefoneContato2: '' });
    } else {
      setErrorTelefone2("");
    }
  };

  const validarTelefone3 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorTelefone3(validation.message);
      setFormData({ ...formData, telefoneContato3: '' });
    } else {
      setErrorTelefone3("");
    }
  };



  const validCelular1 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorCelular1(validation.message);
      setFormData({ ...formData, celularContato1: '' });
    } else {
      setErrorCelular1("");
    }
  };

  const validCelular2 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorCelular2(validation.message);
      setFormData({ ...formData, celularContato2: '' });
    } else {
      setErrorCelular2("");
    }
  };

  const validCelular3 = (e) => {
    const { name, value } = e.target;
    const validation = validarTelefone(value);
    if (!validation.isValid) {
      setErrorCelular3(validation.message);
      setFormData({ ...formData, celularContato3: '' });
    } else {
      setErrorCelular3("");
    }
  };


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

  const validEmail2 = (e) => {
    const { name, value } = e.target;
    const validation = validarEmail(value);
    if (!validation.isValid) {
      setError2(validation.message);
      setFormData({ ...formData, emailContato2: '' });
    } else {
      setError2("");
    }
  };


  const validEmail3 = (e) => {
    const { name, value } = e.target;
    const validation = validarEmail(value);
    if (!validation.isValid) {
      setError3(validation.message);
      setFormData({ ...formData, emailContato3: '' });
    } else {
      setError3("");
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


  const handleBlurCPF = () => {
    const cpf = formData.cpf;
      if (!validateCPF(cpf)) {
        setErrorCPF('CPF inválido');
        setFormData({ ...formData, cpf: '' });
      } else {
        setErrorCPF('');
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
  

    // Função para lidar com a mudança no campo de busca
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
  

  
      // Array de matrículas (simulando a tabela de matrículas)
      const matriculas = [
        { id: 1, nome: "MT367 - Apelido 3" },
        { id: 2, nome: "MT361 - Apelido 2" },
        { id: 3, nome: "MT363 - Apelido 3" },
        { id: 4, nome: "MT365 - Apelido 4" },
        { id: 5, nome: "MT364 - Apelido 5" },
        { id: 6, nome: "MT368 - Apelido 6" },
        { id: 7, nome: "MT369 - Apelido 7" },
        { id: 8, nome: "MT360 - Apelido 3" },
      ];
  // Estado para o campo de busca
  const [searchTerm, setSearchTerm] = useState("");



 const [tipoPessoa, setTipoPessoa] = useState('física'); 
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
  const errorRef = useRef(null);
  const editRef = useRef(null); 
  const [showModalCod, setShowModalCod] = useState(false);
  const [metrosFrente, setMetrosFrente] = useState('Não'); 
  const [geometria, setGeometria] = useState('Não');
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [rowsPerPage, setRowsPerPage] = useState(5); // Linhas por página 
  const [dataG, setDataG] = useState([]);
  const [totalCompra, setTotalCompra] = useState(null);
  const [loadingSelect, setLoadingSelect] = useState(false);
  const [inputValue, setInputValue] = useState(''); // Valor digitado pelo usuário
  const [optionsSelect, setOptions] = useState([]); 
  const [showModalCopy, setShowModalCopy] = useState(false);
  const [key, setKey] = useState(0); // Control re-render
  const [errorMatriculas, setErrorMatriculas] = useState(null);  // Error state for the API request
  const [matriculasData, setMatriculasData] = useState([]);  // State to store matriculas data
  const [loadingMatriculas, setLoadingMatriculas] = useState(true);  // Loading state for matriculas data
  const [errorCPF, setErrorCPF] = useState('');
  const [errorCNPJ, setErrorCNPJ] = useState('');
  const [errorDataInicio, setErrorDataInicio] = useState('');
  const [errorDataFim, setErrorDataFim] = useState('');
  const [errorEmail1, setError1] = useState('');
  const [errorEmail2, setError2] = useState('');
  const [errorEmail3, setError3] = useState('');
  const [errorCelular1, setErrorCelular1] = useState('');
  const [errorCelular2, setErrorCelular2] = useState('');
  const [errorCelular3, setErrorCelular3] = useState('');
  const [errorTelefone1, setErrorTelefone1] = useState('');
  const [errorTelefone2, setErrorTelefone2] = useState('');
  const [errorTelefone3, setErrorTelefone3] = useState('');
  

  const handleEdit = (row) => {
    setIsVisibleAdd(true);
    const matriculasSelecionadas = row.matriculasSelecionadas; // A string que você tem
    const arrayMatriculas = JSON.parse(matriculasSelecionadas);
    setFormData({
      ...row,
      matriculasSelecionadas: arrayMatriculas
    });
    setIsEditing(true);
    setEditingId(row.id);
    setTipoPessoa(row.tipo_pessoa);
    console.log(formData);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    clearValid();
  };

  function clearValid() {
    setErrorCPF('');
    setErrorCNPJ('');
    setErrorDataInicio('');
    setErrorDataFim('');
    setError1('');
    setError2('');
    setError3('');
    setErrorCelular1('');
    setErrorCelular2('');
    setErrorCelular3('');
  }


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
  

   // Função para mudar o tipo de pessoa (física ou jurídica)
   const handleTipoPessoaChange = (event) => {
    setTipoPessoa(event.target.value);
    formData.tipo_pessoa = event.target.value;
  };


  const gridMatriculas = async () => {
     // Replace with your actual API endpoint
     axios.get('https://api.williamvieira.tech/get_matriculas.php')
     .then((response) => {
       setMatriculasData(response.data);  // Update state with the fetched data
       setLoadingMatriculas(false);  // Set loading state to false once data is fetched
     })
     .catch((err) => {
       setErrorMatriculas(err.message);  // Set error state if there's an error during the fetch
       setLoadingMatriculas(false);  // Stop loading even if there's an error
     });
  }

    // Filtrar as matrículas com base no termo de busca
    const filteredMatriculas = matriculasData.filter((matricula) =>
      matricula.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const addIMovel = () => {

    setIsVisibleAdd(false);
    setIsEditing(false);
    reloadForm();
    setFormData({
      nomeLocatario: '',
      cpfCnpjLocatario: '',
      apelidoLocatario: '',
      nomeContato1: '',
      celularContato1: '',
      telefoneContato1: '',
      emailContato1: '',
      nomeContato2: '',
      celularContato2: '',
      telefoneContato2: '',
      emailContato2: '',
      nomeContato3: '',
      celularContato3: '',
      telefoneContato3: '',
      emailContato3: '',
      dataInicio: '',
      dataFim: '',
      cod_matricula: '',
      cod_locatario: '',
      apelido: '',
      local: '',
      observacoes: '',
      cpf: "",
      cnpj: "",
      razao_social: "",
      tipo_pessoa: "",
      data_fim_string : "",
      data_inicio_string : "",
      matriculasSelecionadas: []
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setKey((prevKey) => prevKey + 1); // Force re-render
    setTipoPessoa('física');
    clearValid();
  };

  function validarTelefone(telefone) {
    // Expressão regular para telefone fixo (ex: (11) 2345-6789) e celular (ex: (11) 91234-5678)
    const telefoneRegex = /^(?:\(\d{2}\)\s(?:9\d{4}-\d{4}|\d{4}-\d{4}))$/;
  
    if (!telefone.trim()) {
      return { isValid: false, message: 'O número não pode estar vazio.' };
    }
  
    if (!telefoneRegex.test(telefone)) {
      return { isValid: false, message: 'Por favor, insira um número válido.' };
    }
  
    return { isValid: true, message: 'número válido.' };
  }

   // Handle when the input loses focus
   const handleBlurDataFim = () => {
    const { data_fim_string } = formData;
    if (data_fim_string && !validateDate(data_fim_string)) {
      setErrorDataFim('Data inválida');
      setFormData({ ...formData, data_fim_string: '' });
    } else {
      setErrorDataFim('');
    }
  };

     // Handle when the input loses focus
     const handleBlurDataInicio = () => {
      const { data_inicio_string } = formData;
      if (data_inicio_string && !validateDate(data_inicio_string)) {
        setErrorDataInicio('Data inválida');

        setFormData({ ...formData, data_inicio_string: '' });

      } else {
        setErrorDataInicio('');
      }
    };
  

  const handleInputChange = (newInputValue) => {
    fetchOptions(newInputValue);
    setInputValue(newInputValue); // Atualiza o valor enquanto o usuário digita
  };


    // Função que busca as opções da API
 const fetchOptions = 
 async (searchQuery) => {
  
  setLoadingSelect(true);
  try {
    // Supondo que a API seja algo como: /api/matriculas?q=searchQuery
    const response = await axios.get(`https://api.williamvieira.tech/optionsLocatorio.php?q=${searchQuery}`);
    setOptions(response.data); // Ajuste conforme a estrutura da sua resposta da API
  } catch (error) {
    console.error('Erro ao buscar opções:', error);
  } finally {
    setLoadingSelect(false);
  }
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
  

const handleSearch1 = async (cod_locatario) => {
  try {
    const response = await fetch(`https://api.williamvieira.tech/codlocatorio.php?cod_locatario=${cod_locatario}`);
    const data = await response.json();
     // Se a consulta foi bem-sucedida, atualiza o estado com os dados retornados
     if (data.cod_locatario) {
      const matriculasSelecionadas = data.matriculasSelecionadas; // A string que você tem
      const arrayMatriculas = JSON.parse(matriculasSelecionadas); 
      setFormData({
        ...data,
        matriculasSelecionadas: arrayMatriculas
      });
      setIsVisibleAdd(true);
      setIsEditing(true);
      setEditingId(data.id);
      clearValid();
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } else {
      //setShowModalCod(true);
      setFormData({
        ...formData
      });
    }
  } catch (error) {
    //.error("Erro ao consultar API:", error);
    //alert("Erro ao buscar dados.");
  }
};

  // Handle form submit to fetch data
const handleSubmitSearch = (e) => {
  e.preventDefault();
  setLoading(true);

  const searchParams = new URLSearchParams(formData);
  const url = `https://api.williamvieira.tech/locatorio.php?${searchParams.toString()}`;
  
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



  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if(isVisible == true) {
      reloadGrid();
      formData.search_value = "";
    }
};


const handleSubmit = (e) => {

  console.log(JSON.stringify(formData));
    
  e.preventDefault();



  if(!formData.matriculasSelecionadas.length > 0) {
    setShowModalCod(true);
    return;
  }

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `https://api.williamvieira.tech/locatorio.php?id=${editingId}` : 'https://api.williamvieira.tech/locatorio.php';
  
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
    nomeLocatario: '',
    cpfCnpjLocatario: '',
    apelidoLocatario: '',
    nomeContato1: '',
    celularContato1: '',
    telefoneContato1: '',
    emailContato1: '',
    nomeContato2: '',
    celularContato2: '',
    telefoneContato2: '',
    emailContato2: '',
    nomeContato3: '',
    celularContato3: '',
    telefoneContato3: '',
    emailContato3: '',
    dataInicio: '',
    dataFim: '',
    cod_matricula: '',
    cod_locatario: '',
    apelido: '',
    local: '',
    observacoes: '',
    cpf: "",
    cnpj: "",
    razao_social: "",
    tipo_pessoa: "",
    data_fim_string : "",
    data_inicio_string : "",
    matriculasSelecionadas: []
  });
  reloadForm();
  setIsEditing(false);
} else {
  setIsEditing(true);
}
 

};


  // Estado para armazenar as matrículas selecionadas
  const [selectedMatriculas, setSelectedMatriculas] = useState([]);



  const handleCheckboxChange = (id) => {
    console.log(formData);
    setFormData((prevFormData) => {
      let matriculasSelecionadas = [...prevFormData.matriculasSelecionadas]; // Create a shallow copy
      if (matriculasSelecionadas.length === 0) {
        // If matriculasSelecionadas is empty, add the id
        matriculasSelecionadas.push(id);
      } else if (matriculasSelecionadas.includes(id)) {
        // If id is already in the array, remove it (uncheck)
        matriculasSelecionadas = matriculasSelecionadas.filter((item) => item !== id);
      } else {
        // If id isn't in the array, add it (check)
        matriculasSelecionadas.push(id);
      }
  
      return { ...prevFormData, matriculasSelecionadas };
    });
  };
  

  const reloadGrid = async () => {
    setLoading(true);
    try {
      // Aqui você pode substituir pela sua própria API
      const response = await axios.get('https://api.williamvieira.tech/locatorio.php');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTopParam = new URLSearchParams(location.search).get('top') === 'true';
  useEffect(() => {
    if (isTopParam) {
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTopParam]); // Re-run if the query parameter changes

  const handleDelete = () => {
    fetch(`https://api.williamvieira.tech/locatorio.php?id=${deletingId}`, { method: 'DELETE' })
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

  useEffect(() => {
    reloadGrid();
    fetchOptions('');
    gridMatriculas();
  }, []);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Imóveis");
        XLSX.writeFile(wb, "imoveis.xlsx");
      };

  const customStyles = {
    rows: {
      style: {
        fontSize: '14px', // Ajuste o tamanho da fonte
      },
    },
    headCells: {
      style: {
        fontSize: '14px', // Ajuste o tamanho da fonte dos cabeçalhos
      },
    },
  };

  const reloadForm = () => {

  }


  const logoUrl = 'https://imoveis.williamvieira.tech/teste.png';  // Image is inside the 'public' folder
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Cria um elemento de imagem para carregar o logo para ajuste automático
    const img = new Image();
    img.onload = function () {
      // Obter as dimensões da imagem
      const imgWidth = img.width;
      const imgHeight = img.height;
  
      // Calcular o fator de escala (ajustar a imagem para se encaixar em uma largura menor, por exemplo, 50 unidades)
      const maxWidth = 10; // Tornar o logo menor
      const scaleFactor = maxWidth / imgWidth;
      const scaledWidth = maxWidth;
      const scaledHeight = imgHeight * scaleFactor;
  
      // Adicionar a imagem ao PDF (com o tamanho escalado)
      doc.addImage(img, 'PNG', 100, 10, scaledWidth, scaledHeight); // x, y, largura, altura
  
      // Título em formato normal e fonte maior
      doc.setFont("Arial", "bold");
      doc.setFontSize(14); // Aumenta o tamanho do título para destacá-lo
      doc.text('Grupo Serbom - Locatário', 105, 25, { align: 'center' });
  
      // Adicionar nome do usuário em negrito e fonte menor
      const userName = localStorage.getItem('fullname'); // Exemplo de nome do usuário
      doc.setFont("Arial", "bold");
      doc.setFontSize(10); // Fonte menor para o nome do usuário
      doc.text(`Usuario: ${userName}`, 20, 30); // Adiciona o nome do usuário no canto superior esquerdo
  
      // Adicionar data e hora de geração em negrito e fonte menor
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('pt-BR'); // Formato de data brasileiro (dd/mm/aaaa)
      const formattedTime = currentDate.toLocaleTimeString('pt-BR'); // Hora no formato de 24 horas
      doc.text(`Data: ${formattedDate} - Hora: ${formattedTime}`, 150, 30); // Adiciona a data e hora no canto superior direito
  
      // Linha horizontal abaixo do título
      doc.setLineWidth(0.5);
      doc.line(20, 35, 201, 35); // Linha abaixo do título
  
      // Aumentar o yOffset para um espaço abaixo do título
      let yOffset = 45; // Este é o novo ponto de partida após o título e a linha
  
      const maxHeight = 270; // Altura máxima antes de ser necessária uma nova página
  
      // Função para formatar as chaves de objeto, substituindo os underscores por espaços e capitalizando as palavras
      const formatKey = (key) => {
        return key
          .replace(/_/g, ' ') // Substituir underscores por espaços
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalizar a primeira letra de cada palavra
      };
  
      Object.entries(formData).forEach(([key, value]) => {
        doc.setFont("Arial", "bold");
        doc.text(`${formatKey(key)}:`, 20, yOffset); // Chave formatada
  
        doc.setFont("Arial", "normal");
        doc.text(value || 'N/A', 90, yOffset); // Valor
  
        yOffset += 10;
  
        // Verificar se o conteúdo excede a altura da página
        if (yOffset > maxHeight) {
          doc.addPage();  // Inicia uma nova página
          yOffset = 10;   // Reinicia o yOffset para a nova página
        }
      });
  
      // Salvar o PDF gerado
      doc.save('Serbom Matrículas de Imóveis ' + formData.cod_matricula + ' - ' + formData.apelido);
    };
  
    // Definir a URL da imagem (isto dispara o carregamento da imagem)
    img.src = logoUrl;
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
    { name: "Cod Locatário", selector: (row) => row.cod_locatario, sortable: true },
    { name: "Nome Locatário", selector: (row) => row.nomeLocatario, sortable: true },
    { name: "CPF/CNPJ Locatário", selector: (row) => row.cpfCnpjLocatario, sortable: true },
    { name: "Apelido Locatário", selector: (row) => row.apelidoLocatario, sortable: true },
    { name: "Nome Contato 1", selector: (row) => row.nomeContato1, sortable: true },
    { name: "Celular Contato 1", selector: (row) => row.celularContato1, sortable: true },
    { name: "Telefone Contato 1", selector: (row) => row.telefoneContato1, sortable: true },
    { name: "Email Contato 1", selector: (row) => row.emailContato1, sortable: true },
    { name: "Nome Contato 2", selector: (row) => row.nomeContato2, sortable: true },
    { name: "Celular Contato 2", selector: (row) => row.celularContato2, sortable: true },
    { name: "Telefone Contato 2", selector: (row) => row.telefoneContato2, sortable: true },
    { name: "Email Contato 2", selector: (row) => row.emailContato2, sortable: true },
    { name: "Nome Contato 3", selector: (row) => row.nomeContato3, sortable: true },
    { name: "Celular Contato 3", selector: (row) => row.celularContato3, sortable: true },
    { name: "Telefone Contato 3", selector: (row) => row.telefoneContato3, sortable: true },
    { name: "Email Contato 3", selector: (row) => row.emailContato3, sortable: true },
    { name: "Data Início", selector: (row) => row.data_inicio_string, sortable: true },
    { name: "Data Fim", selector: (row) => row.data_fim_string, sortable: true },
    { name: "Pessoa", selector: (row) => row.tipo_pessoa, sortable: true },
    { name: "CPF", selector: (row) => row.cpf, sortable: true },
    { name: "CNPJ", selector: (row) => row.cnpj, sortable: true },
    { name: "Razão Social", selector: (row) => row.razao_social, sortable: true },
    { name: "Observações", selector: (row) => row.observacoes, sortable: true },
  ];
  

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
            /> Locatário
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
            </div>
          </div>
        </div>


       <div className="">
      <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
          <div className="card-body">
             {/* Exibe a mensagem de erro caso exista */}
      {errors.apelido && (
        <div className="alert alert-danger mt-3">
          {errors.apelido}
        </div>
      )}
        <div className="row">
          <div className="col-md-4">
            <div className="form-floating select-complete">
            <Select
            isClearable={true} // Enable the clear button
            value={optionsSelect.find(option => option.value === formData.cod_locatario)}
            key={key} // Change the key to force re-rende
            onInputChange={handleInputChange} // Atualiza o valor enquanto o usuário digita
            onChange={handleChangeSelect} // Atualiza o estado com a opção selecionada
            options={optionsSelect} // Passa as opções para o select
            isLoading={loadingSelect} // Exibe o indicador de carregamento
            placeholder="Digite o código Locatário"
            noOptionsMessage={() => "Nenhuma opção encontrada"}
            isSearchable // Permite a busca
            getOptionLabel={(e) => `${e.label}`} // Personaliza o label exibido
            getOptionValue={(e) => e.value} // Personaliza o valor utilizado internamente
            className="form-control"
            loadingMessage={() => "Carregando..."} 
      />
      <label htmlFor="cod_matricula">Cód Locatário </label>
      <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
          <div className="col-md-4">
          {isVisibleAdd && (
              <div type="submit" onClick={addIMovel} className="btn btn-light btn-relative">
                  <FontAwesomeIcon icon={faXmark} /> Limpar
                </div>
            )}
          </div>
          <div className="col-md-4">
            {isEditing ? <div className="btn btn-dark mb-3 btn-ged" onClick={generatePDF}><FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon> GED</div> : ''  }
          </div>
        </div>
        <hr className="my-4"></hr>
      <form onSubmit={handleSubmit}>
      <div className="row">
  {/* Matrícula */}


  
  {/* Apelido do Locatário */}
  <div className="col-md-6">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="apelidoLocatario"
        name="apelidoLocatario"
        value={formData.apelidoLocatario}
        onChange={handleChange}
        placeholder="Apelido do Locatário"
        required
      />
      <label htmlFor="apelidoLocatario">Apelido Usuário/Locatário <span className="red">*</span></label>
    </div>
  </div>


  {/* Nome do Locatário */}
  <div className="col-md-6">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="nomeLocatario"
        name="nomeLocatario"
        value={formData.nomeLocatario}
        onChange={handleChange}
        placeholder="Nome do Locatário"
      />
      <label htmlFor="nomeLocatario">Nome Usuário/Locatário</label>
      {errors.nomeLocatario && <small className="text-danger">{errors.nomeLocatario}</small>}
    </div>
  </div>


  
  </div>

  <div className="row">
    <div className="col-md-4">
        <div className="form-floating">
        <InputMask
             mask="99/99/9999"
             value={formData.data_inicio_string}
             onChange={handleChange}
             onBlur={handleBlurDataInicio}  // Validate when input loses focus
             placeholder="dd/mm/yyyy"
             className={`form-control ${errorDataInicio ? 'is-invalid' : ''}`}
             id="data_inicio_string"
             name="data_inicio_string"
             required
             
           />
      <label htmlFor="data_inicio_string">Data Início</label>
      {
                   errorDataInicio && 
                   <div className="invalid-feedback">{errorDataInicio}</div>
                   
                   }
        </div>
    </div>
    <div className="col-md-4">
   <div className="mb-3 form-floating">
       <InputMask
             mask="99/99/9999"
             value={formData.data_fim_string}
             onChange={handleChange}
             onBlur={handleBlurDataFim}  // Validate when input loses focus
             placeholder="dd/mm/yyyy"
             className={`form-control ${errorDataFim ? 'is-invalid' : ''}`}
             id="data_fim_string"
             name="data_fim_string"
             required
             
           />
                   <label htmlFor="data_fim_string">Data Fim </label>
                   {
                   errorDataFim && 
                   <div className="invalid-feedback">{errorDataFim}</div>
                   
                   }
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

  <div className="row">
            <label className="labelCheck"><b>Pessoa</b></label>
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
                
              />
              <label htmlFor="cpf">Informe o CPF</label>
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
                
              />
              <label htmlFor="razao_social">Razão Social</label>
            </div>
          )}

  <hr className="my-4"></hr>
<div className="row">
  <label className="mb-3"><b>Contato 1</b></label>
  {/* Contato 1 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="nomeContato1"
        name="nomeContato1"
        value={formData.nomeContato1}
        onChange={handleChange}
        placeholder="Nome Contato 1"
      />
      <label htmlFor="nomeContato1">Nome Contato 1</label>
    </div>
    </div>


  {/* Celular Contato 1 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 99999-9999"
        className={`form-control ${errorCelular1 ? 'is-invalid' : ''}`}
        id="celularContato1"
        name="celularContato1"
        value={formData.celularContato1}
        onChange={handleChange}
        onBlur={validCelular1}
        placeholder="Celular Contato 1"
      />
      <label htmlFor="celularContato1">Celular Contato 1</label>
      {errorCelular1 && <p style={{ color: 'red' }}>{errorCelular1}</p>}
    </div>
    
  </div>

  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 9999-9999"
        className={`form-control ${errorTelefone1 ? 'is-invalid' : ''}`}
        id="telefoneContato1"
        name="telefoneContato1"
        value={formData.telefoneContato1}
        onChange={handleChange}
        onBlur={validarTelefone1}
        placeholder="Telefone Contato 1"
      />
      <label htmlFor="telefoneContato1">Telefone Contato 1</label>
      {errorTelefone1 && <p style={{ color: 'red' }}>{errorTelefone1}</p>}
    </div>
    
  </div>

   {/* Email Contato 1 */}
   <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="email"
        id="emailContato1"
        name="emailContato1"
        value={formData.emailContato1}
        onChange={handleChange}
        onBlur={validEmail1}
        placeholder="E-mail Contato 1"
        className={`form-control ${errorEmail1 ? 'is-invalid' : ''}`}
      />
      <label htmlFor="emailContato1">E-mail Contato 1</label>
      {errorEmail1 && <p style={{ color: 'red' }}>{errorEmail1}</p>}

    </div>
  </div>
  </div>
  <hr className="my-4"></hr>
<div className="row">
  <label className="mb-3"><b>Contato 2</b></label>
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="nomeContato2"
        name="nomeContato2"
        value={formData.nomeContato2}
        onChange={handleChange}
        placeholder="Nome Contato 2"
      />
      <label htmlFor="nomeContato2">Nome Contato 2</label>
    </div>
    </div>

  {/* Celular Contato 2 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 99999-9999"
        className={`form-control ${errorCelular2 ? 'is-invalid' : ''}`}
        id="celularContato2"
        name="celularContato2"
        value={formData.celularContato2}
        onChange={handleChange}
        onBlur={validCelular2}
        placeholder="Celular Contato 2"
      />
      <label htmlFor="celularContato2">Celular Contato 2</label>
      {errorCelular2 && <p style={{ color: 'red' }}>{errorCelular2}</p>}
    </div>
  </div>

  {/* Telefone Contato 2 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 9999-9999"
        id="telefoneContato2"
        name="telefoneContato2"
        value={formData.telefoneContato2}
        onChange={handleChange}
        className={`form-control ${errorTelefone2 ? 'is-invalid' : ''}`}
        placeholder="Telefone Contato 2"
        onBlur={validarTelefone2}
      />
      <label htmlFor="telefoneContato2">Telefone Contato 2</label>
      {errorTelefone2 && <p style={{ color: 'red' }}>{errorTelefone2}</p>}
    </div>
  </div>

  {/* Email Contato 2 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="email"
        className={`form-control ${errorEmail2 ? 'is-invalid' : ''}`}
        id="emailContato2"
        name="emailContato2"
        value={formData.emailContato2}
        onChange={handleChange}
        onBlur={validEmail2}
        placeholder="E-mail Contato 2"
      />
      <label htmlFor="emailContato2">E-mail Contato 2</label>
      {errorEmail2 && <p style={{ color: 'red' }}>{errorEmail2}</p>}
    </div>
  </div>
</div>
<hr className="my-4"></hr>
<div className="row">
  <label className="mb-3"><b>Contato 3</b></label>
  {/* Contato 3 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="text"
        className="form-control"
        id="nomeContato3"
        name="nomeContato3"
        value={formData.nomeContato3}
        onChange={handleChange}
        placeholder="Nome Contato 3"
      />
      <label htmlFor="nomeContato3">Nome Contato 3</label>
    </div>
    
    </div>


  {/* Celular Contato 3 */}
  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 99999-9999"
        className={`form-control ${errorCelular3 ? 'is-invalid' : ''}`}
        id="celularContato3"
        name="celularContato3"
        value={formData.celularContato3}
        onChange={handleChange}
        onBlur={validCelular3}
        placeholder="Celular Contato 3"
      />
      <label htmlFor="celularContato3">Celular Contato 3</label>
      {errorCelular3 && <p style={{ color: 'red' }}>{errorCelular3}</p>}
    </div>
    
  </div>

  <div className="col-md-3">
    <div className="form-floating mb-3">
      <InputMask
        mask="(99) 9999-9999"
        className={`form-control ${errorTelefone3 ? 'is-invalid' : ''}`}
        id="telefoneContato3"
        name="telefoneContato3"
        value={formData.telefoneContato3}
        onChange={handleChange}
        placeholder="Telefone Contato 3"
        onBlur={validarTelefone3}
      />
      <label htmlFor="telefoneContato3">Telefone Contato 3</label>
      {errorTelefone3 && <p style={{ color: 'red' }}>{errorTelefone3}</p>}
    </div>
  </div>

   {/* Email Contato 3 */}
   <div className="col-md-3">
    <div className="form-floating mb-3">
      <input
        type="email"
        className={`form-control ${errorEmail3 ? 'is-invalid' : ''}`}
        id="emailContato3"
        name="emailContato3"
        value={formData.emailContato3}
        onChange={handleChange}
        onBlur={validEmail3}
        placeholder="E-mail Contato 3"
      />
      <label htmlFor="emailContato3">E-mail Contato 3</label>
      {errorEmail3 && <p style={{ color: 'red' }}>{errorEmail3}</p>}
    </div>

  </div>
  
  </div>


 
  
  <hr className="my-4"></hr>
  <div className="line-border">

  <div className="row">
  
  
  <label className="mb-3"><b>Matrículas</b> <span className="red">*</span></label>
  <div className="col-md-4">
    
    <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Pesquise por matrícula"
            /> 
             <label htmlFor="emailContato3">Buscar Matrícula</label>
               <FontAwesomeIcon icon={faSearch} />
          </div>
          </div>
          
  </div>



        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          {filteredMatriculas.length > 0 ? (
           
            filteredMatriculas.map((matricula) => (
              
              <div key={matricula.id} className="col mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`matricula-${matricula.id}`}
                    checked={formData.matriculasSelecionadas.includes(matricula.id)}
                    onChange={() => handleCheckboxChange(matricula.id)}
                  />
                  <label className="form-check-label" htmlFor={`matricula-${matricula.id}`}>
                    {matricula.name}
                  </label>
                </div>
              </div>
            ))
          ) : (
            <div className="row">
              <div className="col-md-12">
              <p className="ft12">Nenhuma matrícula encontrada.</p>
              </div>
            </div>
           
          )}
          </div>
          </div>

{/* Add more rows for other sections if necessary */}


       <div className="text-center">
                       <button type="submit" className="btn btn-success mt-3 mb-3">
                         {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faCheck} />} {isEditing ? "Salvar" : "Cadastrar" }
                       </button>
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

                      {showModalCod && (
                                <div className="modal fade show" style={{ display: 'block', paddingRight: '17px' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                  <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                      <div className="modal-header">
                      
                                        <button type="button" className="btn-close" onClick={() => setShowModalCod(false)}></button>
                                      </div>
                                      <div className="modal-body">
                                        Selecione uma Matrícula
                                      </div>
                                      <div className="modal-footer">
                                        <button type="button" className="btn btn-primary" onClick={() => setShowModalCod(false)}> <FontAwesomeIcon icon={faCheck} /> OK</button>
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

export default LocatorioImoveis;
