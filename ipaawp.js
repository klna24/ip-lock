// IP 
const DEV_IP = "191.240.215.24";

function getUserIP() {
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

function checkIPPermission() {
    return getUserIP().then(ip => {
        console.log('IP detectado:', ip);
        return ip === DEV_IP;
    }).catch(error => {
        console.error('Erro ao obter IP:', error);
        return false;
    });
}

function showAccessDeniedScreen() {
    // Remove qualquer conteúdo existente
    document.body.innerHTML = '';
    
    // Adiciona estilos
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
    
    // Adiciona conteúdo
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
    
    // Adiciona alguns elementos dinâmicos
    const container = document.querySelector('.access-denied-container');
    
    // Adiciona partículas de fundo
    const particles = document.createElement('div');
    particles.style.position = 'fixed';
    particles.style.top = '0';
    particles.style.left = '0';
    particles.style.width = '100%';
    particles.style.height = '100%';
    particles.style.zIndex = '-1';
    particles.style.pointerEvents = 'none';
    document.body.appendChild(particles);
    
    // Cria partículas
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 10 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(255, 255, 255, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particles.appendChild(particle);
    }
    
    // Adiciona animação de flutuação para as partículas
    const floatAnimation = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(${Math.random() * 50 - 25}px) translateX(${Math.random() * 50 - 25}px); }
            100% { transform: translateY(0) translateX(0); }
        }
    `;
    
    const floatStyle = document.createElement('style');
    floatStyle.textContent = floatAnimation;
    document.head.appendChild(floatStyle);
}

checkIPPermission().then(hasPermission => {
    if (!hasPermission) {
        console.log('Acesso negado. Mostrando tela de restrição...');
        // Aguarda o carregamento da página para aplicar a estilização
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showAccessDeniedScreen);
        } else {
            showAccessDeniedScreen();
        }
    } else {
        console.log('Acesso permitido.');
    }
});
