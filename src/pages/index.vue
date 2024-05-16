<template>
  <v-container>
    <v-row justify="center">
      <a>Anotações Publicas</a>
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
import { collection, addDoc, onSnapshot, where, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from '@/plugins/firebase'
const userCollection = collection(db, 'users');
const notasCollection = collection(db, 'notas');

// variaveis reativas para as notas
const notas = ref([]);
const users = ref([]);
//const nota = ref({});

const q = query(notasCollection, where('privado', '==', false));

onMounted(() => {
  //onSnapshot(notasCollection, (snapshot) => {
  //  notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  //});
  onSnapshot(q, (snapshot) => {
    notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });

  onSnapshot(userCollection, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
})

const getAuthorAvatar = (userId) => {
  const user = users.value.find(user => user.id === userId)
  return user?.photoURL
}

const getAuthorName = (userId) => {
  const user = users.value.find(user => user.id === userId)
  return user?.displayName
}
</script>