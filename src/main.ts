// Fonts are bundled locally (Hebrew + Latin subsets only) so the app works fully offline.
import "@fontsource/varela-round/hebrew-400.css";
import "@fontsource/varela-round/latin-400.css";
import "@fontsource/rubik/hebrew-500.css";
import "@fontsource/rubik/latin-500.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/latin-700.css";
import "@fontsource/rubik/hebrew-800.css";
import "@fontsource/rubik/latin-800.css";
import "./styles.css";

import { startApp } from "./app";
import { LocalStorage } from "./storage/LocalStorage";

const storage = new LocalStorage();
const root = document.getElementById("app")!;
storage.getSettings().then((settings) => startApp(root, storage, settings));
