import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "",
  url(slugs) {
    return slugs.length === 0 ? "/" : `/${slugs.join("/")}`;
  },
});
