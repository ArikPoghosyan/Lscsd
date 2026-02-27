<template>
  <div class="registry">
    <div class="registry__grid" aria-hidden="true"></div>

    <div class="registry__container">
      <!-- Header -->
      <div class="registry__header">
        <h1 class="registry__title">Управление пропусками</h1>
        <p class="registry__subtitle">Los Santos County Sheriff's Department</p>
        <div class="registry__badge">
          <span class="registry__badge-icon">⬢</span>
          <span>Режим редактирования (только для лидера)</span>
        </div>
      </div>

      <!-- Toolbar (только для лидера) -->
      <div v-if="isLeader" class="registry__toolbar">
        <button class="registry__btn registry__btn--primary" @click="showAddOfficerModal = true">
          <span>➕</span>
          Оформить новый пропуск
        </button>
        <div class="registry__search">
          <input type="text" v-model="searchQuery" placeholder="Поиск по имени, фамилии или ID карты..." class="registry__search-input" />
        </div>
      </div>

      <!-- Officers Table -->
      <div class="registry__table-container">
        <table class="registry__table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>ID карта</th>
              <th>Статус доступа</th>
              <th v-if="isLeader">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOfficers.length === 0">
              <td :colspan="isLeader ? 5 : 4" style="text-align: center; color: var(--muted); padding: 60px;">
                Нет записей в реестре
              </td>
            </tr>
            <tr v-for="officer in filteredOfficers" :key="officer.id">
              <td>{{ officer.firstName }}</td>
              <td>{{ officer.lastName }}</td>
              <td>
                <div class="registry__id-card">
                  <span class="registry__id-prefix">LSSD-</span>
                  <span class="registry__id-number">{{ officer.idCard }}</span>
                </div>
              </td>
              <td>
                <span class="registry__status" :class="`registry__status--${officer.status.toLowerCase()}`">
                  {{ officer.status === 'ACTIVE' ? 'ДОСТУП РАЗРЕШЕН' : 'ДОСТУП ЗАКРЫТ' }}
                </span>
              </td>
              <td v-if="isLeader">
                <div class="registry__actions">
                  <button class="registry__action-btn" @click="editOfficer(officer)" title="Редактировать">✏️</button>
                  <button class="registry__action-btn" @click="toggleStatus(officer)" :title="officer.status === 'ACTIVE' ? 'Закрыть доступ' : 'Открыть доступ'">
                    {{ officer.status === 'ACTIVE' ? '🔒' : '🔓' }}
                  </button>
                  <button class="registry__action-btn" @click="deleteOfficer(officer.id)" title="Удалить">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Add/Edit Officer (только для лидера) -->
    <Transition name="modal">
      <div v-if="showAddOfficerModal && isLeader" class="registry__modal-overlay" @click.self="showAddOfficerModal = false">
        <div class="registry__modal">
          <div class="registry__modal-header">
            <h3>{{ editingOfficer ? 'Редактировать пропуск' : 'Оформить новый пропуск' }}</h3>
            <button class="registry__modal-close" @click="showAddOfficerModal = false">×</button>
          </div>
          <form @submit.prevent="saveOfficer" class="registry__modal-form">
            <div class="registry__form-grid">
              <label class="registry__form-field">
                <span>Имя</span>
                <input v-model="officerForm.firstName" required class="registry__form-input" />
              </label>
              <label class="registry__form-field">
                <span>Фамилия</span>
                <input v-model="officerForm.lastName" required class="registry__form-input" />
              </label>
              <label class="registry__form-field">
                <span>ID карта</span>
                <div class="registry__id-input-group">
                  <span class="registry__id-prefix-input">LSSD-</span>
                  <input v-model="officerForm.idCard" required class="registry__id-input" placeholder="000000" maxlength="6" />
                </div>
              </label>
              <label class="registry__form-field">
                <span>Статус доступа</span>
                <select v-model="officerForm.status" required class="registry__form-select">
                  <option value="ACTIVE">Доступ разрешен</option>
                  <option value="INACTIVE">Доступ закрыт</option>
                </select>
              </label>
            </div>
            <div class="registry__modal-actions">
              <button type="button" class="registry__btn registry__btn--secondary" @click="showAddOfficerModal = false">Отмена</button>
              <button type="submit" class="registry__btn registry__btn--primary">
                {{ editingOfficer ? 'Сохранить' : 'Оформить' }}
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
  subscribeToOfficers
} from '../services/supabase'

const router = useRouter()
const searchQuery = ref('')
const showAddOfficerModal = ref(false)
const editingOfficer = ref(null)
const isLeader = ref(false)

const officers = ref([])
const officerForm = ref({ firstName: '', lastName: '', idCard: '', status: 'ACTIVE' })

onMounted(async () => {
  checkAuth()
  try {
    officers.value = await fetchOfficers()
    const sub = subscribeToOfficers((payload) => {
      if (payload.eventType === 'INSERT') {
        officers.value.unshift(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = officers.value.findIndex(o => o.id === payload.new.id)
        if (index !== -1) officers.value[index] = payload.new
      } else if (payload.eventType === 'DELETE') {
        officers.value = officers.value.filter(o => o.id !== payload.old.id)
      }
    })
    onUnmounted(() => sub.unsubscribe())
  } catch (err) {
    console.error(err)
  }
})

const checkAuth = () => {
  const auth = localStorage.getItem('lssd_auth')
  if (!auth) {
    router.push('/login')
    return
  }
  const user = JSON.parse(auth)
  isLeader.value = user.isLeader || false
}

const filteredOfficers = computed(() => {
  if (!searchQuery.value) return officers.value
  const q = searchQuery.value.toLowerCase()
  return officers.value.filter(o =>
    o.firstName.toLowerCase().includes(q) ||
    o.lastName.toLowerCase().includes(q) ||
    o.idCard.includes(q)
  )
})

// CRUD (доступны только если isLeader)
const saveOfficer = async () => {
  if (!isLeader.value) return
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
    alert('Ошибка сохранения')
  }
}

const editOfficer = (officer) => {
  if (!isLeader.value) return
  editingOfficer.value = officer
  officerForm.value = { ...officer }
  showAddOfficerModal.value = true
}

const toggleStatus = async (officer) => {
  if (!isLeader.value) return
  const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await updateOfficer(officer.id, { status: newStatus })
  } catch (err) {
    alert('Ошибка изменения статуса')
  }
}

const deleteOfficer = async (id) => {
  if (!isLeader.value) return
  if (confirm('Удалить запись?')) {
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
</script>

<style scoped>
/* Ваши стили остаются без изменений */
</style>