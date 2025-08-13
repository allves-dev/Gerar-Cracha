let crachaSelecionadoMatricula = null;

document.getElementById('cadastro-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const funcao = document.getElementById('funcao').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const empresa = document.getElementById('empresa').value.trim();

    if (nome && funcao && matricula && empresa) {
        const cracha = { nome, funcao, matricula, empresa };
        adicionarCracha(cracha);
        salvarHistorico(cracha);
        document.getElementById('cadastro-form').reset();
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

document.getElementById('imprimir-crachas').addEventListener('click', function () {
    imprimirCrachasA4();
});

document.getElementById('limpar-tela').addEventListener('click', function () {
    document.getElementById('cadastro-form').reset();
    document.getElementById('crachas-list').innerHTML = '';
});

// Verifica se o botão excluir-cracha existe antes de usar
const botaoExcluir = document.getElementById('excluir-cracha');
if (botaoExcluir) {
    botaoExcluir.addEventListener('click', function () {
        if (crachaSelecionadoMatricula) {
            excluirCrachaPorMatricula(crachaSelecionadoMatricula);
            crachaSelecionadoMatricula = null;
        } else {
            alert('Selecione um crachá primeiro.');
        }
    });
}

function adicionarCracha(cracha) {
    const crachaElement = document.createElement('div');
    crachaElement.classList.add('cracha');
    crachaElement.dataset.matricula = cracha.matricula;

    const qrCode = generateQRCode(cracha.matricula);
    const primeiroNome = cracha.nome.split(' ')[0];
    const matriculaFormatada = cracha.matricula.slice(-5);

    crachaElement.innerHTML = `
        <div class="btn-excluir-wrapper">
            <button class="btn-excluir-individual" title="Excluir Crachá">&times;</button>
        </div>
        <div class="faixa-lateral">CRACHÁ PROVISÓRIO</div>
        <div class="info">
            <img src="logo.png" alt="Logo da Empresa" class="logo-cracha">
            <div class="nome-principal">${primeiroNome}</div>
            <div class="nome-completo">${cracha.nome}</div>
            <div class="funcao">${cracha.funcao}</div>
            <img src="${qrCode}" alt="QR Code" class="qr-code">
            <div class="matricula">${matriculaFormatada}</div>
            <div class="fazenda">${cracha.empresa}</div>
        </div>
    `;

    crachaElement.querySelector('.btn-excluir-individual').addEventListener('click', function (e) {
        e.stopPropagation();
        excluirCrachaPorMatricula(cracha.matricula);
    });

    crachaElement.addEventListener('click', function () {
        document.querySelectorAll('.cracha').forEach(el => el.classList.remove('selecionado'));
        crachaElement.classList.add('selecionado');
        crachaSelecionadoMatricula = cracha.matricula;
    });

    document.getElementById('crachas-list').appendChild(crachaElement);
}

function excluirCrachaPorMatricula(matricula) {
    let historico = obterHistorico();
    historico = historico.filter(c => c.matricula !== matricula);
    localStorage.setItem('historicoCrachas', JSON.stringify(historico));

    const lista = document.getElementById('crachas-list');
    const crachas = lista.querySelectorAll('.cracha');
    crachas.forEach(c => {
        if (c.dataset.matricula === matricula) {
            lista.removeChild(c);
        }
    });
}

function generateQRCode(matricula) {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(matricula)}&size=100x100`;
}

function salvarHistorico(cracha) {
    let historico = obterHistorico();
    historico.push(cracha);
    localStorage.setItem('historicoCrachas', JSON.stringify(historico));
}

function obterHistorico() {
    const historicoJSON = localStorage.getItem('historicoCrachas');
    return historicoJSON ? JSON.parse(historicoJSON) : [];
}

function imprimirCrachasA4() {
    const crachasParaImpressao = document.querySelectorAll('.cracha');
    if (crachasParaImpressao.length === 0) {
        alert('Nenhum crachá para imprimir.');
        return;
    }

    let paginaImprimir = `
    <html>
    <head>
        <title>Impressão de Crachás</title>
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 0;
                margin: 0;
                background: white;
                color: black;
            }
            .cracha {
                width: 5.8cm;
                height: 7.5cm;
                border: 1px solid #000;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: row;
                box-shadow: none;
                color: #000;
                background-color: #fff;
            }
            .faixa-lateral {
                width: 0.8cm;
                background-color: #2E7D32 !important;
                color: white;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-weight: bold;
                font-size: 12px;
                text-align: center;
                padding: 0 2px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-top-left-radius: 8px;
                border-bottom-left-radius: 8px;
            }
            .info {
                flex-grow: 1;
                text-align: center;
                padding: 5px;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
            }
            .logo-cracha {
                width: 60px;
                margin: 5px auto;
            }
            .nome-principal {
                font-weight: bold;
                font-size: 16px;
                margin: 5px 0;
            }
            .nome-completo {
                font-size: 11px;
            }
            .funcao {
                font-size: 12px;
                margin-bottom: 10px;
            }
            .qr-code {
                width: 100px;
                height: 100px;
                margin: 0 auto;
            }
            .matricula {
                font-size: 10px;
                color: #000;
                margin-top: 2px;
            }
            .fazenda {
                font-size: 10px;
                color: #222;
                margin-top: 4px;
            }
            @media print {
                button, a {
                    display: none !important;
                }
                .faixa-lateral {
                    background-color: #2E7D32 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
    `;

    crachasParaImpressao.forEach(function (cracha) {
        paginaImprimir += cracha.outerHTML;
    });

    paginaImprimir += `</body></html>`;

    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.open();
    janelaImpressao.document.write(paginaImprimir);
    janelaImpressao.document.close();
}
document.getElementById('creditos-icone').addEventListener('click', function () {
    document.getElementById('popup-creditos').style.display = 'block';
});

document.querySelector('.fechar-popup').addEventListener('click', function () {
    document.getElementById('popup-creditos').style.display = 'none';
});

window.addEventListener('click', function (event) {
    const popup = document.getElementById('popup-creditos');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});
