// ==UserScript==
// @name         IP Lock System
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Restringe acesso por IP
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    
    // IP autorizado (substitua pelo seu IP real)
    const DEV_IP = "123.123.123.123";
    
    // Função para obter o IP do usuário
    function getUserIP() {
        return new Promise((resolve, reject) => {
            // Primeiro tenta usar um serviço de API de IP
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://api.ipify.org?format=json",
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data.ip);
                    } catch (e) {
                        // Fallback para método alternativo
                        getIPFallback().then(resolve).catch(reject);
                    }
                },
                onerror: function() {
                    // Se a API falhar, usa o fallback
                    getIPFallback().then(resolve).catch(reject);
                }
            });
        });
    }
    
    // Método alternativo para obter IP (menos preciso)
    function getIPFallback() {
        return new Promise((resolve) => {
            // Tenta obter IP através de WebRTC (funciona apenas em alguns navegadores)
            const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            
            if (RTCPeerConnection) {
                const rtc = new RTCPeerConnection({iceServers: []});
                rtc.createDataChannel('', {reliable: false});
                
                rtc.onicecandidate = function(evt) {
                    if (evt.candidate) {
                        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                        const ipMatch = ipRegex.exec(evt.candidate.candidate);
                        if (ipMatch) {
                            resolve(ipMatch[1]);
                            rtc.onicecandidate = null;
                            rtc.close();
                        }
                    }
                };
                
                rtc.createOffer()
                    .then(offer => rtc.setLocalDescription(offer))
                    .catch(() => resolve("unknown"));
            } else {
                resolve("unknown");
            }
        });
    }
    
    // Verifica se o IP atual tem permissão
    function checkIPPermission() {
        // Verifica se já temos o IP armazenado (para evitar múltiplas verificações)
        const cachedIP = GM_getValue("user_ip", null);
        const cachedPermission = GM_getValue("ip_permission", null);
        
        if (cachedIP && cachedPermission !== null) {
            return Promise.resolve(cachedPermission);
        }
        
        return getUserIP().then(ip => {
            GM_setValue("user_ip", ip);
            const hasPermission = (ip === DEV_IP);
            GM_setValue("ip_permission", hasPermission);
            return hasPermission);
        }).catch(() => {
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
            redirectToYouTube();
        }
    });
})();
