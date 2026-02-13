import { layout } from "./layout.mjs";

export function uploadPage({ msg, error } = {}) {
  const body = `
    <div class="card">
      <h1>Upload de Plugin</h1>
      ${msg ? `<div class="flash flash-success">${msg}</div>` : ""}
      ${error ? `<div class="flash flash-error">${error}</div>` : ""}
      <form method="POST" action="/admin/upload" enctype="multipart/form-data">
        <label for="plugin">Arquivo ZIP do plugin</label>
        <input type="file" id="plugin" name="plugin" accept=".zip" required>
        <p class="text-muted" style="margin-top:-0.5rem;margin-bottom:1rem">
          Selecione um arquivo .zip (m\u00e1ximo 200MB). O nome original do arquivo ser\u00e1 preservado.
        </p>
        <button type="submit" class="btn btn-primary">Enviar Plugin</button>
      </form>
    </div>`;

  return layout({ title: "Upload", body, authenticated: true });
}
