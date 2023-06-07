const express = require('express');
const OpenAI = require('openai-api'); // Biblioteca para se conectar à API do OpenAI
const amazonAPI = require('amazon-api'); // Biblioteca para se conectar à API da Amazon

const app = express();
const port = 3000;

// Configuração da API do OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Configuração da API da Amazon
const amazon = new amazonAPI({
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
  associateId: process.env.AMAZON_ASSOCIATE_ID
});


// Rota principal para lidar com as solicitações de revisão de produtos
app.get('/review', async (req, res) => {
  const productName = req.query.name; // Nome do produto fornecido pelo usuário
  const productType = req.query.type; // Tipo de produto fornecido pelo usuário

  try {
    // Chamada para a API do OpenAI para obter a revisão do produto
    const response = await openai.completions.create({
      engine: 'text-davinci-003', // Escolha o modelo adequado à sua necessidade
      prompt: `Escreva uma revisão sobre o ${productName}. É um ${productType}.`,
      max_tokens: 100 // Defina a quantidade de tokens desejada para a resposta
    });

    const review = response.choices[0].text.trim(); // Revisão gerada pela API do OpenAI

    // Chamada para a API da Amazon para obter os links dos produtos relacionados
    const searchResults = await amazon.itemSearch({
      keywords: productName,
      responseGroup: 'ItemAttributes,Offers',
      searchIndex: 'All' // Escolha o índice de pesquisa adequado à sua necessidade
    });

    const links = searchResults.map(item => ({
      title: item.ItemAttributes.Title,
      url: item.DetailPageURL
    }));

    // Renderização da página com os dados obtidos
    const html = `
      <html>
        <head>
          <title>Revisão do Produto</title>
        </head>
        <body>
          <h1>Revisão do Produto: ${productName}</h1>
          <h2>Tipo de Produto: ${productType}</h2>
          <p>${review}</p>
          <h3>Links Patrocinados da Amazon:</h3>
          <ul>
            ${links.map(link => `<li><a href="${link.url}">${link.title}</a></li>`).join('')}
          </ul>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao processar a solicitação.');
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

