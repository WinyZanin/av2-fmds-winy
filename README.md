# Avaliação 02 FMDS 2024/1

Sistema de criação de anotações, com controle de usuarios com autentificação do google Firebase, construido a partir de VUE 3, vuetify, pinia, banco de dados Firestore.
O sistema tem controle de notas privadas e publicas com segurança imposta nas regras do Firestore.

## Regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
		match /notas/{notaId}{
    
    	// Permitir leitura para todos se "privado" for false, senão apenas para o usuário correspondente
      allow read: if (request.auth != null && request.auth.uid == resource.data.userId) || !resource.data.privado;
      
      // Permitir criação para qualquer usuário autenticado
      allow create: if request.auth != null;

      // Permitir atualização e exclusão apenas se o userId no documento for igual ao uid do usuário autenticado
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users/{uID}/{documents=**}{
    	allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uID
    }
  }
}
```
