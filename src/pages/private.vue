<template>
    <!-- se usuario estiver logado carrega componente de notas privadas -->
    <notasPrivadas v-if="!!userStore.isAuthenticated" />
    <!-- se usuario não estiver logado exibe mensagem de erro -->
    <v-container v-else>
        <v-col cols="12">
            <v-alert type="error" dismissible>
                Você precisa estar logado para acessar essa página
            </v-alert>
        </v-col>
    </v-container>
</template>

<script setup>
// importamos a função useUserStore do arquivo stores/user.js
import { useUserStore } from '@/stores/user'
const userStore = useUserStore();

// importamos o componente de notas privadas
import notasPrivadas from '../components/notasPrivadas.vue';
</script>