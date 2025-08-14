// Verificação de IP com redirecionamento
(async function() {
  try {
    // 1. Carrega configurações
    const config = await fetch('https://raw.githubusercontent.com/klna24/ip-lock/refs/heads/main/allowed_ips.json?t=' + Date.now())
      .then(r => r.json());
    
    // 2. Obtém IP do usuário
    const userIP = await fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => data.ip);

    // 3. Verifica acesso
    if (!config.allowedIPs.includes(userIP)) {
      window.open(config.redirectUrl, '_blank');
      window.location.href = config.redirectUrl;
    }
  } catch {
    // Fallback em caso de erro
    window.location.href = 'https://www.youtube.com';
  }
})();
