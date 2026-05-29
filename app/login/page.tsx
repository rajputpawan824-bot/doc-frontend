import { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login | Clinic Management",
  description: "Log in to your clinic management account",
};

export default function LoginPage() {
  return <LoginClient />;
}
