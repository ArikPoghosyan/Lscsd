<template>
  <div class="registry">
    <div class="registry__grid" aria-hidden="true"></div>

    <div class="registry__container">

      <!-- Header -->
      <div class="registry__header">
        <div class="registry__header-left">
          <p class="registry__eyebrow">Los Santos County Sheriff's Department</p>
          <h1 class="registry__title">Реестр Пропусков</h1>
        </div>
        <div class="registry__header-right">
          <span class="registry__status-badge">
            <span class="registry__status-dot"></span>
            Режим редактирования
          </span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="registry__toolbar">
        <button class="registry__btn registry__btn--primary" @click="openAddModal">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Оформить пропуск
        </button>
        <div class="registry__search">
          <svg class="registry__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск по имени, фамилии или ID..."
            class="registry__search-input"
          />
          <button v-if="searchQuery" class="registry__search-clear" @click="searchQuery = ''">×</button>
        </div>
        <div class="registry__count">
          <span class="registry__count-num">{{ filteredOfficers.length }}</span>
          <span class="registry__count-label">записей</span>
        </div>
      </div>

      <!-- Table -->
      <div class="registry__table-wrap">
        <table class="registry__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>ID Пропуска</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOfficers.length === 0">
              <td colspan="6" class="registry__empty">
                <div class="registry__empty-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" opacity=".3"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  <p>Записей не найдено</p>
                </div>
              </td>
            </tr>
            <tr v-for="(officer, idx) in filteredOfficers" :key="officer.id" class="registry__row">
              <td class="registry__td-idx">{{ idx + 1 }}</td>
              <td class="registry__td-name">{{ officer.firstName }}</td>
              <td class="registry__td-name">{{ officer.lastName }}</td>
              <td>
                <span class="registry__id-badge">
                  <span class="registry__id-prefix">LSSD-</span>{{ officer.idCard }}
                </span>
              </td>
              <td>
                <span class="registry__status" :class="officer.status === 'ACTIVE' ? 'registry__status--active' : 'registry__status--inactive'">
                  <span class="registry__status-dot-sm"></span>
                  {{ officer.status === 'ACTIVE' ? 'ДОСТУП РАЗРЕШЁН' : 'ДОСТУП ЗАКРЫТ' }}
                </span>
              </td>
              <td>
                <div class="registry__actions">
                  <button class="registry__action-btn" @click="editOfficer(officer)" title="Редактировать">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                  <button
                    class="registry__action-btn"
                    :class="officer.status === 'ACTIVE' ? 'registry__action-btn--lock' : 'registry__action-btn--unlock'"
                    @click="toggleStatus(officer)"
                    :title="officer.status === 'ACTIVE' ? 'Закрыть доступ' : 'Открыть доступ'"
                  >
                    <svg v-if="officer.status === 'ACTIVE'" width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                  <button class="registry__action-btn registry__action-btn--delete" @click="deleteOfficer(officer.id)" title="Удалить">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.5"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="registry__overlay" @click.self="closeModal">
        <div class="registry__modal">

          <div class="registry__modal-header">
            <div>
              <p class="registry__modal-eyebrow">LSCSD · Реестр Пропусков</p>
              <h3 class="registry__modal-title">
                {{ editingOfficer ? 'Редактировать пропуск' : 'Оформить новый пропуск' }}
              </h3>
            </div>
            <button class="registry__modal-close" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>

          <form @submit.prevent="saveOfficer" class="registry__form">
            <div class="registry__form-row">
              <div class="registry__field">
                <label class="registry__label">Имя</label>
                <input v-model="officerForm.firstName" required class="registry__input" placeholder="John" />
              </div>
              <div class="registry__field">
                <label class="registry__label">Фамилия</label>
                <input v-model="officerForm.lastName" required class="registry__input" placeholder="Smith" />
              </div>
            </div>

            <div class="registry__form-row">
              <div class="registry__field">
                <label class="registry__label">ID Пропуска</label>
                <div class="registry__id-field">
                  <span class="registry__id-pre">LSSD-</span>
                  <input v-model="officerForm.idCard" required class="registry__id-inner" placeholder="000000" maxlength="6" />
                </div>
              </div>
              <div class="registry__field">
                <label class="registry__label">Статус доступа</label>
                <select v-model="officerForm.status" required class="registry__select">
                  <option value="ACTIVE">Доступ разрешён</option>
                  <option value="INACTIVE">Доступ закрыт</option>
                </select>
              </div>
            </div>

            <div class="registry__form-footer">
              <button type="button" class="registry__btn registry__btn--ghost" @click="closeModal">Отмена</button>
              <button type="submit" class="registry__btn registry__btn--primary">
                {{ editingOfficer ? 'Сохранить изменения' : 'Оформить пропуск' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

const officers      = ref([])
const searchQuery   = ref('')
const showModal     = ref(false)
const editingOfficer = ref(null)

const blankForm = () => ({ firstName: '', lastName: '', idCard: '', status: 'ACTIVE' })
const officerForm = ref(blankForm())

const loadData = async () => {
  const { data } = await supabase
    .from('officers')
    .select('*')
    .order('createdAt', { ascending: false })
  officers.value = data || []
}

const openAddModal = () => {
  editingOfficer.value = null
  officerForm.value = blankForm()
  showModal.value = true
}

const editOfficer = (officer) => {
  editingOfficer.value = officer
  officerForm.value = { ...officer }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingOfficer.value = null
  officerForm.value = blankForm()
}

const saveOfficer = async () => {
  if (editingOfficer.value) {
    await supabase.from('officers').update(officerForm.value).eq('id', editingOfficer.value.id)
  } else {
    await supabase.from('officers').insert([officerForm.value])
  }
  closeModal()
  loadData()
}

const deleteOfficer = async (id) => {
  if (confirm('Удалить запись из реестра?')) {
    await supabase.from('officers').delete().eq('id', id)
    loadData()
  }
}

const toggleStatus = async (officer) => {
  const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  await supabase.from('officers').update({ status: newStatus }).eq('id', officer.id)
  loadData()
}

const filteredOfficers = computed(() => {
  if (!searchQuery.value) return officers.value
  const q = searchQuery.value.toLowerCase()
  return officers.value.filter(o =>
    o.firstName?.toLowerCase().includes(q) ||
    o.lastName?.toLowerCase().includes(q) ||
    o.idCard?.toLowerCase().includes(q)
  )
})

onMounted(loadData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');

/* ─── Self-contained variables ───────────────────── */
.registry {
  --gold:        #c6a756;
  --gold-light:  #f0cc7a;
  --gold-dim:    #6b5828;
  --navy:        #080f16;
  --navy-mid:    #0e1a24;
  --navy-light:  #152130;
  --navy-card:   #111d28;
  --white:       #f0ede8;
  --muted:       rgba(240,237,232,0.5);
  --border:      rgba(198,167,86,0.15);
  --green:       #6ee89a;
  --red:         #e04f4f;

  font-family: 'Rajdhani', sans-serif;
  min-height: calc(100vh - 120px);
  background: var(--navy);
  color: var(--white);
  position: relative;
  padding: 60px 40px 100px;
}

/* ─── Background grid ────────────────────────────── */
.registry__grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(198,167,86,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(198,167,86,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: gridShift 25s linear infinite;
  z-index: 0;
}

@keyframes gridShift {
  from { background-position: 0 0; }
  to   { background-position: 48px 48px; }
}

/* ─── Container ──────────────────────────────────── */
.registry__container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ─── Header ─────────────────────────────────────── */
.registry__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.registry__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 2.5px;
  color: var(--gold);
  text-transform: uppercase;
  margin: 0 0 6px;
}

.registry__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8rem;
  letter-spacing: 4px;
  color: var(--white);
  margin: 0;
  line-height: 1;
}

.registry__status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(110,232,154,0.07);
  border: 1px solid rgba(110,232,154,0.25);
  border-radius: 2px;
  color: var(--green);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.registry__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: blink 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ─── Toolbar ────────────────────────────────────── */
.registry__toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.registry__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: none;
  border-radius: 2px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.registry__btn--primary {
  background: linear-gradient(135deg, var(--gold), #a8883e);
  color: var(--navy);
  box-shadow: 0 4px 16px rgba(198,167,86,0.2);
}

.registry__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(198,167,86,0.35);
}

.registry__btn--ghost {
  background: transparent;
  color: var(--white);
  border: 1px solid var(--border);
}

.registry__btn--ghost:hover {
  border-color: var(--gold-dim);
  color: var(--gold);
  background: rgba(198,167,86,0.05);
}

.registry__search {
  flex: 1;
  max-width: 420px;
  position: relative;
  display: flex;
  align-items: center;
}

.registry__search-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
  flex-shrink: 0;
}

.registry__search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--white);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  transition: border-color 0.2s;
}

.registry__search-input::placeholder { color: var(--muted); }
.registry__search-input:focus { outline: none; border-color: var(--gold); }

.registry__search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}
.registry__search-clear:hover { color: var(--gold); }

.registry__count {
  margin-left: auto;
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.registry__count-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  color: var(--gold);
  letter-spacing: 1px;
}

.registry__count-label {
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: var(--muted);
  text-transform: uppercase;
}

/* ─── Table ──────────────────────────────────────── */
.registry__table-wrap {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow-x: auto;
}

.registry__table {
  width: 100%;
  border-collapse: collapse;
}

.registry__table thead tr {
  background: rgba(0,0,0,0.25);
  border-bottom: 1px solid var(--border);
}

.registry__table th {
  padding: 14px 18px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  text-transform: uppercase;
  white-space: nowrap;
}

.registry__table th:first-child { width: 48px; text-align: center; }

.registry__row {
  border-bottom: 1px solid rgba(198,167,86,0.07);
  transition: background 0.15s;
}

.registry__row:last-child { border-bottom: none; }
.registry__row:hover { background: rgba(198,167,86,0.04); }

.registry__table td {
  padding: 14px 18px;
  font-size: 0.92rem;
  color: var(--white);
  vertical-align: middle;
}

.registry__td-idx {
  text-align: center;
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.registry__td-name {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ID badge */
.registry__id-badge {
  display: inline-flex;
  align-items: center;
  gap: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(198,167,86,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.registry__id-prefix {
  padding: 4px 8px;
  background: rgba(198,167,86,0.1);
  color: var(--gold);
  font-weight: 700;
  border-right: 1px solid rgba(198,167,86,0.2);
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.registry__id-badge > *:last-child {
  padding: 4px 10px;
  letter-spacing: 2px;
}

/* Status pill */
.registry__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 2px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.registry__status--active {
  background: rgba(110,232,154,0.1);
  border: 1px solid rgba(110,232,154,0.25);
  color: var(--green);
}

.registry__status--inactive {
  background: rgba(224,79,79,0.1);
  border: 1px solid rgba(224,79,79,0.25);
  color: var(--red);
}

.registry__status-dot-sm {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.registry__status--active   .registry__status-dot-sm { background: var(--green); box-shadow: 0 0 5px var(--green); animation: blink 2.4s ease-in-out infinite; }
.registry__status--inactive .registry__status-dot-sm { background: var(--red); }

/* Action buttons */
.registry__actions {
  display: flex;
  gap: 6px;
}

.registry__action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(198,167,86,0.15);
  border-radius: 2px;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.registry__action-btn:hover {
  background: rgba(198,167,86,0.1);
  border-color: var(--gold-dim);
  color: var(--gold);
}

.registry__action-btn--lock:hover {
  background: rgba(224,79,79,0.1);
  border-color: rgba(224,79,79,0.4);
  color: var(--red);
}

.registry__action-btn--unlock:hover {
  background: rgba(110,232,154,0.1);
  border-color: rgba(110,232,154,0.4);
  color: var(--green);
}

.registry__action-btn--delete:hover {
  background: rgba(224,79,79,0.1);
  border-color: rgba(224,79,79,0.4);
  color: var(--red);
}

/* Empty state */
.registry__empty {
  text-align: center !important;
  padding: 70px 20px !important;
}

.registry__empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.registry__empty-inner p { margin: 0; }

/* ─── Modal ──────────────────────────────────────── */
.registry__overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,9,15,0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.registry__modal {
  width: 520px;
  max-width: 100%;
  background: var(--navy-mid);
  border: 1px solid var(--gold);
  border-radius: 3px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(198,167,86,0.05);
  overflow: hidden;
}

.registry__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.2);
}

.registry__modal-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 2.5px;
  color: var(--gold);
  text-transform: uppercase;
  margin: 0 0 5px;
}

.registry__modal-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 2px;
  color: var(--white);
  margin: 0;
}

.registry__modal-close {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  transition: color 0.2s, background 0.2s;
}

.registry__modal-close:hover { color: var(--gold); background: rgba(198,167,86,0.08); }

/* Form */
.registry__form { padding: 24px 28px; }

.registry__form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.registry__field { display: flex; flex-direction: column; gap: 7px; }

.registry__label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.8px;
  color: var(--muted);
  text-transform: uppercase;
}

.registry__input,
.registry__select {
  padding: 10px 14px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(198,167,86,0.18);
  border-radius: 2px;
  color: var(--white);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.registry__input::placeholder { color: rgba(240,237,232,0.25); }
.registry__input:focus,
.registry__select:focus { outline: none; border-color: var(--gold); }

.registry__select { cursor: pointer; }
.registry__select option { background: var(--navy-mid); }

.registry__id-field {
  display: flex;
  overflow: hidden;
  border: 1px solid rgba(198,167,86,0.18);
  border-radius: 2px;
  background: rgba(0,0,0,0.35);
  transition: border-color 0.2s;
}

.registry__id-field:focus-within { border-color: var(--gold); }

.registry__id-pre {
  padding: 10px 12px;
  background: rgba(198,167,86,0.08);
  color: var(--gold);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
  border-right: 1px solid rgba(198,167,86,0.18);
  flex-shrink: 0;
}

.registry__id-inner {
  flex: 1;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--white);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  letter-spacing: 3px;
}

.registry__id-inner:focus { outline: none; }
.registry__id-inner::placeholder { letter-spacing: 1px; color: rgba(240,237,232,0.2); font-family: 'Rajdhani', sans-serif; }

.registry__form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* ─── Modal transition ───────────────────────────── */
.modal-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease,  transform 0.2s ease; }
.modal-enter-from   { opacity: 0; transform: scale(0.97) translateY(8px); }
.modal-leave-to     { opacity: 0; transform: scale(0.97) translateY(8px); }

/* ─── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .registry { padding: 40px 20px 80px; }
  .registry__header { flex-direction: column; align-items: flex-start; }
  .registry__toolbar { flex-direction: column; align-items: stretch; }
  .registry__search { max-width: 100%; }
  .registry__count { margin-left: 0; }
  .registry__form-row { grid-template-columns: 1fr; }
  .registry__table th:nth-child(1),
  .registry__table td:nth-child(1) { display: none; }
}
</style>
