<template>
  <div class="h-full flex flex-col bg-[var(--color-bg)] overflow-auto font-[var(--font-sans)]">
    <div class="px-6 py-6 pb-12 w-full max-w-[1200px] mx-auto">
      
      <!-- Cabeçalho -->
      <div class="px-4 sm:px-8 pt-4 sm:pt-8 flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="text-[28px] font-black tracking-tight text-[var(--color-text-primary)]">Categorias</h1>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[13px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Mês de Visualização:</span>
            <select v-model="viewMonth" class="bg-transparent border-none font-black text-blue-600 text-sm cursor-pointer outline-none">
              <option v-for="(m, i) in MONTHS" :key="m" :value="i">{{ m }}</option>
            </select>
            <select v-model="viewYear" class="bg-transparent border-none font-black text-blue-600 text-sm cursor-pointer outline-none">
              <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <button class="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl text-sm font-black uppercase cursor-pointer transition-all duration-150 border-none bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" @click="openModal()">+ Nova Categoria</button>
      </div>

      <!-- SEÇÃO RECEITAS (SUPER SIMPLIFICADA) -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4 px-4 sm:px-8">
          <div class="flex items-center gap-2">
            <div class="w-2 h-6 bg-[var(--color-income)] rounded-full"></div>
            <h2 class="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight">Receitas</h2>
          </div>
          <div class="bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
             <span class="text-[10px] font-black uppercase tracking-widest text-green-600 mr-2">Total Recebido ({{ MONTHS[viewMonth] }})</span>
             <span class="text-lg font-black text-green-600">{{ fmt(totalMonthIncome) }}</span>
          </div>
        </div>

        <div v-if="incomeCategories.length === 0" class="mx-4 sm:mx-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
          <p class="text-base font-bold text-[var(--color-text-primary)]">Nenhuma categoria de receita criada.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 px-4 sm:px-8">
          <div v-for="cat in incomeCategories" :key="cat.id" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-black uppercase" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2) }}
                </div>
                <div>
                  <h3 class="font-black text-[15px] text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <span v-if="cat.is_recurring" class="inline-block text-[9px] font-black uppercase bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">Receita Fixa</span>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100">
                <button class="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-100" @click="quickAdd(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-100" @click="openModal(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[32px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(spent[cat.name] || 0) }}</p>
              <p class="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Soma de entradas ({{ MONTHS[viewMonth] }})</p>
            </div>

            <div v-if="cat.is_recurring && cat.budget_limit > 0" class="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <p class="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">Valor Esperado:</p>
              <p class="text-[12px] font-black text-blue-600">{{ fmt(cat.budget_limit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO DESPESAS -->
      <div class="mb-5">
        <div class="flex items-center gap-2 mb-4 px-4 sm:px-8">
          <div class="w-2 h-6 bg-[var(--color-expense)] rounded-full"></div>
          <h2 class="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight">Despesas</h2>
        </div>

        <div v-if="expenseCategories.length === 0" class="mx-4 sm:mx-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
          <p class="text-base font-bold text-[var(--color-text-primary)]">Nenhuma categoria de despesa criada.</p>
        </div>

        <div v-else class="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 px-4 sm:px-8">
          <div v-for="cat in expenseCategories" :key="cat.id" class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
            <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: cat.color }"></div>
            
            <div class="flex justify-between items-start mb-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-black uppercase" :style="{ backgroundColor: cat.color }">
                  {{ cat.name.substring(0, 2) }}
                </div>
                <div>
                  <h3 class="font-black text-[15px] text-[var(--color-text-primary)] uppercase tracking-tight">{{ cat.name }}</h3>
                  <p v-if="cat.budget_limit > 0" class="text-[12px] font-bold text-[var(--color-text-secondary)]">Limite: {{ fmt(cat.budget_limit) }}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <button class="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-100" @click="quickAdd(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                <button class="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-100" @click="openModal(cat)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[28px] font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{{ fmt(spent[cat.name] || 0) }}</p>
              <p class="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Gasto no mês</p>
            </div>
            
            <div v-if="cat.budget_limit > 0" class="mt-4">
              <div class="h-2 w-full bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
                <div class="h-full transition-all duration-500" :style="{ width: getPct(cat) + '%', backgroundColor: (spent[cat.name] || 0) > cat.budget_limit ? 'var(--color-expense)' : cat.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIGURAÇÃO DE CATEGORIA -->
    <AppModal :visible="showModal" title="CONFIGURAR CATEGORIA" @close="closeModal">
      <div class="space-y-6 py-4">
        
        <!-- 1. TIPO DE CATEGORIA -->
        <div>
          <label class="block text-[11px] font-black text-[var(--color-text-secondary)] uppercase mb-3 tracking-widest">Essa categoria é de:</label>
          <div class="flex gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
            <button 
              @click="form.type = 'income'" 
              class="flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all border-none cursor-pointer"
              :class="form.type === 'income' ? 'bg-green-600 text-white shadow-lg' : 'bg-transparent text-gray-500'"
            >GANHO (+)</button>
            <button 
              @click="form.type = 'expense'" 
              class="flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all border-none cursor-pointer"
              :class="form.type === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent text-gray-500'"
            >GASTO (-)</button>
          </div>
        </div>

        <!-- 2. OPÇÃO FIXA (MUITO VISÍVEL) -->
        <div class="p-5 rounded-3xl border-4 border-blue-600/20 bg-blue-50 flex items-center justify-between shadow-md">
          <div class="flex-1 pr-6">
            <p class="text-base font-black text-blue-900 uppercase leading-none">VALOR FIXO?</p>
            <p class="text-[11px] text-blue-700 font-bold mt-2 leading-tight">Marque se você quer que este valor apareça sempre no seu saldo futuro automaticamente.</p>
          </div>
          <div 
            @click="form.is_recurring = !form.is_recurring"
            class="w-16 h-8 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner"
            :class="form.is_recurring ? 'bg-blue-600' : 'bg-gray-300'"
          >
            <div 
              class="w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md"
              :style="{ left: form.is_recurring ? '34px' : '4px' }"
            ></div>
          </div>
        </div>

        <!-- 3. NOME E COR -->
        <div class="grid grid-cols-4 gap-4">
          <div class="col-span-3">
            <label class="block text-[11px] font-black text-[var(--color-text-secondary)] uppercase mb-2 tracking-widest">Nome da Categoria</label>
            <input class="form-input !py-4 !rounded-2xl !text-base font-black shadow-sm" v-model="form.name" placeholder="Ex: Salário, Aluguel, Extra..." />
          </div>
          <div>
            <label class="block text-[11px] font-black text-[var(--color-text-secondary)] uppercase mb-2 tracking-widest">Cor</label>
            <input type="color" v-model="form.color" class="w-full h-[54px] rounded-2xl cursor-pointer border border-gray-200 p-1 bg-white shadow-sm" />
          </div>
        </div>

        <!-- 4. VALOR -->
        <div>
          <label class="block text-[11px] font-black text-[var(--color-text-secondary)] uppercase mb-2 tracking-widest">Valor Planejado (R$)</label>
          <input class="form-input !py-4 !rounded-2xl !text-2xl font-black text-blue-600 bg-white" type="number" step="0.01" v-model.number="form.budget_limit" placeholder="0,00" />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-4 w-full">
          <button class="flex-1 px-6 py-4 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-gray-50" @click="closeModal">Cancelar</button>
          <button class="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-300 border-none cursor-pointer hover:bg-blue-700" @click="save">Salvar Alterações</button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

// Estado de Visualização
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

// Filtra transações pelo mês e ano selecionados na tela
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
  return Math.min(100, ((spent.value[cat.name] || 0) / cat.budget_limit) * 100)
}

function isOver(cat) {
  return cat.type === 'expense' && cat.budget_limit > 0 && (spent.value[cat.name] || 0) > cat.budget_limit
}

function isWarn(cat) {
  const pct = getPct(cat)
  return cat.type === 'expense' && cat.budget_limit > 0 && pct >= 80 && pct <= 100
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

  // Sincroniza Salário com Configurações Base do sistema
  if (res.name === 'Salário' && res.type === 'income') {
    await store.updateSettings({ ...store.settings, monthly_salary: res.budget_limit })
  }

  await store.fetchData()
  categories.value = store.categories
  closeModal()
}

async function remove(id) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
  await api.deleteCategory(id)
  await store.fetchData()
  categories.value = store.categories
}

function quickAdd(cat) {
  router.push({ name: 'transactions', query: { quickAdd: 'true', catName: cat.name, catType: cat.type } })
}
</script>
