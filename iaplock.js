// ==UserScript==
// @name         IP Lock com Identificação Dev/User
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sistema de IP lock com identificação dev/user
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// ==/UserScript==

(function() {
    'use strict';
    
    // IP do desenvolvedor
    const DEV_IP = "191.240.215.254";
    let isDeveloper = false;
    let ipCheckCompleted = false;

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
                        ipCheckCompleted = true;
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

    // Função para obter o texto dev/user
    function getPlayerRole() {
        return isDeveloper ? "dev" : "user";
    }

    // Função para injetar o código de desenho
    function injectDrawCode() {
        const script = document.createElement('script');
        script.textContent = `
            // Sobrescrever a função de desenho do jogador
            const originalDrawFunction = window.drawPlayerInfo || function() {};
            
            window.drawPlayerInfo = function(tmpObj, player, mainContext, xOffset, yOffset, config) {
                // Chamar a função original primeiro
                originalDrawFunction.apply(this, arguments);
                
                // Se for o jogador local, adicionar texto dev/user
                if (tmpObj == player) {
                    const roleText = "${getPlayerRole()}";
                    
                    // Salvar configurações atuais do contexto
                    const originalFont = mainContext.font;
                    const originalFillStyle = mainContext.fillStyle;
                    const originalTextBaseline = mainContext.textBaseline;
                    const originalTextAlign = mainContext.textAlign;
                    const originalLineWidth = mainContext.lineWidth;
                    const originalLineJoin = mainContext.lineJoin;
                    
                    // Configurar estilo para o texto
                    mainContext.font = "20px Hammersmith One";
                    mainContext.fillStyle = "#fff";
                    mainContext.textBaseline = "middle";
                    mainContext.textAlign = "center";
                    mainContext.lineWidth = 6;
                    mainContext.lineJoin = "round";
                    
                    // Desenhar o texto de role (dev/user)
                    mainContext.strokeText(roleText, tmpObj.x - xOffset, (tmpObj.y - yOffset + tmpObj.scale) + config.nameY + 16.5 * 2);
                    mainContext.fillText(roleText, tmpObj.x - xOffset, (tmpObj.y - yOffset + tmpObj.scale) + config.nameY + 16.5 * 2);
                    
                    // Restaurar configurações originais
                    mainContext.font = originalFont;
                    mainContext.fillStyle = originalFillStyle;
                    mainContext.textBaseline = originalTextBaseline;
                    mainContext.textAlign = originalTextAlign;
                    mainContext.lineWidth = originalLineWidth;
                    mainContext.lineJoin = originalLineJoin;
                }
            };
            
            console.log('Sistema dev/user injetado com sucesso!');
        `;
        document.head.appendChild(script);
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
            
            // Se for o dev, injetar o código de desenho
            console.log('Acesso permitido - Modo DEV ativado');
            
            // Esperar o jogo carregar completamente
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', injectDrawCode);
            } else {
                injectDrawCode();
            }
            
        } catch (error) {
            console.error('Erro na verificação de IP:', error);
            showAccessDenied();
        }
    }

    // Iniciar
    main();

})();
