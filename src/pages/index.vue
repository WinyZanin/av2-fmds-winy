<template>
  <v-container>
    <!-- titulo -->
    <v-row justify="center">
      <v-col cols="10">
        <v-card class="text-center">
          <template v-slot:title class="ms-5 text-h4"> Anotações Públicas </template>
        </v-card>
      </v-col>
    </v-row>
    <!-- card com as anotações publicas -->
    <v-row justify="center">
      <v-col v-for="(variant, i) in notas" :key="i" cols="10">
        <v-card class="mx-auto">
          <v-card-title>{{ variant.nota }}</v-card-title>
          <v-card-subtitle>
            <v-chip pill>
              <v-avatar start>
                <v-img :src="getAuthorAvatar(variant.userId)"></v-img>
              </v-avatar>
              {{ getAuthorName(variant.userId) }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>{{ variant.descricao }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// importamos o db do arquivo firebase.js
import { collection, onSnapshot, where, query, } from 'firebase/firestore';
import db from '@/plugins/firebase'
const userCollection = collection(db, 'users');
const notasCollection = collection(db, 'notas');

// variaveis reativas para as notas
const notas = ref([]);
const users = ref([]);
//const nota = ref({});

const notasPublicas = query(notasCollection, where('privado', '==', false));

// função para pegar as anotações e usuarios do banco de dados
onMounted(() => {
  onSnapshot(notasPublicas, (snapshot) => {
    notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });

  onSnapshot(userCollection, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
})

// função para pegar a URL do avatar do autor a partir do id
const getAuthorAvatar = (userId) => {
  const user = users.value.find(user => user.id === userId)
  return user?.photoURL
}

// função para pegar o nome do autor a partir do id
const getAuthorName = (userId) => {
  const user = users.value.find(user => user.id === userId)
  return user?.displayName
}
</script>