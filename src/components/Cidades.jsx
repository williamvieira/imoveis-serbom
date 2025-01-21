import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, FloatingLabel, Modal } from 'react-bootstrap';

const Cidades = ({ show, onHide, cidadeAtual, onSave }) => {
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    if (cidadeAtual) {
      setNome(cidadeAtual.nome);
      setEstado(cidadeAtual.estado);
    } else {
      setNome('');
      setEstado('');
    }
  }, [cidadeAtual]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cidade = { nome, estado };
    if (cidadeAtual) {
      // Atualizar cidade
      cidade.id = cidadeAtual.id;
      await axios.put('http://localhost/crud_cidades.php', cidade);
    } else {
      // Adicionar cidade
      await axios.post('http://localhost/crud_cidades.php', cidade);
    }
    onSave();
    onHide();
  };

  return (
    <div id="layoutSidenav_content">
       <div className="container-fluid px-4">
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{cidadeAtual ? 'Editar Cidade' : 'Adicionar Cidade'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="nome" label="Nome" className="mb-3">
            <Form.Control
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
            />
          </FloatingLabel>
          <FloatingLabel controlId="estado" label="Estado" className="mb-3">
            <Form.Control
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="Estado"
            />
          </FloatingLabel>
          <Button variant="primary" type="submit">
            {cidadeAtual ? 'Salvar Alterações' : 'Adicionar Cidade'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
    </div>
    </div>
  );
};

export default Cidades;
