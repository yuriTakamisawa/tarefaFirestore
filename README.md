# Antes de usar
> Substitua o arquivo "Sua_chave_da_API_firebase.json" pelo arquivo referente a chave da API do seu banco <Br>
> Altere também a referência a sua chave na variavel serviceAccount, dentro do App.js
```javascript
// firebase
var serviceAccount = require("./sua_chave_da_API_firebase.json") // MUDE AQUI TAMBEM;

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
```
