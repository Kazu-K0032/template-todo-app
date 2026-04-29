import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  theme: "default",
  metaData: {
    title: "Template Todo App API Docs",
  },
});
