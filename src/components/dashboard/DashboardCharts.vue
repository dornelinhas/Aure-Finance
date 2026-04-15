<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5 anim-section delay-2">
    <!-- Receitas vs Despesas (BarChart) -->
    <div class="md:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 class="text-[10px] sm:text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3 sm:mb-4">Receitas vs Despesas (6 meses)</h3>
      <div v-if="store.loading" class="h-[180px] sm:h-[220px] w-full flex items-end gap-2 sm:gap-4 px-2 sm:px-4 pb-2">
        <SkeletonLoader v-for="i in 6" :key="i" width="w-full" :height="['h-20', 'h-32', 'h-24', 'h-40', 'h-16', 'h-28'][i-1]" radius="rounded-t-md" />
      </div>
      <div v-else class="h-[180px] sm:h-[220px] w-full">
        <BarChart :data="monthlyData" />
      </div>
    </div>

    <!-- Gastos por Categoria (DonutChart) -->
    <div class="md:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 class="text-[10px] sm:text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3 sm:mb-4">Categorias ({{ monthLabel }})</h3>
      <div v-if="store.loading" class="flex flex-col gap-4 sm:gap-6 items-center">
        <SkeletonLoader width="w-[120px] sm:w-[140px]" height="h-[120px] sm:h-[140px]" radius="rounded-full" />
        <div class="w-full flex flex-col gap-2 sm:gap-3">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between">
            <SkeletonLoader width="w-24 sm:w-32" height="h-3 sm:h-4" />
            <SkeletonLoader width="w-12 sm:w-16" height="h-3 sm:h-4" />
          </div>
        </div>
      </div>
      <div v-else-if="donutData.length === 0" class="text-[12px] sm:text-[13px] text-center py-8 sm:py-10 text-[var(--color-text-secondary)]">
        Nenhuma despesa registrada.
      </div>
      <div v-else class="flex flex-row md:flex-col gap-4 items-center">
        <div class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] shrink-0">
          <DonutChart :data="donutData" />
        </div>
        <div class="w-full flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
          <div v-for="d in donutData.slice(0, 5)" :key="d.name" class="flex items-center justify-between text-[11px] sm:text-[13px]">
            <div class="flex items-center gap-2 overflow-hidden pr-2">
              <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" :style="{ background: d.color }" />
              <span class="text-[var(--color-text-secondary)] font-medium truncate">{{ d.name }}</span>
            </div>
            <span class="font-bold shrink-0">{{ fmt(d.value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFinanceStore } from '../../stores/finance.js';
import { useFinanceUtils } from '../../composables/useFinanceUtils.js';
import BarChart from '../BarChart.vue';
import DonutChart from '../DonutChart.vue';
import SkeletonLoader from '../SkeletonLoader.vue';

const store = useFinanceStore();
const { fmt, MONTHS, currentMonth, currentYear, monthLabel, monthTxns } = useFinanceUtils();

const monthlyData = computed(() => {
  const result = [];
  for (let i = 4; i >= -1; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const txns = store.transactions.filter(t => {
      const td = new Date(t.date + 'T12:00:00');
      return td.getMonth() === m && td.getFullYear() === y;
    });
    result.push({
      label: MONTHS[m] + (i === -1 ? ' (Prev)' : ''),
      income: txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    });
  }
  return result;
});

const donutData = computed(() => {
  const map = {};
  monthTxns.value.filter(t => t.type === 'expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  
  store.subscriptions.filter(s => !!s.active).forEach(s => {
    const subTxnName = 'Assinatura: ' + s.name;
    const hasBeenProcessed = monthTxns.value.some(t => t.name === subTxnName);
    if (!hasBeenProcessed && s.category) {
      map[s.category] = (map[s.category] || 0) + s.amount;
    }
  });

  return Object.entries(map)
    .map(([name, value]) => {
      const cat = store.categories.find(c => c.name === name);
      return { name, value, color: cat?.color || '#86868B' };
    })
    .sort((a, b) => b.value - a.value);
});
</script>
