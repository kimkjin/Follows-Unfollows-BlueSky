// ==UserScript==
// @name         Auto Follow/Unfollow no Bluesky.
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Segue todo mundo da pagina de follows e followers, e também faz a checagem de quem está te seguindo ou não para dar unfollow.
// @match        https://bsky.app/profile/*/follows
// @match        https://bsky.app/profile/*/followers
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isFollowing = false;
    let isUnfollowing = false;
    let followInterval;
    let unfollowInterval;
    let scriptActive = false;

    // popup
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.innerText = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#333';
        notification.style.color = '#fff';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);

        // popup timer
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Função de follows
    function followAll() {
        if (isFollowing) {
            const followButtons = document.querySelectorAll('div[dir="auto"].css-146c3p1');

            followButtons.forEach(button => {
                if (button.innerText.trim() === "Follow") {
                    button.click();
                }
            });
        }
    }

    // Função de unfollow em quem não te segue
    function unfollowAll() {
        if (isUnfollowing) {
            const users = document.querySelectorAll('div.css-175oi2r');
            users.forEach(user => {
                const nameDiv = user.querySelector('div.css-146c3p1[style*="font-size: 15px"]');
                const followsYouDiv = user.querySelector('div.css-146c3p1[style*="font-size: 12px"]');

                if (nameDiv) {
                    if (!followsYouDiv || followsYouDiv.textContent.trim() !== 'Follows You') {
                        const unfollowButton = user.querySelector('button');
                        if (unfollowButton && unfollowButton.textContent.trim() === 'Unfollow') {
                            unfollowButton.click();
                        }
                    }
                }
            });
        }
    }

    // detecta novos botões enquanto da scroll
    const observer = new MutationObserver(function(mutations) {
        if (scriptActive) {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    followAll();  // Follow quando o botão aparece
                    unfollowAll(); // Unfollow quando o botão aparece
                }
            });
        }
    });

    // Iniciar o observador de mutações no corpo do documento
    observer.observe(document.body, { childList: true, subtree: true });

    // Teclas de atalho alt + K para ativar os follow e alt + L para unfollows
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 'k') {
            isFollowing = !isFollowing;
            if (isFollowing) {
                scriptActive = true;
                showNotification("Follows Ativado");
                followAll(); // Executa imediatamente quando ativado
                followInterval = setInterval(followAll, 3000); // Continua seguindo novos usuários
            } else {
                scriptActive = false;
                showNotification("Follows Desativado");
                clearInterval(followInterval);
            }
        } else if (event.altKey && event.key === 'l') {
            isUnfollowing = !isUnfollowing;
            if (isUnfollowing) {
                scriptActive = true;
                showNotification("Unfollow Ativado");
                unfollowAll(); // Executa imediatamente quando ativado
                unfollowInterval = setInterval(unfollowAll, 3000); // Continua parando de seguir novos usuários
            } else {
                scriptActive = false;
                showNotification("Unfollow Desativado");
                clearInterval(unfollowInterval);
            }
        }
    });

})();
