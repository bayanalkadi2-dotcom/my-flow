import { supabase } from '../lib/supabase'

export const challengeTemplates = [
  { id: 'water', title: 'Wasser trinken', days: 7, goal: 8, unit: 'Gläser' },
  { id: 'social_media', title: 'Weniger Social Media', days: 5, goal: 1, unit: 'Tag' },
  { id: 'movement', title: 'Bewegung', days: 7, goal: 30, unit: 'Minuten' },
  { id: 'sleep', title: 'Schlafroutine', days: 7, goal: 1, unit: 'Tag' },
  { id: 'learning', title: 'Lernen', days: 7, goal: 30, unit: 'Minuten' },
  { id: 'medication', title: 'Medikamente eingenommen', days: 7, goal: 1, unit: 'Einnahme' },
  { id: 'journal', title: 'Tagebuch schreiben', days: 7, goal: 1, unit: 'Eintrag' },
]

function throwIfError(error) {
  if (!error) return
  if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code)) {
    throw new Error('Das Freunde-System ist in Supabase noch nicht eingerichtet. Bitte zuerst die Social-Datenbankmigration ausführen.')
  }
  throw error
}

export async function loadSocialDashboard(userId) {
  if (!userId) {
    return { friends: [], friendRequests: [], challengeRequests: [], challenges: [] }
  }

  const [
    { data: friendshipRows, error: friendshipError },
    { data: friendRequestRows, error: requestError },
    { data: challengeRequestRows, error: challengeRequestError },
    { data: challengeRows, error: challengeError },
  ] = await Promise.all([
    supabase.from('friendships').select('*').or(`user_a.eq.${userId},user_b.eq.${userId}`),
    supabase.from('friend_requests').select('*').eq('addressee_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('challenge_requests').select('*').eq('invitee_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('challenges').select('*, challenge_progress(*)').or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`).eq('status', 'active').order('created_at', { ascending: false }),
  ])

  throwIfError(friendshipError)
  throwIfError(requestError)
  throwIfError(challengeRequestError)
  throwIfError(challengeError)

  const profileIds = new Set()
  friendshipRows?.forEach((row) => profileIds.add(row.user_a === userId ? row.user_b : row.user_a))
  friendRequestRows?.forEach((row) => profileIds.add(row.requester_id))
  challengeRequestRows?.forEach((row) => profileIds.add(row.challenger_id))
  challengeRows?.forEach((row) => profileIds.add(row.challenger_id === userId ? row.opponent_id : row.challenger_id))

  let profiles = []
  if (profileIds.size) {
    const { data, error } = await supabase.from('profiles').select('id, display_name').in('id', [...profileIds])
    throwIfError(error)
    profiles = data ?? []
  }
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))
  const friendName = (id) => profileMap.get(id)?.display_name || 'MyFlow-Freund'

  return {
    friends: (friendshipRows ?? []).map((row) => {
      const id = row.user_a === userId ? row.user_b : row.user_a
      return { id, name: friendName(id), since: row.created_at }
    }),
    friendRequests: (friendRequestRows ?? []).map((row) => ({
      ...row,
      name: friendName(row.requester_id),
    })),
    challengeRequests: (challengeRequestRows ?? []).map((row) => ({
      ...row,
      friendName: friendName(row.challenger_id),
    })),
    challenges: (challengeRows ?? []).map((row) => ({
      ...row,
      friendId: row.challenger_id === userId ? row.opponent_id : row.challenger_id,
      friendName: friendName(row.challenger_id === userId ? row.opponent_id : row.challenger_id),
    })),
  }
}

export async function sendFriendRequest(email) {
  const { data, error } = await supabase.rpc('send_friend_request', {
    target_email: email.trim().toLowerCase(),
  })
  throwIfError(error)
  return data
}

export async function respondToFriendRequest(requestId, accept) {
  const { data, error } = await supabase.rpc('respond_to_friend_request', {
    request_id: requestId,
    accept_request: accept,
  })
  throwIfError(error)
  return data
}

export async function sendChallengeRequest(payload) {
  const { data, error } = await supabase.from('challenge_requests').insert({
    challenger_id: payload.userId,
    invitee_id: payload.friendId,
    template_key: payload.templateKey,
    title: payload.title,
    duration_days: payload.days,
    daily_goal: payload.goal,
    goal_unit: payload.unit,
  }).select().single()
  throwIfError(error)
  return data
}

export async function respondToChallengeRequest(requestId, accept) {
  const { data, error } = await supabase.rpc('respond_to_challenge_request', {
    request_id: requestId,
    accept_request: accept,
  })
  throwIfError(error)
  return data
}

export async function toggleTodayProgress(challengeId, userId, completed) {
  if (completed) {
    const { error } = await supabase.from('challenge_progress').upsert({
      challenge_id: challengeId,
      user_id: userId,
      progress_date: new Date().toISOString().slice(0, 10),
      completed: true,
    }, { onConflict: 'challenge_id,user_id,progress_date' })
    throwIfError(error)
    return
  }

  const { error } = await supabase
    .from('challenge_progress')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .eq('progress_date', new Date().toISOString().slice(0, 10))
  throwIfError(error)
}

export function subscribeToSocialChanges(userId, onChange) {
  if (!userId) return () => {}
  const channel = supabase
    .channel(`social-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_requests' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_progress' }, onChange)
    .subscribe()

  return () => supabase.removeChannel(channel)
}
