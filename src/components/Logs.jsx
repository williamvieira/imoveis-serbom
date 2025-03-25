import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

function FileList({ files }) {
  const handleDownload = (filename) => {
    window.location.href = `/api/download.php?file=${filename}`;
  };
  
  return (
    <div>
      <h5>Arquivos Disponíveis</h5>
      <ListGroup>
        {files.map((file) => (
          <ListGroup.Item key={file.id}>
            {file.filename}
            <Button variant="link" onClick={() => handleDownload(file.filename)}>
              Download
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default FileList;
