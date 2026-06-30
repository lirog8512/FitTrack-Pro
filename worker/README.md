# Vital — analizador de fotos de comida (Cloudflare Worker)

Backend mínimo que recibe una foto desde la app, la envía a la API de Claude
(Anthropic) con visión y devuelve una estimación de macros en JSON. Existe
para que la API key de Anthropic nunca quede expuesta en el frontend
estático (GitHub Pages).

## Despliegue (una sola vez)

1. Instala wrangler si no lo tienes:
   ```
   npm install -g wrangler
   ```
2. Inicia sesión con tu cuenta de Cloudflare:
   ```
   wrangler login
   ```
3. Desde esta carpeta (`worker/`), configura tu API key de Anthropic como
   secreto (no se guarda en el repo, no se sube a git):
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
   Pégala cuando te la pida. Consíguela en https://console.anthropic.com/
4. Despliega:
   ```
   wrangler deploy
   ```
5. Wrangler te dará una URL del tipo:
   ```
   https://vital-food-analyzer.<tu-subdominio>.workers.dev
   ```
   Copia esa URL y reemplaza el valor de `NUTRI_ANALYZER_URL` en
   `index.html` (búscalo cerca del inicio del bloque `<script>` principal).

## Notas

- `ALLOWED_ORIGIN` en `wrangler.toml` restringe quién puede llamar al
  worker (CORS). Si cambias el dominio donde sirves la app, actualízalo.
- El worker limita el tamaño de imagen aceptado (~6MB) para evitar abuso.
- Cada llamada consume créditos de tu cuenta de Anthropic — revisa el uso
  en console.anthropic.com si esperas mucho tráfico.
