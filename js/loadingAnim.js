window.onload = function() {
    setTimeout(function(){
        const dotPulse = document.getElementById('loading');
        dotPulse.classList.add('loaded');
    },2000);
}