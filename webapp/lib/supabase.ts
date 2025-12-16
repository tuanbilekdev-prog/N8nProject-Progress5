import { getSupabaseClient } from './supabaseClient';
import { randomUUID } from 'crypto';

// Helper function untuk query chat sessions
export async function getChatSessions(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// Helper function untuk get chat messages
export async function getChatMessages(sessionId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at, order_index')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Helper function untuk create chat session
export async function createChatSession(userId: string, title: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function untuk save chat message
export async function saveChatMessage(
  sessionId: string,
  role: "user" | "bot" | "assistant",
  content: string,
  orderIndex: number
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: role,
      content: content,
      order_index: orderIndex,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function untuk update chat session
export async function updateChatSession(sessionId: string, title: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      title: title,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw error;
}

// Helper function untuk delete chat session
export async function deleteChatSession(sessionId: string, userId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Helper untuk query user dari database (by email atau username/name)
export async function getUserByEmail(emailOrUsername: string) {
  const supabase = getSupabaseClient();
  
  // Try email first (exact match)
  let { data, error } = await supabase
    .from('users')
    .select('id, email, name, password')
    .eq('email', emailOrUsername)
    .maybeSingle();

  // If not found by email, try by name/username
  if (!data && (error?.code === 'PGRST116' || !error)) {
    const { data: data2, error: error2 } = await supabase
      .from('users')
      .select('id, email, name, password')
      .eq('name', emailOrUsername)
      .maybeSingle();
    
    if (error2 && error2.code !== 'PGRST116') throw error2;
    return data2 || null;
  }

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Helper untuk create user (password optional untuk OAuth users)
export async function createUser(name: string, email: string, hashedPassword: string = "") {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: randomUUID(),
      name: name,
      email: email,
      password: hashedPassword || null, // null for OAuth users
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id, name, email')
    .single();

  if (error) throw error;
  return data;
}
