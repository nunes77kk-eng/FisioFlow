document.addEventListener("DOMContentLoaded", () => {

    const slide = document.querySelector(".carousel-slide");
    const imagens = document.querySelectorAll(".carousel-slide img");
    const btnNext = document.querySelector(".next");
    const btnPrev = document.querySelector(".prev");

    if (!slide || imagens.length === 0) return;

    let indice = 0;

    function atualizarCarrossel() {

        slide.style.transform = `translateX(-${indice * slide.parentElement.clientWidth}px)`;

    }

    btnNext.addEventListener("click", () => {

        indice++;

        if(indice >= imagens.length){
            indice = 0;
        }

        atualizarCarrossel();

    });

    btnPrev.addEventListener("click", () => {

        indice--;

        if(indice < 0){
            indice = imagens.length - 1;
        }

        atualizarCarrossel();

    });

    window.addEventListener("resize", atualizarCarrossel);

    setInterval(() => {

        indice++;

        if(indice >= imagens.length){
            indice = 0;
        }

        atualizarCarrossel();

    },4000);

});