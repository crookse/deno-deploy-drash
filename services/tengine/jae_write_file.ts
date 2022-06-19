import { deferred } from "../../deps.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

interface Renderer {
  buildTemplate(data: unknown): string;
}

export class Jae {
  /**
   * A property to hold the base path to the template(s).
   */
  public views_path = "";

  #written_files: string[] = [];
  #renderers: Map<string, unknown> = new Map<string, unknown>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param viewsPath - The base path to the template(s).
   */

  constructor(viewsPath: string) {
    console.log("Executing Jae");
    this.views_path = viewsPath;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Render a template file and replace all template variables with the
   * specified data.
   *
   * @param template - The template to render.
   * @param data - The data that should be rendered with the template.
   *
   * @remarks
   * For example, the data could be...
   *     ```json
   *     {
   *       name: "John"
   *     }
   *     ```
   * and the template would render "John" in <% name %>.
   * This data can be anything and everything. It contains the data that the
   * template engine will use for template variable replacement.
   * @returns The html to be rendered
   */
  public async render(template: string, data: unknown): Promise<string> {
    let code = "export function buildTemplate(data) { let r = [];\n";
    let cursor = 0;
    let match;
    const filepath = this.views_path + template;
    let html: string = decoder.decode(
      await Deno.readFile(filepath),
    );

    // Check if the template extends another template. If it does, then replace
    // the <% yield %> variable with the template that is extending (not the one
    // that is being extended).
    const extended = html.match(/<% extends.* %>/g);
    if (extended) {
      for (let i in extended) {
        const m: string = extended[i];
        html = html.replace(m, "");
        let template = m.replace('<% extends("', "").replace('") %>', "");
        const path = this.views_path + template;
        template = decoder.decode(
          await Deno.readFile(path),
        );
        html = template.replace("<% yield %>", html);
      }
    }

    // Check for partials
    let partials;
    while ((partials = html.match(/<% include_partial.* %>/g))) {
      for (let i in partials) {
        const m: string = partials[i];
        let template = m
          .replace('<% include_partial("', "")
          .replace('") %>', "");
        const path = this.views_path + template;
        template = decoder.decode(
          await Deno.readFile(path),
        );
        html = html.replace(m, template);
      }
      break;
    }

    // The following code was taken from (and modified):
    // https://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
    // Thanks, Krasimir!
    const re = /<%(.+?)\%>/g;
    const reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g;
    function add(line: string, js: unknown | null = null) {
      js
        ? (code += line.match(reExp) ? line + "\n" : "r.push(" + line + ");\n")
        : (code += line != ""
          ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n'
          : "");
      return add;
    }

    while ((match = re.exec(html))) {
      add(html.slice(cursor, match.index));
      add(match[1], true);
      cursor = match.index + match[0].length;
    }

    add(html.substr(cursor, html.length - cursor));
    code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, " ");

    try {
      if (!data) {
        data = {};
      }

      // TODO(ericc): Performance degradation here since we add/remove the
      // event listener on every request. Need a way to keep the event listern
      // active and take in a new `deferred()` call every time it's called.

      const jsPath = this.views_path + template.replace("html", "renderer.js");
      let renderer = this.#renderers.get(jsPath);
      if (!renderer) {
        renderer = await import(
          await Deno.realPath(jsPath)
        );
        this.#renderers.set(jsPath, renderer);
      }

      return (renderer as Renderer).buildTemplate(data);
    } catch (err) {
      console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
    }

    return "";
  }
}
