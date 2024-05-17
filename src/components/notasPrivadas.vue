<template>
    <v-container>
        <!-- titulo e filtros -->
        <v-row justify="center">
            <v-col cols="10">
                <v-card class="text-center">
                    <template v-slot:title class="ms-5 text-h4"> Minhas Anotações </template>
                    <v-row>
                        <v-col cols="12">
                            <v-divider></v-divider>
                            <v-sheet class="pa-2">
                                <v-col class="py-2 d-flex align-center flex-column">
                                    <p>Filtro:</p>
                                    <!-- botões de filtro -->
                                    <v-btn-toggle v-model="privadoFiltro" mandatory borderless @click="filtro">
                                        <v-btn :value=true>
                                            <span class="hidden-sm-and-down">Privados</span>
                                            <v-icon end color="error">
                                                mdi-lock
                                            </v-icon>
                                        </v-btn>
                                        <v-btn :value="false">
                                            <span class="hidden-sm-and-down">publicos</span>
                                            <v-icon end color="warning">
                                                mdi-lock-open
                                            </v-icon>
                                        </v-btn>
                                        <!-- tive que usar @click pois :value=null estava retornando 2 e não null, vai saber pq... -->
                                        <v-btn @click="privadoFiltro = null">
                                            <span class="hidden-sm-and-down">todos</span>
                                            <v-icon end color="primary">
                                                mdi-all-inclusive
                                            </v-icon>
                                        </v-btn>
                                    </v-btn-toggle>
                                </v-col>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
        <!-- card com as anotações privadas  -->
        <v-row justify="center">
            <v-col v-for="(variant, i) in notasFiltradas" :key="i" cols="10">
                <v-card class="mx-auto">
                    <v-card-title>{{ variant.nota }}</v-card-title>
                    <v-card-subtitle>
                        <v-chip pill class="me-1">
                            <v-avatar start>
                                <v-img :src="getAuthorAvatar(variant.userId)"></v-img>
                            </v-avatar>
                            {{ getAuthorName(variant.userId) }}
                        </v-chip>
                        <v-tooltip text="Essa nota é privada" location="end center" origin="start center">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" v-if="variant.privado" color="red">mdi-lock</v-icon>
                            </template>
                        </v-tooltip>
                    </v-card-subtitle>
                    <v-card-text>{{ variant.descricao }}</v-card-text>
                    <!-- botões de editar e deletar -->
                    <template v-slot:actions>
                        <v-btn color="warning" @click="updateDialog(variant)">Editar</v-btn>
                        <v-btn color="error" @click="notatDelete(variant.id)">Deletar</v-btn>
                    </template>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <!-- dialog de edição -->
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
import { collection, onSnapshot, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import db from '@/plugins/firebase'
const notasCollection = collection(db, 'notas');
const userCollection = collection(db, 'users');

// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// variaveis reativas para as notas
const notas = ref([]);          // todas as notas
const users = ref([]);          // todos os usuarios
const nota = ref({});           // nota a ser editada, "unica nota", no singular
const dialogEdit = ref(false);  // dialog de edição
const privadoFiltro = ref(true) // filtro de privado
const notasFiltradas = ref([])  // notas filtradas

// função para filtrar as notas
const filtro = () => {
    if (privadoFiltro.value === null) {
        notasFiltradas.value = notas.value
    } else if (privadoFiltro.value === true) {
        notasFiltradas.value = notas.value.filter(nota => nota.privado === privadoFiltro.value)
    } else {
        notasFiltradas.value = notas.value.filter(nota => nota.privado === privadoFiltro.value)
    }
}

// regras de validação
const notaRule = [
    (v) => !!v || 'Campo obrigatório',
]
const descriRule = [
    (v) => !!v || 'Campo obrigatório',
]

// variavel reativa para desabilitar o botão de adicionar caso não esteja logado ou campos vazios
const disableAdicionar = computed(() => {
    return !userStore.isAuthenticated || !nota.value.nota || !nota.value.descricao
})

// variavel reativa para o loading do dialog
const loadingDialog = ref(false);

// query para pegar as notas apenas do usuario logado
// nas regras do firestore, só vai retornar as notas privadas se incluir o userId do usuario logado
// se não, só vai retornar as notas publicas
// allow read: if (request.auth != null && request.auth.uid == resource.data.userId) || !resource.data.privado;
const notasPrivadas = query(notasCollection, where('userId', '==', userStore.user.uid));

// função para pegar as anotações e usuarios do banco de dados
// executa quando o componente é montado
onMounted(() => {
    onSnapshot(notasPrivadas, (snapshot) => {
        notas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        filtro() // executa o filtro, importante estar aqui para garantir que as notas sejam exibidas
    });

    onSnapshot(userCollection, (snapshot) => {
        users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    });
})

// função assincrona para deletar uma nota no banco de dados
const notatDelete = async (id) => {
    await deleteDoc(doc(notasCollection, id))
}

// função para abrir o dialog de edição e preencher os campos
const updateDialog = (notaEdit) => {
    dialogEdit.value = !dialogEdit.value
    nota.value.nota = notaEdit.nota
    nota.value.descricao = notaEdit.descricao
    nota.value.id = notaEdit.id
    nota.value.privado = notaEdit.privado
}

// função assincrona para editar uma nota no banco de dados
const updateNota = async () => {
    loadingDialog.value = true
    await updateDoc(doc(notasCollection, nota.value.id), { ...nota.value })
        .then(() => {
            nota.value = {}
            dialogEdit.value = !dialogEdit.value
            loadingDialog.value = false
        })
}

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