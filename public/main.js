const form = document.getElementById('productForm');
const reviewResult = document.getElementById('reviewResult');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const productName = document.getElementById('productName').value;
  const productType = document.getElementById('productType').value;

  try {
    const response = await fetch(`/review?name=${productName}&type=${productType}`);
    const html = await response.text();
    reviewResult.innerHTML = html;
  } catch (error) {
    console.error('Erro:', error);
    reviewResult.innerHTML = 'Ocorreu um erro ao processar a solicitação.';
  }
});

