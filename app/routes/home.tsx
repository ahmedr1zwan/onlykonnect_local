import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OnlyKonnect" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
  <>
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">OnlyKonnect</h1>
      <p className="text-lg">Welcome to OnlyKonnect</p>
      <div className="flex flex-col gap-2 items-center">
        <Link to="/start" className="text-blue-500 hover:underline">Start</Link>
        <Link to="/about" className="text-blue-500 hover:underline">About</Link>    
        <Link to="/game-creator" className="text-blue-500 hover:underline">Game Creator</Link>
      </div>
    </div>
  </>
);

}
