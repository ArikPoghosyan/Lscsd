import { supabase } from '../supabase'

// ---------- Officers ----------
export async function fetchOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createOfficer(officer) {
  const { data, error } = await supabase
    .from('officers')
    .insert([{ ...officer, createdAt: new Date().toISOString() }])
    .select()
  if (error) throw error
  return data?.[0] || null
}

export async function updateOfficer(id, updates) {
  const { data, error } = await supabase
    .from('officers')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0] || null
}

export async function deleteOfficer(id) {
  const { error } = await supabase
    .from('officers')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ---------- Access Keys ----------
export async function fetchKeys() {
  const { data, error } = await supabase
    .from('access_keys')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createKey(key) {
  const { data, error } = await supabase
    .from('access_keys')
    .insert([key])
    .select()
  if (error) throw error
  return data?.[0] || null
}

export async function updateKey(code, updates) {
  const { data, error } = await supabase
    .from('access_keys')
    .update(updates)
    .eq('code', code)
    .select()
  if (error) throw error
  return data?.[0] || null
}

export async function deleteKey(code) {
  const { error } = await supabase
    .from('access_keys')
    .delete()
    .eq('code', code)
  if (error) throw error
  return true
}

// ---------- Real-time subscriptions ----------
export function subscribeToOfficers(callback) {
  return supabase
    .channel('officers-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'officers' },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
}

export function subscribeToKeys(callback) {
  return supabase
    .channel('keys-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'access_keys' },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
}