# Fazendo o build/start da SPA em local

Verificar se o "micro" está instalado como dependência global do NPM:

    npm -g list

Caso não possua, execute:

    npm install micro@9.4.0 -g

Inicie fazendo o build da SPA:

    yarn build

Copiar arquivo de `"src/configs.json"` para a pasta raiz `"config/configs.json"` e rodar:

    yarn start
