import { layout } from "./layout.mjs";

export function loginPage(error = false) {
  const body = `
    <div style="max-width:400px;margin:4rem auto">
      <div class="card">
        <h1 style="text-align:center;margin-bottom:1.5rem">Login</h1>
        ${error ? '<div class="flash flash-error">Usu\u00e1rio ou senha inv\u00e1lidos.</div>' : ""}
        <form method="POST" action="/login">
          <label for="username">Usu\u00e1rio</label>
          <input type="text" id="username" name="username" required autocomplete="username">
          <label for="password">Senha</label>
          <input type="password" id="password" name="password" required autocomplete="current-password">
          <button type="submit" class="btn btn-primary" style="width:100%">Entrar</button>
        </form>
      </div>
    </div>`;

  return layout({ title: "Login", body, authenticated: false });
}
