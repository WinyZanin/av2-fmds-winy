<template>
    <v-app-bar :elevation="2">
        <template v-slot:prepend>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </template>
        <!-- botões superiores -->
        <template v-slot:append>
            <!-- botão para caso não tenha certeza se está realmente deslogado, está aqui apenas como easter egg -->
            <!-- <v-btn @click="userStore.signOut" color="red">SAIDA DE EMERGÊNCIA</v-btn> -->

            <!-- vai exibir o botão de adicionar apenas se estiver logado -->
            <v-btn v-if="!!userStore.isAuthenticated" color="primary" append-icon="mdi-plus" variant="elevated"
                class="me-2" @click="dialog = !dialog">
                nova anotação
            </v-btn>
        </template>
        <v-app-bar-title>Anotações</v-app-bar-title>
    </v-app-bar>
    <!-- gaveta de navegação fixa, mas pode ser escondida -->
    <v-navigation-drawer v-model="drawer" permanent :width="300">
        <!-- informações de login -->
        <v-list-item v-if="userStore.isAuthenticated" :prepend-avatar="userStore.user.photoURL" lines="2"
            :title="userStore.user.displayName" :subtitle="userStore.user.email">
        </v-list-item>
        <!-- botão de login/logout -->
        <v-list-item class="text-center">
            <v-btn v-if="!!userStore.isAuthenticated" @click="userStore.signOut" color="error"
                append-icon="mdi-logout">Logout</v-btn>
            <v-btn v-else @click="userStore.signIn" color="primary" append-icon="mdi-login">Login</v-btn>
        </v-list-item>
        <v-divider></v-divider>
        <!-- botôes de navegação -->
        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-home" title="Publico" value="home" to="/"></v-list-item>
            <v-list-item v-if="!!userStore.isAuthenticated" prepend-icon="mdi-account" title="Privado" value="private"
                to="/private"></v-list-item>
        </v-list>
    </v-navigation-drawer>

    <!-- dialogo de adição -->
    <v-dialog v-model="dialog" max-width="400">
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
                            <v-btn :disabled="disableAdicionar" @click="addNota" block
                                :loading="loadingDialog">Adicionar</v-btn>
                        </v-form>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';

// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// importamos o db do arquivo firebase.js
import { collection, addDoc, } from 'firebase/firestore';
import db from '@/plugins/firebase'
const notasCollection = collection(db, 'notas');

// variaveis reativas da navegação e dialogos
const drawer = ref(true);           // gaveta de navegação 
const dialog = ref(false);          // dialogo de adição
const loadingDialog = ref(false);   // dialogo de carregamento

// variaveis reativas para as notas
const nota = ref({});       // nota a ser editada, "unica nota", no singular
nota.value.privado = false  // valor padrão para privado

// regras de validação
const notaRule = [
    (v) => !!v || 'Campo obrigatório',
]
const descriRule = [
    (v) => !!v || 'Campo obrigatório',
]

// regra para desabilitar o botão de adicionar se não estiver logado ou campos vazios
const disableAdicionar = computed(() => {
    return !userStore.isAuthenticated || !nota.value.nota || !nota.value.descricao
})

// função assincrona para adicionar uma nota
const addNota = async () => {
    loadingDialog.value = true              // aciona loading do botão
    nota.value.userId = userStore.user.uid  //pega o id do usuario logado
    await addDoc(notasCollection, { ...nota.value })
        .then(() => {
        }).then(() => {
            nota.value = {}
            nota.value.privado = false
            dialog.value = !dialog.value
            loadingDialog.value = false
        })
}
</script>
