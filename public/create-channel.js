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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Redireciona para a página do canal com o ID do canal na URL
        window.location.href = `/channel.html?channelId=${data._id}`;
    })
    .catch(error => {
        console.error('Erro ao criar o canal:', error);
    });
});
