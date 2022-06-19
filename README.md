# Deno Deploy Drash Test

## Usage

```
export DRASH_COMPILE_TEMPLATES=true && deno run -A --watch app.ts
```

## Trials

### Tengine

- Using `Worker` to render templates during runtime. Doesn't work because `"Worker is not enabled in this context"` error in Deploy.
- Compiling templates during runtime using `Deno.writeFile()`, caching them, and calling them when needed. Didn't work because `"Deno.writeFile is not enabled in this context"` error.
- Precompiled the templates before starting the server and stored the templates as `.js` files that could be imported during runtime. Didn't work because `"Dynamic import is not enabled in this context"` error.

Everything leads me to believe that you need to have as much static data as possible OR create a single page app.