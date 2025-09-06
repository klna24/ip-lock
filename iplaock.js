// ==UserScript==
// @name         IP Lock com Painel de Controle Dev
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Sistema de IP lock com identificação dev/user e painel de controle para desconexão remota
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      api.ipify.org
// ==/UserScript==

(function() {
    'use strict';
    
    // Configurações
    const DEV_IP = "191.240.215.254"; // Seu IP de desenvolvedor
    const USER_IPS = GM_getValue("user_ips", [
        "192.168.1.100", // Exemplo de IP de usuário 1
        "192.168.1.101", // Exemplo de IP de usuário 2
        // Adicione mais IPs de usuários aqui
    ]);
    
    const DISCONNECTED_USERS = GM_getValue("disconnected_users", []);
    let userRole = "blocked"; // blocked, user, dev
    let currentIP = "";
    let panelVisible = false;

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
                        } else if (USER_IPS.includes(currentIP) && !DISCONNECTED_USERS.includes(currentIP)) {
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

    // Função para desconectar usuário
    function disconnectUser(ip) {
        if (!DISCONNECTED_USERS.includes(ip)) {
            DISCONNECTED_USERS.push(ip);
            GM_setValue("disconnected_users", DISCONNECTED_USERS);
            
            // Se o usuário desconectado é o atual, recarregar a página
            if (currentIP === ip) {
                window.location.reload();
            }
            
            return true;
        }
        return false;
    }

    // Função para reconectar usuário
    function reconnectUser(ip) {
        const index = DISCONNECTED_USERS.indexOf(ip);
        if (index > -1) {
            DISCONNECTED_USERS.splice(index, 1);
            GM_setValue("disconnected_users", DISCONNECTED_USERS);
            
            // Se o usuário reconectado é o atual, recarregar a página
            if (currentIP === ip) {
                window.location.reload();
            }
            
            return true;
        }
        return false;
    }

    // Função para adicionar novo IP de usuário
    function addUserIP(ip) {
        if (!USER_IPS.includes(ip)) {
            USER_IPS.push(ip);
            GM_setValue("user_ips", USER_IPS);
            return true;
        }
        return false;
    }

    // Função para remover IP de usuário
    function removeUserIP(ip) {
        const index = USER_IPS.indexOf(ip);
        if (index > -1) {
            USER_IPS.splice(index, 1);
            GM_setValue("user_ips", USER_IPS);
            return true;
        }
        return false;
    }

    // Função para criar o painel de controle
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'dev-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(23, 23, 23, 0.95);
            border: 2px solid #444;
            border-radius: 10px;
            padding: 20px;
            z-index: 99999;
            color: white;
            font-family: Arial, sans-serif;
            min-width: 400px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
            display: none;
        `;

        panel.innerHTML = `
            <h2 style="margin-bottom: 15px; color: #4CAF50; text-align: center;">Painel de Controle Dev</h2>
            
            <div style="margin-bottom: 15px;">
                <h3>IPs Conectados</h3>
                <div id="connected-users-list" style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 5px; background: #333; border-radius: 5px;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h3>IPs Desconectados</h3>
                <div id="disconnected-users-list" style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 5px; background: #333; border-radius: 5px;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h3>Gerenciar IPs</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" id="new-ip-input" placeholder="Novo IP" style="flex: 1; padding: 8px; border: 1px solid #555; background: #222; color: white; border-radius: 4px;">
                    <button id="add-ip-btn" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Adicionar</button>
                </div>
                <div id="user-ips-list" style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 5px; background: #333; border-radius: 5px;"></div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="close-panel-btn" style="padding: 8px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Fechar</button>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    // Função para atualizar as listas no painel
    function updatePanelLists() {
        // Atualizar lista de IPs de usuário
        const userIpsList = document.getElementById('user-ips-list');
        if (userIpsList) {
            userIpsList.innerHTML = USER_IPS.map(ip => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #444;">
                    <span>${ip}</span>
                    <button data-ip="${ip}" class="remove-ip-btn" style="padding: 3px 8px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Remover</button>
                </div>
            `).join('');
            
            // Adicionar event listeners aos botões de remover
            document.querySelectorAll('.remove-ip-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const ip = this.getAttribute('data-ip');
                    if (removeUserIP(ip)) {
                        updatePanelLists();
                    }
                });
            });
        }
        
        // Atualizar lista de usuários conectados
        const connectedList = document.getElementById('connected-users-list');
        if (connectedList) {
            const connectedUsers = USER_IPS.filter(ip => !DISCONNECTED_USERS.includes(ip));
            connectedList.innerHTML = connectedUsers.map(ip => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #444;">
                    <span>${ip}</span>
                    <button data-ip="${ip}" class="disconnect-btn" style="padding: 3px 8px; background: #ff9800; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Desconectar</button>
                </div>
            `).join('');
            
            // Adicionar event listeners aos botões de desconectar
            document.querySelectorAll('.disconnect-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const ip = this.getAttribute('data-ip');
                    if (disconnectUser(ip)) {
                        updatePanelLists();
                    }
                });
            });
        }
        
        // Atualizar lista de usuários desconectados
        const disconnectedList = document.getElementById('disconnected-users-list');
        if (disconnectedList) {
            disconnectedList.innerHTML = DISCONNECTED_USERS.map(ip => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #444;">
                    <span>${ip}</span>
                    <button data-ip="${ip}" class="reconnect-btn" style="padding: 3px 8px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Reconectar</button>
                </div>
            `).join('');
            
            // Adicionar event listeners aos botões de reconectar
            document.querySelectorAll('.reconnect-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const ip = this.getAttribute('data-ip');
                    if (reconnectUser(ip)) {
                        updatePanelLists();
                    }
                });
            });
        }
    }

    // Função para mostrar/ocultar o painel
    function toggleControlPanel() {
        const panel = document.getElementById('dev-control-panel');
        if (!panel) return;
        
        if (panelVisible) {
            panel.style.display = 'none';
            panelVisible = false;
        } else {
            panel.style.display = 'block';
            updatePanelLists();
            panelVisible = true;
        }
    }

    // Função para injetar o botão de toggle do painel
    function injectPanelToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dev-panel-toggle';
        toggleBtn.textContent = 'Painel Dev';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 99998;
            padding: 8px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        toggleBtn.addEventListener('click', toggleControlPanel);
        document.body.appendChild(toggleBtn);
    }

    // Função para adicionar comandos de menu no Tampermonkey
    function registerMenuCommands() {
        // Comando para mostrar o painel
        GM_registerMenuCommand("Abrir Painel de Controle Dev", toggleControlPanel);
        
        // Comando para adicionar IP atual à lista de usuários
        GM_registerMenuCommand("Adicionar IP Atual como Usuário", function() {
            addUserIP(currentIP);
            alert(`IP ${currentIP} adicionado à lista de usuários!`);
        });
        
        // Comando para ver IP atual
        GM_registerMenuCommand("Ver IP Atual", function() {
            alert(`Seu IP atual é: ${currentIP}\nSeu status: ${userRole}`);
        });
    }

    // Função de bloqueio
    function showAccessDenied() {
        document.body.innerHTML = '';
        
        const styles = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                overflow: hidden;
            }
            
            .access-denied-container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                animation: fadeIn 0.8s ease-out;
            }
            
            h1 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                color: #ff6b6b;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            p {
                font-size: 1.2rem;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .contact {
                background: rgba(255, 255, 255, 0.2);
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
            }
            
            .username {
                font-weight: bold;
                color: #ffeaa7;
                font-size: 1.3rem;
            }
            
            .ip-info {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
                border-radius: 8px;
                margin: 15px 0;
                font-family: monospace;
            }
            
            .icon {
                font-size: 5rem;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-20px); }
                60% { transform: translateY(-10px); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        const content = `
            <div class="access-denied-container">
                <div class="icon">🔒</div>
                <h1>Acesso Bloqueado</h1>
                <p>Seu endereço IP não está na lista de permissões.</p>
                
                <div class="ip-info">
                    <p>IP Detectado: <strong>${currentIP}</strong></p>
                    <p>Status: <strong>Não Autorizado</strong></p>
                </div>
                
                <div class="contact">
                    <p>Para solicitar acesso, entre em contato com</p>
                    <p class="username">@jetxrah</p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = content;
    }

    // Função para mostrar mensagem de boas-vindas
    function showWelcomeMessage() {
        console.log(`Acesso permitido - Modo ${userRole.toUpperCase()}`);
        
        // Mensagem colorida no console
        const welcomeMsg = userRole === "dev" ? 
            "👑 Modo DESENVOLVEDOR ativado - Painel de controle disponível" : 
            "👤 Modo USUÁRIO ativado";
        
        console.log(`%c${welcomeMsg}`, `
            background: ${userRole === "dev" ? "#4CAF50" : "#2196F3"};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 14px;
        `);
    }

    // Função principal
    async function main() {
        try {
            const role = await checkIP();
            
            if (role === "blocked") {
                // Bloquear acesso se não for IP autorizado
                showAccessDenied();
                return;
            }
            
            // Se for IP autorizado, mostrar mensagem
            showWelcomeMessage();
            
            // Se for desenvolvedor, injetar o painel de controle
            if (userRole === "dev") {
                // Criar elementos do painel
                createControlPanel();
                injectPanelToggleButton();
                registerMenuCommands();
                
                // Configurar event listeners para o painel
                document.getElementById('close-panel-btn').addEventListener('click', toggleControlPanel);
                document.getElementById('add-ip-btn').addEventListener('click', function() {
                    const newIpInput = document.getElementById('new-ip-input');
                    const newIp = newIpInput.value.trim();
                    
                    if (newIp && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newIp)) {
                        if (addUserIP(newIp)) {
                            newIpInput.value = '';
                            updatePanelLists();
                        } else {
                            alert('Este IP já está na lista!');
                        }
                    } else {
                        alert('Por favor, insira um IP válido!');
                    }
                });
            }
            
        } catch (error) {
            console.error('Erro na verificação de IP:', error);
            showAccessDenied();
        }
    }

    // Iniciar
    main();

})();
