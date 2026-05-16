<template>
  <div class="h-full flex flex-col bg-[var(--color-bg)] overflow-auto font-[var(--font-sans)]">
    <div class="px-6 py-6 pb-12 w-full max-w-[1200px] mx-auto">
      
      <!-- Cabeçalho Principal -->
      <div class="px-4 sm:px-8 pt-4 sm:pt-8 flex items-start justify-between gap-4 flex-wrap mb-8">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-[32px] font-black tracking-tight text-[var(--color-text-primary)] uppercase">Suas Categorias</h1>
            <button @click="forceRefresh" class="p-2 rounded-full hover:bg-gray-100 transition-all text-blue-600" title="Sincronizar Dados">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': isRefreshing }"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          </div>
          
          <div class="flex items-center gap-4 mt-3">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-1">Mês de Referência:</span>
              <div class="flex items-center bg-[var(--color-surface)] border-2 border-blue-600/30 rounded-2xl px-4 py-2 shadow-sm">
                <select v-model="viewMonth" class="bg-transparent border-none font-black text-blue-600 text-sm cursor-pointer outline-none mr-2">
                  <option v-for="(m, i) in MONTHS" :key="m" :value="i">{{ m.toUpperCase() }}</option>
                </select>
                <div class="w-px h-4 bg-gray-200 mx-2"></div>
                <select v-model="viewYear" class="bg-transparent border-none font-black text-blue-600 text-sm cursor-pointer outline-none">
                  <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <button class="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-[24px] text-xs font-black uppercase cursor-pointer transition-all duration-150 border-none bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95" @click="openModal()">+ Nova Categoria</button>
      </div>

      <!-- SEÇÃO RECEITAS (SOMA TUDO O QUE ENTRA) -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6 px-4 sm:px-8">
          <div class="flex items-center gap-3">
            <div class="w-3 h-8 bg-green-500 rounded-full shadow-lg shadow-green-200"></div>
            <h2 class="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Entradas / Ganhos</h2>
          </div>
          <div class="bg-green-600 text-white px-8 py-4 rounded-3xl shadow-2xl shadow-green-200 flex flex-col items-end">
             <span class="text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">Total Entrou ({{ MONTHS[viewMonth] }})</span>
             <span class="text-3xl font-black">{{ fmt(totalMonthIncome) }}</span>
          </div>
        </div>

        <div v-if="incomeCategories.length === 0" class="mx-4 sm:mx-8 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-[40px] p-16 text-center shadow-inner">
          <p class="text-gray-400 font-black uppercase tracking-widest">Nenhuma categoria de receita ativa.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1 px-4 sm:px-8">
          <div v-for="cat in incomeCategories" :key="cat.id" class="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[32px] p-8 shadow-sm relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl group">
            <div class="absolute top-0 left-0 right-0 h-2.5" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-8">
              <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl font-black text-xl" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-lg text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <div v-if="cat.is_recurring" class="mt-1.5 flex items-center gap-2">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span class="text-[10px] font-black uppercase text-blue-600 tracking-wider">Valor Fixo Mensal</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                <button class="p-3 rounded-2xl text-gray-400 hover:bg-green-600 hover:text-white shadow-sm hover:shadow-lg transition-all" @click="quickAdd(cat)" title="Adicionar Entrada"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-3 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-lg transition-all" @click="openModal(cat)" title="Configurar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1 mb-8">
              <p class="text-[44px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(getSpentForCat(cat.name)) }}</p>
              <p class="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Soma Real do Mês</p>
            </div>

            <div v-if="cat.budget_limit > 0" class="mt-auto pt-6 border-t-2 border-gray-50 flex items-center justify-between">
              <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Expectativa Base:</p>
              <p class="text-base font-black text-blue-600">{{ fmt(cat.budget_limit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO DESPESAS -->
      <div class="px-4 sm:px-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-3 h-8 bg-red-500 rounded-full shadow-lg shadow-red-200"></div>
          <h2 class="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Saídas / Gastos</h2>
        </div>

        <div v-if="expenseCategories.length === 0" class="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-[40px] p-16 text-center shadow-inner">
          <p class="text-gray-400 font-black uppercase tracking-widest">Nenhuma conta cadastrada ainda.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div v-for="cat in expenseCategories" :key="cat.id" class="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[32px] p-8 shadow-sm relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl group">
            <div class="absolute top-0 left-0 right-0 h-2.5" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-8">
              <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-xl" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-lg text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <p v-if="cat.budget_limit > 0" class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Limite: {{ fmt(cat.budget_limit) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="p-3 rounded-2xl text-gray-400 hover:bg-red-600 hover:text-white shadow-sm transition-all" @click="quickAdd(cat)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-3 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white shadow-sm transition-all" @click="openModal(cat)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1 mb-6">
              <p class="text-[44px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(getSpentForCat(cat.name)) }}</p>
              <p class="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Gasto Real ({{ MONTHS[viewMonth] }})</p>
            </div>
            
            <div v-if="cat.budget_limit > 0" class="mt-4">
              <div class="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 border-2 border-gray-50 shadow-inner">
                <div class="h-full transition-all duration-1000 rounded-full shadow-lg" :style="{ width: getPct(cat) + '%', backgroundColor: getSpentForCat(cat.name) > cat.budget_limit ? '#ef4444' : cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIGURAÇÃO (TEXTOS GRANDES E OBJETIVOS) -->
    <AppModal :visible="showModal" title="CONFIGURAR CATEGORIA" @close="closeModal">
      <div class="space-y-10 py-6">
        
        <!-- 1. CHAVE RECORRENTE (SUPER DESTAQUE) -->
        <div class="p-8 rounded-[40px] border-4 border-blue-600 bg-blue-50 shadow-2xl flex items-center justify-between transition-all transform hover:scale-[1.02]">
          <div class="flex-1 pr-10 text-left">
            <p class="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">VALOR FIXO?</p>
            <p class="text-[12px] text-blue-700 font-black mt-3 leading-tight uppercase opacity-80">Marque para o valor abaixo entrar SEMPRE na sua projeção futura!</p>
          </div>
          <div 
            @click="form.is_recurring = !form.is_recurring"
            class="w-20 h-10 rounded-full relative cursor-pointer transition-all duration-500 shadow-inner flex items-center px-1.5"
            :class="form.is_recurring ? 'bg-blue-600' : 'bg-gray-300'"
          >
            <div 
              class="w-7 h-7 bg-white rounded-full transition-all duration-500 shadow-2xl"
              :style="{ transform: form.is_recurring ? 'translateX(40px)' : 'translateX(0px)' }"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8">
          <div>
            <label class="block text-[12px] font-black text-gray-500 uppercase mb-4 tracking-widest text-left">Categoria de:</label>
            <div class="flex flex-col gap-3">
              <button @click="form.type = 'income'" class="w-full py-5 rounded-2xl text-[12px] font-black uppercase transition-all border-4 cursor-pointer" :class="form.type === 'income' ? 'bg-green-600 text-white border-green-200 shadow-xl' : 'bg-transparent text-gray-400 border-gray-100'">GANHO (+)</button>
              <button @click="form.type = 'expense'" class="w-full py-5 rounded-2xl text-[12px] font-black uppercase transition-all border-4 cursor-pointer" :class="form.type === 'expense' ? 'bg-red-600 text-white border-red-200 shadow-xl' : 'bg-transparent text-gray-400 border-gray-100'">GASTO (-)</button>
            </div>
          </div>
          <div>
            <label class="block text-[12px] font-black text-gray-500 uppercase mb-4 tracking-widest text-left">Identificação:</label>
            <input type="color" v-model="form.color" class="w-full h-[120px] rounded-[32px] cursor-pointer border-8 border-white shadow-2xl p-1 bg-white" />
          </div>
        </div>

        <div>
          <label class="block text-[12px] font-black text-gray-500 uppercase mb-3 tracking-widest text-left">Nome da Categoria:</label>
          <input class="form-input !py-6 !px-8 !rounded-[32px] !text-2xl font-black uppercase tracking-tighter border-4 focus:border-blue-600 shadow-sm" v-model="form.name" placeholder="SALÁRIO, ALUGUEL, IFOOD..." />
        </div>

        <div>
          <label class="block text-[12px] font-black text-gray-500 uppercase mb-3 tracking-widest text-left">Valor Previsto (R$):</label>
          <div class="relative">
            <span class="absolute left-8 top-1/2 -translate-y-1/2 font-black text-blue-600 text-2xl">R$</span>
            <input class="form-input !py-8 !pl-20 !rounded-[32px] !text-4xl font-black text-blue-700 bg-blue-50/20 border-4 border-blue-100 focus:border-blue-600 shadow-lg" type="number" step="0.01" v-model.number="form.budget_limit" placeholder="0,00" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-5 w-full pt-6">
          <button class="flex-1 px-8 py-6 rounded-[32px] border-4 border-gray-100 text-sm font-black uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-all active:scale-95" @click="closeModal">Cancelar</button>
          <button class="flex-[2] px-8 py-6 rounded-[32px] bg-blue-600 text-white text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-400 border-none cursor-pointer hover:bg-blue-700 transition-all active:scale-95" @click="save">Salvar Planejamento</button>
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

// Estado de Visualização Reativo
const viewMonth = ref(today.getMonth())
const viewYear = ref(today.getFullYear())
const isRefreshing = ref(false)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

// USAR DADOS DIRETAMENTE DO STORE PARA GARANTIR REATIVIDADE
const incomeCategories = computed(() => store.categories.filter(c => c.type === 'income'))
const expenseCategories = computed(() => store.categories.filter(c => c.type === 'expense'))

const filteredTxns = computed(() =>
  store.transactions.filter(t => {
    const d = new Date(t.date + 'T12:00:00')
    return d.getMonth() === viewMonth.value && d.getFullYear() === viewYear.value
  })
)

const spentMap = computed(() => {
  const map = {}
  filteredTxns.value.forEach(t => { 
    const catName = (t.category || 'Sem Categoria').trim().toLowerCase()
    map[catName] = (map[catName] || 0) + t.amount 
  })
  return map
})

function getSpentForCat(catName) {
  return spentMap.value[catName.trim().toLowerCase()] || 0
}

const totalMonthIncome = computed(() => {
  return filteredTxns.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
})

function getPct(cat) {
  if (!cat.budget_limit || cat.budget_limit <= 0) return 0
  return Math.min(100, (getSpentForCat(cat.name) / cat.budget_limit) * 100)
}

const forceRefresh = async () => {
  isRefreshing.value = true
  await store.fetchData()
  setTimeout(() => isRefreshing.value = false, 500)
}

onMounted(() => {
  store.fetchData()
  on('transaction-added', () => store.fetchData())
})

const showModal = ref(false)
const editing = ref(null)
const emptyForm = () => ({ name: '', type: 'expense', budget_limit: 0, color: '#0066FF', is_recurring: false })
const form = ref(emptyForm())

function openModal(cat = null) {
  if (cat) {
    editing.value = cat.id
    form.value = { ...cat, is_recurring: !!cat.is_recurring }
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

  // Sincroniza Salário com Base Global
  if (res.name.toLowerCase().includes('salário') || res.name.toLowerCase().includes('salario')) {
    if (res.type === 'income') {
      await store.updateSettings({ ...store.settings, monthly_salary: res.budget_limit })
    }
  }

  await store.fetchData()
  closeModal()
}

async function remove(id) {
  if (!confirm('Deseja realmente apagar esta categoria?')) return
  await api.deleteCategory(id)
  await store.fetchData()
}

function quickAdd(cat) {
  router.push({ name: 'transactions', query: { quickAdd: 'true', catName: cat.name, catType: cat.type } })
}
</script>
