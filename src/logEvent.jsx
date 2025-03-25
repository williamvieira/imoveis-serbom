import axios from 'axios';

const logEvent = async (event, module, module_id, user_id, user_name, desc, apelido, codigos_matricula) => {
  try {
    const response = await axios.post('https://api.williamvieira.tech/logs.php', {
      event,
      module,
      module_id,
      user_id,
      user_name,
      desc,
      apelido,
      codigos_matricula
    });
    console.log('Log inserted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error inserting log:', error);
    throw error;
  }
};

export default logEvent;
