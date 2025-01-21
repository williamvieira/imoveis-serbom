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


const initialData = [];

function MatriculaImoveis() {

  const [showAlert, setShowAlert] = useState(false); 
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertVariant, setAlertVariant] = useState("success"); 
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleAdd, setIsVisibleAdd] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('física'); 
  const [metrosFrente, setMetrosFrente] = useState('Não'); 
  const [geometria, setGeometria] = useState('Não');
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [rowsPerPage, setRowsPerPage] = useState(5); // Linhas por página 
  const [dataG, setDataG] = useState([]);
  const [totalCompra, setTotalCompra] = useState(null);
  const [loadingSelect, setLoadingSelect] = useState(false);
  const [inputValue, setInputValue] = useState(''); // Valor digitado pelo usuário
  const [optionsSelect, setOptions] = useState([]); 
  const [key, setKey] = useState(0); // Control re-render

  const handleInputChange = (newInputValue) => {
    fetchOptions(newInputValue);
    setInputValue(newInputValue); // Atualiza o valor enquanto o usuário digita
  };



   // Handle the change of selected option
 const handleChangeSelect = (selectedOption) => {
  setFormData((prevFormData) => ({
    ...prevFormData,
    cod_matricula: selectedOption ? selectedOption.value : "", // Updating cod_matricula
  }));
  handleSearch1(selectedOption.value);
};

const handleSearch1 = async (value) => {
  try {

    
    const response = await fetch(`https://api.williamvieira.tech/codmatricula.php?cod_matricula=${value}`);
    const data = await response.json();

    ////console.log(data);

    // Se a consulta foi bem-sucedida, atualiza o estado com os dados retornados
    if (data.cod_matricula) {
      setFormData(data);
      setIsVisibleAdd(true);
      setFormData({
        ...data,
        valor_compra: formatCurrency(data.valor_compra)
      });
      setIsEditing(true);
      setEditingId(data.id);
      setErrorCPF(false);
      setErrorCEP(false);
      setErrorCNPJ(false);
      setErrorData(false);
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

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


  const [valor, setValor] = useState('');
  const formatarMoeda = (valor) => {
    // Remove qualquer caractere que não seja número
    let valorFormatado = valor.replace(/\D/g, '');
    
    // Formata o valor para o formato "R$ 200,00"
    valorFormatado = valorFormatado.replace(/(\d)(\d{8})$/, '$1.$2');
    valorFormatado = valorFormatado.replace(/(\d)(\d{5})$/, '$1.$2');
    valorFormatado = valorFormatado.replace(/(\d)(\d{2})$/, '$1,$2');

    // Adiciona o "R$" no início
    return `R$ ${valorFormatado}`;
  };

  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if(isVisible == true) {
      setFormData({
        search_value: "",
      });
      formData.search_value = "";
      reloadGrid();
      
    }
};


  const fetchData = async () => {
    try {
      const response = await fetch('https://api.williamvieira.tech/per-month.php');
      const result = await response.json();
      const formattedData = result.map(item => ({
        ...item,
        totalValue: parseFloat(item.totalValue) // Garantir que totalValue seja um float
      }));
      setDataG(formattedData); // Armazenar os dados no estado
      ////console.log(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };
 

  // Função que busca as opções da API
 const fetchOptions = async (searchQuery) => {
  
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

 

  const months = dataG.map(item => item.year); // Meses
  const values = dataG.map(item => item.totalValue); // Valores totais


  const options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Valor Compra por Ano'
    },
    xAxis: {
      categories: months, // Meses
      title: {
        text: 'Ano'
      }
    },
    yAxis: {
      title: {
        text: 'Valor Total (R$)'
      },
      allowDecimals: false
    },
    series: [
      {
        name: 'Valor Total',
        data: values, // Valores totais
        colorByPoint: true,
        colors: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#33FFFF', '#F4FF33'],
      }
    ],
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',
      pointFormat: '<span style="color:{point.color}">• </span>R$ {point.y}'
    },
    credits: {
      enabled: false // Desabilitar créditos do Highcharts
    },
    exporting: {
      enabled: true, // Habilitar exportação
      url: 'https://api.williamvieira.tech/chart.php', // URL to your custom proxy server
      buttons: {
        contextButton: {
          symbol: 'menu', // Ícone do menu
          menuItems: [
            'downloadXLS', // Export to Excel
            'downloadCSV', // Export to CSV
          ]
        }
      }
    },

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
    doc.text('Grupo Serbom - Matrículas de Imóveis', 105, 25, { align: 'center' });

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

const addIMovel = () => {
  setIsVisibleAdd(false);
  setIsEditing(false);
  reloadForm();
  setFormData({
    apelido: "",
    numero_matricula: "",
    cidade_registro: "",
    cartorio_registro: "",
    nome_proprietario: "",
    cpf: "",
    cnpj: "",
    razao_social: "",
    tipo_pessoa: "",
    area_terreno: "",
    geometria_regular: "",
    metros_frente: "",
    metros_de_frente: "",
    metros_fundo: "",
    metros_lado_direito: "",
    metros_lado_esquerdo: "",
    area_construida: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    data_compra: "",
    nome_vendedor: "",
    valor_compra: "",
    observacoes: ""
  });
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setOptions([]);
  setInputValue();
  setKey((prevKey) => prevKey + 1); // Force re-render
};

  const [formData, setFormData] = useState({
    apelido: "",
    tipo_pessoa: "",
    numero_matricula: "",
    cidade_registro: "",
    cartorio_registro: "",
    nome_proprietario: "",
    nome_proprietario_grupo: "",
    cpf: '',
    cnpj: '',
    razao_social: '',
    area_terreno: "",
    geometria_regular: "",
    metros_frente: "",
    metros_de_frente: "",
    metros_fundo: "",
    metros_lado_direito: "",
    metros_lado_esquerdo: "",
    area_construida: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    data_compra: "",
    data_compra_string: "",
    nome_vendedor: "",
    valor_compra: "",
    observacoes: "",
    search_value: ""

  });

  const [errors, setErrors] = useState({
    apelido: '',
    numero_matricula: '',
    cpf: '',
    cnpj: '',
    data_compra: ''
  });
  const [errorCEP, setErrorCEP] = useState('');
  const [errorCNPJ, setErrorCNPJ] = useState('');
  const [errorCPF, setErrorCPF] = useState('');
  const [errorData, setErrorData] = useState('');
  const errorRef = useRef(null); // Ref para o erro
  const editRef = useRef(null); // Ref para o erro
  
  const [isPessoaJuridica, setIsPessoaJuridica] = useState(false);

  const getMask = (value) => {
    return value.length <= 14 ? "999.999.999-99" : "99.999.999/9999-99";
  };
  
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
  
    // Handle when the input loses focus
    const handleBlurData = () => {
      const { data_compra_string } = formData;
      if (data_compra_string && !validateDate(data_compra_string)) {
        setErrorData('Data inválida');
        setFormData({ ...formData, data_compra_string: '' });
      } else {
        setErrorData('');
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
  
  const handleBlurCPF = () => {
    const cpf = formData.cpf;
      if (!validateCPF(cpf)) {
        setErrorCPF('CPF inválido');
        setFormData({ ...formData, cpf: '' });
      } else {
        setErrorCPF('');
      }
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

  const [data, setData] = useState(initialData);
  const [responseMessage, setResponseMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModalCod, setShowModalCod] = useState(false);
  const [showModalCopy, setShowModalCopy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [cidades, setCidades] = useState([]);  // Novo estado para armazenar cidades

  useEffect(() => {
    reloadGrid();
    reloadForm();
    fetchData();
    fetchOptions('');
  }, []);


  const reloadForm = () => {
    setTipoPessoa('física');
    setGeometria('Não');
    setMetrosFrente('Não');
    formData.tipo_pessoa = "física";
    formData.geometria_regular = "Não";
    formData.metros_frente = "Não";
  }

  const reloadGrid = () => {
    setLoading(true);
      fetch("https://api.williamvieira.tech/imoveis.php")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error('Erro ao carregar dados:', error));
        setLoading(false);
        fetchTotalCompra();
  }

// Função para atualizar o valor no estado
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'valor_compra') {
    const valorFormatado = formatarMoeda(value);
    setFormData({
      ...formData,
      [name]: valorFormatado,
    });
  } else {
    setFormData({
      ...formData,
      [name]: value,
    });
  }
};
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submit to fetch data
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    setLoading(true);


    // ////console.log('william');
    // const valorFormatado = formatarMoeda(formData.valor_compra);
    // setFormData({
    //   ...formData,
    //   valor_compra: valorFormatado
    // });
    
    

    const searchParams = new URLSearchParams(formData);
    const url = `https://api.williamvieira.tech/imoveis.php?${searchParams.toString()}`;
    
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

      fetchTotalCompra();
  };
  

  const handleSubmit = (e) => {
    
    e.preventDefault();

    console.log(formData);
    console.log("arrumar");
    console.log(formData);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `https://api.williamvieira.tech/imoveis.php?id=${editingId}` : 'https://api.williamvieira.tech/imoveis.php';
    const teste = JSON.stringify(formData);
    console.log(teste);
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: teste
    })
    .then((response) => response.json())
    .then((data) => {
      setAlertMessage(data.message); // Mensagem de sucesso
      setAlertVariant("success"); // Tipo de alerta
      setShowAlert(true);
      reloadGrid();
    })
    .catch((error) => {
      setAlertMessage('Erro ao salvar o imóvel'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (method === 'POST') {
    setFormData({
      apelido: "",
      numero_matricula: "",
      cidade_registro: "",
      cartorio_registro: "",
      nome_proprietario: "",
      cpf: "",
      cnpj: "",
      razao_social: "",
      tipo_pessoa: "",
      area_terreno: "",
      geometria_regular: "",
      metros_frente: "",
      metros_de_frente: "",
      metros_fundo: "",
      metros_lado_direito: "",
      metros_lado_esquerdo: "",
      area_construida: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      data_compra: "",
      data_compra_string: "",
      nome_vendedor: "",
      valor_compra: "",
      observacoes: ""
    });
    reloadForm();
    setIsEditing(false);
  } else {
    setIsEditing(true);
  }

  setTimeout(() => fetchData(), 1000);
  setTimeout(() => fetchOptions(''), 1000);
   
  };

  const handleEdit = (row) => {
    setIsVisibleAdd(true);
    setFormData({
      ...row,
      valor_compra: formatCurrency(row.valor_compra)
    });
    setIsEditing(true);
    setEditingId(row.id);
    setErrorCPF(false);
    setErrorCEP(false);
    setErrorCNPJ(false);
    setErrorData(false);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log("editar");
    console.log(formData);
  };

  const handleDelete = () => {
    fetch(`https://api.williamvieira.tech/imoveis.php?id=${deletingId}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((data) => {
        ////console.log(data);
        reloadGrid();
        setAlertMessage(data.message); // Mensagem de sucesso
        setAlertVariant("success"); // Tipo de alerta
        setShowAlert(true);
        setShowDeleteModal(false);
        editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });


      
      setFormData({
        apelido: "",
        numero_matricula: "",
        cidade_registro: "",
        cartorio_registro: "",
        nome_proprietario: "",
        cpf: "",
        cnpj: "",
        razao_social: "",
        tipo_pessoa: "",
        area_terreno: "",
        geometria_regular: "",
        metros_frente: "",
        metros_de_frente: "",
        metros_fundo: "",
        metros_lado_direito: "",
        metros_lado_esquerdo: "",
        area_construida: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        data_compra: "",
        nome_vendedor: "",
        valor_compra: "",
        observacoes: ""
      });
      reloadForm();
      setIsEditing(false);

      setTimeout(() => fetchData(), 1000);
      setTimeout(() => fetchOptions(''), 1000);
      setTimeout(() => reloadGrid(), 1000);

  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Imóveis");
    XLSX.writeFile(wb, "imoveis.xlsx");
  };
  
  const handleCEP = (e) => {
    const cep = e.target.value;
    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.erro) {
            setFormData({
              ...formData,
              cep: data.cep.replace("-", ""),
              endereco: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf
            });
            setErrorCEP('');
          } else {
            setFormData({
              ...formData,
              cep: "",
              endereco: "",
              bairro: "",
              cidade: "",
              uf: ""
            });
            setErrorCEP('CEP inválido');
          }
        })
        .catch((error) => console.error('Erro ao buscar o CEP:', error));
    } else {
      setFormData({
        ...formData,
        cep: "",
        endereco: "",
        bairro: "",
        cidade: "",
        uf: ""
      });
      setErrorCEP('CEP inválido');
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
      width: "125px",
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
      width: "125px",
    },
    { "name": "Cod da Matrícula", "selector": (row) => row.cod, "sortable": true },
    { "name": "Apelido", "selector": (row) => row.apelido, "sortable": true },
    { "name": "Número da Matrícula", "selector": (row) => row.numero_matricula, "sortable": true },
    { "name": "Cidade de Registro", "selector": (row) => row.cidade_registro, "sortable": true },
    { "name": "Cartório Registro", "selector": (row) => row.cartorio_registro, "sortable": true },
    { "name": "Nome Proprietário", "selector": (row) => row.nome_proprietario, "sortable": true },
    { "name": "Nome Proprietário (Grupo)", "selector": (row) => row.nome_proprietario_grupo, "sortable": true },
    { "name": "Tipo de Pessoa", "selector": (row) => row.tipo_pessoa, "sortable": true },
    { "name": "CPF", "selector": (row) => row.cpf, "sortable": true },
    { "name": "CNPJ", "selector": (row) => row.cnpj, "sortable": true },
    { "name": "Razão Social", "selector": (row) => row.razao_social, "sortable": true },
    { "name": "Área do Terreno", "selector": (row) => row.area_terreno, "sortable": true },
    { "name": "Geometria Regular", "selector": (row) => row.geometria_regular, "sortable": true },
    { "name": "Metros de Frente", "selector": (row) => row.metros_frente, "sortable": true },
    { "name": "Metros de Fundo", "selector": (row) => row.metros_fundo, "sortable": true },
    { "name": "Metros Lado Direito", "selector": (row) => row.metros_lado_direito, "sortable": true },
    { "name": "Metros Lado Esquerdo", "selector": (row) => row.metros_lado_esquerdo, "sortable": true },
    { "name": "Área Construída", "selector": (row) => row.area_construida, "sortable": true },
    { "name": "CEP", "selector": (row) => row.cep, "sortable": true },
    { "name": "Endereço", "selector": (row) => row.endereco, "sortable": true },
    { "name": "Número", "selector": (row) => row.numero, "sortable": true },
    { "name": "Complemento", "selector": (row) => row.complemento, "sortable": true },
    { "name": "Bairro", "selector": (row) => row.bairro, "sortable": true },
    { "name": "Cidade", "selector": (row) => row.cidade, "sortable": true },
    { "name": "UF", "selector": (row) => row.uf, "sortable": true },
    { "name": "Data de Compra", "selector": (row) => row.data_compra_string, "sortable": true },
    { "name": "Nome do Vendedor", "selector": (row) => row.nome_vendedor, "sortable": true },
    {
      name: (
        <div>
          Valor da Compra
          <br />
          <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
            Total: {formatCurrency(totalCompra)}
          </span>
        </div>
      ),
      selector: (row) => formatCurrency(row.valor_compra),
      sortable: true,
      width: "200px"
    },
    { "name": "Observações", "selector": (row) => row.observacoes, "sortable": true }
  ];

      const fetchTotalCompra = async () => {
        try {
          if(formData.search_value == undefined) {
            formData.search_value = "";
          }
          var url = 'https://api.williamvieira.tech/imoveis.php?search_value=' + formData.search_value;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          ////console.log('william');
          ////console.log(url);
          ////console.log(data);
  
          // Map the response data to extract total_valor_compra as a float
          const formattedData = data.map(item => ({
            totalValue: parseFloat(item.total_valor_compra) || 0, // Ensure it's a float or fallback to 0
          }));

          // Optionally, you can display the first item for testing
          if (formattedData.length > 0) {
            var va = formattedData[0].totalValue;
            setTotalCompra(va); 
          }
        } catch (error) {
          console.error('Error fetching totalCompra:', error);
          alert('Error fetching data. Please try again later.');
        }
      };
  
     


  

   // Função para mudar o tipo de pessoa (física ou jurídica)
   const handleTipoPessoaChange = (event) => {
    setTipoPessoa(event.target.value);
    formData.tipo_pessoa = event.target.value;
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

    // Função para mudar o tipo de pessoa (física ou jurídica)
    const handleMetrosFrente = (event) => {
      setMetrosFrente(event.target.value);
      formData.metros_frente = event.target.value;
    };

    const handleGeometria = (event) => {
      setGeometria(event.target.value);
      setMetrosFrente(event.target.value);
      formData.geometria_regular = event.target.value;
    };

  return (
    <div id="layoutSidenav_content">
      <main >
        <div className="container-fluid px-4">
          <div className="row">
            <div className="col-md-6" ref={errorRef}>
            <h1  ref={editRef}   className="mt-4" >
            <img 
              className="icone-title-serbom" 
              src="https://gruposerbom.com.br/wp-content/uploads/2021/10/icone_gruposerbom.png" 
              alt="Ícone Grupo Serbom" 
            /> Matrículas de Imóveis
          </h1>
            </div>
            <div className="col-md-6">
         
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
            isClearable={true} // Enable the clear button
            value={optionsSelect.find(option => option.value === formData.cod_matricula)}
            key={key} // Change the key to force re-rende
            onInputChange={handleInputChange} // Atualiza o valor enquanto o usuário digita
            onChange={handleChangeSelect} // Atualiza o estado com a opção selecionada
            options={optionsSelect} // Passa as opções para o select
            isLoading={loadingSelect} // Exibe o indicador de carregamento
            placeholder="Digite o código da Matrícula"
            noOptionsMessage={() => "Nenhuma opção encontrada"}
            isSearchable // Permite a busca
            getOptionLabel={(e) => `${e.label}`} // Personaliza o label exibido
            getOptionValue={(e) => e.value} // Personaliza o valor utilizado internamente
            className="form-control"
            loadingMessage={() => "Carregando..."} 
      />
      <label htmlFor="cod_matricula">Cód da Matrícula </label>
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
              <div className="row">
          <div className="col-md-4">
          <div className="mb-3 form-floating">
                <input
                  type="text"
                 className="form-control"
                  id="apelido"
                  name="apelido"
                  value={formData.apelido}
                  onChange={handleChange}
                  placeholder="Informe o apelido do imóvel"
                  required
                />
                <label htmlFor="apelido">Apelido <span className="red">*</span></label>
              </div>
          </div>
          <div className="col-md-4">
          <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="numero_matricula"
                  name="numero_matricula"
                  value={formData.numero_matricula}
                  onChange={handleChange}
                  placeholder="Informe o número da matrícula"
                  
                />
                <label htmlFor="numero_matricula">Número da Matrícula </label>
              </div>
          </div>
          <div className="col-md-4">  
          <div className="mb-3 form-floating">
                <select
                  className="form-select "
                  id="cidade_registro"
                  name="cidade_registro"
                  value={formData.cidade_registro}
                  onChange={handleChange}
                  
                >
                  <option value="">Selecione a Cidade</option>
                  <option value="Campinas">Campinas</option>
                  <option value="Guaruja">Guaruja</option>
                  <option value="Itapeva">Itapeva</option>
                  <option value="São Carlos">São Carlos</option>
                  <option value="Valinhos">Valinhos</option>
                </select>
                <label htmlFor="cidade_registro">Cidade de Registro</label>
              </div>
          </div>
          <div className="col-md-4">
          <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="cartorio_registro"
                  name="cartorio_registro"
                  value={formData.cartorio_registro}
                  onChange={handleChange}
                  placeholder="Informe o cartório de registro"
                  
                />
                <label htmlFor="cartorio_registro">Cartório Registro</label>
              </div>
          </div>
          <div className="col-md-4">
          <div className="mb-3 form-floating">
                <select
                  className="form-select "
                  id="nome_proprietario"
                  name="nome_proprietario"
                  value={formData.nome_proprietario}
                  onChange={handleChange}
                  
                >
                  <option value="">Selecione o Proprietário</option>
                  <option value="VS">VS</option>
                </select>
                <label htmlFor="nome_proprietario">Nome Proprietário</label>
              </div>
        </div>
        <div className="col-md-4">
        <div className="mb-3 form-floating">
                <select
                  className="form-select "
                  id="nome_proprietario_grupo"
                  name="nome_proprietario_grupo"
                  value={formData.nome_proprietario_grupo}
                  onChange={handleChange}
                >
                  <option value="">Selecione o Grupo de Proprietário</option>
                  <option value="Serbom">Grupo Serbom</option>
                </select>
                <label htmlFor="nome_proprietario">Grupo Proprietário</label>
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
      
<div className="row">
<div className="col-md-4">
            <div className="mb-3 form-floating">
            <input
        type="text"
        className={`form-control ${errorCEP ? 'is-invalid' : ''}`}
        id="cep"
        maxLength={8}
        name="cep"
        value={formData.cep}  // O valor do input é controlado pelo estado
        onChange={(e) => {
          handleChange(e);  // Atualiza o estado
        }}
        onBlur={(e) => {handleCEP(e) }}
        placeholder="Informe o CEP"
        
      />
                <label htmlFor="cep">CEP</label>
                {errorCEP && <div className="invalid-feedback">CEP inválido!</div>}
              </div>
          </div>
          <div className="col-md-4">
          <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Informe o endereço"
                  
                />
                <label htmlFor="endereco">Endereço</label>
                
              </div>
         </div>
         <div className="col-md-2">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  
                />
                <label htmlFor="numero">Número</label>
              </div>
  </div>
  <div className="col-md-2">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                />
                <label htmlFor="numero">Complemento</label>
              </div>
  </div>
</div>

<div className="row">
  <div className="col-md-4">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Informe o bairro"
                  
                />
                <label htmlFor="bairro">Bairro</label>
              </div>
  </div>
  <div className="col-md-4">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Informe a cidade"
                  
                />
                <label htmlFor="cidade">Cidade</label>
              </div>
    </div>
    <div className="col-md-4">
    <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="uf"
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  placeholder="Informe o UF"
                  
                />
                <label htmlFor="uf">UF</label>
              </div>
    </div>
    <div className="col-md-4">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="nome_vendedor"
                  name="nome_vendedor"
                  value={formData.nome_vendedor}
                  onChange={handleChange}
                  placeholder="Nome Vendedor"
                  
                />
                <label htmlFor="nome_vendedor">Nome Vendedor</label>
              </div>
    </div>
    <div className="col-md-4">
    <div className="mb-3 form-floating">
    <InputMask
          mask="99/99/9999"
          value={formData.data_compra_string}
          onChange={handleChange}
          onBlur={handleBlurData}  // Validate when input loses focus
          placeholder="dd/mm/yyyy"
          className={`form-control ${errorData ? 'is-invalid' : ''}`}
          id="data_compra_string"
          name="data_compra_string"
          
          
        />
                <label htmlFor="data_compra_string">Data Compra </label>
                {
                errorData && 
                <div className="invalid-feedback">{errorData}</div>
                
                }
              </div>
              
    </div>
    <div className="col-md-4">
    <div className="mb-3 form-floating">
   <input
     id="valor_compra"
     name="valor_compra"
     type="text"
     value={formData.valor_compra}
     onChange={handleChange}
     placeholder="Digite o valor"
      className="form-control"
      
      />
              <label htmlFor="valor_compra">Valor Compra </label>
              </div>
    </div>
    <div className="col-md-12">
  <div className="mb-3 form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Nome Vendendor"
                />
                <label htmlFor="observacoes">Observações</label>
              </div>
    </div>
</div>
<div className="row">
<div className="col-md-6">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="area_terreno"
        name="area_terreno"
        value={formData.area_terreno}
        onChange={handleChange}
        placeholder="Área Terreno (m²)"
        type="number"
        
      />
                <label htmlFor="area_terreno">Área Terreno (m2)</label>
              </div>
    </div>
    <div className="col-md-6">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="area_construida"
        name="area_construida"
        value={formData.area_construida}
        onChange={handleChange}
        placeholder="Área Construída (m2)"
        type="number"
        
      />
                <label htmlFor="area_construida">Área Construída (m2)</label>
              </div>
    </div>
</div>


<div className="row">
            <div className="col-md-12 mb-3">
            <label className="labelCheck"><b>Geometria Regular</b></label>
<div className="form-check form-check-inline">
<input
            type="radio"
            className="form-check-input"
            id="geometriaRegular1"
            name="geometriaRegular"
            value='Não'
            checked={metrosFrente === 'Não'}
            onChange={handleGeometria}
          />
          <label className="form-check-label" htmlFor="geometriaRegular1">Não</label>
        </div>
        <div className="form-check form-check-inline">
        
          <input
            type="radio"
            className="form-check-input"
            id="geometriaRegular2"
            name="geometriaRegular"
            value='Sim'
            checked={metrosFrente === 'Sim'}
            onChange={handleGeometria}
          />
          <label className="form-check-label" htmlFor="geometriaRegular2">Sim</label>
        </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3 none">
            <label className="labelCheck"><b>Metros de Frente</b></label>
<div className="form-check form-check-inline">
<input
            type="radio"
            className="form-check-input"
            id="metrosFrenteNao"
            name="metrosFrente"
            value="Não"
            checked={metrosFrente === 'Não'}
            onChange={handleMetrosFrente}
          />
          <label className="form-check-label" htmlFor="metrosFrenteNao">Não</label>
        </div>
        <div className="form-check form-check-inline">
        
          <input
            type="radio"
            className="form-check-input"
            id="metrosFrenteSim"
            name="metrosFrente"
            value="Sim"
            checked={metrosFrente === 'Sim'}
            onChange={handleMetrosFrente}
          />
          <label className="form-check-label" htmlFor="metrosFrenteSim">Sim</label>
        </div>
            </div>
          </div>


          {metrosFrente == 'Sim' && (
<div className="row">
<div className="col-md-3">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_de_frente"
        name="metros_de_frente"
        value={formData.metros_de_frente}
        onChange={handleChange}
        placeholder="Metros de Frente"
        type="number"
        
      />
                <label htmlFor="metros_fundo">Metros de Frente (m2)</label>
              </div>
  </div>
  <div className="col-md-3">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_fundo"
        name="metros_fundo"
        value={formData.metros_fundo}
        onChange={handleChange}
        placeholder="Metros de Fundo"
        type="number"
        
      />
                <label htmlFor="metros_fundo">Metros de Fundo (m2)</label>
              </div>
  </div>
  <div className="col-md-3">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_lado_direito"
        name="metros_lado_direito"
        value={formData.metros_lado_direito}
        onChange={handleChange}
        placeholder="Metros Lado Direito"
        type="number"
        
      />
                <label htmlFor="metros_lado_direito">Metros Lado Direito (m2)</label>
              </div>
  </div>
  <div className="col-md-3">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_lado_esquerdo"
        name="metros_lado_esquerdo"
        value={formData.metros_lado_esquerdo}
        onChange={handleChange}
        placeholder="Metros Lado Direito"
        type="number"
        
      />
                <label htmlFor="metros_lado_esquerdo">Metros Lado Esquerdo (m2)</label>
              </div>
  </div>
</div>
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
        <HighchartsReact highcharts={Highcharts} options={options} />
</div>
</div>
        
        <footer className="py-4 bg-light mt-auto footerInterno">
            <div className="container-fluid px-4">
                <div className="text-center">
                    <div className="text-muted text-center">© 2024 - Grupo Serbom. Todos os direitos reservados.</div>
                </div>
            </div>
        </footer>
      </main>
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
         {/* Modal de Confirmação de Exclusão */}
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
}

export default MatriculaImoveis;
