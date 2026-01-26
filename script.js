function adicionarItem() {
    const container = document.getElementById('itens-container');
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="number" class="item-qtd" value="1" oninput="atualizarPreview()">
        <input type="text" class="item-desc" placeholder="Serviço" oninput="atualizarPreview()">
        <input type="number" class="item-valor" placeholder="R$" oninput="atualizarPreview()">
    `;
    container.appendChild(div);
    atualizarPreview();
}

// Função centralizada para calcular os valores da proposta
function obterDadosCalculados() {
    const qtds = document.querySelectorAll('.item-qtd');
    const descs = document.querySelectorAll('.item-desc');
    const valores = document.querySelectorAll('.item-valor');
    const desconto = parseFloat(document.getElementById('desconto').value) || 0;

    let rows = [];
    let totalBruto = 0;

    descs.forEach((d, i) => {
        const q = parseFloat(qtds[i].value) || 0;
        const vUnit = parseFloat(valores[i].value) || 0;
        const vTotal = q * vUnit;
        totalBruto += vTotal;
        if (d.value || vUnit > 0) {
            rows.push([q, d.value || "Serviço", `R$ ${vUnit.toFixed(2)}`, `R$ ${vTotal.toFixed(2)}`]);
        }
    });

    return {
        rows,
        totalBruto,
        desconto,
        totalLiquido: totalBruto - desconto
    };
}

function gerarDoc() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dados = obterDadosCalculados();

    const cliente = document.getElementById('cliente').value || "Cliente Exemplo";
    const endereco = document.getElementById('endereco').value || "Endereço não informado";
    const condicoes = document.getElementById('condicoes').value;
    const observacoes = document.getElementById('observacoes').value || ""; 

    // --- DESIGN DARK NO IMPRESSO ---
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(0, 163, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo AzDev Coder
    try {
        const img = new Image();
        img.src = 'WhatsApp Image 2026-01-26 at 12.19.17.jpeg';
        doc.addImage(img, 'JPEG', 10, 5, 30, 30); 
    } catch (e) {
        console.error("Erro ao carregar a logo no PDF:", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("PROPOSTA COMERCIAL", 115, 25, { align: "center" });

    doc.autoTable({
        startY: 45,
        body: [
            ['DATA', new Date().toLocaleDateString()],
            ['CLIENTE', cliente], 
            ['ENDEREÇO', endereco]
        ],
        theme: 'plain',
        styles: { fontSize: 9, textColor: [200, 200, 200], cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', textColor: [0, 163, 255], cellWidth: 30 } }
    });

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['QTD', 'DESCRIÇÃO', 'UNITÁRIO', 'TOTAL']],
        body: dados.rows,
        headStyles: { fillColor: [30, 30, 30], textColor: [0, 163, 255], lineWidth: 0.1, lineColor: [50, 50, 50] },
        bodyStyles: { fillColor: [25, 25, 25], textColor: [255, 255, 255], lineWidth: 0.1, lineColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [20, 20, 20] },
        styles: { fontSize: 9 }
    });

    // Detalhamento do Cálculo
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Total Bruto: R$ ${dados.totalBruto.toFixed(2)}`, 195, finalY, { align: 'right' });
    doc.text(`Desconto: R$ ${dados.desconto.toFixed(2)}`, 195, finalY + 6, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 163, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL LÍQUIDO: R$ ${dados.totalLiquido.toFixed(2)}`, 195, finalY + 16, { align: 'right' });

    finalY += 25;

    if (observacoes.trim() !== "") {
        doc.autoTable({
            startY: finalY,
            head: [['OBSERVAÇÕES DO PROJETO']],
            body: [[observacoes]],
            headStyles: { fillColor: [40, 40, 40], textColor: [0, 163, 255] },
            bodyStyles: { fillColor: [30, 30, 30], textColor: [200, 200, 200] },
            theme: 'grid'
        });
        finalY = doc.lastAutoTable.finalY + 10;
    }

    doc.autoTable({
        startY: finalY,
        head: [['CONDIÇÕES DE PAGAMENTO']],
        body: [[condicoes]],
        headStyles: { fillColor: [0, 163, 255], textColor: 255, halign: 'center' },
        bodyStyles: { fillColor: [30, 30, 30], textColor: [200, 200, 200], halign: 'center' },
        theme: 'grid'
    });

    return doc;
}

function abrirHTML() {
    const dados = obterDadosCalculados();
    const cliente = document.getElementById('cliente').value || "Cliente";
    const endereco = document.getElementById('endereco').value || "";
    const obs = document.getElementById('observacoes').value || "";
    const condicoes = document.getElementById('condicoes').value;

    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(`
        <html>
        <head>
            <title>AzDev Coder - Proposta ${cliente}</title>
            <style>
                body { background: #121212; color: white; font-family: 'Inter', sans-serif; padding: 40px; }
                .header { background: #00A3FF; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1e1e1e; color: #00A3FF; padding: 12px; border: 1px solid #333; text-align: left; }
                td { padding: 12px; border: 1px solid #333; background: #1a1a1a; }
                .resumo { text-align: right; margin-top: 20px; line-height: 1.8; }
                .total { font-size: 24px; color: #00A3FF; font-weight: bold; }
                .box { margin-top: 30px; background: #1e1e1e; padding: 20px; border-left: 4px solid #00A3FF; }
                .label { color: #00A3FF; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; }
            </style>
        </head>
        <body>
            <div class="header"><h1>PROPOSTA COMERCIAL</h1></div>
            <p><span class="label">CLIENTE:</span> ${cliente} | <span class="label">ENDEREÇO:</span> ${endereco}</p>
            <table>
                <thead><tr><th>QTD</th><th>DESCRIÇÃO</th><th>UNITÁRIO</th><th>TOTAL</th></tr></thead>
                <tbody>${dados.rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>
            </table>
            <div class="resumo">
                <div>Total Bruto: R$ ${dados.totalBruto.toFixed(2)}</div>
                <div>Desconto aplicado: R$ ${dados.desconto.toFixed(2)}</div>
                <div class="total">TOTAL LÍQUIDO: R$ ${dados.totalLiquido.toFixed(2)}</div>
            </div>
            ${obs ? `<div class="box"><div class="label">Observações:</div><div style="white-space:pre-wrap">${obs}</div></div>` : ''}
            <div class="box"><div class="label">Condições:</div>${condicoes}</div>
        </body>
        </html>
    `);
}

function atualizarPreview() {
    const doc = gerarDoc();
    const string = doc.output('bloburl');
    document.getElementById('pdf-preview').src = string;
}

function enviarProposta() {
    const doc = gerarDoc();
    const cliente = document.getElementById('cliente').value || "Cliente";
    const whatsapp = document.getElementById('whatsapp').value;
    
    doc.save(`Orcamento_AzDevCoder_${cliente.replace(/\s/g, '_')}.pdf`);
    
    if(whatsapp) {
        const msg = encodeURIComponent(`Olá ${cliente}, segue a proposta comercial da AzDev Coder referente ao seu projeto.`);
        window.open(`https://api.whatsapp.com/send?phone=${whatsapp}&text=${msg}`, '_blank');
    } else {
        alert("Informe o WhatsApp para abrir a conversa.");
    }
}

window.onload = atualizarPreview;