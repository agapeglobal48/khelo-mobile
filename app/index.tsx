import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { athlete, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect href={athlete ? "/(tabs)" : "/register"} />;
}
