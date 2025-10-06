import { onRequestPost as __api_generate_image_ts_onRequestPost } from "C:\\Users\\aaron\\Documents\\VibeCodeDnD\\glesolas-game\\functions\\api\\generate-image.ts"
import { onRequestGet as __api_vectorize_ts_onRequestGet } from "C:\\Users\\aaron\\Documents\\VibeCodeDnD\\glesolas-game\\functions\\api\\vectorize.ts"
import { onRequestPost as __api_vectorize_ts_onRequestPost } from "C:\\Users\\aaron\\Documents\\VibeCodeDnD\\glesolas-game\\functions\\api\\vectorize.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\aaron\\Documents\\VibeCodeDnD\\glesolas-game\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/generate-image",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_image_ts_onRequestPost],
    },
  {
      routePath: "/api/vectorize",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_vectorize_ts_onRequestGet],
    },
  {
      routePath: "/api/vectorize",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_vectorize_ts_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]