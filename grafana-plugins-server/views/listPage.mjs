import { layout } from "./layout.mjs";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function listPage(plugins, { msg, error } = {}) {
  const rows = plugins
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${formatSize(p.size)}</td>
      <td>${formatDate(p.modified)}</td>
      <td>
        <div class="actions">
          <a href="/download/${encodeURIComponent(p.name)}" class="btn btn-download">Baixar</a>
          <form method="POST" action="/admin/delete/${encodeURIComponent(p.name)}"
                id="delete-form-${encodeURIComponent(p.name)}">
            <button type="button" class="btn-delete"
                    data-plugin-name="${p.name.replace(/"/g, "&quot;")}">Excluir</button>
          </form>
        </div>
      </td>
    </tr>`
    )
    .join("");

  const tableOrEmpty =
    plugins.length > 0
      ? `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Modificado</th>
          <th>A\u00e7\u00f5es</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
      : '<div class="empty-state">Nenhum plugin encontrado.</div>';

  const body = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h1 style="margin-bottom:0">Plugins Dispon\u00edveis (${plugins.length})</h1>
        <a href="/admin/upload" class="btn btn-primary">Upload</a>
      </div>
      ${msg ? `<div class="flash flash-success">${msg}</div>` : ""}
      ${error ? `<div class="flash flash-error">${error}</div>` : ""}
      ${tableOrEmpty}
    </div>

    <div id="delete-modal" class="modal-overlay" style="display:none">
      <div class="modal-box">
        <h2>Confirmar exclus\u00e3o</h2>
        <p>Tem certeza que deseja excluir o plugin <strong id="delete-plugin-name"></strong>?</p>
        <p class="text-muted">Essa a\u00e7\u00e3o n\u00e3o pode ser desfeita.</p>
        <div class="modal-actions">
          <button type="button" class="btn modal-btn-cancel" id="modal-cancel-btn">Cancelar</button>
          <button type="button" class="btn btn-danger" id="modal-confirm-btn">Excluir</button>
        </div>
      </div>
    </div>

    <style>
      .modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      }
      .modal-box {
        background: #fff;
        border-radius: 10px;
        padding: 2rem;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        animation: modalIn 0.2s ease-out;
      }
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(-10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .modal-box h2 { font-size: 1.2rem; margin-bottom: 0.75rem; color: #1a1a2e; }
      .modal-box p { font-size: 0.95rem; margin-bottom: 0.5rem; color: #333; }
      .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
      .modal-btn-cancel {
        background: #e8e8e8; color: #333;
      }
      .modal-btn-cancel:hover { background: #d0d0d0; }
    </style>

    <script>
      (function() {
        var pendingDeleteName = null;
        var modal = document.getElementById('delete-modal');
        var pluginNameEl = document.getElementById('delete-plugin-name');

        function openModal(name) {
          pendingDeleteName = name;
          pluginNameEl.textContent = name;
          modal.style.display = 'flex';
        }

        function closeModal() {
          modal.style.display = 'none';
          pendingDeleteName = null;
        }

        document.querySelectorAll('.btn-delete[data-plugin-name]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            openModal(this.getAttribute('data-plugin-name'));
          });
        });

        document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

        document.getElementById('modal-confirm-btn').addEventListener('click', function() {
          if (pendingDeleteName) {
            var form = document.getElementById('delete-form-' + encodeURIComponent(pendingDeleteName));
            if (form) form.submit();
          }
        });

        modal.addEventListener('click', function(e) {
          if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeModal();
        });
      })();
    </script>`;

  return layout({ title: "Plugins", body, authenticated: true });
}
