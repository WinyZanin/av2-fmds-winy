// Utilities
import { defineStore } from "pinia";
import { getApp } from "firebase/app";
// importamos as funções de autenticação do firebase
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import db from '@/plugins/firebase';

const auth = getAuth(getApp())
const usersCollection = collection(db, 'users');

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
        isAuthenticated() {
            return !!this.user.uid
        }
    },
    actions: {
        async signIn() {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            this.user = userCredential.user;

            await setDoc(doc(usersCollection, this.user.uid), { displayName: this.user.displayName, photoURL: this.user.photoURL })
        },

        async signOut() {
            await signOut(auth);
            this.user = {};
        },
    },
});
