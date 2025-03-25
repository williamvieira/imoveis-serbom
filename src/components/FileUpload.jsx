import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

function FileUpload({ fetchFiles }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
   
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Por favor, selecione um arquivo!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload.php', formData);
      setStatus(response.data.message);
      fetchFiles(); // Atualiza a lista de arquivos
    } catch (error) {
      setStatus('Erro ao enviar arquivo');
    }
  };

  return (
    <div>
      <h5>Upload de Arquivo</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="fileInput">
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button type="submit" variant="primary">
          Enviar Arquivo
        </Button>
      </Form>
      {status && <Alert variant={status === 'Erro ao enviar arquivo' ? 'danger' : 'success'}>{status}</Alert>}
    </div>
  );
}

export default FileUpload;
