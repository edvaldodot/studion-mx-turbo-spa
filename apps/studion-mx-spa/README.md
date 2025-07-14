# New Code Base - Vue 3 + TypeScript + Vite


![Static Badge](https://img.shields.io/badge/Status-Em_desenvolvimento-green)
![Static Badge](https://img.shields.io/badge/Node-24.0-blue)

# 🛠️ Tecnologias adotadas

- Vue + Vite - Typescript / Composition API
- VueRouter
- Pinia (Storage local)
- Tailwind (Componentes visuais)
- Vitest + Cypress (Teste unitário e E2E)


# 📁 Estrutura de Repositórios

<pre>
├── public/                # Arquivos públicos (favicon, manifest, etc.)
├── src/
│   ├── domains/           # Serviços e chamadas de API
│   ├── assets/            # Imagens, fontes, arquivos estáticos
│   ├── components/        # Componentes reutilizáveis
│   ├── layouts/           # Layouts da aplicação (header, footer, etc.)
│   ├── router/            # Configuração do Vue Router
│   ├── store/             # Gerenciamento de estado (Pinia)
│   ├── styles/            # Estilos globais (CSS/SASS)
│   ├── support/           # Configurações de bibliotecas (Axios, i18n, etc...)
│   ├── utils/             # Funções e helpers reutilizáveis
│   ├── views/             # Telas principais da aplicação
│   ├── App.vue            # Componente raiz
│   ├── main.ts            # Ponto de entrada da aplicação
├── vite.config.ts         # Configurações do Vite
├── package.json           # Dependências do projeto
├── tsconfig.json          # Configurações do TypeScript
</pre>


# ✔️ Etapas de Desenvolvimento

- i18n 
  - Contexto Global
  - Separados por dominio
  - Importar o Extract (verifica chaves faltantes)
  - Extrutura de sobreposição por cliente

- Temas
  - Cores do tema principal
  - Segundo momento a gente discute a customização

- Váriaveis de Ambiente
  - Fetch no Studion existente
  - .env

- Axios
  - Configurar os parametros de request

- Keycloak
  - Analizar a complexidade
  - Fazer alguns testes de redirect

- Analytics
  - Configurar o Analytics
  - ./mixins/analyticsMixin
  - Guardar as keys - Ryan

- Components Gerais