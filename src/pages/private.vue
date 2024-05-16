<template>
    <v-container v-if="!!userStore.isAuthenticated">
        <a>Minhas Anotações</a>
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
                    <template v-slot:actions>
                        <v-btn color="warning" @click="updateDialog(variant)">Editar</v-btn>
                        <v-btn color="error" @click="notatDelete(variant.id)">Deletar</v-btn>
                    </template>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-container v-else>
        <v-col cols="12">
            <v-alert type="error" dismissible>
                Você precisa estar logado para acessar essa página
            </v-alert>
        </v-col>
    </v-container>
    <dialog>
        <v-dialog v-model="dialogEdit" max-width="400">
            <v-row justify="center">
                <v-col>
                    <v-card width="300" class="mx-auto">
                        <v-card-item>
                            <v-form>
                                <v-text-field v-model="nota.nota" :rules="notaRule" label="Anotação" />
                                <v-text-field v-model="nota.descricao" :rules="descriRule" label="Descrição" />
                                <v-radio-group inline v-model="nota.privado" row>
                                    <v-radio label="Público" :value="false"></v-radio>
                                    <v-radio label="Privado" :value="true"></v-radio>
                                </v-radio-group>
                                <v-btn :disabled="disableAdicionar" @click="updateNota" block
                                    :loading="loadingDialog">Editar</v-btn>
                            </v-form>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
        </v-dialog>
    </dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'

// importamos o db do arquivo firebase.js
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import db from '@/plugins/firebase'
const notasCollection = collection(db, 'notas');
const userCollection = collection(db, 'users');

// import {
//     getAuth 
// } from "firebase/auth";

// const userTemp = getAuth().currentUser;
// console.log(userTemp.uid)

// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// variaveis reativas para as notas
const notas = ref([]);
const users = ref([]);
const nota = ref({});
const dialogEdit = ref(false);

// regras de validação
const notaRule = [
    (v) => !!v || 'Campo obrigatório',
]
const descriRule = [
    (v) => !!v || 'Campo obrigatório',
]

const disableAdicionar = computed(() => {
    return !userStore.isAuthenticated || !nota.value.nota || !nota.value.descricao
})

const loadingDialog = ref(false);

const notasPrivadas = query(notasCollection, where('userId', '==', userStore.user.uid));
//console.log(notasPrivadas)

onMounted(() => {
    onSnapshot(notasPrivadas, (snapshot) => {
        notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    });
    onSnapshot(userCollection, (snapshot) => {
        users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    });
})

const notatDelete = async (id) => {
    await deleteDoc(doc(notasCollection, id))
}

const updateDialog = (notaEdit) => {
    dialogEdit.value = !dialogEdit.value
    nota.value.nota = notaEdit.nota
    nota.value.descricao = notaEdit.descricao
    nota.value.id = notaEdit.id
    nota.value.privado = notaEdit.privado
}

const updateNota = async () => {
    loadingDialog.value = true
    await updateDoc(doc(notasCollection, nota.value.id), { ...nota.value })
        .then(() => {
            nota.value = {}
            dialogEdit.value = !dialogEdit.value
            loadingDialog.value = false
        })
}

const getAuthorAvatar = (userId) => {
    const user = users.value.find(user => user.id === userId)
    return user?.photoURL
}

const getAuthorName = (userId) => {
    const user = users.value.find(user => user.id === userId)
    return user?.displayName
}
</script>