<template>
  <div class="public-registry">
    <div class="public-registry__grid" aria-hidden="true"></div>
    <div class="public-registry__container">
      <div class="public-registry__header">
        <h1 class="public-registry__title">Реестр пропусков</h1>
        <p class="public-registry__subtitle">Los Santos County Sheriff's Department</p>
        <div class="public-registry__badge">
          <span class="public-registry__badge-icon">⬢</span>
          <span>Публичный доступ · Только просмотр</span>
        </div>
      </div>

      <div class="public-registry__search-container">
        <div class="public-registry__search">
          <input type="text" v-model="searchQuery" placeholder="Поиск по имени, фамилии или ID карты..." class="public-registry__search-input" />
          <span class="public-registry__search-icon">🔍</span>
        </div>
        <div class="public-registry__stats">
          Всего пропусков: {{ filteredOfficers.length }}
        </div>
      </div>

      <div class="public-registry__table-container">
        <table class="public-registry__table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>ID карта</th>
              <th>Статус доступа</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOfficers.length === 0">
              <td colspan="4" style="text-align: center; color: var(--muted); padding: 60px;">Нет записей</td>
            </tr>
            <tr v-for="officer in filteredOfficers" :key="officer.id">
              <td>{{ officer.firstName }}</td>
              <td>{{ officer.lastName }}</td>
              <td>
                <div class="public-registry__id-card">
                  <span class="public-registry__id-prefix">LSSD-</span>
                  <span class="public-registry__id-number">{{ officer.idCard }}</span>
                </div>
              </td>
              <td>
                <span class="public-registry__status" :class="`public-registry__status--${officer.status.toLowerCase()}`">
                  {{ officer.status === 'ACTIVE' ? 'ДОСТУП РАЗРЕШЕН' : 'ДОСТУП ЗАКРЫТ' }}
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
const officers = ref([])

const loadData = async () => {
  const { data, error } = await supabase.from('officers').select('*').order('createdAt', { ascending: false })
  if (!error) officers.value = data
}

onMounted(loadData)

const filteredOfficers = computed(() => {
  if (!searchQuery.value) return officers.value
  const q = searchQuery.value.toLowerCase()
  return officers.value.filter(o => 
    o.firstName.toLowerCase().includes(q) || 
    o.lastName.toLowerCase().includes(q) || 
    o.idCard.includes(q)
  )
})
</script>

<style scoped>
/* Ваши стили остаются */
</style>
