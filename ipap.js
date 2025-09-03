// IP autorizado (substitua pelo seu IP real)
const DEV_IP = "123.123.123.123";

// Função para obter o IP do usuário via API externa
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

// Verifica se o IP atual tem permissão
function checkIPPermission() {
    return getUserIP().then(ip => {
        console.log('IP detectado:', ip);
        return ip === DEV_IP;
    }).catch(error => {
        console.error('Erro ao obter IP:', error);
        return false;
    });
}

// Redireciona para o YouTube se não tiver permissão
function redirectToYouTube() {
    window.location.href = "https://www.youtube.com";
}

// Executa a verificação
checkIPPermission().then(hasPermission => {
    if (!hasPermission) {
        console.log('Acesso negado. Redirecionando...');
        redirectToYouTube();
    } else {
        console.log('Acesso permitido.');
    }
});
