import { ConnInfo, Drash } from "../../deps.ts";
import { Jae } from "./jae_write_file.ts";
// import { Jae } from "./jae.ts";

interface IOptions {
  // deno-lint-ignore camelcase
  views_path: string;
}

export class TengineService extends Drash.Service {
  readonly #options: IOptions;
  #template_engine: Jae;
  #resources: Map<number, { resource: Drash.Resource }> = new Map<
    number,
    { resource: Drash.Resource }
  >();

  constructor(options: IOptions) {
    super();
    this.#options = options;
    this.#template_engine = new Jae(this.#options.views_path);
  }

  compileTemplates(templatePaths: string[]): void {
    console.log("Compiling templates.");
    templatePaths.forEach((templatePath: string) => {
      console.log(`  -> Compiling ${templatePath}`);
      this.#template_engine.render(
        "/" + templatePath,
        {},
      );
    });
  }

  runAtStartup(options: Drash.Interfaces.IServiceStartupOptions): void {
    // Store the reference to the resources on the server to this service so
    // this service can run them and compile all templates
    this.#resources = options.resources;
  }

  runBeforeResource(_request: Drash.Request, response: Drash.Response) {
    response.headers.set("Content-Type", "text/html");
    console.log("We're running before resource.");
    // @ts-ignore
    response.render = async (filepath: string, data: unknown) => {
      return await this.#template_engine.render(filepath, data);
    };
  }
}
