"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

// Libraries
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

// Firebase / Services
import {
  auth,
  githubProvider,
  googleProvider,
} from "@/firebase/firebase-config";

// Utils
import mapFirebaseUser from "@/lib/map-firebase-user";
import { errorToast, sucessToast } from "@/lib/toast";

// Types
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginLoading: boolean;
  googleLoading: boolean;
  githubLoading: boolean;
  updateNameLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  githubLogin: () => Promise<void>;
  logout: () => void;
  recoverUser: () => void;
  handleUpdateName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [updateNameLoading, setUpdateNameLoading] = useState(false);

  const router = useRouter();

  // Recupera o usuário do localStorage ao carregar o provedor
  const recoverUser = async () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
      router.push("/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    recoverUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoginLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        pass,
      );
      const loggedUser = mapFirebaseUser(userCredential.user, true);

      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      sucessToast("Login realizado com sucesso");

      router.push("/dashboard");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Erro ao logar: ${errorCode} - ${errorMessage}`);

      switch (errorCode) {
        case "auth/user-not-found":
          errorToast("Usuário não encontrado");
          break;
        case "auth/wrong-password":
          errorToast("Senha incorreta");
          break;
        case "auth/missing-email":
          errorToast("Preencha todos os campos");
          break;
        case "auth/missing-password":
          errorToast("Preencha todos os campos");
          break;
        case "auth/invalid-credential":
          errorToast("Email ou senha inválidos");
          break;
        case "auth/invalid-email":
          errorToast("Email inválido");
          break;
        default:
          errorToast(`Erro ao logar: ${errorMessage}`);
          break;
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const googleLogin = async () => {
    setGoogleLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const loggedUser = mapFirebaseUser(userCredential.user, false);

      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      sucessToast("Login realizado com sucesso");

      router.push("/dashboard");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Erro ao registrar: ${errorCode} - ${errorMessage}`);

      switch (errorCode) {
        case "auth/popup-closed-by-user":
          errorToast("Popup fechado pelo usuário");
          break;
        default:
          errorToast(`Erro ao logar com Google: ${errorMessage}`);
          break;
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const githubLogin = async () => {
    setGithubLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const loggedUser = mapFirebaseUser(userCredential.user, false);

      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      sucessToast("Login realizado com sucesso");

      router.push("/dashboard");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Erro ao registrar: ${errorCode} - ${errorMessage}`);

      switch (errorCode) {
        case "auth/popup-closed-by-user":
          errorToast("Popup fechado pelo usuário");
          break;
        case "auth/account-exists-with-different-credential":
          errorToast("Já existe uma conta vinculada a esse email");
          break;
        default:
          errorToast(`Erro ao logar com GitHub: ${errorMessage}`);
          break;
      }
    } finally {
      setGithubLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");

    router.push("/login");
  };

  const handleUpdateName = async (newName: string) => {
    setUpdateNameLoading(true);

    if (!auth.currentUser) {
      errorToast("Erro ao atualizar o nome");
      setUpdateNameLoading(false);
      return;
    }

    if (!newName || newName === "") {
      errorToast("Preencha o campo de nome");
      setUpdateNameLoading(false);
      return;
    }

    if (newName === user?.name) {
      errorToast("O nome já é esse");
      setUpdateNameLoading(false);
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUser((prevUser) => (prevUser ? { ...prevUser, name: newName } : null));
      localStorage.setItem("user", JSON.stringify(user));

      sucessToast("Nome atualizado com sucesso!");
    } catch (error) {
      errorToast("Erro ao atualizar o nome");
      console.log(error);
    } finally {
      setUpdateNameLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginLoading,
        googleLoading,
        login,
        googleLogin,
        githubLogin,
        githubLoading,
        logout,
        recoverUser,
        handleUpdateName,
        updateNameLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
