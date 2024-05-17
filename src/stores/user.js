// Utilities
import { defineStore } from "pinia";
import { getApp } from "firebase/app";
// importamos as funções de autenticação do firebase
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    setPersistence,
    inMemoryPersistence,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import db from '@/plugins/firebase';
//import { set } from "core-js/core/dict";

// inicializa a autenticação
const auth = getAuth(getApp());

// faz a sesão ser deslogada ao fechar o navegador ou atualizar a página
setPersistence(auth, inMemoryPersistence)
    .then(() => {
        //console.log("sessão ativa até fechar o navegador ou atualizar a página");
    }
    )

// cria a coleção de usuários
const usersCollection = collection(db, 'users');

// cria a store de usuário
export const useUserStore = defineStore("user", {
    state: () => ({
        user: {
            displayName: null,
            email: null,
            uid: null,
            photoURL: null
        },
    }),
    getters: {
        // retorna se o usuário está autenticado
        isAuthenticated() {
            return !!this.user.uid
        }
    },
    actions: {
        async signIn() {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            this.user = userCredential.user;

            // cria ou atualiza um documento com os dados do usuário no banco de dados
            // o documento é identificado pelo uid do usuário
            await setDoc(doc(usersCollection, this.user.uid), { displayName: this.user.displayName, photoURL: this.user.photoURL })
        },

        async signOut() {
            await signOut(auth);
            this.user = {};
            // redireciona para a página inicial após deslogar
            window.location.href = "/";
        },
    },
});
