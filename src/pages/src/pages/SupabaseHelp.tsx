import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function Page() {
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase.from('todos').select()
        if (error) throw error
        setTodos(data || [])
      } catch (error) {
        console.error('Error fetching todos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}