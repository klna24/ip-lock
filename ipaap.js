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


function redirectToYouTube() {
    window.location.href = "https://www.youtube.com";
}


checkIPPermission().then(hasPermission => {
    if (!hasPermission) {
        console.log('Acesso negado. Redirecionando...');
        redirectToYouTube();
    } else {
        console.log('Acesso permitido.');
    }
});
