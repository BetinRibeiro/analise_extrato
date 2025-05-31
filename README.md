# 💰 Controle de Transações Financeiras

Um sistema simples em JavaScript que permite importar, visualizar, adicionar, exportar e gerenciar transações financeiras diretamente no navegador utilizando `localStorage`.

## 🚀 Funcionalidades

- ✅ Adição de transações com validação de formato
- 🧾 Visualização de entradas, saídas e saldo total
- 📈 Agrupamento mensal para geração de gráficos (requer implementação no Chart.js)
- 📤 Exportação de dados para `.txt` (formato JSON)
- 📥 Importação de dados a partir de arquivo `.txt`
- 🛑 Tratamento de transações duplicadas
- 🔔 Notificações de sucesso, erro ou aviso
- 📦 Armazenamento local via `localStorage`

## 📚 Formato da transação (para entrada manual)

Cada linha deve conter 5 campos separados por `;` (ponto e vírgula):

```
ID;DATA;DESCRIÇÃO;ESTABELECIMENTO;VALOR
```

Exemplo:

```
T001;01/05/2024;Venda de produto;Loja A;350,00
T002;02/05/2024;Compra de insumos;Fornecedor B;-120,50
```

> Valores negativos indicam **saídas**.

## 🧩 Tecnologias usadas

- HTML5 + CSS3 (Tailwind)
- JavaScript puro (ES6+)
- Font Awesome (ícones)
- `localStorage` (persistência local)

## 📁 Estrutura esperada

O projeto espera os seguintes elementos no HTML:

- Container com ID `notification` (para notificações flutuantes)
- Campos para exibição de totais: `#total-income`, `#total-expense`, `#balance`
- Container de transações recentes: `#recent-transactions`
- Input para importação de arquivo: `#import-file`
- Botão de importação: `#import-btn`
- Elemento `#file-name-display` para mostrar nome do arquivo selecionado

## 📦 Exportação de dados

Os dados são exportados em formato `.txt` com conteúdo JSON.

Exemplo de conteúdo exportado:

```json
[
  {
    "id": "T001",
    "date": "2024-05-01",
    "description": "Venda de produto",
    "establishment": "Loja A",
    "type": "ENTRADA",
    "amount": 350
  }
]
```

## 📥 Importação de dados

Importe um arquivo `.txt` com conteúdo JSON seguindo o modelo acima. O sistema ignora IDs já existentes para evitar duplicações.

## 📌 Observações

- O projeto pode ser executado localmente apenas com um navegador moderno.
- O gráfico mensal ainda depende de uma função externa `groupByMonth()` e da inicialização de um gráfico com Chart.js.

## 🛠️ Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. Abra o arquivo `index.html` em seu navegador.

3. Comece a lançar transações ou importe de um arquivo.

---

🧑‍💻 Desenvolvido por [Seu Nome]  
📅 Última atualização: Maio de 2025
