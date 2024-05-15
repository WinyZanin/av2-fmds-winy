<template>
    <v-app-bar :elevation="2">
        <template v-slot:prepend>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </template>
        <template v-slot:append>
            <v-btn @click="userStore.signOut" color="red">SAIDA DE EMERGÊNCIA</v-btn>
            <v-btn color="primary" append-icon="mdi-plus" variant="elevated" class="me-2" @click="dialog = !dialog">
                nova anotação
            </v-btn>
        </template>
        <v-app-bar-title>Anotações</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" permanent :width="300">
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
            <v-list-item prepend-icon="mdi-home-city" title="Publico" value="home" to="/"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Privado" value="private" to="/private"></v-list-item>
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
                            <!-- <v-text-field v-model="userStore.user.uid" disabled label="user ID" /> -->
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

const drawer = ref(true);
const dialog = ref(false);
const loadingDialog = ref(false);

// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// importamos o db do arquivo firebase.js
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from '@/plugins/firebase'
const notasCollection = collection(db, 'notas');

// variaveis reativas para as notas
const nota = ref({});

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

// função assincrona para adicionar uma nota
const addNota = async () => {
    loadingDialog.value = true
    nota.value.userId = userStore.user.uid
    await addDoc(notasCollection, { ...nota.value })
        .then(() => {
        }).then(() => {
            nota.value = {}
            dialog.value = !dialog.value
            loadingDialog.value = false
        })
}
</script>
