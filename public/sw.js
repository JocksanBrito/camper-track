self.addEventListener("install", (event) => {
  console.log("Camper Track SW: Instalado");
});

self.addEventListener("activate", (event) => {
  console.log("Camper Track SW: Ativado");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
