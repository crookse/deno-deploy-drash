import { Drash } from "../deps.ts";

export class HomeResource extends Drash.Resource {
  public paths = ["/"];

  public async GET(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
    const templateVariables = {
      user: {
        name: "Jae",
        details: {
          "Role": "Software Engineer",
          "Phone": "(555) 555-5555",
          "E-mail": "jae@example.com",
        },
      },
    };

    const html = await response.render(
      "/index.html",
      templateVariables,
    ) as string;

    response.html(html);
  }
}