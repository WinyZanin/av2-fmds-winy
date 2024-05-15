<template>
    <v-card width="300" class="mx-auto">
        <v-card-item>
            <v-form>
                <v-text-field v-model="nota.nota" :rules="notaRule" label="Anotação" />
                <v-text-field v-model="nota.descricao" :rules="descriRule" label="Descrição" />
                <v-text-field v-model="userStore.user.uid" disabled label="user ID" />
                <v-btn block type="submit" @click="addNota">Adicionar</v-btn>
            </v-form>
        </v-card-item>
    </v-card>
</template>
<script setup>
import { ref } from 'vue'

// importamos o db do arquivo firebase.js
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from '@/plugins/firebase'
const notasCollection = collection(db, 'notas');

// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// variaveis reativas para as notas
const nota = ref({});

// regras de validação
const notaRule = [
    (v) => !!v || 'Campo obrigatório',
]
const descriRule = [
    (v) => !!v || 'Campo obrigatório',
]

// função assincrona para adicionar uma nota
const addNota = async () => {
    //if (!userStore.isAuthenticated || !nota.value.nota || !nota.value.descricao) {
    //    console.log('não autenticado')
    //    return
    //}
    console.log(userStore.user.uid)
    nota.value.userId = userStore.user.uid
    console.log(nota.value)
    await addDoc(notasCollection, { ...nota.value })
    nota.value = {}
}
</script>