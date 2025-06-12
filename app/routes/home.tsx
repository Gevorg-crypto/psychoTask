import type { Route } from "./+types/home";
import { store } from "@/store/store";
import PsychologyTest from "@/components/PsychologyTest";
import { Provider } from "react-redux";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <Provider store={store}>
      <PsychologyTest />
    </Provider>
  );
}
