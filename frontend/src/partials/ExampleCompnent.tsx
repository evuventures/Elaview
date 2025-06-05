// frontend/src/components/ExampleComponent.tsx
import { useState } from 'react';
import { useSupabaseFetch } from '../hooks/useSupabase';

// Define the shape of your data
interface ExampleData {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function ExampleComponent() {
  const [limit, setLimit] = useState(5);
  
  // Use our custom hook to fetch data
  const { data, loading, error } = useSupabaseFetch<ExampleData>(
    'example_table', // Replace with your actual table name
    { limit }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="">
      <h2 className="text-7xl">Example Data from Supabase</h2>
      
      <div>
        <label htmlFor="limit">Number of items: </label>
        <select 
          id="limit" 
          value={limit} 
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      
      {data && data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <small>Created: {new Date(item.created_at).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found. Add some items to get started.</p>
      )}
    </div>
  );
}