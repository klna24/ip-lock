
// IP 
const DEV_IP = "191.240.215.254";

function IP() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', 'https://api.ipify.org?format=json', true);
        
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                try {
                    const data = JSON.parse(this.response);
                    resolve(data.ip);
                } catch (e) {
                    reject('Erro ao analisar resposta');
                }
            } else {
                reject('Erro na requisição');
            }
        };
        
        request.onerror = function() {
            reject('Erro de conexão');
        };
        
        request.send();
    });
}

function check() {
    return IP().then(ip => {
        return ip === DEV_IP;
    }).catch(error => {
        return false;
    });
}

// Função para verificar se é dev
function isDev() {
    return check().then(isDev => {
        return isDev;
    }).catch(() => {
        return false;
    });
}

// Função de bloqueio
function foda() {
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

// Sobrescrever a função de desenho original
(function() {
    'use strict';
    
    // Verificar acesso primeiro
    check().then(hasPermission => {
        if (!hasPermission) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', foda);
            } else {
                foda();
            }
        } else {
            console.log('Acesso permitido - Modo DEV');
            
            // Sobrescrever a função de desenho do jogador
            const originalDrawFunction = window.drawPlayerInfo || function() {};
            
            window.drawPlayerInfo = async function(tmpObj, player, mainContext, xOffset, yOffset, config) {
                // Chamar a função original primeiro
                originalDrawFunction.apply(this, arguments);
                
                // Se for o jogador local, adicionar texto dev/user
                if (tmpObj == player) {
                    const devStatus = await isDev();
                    const roleText = devStatus ? "dev" : "user";
                    
                    mainContext.font = "20px Hammersmith One";
                    mainContext.fillStyle = "#fff";
                    mainContext.textBaseline = "middle";
                    mainContext.textAlign = "center";
                    mainContext.lineWidth = 6;
                    mainContext.lineJoin = "round";
                    
                    // Desenhar o texto de role (dev/user)
                    mainContext.strokeText(roleText, tmpObj.x - xOffset, (tmpObj.y - yOffset + tmpObj.scale) + config.nameY + 16.5 * 2);
                    mainContext.fillText(roleText, tmpObj.x - xOffset, (tmpObj.y - yOffset + tmpObj.scale) + config.nameY + 16.5 * 2);
                }
            };
        }
    });
})();
