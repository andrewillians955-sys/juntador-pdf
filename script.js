// A nossa memória (Cesta de Arquivos)
let cestaDeArquivos = [];

// Pegando os elementos exatos do seu HTML
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
const mergeBtn = document.getElementById('merge-button');
const progressWrapper = document.getElementById('progress-wrapper');
const progressBarInner = document.getElementById('progress-bar-inner');
const progressLabel = document.getElementById('progress-label');
const downloadBtn = document.getElementById('download-button');

// Variável para controlar o arrastar e soltar (reordenar lista)
let dragStartIndex;

// 1. Função para adicionar na cesta e desenhar a tela
function adicionarArquivos(novosArquivos) {
    for (let i = 0; i < novosArquivos.length; i++) {
        // Só aceita PDF
        if (novosArquivos[i].type === 'application/pdf') {
            cestaDeArquivos.push(novosArquivos[i]);
        }
    }
    fileInput.value = ''; // Reseta para permitir enviar o mesmo arquivo de novo
    renderizarLista();
}

// 2. Desenha a lista de arquivos na tela (com função de reordenar)
function renderizarLista() {
    fileList.innerHTML = '';
    
    cestaDeArquivos.forEach((arquivo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `📄 <strong>${arquivo.name}</strong>`;
        li.style.padding = '10px';
        li.style.margin = '5px 0';
        li.style.background = '#f8f9fa';
        li.style.border = '1px solid #ddd';
        li.style.cursor = 'grab';
        li.draggable = true; // Permite arrastar

        // Eventos para reordenar a lista
        li.addEventListener('dragstart', () => { dragStartIndex = index; li.style.opacity = '0.5'; });
        li.addEventListener('dragend', () => { li.style.opacity = '1'; });
        li.addEventListener('dragover', (e) => { e.preventDefault(); });
        li.addEventListener('drop', () => {
            const dragEndIndex = index;
            // Troca os arquivos de posição na nossa cesta
            const itemArrastado = cestaDeArquivos.splice(dragStartIndex, 1)[0];
            cestaDeArquivos.splice(dragEndIndex, 0, itemArrastado);
            renderizarLista(); // Desenha a lista de novo na nova ordem
        });

        fileList.appendChild(li);
    });

    // Libera o botão de juntar se tiver 2 ou mais arquivos
    if (cestaDeArquivos.length >= 2) {
        mergeBtn.removeAttribute('disabled');
    } else {
        mergeBtn.setAttribute('disabled', 'true');
    }
}

// 3. Eventos da Caixa de Upload (Arraste e Solte)
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007bff';
    dropZone.style.background = '#e9ecef';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    dropZone.style.background = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    dropZone.style.background = 'transparent';
    adicionarArquivos(e.dataTransfer.files);
});

// Evento do botão de selecionar arquivos (Input)
fileInput.addEventListener('change', (e) => adicionarArquivos(e.target.files));

// 4. O Motor de Juntar + Barra Psicológica de 7 Segundos
mergeBtn.addEventListener('click', async () => {
    if (cestaDeArquivos.length < 2) return;

    // Muda a tela para modo de carregamento
    mergeBtn.style.display = 'none';
    progressWrapper.removeAttribute('aria-hidden');
    progressWrapper.style.display = 'block';
    downloadBtn.classList.add('hidden'); // Garante que o download está escondido
    downloadBtn.style.display = 'none';

    try {
        const { PDFDocument } = PDFLib;
        const pdfFinal = await PDFDocument.create();

        // Cola as páginas brutas
        for (let i = 0; i < cestaDeArquivos.length; i++) {
            const bytes = await cestaDeArquivos[i].arrayBuffer();
            const pdfCarregado = await PDFDocument.load(bytes);
            const paginas = await pdfFinal.copyPages(pdfCarregado, pdfCarregado.getPageIndices());
            paginas.forEach(pag => pdfFinal.addPage(pag));
        }

        const bytesFinais = await pdfFinal.save();
        const blob = new Blob([bytesFinais], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // A Matemática da Barra de Progresso
        let tempo = 0;
        const intervalo = setInterval(() => {
            tempo += 100;
            let porcentagem = 0;

            if (tempo <= 1000) porcentagem = (tempo / 1000) * 40;
            else if (tempo <= 5000) porcentagem = 40 + ((tempo - 1000) / 4000) * 40;
            else porcentagem = 80 + ((tempo - 5000) / 2000) * 20;

            progressBarInner.style.width = porcentagem + '%';
            progressLabel.innerText = `Processando... ${Math.floor(porcentagem)}%`;

            // Quando der 7 segundos (7000ms)
            if (tempo >= 7000) {
                clearInterval(intervalo);
                progressWrapper.style.display = 'none'; // Some a barra
                
                // Mostra o botão de baixar e anexa o PDF nele
                downloadBtn.classList.remove('hidden');
                downloadBtn.style.display = 'inline-block';
                downloadBtn.href = url;
            }
        }, 100);

    } catch (erro) {
        console.error(erro);
        alert("Ocorreu um erro técnico ao processar os PDFs.");
        mergeBtn.style.display = 'inline-block';
        progressWrapper.style.display = 'none';
    }
});