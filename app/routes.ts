import { type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("start", "routes/start.tsx"),
    route("game-creator", "routes/game-creator.tsx")
] satisfies RouteConfig;
