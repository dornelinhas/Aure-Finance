<template>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm anim-section delay-1">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-5 bg-[var(--color-accent)] rounded-full"></div>
        <h3 class="text-[13px] font-black text-[var(--color-text-primary)] uppercase tracking-wider">Projeção: {{ nextMonthLabel }}</h3>
      </div>
      <span class="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Futuro</span>
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
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">{{ activeSubs.length }} ativos</p>
      </div>

      <!-- Compras -->
      <div class="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <p class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Compras Est.</p>
        <p class="text-[24px] font-extrabold text-[var(--color-text-primary)] tracking-tight leading-none mb-1">{{ fmt(shoppingForecastTotal) }}</p>
        <p class="text-[11px] font-medium text-[var(--color-text-secondary)]">Soma das listas</p>
      </div>

      <!-- Receita Prevista -->
      <div class="bg-green-50 border-2 border-green-100 rounded-xl p-5 shadow-sm">
        <p class="text-[11px] font-black text-green-700 uppercase tracking-wider mb-2">Receita Prevista</p>
        <p class="text-[24px] font-black text-green-600 tracking-tight leading-none mb-1">{{ fmt(nextMonthIncomeTotal) }}</p>
        <p class="text-[10px] font-black text-green-500 uppercase">{{ nextMonthIncomeTotal > 0 ? 'Somado' : 'Sem previsão' }}</p>
      </div>

      <!-- Receita Livre -->
      <div class="bg-blue-600 text-white rounded-xl p-5 shadow-lg shadow-blue-100">
        <p class="text-[11px] font-black uppercase tracking-wider mb-2 opacity-80">Receita Livre</p>
        <p class="text-[24px] font-black tracking-tight leading-none mb-1">{{ fmt(nextMonthIncomeTotal - nextMonthForecastTotal) }}</p>
        <p class="text-[10px] font-black uppercase opacity-80">Sobra Estimada</p>
      </div>
    </div>

    <!-- Detalhamento -->
    <div v-if="forecastItems.length > 0" class="mt-5 border-t border-[var(--color-border)] pt-4">
      <p class="text-[11px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-4">Detalhamento dos Lançamentos</p>
      <div class="grid grid-cols-2 gap-x-8 gap-y-3 max-sm:grid-cols-1">
        <div v-for="item in forecastItems" :key="item.name" class="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full" :class="item.type === 'income' ? 'bg-green-500' : 'bg-red-400'"></div>
            <div>
              <p class="text-[13px] font-black text-[var(--color-text-primary)] uppercase tracking-tight">{{ item.name }}</p>
              <span class="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase">{{ item.label }}</span>
            </div>
          </div>
          <p class="text-[14px] font-black" :class="item.type === 'income' ? 'text-green-600' : 'text-[var(--color-text-primary)]'">{{ fmt(item.amount) }}</p>
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

const nextMonthLabel = computed(() => {
  const nm = (currentMonth.value + 1) % 12;
  const ny = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;
  return MONTHS[nm] + ' ' + ny;
});

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
  const nm = (currentMonth.value + 1) % 12;
  const ny = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;

  // 1. Receitas Reais (Junho)
  const registeredIncome = store.transactions.filter(t => {
    const d = new Date(t.date + 'T12:00:00');
    return d.getMonth() === nm && d.getFullYear() === ny && t.type === 'income';
  });
  registeredIncome.forEach(t => items.push({ name: t.name, amount: t.amount, type: 'income', label: 'Lançamento' }));

  // 2. Receitas Fixas (Categorias Marcadas como Recorrentes)
  store.categories.filter(c => c.type === 'income' && (!!c.is_recurring || c.name.toLowerCase().includes('salário')) && c.budget_limit > 0).forEach(c => {
    const exists = registeredIncome.some(t => t.category === c.name);
    if (!exists) {
      items.push({ name: c.name, amount: c.budget_limit, type: 'income', label: 'Recorrente' });
    }
  });

  // Fallback Global
  if (items.filter(i => i.type === 'income').length === 0 && store.settings.monthly_salary > 0) {
    items.push({ name: 'Salário Base', amount: store.settings.monthly_salary, type: 'income', label: 'Configurado' });
  }

  // 3. Assinaturas
  activeSubs.value.forEach(s => items.push({ name: s.name, amount: s.amount, type: 'sub', label: 'Assinatura' }));

  // 4. Despesas Reais (Junho)
  const registeredExpense = store.transactions.filter(t => {
    const d = new Date(t.date + 'T12:00:00');
    return d.getMonth() === nm && d.getFullYear() === ny && t.type === 'expense' && !!t.is_personal;
  });
  registeredExpense.forEach(t => items.push({ name: t.name, amount: t.amount, type: 'expense', label: 'Lançamento' }));

  // 5. Despesas Fixas (Orçamentos Recorrentes)
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
