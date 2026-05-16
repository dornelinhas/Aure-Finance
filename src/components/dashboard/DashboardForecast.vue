<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm anim-section delay-1">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-5 bg-[var(--color-accent)] rounded-full"></div>
        <h3 class="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Projeção: {{ nextMonthLabel }}</h3>
      </div>
      <span class="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Compromissos</span>
    </div>

    <div class="grid grid-cols-5 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <!-- Gastos Previstos -->
      <div class="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Gastos Previstos</p>
        <p class="text-[24px] font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none mb-1">{{ fmt(nextMonthForecastTotal) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">Próximo mês</p>
      </div>

      <!-- Assinaturas -->
      <div class="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Assinaturas</p>
        <p class="text-[24px] font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none mb-1">{{ fmt(subTotal) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">{{ activeSubs.length }} serviços</p>
      </div>

      <!-- Compras -->
      <div class="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Compras Est.</p>
        <p class="text-[24px] font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none mb-1">{{ fmt(shoppingForecastTotal) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">Listas ativas</p>
      </div>

      <!-- Receita Prevista -->
      <div class="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Receita Prevista</p>
        <p class="text-[24px] font-extrabold text-[var(--color-income)] tracking-tight leading-none mb-1">{{ fmt(nextMonthIncomeTotal) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">{{ nextMonthIncomeTotal > 0 ? 'Planejado' : 'Sem registros' }}</p>
      </div>

      <!-- Receita Livre -->
      <div class="bg-[var(--color-income-bg)] rounded-xl p-5 border border-[var(--color-income-bg)]">
        <p class="text-[11px] font-bold text-[var(--color-income)] uppercase tracking-wider mb-2">Receita Livre</p>
        <p class="text-[24px] font-extrabold text-[var(--color-income)] tracking-tight leading-none mb-1">{{ fmt(Math.max(0, nextMonthIncomeTotal - nextMonthForecastTotal)) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-income)]">Sobra estimada</p>
      </div>
    </div>

    <!-- Detalhamento -->
    <div v-if="forecastItems.length > 0" class="mt-5 border-t border-[var(--color-border)] pt-4">
      <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Detalhamento da Projeção</p>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 max-sm:grid-cols-1">
        <div v-for="item in forecastItems.slice(0, 10)" :key="item.name" class="flex items-center justify-between py-1.5 border-b border-[var(--color-separator)]">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full" :class="item.type === 'income' ? 'bg-[var(--color-income)]' : (item.type === 'sub' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-expense)]')"></span>
            <span class="text-[12px] font-medium text-[var(--color-text-secondary)]">{{ item.name }}</span>
            <span class="text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 rounded">{{ item.label }}</span>
          </div>
          <span class="text-[12px] font-bold" :class="item.type === 'income' ? 'text-[var(--color-income)]' : 'text-[var(--color-text-primary)]'">{{ fmt(item.amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFinanceStore } from '../../stores/finance.js';
import { useFinanceUtils } from '../../composables/useFinanceUtils.js';

const store = useFinanceStore();
const { fmt, MONTHS, currentMonth, currentYear } = useFinanceUtils();

const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
const nextMonthLabel = MONTHS[nextMonthDate.getMonth()] + ' ' + nextMonthDate.getFullYear();

const activeSubs = computed(() => store.subscriptions.filter(s => !!s.active));
const subTotal = computed(() => activeSubs.value.reduce((s, sub) => s + sub.amount, 0));

const shoppingForecastTotal = computed(() => {
  const activeListsIds = store.shoppingLists.filter(l => !!l.is_active).map(l => l.id);
  return store.stock
    .filter(s => s.quantity <= s.min_qty && (!s.list_id || activeListsIds.includes(s.list_id)))
    .reduce((sum, item) => sum + (item.last_price || 0), 0);
});

const forecastItems = computed(() => {
  const items = [];
  const nm = nextMonthDate.getMonth();
  const ny = nextMonthDate.getFullYear();

  // 1. Receitas Reais (Lançamentos para o mês que vem)
  const registeredIncome = store.transactions.filter(t => {
    const d = new Date(t.date + 'T12:00:00');
    return d.getMonth() === nm && d.getFullYear() === ny && t.type === 'income';
  });
  registeredIncome.forEach(t => items.push({ name: t.name, amount: t.amount, type: 'income', label: 'Lançamento' }));

  // 2. Receitas Fixas (Categorias Marcadas como Recorrentes)
  store.categories.filter(c => c.type === 'income' && !!c.is_recurring && c.budget_limit > 0).forEach(c => {
    const exists = registeredIncome.some(t => t.category === c.name);
    if (!exists) {
      items.push({ name: c.name, amount: c.budget_limit, type: 'income', label: 'Recorrente' });
    }
  });

  // Fallback Salário Base se nada for encontrado
  if (items.filter(i => i.type === 'income').length === 0 && store.settings.monthly_salary > 0) {
    items.push({ name: 'Salário Base', amount: store.settings.monthly_salary, type: 'income', label: 'Fixo' });
  }

  // 3. Assinaturas
  activeSubs.value.forEach(s => items.push({ name: s.name, amount: s.amount, type: 'sub', label: 'Assinatura' }));

  // 4. Despesas Reais (Lançamentos para o mês que vem)
  const registeredExpense = store.transactions.filter(t => {
    const d = new Date(t.date + 'T12:00:00');
    return d.getMonth() === nm && d.getFullYear() === ny && t.type === 'expense' && !!t.is_personal;
  });
  registeredExpense.forEach(t => items.push({ name: t.name, amount: t.amount, type: 'expense', label: 'Lançamento' }));

  // 5. Despesas Fixas (Categorias Marcadas como Recorrentes)
  store.categories.filter(c => c.type === 'expense' && !!c.is_recurring && c.budget_limit > 0).forEach(c => {
    const exists = registeredExpense.some(t => t.category === c.name);
    if (!exists) {
      items.push({ name: c.name, amount: c.budget_limit, type: 'expense', label: 'Orçamento' });
    }
  });

  return items.sort((a, b) => b.amount - a.amount);
});

const nextMonthIncomeTotal = computed(() => forecastItems.value.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0));
const nextMonthForecastTotal = computed(() => forecastItems.value.filter(i => i.type !== 'income').reduce((s, i) => s + i.amount, 0));
</script>
