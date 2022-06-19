import { Drash } from "./deps.ts";


export class ErrorHandler extends Drash.ErrorHandler {
  public async catch(
    error: Error,
    request: Request,
    response: Drash.Response,
  ): Promise<void> {
    const code = (error instanceof Drash.Errors.HttpError) ? error.code : 500;
    const html = await response.render("/error.html", {
      code,
      error: error.message
    }) as string;

    response.html(html);
  }
}