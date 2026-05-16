<template>
  <div class="h-full flex flex-col bg-[var(--color-bg)] overflow-auto font-[var(--font-sans)]">
    <div class="px-6 py-6 pb-12 w-full max-w-[1200px] mx-auto">
      
      <!-- Header -->
      <div class="px-8 pt-8 flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h1 class="text-[28px] font-extrabold tracking-tight text-[var(--color-text-primary)]">Categorias</h1>
          <p class="text-[13px] text-[var(--color-text-secondary)] mt-1 font-medium italic text-blue-500">Versão Atualizada: 18:50 (Verifique o Interruptor Azul)</p>
        </div>
        <div class="flex gap-2">
          <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 border-none bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]" @click="openModal()">Nova Categoria</button>
        </div>
      </div>

      <!-- Despesas -->
      <div class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2 h-6 bg-[var(--color-expense)] rounded-full"></div>
          <h2 class="text-lg font-bold text-[var(--color-text-primary)]">Despesas</h2>
        </div>

        <div v-if="expenseCategories.length === 0" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
          <p class="text-base font-bold text-[var(--color-text-primary)] mb-1">Nenhuma categoria de despesa</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div v-for="cat in expenseCategories" :key="cat.id" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: cat.color }"></div>
            <div class="flex justify-between items-start mb-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" :style="{ backgroundColor: cat.color }">
                  <span class="font-bold text-[15px] uppercase tracking-widest">{{ cat.name.substring(0, 2) }}</span>
                </div>
                <div>
                  <h3 class="font-bold text-[15px] text-[var(--color-text-primary)]">{{ cat.name }}</h3>
                  <p v-if="cat.budget_limit > 0" class="text-[12px] font-medium text-[var(--color-text-secondary)]">Limite: {{ fmt(cat.budget_limit) }}</p>
                  <p v-else class="text-[12px] font-medium text-[var(--color-text-secondary)]">Sem limite</p>
                  <span v-if="cat.is_recurring" class="inline-block mt-1 text-[10px] font-black uppercase bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Categoria Fixa</span>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100">
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]" @click="quickAdd(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]" @click="openModal(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-expense-bg)]" @click="remove(cat.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
            </div>

            <div class="mt-2">
              <div class="flex justify-between items-end mb-2.5">
                <div>
                  <p class="text-[24px] font-light tracking-tight text-[var(--color-text-primary)] leading-none mb-1">{{ fmt(spent[cat.name] || 0) }}</p>
                  <p class="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Gasto no mês</p>
                </div>
                <div class="text-right">
                  <span v-if="isOver(cat)" class="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--color-expense)] bg-[var(--color-expense-bg)] px-2 py-0.5 rounded-md">Excedeu</span>
                  <span v-else-if="cat.budget_limit > 0" class="text-[12px] font-bold text-[var(--color-income)]">Faltam {{ fmt(cat.budget_limit - (spent[cat.name] || 0)) }}</span>
                </div>
              </div>
              <div class="h-2 w-full bg-[var(--color-surface-secondary)] rounded-full overflow-hidden flex">
                <div class="h-full transition-all duration-500 rounded-full" :style="{ width: getPct(cat) + '%', backgroundColor: isOver(cat) ? 'var(--color-expense)' : isWarn(cat) ? 'var(--color-warning)' : cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Receitas -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2 h-6 bg-[var(--color-income)] rounded-full"></div>
            <h2 class="text-lg font-bold text-[var(--color-text-primary)]">Receitas</h2>
          </div>
          <div class="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex items-center gap-3">
             <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Receita Fixa Total</span>
             <span class="text-lg font-black text-blue-600">{{ fmt(store.settings.monthly_salary) }}</span>
          </div>
        </div>

        <div v-if="incomeCategories.length === 0" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
          <p class="text-base font-bold text-[var(--color-text-primary)] mb-1">Nenhuma categoria de receita</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div v-for="cat in incomeCategories" :key="cat.id" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: cat.color }"></div>
            <div class="flex justify-between items-start mb-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" :style="{ backgroundColor: cat.color }">
                  <span class="font-bold text-[15px] uppercase tracking-widest">{{ cat.name.substring(0, 2) }}</span>
                </div>
                <div>
                  <h3 class="font-bold text-[15px] text-[var(--color-text-primary)]">{{ cat.name }}</h3>
                  <p v-if="cat.budget_limit > 0" class="text-[12px] font-medium text-[var(--color-text-secondary)]">Expectativa: {{ fmt(cat.budget_limit) }}</p>
                  <p v-else class="text-[12px] font-medium text-[var(--color-text-secondary)]">Sem valor definido</p>
                  <span v-if="cat.is_recurring" class="inline-block mt-1 text-[10px] font-black uppercase bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Receita Fixa</span>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100">
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]" @click="quickAdd(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]" @click="openModal(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                <button class="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-expense-bg)]" @click="remove(cat.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
            </div>

            <div class="mt-2">
              <div class="flex justify-between items-end mb-2.5">
                <div>
                  <p class="text-[24px] font-light tracking-tight text-[var(--color-text-primary)] leading-none mb-1">{{ fmt(spent[cat.name] || 0) }}</p>
                  <p class="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Recebido no mês</p>
                </div>
                <div class="text-right">
                  <span v-if="isIncomeTargetMet(cat)" class="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Meta Batida!</span>
                  <span v-else-if="cat.budget_limit > 0" class="text-[12px] font-bold text-[var(--color-text-secondary)]">Faltam {{ fmt(cat.budget_limit - (spent[cat.name] || 0)) }}</span>
                </div>
              </div>
              <div class="h-2 w-full bg-[var(--color-surface-secondary)] rounded-full overflow-hidden flex">
                <div class="h-full transition-all duration-500 rounded-full" :style="{ width: (cat.budget_limit > 0 ? getPct(cat) : 0) + '%', backgroundColor: isIncomeTargetMet(cat) ? '#10b981' : cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :visible="showModal" title="CONFIGURAR CATEGORIA" @close="closeModal">
      <div class="space-y-5 py-2">
        <!-- 1. RECURRING TOGGLE (TOP PRIORITY) -->
        <div class="p-4 rounded-2xl border-2 border-blue-500/40 bg-blue-50 flex items-center justify-between shadow-sm">
          <div class="flex-1 pr-4">
            <p class="text-[15px] font-black text-blue-900 uppercase tracking-tight">Fixo / Sempre aparecer?</p>
            <p class="text-[11px] text-blue-700 font-bold leading-tight mt-1">Este valor será somado automaticamente em todos os meses futuros.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.is_recurring" class="sr-only peer">
            <div class="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase mb-1.5">Tipo</label>
            <div class="flex gap-1.5 p-1 bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)]">
              <button v-for="t in [['income','Ganho'],['expense','Gasto']]" :key="t[0]" @click="form.type = t[0]" class="flex-1 py-2 rounded-lg text-[11px] font-black uppercase transition-all" :class="form.type === t[0] ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-tertiary)] border-none'">{{ t[1] }}</button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase mb-1.5">Cor</label>
            <input type="color" v-model="form.color" class="w-full h-[46px] rounded-xl cursor-pointer border border-[var(--color-border)] p-1 bg-white" />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase mb-1.5">Nome da Categoria</label>
          <input class="form-input !py-3 !rounded-xl !text-base font-bold" v-model="form.name" placeholder="Ex: Salário, Aluguel, Uber..." />
        </div>

        <div>
          <label class="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase mb-1.5">Valor Mensal (R$)</label>
          <input class="form-input !py-3 !rounded-xl !text-xl font-black text-blue-600" type="number" v-model.number="form.budget_limit" placeholder="0,00" />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 w-full">
          <button class="flex-1 px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm font-black uppercase tracking-wider" @click="closeModal">Cancelar</button>
          <button class="flex-[2] px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-200" @click="save">Salvar Alterações</button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '../stores/finance.js'
import { api } from '../api/index.js'
import { useEventBus } from '../composables/useEventBus.js'
import AppModal from '../components/AppModal.vue'

const store = useFinanceStore()
const router = useRouter()
const { on } = useEventBus()

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const categories = ref([])
const transactions = ref([])
const showModal = ref(false)
const editing = ref(null)

const emptyForm = () => ({ name: '', type: 'expense', budget_limit: 0, color: '#0066FF', is_recurring: false })
const form = ref(emptyForm())

async function fetchData() {
  await store.fetchData()
  categories.value = store.categories
  transactions.value = store.transactions
}

onMounted(() => {
  fetchData()
  on('transaction-added', fetchData)
})

const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))

const monthTxns = computed(() =>
  transactions.value.filter(t => {
    const d = new Date(t.date + 'T12:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
)

const spent = computed(() => {
  const map = {}
  monthTxns.value.forEach(t => { 
    map[t.category] = (map[t.category] || 0) + t.amount 
  })
  return map
})

function getPct(cat) {
  if (!cat.budget_limit || cat.budget_limit <= 0) return 0
  return Math.min(100, ((spent.value[cat.name] || 0) / cat.budget_limit) * 100)
}

function isOver(cat) {
  if (cat.type === 'income') return false
  return cat.budget_limit > 0 && (spent.value[cat.name] || 0) >= cat.budget_limit
}

function isIncomeTargetMet(cat) {
  const actual = spent.value[cat.name] || 0
  // SÓ BATE A META SE RECEBER VALOR REAL > 0
  return cat.type === 'income' && cat.budget_limit > 0 && actual >= cat.budget_limit && actual > 0
}

function isWarn(cat) {
  const pct = getPct(cat)
  return cat.type === 'expense' && cat.budget_limit > 0 && pct >= 70 && pct < 100
}

function openModal(cat = null) {
  if (cat) {
    editing.value = cat.id
    form.value = { 
      name: cat.name, 
      type: cat.type, 
      budget_limit: cat.budget_limit || 0, 
      color: cat.color, 
      is_recurring: !!cat.is_recurring 
    }
  } else {
    editing.value = null
    form.value = emptyForm()
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function save() {
  if (!form.value.name) return
  const data = { ...form.value, budget_limit: Number(form.value.budget_limit) || 0 }
  
  console.log('[DEBUG] Saving Category:', data);

  let res;
  if (editing.value) {
    res = await api.updateCategory(editing.value, data)
  } else {
    res = await api.createCategory(data)
  }

  // Sincroniza Salário com Configurações Base do sistema
  if (res.name === 'Salário' && res.type === 'income') {
    await store.updateSettings({ ...store.settings, monthly_salary: res.budget_limit })
  }

  await store.fetchData()
  categories.value = store.categories
  closeModal()
}

async function remove(id) {
  if (!confirm('Excluir esta categoria?')) return
  await api.deleteCategory(id)
  await store.fetchData()
  categories.value = store.categories
}

function quickAdd(cat) {
  router.push({ name: 'transactions', query: { quickAdd: 'true', catName: cat.name, catType: cat.type } })
}
</script>
