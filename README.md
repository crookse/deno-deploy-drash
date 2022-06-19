# Deno Deploy Drash Test

## Usage

### Running the app

```bash
# Set DRASH_COMPILE_TEMPLATES to true so that the templates are precompiled
# If you run this with --watch, then you will run an infinite loop because the
# compilation of templates will cause the directory to change and case --watch
# to fire over and over
export DRASH_COMPILE_TEMPLATES=true && deno run -A app.ts
```

### Compiling templates

In `app.ts`, there is a `tengine.compileTemplates()` call. This call takes in an
array of templates that it should compile and store in the `./views` directory
as `{template}.renderer.js`. For example, if the template you provide is
`index.html`, then it will create an `index.renderer.js` file. Template are
relative to the `views_path` you use when instantiating `TengineService`.

This dev flow is super wack and can def be improved, but... when adding a new
template to be compiled, do the following:

1. Create your template (if not created already).
1. Add your template to the `tengine.compileTemplates()`.
1. Run `export DRASH_COMPILE_TEMPLATES=true && deno run -A app.ts`. This will
   create a `.renderer.js` file (e.g., if you provide `my_cool_page.html`, then
   the renderer file will be `my_cool_page.renderer.js`).
1. Go to `jae_write_file.ts` and add an `import` statement to your
   `.renderer.js` file that was just created. For example:
   ```typescript
   import { buildTemplate as buildMyCoolPage } from "../../views/my_cool_page.renderer.js";
   ```
1. Scroll down until you find `switch (jsPath) { ... }`.
1. Add the renderer to the list of cases. For example:
   ```typescript
   switch (jsPath) {
     case "./views/index.renderer.js":
       return buildIndex(data);
     case "./views/my_cool_page.renderer.js": // Set the case ...
       return buildMyCoolPage(data); // ... and call the renderer
     default:
       break;
   }
   ```
1. Restart your server.

---

## Trials

### Tengine

- Using `Worker` to render templates during runtime. Doesn't work because
  `"Worker is not enabled in this context"` error in Deploy.
- Compiling templates during runtime using `Deno.writeFile()`, caching them, and
  calling them when needed. Didn't work because
  `"Deno.writeFile is not enabled in this context"` error.
- Precompiled the templates before starting the server and stored the templates
  as `.js` files that could be imported during runtime. Didn't work because
  `"Dynamic import is not enabled in this context"` error.

Everything leads me to believe that you need to have as much static data as
possible OR create a single page app.
