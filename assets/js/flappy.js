function sortearNumero(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function criarElemento(tagName, className) {
    const elemento = document.createElement(tagName);
    elemento.classList.add(className);
    return elemento;
}

function gerarBarreira(reverso = false) {
    const barreira = criarElemento("div", "barreira");

    const corpo = criarElemento("div", "corpo");
    const borda = criarElemento("div", "borda");

    barreira.appendChild(reverso ? corpo : borda);
    barreira.appendChild(reverso ? borda : corpo);

    return barreira;
}

function ParBarreiras(abertura, position, alturaContainer) {
    this.elemento = criarElemento("div", "par-barreiras");

    this.topo = gerarBarreira(true);
    this.base = gerarBarreira();

    this.elemento.appendChild(this.topo);
    this.elemento.appendChild(this.base);

    this.alturaContainer = alturaContainer;

    this.ajustarAlturaBarreiras = () => {
        const alturaBase = sortearNumero(1, this.alturaContainer - abertura);
        const alturaTopo = this.alturaContainer - alturaBase - abertura;

        this.topo.firstElementChild.style.height = `${alturaBase}px`;
        this.base.lastElementChild.style.height = `${alturaTopo}px`;
    };

    this.setPositionBarreira = (valor) => {
        this.elemento.style.left = `${valor}px`;
    };
    
    this.getPositionBarreira = () => {
        return parseInt(this.elemento.style.left) || 0;
    };

    this.getLargura = () => this.elemento.clientWidth;
    
    this.setPositionBarreira(position);
    this.ajustarAlturaBarreiras();
}

function Barreiras(altura, largura, abertura, espacamento, notificarPonto) {
    this.pares = [
        new ParBarreiras(abertura, largura, altura),
        new ParBarreiras(abertura, largura + espacamento, altura),
        new ParBarreiras(abertura, largura + espacamento * 2, altura),
        new ParBarreiras(abertura, largura + espacamento * 3, altura),
    ];

    const deslocamento = 3;

    this.animar = () => {
        this.pares.forEach(par => {
            par.setPositionBarreira(
                par.getPositionBarreira() - deslocamento
            );

            if (par.getPositionBarreira() < -par.getLargura()) {
                par.setPositionBarreira(par.getPositionBarreira() + espacamento * this.pares.length);
                par.ajustarAlturaBarreiras();
            }

            const meio = largura / 2;

            // Checar se a barreira passou do meio da tela
            const cruzouOMeio = par.getPositionBarreira() + deslocamento >= meio && par.getPositionBarreira() < meio;
            if (cruzouOMeio) {
                notificarPonto();
            }
        });
    };
} 

function Passaro() {
    this.elemento = criarElemento("img", "passaro");
    this.elemento.src = "assets/imgs/passaro.png";
    this.elemento.style.top = "50%";
    this.intervalId = undefined;

    this.moverPassaroCima = () => {
        let passaroTop = Number(this.elemento.style.top.split("%")[0]);

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        if (passaroTop > 0) {
            passaroTop -= 5;
            this.elemento.style.top = `${passaroTop}%`;
        }
    };

    this.moverPassaroBaixo = () => {
        let passaroTop = Number(this.elemento.style.top.split("%")[0]);

        this.intervalId = setInterval(() => {
            if (passaroTop < 90) {
                passaroTop += 5;
                this.elemento.style.top = `${passaroTop}%`;
            } else {
                clearInterval(this.intervalId);
            }
        }, 100);
    };
}

function Pontuacao() {
    this.elemento = criarElemento("div", "score");
    this.elemento.innerHTML = 0
    this.pontos = 0

    this.setPontos = () =>{ 
        this.pontos+= 1
        this.elemento.innerHTML = this.pontos
    };
}

function elementosEstaoSobrepostos(elementoA,elementoB){

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal =  a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical =  a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical

}


function colidiu(passaro,barreiras){
    let colizao = false

    barreiras.forEach( parBarreiras => {

        if(!colizao){

            const topo = parBarreiras.topo
            const base = parBarreiras.base

            console.log(topo,base)

            colizao = elementosEstaoSobrepostos(topo,passaro) || elementosEstaoSobrepostos(base,passaro)
        }
    })

    return colizao
}


function FlappyBird() {
    this.areaJogo = document.querySelector("[wm-flappy]");
    this.gameStart = false

    const altura = this.areaJogo.clientHeight;
    const largura = this.areaJogo.clientWidth;
    this.pontuacao = new Pontuacao();
    this.areaJogo.appendChild(this.pontuacao.elemento);

    this.barreiras = new Barreiras(altura, largura, 200, 450, () => this.pontuacao.setPontos());
    this.barreiras.pares.forEach(e => {
        this.areaJogo.appendChild(e.elemento);
    });

    this.passaro = new Passaro();
    this.areaJogo.appendChild(this.passaro.elemento);

    document.addEventListener("keypress", this.passaro.moverPassaroCima);
    document.addEventListener("keyup", this.passaro.moverPassaroBaixo);

    this.start = () => {

        this.gameStart = true

        const temporizador = setInterval(() => {
            if (colidiu(this.passaro.elemento, this.barreiras.pares)) {
                clearInterval(temporizador);
    
                document.removeEventListener("keypress", this.passaro.moverPassaroCima);
                document.removeEventListener("keyup", this.passaro.moverPassaroBaixo);
            } else {
                this.barreiras.animar();
            }
        }, 15);
    };
      
}

let flappyGame = new FlappyBird();

document.querySelector(".controles a").addEventListener("click", () => {

    if(!flappyGame.gameStart)
        flappyGame.start()
    
    else{
        const areaJogo = document.querySelector("[wm-flappy]");

        areaJogo.innerHTML = ''

        flappyGame = new FlappyBird();
        flappyGame.start()

    }
})
