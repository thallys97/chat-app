async function logout() {
    try {
        const token = localStorage.getItem('token');
        // Envia uma solicitação de logout ao servidor
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` // Envia o token no cabeçalho da requisição
            }
        });

        // Verifica se o logout foi bem-sucedido
        if (response.ok) {
            // Remove o token e o username do armazenamento local
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userID');
            // localStorage.removeItem('userID');
            // localStorage.removeItem('activeChat');

            // Desconecta o socket ao fazer logout
            //socket.disconnect();

            // Recarrega a página
            window.location.href = 'index.html';
        } else {
            // Lida com qualquer erro que possa ter ocorrido durante o logout
            console.error('Falha ao realizar logout');
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', logout );