// ==UserScript==
// @name         IP Lock com Painel Dev
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Sistema de IP lock com painel dev para gerenciar IPs e kickar usuários
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        window.close
// @grant        window.onbeforeunload
// @connect      api.ipify.org
// @connect      google.com
// ==/UserScript==

(function() {
    'use strict';
    
    // IPs autorizados
    const DEV_IP = "191.240.215.254"; // Seu IP de desenvolvedor
    let USER_IPS = GM_getValue("user_ips", [
        "192.168.1.100", // Exemplo de IP de usuário 1
        "192.168.1.101", // Exemplo de IP de usuário 2
        "10.0.0.50",     // Exemplo de IP de usuário 3
    ]);
    
    let userRole = "blocked"; // blocked, user, dev
    let currentIP = "";

    // Função para verificar IP
    function checkIP() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.ipify.org?format=json',
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        currentIP = data.ip;
                        
                        if (currentIP === DEV_IP) {
                            userRole = "dev";
                        } else if (USER_IPS.includes(currentIP)) {
                            userRole = "user";
                        } else {
                            userRole = "blocked";
                        }
                        
                        resolve(userRole);
                    } catch (e) {
                        reject('Erro ao analisar resposta');
                    }
                },
                onerror: function(error) {
                    reject('Erro de conexão');
                },
                ontimeout: function() {
                    reject('Timeout');
                }
            });
        });
    }

    // Função para kickar usuário (redirecionar para Google)
    function kickUser(ipToKick = null) {
        console.log(`Kickando ${ipToKick || 'usuário'}...`);
        
        // Se for um IP específico, verificar se é o usuário atual
        if (ipToKick && ipToKick === currentIP) {
            // Método 1: Redirecionar para Google
            window.location.href = "https://google.com";
            
            // Método 2: Fechar a janela (se permitido)
            setTimeout(() => {
                try { window.close(); } catch (e) {}
            }, 1000);
            
            // Método 3: Forçar navegador a sair
            setTimeout(() => {
                try {
                    window.onbeforeunload = null;
                    document.body.innerHTML = '<h1>Connection Lost</h1>';
                    window.stop();
                } catch (e) {}
            }, 1500);
        }
    }

    // Função para criar o painel dev
    function createDevPanel() {
        const panel = document.createElement('div');
        panel.id = 'dev-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 9999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            border: 2px solid #00ff00;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #00ff00;">👑 Painel Dev</h3>
                <button id="close-panel" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #00ff00;">IPs Autorizados (${USER_IPS.length})</h4>
                <div id="ip-list" style="max-height: 200px; overflow-y: auto; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #00ff00;">Adicionar IP</h4>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="new-ip" placeholder="Ex: 192.168.1.100" style="flex: 1; padding: 8px; border: 1px solid #00ff00; background: rgba(255, 255, 255, 0.1); color: white; border-radius: 5px;">
                    <button id="add-ip" style="background: #00ff00; color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #00ff00;">Seu IP: ${currentIP}</h4>
                <button id="refresh-ips" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; width: 100%;">🔄 Atualizar Lista</button>
            </div>
            
            <div style="color: #00ff00; font-size: 12px; text-align: center;">
                Painel visível apenas para dev
            </div>
        `;

        document.body.appendChild(panel);

        // Preencher lista de IPs
        updateIPList();

        // Event listeners
        document.getElementById('close-panel').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        document.getElementById('add-ip').addEventListener('click', () => {
            const newIP = document.getElementById('new-ip').value.trim();
            if (newIP && isValidIP(newIP)) {
                if (!USER_IPS.includes(newIP)) {
                    USER_IPS.push(newIP);
                    GM_setValue("user_ips", USER_IPS);
                    updateIPList();
                    document.getElementById('new-ip').value = '';
                } else {
                    alert('IP já existe na lista!');
                }
            } else {
                alert('Por favor, insira um IP válido!');
            }
        });

        document.getElementById('refresh-ips').addEventListener('click', () => {
            updateIPList();
        });

        // Draggable functionality
        let isDragging = false;
        let startX, startY, initialX, initialY;

        panel.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialX = panel.offsetLeft;
                initialY = panel.offsetTop;
                panel.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                panel.style.left = (initialX + dx) + 'px';
                panel.style.top = (initialY + dy) + 'px';
                panel.style.right = 'unset';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            panel.style.cursor = 'default';
        });
    }

    // Função para validar IP
    function isValidIP(ip) {
        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
    }

    // Função para atualizar lista de IPs
    function updateIPList() {
        const ipList = document.getElementById('ip-list');
        if (!ipList) return;

        ipList.innerHTML = '';
        
        USER_IPS.forEach((ip, index) => {
            const ipItem = document.createElement('div');
            ipItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 5px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            ipItem.innerHTML = `
                <span style="font-family: monospace; font-size: 12px;">${ip}</span>
                <div>
                    <button class="kick-btn" data-ip="${ip}" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-left: 5px;">Kick</button>
                    <button class="remove-btn" data-ip="${ip}" style="background: #888; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-left: 5px;">Remover</button>
                </div>
            `;
            
            ipList.appendChild(ipItem);
        });

        // Adicionar event listeners aos botões
        document.querySelectorAll('.kick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ip = e.target.getAttribute('data-ip');
                if (confirm(`Kickar usuário com IP: ${ip}?`)) {
                    kickUser(ip);
                }
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ip = e.target.getAttribute('data-ip');
                if (confirm(`Remover IP: ${ip} da lista?`)) {
                    USER_IPS = USER_IPS.filter(item => item !== ip);
                    GM_setValue("user_ips", USER_IPS);
                    updateIPList();
                }
            });
        });
    }

    // Função para atualizar o título
    function updateTitle() {
        if (userRole === "blocked") return;
        
        const originalTitle = document.title;
        let cleanTitle = originalTitle
            .replace(" [dev]", "")
            .replace(" [user]", "")
            .replace(" [blocked]", "");
        
        document.title = `${cleanTitle} [${userRole}]`;
    }

    // Função de bloqueio
    function showAccessDenied() {
        document.body.innerHTML = '';
        // ... (código anterior da tela de bloqueio) ...
    }

    // Função principal
    async function main() {
        try {
            const role = await checkIP();
            
            if (role === "blocked") {
                showAccessDenied();
                return;
            }
            
            showWelcomeMessage();
            updateTitle();
            observeTitleChanges();
            
            // Se for dev, criar painel de controle
            if (userRole === "dev") {
                // Esperar o jogo carregar
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', createDevPanel);
                } else {
                    setTimeout(createDevPanel, 2000);
                }
            }
            
        } catch (error) {
            console.error('Erro na verificação de IP:', error);
            showAccessDenied();
        }
    }

    // Funções auxiliares (showWelcomeMessage, observeTitleChanges, etc.)
    function showWelcomeMessage() {
        console.log(`Acesso permitido - Modo ${userRole.toUpperCase()}`);
    }

    function observeTitleChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target === document.querySelector('title')) {
                    setTimeout(updateTitle, 100);
                }
            });
        });
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    }

    // Iniciar
    main();

})();
