<template>
  <div class="bg-[var(--color-accent)] rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 text-white relative overflow-hidden shadow-[var(--shadow-sm)] flex items-center justify-between min-h-[180px] sm:min-h-[200px] max-lg:flex-col max-lg:items-start max-lg:gap-6 sm:gap-8 anim-hero">
    
    <!-- Left: Current Month focus -->
    <div class="relative z-10 flex flex-col justify-center w-full">
      <h2 class="text-[11px] sm:text-[14px] font-bold mb-1 opacity-80 uppercase tracking-widest">Saldo Disponível (Real)</h2>
      <div v-if="store.loading" class="my-2">
        <SkeletonLoader width="w-48" height="h-10" radius="rounded-lg" class="opacity-30 bg-white!" />
      </div>
      <div v-else class="flex items-baseline gap-2 mb-1">
        <span class="text-[32px] sm:text-[42px] leading-tight font-extrabold tracking-tight">{{ fmt(availableBalance) }}</span>
      </div>
      <div v-if="store.loading" class="mb-4">
        <SkeletonLoader width="w-64" height="h-4" class="opacity-20 bg-white!" />
      </div>
      <p v-else class="text-[11px] sm:text-[12px] font-medium opacity-70 mb-3 sm:mb-4">
        {{ fmt(totalIncome - totalExpense) }} total na conta <span class="opacity-50">(-{{ fmt(Math.abs(cardExpense)) }} fatura)</span>
      </p>
      <div class="flex items-center gap-2">
        <span class="bg-white/20 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full">
          {{ monthLabel }} {{ currentYear }}
        </span>
      </div>
    </div>

    <!-- Right: Key Metrics -->
    <div class="relative z-10 grid grid-cols-2 sm:flex sm:gap-8 lg:pr-4 w-full sm:w-auto max-lg:justify-between gap-4">
      <div class="flex flex-col items-start sm:items-end">
        <span class="text-[9px] sm:text-[11px] font-bold opacity-70 uppercase tracking-widest mb-1">Total Gastos</span>
        <div v-if="store.loading" class="mt-1">
          <SkeletonLoader width="w-24" height="h-6" class="opacity-20 bg-white!" />
        </div>
        <span v-else class="text-[16px] sm:text-[20px] font-bold">{{ fmt(totalExpense + cardExpense) }}</span>
      </div>
      <router-link to="/cartoes" class="flex flex-col items-start sm:items-end cursor-pointer hover:opacity-80 transition-opacity no-underline text-white">
        <span class="text-[9px] sm:text-[11px] font-bold opacity-70 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          Fatura Cartão
        </span>
        <div v-if="store.loading" class="mt-1">
          <SkeletonLoader width="w-20" height="h-6" class="opacity-20 bg-white!" />
        </div>
        <span v-else class="text-[16px] sm:text-[20px] font-bold">{{ fmt(cardExpense) }}</span>
        <span v-if="!store.loading" class="text-[8px] sm:text-[10px] font-medium opacity-70">Vence dia {{ store.settings.credit_card_due_day || 10 }}</span>
      </router-link>
      <div class="flex flex-col items-start sm:items-end">
        <span class="text-[9px] sm:text-[11px] font-bold opacity-70 uppercase tracking-widest mb-1">Receita (Bruta)</span>
        <div v-if="store.loading" class="mt-1">
          <SkeletonLoader width="w-24" height="h-6" class="opacity-20 bg-white!" />
        </div>
        <span v-else class="text-[16px] sm:text-[20px] font-bold">{{ fmt(totalIncome) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFinanceStore } from '../../stores/finance.js';
import { useFinanceUtils } from '../../composables/useFinanceUtils.js';
import SkeletonLoader from '../SkeletonLoader.vue';

const store = useFinanceStore();
const { fmt, availableBalance, totalIncome, totalExpense, cardExpense, monthLabel, currentYear } = useFinanceUtils();

defineEmits([]);
</script>
