<template>
  <div class="pub">
    <div class="pub__grid" aria-hidden="true"></div>

    <div class="pub__container">

      <!-- Header -->
      <div class="pub__header">
        <div class="pub__header-left">
          <p class="pub__eyebrow">Los Santos County Sheriff's Department</p>
          <h1 class="pub__title">Реестр Пропусков</h1>
        </div>
        <div class="pub__header-right">
          <span class="pub__ro-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Публичный доступ · Только просмотр
          </span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="pub__toolbar">
        <div class="pub__search">
          <svg class="pub__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск по имени, фамилии или ID..."
            class="pub__search-input"
          />
          <button v-if="searchQuery" class="pub__search-clear" @click="searchQuery = ''">×</button>
        </div>
        <div class="pub__count">
          <span class="pub__count-num">{{ filteredOfficers.length }}</span>
          <span class="pub__count-label">записей</span>
        </div>
      </div>

      <!-- Table -->
      <div class="pub__table-wrap">
        <table class="pub__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>ID Пропуска</th>
              <th>Статус доступа</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOfficers.length === 0">
              <td colspan="5" class="pub__empty">
                <div class="pub__empty-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" opacity=".3">
                    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <p>Записей не найдено</p>
                </div>
              </td>
            </tr>
            <tr v-for="(officer, idx) in filteredOfficers" :key="officer.id" class="pub__row">
              <td class="pub__td-idx">{{ idx + 1 }}</td>
              <td class="pub__td-name">{{ officer.firstName }}</td>
              <td class="pub__td-name">{{ officer.lastName }}</td>
              <td>
                <span class="pub__id-badge">
                  <span class="pub__id-prefix">LSSD-</span>{{ officer.idCard }}
                </span>
              </td>
              <td>
                <span class="pub__status" :class="officer.status === 'ACTIVE' ? 'pub__status--active' : 'pub__status--inactive'">
                  <span class="pub__status-dot"></span>
                  {{ officer.status === 'ACTIVE' ? 'ДОСТУП РАЗРЕШЁН' : 'ДОСТУП ЗАКРЫТ' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

const searchQuery = ref('')
const officers    = ref([])

const loadData = async () => {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('createdAt', { ascending: false })
  if (!error) officers.value = data
}

onMounted(loadData)

const filteredOfficers = computed(() => {
  if (!searchQuery.value) return officers.value
  const q = searchQuery.value.toLowerCase()
  return officers.value.filter(o =>
    o.firstName?.toLowerCase().includes(q) ||
    o.lastName?.toLowerCase().includes(q) ||
    o.idCard?.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');

/* ─── Variables ──────────────────────────────────── */
.pub {
  --gold:      #c6a756;
  --gold-dim:  #6b5828;
  --navy:      #080f16;
  --navy-mid:  #0e1a24;
  --navy-card: #111d28;
  --white:     #f0ede8;
  --muted:     rgba(240,237,232,0.5);
  --border:    rgba(198,167,86,0.15);
  --green:     #6ee89a;
  --red:       #e04f4f;

  font-family: 'Rajdhani', sans-serif;
  min-height: calc(100vh - 120px);
  background: var(--navy);
  color: var(--white);
  position: relative;
  padding: 60px 40px 100px;
}

/* ─── Background grid ────────────────────────────── */
.pub__grid {
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
.pub__container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ─── Header ─────────────────────────────────────── */
.pub__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.pub__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 2.5px;
  color: var(--gold);
  text-transform: uppercase;
  margin: 0 0 6px;
}

.pub__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8rem;
  letter-spacing: 4px;
  color: var(--white);
  margin: 0;
  line-height: 1;
}

/* Read-only badge — distinct amber/blue tint vs green edit mode */
.pub__ro-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(74,158,255,0.07);
  border: 1px solid rgba(74,158,255,0.25);
  border-radius: 2px;
  color: #7ab8ff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}

/* ─── Toolbar ────────────────────────────────────── */
.pub__toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pub__search {
  flex: 1;
  max-width: 480px;
  position: relative;
  display: flex;
  align-items: center;
}

.pub__search-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
}

.pub__search-input {
  width: 100%;
  padding: 10px 36px;
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--white);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  transition: border-color 0.2s;
}

.pub__search-input::placeholder { color: var(--muted); }
.pub__search-input:focus { outline: none; border-color: var(--gold); }

.pub__search-clear {
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
.pub__search-clear:hover { color: var(--gold); }

.pub__count {
  margin-left: auto;
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.pub__count-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  color: var(--gold);
  letter-spacing: 1px;
}

.pub__count-label {
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: var(--muted);
  text-transform: uppercase;
}

/* ─── Table ──────────────────────────────────────── */
.pub__table-wrap {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow-x: auto;
}

.pub__table {
  width: 100%;
  border-collapse: collapse;
}

.pub__table thead tr {
  background: rgba(0,0,0,0.25);
  border-bottom: 1px solid var(--border);
}

.pub__table th {
  padding: 14px 18px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  text-transform: uppercase;
  white-space: nowrap;
}

.pub__table th:first-child { width: 48px; text-align: center; }

.pub__row {
  border-bottom: 1px solid rgba(198,167,86,0.07);
  transition: background 0.15s;
}

.pub__row:last-child { border-bottom: none; }
.pub__row:hover { background: rgba(198,167,86,0.04); }

.pub__table td {
  padding: 14px 18px;
  font-size: 0.92rem;
  color: var(--white);
  vertical-align: middle;
}

.pub__td-idx {
  text-align: center;
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.pub__td-name {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ID badge */
.pub__id-badge {
  display: inline-flex;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(198,167,86,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.pub__id-prefix {
  padding: 4px 8px;
  background: rgba(198,167,86,0.1);
  color: var(--gold);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
  border-right: 1px solid rgba(198,167,86,0.2);
}

.pub__id-badge > *:last-child {
  padding: 4px 10px;
  letter-spacing: 2px;
}

/* Status pill */
.pub__status {
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

.pub__status--active {
  background: rgba(110,232,154,0.1);
  border: 1px solid rgba(110,232,154,0.25);
  color: var(--green);
}

.pub__status--inactive {
  background: rgba(224,79,79,0.1);
  border: 1px solid rgba(224,79,79,0.25);
  color: var(--red);
}

.pub__status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pub__status--active   .pub__status-dot { background: var(--green); box-shadow: 0 0 5px var(--green); animation: blink 2.4s ease-in-out infinite; }
.pub__status--inactive .pub__status-dot { background: var(--red); }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* Empty state */
.pub__empty { text-align: center !important; padding: 70px 20px !important; }

.pub__empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.pub__empty-inner p { margin: 0; }

/* ─── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .pub { padding: 40px 20px 80px; }
  .pub__header { flex-direction: column; align-items: flex-start; }
  .pub__toolbar { flex-direction: column; align-items: stretch; }
  .pub__search { max-width: 100%; }
  .pub__count { margin-left: 0; }
  .pub__table th:nth-child(1),
  .pub__table td:nth-child(1) { display: none; }
}
</style>
