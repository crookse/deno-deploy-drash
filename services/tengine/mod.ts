import { Drash } from "../../deps.ts";
import { Jae } from "./jae_write_file.ts";

interface IOptions {
  // deno-lint-ignore camelcase
  views_path: string;
}

export class TengineService extends Drash.Service {
  readonly #options: IOptions;
  #template_engine: Jae;

  constructor(options: IOptions) {
    super();
    this.#options = options;
    this.#template_engine = new Jae(this.#options.views_path);
  }

  runBeforeResource(_request: Drash.Request, response: Drash.Response) {
    response.headers.set("Content-Type", "text/html");
    // @ts-ignore
    response.render = async (filepath: string, data: unknown) => {
      return await this.#template_engine.render(filepath, data);
    };
  }
}
