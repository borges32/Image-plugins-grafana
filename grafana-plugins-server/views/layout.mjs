export function layout({ title, body, authenticated = false }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Grafana Plugins</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f2f5;
      color: #1a1a2e;
      min-height: 100vh;
    }
    nav {
      background: #1a1a2e;
      color: #fff;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
    }
    nav .brand {
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
    }
    nav .nav-links { display: flex; gap: 1rem; align-items: center; }
    nav a {
      color: #c0c0d0;
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }
    nav a:hover { background: rgba(255,255,255,0.1); color: #fff; }
    nav .btn-logout {
      background: none;
      border: 1px solid #c0c0d0;
      color: #c0c0d0;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }
    nav .btn-logout:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: #fff; }
    main {
      max-width: 960px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 1.5rem; color: #1a1a2e; }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 2rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e8e8e8;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      color: #666;
    }
    tr:hover td { background: #f8f9fa; }
    .flash {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .flash-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .flash-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 500;
      font-size: 0.9rem;
    }
    input[type="text"], input[type="password"], input[type="file"] {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }
    input[type="text"]:focus, input[type="password"]:focus {
      outline: none;
      border-color: #4a6fa5;
      box-shadow: 0 0 0 3px rgba(74,111,165,0.15);
    }
    .btn {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary { background: #4a6fa5; color: #fff; }
    .btn-primary:hover { background: #3a5a8a; }
    .btn-danger { background: #dc3545; color: #fff; }
    .btn-danger:hover { background: #b52a37; }
    .btn-download {
      background: #28a745;
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }
    .btn-download:hover { background: #1e7e34; }
    .btn-delete {
      background: #dc3545;
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-delete:hover { background: #b52a37; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .text-muted { color: #888; font-size: 0.85rem; }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #888;
    }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="brand">Grafana Plugins</a>
    ${authenticated ? `
    <div class="nav-links">
      <a href="/admin/upload">Upload</a>
      <a href="/admin/list">Plugins</a>
      <form method="POST" action="/logout" style="display:inline">
        <button type="submit" class="btn-logout">Sair</button>
      </form>
    </div>` : ''}
  </nav>
  <main>${body}</main>
</body>
</html>`;
}
