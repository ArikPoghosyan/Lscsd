<template>
  <div class="admin">
    <div class="admin__grid" aria-hidden="true"></div>

    <div class="admin__container">
      <!-- Header -->
      <div class="admin__header">
        <div class="admin__header-left">
          <h1 class="admin__title">Панель управления</h1>
          <p class="admin__subtitle">Los Santos County Sheriff's Department</p>
        </div>
        <div class="admin__header-right">
          <div class="admin__leader-badge" :class="{ 'admin__leader-badge--user': !isLeader }">
            <span class="admin__leader-icon">{{ isLeader ? '⬢' : '⬡' }}</span>
            <span>{{ isLeader ? 'Лидер департамента' : 'Сотрудник' }}</span>
          </div>
          <button @click="handleLogout" class="admin__logout">
            <span>Выйти</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 1L13 5M13 5L9 9M13 5H5M1 13V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="admin__stats">
        <div class="admin__stat">
          <span class="admin__stat-value">{{ stats.totalOfficers }}</span>
          <span class="admin__stat-label">Всего пропусков</span>
        </div>
        <div class="admin__stat">
          <span class="admin__stat-value">{{ stats.activeOfficers }}</span>
          <span class="admin__stat-label">Активных пропусков</span>
        </div>
        <div class="admin__stat" v-if="isLeader">
          <span class="admin__stat-value">{{ stats.activeKeys }}</span>
          <span class="admin__stat-label">Активных ключей</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin__tabs">
        <button class="admin__tab" :class="{ 'admin__tab--active': activeTab === 'registry' }" @click="activeTab = 'registry'">
          <span class="admin__tab-icon">📋</span>
          Реестр пропусков
        </button>
        <button v-if="isLeader" class="admin__tab" :class="{ 'admin__tab--active': activeTab === 'keys' }" @click="activeTab = 'keys'">
          <span class="admin__tab-icon">🔑</span>
          Ключи доступа
        </button>
      </div>

      <!-- Registry Tab -->
      <div v-if="activeTab === 'registry'" class="admin__tab-content">
        <div class="admin__toolbar">
          <button class="admin__btn admin__btn--primary" @click="showAddOfficerModal = true">
            <span>➕</span>
            Оформить новый пропуск
          </button>
          <div class="admin__search">
            <input type="text" v-model="searchQuery" placeholder="Поиск по имени, фамилии или ID карты..." class="admin__search-input" />
          </div>
        </div>

        <!-- Officers Table -->
        <div class="admin__table-container">
          <table class="admin__table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>ID карта</th>
                <th>Статус доступа</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredOfficers.length === 0">
                <td colspan="5" style="text-align: center; color: var(--muted); padding: 60px;">Нет записей в реестре</td>
              </tr>
              <tr v-for="officer in filteredOfficers" :key="officer.id">
                <td>{{ officer.firstName }}</td>
                <td>{{ officer.lastName }}</td>
                <td>
                  <div class="admin__id-card">
                    <span class="admin__id-prefix">LSSD-</span>
                    <span class="admin__id-number">{{ officer.idCard }}</span>
                  </div>
                </td>
                <td>
                  <span class="admin__status" :class="`admin__status--${officer.status.toLowerCase()}`">
                    {{ officer.status === 'ACTIVE' ? 'ДОСТУП РАЗРЕШЕН' : 'ДОСТУП ЗАКРЫТ' }}
                  </span>
                </td>
                <td>
                  <div class="admin__actions">
                    <button class="admin__action-btn" @click="editOfficer(officer)" title="Редактировать">✏️</button>
                    <button class="admin__action-btn" @click="toggleStatus(officer)" :title="officer.status === 'ACTIVE' ? 'Закрыть доступ' : 'Открыть доступ'">
                      {{ officer.status === 'ACTIVE' ? '🔒' : '🔓' }}
                    </button>
                    <button class="admin__action-btn" @click="deleteOfficer(officer.id)" title="Удалить">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Keys Tab (только для лидера) -->
      <div v-if="activeTab === 'keys' && isLeader" class="admin__tab-content">
        <div class="admin__toolbar">
          <button class="admin__btn admin__btn--primary" @click="showGenerateKeyModal = true">
            <span>🔑</span>
            Сгенерировать новый ключ
          </button>
          <div class="admin__key-stats">
            <span class="admin__key-stat">
              <span class="admin__key-stat-value">{{ stats.activeKeys }}</span>
              Активных ключей
            </span>
          </div>
        </div>

        <!-- Keys Table -->
        <div class="admin__table-container">
          <table class="admin__table">
            <thead>
              <tr>
                <th>Код доступа</th>
                <th>Создан</th>
                <th>Статус</th>
                <th>Последнее использование</th>
                <th>Всего использований</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="accessKeys.length === 0">
                <td colspan="6" style="text-align: center; color: var(--muted); padding: 60px;">Нет сгенерированных ключей</td>
              </tr>
              <tr v-for="key in accessKeys" :key="key.code">
                <td class="admin__key-code">{{ key.code }}</td>
                <td>{{ formatDate(key.createdAt) }}</td>
                <td>
                  <span class="admin__status" :class="`admin__status--${key.active ? 'active' : 'inactive'}`">
                    {{ key.active ? 'АКТИВЕН' : 'ДЕАКТИВИРОВАН' }}
                  </span>
                </td>
                <td>{{ key.lastUsed ? formatDateTime(key.lastUsed) : '—' }}</td>
                <td class="admin__key-uses">
                  <span class="admin__uses-badge">{{ key.uses || 0 }}</span>
                </td>
                <td>
                  <div class="admin__actions">
                    <button class="admin__action-btn" @click="copyKey(key.code)" title="Копировать">📋</button>
                    <button class="admin__action-btn" @click="toggleKeyStatus(key)" :title="key.active ? 'Деактивировать' : 'Активировать'">
                      {{ key.active ? '🔴' : '🟢' }}
                    </button>
                    <button class="admin__action-btn" @click="deleteKey(key)" title="Удалить навсегда">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Add/Edit Officer -->
    <Transition name="modal">
      <div v-if="showAddOfficerModal" class="admin__modal-overlay" @click.self="showAddOfficerModal = false">
        <div class="admin__modal">
          <div class="admin__modal-header">
            <h3>{{ editingOfficer ? 'Редактировать пропуск' : 'Оформить новый пропуск' }}</h3>
            <button class="admin__modal-close" @click="showAddOfficerModal = false">×</button>
          </div>
          <form @submit.prevent="saveOfficer" class="admin__modal-form">
            <div class="admin__form-grid">
              <label class="admin__form-field">
                <span>Имя</span>
                <input v-model="officerForm.firstName" required class="admin__form-input" />
              </label>
              <label class="admin__form-field">
                <span>Фамилия</span>
                <input v-model="officerForm.lastName" required class="admin__form-input" />
              </label>
              <label class="admin__form-field">
                <span>ID карта</span>
                <div class="admin__id-input-group">
                  <span class="admin__id-prefix-input">LSSD-</span>
                  <input v-model="officerForm.idCard" required class="admin__id-input" placeholder="000000" maxlength="6" />
                </div>
              </label>
              <label class="admin__form-field">
                <span>Статус доступа</span>
                <select v-model="officerForm.status" required class="admin__form-select">
                  <option value="ACTIVE">Доступ разрешен</option>
                  <option value="INACTIVE">Доступ закрыт</option>
                </select>
              </label>
            </div>
            <div class="admin__modal-actions">
              <button type="button" class="admin__btn admin__btn--secondary" @click="showAddOfficerModal = false">Отмена</button>
              <button type="submit" class="admin__btn admin__btn--primary">{{ editingOfficer ? 'Сохранить' : 'Оформить' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal: Generate Key (только для лидера) -->
    <Transition name="modal">
      <div v-if="showGenerateKeyModal && isLeader" class="admin__modal-overlay" @click.self="showGenerateKeyModal = false">
        <div class="admin__modal">
          <div class="admin__modal-header">
            <h3>Сгенерировать ключ доступа</h3>
            <button class="admin__modal-close" @click="showGenerateKeyModal = false">×</button>
          </div>
          <form @submit.prevent="generateKey" class="admin__modal-form">
            <p class="admin__modal-note">Ключ будет сгенерирован в формате XXXX-XXXX (8 символов)</p>

            <div v-if="generatedKey" class="admin__generated-key">
              <span class="admin__key-label">Сгенерированный ключ:</span>
              <div class="admin__key-display">
                <code>{{ generatedKey }}</code>
                <button type="button" class="admin__key-copy" @click="copyKey(generatedKey)">📋 Копировать</button>
              </div>
            </div>

            <div class="admin__modal-actions">
              <button type="button" class="admin__btn admin__btn--secondary" @click="showGenerateKeyModal = false">Закрыть</button>
              <button type="submit" class="admin__btn admin__btn--primary" :disabled="isGenerating">
                {{ isGenerating ? 'Генерация...' : 'Сгенерировать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer as deleteOfficerApi,
  fetchKeys,
  createKey,
  updateKey,
  deleteKey as deleteKeyApi,
  subscribeToOfficers,
  subscribeToKeys
} from '../services/supabase'

const router = useRouter()
const activeTab = ref('registry')
const searchQuery = ref('')
const showAddOfficerModal = ref(false)
const showGenerateKeyModal = ref(false)
const editingOfficer = ref(null)
const isGenerating = ref(false)
const generatedKey = ref('')
const isLeader = ref(false)

const stats = ref({ totalOfficers: 0, activeOfficers: 0, activeKeys: 0 })
const officers = ref([])
const accessKeys = ref([])

const officerForm = ref({ firstName: '', lastName: '', idCard: '', status: 'ACTIVE' })

// Загрузка данных и подписки
onMounted(async () => {
  checkAuth()

  try {
    officers.value = await fetchOfficers()
    accessKeys.value = await fetchKeys()
    updateStats()

    // Подписка на изменения
    const officersSub = subscribeToOfficers((payload) => {
      if (payload.eventType === 'INSERT') {
        officers.value.unshift(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = officers.value.findIndex(o => o.id === payload.new.id)
        if (index !== -1) officers.value[index] = payload.new
      } else if (payload.eventType === 'DELETE') {
        officers.value = officers.value.filter(o => o.id !== payload.old.id)
      }
      updateStats()
    })

    const keysSub = subscribeToKeys((payload) => {
      if (payload.eventType === 'INSERT') {
        accessKeys.value.unshift(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = accessKeys.value.findIndex(k => k.code === payload.new.code)
        if (index !== -1) accessKeys.value[index] = payload.new
      } else if (payload.eventType === 'DELETE') {
        accessKeys.value = accessKeys.value.filter(k => k.code !== payload.old.code)
      }
      updateStats()
    })

    onUnmounted(() => {
      officersSub.unsubscribe()
      keysSub.unsubscribe()
    })
  } catch (err) {
    console.error('Failed to load data:', err)
  }
})

const updateStats = () => {
  stats.value = {
    totalOfficers: officers.value.length,
    activeOfficers: officers.value.filter(o => o.status === 'ACTIVE').length,
    activeKeys: accessKeys.value.filter(k => k.active === true).length
  }
}

const filteredOfficers = computed(() => {
  if (!searchQuery.value) return officers.value
  const q = searchQuery.value.toLowerCase()
  return officers.value.filter(o =>
    o.firstName.toLowerCase().includes(q) ||
    o.lastName.toLowerCase().includes(q) ||
    (o.idCard && o.idCard.toLowerCase().includes(q))
  )
})

const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU')
const formatDateTime = (date) => new Date(date).toLocaleString('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})

const copyKey = (key) => {
  navigator.clipboard.writeText(key)
  alert('Ключ скопирован в буфер обмена')
}

// CRUD для сотрудников
const saveOfficer = async () => {
  try {
    if (!officerForm.value.idCard) {
      officerForm.value.idCard = Math.floor(100000 + Math.random() * 900000).toString()
    }

    if (editingOfficer.value) {
      await updateOfficer(editingOfficer.value.id, officerForm.value)
    } else {
      await createOfficer(officerForm.value)
    }

    showAddOfficerModal.value = false
    resetOfficerForm()
  } catch (err) {
    alert('Ошибка сохранения: ' + err.message)
  }
}

const editOfficer = (officer) => {
  editingOfficer.value = officer
  officerForm.value = { ...officer }
  showAddOfficerModal.value = true
}

const toggleStatus = async (officer) => {
  const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await updateOfficer(officer.id, { status: newStatus })
  } catch (err) {
    alert('Ошибка изменения статуса')
  }
}

const deleteOfficer = async (id) => {
  if (confirm('Удалить этот пропуск из реестра?')) {
    try {
      await deleteOfficerApi(id)
    } catch (err) {
      alert('Ошибка удаления')
    }
  }
}

const resetOfficerForm = () => {
  officerForm.value = { firstName: '', lastName: '', idCard: '', status: 'ACTIVE' }
  editingOfficer.value = null
}

// Генерация ключа (только лидер)
const generateKey = async () => {
  if (!isLeader.value) return
  isGenerating.value = true

  setTimeout(async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    for (let i = 0; i < 8; i++) {
      key += chars[Math.floor(Math.random() * chars.length)]
      if (i === 3) key += '-'
    }
    generatedKey.value = key

    const newKey = {
      code: key,
      createdAt: new Date().toISOString(),
      active: true,
      uses: 0,
      lastUsed: null
    }

    try {
      await createKey(newKey)
    } catch (err) {
      alert('Ошибка генерации ключа')
    } finally {
      isGenerating.value = false
    }
  }, 500)
}

const toggleKeyStatus = async (key) => {
  try {
    await updateKey(key.code, { active: !key.active })
  } catch (err) {
    alert('Ошибка изменения статуса ключа')
  }
}

const deleteKey = async (key) => {
  if (confirm(`Удалить ключ ${key.code} навсегда?`)) {
    try {
      await deleteKeyApi(key.code)
    } catch (err) {
      alert('Ошибка удаления ключа')
    }
  }
}

const checkAuth = () => {
  const auth = localStorage.getItem('lssd_auth')
  if (auth) {
    const user = JSON.parse(auth)
    isLeader.value = user.isLeader || false
  } else {
    router.push('/login')
  }
}

const handleLogout = () => {
  localStorage.removeItem('lssd_auth')
  router.push('/login')
}
</script>

<style scoped>
/* Стили остаются без изменений — они уже есть в вашем оригинале */
</style>