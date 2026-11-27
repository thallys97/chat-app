# Chat App — Chat em Tempo Real com Salas e Canais

Aplicação de chat em tempo real feita com **Node.js, Express, Socket.IO e MongoDB**. Os usuários criam conta, conversam em um chat geral, montam **salas privadas** com amigos ou colegas e participam de **canais públicos** organizados por tema, enviando texto, imagens, vídeos e GIFs.

Serve de base para soluções como chat interno de equipe, atendimento ao cliente em tempo real e comunidades por assunto.

## Funcionalidades

- **Cadastro e login** com senha criptografada (bcrypt) e autenticação por token JWT (expira em 7 dias).
- **Mensagens em tempo real** com Socket.IO, sem recarregar a página.
- **Chat geral** aberto a todos os usuários logados.
- **Salas privadas**: o criador busca usuários, escolhe os participantes e conversa só com eles. Dá para ver os participantes, sair da sala e excluí-la.
- **Canais públicos**: criação com nome e tópico, busca por nome ou tópico, entrada e saída, lista de participantes e exclusão pelo criador.
- **Histórico de mensagens** salvo no MongoDB e carregado ao entrar em uma sala ou canal.
- **Envio de imagens e vídeos** (até 20 MB), armazenados no Cloudinary.
- **Busca e envio de GIFs** pela API do Giphy, sem expor a chave no navegador.
- **Links clicáveis** nas mensagens e **proteção contra injeção de HTML** (o texto é escapado antes de ser exibido).

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Back-end | Node.js, Express, Socket.IO |
| Banco de dados | MongoDB com Mongoose |
| Autenticação | JWT (jsonwebtoken), bcrypt |
| Arquivos | Multer (upload em memória) e Cloudinary |
| APIs externas | Giphy |
| Front-end | HTML, CSS e JavaScript puro |

## Estrutura

```
chat-app/
├── server.js          # Rotas REST, autenticação e eventos do Socket.IO
├── userModel.js       # Usuário (senha com hash antes de salvar)
├── roomModel.js       # Salas privadas
├── channelModel.js    # Canais públicos
├── messageModel.js    # Mensagens (texto, imagem, vídeo, GIF)
└── public/            # Páginas e scripts do front-end
    ├── index.html, script.js        # Chat geral
    ├── chat-room.*, create-room.*   # Salas privadas
    ├── channel.*, create-channel.*, search-channel.*   # Canais
    └── side-bar.js                  # Menu lateral com salas e canais
```

## Como rodar localmente

**Pré-requisitos:** Node.js 18+, MongoDB (local ou [Atlas](https://www.mongodb.com/atlas)), conta gratuita no [Cloudinary](https://cloudinary.com/) e uma chave de API do [Giphy](https://developers.giphy.com/).

```bash
git clone https://github.com/thallys97/chat-app.git
cd chat-app
npm install
cp .env.example .env   # preencha os valores
npm start
```

Abra http://localhost:3000, crie duas contas (em abas ou navegadores diferentes) e converse entre elas.

Variáveis do `.env`:

| Variável | Descrição |
|---|---|
| `MONGO_URI` | String de conexão do MongoDB |
| `JWT_SECRET` | Chave para assinar os tokens. Gere com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GIPHY_API_KEY` | Chave da API do Giphy |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | Credenciais do Cloudinary |
| `PORT` | Porta do servidor (opcional, padrão 3000) |

## Publicação (deploy)

Como o Socket.IO mantém conexões abertas, a aplicação precisa de um servidor Node **contínuo**, como Render, Railway ou uma VPS. Plataformas serverless, como a Vercel, não servem para esse tipo de aplicação.

## Próximos passos

- Testes automatizados (Jest e Supertest)
- Autenticação nas conexões do Socket.IO e na rota de upload
- Limite de tentativas de login e de envio de mensagens
- Indicador de "digitando…" e de usuários online
- Migrar o front-end para React

## Autor

**Thallys** — Desenvolvedor Full Stack (PHP/Laravel e JavaScript)
[GitHub](https://github.com/thallys97)

## Licença

Distribuído sob a licença MIT.
