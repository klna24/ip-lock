// ==UserScript==
// @name         IP Lock com Sistema Dev/User
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sistema de IP lock com identificação dev/user e acesso para usuários autorizados
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// ==/UserScript==

(function() {
    'use strict';
    
    // IPs autorizados
    const DEV_IP = "34343535"; // Seu IP de desenvolvedor
    const USER_IPS = [
        "191.240.215.254", // Exemplo de IP de usuário 1
        "192.168.1.101", // Exemplo de IP de usuário 2
        "10.0.0.50",     // Exemplo de IP de usuário 3
        // Adicione mais IPs de usuários aqui
    ];
    
    let userRole = "blocked"; // blocked, user, dev

    // Função para verificar IP
    function checkIP() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.ipify.org?format=json',
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const currentIP = data.ip;
                        
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

    // Função para atualizar o título
    function updateTitle() {
        if (userRole === "blocked") return;
        
        const originalTitle = document.title;
        
        // Remover qualquer identificador anterior
        let cleanTitle = originalTitle
            .replace(" [dev]", "")
            .replace(" [user]", "")
            .replace(" [blocked]", "");
        
        // Adicionar o novo identificador
        document.title = `${cleanTitle} [${userRole}]`;
        
        console.log(`Título atualizado: ${document.title} (${userRole})`);
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
                    <p>IP Detectado: <strong>Carregando...</strong></p>
                    <p>Status: <strong>Não Autorizado</strong></p>
                </div>
                
                <div class="contact">
                    <p>Para solicitar acesso, entre em contato com</p>
                    <p class="username">@jetxrah</p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = content;
        
        // Mostrar o IP real do usuário bloqueado
        setTimeout(() => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.ipify.org?format=json',
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        document.querySelector('.ip-info strong:first-child').textContent = data.ip;
                    } catch (e) {
                        console.error('Erro ao obter IP para display');
                    }
                }
            });
        }, 1000);
    }

    // Observar mudanças no título
    function observeTitleChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target === document.querySelector('title') || 
                    (mutation.target === document.head && mutation.addedNodes.length)) {
                    
                    setTimeout(() => {
                        if (userRole !== "blocked") {
                            updateTitle();
                        }
                    }, 100);
                }
            });
        });
        
        observer.observe(document.head, { 
            childList: true, 
            subtree: true,
            characterData: true
        });
    }

    // Função para mostrar mensagem de boas-vindas
    function showWelcomeMessage() {
        console.log(`Acesso permitido - Modo ${userRole.toUpperCase()}`);
        
        // Adicionar mensagem no console
        const styles = `
            .welcome-banner {
                background: ${userRole === "dev" ? "linear-gradient(135deg, #4CAF50, #45a049)" : "linear-gradient(135deg, #2196F3, #1976D2)"};
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 10px;
                text-align: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        const welcomeMsg = userRole === "dev" ? 
            "👑 Modo DESENVOLVEDOR ativado" : 
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
            
            // Se for IP autorizado, mostrar mensagem e atualizar título
            showWelcomeMessage();
            updateTitle();
            observeTitleChanges();
            
        } catch (error) {
            console.error('Erro na verificação de IP:', error);
            showAccessDenied();
        }
    }

    // Iniciar
    main();

})();
