// ==UserScript==
// @name         IP Lock com Identificação Dev/User no Title
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sistema de IP lock com identificação dev/user no título
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// ==/UserScript==

(function() {
    'use strict';
    
    // IP do desenvolvedor
    const DEV_IP = "191.240.215.24";
    let isDeveloper = false;

    // Função para verificar IP
    function checkIP() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.ipify.org?format=json',
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        isDeveloper = data.ip === DEV_IP;
                        resolve(isDeveloper);
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
        const role = isDeveloper ? "dev" : "user";
        const originalTitle = document.title;
        
        // Verificar se já tem o role no título para não duplicar
        if (!originalTitle.includes(" [dev]") && !originalTitle.includes(" [user]")) {
            document.title = `${originalTitle} [${role}]`;
        } else if (originalTitle.includes(" [dev]") && !isDeveloper) {
            // Se era dev mas agora é user
            document.title = originalTitle.replace(" [dev]", " [user]");
        } else if (originalTitle.includes(" [user]") && isDeveloper) {
            // Se era user mas agora é dev
            document.title = originalTitle.replace(" [user]", " [dev]");
        }
        
        console.log(`Título atualizado: ${document.title}`);
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
                <h1>Acesso Restrito</h1>
                <p>Você não tem permissão para acessar este script.</p>
                <p>Seu endereço IP não está na lista de permissões.</p>
                <div class="contact">
                    <p>Para solicitar acesso, entre em contato com</p>
                    <p class="username">@jetxrah</p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = content;
    }

    // Observar mudanças no título para manter o role
    function observeTitleChanges() {
        const originalTitle = document.title;
        let currentTitle = originalTitle;
        
        // Observar mudanças no DOM para detectar alterações no título
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target === document.querySelector('title') || 
                    (mutation.target === document.head && mutation.addedNodes.length)) {
                    
                    // Pequeno delay para garantir que a mudança foi completada
                    setTimeout(() => {
                        if (document.title !== currentTitle && 
                            !document.title.includes(" [dev]") && 
                            !document.title.includes(" [user]")) {
                            
                            currentTitle = document.title;
                            updateTitle();
                        }
                    }, 100);
                }
            });
        });
        
        // Configurar o observer
        observer.observe(document.head, { 
            childList: true, 
            subtree: true,
            characterData: true
        });
    }

    // Função principal
    async function main() {
        try {
            const isDev = await checkIP();
            
            if (!isDev) {
                // Bloquear acesso se não for o IP do dev
                showAccessDenied();
                return;
            }
            
            // Se for o dev, atualizar o título
            console.log('Acesso permitido - Modo DEV ativado');
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
