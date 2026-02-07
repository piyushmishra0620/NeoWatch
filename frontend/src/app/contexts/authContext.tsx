"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { signup, login, getUser, logout } from "@/utils/authFunctions";
import { NextResponse } from "next/server";
import SplashScreen from "@/app/components/Splash";

interface User {
  username?: string;
  emailId?: string;
  role?: string;
}

interface AuthType {
  User: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType {
  context: AuthType;
  register: (body: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<any>;
  signin: (body: {
    email: string;
    password: string;
    role: string;
  }) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type action =
  | { type: "setUser"; user: User | null }
  | { type: "setLoading"; loading: boolean }
  | { type: "setIsAuthenticated"; isAuthenticated: boolean };

function reducer(context: AuthType, Action: action) {
  switch (Action.type) {
    case "setUser":
      return { ...context, User: Action.user };
    case "setLoading":
      return { ...context, loading: Action.loading };
    case "setIsAuthenticated":
      return { ...context, isAuthenticated: Action.isAuthenticated };
    default:
      return context;
  }
}

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [context, dispatch] = useReducer(reducer, {
    User: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const session = async () => {
      const response = await getUser();
      const user =
        response?.user || response?.data?.user || response?.data?.success?.user;
      if (user) {
        dispatch({ type: "setUser", user });
        dispatch({ type: "setIsAuthenticated", isAuthenticated: true });
      } else {
        dispatch({ type: "setUser", user: null });
        dispatch({ type: "setIsAuthenticated", isAuthenticated: false });
      }
      dispatch({ type: "setLoading", loading: false });
    };
    setTimeout(() => session(), 10000);
  }, []);

  const register = async (body: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await signup(body);
      if (response.data) {
        const user = response.data?.user || response.data;
        dispatch({ type: "setUser", user });
        dispatch({ type: "setLoading", loading: false });
        dispatch({ type: "setIsAuthenticated", isAuthenticated: true });
        return response.data;
      } else if (response.error) {
        if (response.error == "All fields are required") {
          return { message: "Bad request. All credentials required." };
        } else if (response.error == "User already exists") {
          return { message: "Account already registered." };
        } else {
          return { message: "Server side error occurred." };
        }
      }
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  };

  const signin = async (body: {
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await login(body);
      if (response.data) {
        const user = response.data?.user || response.data;
        dispatch({ type: "setUser", user });
        dispatch({ type: "setLoading", loading: false });
        dispatch({ type: "setIsAuthenticated", isAuthenticated: true });
        return response.data;
      } else if (response.error) {
        if (response.error == "All fields are required") {
          return { message: "Bad Request . All credentials are required." };
        } else if (response.error == "User does not exist") {
          return { message: "Email not registered." };
        } else if (response.error == "Invalid credentials") {
          return { message: "Incorrect Password" };
        } else {
          return { message: "Server side error occurred." };
        }
      }
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  };

  const signOut = async () => {
    try {
      const response = await logout();
      if (response.message == "Session deleted") {
        dispatch({ type: "setUser", user: null });
        dispatch({ type: "setLoading", loading: true });
        dispatch({ type: "setIsAuthenticated", isAuthenticated: false });
        return { message: "Logout Successful" };
      }
      if (response.error) {
        return NextResponse.json(
          { error: response.error.message },
          { status: response.status },
        );
      }
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  };

  if (context.loading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ context, signOut, signin, register }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const contexts = useContext(AuthContext);
  if (!contexts)
    throw new Error("useAuth hook should be used within an AuthProvider");
  return contexts;
};
