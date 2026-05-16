import { ref, computed } from 'vue';
import { useFinanceStore } from '../stores/finance.js';

export function useFinanceUtils() {
  const store = useFinanceStore();

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(v || 0);

  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  
  // Usar data atual REATIVA
  const today = ref(new Date());
  const currentMonth = computed(() => today.value.getMonth());
  const currentYear = computed(() => today.value.getFullYear());

  const monthLabel = computed(() => MONTHS[currentMonth.value]);

  // Filtro de transações do mês atual
  const monthTxns = computed(() =>
    store.transactions.filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value;
    })
  );

  // Cálculos Básicos
  const totalIncome = computed(() => 
    monthTxns.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );

  const totalExpense = computed(() => {
    const cardNames = store.cards.map(c => c.name);
    const regularExpense = monthTxns.value
      .filter(t => t.type === 'expense' && !cardNames.includes(t.account) && t.is_paid && t.is_personal)
      .reduce((s, t) => s + t.amount, 0);
    
    const subRemaining = store.subscriptions.filter(s => !!s.active).reduce((total, s) => {
      const subTxnName = 'Assinatura: ' + s.name;
      const hasBeenProcessed = monthTxns.value.some(t => t.name === subTxnName);
      return !hasBeenProcessed ? total + s.amount : total;
    }, 0);

    return regularExpense + subRemaining;
  });

  const cardExpense = computed(() => {
    const cardNames = store.cards.map(c => c.name);
    return monthTxns.value
      .filter(t => t.type === 'expense' && cardNames.includes(t.account) && t.is_paid && t.is_personal)
      .reduce((s, t) => s + t.amount, 0);
  });

  const availableBalance = computed(() => {
    return totalIncome.value - totalExpense.value - cardExpense.value;
  });

  const freeIncome = computed(() => {
    const base = totalIncome.value || store.settings.monthly_salary || 0;
    return base - totalExpense.value - cardExpense.value;
  });

  const nextMonthIncome = computed(() => {
    const nm = (currentMonth.value + 1) % 12;
    const ny = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;
    return store.transactions
      .filter(t => {
        const d = new Date(t.date + 'T12:00:00');
        return d.getMonth() === nm && d.getFullYear() === ny && t.type === 'income';
      })
      .reduce((s, t) => s + t.amount, 0);
  });

  const savingsRate = computed(() => {
    const base = store.settings.monthly_salary || totalIncome.value || 1;
    const balance = (store.settings.initial_balance || 0) + totalIncome.value - totalExpense.value;
    return (balance / base * 100);
  });

  return {
    fmt,
    currentMonth,
    currentYear,
    MONTHS,
    monthLabel,
    monthTxns,
    totalIncome,
    totalExpense,
    cardExpense,
    availableBalance,
    freeIncome,
    nextMonthIncome,
    savingsRate
  };
}
