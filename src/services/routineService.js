import { supabase } from '../lib/supabase'

export async function getRoutines(userId) {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, routines: data || [] }
  } catch (err) {
    console.error('Fehler beim Abrufen der Routinen:', err)
    return { success: false, error: err.message, routines: [] }
  }
}

export async function createRoutine(userId, routineData) {
  try {
    const { data, error } = await supabase
      .from('routines')
      .insert([
        {
          user_id: userId,
          ...routineData,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, routine: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Erstellen der Routine:', err)
    return { success: false, error: err.message }
  }
}

export async function updateRoutine(routineId, userId, updates) {
  try {
    // Sicherheitscheck: Benutzer darf nur seine eigenen Routinen aktualisieren
    const { data: existing, error: checkError } = await supabase
      .from('routines')
      .select('user_id')
      .eq('id', routineId)
      .single()

    if (checkError || existing.user_id !== userId) {
      throw new Error('Sie dürfen diese Routine nicht bearbeiten')
    }

    const { data, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', routineId)
      .select()

    if (error) throw error
    return { success: true, routine: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Routine:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteRoutine(routineId, userId) {
  try {
    // Sicherheitscheck: Benutzer darf nur seine eigenen Routinen löschen
    const { data: existing, error: checkError } = await supabase
      .from('routines')
      .select('user_id')
      .eq('id', routineId)
      .single()

    if (checkError || existing.user_id !== userId) {
      throw new Error('Sie dürfen diese Routine nicht löschen')
    }

    // Soft delete: deleted_at setzen
    const { error } = await supabase
      .from('routines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', routineId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('Fehler beim Löschen der Routine:', err)
    return { success: false, error: err.message }
  }
}

export async function logRoutineProgress(userId, routineId, value, isCompleted = false) {
  try {
    const { data, error } = await supabase
      .from('routine_history')
      .insert([
        {
          user_id: userId,
          routine_id: routineId,
          value,
          is_completed: isCompleted,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, history: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Speichern des Fortschritts:', err)
    return { success: false, error: err.message }
  }
}

export async function getRoutineHistory(userId, routineId, days = 30) {
  try {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const { data, error } = await supabase
      .from('routine_history')
      .select('*')
      .eq('user_id', userId)
      .eq('routine_id', routineId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return { success: true, history: data || [] }
  } catch (err) {
    console.error('Fehler beim Abrufen der Routine-Historie:', err)
    return { success: false, error: err.message, history: [] }
  }
}

export async function bulkCreateRoutines(userId, routines) {
  try {
    const data = routines.map((routine) => ({
      user_id: userId,
      ...routine,
    }))

    const { data: insertedData, error } = await supabase
      .from('routines')
      .insert(data)
      .select()

    if (error) throw error
    return { success: true, routines: insertedData || [] }
  } catch (err) {
    console.error('Fehler beim Masseneinfügen von Routinen:', err)
    return { success: false, error: err.message, routines: [] }
  }
}
