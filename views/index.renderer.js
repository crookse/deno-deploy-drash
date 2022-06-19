export function buildTemplate(data) {
  let r = [];
  r.push(
    '<!DOCTYPE html> <html class="h-full w-full">   <head>     <title>Drash + Tengine</title>     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">   </head>   <body style="background: #f4f4f4">       <div style="max-width: 640px; margin: 50px auto;">   <h1 class="text-5xl mb-5">',
  );
  r.push(data.user.name);
  r.push("</h1>   <ul>  ");
  for (let field in data.user.details) {
    r.push("  <!-- Do not show the Phone field -->  ");
    if (field !== "Phone") {
      r.push("  <li>");
      r.push(field);
      r.push(": ");
      r.push(data.user.details[field]);
      r.push("</li>  ");
    }
    r.push("  ");
  }
  r.push(" </ul>  </div>    </body> </html> ");
  return r.join("");
}
