document.getElementById('search-channel-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const channelName = document.getElementById('channelName').value;
    const channelTopic = document.getElementById('channelTopic').value;
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Limpar resultados anteriores

    // Validar entrada
    if (!channelName && !channelTopic) {
        alert('Por favor, preencha pelo menos um campo de busca.');
        return;
    }

    // Substituir pela sua URL de API e ajustar conforme necessário
    const searchUrl = `/channels/search?name=${channelName}&topic=${channelTopic}`;

    fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(channel => {
                const channelResult = document.createElement('div');
                channelResult.className = 'channel-result';
                channelResult.innerHTML = `<strong>${channel.name}</strong> - ${channel.topic} - <span>Participantes: ${channel.participants.length}</span>`;
                channelResult.style.cursor = 'pointer';
                channelResult.addEventListener('click', () => joinChannel(channel._id)); // Implemente joinChannel conforme necessário
                resultsContainer.appendChild(channelResult);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar canais:', error);
        });
});

function joinChannel(channelId) {
    const joinUrl = `/channels/${channelId}/join`;

    fetch(joinUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (response.ok) {
            // Redireciona para a página do canal com o ID do canal na URL
            window.location.href = `/channel.html?channelId=${channelId}`;
        } else {
            response.text().then(text => {
                console.error('Falha ao entrar no canal:', text);
                alert(text);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao entrar no canal:', error);
    });
}
