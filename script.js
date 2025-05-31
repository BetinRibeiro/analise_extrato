
    // Inicialização de dados
    let financeChart = null;
    const STORAGE_KEY = 'financialTransactions';
    
    // Notificações
    function showNotification(type, title, content) {
      const notification = document.getElementById('notification');
      const notificationIcon = document.getElementById('notification-icon');
      const notificationTitle = document.getElementById('notification-title');
      const notificationContent = document.getElementById('notification-content');
      
      let bgColor = '';
      let iconHtml = '';
      
      switch(type) {
        case 'success':
          bgColor = 'bg-green-600';
          iconHtml = '<i class="fas fa-check-circle"></i>';
          break;
        case 'error':
          bgColor = 'bg-red-600';
          iconHtml = '<i class="fas fa-exclamation-circle"></i>';
          break;
        case 'info':
          bgColor = 'bg-blue-600';
          iconHtml = '<i class="fas fa-info-circle"></i>';
          break;
        default:
          bgColor = 'bg-blue-600';
          iconHtml = '<i class="fas fa-info-circle"></i>';
      }
      
      notification.className = `fixed top-6 right-6 z-50 max-w-md w-full p-4 rounded-xl shadow-lg transition-all duration-500 transform ${bgColor}`;
      notificationIcon.className = `flex-shrink-0 text-white mr-3 rounded-full w-8 h-8 flex items-center justify-center`;
      notificationIcon.innerHTML = iconHtml;
      notificationTitle.textContent = title;
      notificationContent.textContent = content;
      
      // Exibir notificação
      notification.style.transform = 'translateY(0)';
      
      // Ocultar automaticamente após 5 segundos
      setTimeout(hideNotification, 5000);
    }
    
    function hideNotification() {
      const notification = document.getElementById('notification');
      notification.style.transform = 'translateY(-200%)';
    }
    
    // Obter dados salvos do localStorage
    function getSavedTransactions() {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    }
    
    // Salvar dados no localStorage
    function saveTransactions(transactions) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
    
    // Formatar valor em moeda brasileira
    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    // Converter data DD/MM/AAAA para ISO (AAAA-MM-DD)
    function convertToISODate(dateString) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Converter valor brasileiro para float (ex: "-22,80" → -22.80)
    function convertToFloat(value) {
      // Remover pontos de milhar e substituir vírgula por ponto
      const numericValue = value.replace(/\./g, '').replace(',', '.');
      return parseFloat(numericValue);
    }
    
    // Adicionar transações ao sistema
    function addTransactions(inputData) {
      const transactions = getSavedTransactions();
      const lines = inputData.trim().split('\n');
      let newTransactions = 0;
      let duplicates = 0;
      let errors = 0;
      
      lines.forEach(line => {
        const parts = line.trim().split(';');
        
        // Verificar formatação correta (5 partes)
        if (parts.length !== 5) {
          errors++;
          return;
        }
        
        const [id, date, description, establishment, amountStr] = parts;
        
        // Validar data (deve ter o formato DD/MM/AAAA)
        if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          errors++;
          return;
        }
        
        // Converter valor para número
        const amount = convertToFloat(amountStr);
        
        // Verificar dados válidos
        if (!id || !date || !description || !establishment || isNaN(amount)) {
          errors++;
          return;
        }
        
        // Verificar se transação já existe pelo ID
        const transactionExists = transactions.some(t => t.id === id);
        
        if (!transactionExists) {
          // Criar objeto de transação
          transactions.push({
            id,
            date: convertToISODate(date),
            description,
            establishment,
            type: amount >= 0 ? 'ENTRADA' : 'SAÍDA',
            amount: Math.abs(amount)
          });
          newTransactions++;
        } else {
          duplicates++;
        }
      });
      
      // Salvar no localStorage
      saveTransactions(transactions);
      
      // Atualizar interface
      updateDashboard();
      
      // Feedback ao usuário
      const feedback = document.getElementById('feedback');
      feedback.innerHTML = '';
      
      if (newTransactions > 0) {
        feedback.innerHTML += `<div class="bg-green-50 p-3 rounded-lg text-green-800 mb-2">
          <i class="fas fa-check-circle mr-2"></i> Adicionadas ${newTransactions} novas transações.
        </div>`;
        showNotification('success', 'Sucesso!', `Adicionadas ${newTransactions} novas transações.`);
      }
      
      if (duplicates > 0) {
        feedback.innerHTML += `<div class="bg-blue-50 p-3 rounded-lg text-blue-800 mb-2">
          <i class="fas fa-info-circle mr-2"></i> ${duplicates} transações duplicadas foram ignoradas.
        </div>`;
      }
      
      if (errors > 0) {
        feedback.innerHTML += `<div class="bg-red-50 p-3 rounded-lg text-red-800">
          <i class="fas fa-exclamation-triangle mr-2"></i> ${errors} transações com formato inválido foram ignoradas.
        </div>`;
      }
      
      if (lines.length === 0) {
        feedback.innerHTML = `<div class="bg-yellow-50 p-3 rounded-lg text-yellow-800">
          <i class="fas fa-exclamation-triangle mr-2"></i> Por favor, insira transações no formato especificado.
        </div>`;
      }
    }
    
    // Exportar dados como arquivo .txt
    function exportData() {
      const transactions = getSavedTransactions();
      
      if (transactions.length === 0) {
        showNotification('error', 'Erro!', 'Não há transações para exportar.');
        return;
      }
      
      const jsonData = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transacoes-financeiras.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Exportação concluída!', 'Seu arquivo com dados transacionais foi baixado.');
    }
    
    // Importar dados de um arquivo .txt
    function importData() {
      const fileInput = document.getElementById('import-file');
      const file = fileInput.files[0];
      
      if (!file) {
        showNotification('error', 'Erro!', 'Por favor, selecione um arquivo .txt');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          if (!Array.isArray(jsonData)) {
            throw new Error('Formato inválido');
          }
          
          const transactions = getSavedTransactions();
          let newTransactions = 0;
          
          // Adicionar transações, evitando duplicatas por ID
          jsonData.forEach(item => {
            const exists = transactions.some(t => t.id === item.id);
            if (!exists) {
              transactions.push(item);
              newTransactions++;
            }
          });
          
          saveTransactions(transactions);
          updateDashboard();
          
          showNotification('success', 'Importação concluída!', `${newTransactions} novas transações foram importadas.`);
          document.getElementById('file-name-display').textContent = '';
          document.getElementById('import-file').value = '';
          document.getElementById('import-btn').disabled = true;
        } catch (error) {
          showNotification('error', 'Erro na importação!', 'O arquivo não possui um formato JSON válido.');
          console.error('Erro ao importar:', error);
        }
      };
      
      reader.readAsText(file);
    }
    
    // Atualizar interface
    function updateDashboard() {
      const transactions = getSavedTransactions();
      const totals = calculateTotals(transactions);
      const monthlyData = groupByMonth(transactions);
      
      // Atualizar valores totais
      document.getElementById('total-income').textContent = 
        formatCurrency(totals.totalIncome);
      document.getElementById('total-expense').textContent = 
        formatCurrency(totals.totalExpense);
      document.getElementById('balance').textContent = 
        formatCurrency(totals.balance);
      
      // Atualizar contagem de transações
      document.getElementById('transaction-count').textContent = 
        transactions.length;
      
      // Atualizar transações recentes
      const recentContainer = document.getElementById('recent-transactions');
      if (transactions.length === 0) {
        recentContainer.innerHTML = `
          <div class="text-gray-500 italic text-sm py-10 text-center bg-gray-50 rounded-xl">
            <i class="fas fa-comment-alt-exclamation text-gray-400 text-2xl mb-2"></i>
            <p>Nenhuma transação registrada</p>
          </div>`;
      } else {
        // Ordenar por data (mais recente primeiro)
        const sortedTransactions = [...transactions].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        ).slice(0, 5);
        
        recentContainer.innerHTML = sortedTransactions.map(t => `
          <div class="transaction-card bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-200">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 desc-clamp">${t.description}</div>
              <div class="text-xs text-gray-500 flex items-center mt-1">
                <i class="fas fa-calendar mr-1.5"></i>
                ${t.date.split('-').reverse().join('/')}
              </div>
              <div class="text-xs text-gray-500 truncate mt-1 flex items-center">
                <i class="fas fa-store mr-1.5"></i>
                ${t.establishment}
              </div>
            </div>
            <div class="flex items-center">
              <span class="${t.type === 'ENTRADA' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}">
                ${t.type === 'ENTRADA' ? '+' : '-'} ${formatCurrency(t.amount)}
              </span>
            </div>
          </div>
        `).join('');
      }
      
      // Atualizar gráfico
      if (monthlyData.length > 0) {
        updateChart(monthlyData);
      } else if (financeChart) {
        financeChart.destroy();
      }
    }
    
    // ... (demais funções de support: removeTransaction, calculateTotals, groupByMonth, formatMonth, updateChart)
    // Remover transação
    function removeTransaction(id) {
      let transactions = getSavedTransactions();
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions(transactions);
      updateDashboard();
    }
    
    // Calcular total de entradas e saídas
    function calculateTotals(transactions) {
      let totalIncome = 0;
      let totalExpense = 0;
      
      transactions.forEach(t => {
        if (t.type === 'ENTRADA') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      });
      
      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      };
    }
    
    // Agrupar dados por mês
    function groupByMonth(transactions) {
      const monthlyData = {};
      
      transactions.forEach(t => {
        const month = t.date.substring(0, 7); // Extrair ano e mês (YYYY-MM)
        const type = t.type;
        
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }
        
        if (type === 'ENTRADA') {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += t.amount;
        }
      });
      
      // Converter para array e ordenar por data
      const sortedMonths = Object.keys(monthlyData).sort();
      return sortedMonths.map(month => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense
      }));
    }
    
    // Formatar mês (ex: 2023-12 → Dez/2023)
    function formatMonth(monthStr) {
      const [year, month] = monthStr.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    }
    
    // Atualizar gráfico
    function updateChart(monthlyData) {
      const ctx = document.getElementById('finance-chart').getContext('2d');
      
      // Destruir gráfico anterior se existir
      if (financeChart) {
        financeChart.destroy();
      }
      
      financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyData.map(d => formatMonth(d.month)),
          datasets: [
            {
              label: 'Entradas',
              data: monthlyData.map(d => d.income),
              backgroundColor: '#10B981',
              borderRadius: 6,
            },
            {
              label: 'Saídas',
              data: monthlyData.map(d => d.expense),
              backgroundColor: '#EF4444',
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'R$ ' + value.toFixed(2);
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += 'R$ ' + context.parsed.y.toFixed(2);
                  return label;
                }
              }
            }
          }
        }
      });
    }
    
    // Exemplo de dados
    function loadSampleData() {
      const sampleData = [
        'fa3631ab-6448-49a8-8f6f-a2a94a38cfea;31/12/2023;Cartão da Conta;Gela Prime Mercadinho Juazeiro Do Nbr;-22,80',
        '74a83ccc-ca93-4982-b4da-16ec08367a4c;31/12/2023;Cartão da Conta;Pag*caktus Juazeiro Do Nbr;-179,83',
        '5eca578a-3b52-432c-8c00-37ae43df8b5e;31/12/2023;Cartão da Conta;Drogaria Grangeir Juazeiro Do Nbr;14,40',
        '3f29a65f-b16f-4515-a088-0bb5ebb451d2;31/12/2023;Cartão da Conta;Guilherme Sampaio Sarai Barbalha Br;-108,52',
        'a1b2c3d4-e5f6-7890-1234-56789abcdef0;15/01/2024;Transferência;Salário Empresa XYZ;4500,00',
        'b2c3d4e5-f6a7-89b0-c1d2-ef3456789abc;20/01/2024;Cartão de Crédito;Supermercado ABC;-350,75',
        'c3d4e5f6-a789-b012-c345-6789abcdef01;05/02/2024;Pix;Freelance Projeto ABC;1200,00',
        'd4e5f6a7-89b0-c1d2-ef34-56789abcdef2;10/02/2024;Boleto;Faculdade;-780,00'
      ];
      
      document.getElementById('transactions').value = sampleData.join('\n');
      document.getElementById('feedback').innerHTML = `
        <div class="bg-purple-50 p-3 rounded-lg text-purple-800">
          <i class="fas fa-info-circle mr-2"></i> Dados de exemplo carregados. Clique em "Adicionar Transações" para inseri-los.
        </div>`;
    }
    
    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Carregar dados salvos
      updateDashboard();
      
      // Configurar botões
      document.getElementById('add-btn').addEventListener('click', () => {
        const inputData = document.getElementById('transactions').value;
        addTransactions(inputData);
      });
      
      document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Deseja realmente limpar todos os dados? Esta ação não pode ser desfeita.')) {
          localStorage.removeItem(STORAGE_KEY);
          document.getElementById('transactions').value = '';
          document.getElementById('feedback').innerHTML = `
            <div class="bg-green-50 p-3 rounded-lg text-green-800">
              <i class="fas fa-check-circle mr-2"></i> Todos os dados foram removidos.
            </div>`;
          showNotification('success', 'Dados limpos!', 'Todas as transações foram removidas.');
          updateDashboard();
        }
      });
      
      document.getElementById('sample-btn').addEventListener('click', loadSampleData);
      document.getElementById('export-btn').addEventListener('click', exportData);
      document.getElementById('import-btn').addEventListener('click', importData);
      
      // Mostrar nome do arquivo selecionado
      document.getElementById('import-file').addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          document.getElementById('file-name-display').textContent = 'Arquivo selecionado: ' + this.files[0].name;
          document.getElementById('import-btn').disabled = false;
        } else {
          document.getElementById('file-name-display').textContent = '';
          document.getElementById('import-btn').disabled = true;
        }
      });
    });


    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            tertiary: '#8B5CF6',
            dark: '#1F2937',
          }
        }
      }
    }