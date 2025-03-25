import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Alert } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faArrowUpRightFromSquare, faFile, faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import logEvent from '../logEvent';

function GED({ register_id }) {  
  //alert(register_id);// Recebendo o register_id como parâmetro
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);  // Estado para armazenar o arquivo a ser excluído
  const [count, setCount] = useState(0);  // Contador de documentos
  const [fileToDeleteName, setFileToDeleteName] = useState(null);
  const [fileToDeleteId, setFileToDeleteId] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [register_id]); // Dependência do register_id para re-carregar os dados

  const fetchLogs = async () => {
    try {
      const module = location.pathname;
      const response = await axios.get('https://api.williamvieira.tech/log.php?module=' + module + "&register_id=" + register_id);
      setLogs(response.data || []);
      setCount(response.data ? response.data.length : 0); // Atualiza o contador com base no número de documentos
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setLogs([]);
      setCount(0);
    }
  };

  const handleShow = () => {
    fetchLogs();
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleUploadGED = async (event) => {

    event.preventDefault();

    const formData = new FormData();
    const file = event.target.file.files[0];
    const field_name = event.target.field_name.value;
    const fullname = localStorage.getItem("fullname");
    const user_id = localStorage.getItem("id");
    const module = location.pathname;
    formData.append('module', module);
    formData.append('file', file);
    formData.append('field_name', field_name);
    formData.append('username', fullname);
    formData.append('user_id', user_id);
    formData.append('register_id', register_id);

    try {
      const response = await axios.post('https://api.williamvieira.tech/upload.php', formData);
      const user_id = localStorage.getItem("id");

      setStatus({ type: 'success', message: response.data.message });
      setTimeout(() => fetchLogs(), 500);
      setTimeout(() => setStatus(false), 1000);
      event.target.reset(); // Reset the form after successful upload
      const fullname = localStorage.getItem("fullname");
      const user_name = fullname;
      logEvent("upload", "GED", register_id, user_id, user_name, fullname + " cadastrou o documento (" + field_name + ") no GED - " + register_id, null, null);
    } catch (error) {
      alert(error);
      setStatus({ type: 'error', message: 'Erro ao fazer upload do arquivo!' });
      setTimeout(() => setStatus(false), 3000);
    }
  };

  const handleDelete = (fileId, name, cod) => {
    setFileToDeleteName(name);
    setFileToDeleteId(cod);
    setFileToDelete(fileId);  // Salva o ID do arquivo a ser excluído
    setShowConfirmModal(true);  // Exibe o modal de confirmação
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`https://api.williamvieira.tech/delete.php?fileId=${fileToDelete}`);
      
      console.log(response.data);
      
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Arquivo excluído com sucesso!' });
        fetchLogs(); // Re-fetch the logs after deletion
        const user_id = localStorage.getItem("id");
        const fullname = localStorage.getItem("fullname");
        const user_name = fullname;
        logEvent("delete", "GED", register_id, user_id, user_name, fullname + " deletou o documento (" + fileToDeleteName + ") no GED - " + fileToDeleteId, null, null);
      } else {
        setStatus({ type: 'error', message: 'Erro ao excluir o arquivo.' });
      }

      
      setTimeout(() => setStatus(false), 1000);
      setShowConfirmModal(false);  // Fecha o modal de confirmação
    } catch (error) {
      console.error('Erro ao excluir o arquivo:', error);
      setStatus({ type: 'error', message: 'Erro ao excluir o arquivo.' });
      setTimeout(() => setStatus(false), 1000);
      setShowConfirmModal(false);  // Fecha o modal de confirmação em caso de erro
    }
  };

  const formatDateToBR = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, 
    };
    return date.toLocaleString('pt-BR', options).replace(',', '');
  };

  const columns = [
    {
      cell: (row) => (
        <div>
          <button className="btn btn-primary btn-sm mr-15" onClick={() => window.location.href = `https://api.williamvieira.tech/download.php?file=${row.filename}`}>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Abrir o Documento
          </button>
        </div>
      ),
      width: "210px"
    },
    { name: "Revisão", selector: (row) => row.revisao, sortable: true },
    { name: "Cod", selector: (row) => row.register_id, sortable: true },
    { name: "Nome do Documento", selector: (row) => row.field_name, sortable: true },
    { name: "Usuário", selector: (row) => row.username, sortable: true },
    { name: "Data/Hora", selector: (row) => formatDateToBR(row.date), sortable: true, width: "200px" },
    {
      name: "",
      cell: (row) => (
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id, row.field_name, row.register_id)}>
          <FontAwesomeIcon icon={faTrash} /> Excluir
        </button>
      ),
      width: "150px"
    },
  ];

  return (
    <div className="App">
      {/* Botão com base no contador */}
      <div className={`btn ${count > 0 ? 'btn-success' : 'btn-primary'} btn-ged position-relative`} onClick={handleShow}>
        <FontAwesomeIcon icon={faFile} /> GED
        {count > 0 && (
          <span className="badge bg-danger position-absolute top-0 start-100 translate-middle p-2 rounded-circle">
            {count}
          </span>
        )}
      </div>

      {/* Modal de Consulta de Documentos */}
      <Modal show={showModal} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title><b>Consulta de documentos</b></Modal.Title>
        </Modal.Header>

        <Modal.Body>
          
        {status && (
            <Alert variant={status.type === 'success' ? 'success' : 'danger'}>
              {status.message}
            </Alert>
          )}
          {logs.length > 0 ? (
            <DataTable
              columns={columns}
              data={logs}
              pagination
              paginationPerPage={6}
              paginationRowsPerPageOptions={[]}
              paginationText="Exibindo registros de"
              noDataComponent="Não há registros para exibir"
              customStyles={{
                table: { style: { fontSize: '16px' } },
                headCells: { style: { fontSize: '16px' } },
                cells: { style: { fontSize: '16px' } },
                pagination: { style: { fontSize: '16px' } },
              }}
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Selecionar todos',
              }}
            />
          ) : (
            <p>Sem logs disponíveis.</p>
          )}
          <br />
          <br />
          <Form onSubmit={handleUploadGED}>
            <div className="row">
              <div className="col-md-6">
                <label htmlFor="field_name"><b>Nome do Documento</b></label>
                <input type="text" name="field_name" id="field_name" className="padding-10 form-control" placeholder="Digite o Nome do Documento" required />
              </div>
              <div className="col-md-6">
                <label htmlFor="file" className='lb-r'><b>Local do Documento </b></label>
                <input type="file" id="file" className="padding-10 form-control mb-3" name="file" required />
              </div>
              <div className="col-md-12 text-center">
                <br />
                <button type='submit' className="btn btn-success mb-3">
                  <FontAwesomeIcon icon={faFloppyDisk} /> Gravar
                </button>
                <br />
                <br />
              </div>
            </div>
          </Form>

        </Modal.Body>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><b>Confirmar Exclusão</b></Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Você tem certeza de que deseja excluir este arquivo?</p>
          <div className="text-center">
            <Button className="r15" variant="light" onClick={() => setShowConfirmModal(false)} > <FontAwesomeIcon icon={faXmark} /> Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete} className="ml-3"><FontAwesomeIcon icon={faCheck} />  Excluir</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default GED;
