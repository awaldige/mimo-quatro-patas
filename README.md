#
🐾 Mimo Quatro Patas

## Loja virtual para cães e gatos

O **Mimo Quatro Patas** é uma plataforma de e-commerce desenvolvida para a comercialização de produtos para cães e gatos, com arquitetura preparada para operação no modelo de **dropshipping**.

O projeto foi desenvolvido com foco em uma experiência de compra simples, responsiva e moderna, além de contar com uma área administrativa para gerenciamento de produtos, categorias, fornecedores, pedidos, cupons, avaliações e fluxo de fornecedores.

---

## 🚀 Sobre o projeto

A plataforma permite que clientes naveguem pelos produtos, filtrem categorias, consultem detalhes dos itens, adicionem produtos ao carrinho e realizem pedidos através de um checkout completo.

O sistema também possui uma estrutura administrativa para gerenciamento da operação da loja e recursos específicos para o modelo de dropshipping.

### Principais objetivos

- Criar uma experiência de compra moderna e responsiva
- Organizar produtos e categorias
- Permitir gerenciamento administrativo da loja
- Controlar pedidos e seus respectivos status
- Gerenciar fornecedores e informações de fornecimento
- Implementar fluxo operacional de dropshipping
- Trabalhar com cupons de desconto
- Permitir avaliações de produtos e da loja
- Aplicar boas práticas de SEO
- Manter frontend e backend organizados em um único repositório

---

# ✨ Funcionalidades

## 🛍️ Loja

- Página inicial da loja
- Hero section
- Categorias de produtos
- Produtos em destaque
- Produtos mais vendidos
- Ofertas
- Página de produtos
- Filtro por categoria
- Página individual do produto
- Controle de estoque
- Preço promocional
- Cálculo de desconto
- Carrinho de compras
- Persistência do carrinho no navegador
- Checkout
- Página de pedido confirmado
- Layout responsivo

---

## 🛒 Carrinho

O carrinho permite:

- Adicionar produtos
- Remover produtos
- Alterar quantidade
- Controle de quantidade conforme estoque
- Cálculo automático do subtotal
- Aplicação de preço promocional
- Cálculo do valor total
- Persistência utilizando `localStorage`

---

## 💳 Checkout

O checkout possui:

- Dados do cliente
- Endereço de entrega
- CEP
- Cálculo demonstrativo de frete
- Cupons de desconto
- Resumo do pedido
- Métodos de pagamento demonstrativos
- PIX
- Cartão
- Boleto
- Criação do pedido
- Vinculação do cupom utilizado
- Redirecionamento para confirmação do pedido

> Os métodos de pagamento atualmente possuem finalidade demonstrativa e não estão conectados a um gateway financeiro real.

---

# 🎟️ Cupons

O sistema possui gerenciamento de cupons de desconto.

Recursos:

- Cadastro de cupons
- Edição de cupons
- Ativação e desativação
- Validação do código
- Valor mínimo do pedido
- Controle de validade
- Desconto por percentual
- Desconto por valor
- Aplicação do desconto no checkout
- Registro do cupom utilizado no pedido

---

# ⭐ Avaliações

A plataforma possui sistema de avaliações.

### Produtos

- Avaliação por estrelas
- Comentário
- Controle de aprovação
- Controle de status
- Média das avaliações
- Quantidade de avaliações
- Exibição das avaliações na página do produto

### Loja

Também existe estrutura para avaliações gerais da loja.

---

# 🔐 Área administrativa

A plataforma possui uma área administrativa para gerenciamento da operação.

### Recursos administrativos

- Dashboard
- Login administrativo
- Gerenciamento de produtos
- Cadastro de produtos
- Edição de produtos
- Cadastro de produtos em lote
- Gerenciamento de categorias
- Upload de imagens
- Gerenciamento de fornecedores
- Gerenciamento de pedidos
- Gerenciamento de cupons
- Gerenciamento de avaliações
- Relatórios

---

# 📦 Dropshipping

O projeto possui estrutura específica para operação de dropshipping.

Cada produto pode possuir informações relacionadas ao fornecedor, como:

- Fornecedor
- SKU do fornecedor
- Custo do fornecedor
- Link do fornecedor

Os itens do pedido também armazenam informações do fornecedor no momento da compra, permitindo manter um registro das informações utilizadas no pedido.

---

## 🔄 Fluxo do pedido no fornecedor

O sistema possui um fluxo específico para acompanhamento do pedido junto ao fornecedor:

```text
AGUARDANDO_FORNECEDOR
        ↓
ENCAMINHADO_FORNECEDOR
        ↓
PEDIDO_FORNECEDOR_REALIZADO
        ↓
AGUARDANDO_ENVIO
        ↓
ENVIADO
        ↓
ENTREGUE

Também são registradas informações como:

Número do pedido do fornecedor
Data de encaminhamento
Data do pedido ao fornecedor
Data de envio
Data de entrega

Isso permite acompanhar o pedido desde sua criação até a conclusão do processo de fornecimento.

🏗️ Arquitetura

O projeto utiliza uma arquitetura separada entre frontend e backend, mantida dentro do mesmo repositório.

mimo-quatro-patas/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── scripts/
│   │
│   ├── server.js
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── carrinho/
│   │   ├── categorias/
│   │   ├── checkout/
│   │   ├── ofertas/
│   │   ├── produtos/
│   │   ├── pedido-confirmado/
│   │   ├── layout.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   │
│   ├── components/
│   ├── public/
│   ├── services/
│   ├── package.json
│   └── next.config.ts
│
├── .gitignore
└── README.md
💻 Tecnologias utilizadas
Frontend
Next.js
React
TypeScript
Tailwind CSS
Next.js App Router
Backend
Node.js
Express
Prisma ORM
PostgreSQL
Multer
Desenvolvimento e infraestrutura
Git
GitHub
PostgreSQL
Prisma Migrations
REST API
🗄️ Banco de dados

O projeto utiliza PostgreSQL como banco de dados e Prisma ORM para comunicação com a aplicação.

O schema possui estruturas relacionadas a:

Categorias
Produtos
Fornecedores
Pedidos
Itens de pedidos
Cupons
Avaliações
Administradores

As alterações estruturais do banco são controladas através das migrations do Prisma.

🔌 API

O backend disponibiliza endpoints REST para gerenciamento dos principais recursos da plataforma.

Principais grupos de rotas:

/api/status
/api/categorias
/api/produtos
/api/fornecedores
/api/pedidos
/api/admin
/api/cupons
/api/avaliacoes
/api/relatorios
Exemplos
GET /api/status
GET /api/categorias
GET /api/produtos
GET /api/produtos/:id
GET /api/fornecedores
GET /api/pedidos
POST /api/pedidos
POST /api/cupons/validar
📸 Imagens e uploads

O backend possui suporte para upload de imagens utilizando Multer.

Os arquivos enviados são disponibilizados através da rota:

/uploads

O frontend possui tratamento para normalizar as URLs das imagens provenientes do backend.

🔎 SEO

O projeto possui uma estrutura inicial de SEO utilizando recursos nativos do Next.js.

Implementações realizadas:

Metadata global
Title
Description
Keywords
Open Graph
Twitter Cards
Robots
Sitemap
Metadata específica para produtos
Schema.org para produtos
Sitemap

O sitemap é gerado dinamicamente considerando os produtos ativos da loja.

/sitemap.xml
Robots
/robots.txt

As áreas administrativas e páginas que não devem ser indexadas possuem regras específicas de bloqueio.

📱 Responsividade

A interface foi desenvolvida para funcionar em diferentes tamanhos de tela:

📱 Smartphones
📲 Tablets
💻 Notebooks
🖥️ Desktops

O layout utiliza Tailwind CSS para adaptação responsiva dos componentes.

⚙️ Instalação
1. Clonar o repositório
git clone https://github.com/awaldige/mimo-quatro-patas.git

Entrar no projeto:

cd mimo-quatro-patas
🔧 Configuração do Backend

Entrar na pasta:

cd backend

Instalar as dependências:

npm install

Criar o arquivo de ambiente:

.env

Exemplo:

DATABASE_URL="sua_connection_string_postgresql"
PORT=3001

Não utilize informações reais no README. As credenciais do banco devem permanecer somente no arquivo .env.

🗄️ Configurar o Prisma

Executar as migrations:

npx prisma migrate dev

Gerar o Prisma Client:

npx prisma generate
▶️ Executar o Backend
npm run dev

O backend será executado, por padrão, em:

http://localhost:3001
🎨 Configuração do Frontend

Em outro terminal:

cd frontend

Instalar as dependências:

npm install

Criar o arquivo:

.env.local

Exemplo:

NEXT_PUBLIC_API_URL=http://localhost:3001/api
▶️ Executar o Frontend
npm run dev

A aplicação estará disponível em:

http://localhost:3000
🧪 Ambiente de desenvolvimento

Para executar o projeto localmente, são necessários:

Node.js
npm
PostgreSQL
Git

Verificar a versão do Node:

node -v

Verificar o npm:

npm -v
🔒 Segurança

Arquivos sensíveis não devem ser versionados.

O projeto utiliza .gitignore para impedir o envio de:

.env
.env.*
node_modules/
.next/
uploads/

Nunca publique:

Senhas
Tokens
Chaves de API
Credenciais do banco
Informações privadas de fornecedores
Credenciais administrativas
📈 Possíveis evoluções

O projeto possui uma base preparada para futuras melhorias, incluindo:

Integração com gateway de pagamento real
Integração com fornecedores reais
Automação do encaminhamento de pedidos
Integração com APIs de fornecedores
Rastreamento de pedidos
Cálculo de frete integrado
Autenticação de clientes
Cadastro de clientes
Recuperação de senha
Integração com ferramentas de analytics
Melhorias avançadas de SEO
Integração com plataformas de marketing
Notificações automáticas
Automação completa do fluxo de dropshipping
🚀 Status do projeto

Em desenvolvimento

O projeto encontra-se em evolução contínua, com a estrutura principal da loja, administração, pedidos, cupons, avaliações, fornecedores e fluxo de dropshipping implementados.

📂 Repositório

O código-fonte está disponível no GitHub:

Mimo Quatro Patas

https://github.com/awaldige/mimo-quatro-patas

👨‍💻 Desenvolvedor

Desenvolvido por André Waldige

AW TECHNOLOGY

Soluções inteligentes em software para negócios.

Sistemas Web
ERPs
Automação
E-commerce
Desenvolvimento sob medida