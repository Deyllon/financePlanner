# Planejador Financeiro com Protocolo MCP

## Descrição do Projeto

O **Planejador Financeiro** é uma ferramenta que visa otimizar o gerenciamento financeiro pessoal, pode utilizar ia para gerar relatorios ou trazer informações personalizads com base nas metas definidas pelo usuário e nas suas operações financeiras.

## Funcionalidades Principais

- **Definição de Metas**: O usuário pode definir metas financeiras dentro do sistema, como poupança para viagens, aposentadoria, compra de um imóvel, entre outros.
  
- **Integração com API do Pluggy.ai**: Para garantir que os dados financeiros sejam atualizados automaticamente e sem esforço por parte do usuário, a API do **Pluggy.ai** é utilizada. O Pluggy.ai oferece integração direta com diversas contas bancárias e plataformas de pagamento, obtendo as operações financeiras do usuário em tempo real. 

- **Processamento Automático com Cron**: O sistema é configurado para executar uma tarefa cronológica (cron job), que busca automaticamente as operações financeiras do usuário utilizando a API do Pluggy.ai em intervalos regulares. Isso garante que as informações financeiras estejam sempre atualizadas e prontas para análise.

## Como Funciona?

1. **Definição das Metas**: O usuário configura suas metas financeiras, como "economizar R$5.000 para viagem em 12 meses".
   
2. **Integração com Pluggy.ai**: A API do Pluggy.ai é conectada ao sistema, permitindo que o mesmo acesse automaticamente as transações bancárias e outras operações financeiras do usuário.

3. **Execução do Cron Job**: Um cron job é configurado para rodar periodicamente, puxando as últimas operações financeiras do usuário através da API do Pluggy.ai.

4. **Geração de Relatórios**: O sistema utiliza o Protocolo MCP para organizar, gerar relatórios financeiros detalhados.

## Tecnologias Utilizadas

- **Protocolo MCP**: Para organizar, calcular e gerar relatórios financeiros de forma eficiente.
- **API do Pluggy.ai**: Para integrar e automatizar o processo de captura de transações financeiras em tempo real.
- **Cron Jobs**: Para garantir que as operações financeiras sejam capturadas e processadas automaticamente em intervalos regulares.


## Como Começar
docker-compose up -d
cd finance-planner-> npm i -> npm run start:dev
cd mcsServer   -> npm run build -> node build\index.js

## .ENV
- DATABASE_URL
- JWT_SECRET
- CLIENT_ID=YOUR PLUGGY CLIENT ID
- CLIENT_SECRET=YOUR PLUGGY CLIENT SECRET
- PLUGGY_URL=PLUGGY URL
- SALT

## BODY PARA CRIAR PLUGGY ITEM
- SANTANDER = {user: CPF, password: PASSWORD}
- NUBANK = {cpf: CPF, password: PASSWORD}


