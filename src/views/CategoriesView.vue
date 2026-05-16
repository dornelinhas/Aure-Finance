<template>
  <div class="h-full flex flex-col bg-[var(--color-bg)] overflow-auto font-[var(--font-sans)]">
    <div class="px-6 py-6 pb-12 w-full max-w-[1200px] mx-auto">
      
      <!-- Cabeçalho -->
      <div class="px-4 sm:px-8 pt-4 sm:pt-8 flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="text-[32px] font-black tracking-tight text-[var(--color-text-primary)] uppercase">Suas Categorias</h1>
          <div class="flex items-center gap-3 mt-2">
            <span class="text-[11px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">Visão do Mês:</span>
            <div class="flex items-center bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-full px-4 py-1.5 shadow-sm">
              <select v-model="viewMonth" class="bg-transparent border-none font-black text-blue-600 text-[13px] cursor-pointer outline-none mr-2">
                <option v-for="(m, i) in MONTHS" :key="m" :value="i">{{ m.toUpperCase() }}</option>
              </select>
              <div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>
              <select v-model="viewYear" class="bg-transparent border-none font-black text-blue-600 text-[13px] cursor-pointer outline-none">
                <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>
        <button class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[20px] text-xs font-black uppercase cursor-pointer transition-all duration-150 border-none bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95" @click="openModal()">+ Criar Nova</button>
      </div>

      <!-- SEÇÃO RECEITAS -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6 px-4 sm:px-8">
          <div class="flex items-center gap-3">
            <div class="w-3 h-8 bg-green-500 rounded-full shadow-lg shadow-green-200"></div>
            <h2 class="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Ganhos / Receitas</h2>
          </div>
          <div class="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-green-100 flex flex-col items-end">
             <span class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Entrou ({{ MONTHS[viewMonth] }})</span>
             <span class="text-2xl font-black">{{ fmt(totalMonthIncome) }}</span>
          </div>
        </div>

        <div v-if="incomeCategories.length === 0" class="mx-4 sm:mx-8 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-[32px] p-12 text-center">
          <p class="text-gray-400 font-bold uppercase tracking-widest">Nenhum ganho cadastrado ainda.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 px-4 sm:px-8">
          <div v-for="cat in incomeCategories" :key="cat.id" class="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[28px] p-7 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group">
            <div class="absolute top-0 left-0 right-0 h-2" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-lg" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-[17px] text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <div v-if="cat.is_recurring" class="mt-1 flex items-center gap-1">
                    <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase text-blue-600">Fixo Mensal</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button class="p-2.5 rounded-xl text-gray-400 hover:bg-green-600 hover:text-white transition-colors" @click="quickAdd(cat)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-2.5 rounded-xl text-gray-400 hover:bg-blue-600 hover:text-white transition-colors" @click="openModal(cat)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[38px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(spent[cat.name] || 0) }}</p>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recebido em {{ MONTHS[viewMonth] }}</p>
            </div>

            <div v-if="cat.budget_limit > 0" class="mt-6 pt-4 border-t-2 border-[var(--color-border)] flex items-center justify-between">
              <p class="text-[11px] font-black text-gray-400 uppercase">Expectativa:</p>
              <p class="text-sm font-black text-blue-600">{{ fmt(cat.budget_limit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO DESPESAS -->
      <div class="mb-5 px-4 sm:px-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-3 h-8 bg-red-500 rounded-full shadow-lg shadow-red-200"></div>
          <h2 class="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Gastos / Contas</h2>
        </div>

        <div v-else class="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div v-for="cat in expenseCategories" :key="cat.id" class="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[28px] p-7 shadow-sm relative overflow-hidden transition-all hover:shadow-xl group">
            <div class="absolute top-0 left-0 right-0 h-2" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-lg" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-[17px] text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <p v-if="cat.budget_limit > 0" class="text-[11px] font-black text-gray-400 uppercase tracking-tighter">Limite: {{ fmt(cat.budget_limit) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="p-2.5 rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-colors" @click="quickAdd(cat)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-2.5 rounded-xl text-gray-400 hover:bg-blue-600 hover:text-white transition-colors" @click="openModal(cat)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[38px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(spent[cat.name] || 0) }}</p>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gasto em {{ MONTHS[viewMonth] }}</p>
            </div>
            
            <div v-if="cat.budget_limit > 0" class="mt-6">
              <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                <div class="h-full transition-all duration-700 rounded-full shadow-inner" :style="{ width: getPct(cat) + '%', backgroundColor: (spent[cat.name] || 0) > cat.budget_limit ? '#ef4444' : cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIGURAÇÃO (TOTALMENTE REESCRITO) -->
    <AppModal :visible="showModal" title="DETALHES DA CATEGORIA" @close="closeModal">
      <div class="space-y-8 py-4">
        
        <!-- 1. CHAVE RECORRENTE (SUPER DESTAQUE) -->
        <div class="p-6 rounded-[32px] border-4 border-blue-600 bg-blue-600/5 shadow-2xl flex items-center justify-between">
          <div class="flex-1 pr-6 text-left">
            <p class="text-[16px] font-black text-blue-900 uppercase tracking-tight">FIXAR VALOR TODOS OS MESES?</p>
            <p class="text-[11px] text-blue-700 font-black mt-1 leading-tight uppercase opacity-70">ATIVAR PARA PROJEÇÕES AUTOMÁTICAS</p>
          </div>
          <div 
            @click="form.is_recurring = !form.is_recurring"
            class="w-16 h-8 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner flex items-center px-1"
            :class="form.is_recurring ? 'bg-blue-600' : 'bg-gray-300'"
          >
            <div 
              class="w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md"
              :style="{ transform: form.is_recurring ? 'translateX(32px)' : 'translateX(0px)' }"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- TIPO -->
          <div>
            <label class="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest">Essa categoria é:</label>
            <div class="flex gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
              <button @click="form.type = 'income'" class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-none cursor-pointer" :class="form.type === 'income' ? 'bg-green-600 text-white shadow-lg' : 'bg-transparent text-gray-400'">GANHO (+)</button>
              <button @click="form.type = 'expense'" class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-none cursor-pointer" :class="form.type === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent text-gray-400'">GASTO (-)</button>
            </div>
          </div>
          <!-- COR -->
          <div>
            <label class="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest">Cor Visual:</label>
            <div class="flex items-center gap-3">
              <input type="color" v-model="form.color" class="w-full h-[52px] rounded-2xl cursor-pointer border-4 border-white shadow-md p-1" />
            </div>
          </div>
        </div>

        <!-- NOME -->
        <div>
          <label class="block text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">Nome Personalizado:</label>
          <input class="form-input !py-5 !px-6 !rounded-[24px] !text-xl font-black uppercase tracking-tight border-2 focus:border-blue-600" v-model="form.name" placeholder="SALÁRIO, ALUGUEL, EXTRA..." />
        </div>

        <!-- VALOR -->
        <div>
          <label class="block text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">Valor do Planejamento (R$):</label>
          <div class="relative">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-600 text-xl">R$</span>
            <input class="form-input !py-6 !pl-16 !rounded-[24px] !text-3xl font-black text-blue-700 bg-blue-50/30 border-2 border-blue-100 focus:border-blue-600" type="number" step="0.01" v-model.number="form.budget_limit" placeholder="0,00" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full pt-4">
          <button class="flex-1 px-6 py-5 rounded-[24px] border-2 border-gray-100 text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-50 transition-colors" @click="closeModal">Voltar</button>
          <button class="flex-[2] px-6 py-5 rounded-[24px] bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-400 border-none cursor-pointer hover:bg-blue-700 transition-all active:scale-95" @click="save">Confirmar Ajustes</button>
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

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const today = new Date()

const viewMonth = ref(today.getMonth())
const viewYear = ref(today.getFullYear())

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
    return d.getMonth() === viewMonth.value && d.getFullYear() === viewYear.value
  })
)

const spent = computed(() => {
  const map = {}
  monthTxns.value.forEach(t => { 
    map[t.category] = (map[t.category] || 0) + t.amount 
  })
  return map
})

const totalMonthIncome = computed(() => {
  return monthTxns.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
})

function getPct(cat) {
  if (!cat.budget_limit || cat.budget_limit <= 0) return 0
  const val = spent.value[cat.name] || 0
  return Math.min(100, (val / cat.budget_limit) * 100)
}

function isOver(cat) {
  if (cat.type === 'income') return false
  return cat.budget_limit > 0 && (spent.value[cat.name] || 0) > cat.budget_limit
}

function isWarn(cat) {
  if (cat.type === 'income') return false
  const pct = getPct(cat)
  return cat.budget_limit > 0 && pct >= 80 && pct <= 100
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
  
  let res;
  if (editing.value) {
    res = await api.updateCategory(editing.value, data)
  } else {
    res = await api.createCategory(data)
  }

  // Sincroniza Salário
  if (res.name.toLowerCase().includes('salário') || res.name.toLowerCase().includes('salario')) {
    if (res.type === 'income') {
      await store.updateSettings({ ...store.settings, monthly_salary: res.budget_limit })
    }
  }

  await fetchData()
  closeModal()
}

async function remove(id) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
  await api.deleteCategory(id)
  await fetchData()
}

function quickAdd(cat) {
  router.push({ 
    name: 'transactions', 
    query: { 
      quickAdd: 'true', 
      catName: cat.name, 
      catType: cat.type 
    } 
  })
}
</script>
