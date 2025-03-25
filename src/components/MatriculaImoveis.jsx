import React, { useState, useEffect, useRef, useMemo, useCallback  } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select'; // Importando o react-select
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faCopy, faPrint, faFilePdf, faSearch, faPlus, faFilter, faRightToBracket, faEnvelope, faFileExcel, faCheck, faFloppyDisk, faTrash, faPenToSquare, faXmark, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from "jspdf"; // Importa o jsPDF
import "jspdf-autotable"; // Importa o plugin autotable
import { Alert } from "react-bootstrap";
import MaskedInput from 'react-text-mask';
import axios from "axios";
import { unset } from "lodash";
import logEvent from '../logEvent';
import GED from "./GED";
import debounce from 'lodash.debounce';
import { useLocation } from "react-router-dom";

const initialData = [];

function MatriculaImoveis() {

  
  const locationLog = useLocation();
  
  const fullname = localStorage.getItem("fullname");
  const module = 'matriculas';
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


  
const [dataHistory, setDataHistory] = useState([]);
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
  const [cities, setCities] = useState([]);
  const [cartorios, setCartorios] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);
  const [optionsLocal, setOptionsLocal] = useState([]); // Store fetched options
  const [selectedOptions, setSelectedOptions] = useState([]); // Store selected options
  const [keyGED, setKeyGED] = useState(0);

  const formatDateToBR = (dateString) => {
  const date = new Date(dateString);

  // Use toLocaleString to format the date in Brazilian format
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24-hour time format
  };

  return date.toLocaleString('pt-BR', options).replace(',', ''); ;
};


    // Handle change in multi-select
    const handleSelectChange = (selectedOptions) => {
      // Update formData with the selected options
      setFormData({
        ...formData,
        local: selectedOptions, 
      });
    };

  const handleInputChangeCod = (newInputValue) => {
    fetchOptions(newInputValue);
    setInputValue(newInputValue); 
  };

    // Função para atualizar o estado de 'formData' enquanto o usuário digita
    const handleInputChange = (e) => {
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
      const url = `https://api.williamvieira.tech/imoveis.php?${searchParams.toString()}`;
  
      try {

        const response = await fetch(url);
        const data = await response.json();
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

  useEffect(() => {
    axios
      .get("https://api.williamvieira.tech/cidade.php")
      .then((response) => {
        const sortedCities = response.data.sort((a, b) => {
          return a.nome.localeCompare(b.nome);
        });
        setCities(sortedCities); 
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch cities."); 
        setLoading(false);
      });
      axios
      .get("https://api.williamvieira.tech/cartorio.php")
      .then((response) => {
        const sortedCartorios = response.data.sort((a, b) => {
          return a.nome.localeCompare(b.nome);
        });
        setCartorios(sortedCartorios);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch cities."); 
        setLoading(false); 
      });
      axios
      .get("https://api.williamvieira.tech/local.php")
      .then((response) => {
        const apiOptions = response.data.map(item => ({
          value: item.id, 
          label: item.nome,
        }));
        setOptionsLocal(apiOptions); 
        setLoading(false); 
      })
      .catch((error) => {
        setError("Failed to fetch cities."); 
        setLoading(false); 
      });
      axios
      .get("https://api.williamvieira.tech/proprietarios.php")
      .then((response) => {
        const sortedCartorios = response.data.sort((a, b) => {
          return a.nome.localeCompare(b.nome);
        });
        setProprietarios(sortedCartorios); 
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch cities.");
        setLoading(false);
      });
  
  }, []);


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

    if (data.cod_matricula) {
      setIsVisibleAdd(true);
      const metros_fundo = data.metros_fundo;
      const metros_lado_direito = data.metros_lado_direito;
      const metros_lado_esquerdo = data.metros_lado_esquerdo;
      const metros_de_frente = data.metros_de_frente;
      const area_terreno = data.area_terreno;
      const area_construida = data.area_construida;
      localStorage.setItem("register_id", data.cod);
      setFormData({
        ...data,
        valor_compra: formatCurrency(data.valor_compra),
        valor_compra_contrato: formatCurrency(data.valor_compra_contrato),
        metros_fundo: metros_fundo,
        metros_lado_direito: metros_lado_direito,
        metros_lado_esquerdo: metros_lado_esquerdo,
        metros_de_frente: metros_de_frente,
        area_terreno: area_terreno,
        area_construida: area_construida
      });
      setMetrosFrente(data.geometria_regular);
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
    alert("Erro ao buscar dados teste.");
  }
};


const handleSearchProprietario = async (value) => {
  try {

    // alert(value);
    const response = await fetch(`https://api.williamvieira.tech/codproprietarios.php?cod_proprietario=${value}`);
    const data = await response.json();

    console.log("busca");
    console.log(data);

    // Se a consulta foi bem-sucedida, atualiza o estado com os dados retornados
    if (data.nome) {
      setFormData({
        ...formData,
        nome_proprietario : data.nome,
        nome_proprietario_grupo : data.nome_proprietario_grupo,
        tipo_pessoa : data.tipo_pessoa,
        cpf : data.cpf,
        cnpj: data.cnpj,
        razao_social : data.razao_social
      });
      setTipoPessoa(data.tipo_pessoa);
      console.log("william");
      console.log(formData);
    } else {
      setFormData({
        ...formData,
        nome_proprietario : "",
        nome_proprietario_grupo : "",
        tipo_pessoa : "",
        cpf : "",
        cnpj: "",
        razao_social : ""
      });
      setTipoPessoa('física');
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


  const formatarArea = (valor) => {
    // Remove qualquer caractere que não seja número
    let valorFormatado = valor.replace(/\D/g, '');
    
    // Formata o valor para o formato "R$ 200,00"
    valorFormatado = valorFormatado.replace(/(\d)(\d{8})$/, '$1.$2');
    valorFormatado = valorFormatado.replace(/(\d)(\d{5})$/, '$1.$2');
    valorFormatado = valorFormatado.replace(/(\d)(\d{2})$/, '$1,$2');

    // Adiciona o "R$" no início
    return `${valorFormatado}`;
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

 

  const months = dataG.map(item => item.year); 
  const values = dataG.map(item => item.totalValue); 

  const options = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Valor Compra Contrato por Ano'
    },
    xAxis: {
        categories: months, 
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
            pointWidth: 35, // Ajusta a largura das colunas
        }
    ],
    plotOptions: {
        column: {
            borderRadius: 5, // Bordas arredondadas
            groupPadding: 0.1, // Reduz espaço entre grupos de colunas
            pointPadding: 0.1, // Reduz espaço entre colunas individuais
            minPointLength: 5 // Aumenta a altura das colunas pequenas para que fiquem visíveis
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',
        pointFormat: '<span style="color:{point.color}">• </span>R$ {point.y}'
    },
    credits: {
        enabled: false // Desabilitar créditos do Highcharts
    },
    exporting: {
        enabled: true, // Habilitar exportação
        url: 'https://api.williamvieira.tech/chart.php',
        buttons: {
            contextButton: {
                symbol: 'menu',
                menuItems: [
                    'downloadXLS',
                    'downloadCSV',
                ]
            }
        }
    },
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
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const fullname = localStorage.getItem("fullname");
      const event = 'copy';
      const module = 'matriculas';
      const user_id = localStorage.getItem("id");
      const user_name = fullname;
      logEvent(event, module, module_id, user_id, user_name, fullname + " copiou os dados em Matrículas", null, null);
    })
    .catch((err) => {
      console.error("Falha ao copiar os dados: ", err);
      alert("Falha ao copiar os dados para a área de transferência!");
    });
};




const logoUrl = 'https://imoveis.williamvieira.tech/LogoVRi-sem-fundo.png';  // Image is inside the 'public' folder

const generatePDF = () => {

  delete formData.local;

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
    doc.text('VRI - Matrículas de Imóveis', 105, 25, { align: 'center' });

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
        if (!Array.isArray(value)) {
          doc.text(value || 'N/A', 90, yOffset); // Valor
        }
      
      

      yOffset += 10;

      // Verificar se o conteúdo excede a altura da página
      if (yOffset > maxHeight) {
        doc.addPage();  // Inicia uma nova página
        yOffset = 10;   // Reinicia o yOffset para a nova página
      }
    });

    // Salvar o PDF gerado
    doc.save('VRI Matrículas de Imóveis ' + formData.cod_matricula + ' - ' + formData.apelido);
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
    nome_proprietario_conceito: "",
    local: [],
    nome_proprietario_grupo: "",
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
    valor_compra_contrato: "",
    data_compra_contrato: "",
    data_compra_string: "",
    observacoes: "",
    latidude: "",
    longitude : ""
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
    nome_proprietario_conceito: "",
    local: [],
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
    valor_compra_contrato: "",
    data_compra_contrato: "",
    data_compra_contrato_string: "",
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

  // Função para formatar o valor
  const formatValue = (val) => {
    // Remove qualquer caractere que não seja número ou ponto
    let formattedValue = val.replace(/[^\d,.-]/g, '');
    
    // Substitui a vírgula por ponto (se estiver presente)
    formattedValue = formattedValue.replace(',', '.');
    
    // Formatação de milhar (usando ponto como separador de milhar)
    formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Se houver mais de uma vírgula, converte tudo em uma vírgula
    formattedValue = formattedValue.replace(/\./g, '');
    formattedValue = formattedValue.replace(/(\d)(?=(\d{3})+\.)/g, '$1.');
    
    return formattedValue;
  };
   // Função para formatar valores com 3 casas decimais e separação de milhar
   const formatarValorComPontos = (num) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(num);
  };

 // Função para verificar se o valor já está no formato correto
 const isFormattedCorrectly = (value) => {
  // Verificar se o valor contém separadores de milhar (pontos) e se já tem casas decimais
  const regex = /^\d{1,3}(\.\d{3})*(,\d{3})?$/; // Exemplo: 1.000,000 ou 1000,000
  return regex.test(value);
};
  

const handleBlurPontos = (e) => {
  // const { name, value } = e.target;

  // // Verificar se o valor contém caracteres não numéricos (exceto pontos e vírgulas)
  // if (!/^\d*[\.,]?\d*$/.test(value)) {
  //   setFormData({
  //     ...formData,
  //     [name]: '', // Limpar o campo se o valor for inválido
  //   });
  //   return;
  // }

  // // Se o valor já está formatado corretamente, não aplica formatação
  // if (isFormattedCorrectly(value)) {
  //   return;
  // }

  // // Para campos numéricos (metros ou área), aplica a formatação
  // if (
  //   name === 'metros_de_frente' ||
  //   name === 'metros_fundo' ||
  //   name === 'metros_lado_direito' ||
  //   name === 'metros_lado_esquerdo' ||
  //   name === 'area_terreno'
  // ) {
  //   // Remover qualquer ponto antes de formatar
  //   let valorSemPontos = value.replace(/\./g, '');

  //   // Verificar se o valor contém uma vírgula ou ponto (parte decimal)
  //   let [parteInteira, parteDecimal] = valorSemPontos.split(/[\.,]/);

  //   // Se não houver parte decimal, adicione ",000" como padrão
  //   if (!parteDecimal) {
  //     parteDecimal = '000';
  //   }

  //   // Formatar a parte inteira com pontos (separador de milhar)
  //   const valorFormatadoInteiro = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  //   // Formatar o valor final no formato desejado (com vírgula para parte decimal)
  //   const valorFormatado = `${valorFormatadoInteiro},${parteDecimal}`;

  //   // Atualizar o estado com o valor formatado
  //   setFormData({
  //     ...formData,
  //     [name]: valorFormatado,
  //   });
  // } else if (name === 'valor_compra' || name === 'valor_compra_contrato') {
  //   // Para campos de moeda, aplica a formatação de moeda
  //   const valorFormatado = formatarMoeda(value);
  //   setFormData({
  //     ...formData,
  //     [name]: valorFormatado,
  //   });
  // }
};



// Função para atualizar o valor no estado
const handleChange = (e) => {
  const { name, value } = e.target;
  if(name === 'area_terreno' || name === 'area_construida' || name === 'metros_de_frente' || name === 'metros_fundo' || name === 'metros_lado_direito' || name === 'metros_lado_esquerdo') {
    const valorFormatado = formatarArea(value);
    setFormData({
      ...formData,
      [name]: valorFormatado,
    });
  } else if (name === 'valor_compra' || name === 'valor_compra_contrato') {
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
     
      if(data.message) {
        setAlertMessage(data.message); // Mensagem de sucesso
        setAlertVariant("success"); // Tipo de alerta
        setShowAlert(true);
        reloadGrid();
      } else {
        setAlertMessage('Erro ao salvar o imóvel'); // Mensagem de sucesso
        setAlertVariant("danger"); // Tipo de alerta
        setShowAlert(true);
      }
      if (method === 'POST') {
        const fullname = localStorage.getItem("fullname");
        const event = 'insert';
        const module = 'matriculas';
        const module_id = "MT" + data.id;
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        setKeyGED((prevKey) => prevKey + 1); // Alterando a chave para forçar a renderização
        logEvent(event, module, module_id, user_id, user_name, fullname + " cadastrou a Matrícula - " + module_id, formData.apelido,  "");
      } else {
        const fullname = localStorage.getItem("fullname");
        const event = 'edit';
        const module = 'matriculas';
        const module_id = formData.cod;
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        logEvent(event, module, module_id, user_id, user_name, fullname + " alterou a Matrícula - " + module_id, formData.apelido, "");
      }
      setTimeout(() =>  fetchDataHistory(module_id), 1000);
    });
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (method === 'POST') {
    setFormData({
      apelido: "",
      numero_matricula: "",
      cidade_registro: "",
      cartorio_registro: "",
      nome_proprietario: "",
      nome_proprietario_conceito: "",
      local: [],
      nome_proprietario_grupo: "",
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
      valor_compra_contrato: "",
      data_compra_contrato: "",
      data_compra_string: "",
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


  const fetchDataHistory = async (id) => {
    try {
      const response = await axios.get('https://api.williamvieira.tech/get_arquivos.php?module_id=' + id); // Replace with your API
      if (Array.isArray(response.data)) {
        setDataHistory(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
        setDataHistory([]); // Set to an empty array if it's not an array
      }
    } catch (error) {
      console.error('Error fetching data history:', error);
    }
  };

  const handleEdit = (row) => {
    fetchOptions('');
    setIsVisibleAdd(true); 
    // const arrayLocais = JSON.parse(localSelecionadas);
    localStorage.setItem("register_id", row.cod);
    const metros_fundo = row.metros_fundo;
    const metros_lado_direito = row.metros_lado_direito;
    const metros_lado_esquerdo = row.metros_lado_esquerdo;
    const metros_de_frente = row.metros_de_frente;
    const area_terreno = row.area_terreno;
    const area_construida = row.area_construida;
    setFormData({
      ...row,
      valor_compra: formatCurrency(row.valor_compra),
      valor_compra_contrato: formatCurrency(row.valor_compra_contrato),
      metros_fundo: metros_fundo,
      metros_lado_direito: metros_lado_direito,
      metros_lado_esquerdo: metros_lado_esquerdo,
      metros_de_frente: metros_de_frente,
      area_terreno: area_terreno,
      area_construida: area_construida
    });
    console.log(optionsSelect);
    setMetrosFrente(row.geometria_regular);
    setIsEditing(true);
    setEditingId(row.id);
    setErrorCPF(false);
    setErrorCEP(false);
    setErrorCNPJ(false);
    setErrorData(false);
    editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log("editar");
    console.log(formData);
    fetchDataHistory(row.cod);
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
        const fullname = localStorage.getItem("fullname");
        const event = 'delete';
        const module = 'matriculas';
        const module_id = "MT" + deletingId;
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        logEvent(event, module, module_id, user_id, user_name, fullname + " deletou a Matrícula - " + module_id, formData.apelido, null);
      });


      
      setFormData({
        apelido: "",
        numero_matricula: "",
        cidade_registro: "",
        cartorio_registro: "",
        nome_proprietario: "",
        nome_proprietario_conceito: "",
        local: [],
        nome_proprietario_grupo: "",
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
        valor_compra_contrato: "",
        data_compra_contrato: "",
        data_compra_string: "",
        observacoes: ""
      });
      reloadForm();
      setIsEditing(false);

      setTimeout(() => fetchData(), 1000);
      setTimeout(() => fetchOptions(''), 1000);
      setTimeout(() => reloadGrid(), 1000);

  };


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
      a.download = `matriculas.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const fullname = localStorage.getItem("fullname");
      const event = 'export';
      const module = 'matriculas';
      const user_id = localStorage.getItem("id");
      const user_name = fullname;
      logEvent(event, module, module_id, user_id, user_name, fullname + " fez uma exportação CSV dos dados em Matrículas", null, null);
  
      console.log("Exportação CSV concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
    }
  
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

  const formatNumber = (number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(number);
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
    { name: "Cod da Matrícula", selector: (row) => row.cod || "", sortable: true },
    { name: "Apelido", selector: (row) => row.apelido || "", sortable: true },
    { name: "Número da Matrícula", selector: (row) => row.numero_matricula || "", sortable: true },
    { name: "Cidade de Registro", selector: (row) => row.cidade_registro || "", sortable: true },
    { name: "Cartório Registro", selector: (row) => row.cartorio_registro || "", sortable: true },
    { name: "Nome Proprietário Matrícula", selector: (row) => row.nome_proprietario || "", sortable: true },
    { name: "Nome Proprietário (Grupo)", selector: (row) => row.proprietarios?.[0]?.nome_proprietario_grupo || "", sortable: true },
    { name: "Tipo de Pessoa", selector: (row) => row.proprietarios?.[0]?.tipo_pessoa || "", sortable: true },
    { name: "CPF", selector: (row) => row.proprietarios?.[0]?.cpf || "", sortable: true },
    { name: "CNPJ", selector: (row) => row.proprietarios?.[0]?.cnpj || "", sortable: true },
    { name: "Razão Social", selector: (row) => row.proprietarios?.[0]?.razao_social || "", sortable: true },
    { name: "Nome Proprietário Conceito", selector: (row) => row.nome_proprietario_conceito || "", sortable: true },
    { name: "CEP", selector: (row) => row.cep || "", sortable: true },
    { name: "Endereço", selector: (row) => row.endereco || "", sortable: true },
    { name: "Número", selector: (row) => row.numero || "", sortable: true },
    { name: "Complemento", selector: (row) => row.complemento || "", sortable: true },
    { name: "Bairro", selector: (row) => row.bairro || "", sortable: true },
    { name: "Cidade", selector: (row) => row.cidade || "", sortable: true },
    { name: "UF", selector: (row) => row.uf || "", sortable: true },
    { name: "Nome Vendedor", selector: (row) => row.nome_vendedor || "", sortable: true },
    { name: "Data Compra Escritura", selector: (row) => row.data_compra_string || "", sortable: true },
    {
      name: "Valor Compra Escritura",
      selector: (row) => (row.valor_compra && row.valor_compra.length > 0 ? "" + row.valor_compra : ""),
      sortable: true
    },
    { name: "Data Compra Contrato", selector: (row) => row.data_compra_contrato_string || "", sortable: true },
    {
      name: "Valor Compra Contrato",
      selector: (row) => (row.valor_compra_contrato && row.valor_compra_contrato.length > 0 ? "" + row.valor_compra_contrato : ""),
      sortable: true
    },
    { name: "Área do Terreno", selector: (row) => row.area_terreno || "", sortable: true },
    { name: "Área Construída", selector: (row) => row.area_construida || "", sortable: true },
    { name: "Geometria Regular", selector: (row) => row.geometria_regular || "", sortable: true },
    { name: "Metros de Frente", selector: (row) => row.metros_de_frente || "", sortable: true },
    { name: "Metros de Fundo", selector: (row) => row.metros_fundo || "", sortable: true },
    { name: "Metros Lado Direito", selector: (row) => row.metros_lado_direito || "", sortable: true },
    { name: "Metros Lado Esquerdo", selector: (row) => row.metros_lado_esquerdo || "", sortable: true },
    { name: "Observações", selector: (row) => row.observacoes || "", sortable: true },
    { name: "Latitude", selector: (row) => row.latitude || "", sortable: true },
    { name: "Longitude", selector: (row) => row.longitude || "", sortable: true }
  ];
  

  // {
  //   name: (
  //     <div>
  //       Valor da Compra
  //       <br />
  //       <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
  //         Total: {formatCurrency(totalCompra)}
  //       </span>
  //     </div>
  //   ),
  //   selector: (row) => formatCurrency(row.valor_compra),
  //   sortable: true,
  //   width: "200px"
  // },

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
    return value;
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
              src="https://williamvieira.tech/LogoVRi-sem-fundo.png" 
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
        <div className="card card-search"   style={{ width: '100%' }}>
        <div className="card-body" >
          <form onSubmit={handleSubmitSearch}>
            <div className="row">
              <div className="col-md-12">
              <input
        type="text"
        className="form-control"
        name="search_value"
        value={formData.search_value}
        onChange={handleInputChange}
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

 

     
    
      {data.length > 0 &&  (
      
      <button className="btn btn-dark mb-3 btnExport" onClick={handleExport}> <FontAwesomeIcon icon={faFileCsv} /> CSV</button>
     
     )}
       {data.length > 0 &&  (
    
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
            
            
            <div className="row">
          <div className="col-md-4">
            <div className="form-floating select-complete">
            <Select
            isClearable={true} // Enable the clear button
            value={optionsSelect.find(option => option.value === formData.cod_matricula)}
            key={key} // Change the key to force re-rende
            onInputChange={handleInputChangeCod} // Atualiza o valor enquanto o usuário digita
            onChange={handleChangeSelect} // Atualiza o estado com a opção selecionada
            options={optionsSelect} // Passa as opções para o select
            isLoading={loadingSelect} // Exibe o indicador de carregamento
            placeholder="Digite o Código da Matrícula"
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
                  <FontAwesomeIcon icon={faXmark} /> Cancelar
                </div>
            )}
          </div>
          <div className="col-md-4">
          {isEditing ? (<GED register_id={"MT" + editingId} />) : ('')}  
          {/* <GED key={keyGED} register_id={"MT" + editingId} /> */}
          
          </div>
        </div>
        <hr className="my-4"></hr>
        <form onSubmit={handleSubmit}>
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
                 {/* Map through the cities data to generate <option> elements */}
        {cities.map((city) => (
          <option key={city.id} value={city.nome}>
            {city.nome}
          </option>
        ))}
                </select>
                <label htmlFor="cidade_registro">Cidade de Registro</label>
              </div>
          </div>
          <div className="col-md-4">
          <div className="mb-3 form-floating">
          <select
                  className="form-select "
                  id="cartorio_registro"
                  name="cartorio_registro"
                  value={formData.cartorio_registro}
                  onChange={handleChange}
                >
                  <option value="">Selecione o Cartório</option>
                 {/* Map through the cities data to generate <option> elements */}
        {cartorios.map((cartorio) => (
          <option key={cartorio.id} value={cartorio.nome}>
            {cartorio.nome}
          </option>
        ))}
                </select>
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
           <option value="">Selecione</option>
                    {/* Map through the cities data to generate <option> elements */}
        {proprietarios.map((proprietario) => (
          <option key={proprietario.id} value={proprietario.nome}>
            {proprietario.nome}
          </option>
        ))}
                </select>
                <label htmlFor="nome_proprietario">Nome Proprietário Matrícula</label>
              </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3 form-floating">
                <select
                  className="form-select "
                  id="nome_proprietario_conceito"
                  name="nome_proprietario_conceito"
                  value={formData.nome_proprietario_conceito}
                  onChange={handleChange}
                  
                >
                  <option value="">Selecione</option>
                    {/* Map through the cities data to generate <option> elements */}
        {proprietarios.map((proprietario) => (
          <option key={proprietario.id} value={proprietario.nome}>
            {proprietario.nome}
          </option>
        ))}
                </select>
                <label htmlFor="nome_proprietario_novo">Nome Proprietário Conceito</label>
              </div>
        </div>
        <div className="col-md-4 none">
        <div className="mb-3 form-floating select-multi">
        <Select
          isMulti
          isSearchable // Permite a busca
          options={optionsLocal}
           className="form-control"
         loadingMessage={() => "Carregando..."}
         value={formData.local}
          onChange={handleSelectChange} // Update formData on selection change
          placeholder="Selecione o Local"
          noOptionsMessage={() => "Nenhuma opção encontrada"}
        />
        <FontAwesomeIcon icon={faSearch} />
        <label htmlFor="local">Local </label>
              </div>
        </div>
        </div>
              


          <div className="row none" >
          <input
              type="text"
              className="form-control"
              id="nome_proprietario_grupo"
              name="nome_proprietario_grupo"
              value={formData.nome_proprietario_grupo}
              onChange={handleChange}
            />
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
          <div className="form-floating mb-3 none">
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
          <div className="form-floating mb-3 none">
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
          <div className="form-floating mb-3 none">
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


      <div className="col-md-6">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="latitude"
        name="latitude"
        value={formData.latitude}
        onChange={handleChange}
        placeholder="latitude"
      />
                <label htmlFor="latitude">Latitude</label>
              </div>
    </div>
    <div className="col-md-6">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="longitude"
        name="longitude"
        value={formData.longitude}
        onChange={handleChange}
        placeholder="longitude"
      />
                <label htmlFor="longitude">Longitude</label>
              </div>
    </div>


    
    <div className="col-md-12">
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
   
    <div className="col-md-6">
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
                <label htmlFor="data_compra_string">Data Compra Escritura</label>
                {
                errorData && 
                <div className="invalid-feedback">{errorData}</div>
                
                }
              </div>
              
    </div>
    <div className="col-md-6">
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
              <label htmlFor="valor_compra">Valor Compra Escritura </label>
              </div>
    </div>
    <div className="col-md-6">
    <div className="mb-3 form-floating">
    <InputMask
          mask="99/99/9999"
          value={formData.data_compra_contrato_string}
          onChange={handleChange}
          onBlur={handleBlurData}  // Validate when input loses focus
          placeholder="dd/mm/yyyy"
          className={`form-control ${errorData ? 'is-invalid' : ''}`}
          id="data_compra_contrato_string"
          name="data_compra_contrato_string"
        />
                <label htmlFor="data_compra_contrato_string">Data Compra Contrato</label>
                {
                errorData && 
                <div className="invalid-feedback">{errorData}</div>
                
                }
              </div>
              
    </div>

    
    <div className="col-md-6">
    <div className="mb-3 form-floating">
   <input
     id="valor_compra_contrato"
     name="valor_compra_contrato"
     type="text"
     value={formData.valor_compra_contrato}
     onChange={handleChange}
     placeholder="Digite o valor"
      className="form-control"
      
      />
              <label htmlFor="valor_compra">Valor Compra Contrato </label>
              </div>
    </div>

<div className="col-md-6">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="area_terreno"
        name="area_terreno"
        value={formData.area_terreno}
        onChange={handleChange}
        
        placeholder="Área Terreno "
        type="text"
        
      />
                <label htmlFor="area_terreno">Área Terreno (m2) </label>
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
        
        placeholder="Área Construída "
        type="text"
        
      />
                <label htmlFor="area_construida">Área Construída (m2) </label>
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

          {metrosFrente == 'Não' && (
          <div className="col-md-12">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_de_frente"
        name="metros_de_frente"
        value={formData.metros_de_frente}
        onChange={handleChange}
        
        placeholder="Metros de Frente"
        type="text"
        
      />
                <label htmlFor="metros_fundo">Metros de Frente </label>
              </div>
  </div>
  )}


          {metrosFrente == 'Sim' && (
<div className="">
<div className="col-md-12">
  <div className="mb-3 form-floating">

  <input
        className="form-control"
        id="metros_de_frente"
        name="metros_de_frente"
        value={formData.metros_de_frente}
        onChange={handleChange}
        
        placeholder="Metros de Frente"
        type="text"
        
      />
                <label htmlFor="metros_fundo">Metros de Frente </label>
              </div>
  </div>
  <div className="col-md-12">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_fundo"
        name="metros_fundo"
        value={formData.metros_fundo}
        onChange={handleChange}
        
        placeholder="Metros de Fundo"
        type="text"
        
      />
                <label htmlFor="metros_fundo">Metros de Fundo </label>
              </div>
  </div>
  <div className="col-md-12">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_lado_direito"
        name="metros_lado_direito"
        
        value={formData.metros_lado_direito}
        onChange={handleChange}
        placeholder="Metros Lado Direito"
        type="text"
        
      />
                <label htmlFor="metros_lado_direito">Metros Lado Direito </label>
              </div>
  </div>
  <div className="col-md-12">
  <div className="mb-3 form-floating">
  <input
        className="form-control"
        id="metros_lado_esquerdo"
        
        name="metros_lado_esquerdo"
        value={formData.metros_lado_esquerdo}
        onChange={handleChange}
        placeholder="Metros Lado Direito"
        type="text"
        
      />
                <label htmlFor="metros_lado_esquerdo">Metros Lado Esquerdo </label>
              </div>
  </div>
</div>
)}



<div className="col-md-12">
  <div className="mb-3 form-floating">
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

       

        


{isEditing ? (
<div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
<div className="card-body">
<div class="tables-container">
    
            <div class="table-wrapper">
           
           <div className="div-1">
           <h6 class="text-center border p-2 title-grade">ATUAL</h6>
        
<table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>Data Criação</th>
                    <th>Código</th>
                    <th>Apelido</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{formatDateToBR(formData.date_insert)}</td>
                    <td>{formData.cod}</td>
                    <td>{formData.apelido}</td>
                </tr>
            </tbody>
        </table>
        </div>
        <div className="div-2">
        <h6 class="text-center border p-2 title-grade">HISTÓRICO</h6>
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>Data Alteração</th>
                    <th>Código</th>
                    <th>Apelido</th>
                    <th>Descrição</th>
                    <th>Usuário</th>
                </tr>
            </thead>
            <tbody>
            {dataHistory.length === 0 ? (
          <tr>
            <td colSpan="6">Não possui dados</td>
          </tr>
        ) : (
          dataHistory.map((row, index) => {
   

            const matriculas = JSON.parse(row.codigos_matricula);

            return (
              <tr key={index}> 
                <td>{row.date}</td>
                <td>{row.module_id}</td>
                <td>{row.apelido}</td>
                <td>{row.desc}</td>
                <td>{row.user_name}</td>
              </tr>
            );
          })
        )}
            </tbody>
        </table>
        </div>
        </div>
        </div>

</div>
</div>
    ) : ''}

{/* {!isEditing ? (
{/* <div className="card shadow-lg border-0 rounded-lg mt-4 mt-20">
        <div className="card-body"> */}
        {/* <HighchartsReact highcharts={Highcharts} options={options} /> */}
{/* </div>
</div> */}

        <footer className="py-4 bg-light mt-auto footerInterno">
            <div className="container-fluid px-4">
                <div className="text-center">
                    <div className="text-muted text-center">© VRI - Todos os direitos reservados.</div>
                </div>
            </div>
        </footer>
      </main>

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
