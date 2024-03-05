document.getElementById('create-channel-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        topic: document.getElementById('topic').value
    };

    fetch('/channels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Adicione o token aqui
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Canal criado com sucesso:', data);
        // Redirecione o usuário ou atualize a interface aqui
    })
    .catch(error => {
        console.error('Erro ao criar o canal:', error);
    });
});
