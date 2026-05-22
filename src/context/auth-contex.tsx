"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { User } from "@/types";
import { sucessToast, errorToast } from "@/lib/toast";
import mapFirebaseUser from "@/lib/map-firebase-user";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
} from "@/firebase/firebase-config";

import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginLoading: boolean;
  googleLoading: boolean;
  githubLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  githubLogin: () => Promise<void>;
  logout: () => void;
  recoverUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

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
