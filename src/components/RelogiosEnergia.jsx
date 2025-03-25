import React, { useState, useEffect, useRef, useCallback  } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf , faCopy, faFloppyDisk, faPlus, faPenToSquare, faTrash, faCheck, faFileExcel, faFilter, faXmark, faSearch, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { Alert } from "react-bootstrap";
import { CurrencyInput } from 'react-currency-mask';
import InputMask from "react-input-mask";  // Importando a biblioteca de máscara
import Select from 'react-select';
import axios from "axios";
import { jsPDF } from "jspdf"; // Importa o jsPDF
import logEvent from '../logEvent';
import GED from "./GED";
import debounce from 'lodash.debounce';
import { useLocation } from "react-router-dom";

const initialData = [];


function RelogiosEnergia() {

  const locationLog = useLocation();
  
  const fullname = localStorage.getItem("fullname");
  const module = 'relogios-de-energia';
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

  const [formData, setFormData] = useState({
    cod_matricula: "",
    apelido: "",
    local: [],
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
    matriculasSelecionadas: [],
    search_value: ""
  });

  const [keyGED, setKeyGED] = useState(0);

    const [dataHistory, setDataHistory] = useState([]);
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
    doc.text('VRI - Relógios de Energia', 105, 25, { align: 'center' });

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
    doc.save('VRI Relógios de Energia ' + formData.cod_matricula + ' - ' + formData.apelido);
  };

  // Definir a URL da imagem (isto dispara o carregamento da imagem)
  img.src = logoUrl;
};

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

  // Filtra e ordena matrículas
const filterAndSortMatriculas = () => {
  // Filtra matrículas baseadas no termo de pesquisa
  const filteredMatriculas = matriculasData.filter(matricula =>
    matricula.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Se a pesquisa estiver vazia, mostrar apenas as matrículas selecionadas inicialmente
  if (searchTerm === "") {
    // Mostrar somente as matrículas selecionadas
    return filteredMatriculas.filter(matricula => formData.matriculasSelecionadas.includes(matricula.id));
  } else {
    // Separar as matrículas selecionadas e não selecionadas
    const selectedMatriculas = filteredMatriculas.filter(matricula => formData.matriculasSelecionadas.includes(matricula.id));
    const unselectedMatriculas = filteredMatriculas.filter(matricula => !formData.matriculasSelecionadas.includes(matricula.id));

    // Ordenar as matrículas selecionadas no topo e exibir as não selecionadas depois
    return [...selectedMatriculas, ...unselectedMatriculas];
  }
};
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearchMatriculas(e.target.value)
  };
  const handleSearchMatriculas = async (value) => {
    try {
      const response = await fetch(`https://api.williamvieira.tech/get_matriculas.php?search_value=${value}`);
      const data = await response.json();
      if (data) {
        setMatriculasData(data);
      } else {
        gridMatriculas();
      }
    } catch (error) {
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
  

  const [errors, setErrors] = useState({
    codRelogioEnergia: '',
    cod_matricula: '',
    cpf_cnpj_proprietario: '',
    cpf_cnpj_titular_consumidor: ''
  });

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
    const url = `https://api.williamvieira.tech/matriculas.php?${searchParams.toString()}`;

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
  
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if(isVisible == true) {
      reloadGrid();
      formData.search_value = "";
    }
};


  const [showModalCopy, setShowModalCopy] = useState(false);
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
   const [optionsLocal, setOptionsLocal] = useState([]); 
     // Estado para o campo de busca
     const [searchTerm, setSearchTerm] = useState("");
       const [matriculasData, setMatriculasData] = useState([]);  
         const [errorMatriculas, setErrorMatriculas] = useState(null); 
           const [key, setKey] = useState(0); // Control re-render
  

  useEffect(() => {
    reloadGrid();
    fetchOptions('');
    axios
    .get("https://api.williamvieira.tech/local.php")
    .then((response) => {
      const apiOptions = response.data.map(item => ({
        value: item.id, // Adjust according to your API response
        label: item.nome, // Adjust according to your API response
      }));
      setOptionsLocal(apiOptions); // Save the fetched cities to state
      setLoading(false); // Set loading to false once the data is fetched
    })
    .catch((error) => {
      setError("Failed to fetch cities."); // Set an error message if the fetch fails
      setLoading(false); // Set loading to false even if there's an error
    });
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
            a.download = `relogios-de-energia.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        
            console.log("Exportação CSV concluída com sucesso!");
          } catch (error) {
            console.error("Erro ao exportar CSV:", error);
          }
        
        };

    // Handle change in multi-select
    const handleSelectChange = (selectedOptions) => {
      // Update formData with the selected options
      setFormData({
        ...formData,
        local: selectedOptions, // Store selected options in the form data
      });
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
    const response = await axios.get(`https://api.williamvieira.tech/optionsEnergia.php?q=${searchQuery}`);
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
  // alert(value);
  try {
    const response = await fetch(`https://api.williamvieira.tech/codenergia.php?cod_matricula=${value}`);
    const data = await response.json();
  
    if (data.apelido) {
      setIsVisibleAdd(true);
      const matriculasSelecionadas = data.matriculasSelecionadas; // A string que você tem
      const arrayMatriculas = JSON.parse(matriculasSelecionadas);
      const localSelecionadas = data.local; // A string que você tem
      const arrayLocais = JSON.parse(localSelecionadas);
      setFormData({
        ...data,
        local : arrayLocais,
        matriculasSelecionadas: arrayMatriculas,
      });
    } else {
      // setShowModalCod(true);
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

  if(!formData.matriculasSelecionadas.length > 0) {
    setShowModalCod(true);
    return;
  }

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `https://api.williamvieira.tech/matriculas.php?id=${editingId}` : 'https://api.williamvieira.tech/matriculas.php';
  console.log("submit");
  const teste = JSON.stringify(formData)
  console.log(teste);
  console.log("submit");
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  .then((response) => response.json())
  .then((data) => {
    if(data.message) {
      setAlertMessage(data.message); // Mensagem de sucesso
      setAlertVariant("success"); // Tipo de alerta
      setShowAlert(true);
      reloadGrid();
      if (method === 'POST') {
        const fullname = localStorage.getItem("fullname");
        const event = 'insert';
        const module = 'relogios-de-energia';
        const module_id = "REN" + data.id;
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        setKeyGED((prevKey) => prevKey + 1); // Alterando a chave para forçar a renderização
        logEvent(event, module, module_id, user_id, user_name, fullname + " cadastrou o Relógio de Energia - " + module_id, formData.apelido, formData.matriculasSelecionadas);
      } else {
        const fullname = localStorage.getItem("fullname");
        const event = 'edit';
        const module = 'relogios-de-energia';
        const module_id = formData.cod;
        const user_id = localStorage.getItem("id");
        const user_name = fullname;
        logEvent(event, module, module_id, user_id, user_name, fullname + " alterou o Relógio de Energia - " + module_id, formData.apelido, formData.matriculasSelecionadas);
      }
      setTimeout(() =>  fetchDataHistory(module_id), 1000);
    } else {
      //console.log(error);
      setAlertMessage('Erro ao salvar o imóvel'); // Mensagem de sucesso
      setAlertVariant("danger"); // Tipo de alerta
      setShowAlert(true);
         }
  });
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (method === 'POST') {
  setFormData({
    cod_matricula: "",
    apelido: "",
    local: [],
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
    matriculasSelecionadas : []
  });


  //reloadForm();
  setIsEditing(false);
} else {
  setIsEditing(true);
}
 

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
      const fullname = localStorage.getItem("fullname");
      const event = 'delete';
      const module = 'relogios-de-energia';
      const module_id = formData.cod;
      const user_id = localStorage.getItem("id");
      const user_name = fullname;
      logEvent(event, module, module_id, user_id, user_name, fullname + " deletou o Relógio de Energia " + module_id, formData.apelido, formData.matriculasSelecionadas);
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setKeyGED((prevKey) => prevKey + 1); // Alterando a chave para forçar a renderização
    });
};


const handleEdit = (row) => {
  setIsVisibleAdd(true);
  const matriculasSelecionadas = row.matriculasSelecionadas; // A string que você tem
  const arrayMatriculas = JSON.parse(matriculasSelecionadas);
  const localSelecionadas = row.local; // A string que você tem
  const arrayLocais = JSON.parse(localSelecionadas);
  setFormData({
    ...row,
    local : arrayLocais,
    matriculasSelecionadas: arrayMatriculas,
  });
  console.log(formData);
  setIsEditing(true);
  setEditingId(row.id);
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  fetchDataHistory(row.cod);
};

const addIMovel = () => {

  setIsVisibleAdd(false);
  setIsEditing(false);
  reloadForm();
  setFormData({
    cod_matricula: "",
    apelido: "",
    local: [],
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
    matriculasSelecionadas : []
  });
  editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setKey((prevKey) => prevKey + 1); // Force re-render
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
    { name: "Matrículas ", selector: (row) => row.matriculasSelecionadas, sortable: true },
    { name: "Apelido", selector: (row) => row.apelido, sortable: true },
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
              src="https://williamvieira.tech/LogoVRi-sem-fundo.png" 
              alt="Ícone Grupo Serbom" 
            /> Relógios de Energia
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
        <div className="card card-search" style={{ width: '100%' }}>
        <div className="card-body" >
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
        {data.length > 0 &&  (
          <button className="btn btn-dark mb-3  btn-info-grid" onClick={handleCopy}>  <FontAwesomeIcon icon={faCopy} /> Copiar</button>
         )}
     
     {data.length > 0 && !isVisible && (               <button className="btn btn-secondary mb-3 btn-info-grid" onClick={toggleVisibility}> <FontAwesomeIcon icon={faFilter} /> Filtrar </button>
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
            value={options.find(option => option.value === formData.cod)}
            key={key} // Change the key to force re-rende
            onInputChange={handleInputChange} // Atualiza o valor enquanto o usuário digita
            onChange={handleChangeSelect} // Atualiza o estado com a opção selecionada
            options={options} // Passa as opções para o select
            isLoading={loadingSelect} // Exibe o indicador de carregamento
            placeholder="Digite o Cód do Relógio"
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
        
           <div className="col-md-4">
                    {isVisibleAdd && (
                        <div type="submit" onClick={addIMovel} className="btn btn-light btn-relative">
                            <FontAwesomeIcon icon={faXmark} /> Cancelar
                          </div>
                      )}
                    </div>
                     <div className="col-md-4">
                     {/* <GED key={keyGED} register_id={"REN" + editingId} /> */}
                        {isEditing ? (<GED register_id={"REN" + editingId} />) : ('')}  
                                {/* {isEditing ? <div className="btn btn-dark mb-3 btn-ged" onClick={generatePDF}><FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon> PDF</div> : ''  } */}
                                
                              </div>
        </div>
        <hr className="my-4"></hr>
        <form onSubmit={handleSubmit}>
        <div className="row">
      
          <div className="col-md-6">
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
<div className="col-md-6">
<div className="form-floating mb-3 select-multi">
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
        <input
        value={formData.cpf_cnpj_proprietario}
        onChange={handleChange}
        name="cpf_cnpj_proprietario"
        placeholder="CPF/CNPJ Proprietário"
        className="form-control"
        type="number"
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

           <input
        value={formData.cpf_cnpj_titular_consumidor}
        onChange={handleChange}
        name="cpf_cnpj_titular_consumidor"
   placeholder="CPF/CNPJ Titular/Consumidor"
        className="form-control"
        type="number"
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
            <option value="Cancelado">Cancelado</option>
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
          <div className="row">
          {matriculasData.length > 0 ? (
      filterAndSortMatriculas() // Chama a função para filtrar e ordenar as matrículas
        .slice(0, 12) // Limita a exibição a 12 itens
        .map((matricula) => (
          <div key={matricula.id} className="col-md-3 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`matricula-${matricula.id}`}
                checked={formData.matriculasSelecionadas.includes(matricula.id)} // Verifica se a matrícula está selecionada
                onChange={() => handleCheckboxChange(matricula.id)} // Chama a função para tratar a mudança no checkbox
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
                    <th>Matrículas</th>
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
            // Parse codigos_matricula which is a stringified array
            const matriculas = JSON.parse(row.codigos_matricula);

            return (
              <tr key={index}> 
                <td>{row.date}</td>
                <td>{row.module_id}</td>
                <td>{row.apelido}</td>
                <td>{matriculas.join(' | ')}</td>
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

    
    
   
      <footer className="py-4 bg-light mt-auto footerInterno">
            <div className="container-fluid px-4">
                <div className="text-center">
                    <div className="text-muted text-center">© VRI - Todos os direitos reservados.</div>
                </div>
            </div>
        </footer>
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
                            Cód da Matrícula não encontrado
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" onClick={() => setShowModalCod(false)}> <FontAwesomeIcon icon={faCheck} /> OK</button>
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

    </div>
    
  );
}

export default RelogiosEnergia;
